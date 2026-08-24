import re
from typing import Tuple, Optional

# Forbidden LaTeX commands that attempt file system traversal or process execution
BLOCKED_PATTERNS = [
    (r'\\write18', "Shell escape commands (\\write18) are prohibited for security."),
    (r'\\immediate\s*\\write', "Direct file writing commands are prohibited."),
    (r'\\openout', "Direct output stream manipulation is prohibited."),
    (r'\\input\s*\{/(?:etc|proc|sys|root|var|home)', "System path inclusion is prohibited."),
    (r'\\include\s*\{/(?:etc|proc|sys|root|var|home)', "System path inclusion is prohibited."),
    (r'\\read\s*.*\\to', "Direct file reading into macros is prohibited."),
]

def validate_latex_safety(tex_content: str) -> Tuple[bool, Optional[str]]:
    """
    Performs defense-in-depth static analysis on LaTeX source to detect
    potentially dangerous system-level commands before reaching the compiler.
    """
    if not tex_content or len(tex_content.strip()) < 10:
        return False, "LaTeX source is too short or empty."

    if len(tex_content.encode('utf-8')) > 2 * 1024 * 1024:
        return False, "LaTeX source exceeds 2MB maximum limit."

    for pattern, message in BLOCKED_PATTERNS:
        if re.search(pattern, tex_content, re.IGNORECASE):
            return False, message

    return True, None
