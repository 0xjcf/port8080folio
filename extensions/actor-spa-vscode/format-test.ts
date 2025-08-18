// Format Test - Before and After Formatting Examples
// This file shows how the formatter should handle different template literal styles

// Mock functions
function html(strings: TemplateStringsArray, ...values: unknown[]): string {
  return String.raw(strings, ...values);
}

function css(strings: TemplateStringsArray, ...values: unknown[]): string {
  return String.raw(strings, ...values);
}

// Test data
const user = { name: 'John', id: '123' };
const theme = 'dark';
const colors = { primary: '#007bff', secondary: '#6c757d' };

// 🔴 BEFORE FORMATTING: Content starts immediately after backtick
const beforeHtml = html`<div class="container"><h1>Hello World</h1><p>This needs formatting</p></div>`;

// 🟢 AFTER FORMATTING: Should become this style (newline after backtick)
const afterHtml = html`
  <div class="container">
    <h1>Hello World</h1>
    <p>This needs formatting</p>
  </div>
`;

// 🔴 BEFORE FORMATTING: CSS with template expressions
const beforeCss = css`.theme-${theme} { --primary: ${colors.primary}; --secondary: ${colors.secondary}; }`;

// 🟢 AFTER FORMATTING: Should preserve expressions and add proper formatting
const afterCss = css`
  .theme-${theme} {
    --primary: ${colors.primary};
    --secondary: ${colors.secondary};
  }
`;

// 🔴 BEFORE FORMATTING: Nested template literals
const beforeNested = html`<div><style>${css`.test { color: red; }`}</style><h1>Hello ${user.name}</h1></div>`;

// 🟢 AFTER FORMATTING: Should handle nested templates correctly
const afterNested = html`
  <div>
    <style>
      ${css`
        .test {
          color: red;
        }
      `}
    </style>
    <h1>Hello ${user.name}</h1>
  </div>
`;

export { beforeHtml, afterHtml, beforeCss, afterCss, beforeNested, afterNested };
