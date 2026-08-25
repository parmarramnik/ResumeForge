#!/usr/bin/env python3
"""
ResumeForge Universal LaTeX Compiler Microservice Server
Robust compiler supporting pdflatex, xelatex, lualatex, and tectonic engines with smart auto-detection and multi-engine failover.
"""

import http.server
import json
import os
import re
import shutil
import socketserver
import subprocess
import tempfile
import time
from urllib.parse import urlparse

PORT = int(os.environ.get("PORT", "8000"))
TIMEOUT_SECONDS = int(os.environ.get("COMPILER_TIMEOUT", "15"))

def detect_best_engines(tex_source: str, preferred_engine: str = "pdflatex"):
    """
    Intelligently orders compilation engines based on document features.
    """
    has_pdflatex = shutil.which("pdflatex") is not None
    has_xelatex = shutil.which("xelatex") is not None
    has_lualatex = shutil.which("lualatex") is not None
    has_tectonic = shutil.which("tectonic") is not None

    available = {
        "pdflatex": has_pdflatex,
        "xelatex": has_xelatex,
        "lualatex": has_lualatex,
        "tectonic": has_tectonic,
    }

    # Check for XeTeX / LuaTeX specific packages and font loaders
    requires_xetex = bool(re.search(
        r"\\usepackage\{(fontspec|xeCJK|unicode-math|xltxtra|fontmfizz)\}|\\setmainfont|\\setmonofont|\\setsansfont",
        tex_source,
        re.IGNORECASE
    ))

    # Construct ordered candidate list
    ordered_candidates = []

    if requires_xetex:
        order = ["xelatex", "tectonic", "lualatex", "pdflatex"]
    elif preferred_engine and preferred_engine in available:
        order = [preferred_engine] + [e for e in ["pdflatex", "tectonic", "xelatex", "lualatex"] if e != preferred_engine]
    else:
        order = ["pdflatex", "tectonic", "xelatex", "lualatex"]

    for eng in order:
        if available.get(eng) and eng not in ordered_candidates:
            ordered_candidates.append(eng)

    return ordered_candidates

