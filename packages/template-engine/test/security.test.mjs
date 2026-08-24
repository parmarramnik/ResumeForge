import assert from 'node:assert/strict';
import { latexEscape } from '../src/escape.ts';
import { renderTemplate } from '../src/engine.ts';

console.log('Running LaTeX security escaping tests...');

// 1. Escaping dangerous LaTeX characters
assert.equal(latexEscape('\\write18{cat /etc/passwd}'), '\\textbackslash{}write18\\{cat /etc/passwd\\}');
assert.equal(latexEscape('$1,000,000 & 50% discount #1'), '\\$1,000,000 \\& 50\\% discount \\#1');
assert.equal(latexEscape('User_Input_{with_special_braces}'), 'User\\_Input\\_\\{with\\_special\\_braces\\}');
assert.equal(latexEscape('Math: ^2 and ~approx'), 'Math: \\textasciicircum{}2 and \\textasciitilde{}approx');

// 2. Interpolation safety: Malicious payload rendered safely
const maliciousTemplate = `
\\section{Experience}
{{#each experience}}
\\textbf{{{company}}} -- {{{role}}}
{{description}}
{{/each}}
`;

const attackPayload = {
  experience: [
    {
      company: 'Evil Corp \\write18{rm -rf /} & Co',
      role: 'Hacker $100% #1 {root}',
      description: 'Attempting \\input{/etc/shadow} & \\openout',
    },
  ],
};

const rendered = renderTemplate(maliciousTemplate, attackPayload);

// Ensure no raw executable commands exist in rendered LaTeX
assert(!rendered.includes('\\write18'));
assert(rendered.includes('\\textbackslash{}write18\\{rm -rf /\\} \\& Co'));
assert(!rendered.includes('\\input{/etc/shadow}'));
assert(rendered.includes('\\textbackslash{}input\\{/etc/shadow\\} \\& \\textbackslash{}openout'));

console.log('All LaTeX security and injection tests passed successfully!');
