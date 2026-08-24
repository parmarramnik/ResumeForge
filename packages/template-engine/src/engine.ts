import { latexEscape } from './escape';

type TemplateContext = Record<string, unknown>;

interface NodeText {
  type: 'text';
  value: string;
}

interface NodeVariable {
  type: 'variable';
  path: string;
  wrappedWithBraces: boolean;
}

interface NodeIf {
  type: 'if';
  conditionPath: string;
  consequent: AstNode[];
  alternate: AstNode[];
  isUnless?: boolean;
}

interface NodeEach {
  type: 'each';
  arrayPath: string;
  body: AstNode[];
}

type AstNode = NodeText | NodeVariable | NodeIf | NodeEach;

function resolveValue(path: string, scopes: TemplateContext[]): unknown {
  const trimmed = path.trim();
  if (trimmed === 'this' || trimmed === '.') {
    const top = scopes[scopes.length - 1];
    if (top && typeof top === 'object' && 'this' in top) {
      return (top as Record<string, unknown>).this;
    }
    return top;
  }

  for (let i = scopes.length - 1; i >= 0; i--) {
    const scope = scopes[i];
    if (scope && typeof scope === 'object') {
      const parts = trimmed.split('.');
      let current: unknown = scope;
      let matched = true;

      for (const part of parts) {
        if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
          current = (current as Record<string, unknown>)[part];
        } else {
          matched = false;
          break;
        }
      }

      if (matched && current !== undefined) {
        return current;
      }
    }
  }

  return undefined;
}

function isTruthy(val: unknown): boolean {
  if (val === null || val === undefined) return false;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val !== 0;
  if (typeof val === 'string') return val.trim().length > 0;
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === 'object') return Object.keys(val as object).length > 0;
  return false;
}

/**
 * Parses template string into AST nodes.
 * Matches {{{ path }}} (triple brace for wrapped LaTeX args) and {{ path }} (double brace for standard).
 */
export function parseTemplate(template: string): AstNode[] {
  const tokensRegex = /\{\{\{([^{}]+?)\}\}\}|\{\{([^{}]+?)\}\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  type StackItem = {
    type: 'root' | 'if' | 'unless' | 'each';
    path?: string;
    consequent?: AstNode[];
    alternate?: AstNode[];
    currentBranch?: 'consequent' | 'alternate';
    nodes: AstNode[];
  };

  const stack: StackItem[] = [{ type: 'root', nodes: [] }];

  function currentTarget(): AstNode[] {
    const top = stack[stack.length - 1];
    if ((top.type === 'if' || top.type === 'unless') && top.currentBranch === 'alternate') {
      return top.alternate!;
    }
    return top.nodes;
  }

  while ((match = tokensRegex.exec(template)) !== null) {
    const textBefore = template.slice(lastIndex, match.index);
    if (textBefore) {
      currentTarget().push({ type: 'text', value: textBefore });
    }
    lastIndex = match.index + match[0].length;

    const isTriple = match[1] !== undefined;
    const tagContent = (match[1] !== undefined ? match[1] : match[2]).trim();

    if (tagContent.startsWith('#if ')) {
      const conditionPath = tagContent.substring(4).trim();
      stack.push({
        type: 'if',
        path: conditionPath,
        currentBranch: 'consequent',
        nodes: [],
        alternate: [],
      });
    } else if (tagContent.startsWith('#unless ')) {
      const conditionPath = tagContent.substring(8).trim();
      stack.push({
        type: 'unless',
        path: conditionPath,
        currentBranch: 'consequent',
        nodes: [],
        alternate: [],
      });
    } else if (tagContent.startsWith('#each ')) {
      const arrayPath = tagContent.substring(6).trim();
      stack.push({
        type: 'each',
        path: arrayPath,
        nodes: [],
      });
    } else if (tagContent === 'else') {
      const top = stack[stack.length - 1];
      if (top && (top.type === 'if' || top.type === 'unless')) {
        top.currentBranch = 'alternate';
      }
    } else if (tagContent === '/if' || tagContent === '/unless') {
      const popped = stack.pop();
      if (popped && (popped.type === 'if' || popped.type === 'unless')) {
        currentTarget().push({
          type: 'if',
          conditionPath: popped.path || '',
          consequent: popped.nodes,
          alternate: popped.alternate || [],
          isUnless: popped.type === 'unless',
        });
      }
    } else if (tagContent === '/each') {
      const popped = stack.pop();
      if (popped && popped.type === 'each') {
        currentTarget().push({
          type: 'each',
          arrayPath: popped.path || '',
          body: popped.nodes,
        });
      }
    } else if (!tagContent.startsWith('/') && !tagContent.startsWith('!')) {
      currentTarget().push({
        type: 'variable',
        path: tagContent,
        wrappedWithBraces: isTriple,
      });
    }
  }

  const remaining = template.slice(lastIndex);
  if (remaining) {
    currentTarget().push({ type: 'text', value: remaining });
  }

  return stack[0].nodes;
}

/**
 * Renders AST nodes with supplied data and automatic LaTeX escaping.
 */
function renderNodes(nodes: AstNode[], scopes: TemplateContext[]): string {
  let output = '';

  for (const node of nodes) {
    if (node.type === 'text') {
      output += node.value;
    } else if (node.type === 'variable') {
      const val = resolveValue(node.path, scopes);
      if (val !== undefined && val !== null) {
        const escaped = latexEscape(val);
        if (node.wrappedWithBraces) {
          output += `{${escaped}}`;
        } else {
          output += escaped;
        }
      }
    } else if (node.type === 'if') {
      const condVal = resolveValue(node.conditionPath, scopes);
      const isCondTruthy = isTruthy(condVal);
      const shouldRunConsequent = node.isUnless ? !isCondTruthy : isCondTruthy;

      if (shouldRunConsequent) {
        output += renderNodes(node.consequent, scopes);
      } else if (node.alternate && node.alternate.length > 0) {
        output += renderNodes(node.alternate, scopes);
      }
    } else if (node.type === 'each') {
      const arr = resolveValue(node.arrayPath, scopes);
      if (Array.isArray(arr) && arr.length > 0) {
        for (let idx = 0; idx < arr.length; idx++) {
          const item = arr[idx];
          const itemScope: TemplateContext =
            typeof item === 'object' && item !== null
              ? { ...(item as TemplateContext), this: item }
              : { this: item, value: item };

          itemScope['@index'] = idx;
          itemScope['@number'] = idx + 1;
          itemScope['@first'] = idx === 0;
          itemScope['@last'] = idx === arr.length - 1;

          output += renderNodes(node.body, [...scopes, itemScope]);
        }
      }
    }
  }

  return output;
}

/**
 * Public method to render template with user data.
 */
export function renderTemplate(template: string, data: Record<string, unknown>): string {
  if (!template) return '';
  const ast = parseTemplate(template);
  return renderNodes(ast, [data]);
}
