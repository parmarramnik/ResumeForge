import assert from 'node:assert/strict';
import { latexEscape } from '../src/escape.ts';
import { parseTemplate, renderTemplate } from '../src/engine.ts';

// 1. Test LaTeX escaping
console.log('Testing latexEscape...');
assert.equal(latexEscape('John & Jane'), 'John \\& Jane');
assert.equal(latexEscape('C++ & C#'), 'C++ \\& C\\#');
assert.equal(latexEscape('$100 and 50% discount_rate'), '\\$100 and 50\\% discount\\_rate');
assert.equal(latexEscape('test {brace} and ^caret~tilde'), 'test \\{brace\\} and \\textasciicircum{}caret\\textasciitilde{}tilde');
assert.equal(latexEscape('path\\to\\file'), 'path\\textbackslash{}to\\textbackslash{}file');

// 2. Test template rendering
console.log('Testing renderTemplate...');
const template = `
\\textbf{{{personal.name}}}
\\href{mailto:{{personal.email}}}{{personal.email}}
{{#if personal.github}}
GitHub: {{personal.github}}
{{/if}}

\\section{Experience}
{{#each experience}}
\\textbf{{{company}}} -- {{{role}}} \\hfill {{start_date}} - {{end_date}}
{{#if description}}
{{description}}
{{/if}}
\\begin{itemize}
{{#each bullets}}
  \\item {{this}}
{{/each}}
\\end{itemize}
{{/each}}
`;

const data = {
  personal: {
    name: 'Alice Cooper & Bob',
    email: 'alice@example.com',
    github: 'alice_dev',
  },
  experience: [
    {
      company: 'Tech Corp & Co',
      role: 'Lead Architect',
      start_date: '2021',
      end_date: 'Present',
      description: 'Led 100% cloud migration ($5M budget)',
      bullets: [
        'Designed distributed microservices handling 50k req/s',
        'Implemented zero-trust security & OAuth2',
      ],
    },
  ],
};

const rendered = renderTemplate(template, data);
console.log('Rendered output:\n', rendered);

assert(rendered.includes('\\textbf{Alice Cooper \\& Bob}'));
assert(rendered.includes('Led 100\\% cloud migration (\\$5M budget)'));
assert(rendered.includes('\\textbf{Tech Corp \\& Co} -- {Lead Architect}'));
assert(rendered.includes('\\item Designed distributed microservices handling 50k req/s'));
assert(rendered.includes('\\item Implemented zero-trust security \\& OAuth2'));

console.log('All template engine tests passed successfully!');
