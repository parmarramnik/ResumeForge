const LATEX_ESCAPE_MAP: Record<string, string> = {
  '\\': '\\textbackslash{}',
  '{': '\\{',
  '}': '\\}',
  '$': '\\$',
  '&': '\\&',
  '#': '\\#',
  '_': '\\_',
  '%': '\\%',
  '^': '\\textasciicircum{}',
  '~': '\\textasciitilde{}',
  '<': '\\textless{}',
  '>': '\\textgreater{}',
};

/**
 * Strictly escapes special LaTeX characters in user input using atomic replacement
 * so generated escaping commands are never re-escaped.
 */
export function latexEscape(input: unknown): string {
  if (input === null || input === undefined) {
    return '';
  }
  const str = String(input);
  if (!str) return '';

  return str.replace(/[\\{}$&#_%^~<>]/g, (match) => LATEX_ESCAPE_MAP[match] || match);
}

/**
 * Escapes URLs for use in LaTeX \href{url}{text}
 */
export function latexUrlEscape(url: unknown): string {
  if (!url) return '';
  const str = String(url).trim();
  // Ensure valid protocol
  if (!str.startsWith('http://') && !str.startsWith('https://') && !str.startsWith('mailto:')) {
    return `https://${str}`;
  }
  return str.replace(/[%#]/g, (match) => `\\${match}`);
}
