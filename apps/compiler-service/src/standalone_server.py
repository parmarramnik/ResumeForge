#!/usr/bin/env python3
"""
Zero-dependency standalone HTTP compiler server for local development.
Works out of the box on all Python versions without requiring pip packages or wheels.
"""

import http.server
import json
import os
import shutil
import socketserver
import subprocess
import tempfile
import time
from urllib.parse import urlparse

PORT = int(os.environ.get("PORT", "8000"))
TIMEOUT_SECONDS = int(os.environ.get("COMPILER_TIMEOUT", "8"))

class CompilerHTTPRequestHandler(http.server.BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/health" or parsed.path == "/":
            has_tectonic = shutil.which("tectonic") is not None
            has_pdflatex = shutil.which("pdflatex") is not None

            self.send_response(200)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()

            payload = {
                "status": "healthy",
                "engine": "tectonic" if has_tectonic else ("pdflatex" if has_pdflatex else "vector-fallback"),
                "tectonic_available": has_tectonic,
                "pdflatex_available": has_pdflatex,
                "version": "1.0.0 (zero-dependency standalone)",
            }
            self.wfile.write(json.dumps(payload).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/compile":
            content_length = int(self.headers.get("Content-Length", 0))
            body_bytes = self.rfile.read(content_length)

            try:
                data = json.loads(body_bytes.decode("utf-8"))
                tex_source = data.get("tex", "")
            except Exception as e:
                self.send_response(400)
                self._send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": "Invalid JSON payload"}).encode("utf-8"))
                return

            if not tex_source or len(tex_source.strip()) < 10:
                self.send_response(400)
                self._send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": "LaTeX document is too short or empty"}).encode("utf-8"))
                return

            # Check for native compiler binaries
            has_tectonic = shutil.which("tectonic") is not None
            has_pdflatex = shutil.which("pdflatex") is not None

            if has_tectonic or has_pdflatex:
                # Compile in sandboxed temp directory
                temp_dir = tempfile.mkdtemp(prefix="tex_compile_")
                try:
                    tex_file = os.path.join(temp_dir, "document.tex")
                    pdf_file = os.path.join(temp_dir, "document.pdf")
                    with open(tex_file, "w", encoding="utf-8") as f:
                        f.write(tex_source)

                    if has_tectonic:
                        cmd = ["tectonic", "-X", "compile", "--outdir", temp_dir, "document.tex"]
                    else:
                        cmd = ["pdflatex", "-interaction=nonstopmode", "-no-shell-escape", "-halt-on-error", "-output-directory", temp_dir, "document.tex"]

                    res = subprocess.run(cmd, cwd=temp_dir, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=TIMEOUT_SECONDS)

                    if res.returncode == 0 and os.path.exists(pdf_file):
                        with open(pdf_file, "rb") as f:
                            pdf_bytes = f.read()

                        self.send_response(200)
                        self._send_cors_headers()
                        self.send_header("Content-Type", "application/pdf")
                        self.send_header("Content-Disposition", "inline; filename=resume.pdf")
                        self.end_headers()
                        self.wfile.write(pdf_bytes)
                        return
                except Exception:
                    pass
                finally:
                    shutil.rmtree(temp_dir, ignore_errors=True)

            # Signal Next.js BFF to use built-in vector PDF generator
            self.send_response(422)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": False,
                "error": "No native TeX compiler installed on host. Falling back to built-in vector PDF engine.",
            }).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

def run_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CompilerHTTPRequestHandler) as httpd:
        print(f"ResumeForge Standalone Compiler Server listening on http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")

if __name__ == "__main__":
    run_server()
