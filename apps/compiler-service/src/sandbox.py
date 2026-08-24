import os
import shutil
import tempfile
from contextlib import contextmanager

@contextmanager
def isolated_sandbox_directory():
    """
    Creates an isolated temporary directory for compiling LaTeX documents
    and guarantees immediate cleanup of all intermediate and temporary files.
    """
    temp_dir = tempfile.mkdtemp(prefix="tex_compile_")
    try:
        # Restrict permissions
        os.chmod(temp_dir, 0o700)
        yield temp_dir
    finally:
        # Completely remove temporary directory
        shutil.rmtree(temp_dir, ignore_errors=True)
