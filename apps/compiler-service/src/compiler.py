import os
import re
import shutil
import subprocess
import time
from typing import Dict, Any, Tuple, Optional, List
from .sandbox import isolated_sandbox_directory
from .models import CompileErrorItem

TIMEOUT_SECONDS = int(os.environ.get("COMPILER_TIMEOUT", "12"))

def detect_available_engines() -> Dict[str, bool]:
    return {
        "pdflatex": shutil.which("pdflatex") is not None,
        "tectonic": shutil.which("tectonic") is not None,
        "xelatex": shutil.which("xelatex") is not None,
    }

def parse_latex_errors(log_text: str) -> Tuple[str, Optional[int], List[CompileErrorItem]]:
    """
    Parses LaTeX / pdflatex compiler logs to extract primary error messages and line numbers.
    """
    errors: List[CompileErrorItem] = []
    primary_error = "Compilation failed with unspecified LaTeX error."
    primary_line: Optional[int] = None

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

            errors.append(CompileErrorItem(
                line=line_num,
                message=msg,
                raw=f"Line {line_num}: {msg} ({snippet})" if line_num else msg
            ))

        primary_error = errors[0].message
        primary_line = errors[0].line
    else:
        for line in log_text.splitlines():
            line = line.strip()
            if line.startswith("!"):
                primary_error = line
                break
            elif "error:" in line.lower():
                primary_error = line
                break

    return primary_error, primary_line, errors

def compile_latex_document(tex_source: str, engine: str = "pdflatex") -> Dict[str, Any]:
    """
    Executes sandboxed LaTeX compilation with automatic engine fallback.
    """
    start_time = time.time()
    engines = detect_available_engines()

    if not engines["pdflatex"] and not engines["tectonic"]:
        return {
            "success": False,
            "error": "No LaTeX engine (pdflatex/tectonic) detected in system environment.",
            "duration_ms": (time.time() - start_time) * 1000,
            "errors": [
                CompileErrorItem(
                    line=1,
                    message="pdflatex or tectonic is not installed or available in PATH."
                )
            ]
        }

    engines_to_try = []
    if engine == "tectonic" and engines["tectonic"]:
        engines_to_try = ["tectonic", "pdflatex"] if engines["pdflatex"] else ["tectonic"]
    else:
        engines_to_try = ["pdflatex", "tectonic"] if (engines["pdflatex"] and engines["tectonic"]) else (["pdflatex"] if engines["pdflatex"] else ["tectonic"])

    with isolated_sandbox_directory() as sandbox_path:
        tex_file_path = os.path.join(sandbox_path, "document.tex")
        pdf_file_path = os.path.join(sandbox_path, "document.pdf")

        with open(tex_file_path, "w", encoding="utf-8") as f:
            f.write(tex_source)

        clean_env = {
            "PATH": os.environ.get("PATH", ""),
            "LANG": "en_US.UTF-8",
            "LC_ALL": "en_US.UTF-8",
            "HOME": sandbox_path,
            "TMPDIR": sandbox_path,
        }

        last_combined_log = ""

        for eng in engines_to_try:
            if eng == "pdflatex":
                cmd = [
                    "pdflatex",
                    "-interaction=nonstopmode",
                    "-no-shell-escape",
                    "-halt-on-error",
                    "-output-directory", sandbox_path,
                    "document.tex"
                ]
            else:
                cmd = ["tectonic", "-X", "compile", "--outdir", sandbox_path, "document.tex"]

            try:
                process = subprocess.run(
                    cmd,
                    cwd=sandbox_path,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    env=clean_env,
                    timeout=TIMEOUT_SECONDS,
                    text=True,
                    errors="replace"
                )

                last_combined_log = f"{process.stdout}\n{process.stderr}"

                if process.returncode == 0 and os.path.exists(pdf_file_path):
                    with open(pdf_file_path, "rb") as pdf_f:
                        pdf_bytes = pdf_f.read()

                    return {
                        "success": True,
                        "pdf_bytes": pdf_bytes,
                        "engine": eng,
                        "duration_ms": (time.time() - start_time) * 1000,
                    }

            except subprocess.TimeoutExpired:
                last_combined_log = f"Compilation timed out after {TIMEOUT_SECONDS} seconds."
            except Exception as e:
                last_combined_log = str(e)

        primary_err, line_num, error_list = parse_latex_errors(last_combined_log)
        return {
            "success": False,
            "error": primary_err,
            "line": line_num,
            "errors": error_list,
            "raw_log": last_combined_log,
            "duration_ms": (time.time() - start_time) * 1000,
        }
