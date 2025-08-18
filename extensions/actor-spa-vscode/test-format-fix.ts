// Test file to verify formatting fixes

// Mock declarations for testing
declare const html: (strings: TemplateStringsArray, ...values: unknown[]) => string;
declare const css: (strings: TemplateStringsArray, ...values: unknown[]) => string;

// Test 1: Basic HTML template - should format with newline after backtick
const basicHtml = html`<div class="container"><h1>Hello World</h1><p>This should be formatted</p></div>`;

// Test 2: CSS template with expressions - should preserve ${} expressions
const theme = 'dark';
const colors = { primary: '#007acc', secondary: '#1e1e1e' };
const cssWithExpressions = css`.theme-${theme} { --primary: ${colors.primary}; --secondary: ${colors.secondary}; }`;

// Test 3: Nested template literals - the critical test case
const user = { name: 'John' };
const nestedTemplates = html`<div><style>${css`.test { color: red; }`}</style><h1>Hello ${user.name}</h1></div>`;

// Test 4: Complex nested case
const complexNested = html`
  <div class="component">
    <style>
      ${css`
        .test {
          color: blue;
          background: ${colors.primary};
        }
      `}
    </style>
    <h1>Hello ${user.name}</h1>
  </div>
`;

export { basicHtml, cssWithExpressions, nestedTemplates, complexNested };
