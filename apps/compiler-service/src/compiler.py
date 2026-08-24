import os
import re
import shutil
import subprocess
import time
from typing import Dict, Any, Tuple, Optional, List
from .sandbox import isolated_sandbox_directory
from .models import CompileErrorItem

TIMEOUT_SECONDS = int(os.environ.get("COMPILER_TIMEOUT", "8"))

def detect_available_engines() -> Dict[str, bool]:
    return {
        "tectonic": shutil.which("tectonic") is not None,
        "pdflatex": shutil.which("pdflatex") is not None,
        "xelatex": shutil.which("xelatex") is not None,
    }

def parse_latex_errors(log_text: str) -> Tuple[str, Optional[int], List[CompileErrorItem]]:
    """
    Parses LaTeX / Tectonic compiler logs to extract primary error messages and line numbers.
    """
    errors: List[CompileErrorItem] = []
    primary_error = "Compilation failed with unspecified LaTeX error."
    primary_line: Optional[int] = None

    # Match standard LaTeX error blocks: ! Error Message \n l.42 problematic code
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
            snippet = m.group("snippet")

            errors.append(CompileErrorItem(
                line=line_num,
                message=msg,
                raw=f"Line {line_num}: {msg} ({snippet})" if line_num else msg
            ))

        primary_error = errors[0].message
        primary_line = errors[0].line
    else:
        # Fallback for tectonic-style logs: error: ... on line 42
        tectonic_pattern = re.compile(r"error:?\s*(?P<msg>[^\n\r]+?)(?:(?:\s+at|\s+on|\s+in)?\s+line\s+(?P<line>\d+))?", re.IGNORECASE)
        t_matches = list(tectonic_pattern.finditer(log_text))
        if t_matches:
            for tm in t_matches:
                msg = tm.group("msg").strip()
                line_str = tm.group("line")
                line_num = int(line_str) if line_str else None
                errors.append(CompileErrorItem(line=line_num, message=msg))
            primary_error = errors[0].message
            primary_line = errors[0].line
        else:
            # Look for last few non-empty lines of stderr / stdout
            lines = [l.strip() for l in log_text.splitlines() if l.strip() and not l.startswith("This is")]
            if lines:
                primary_error = lines[-1]

    return primary_error, primary_line, errors

def compile_latex_document(tex_source: str, engine: str = "tectonic") -> Dict[str, Any]:
    """
    Executes sandboxed LaTeX compilation.
    Returns dictionary with success boolean, pdf_bytes or error information.
    """
    start_time = time.time()
    engines = detect_available_engines()

    with isolated_sandbox_directory() as sandbox_path:
        tex_file_path = os.path.join(sandbox_path, "document.tex")
        pdf_file_path = os.path.join(sandbox_path, "document.pdf")

        with open(tex_file_path, "w", encoding="utf-8") as f:
            f.write(tex_source)

        # Decide compiler command
        cmd: List[str] = []
        if engine == "tectonic" and engines["tectonic"]:
            cmd = ["tectonic", "-X", "compile", "--outdir", sandbox_path, "document.tex"]
        elif engines["pdflatex"]:
            cmd = [
                "pdflatex",
                "-interaction=nonstopmode",
                "-no-shell-escape",
                "-halt-on-error",
                "-output-directory", sandbox_path,
                "document.tex"
            ]
        elif engines["tectonic"]:
            cmd = ["tectonic", "-X", "compile", "--outdir", sandbox_path, "document.tex"]
        else:
            # If neither binary exists on host, return clear diagnostic
            return {
                "success": False,
                "error": "No LaTeX engine (tectonic/pdflatex) detected in system environment.",
                "duration_ms": (time.time() - start_time) * 1000,
                "errors": [
                    CompileErrorItem(
                        line=1,
                        message="Tectonic or pdflatex is not installed or available in PATH. Please run inside Docker or install Tectonic."
                    )
                ]
            }

        try:
            # Clean sandbox environment
            clean_env = {
                "PATH": os.environ.get("PATH", ""),
                "LANG": "en_US.UTF-8",
                "LC_ALL": "en_US.UTF-8",
                "HOME": sandbox_path,
                "TMPDIR": sandbox_path,
            }

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

            duration_ms = (time.time() - start_time) * 1000
            combined_log = f"{process.stdout}\n{process.stderr}"

            if process.returncode == 0 and os.path.exists(pdf_file_path):
                with open(pdf_file_path, "rb") as pdf_f:
                    pdf_bytes = pdf_f.read()

                return {
                    "success": True,
                    "pdf_bytes": pdf_bytes,
                    "duration_ms": duration_ms,
                }
            else:
                primary_err, line_num, error_list = parse_latex_errors(combined_log)
                return {
                    "success": False,
                    "error": primary_err,
                    "line": line_num,
                    "errors": error_list,
                    "raw_log": combined_log,
                    "duration_ms": duration_ms,
                }

        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": f"Compilation timed out after {TIMEOUT_SECONDS} seconds. Please simplify your LaTeX document or reduce complex macros.",
                "duration_ms": TIMEOUT_SECONDS * 1000,
                "errors": [
                    CompileErrorItem(
                        line=None,
                        message=f"Timeout exceeded ({TIMEOUT_SECONDS}s)."
                    )
                ]
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Unexpected execution error: {str(e)}",
                "duration_ms": (time.time() - start_time) * 1000,
                "errors": [CompileErrorItem(line=None, message=str(e))]
            }