def parse_latex_log(log_text: str):
    """
    Parses LaTeX compiler log / stderr to extract primary error message and line number.
    """
    errors = []
    primary_error = "Compilation failed with LaTeX error."
    primary_line = None

    latex_error_pattern = re.compile(
        r"!\s*(?:LaTeX Error:\s*)?(?P<msg>[^\n\r]+)(?:\r?\n(?:\s*.*?)*?\r?\nl\.(?P<line>\d+)\s*(?P<snippet>[^\n\r]*))?",
        re.MULTILINE
    )

    matches = list(latex_error_pattern.finditer(log_text))
    if matches:
        for m in matches:
            msg = m.group("msg").strip()
            line_str = m.group("line")
            line_num = int(line_str) if line_str else None
            snippet = m.group("snippet") or ""
            errors.append({
                "line": line_num,
                "message": msg,
                "snippet": snippet.strip()
            })

        primary_error = errors[0]["message"]
        primary_line = errors[0]["line"]
    else:
        # Fallback to general lines
        for line in log_text.splitlines():
            line = line.strip()
            if line.startswith("!"):
                primary_error = line
                break
            elif "error:" in line.lower():
                primary_error = line
                break

    return primary_error, primary_line, errors

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
        if parsed.path in ("/health", "/"):
            has_pdflatex = shutil.which("pdflatex") is not None
            has_xelatex = shutil.which("xelatex") is not None
            has_lualatex = shutil.which("lualatex") is not None
            has_tectonic = shutil.which("tectonic") is not None

            self.send_response(200)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()

            payload = {
                "status": "healthy" if any([has_pdflatex, has_xelatex, has_lualatex, has_tectonic]) else "degraded",
                "engine": "pdflatex" if has_pdflatex else ("xelatex" if has_xelatex else "tectonic"),
                "pdflatex_available": has_pdflatex,
                "xelatex_available": has_xelatex,
                "lualatex_available": has_lualatex,
                "tectonic_available": has_tectonic,
                "version": "1.2.0 (Universal LaTeX - pdflatex, xelatex, lualatex, tectonic)",
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
                tex_source = data.get("tex") or data.get("tex_source") or data.get("latex") or ""
                preferred_engine = data.get("engine", "pdflatex")
            except Exception:
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
                self.wfile.write(json.dumps({"success": False, "error": "LaTeX document is empty or too short."}).encode("utf-8"))
                return

            engines_to_try = detect_best_engines(tex_source, preferred_engine)

            if not engines_to_try:
                self.send_response(500)
                self._send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": False,
                    "error": "No LaTeX compiler found. Please ensure TeX Live or Tectonic is installed.",
                }).encode("utf-8"))
                return

            temp_dir = tempfile.mkdtemp(prefix="tex_compile_")
            last_err_output = ""

            try:
                tex_file = os.path.join(temp_dir, "document.tex")
                pdf_file = os.path.join(temp_dir, "document.pdf")
                with open(tex_file, "w", encoding="utf-8") as f:
                    f.write(tex_source)

                start_time = time.time()

                for eng in engines_to_try:
                    if eng in ("pdflatex", "xelatex", "lualatex"):
                        cmd = [
                            eng,
                            "-interaction=nonstopmode",
                            "-no-shell-escape",
                            "-output-directory", temp_dir,
                            "document.tex"
                        ]
                    else:
                        cmd = ["tectonic", "-X", "compile", "--outdir", temp_dir, "document.tex"]

                    try:
                        res = subprocess.run(
                            cmd,
                            cwd=temp_dir,
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            timeout=TIMEOUT_SECONDS,
                            text=True,
                            errors="replace"
                        )
                        combined_output = f"{res.stdout}\n{res.stderr}"
                        last_err_output = combined_output

                        # Check if PDF was successfully generated
                        if os.path.exists(pdf_file) and os.path.getsize(pdf_file) > 100:
                            # If document uses cross-references or tabularx, run a fast 2nd pass for perfect alignment
                            if re.search(r"\\(pageref|ref|cite|label|totpages)", tex_source):
                                try:
                                    subprocess.run(
                                        cmd,
                                        cwd=temp_dir,
                                        stdout=subprocess.PIPE,
                                        stderr=subprocess.PIPE,
                                        timeout=TIMEOUT_SECONDS,
                                        text=True,
                                        errors="replace"
                                    )
                                except Exception:
                                    pass

                            with open(pdf_file, "rb") as f:
                                pdf_bytes = f.read()

                            duration_ms = (time.time() - start_time) * 1000
                            self.send_response(200)
                            self._send_cors_headers()
                            self.send_header("Content-Type", "application/pdf")
                            self.send_header("Content-Disposition", "inline; filename=resume.pdf")
                            self.send_header("X-Duration-Ms", str(round(duration_ms, 2)))
                            self.send_header("X-Compiler-Engine", eng)
                            self.end_headers()
                            self.wfile.write(pdf_bytes)
                            return
                    except subprocess.TimeoutExpired:
                        last_err_output = f"Compilation timed out after {TIMEOUT_SECONDS}s with engine '{eng}'."
                    except Exception as ex:
                        last_err_output = str(ex)

                # If all engines failed, parse error log
                primary_err, line_num, errors = parse_latex_log(last_err_output)
                self.send_response(422)
                self._send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": False,
                    "error": primary_err,
                    "line": line_num,
                    "errors": errors,
                    "raw_log": last_err_output[-2000:] if len(last_err_output) > 2000 else last_err_output
                }).encode("utf-8"))

            finally:
                shutil.rmtree(temp_dir, ignore_errors=True)
        else:
            self.send_response(404)
            self.end_headers()

def run_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CompilerHTTPRequestHandler) as httpd:
        print(f"ResumeForge Universal LaTeX Compiler Server listening on http://0.0.0.0:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")

if __name__ == "__main__":
    run_server()
