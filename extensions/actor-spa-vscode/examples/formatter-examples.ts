// Formatter Examples - What Works and What Doesn't

// These are example patterns to demonstrate formatter capabilities
// In real usage, you would import html and css from your framework

// Mock template tag functions for demonstration
// biome-ignore lint/suspicious/noExplicitAny: Template literals accept any values
declare const html: (strings: TemplateStringsArray, ...values: any[]) => string;
// biome-ignore lint/suspicious/noExplicitAny: Template literals accept any values
declare const css: (strings: TemplateStringsArray, ...values: any[]) => string;

// Mock data for examples
const user = { name: 'John Doe', email: 'john@example.com', active: true };
const theme = { primaryColor: '#007acc', background: '#ffffff' };
const breakpoints = { mobile: '768px' };
const sizes = { small: '14px' };

interface Item {
  title: string;
  description: string;
}

// Simple items for basic examples
const items: Item[] = [
  { title: 'Item 1', description: 'Description 1' },
  { title: 'Item 2', description: 'Description 2' },
];

// ✅ WORKS: Simple HTML Templates
export const simpleHtml = html`
  <div class="container">
    <h1>Welcome</h1>
    <p>This formats correctly</p>
    <button send="CLICK">Click Me</button>
  </div>
`;

// ✅ WORKS: Simple CSS Templates
export const simpleCss = css`
  .container {
    display: flex;
    flex-direction: column;
    padding: 1rem;
  }
  
  button {
    background: blue;
    color: white;
  }
`;

// ✅ WORKS: Basic Expression Interpolation
export const withExpressions = html`
  <div class="user-card">
    <h2>${user.name}</h2>
    <p>${user.email}</p>
    <span class="${user.active ? 'active' : 'inactive'}">
      Status
    </span>
  </div>
`;

// ⚠️ LIMITED: Nested Templates (May not format perfectly)
export const nestedTemplates = html`
  <div class="list">
    ${items.map(
      (item) => html`
      <div class="item">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </div>
    `
    )}
  </div>
`;

// ❌ DOESN'T WORK: Complex Nested Templates
// This shows a pattern that the formatter cannot handle well
// with multiple levels of nesting and interpolations
export const complexNested = html`
  <div>
    ${items.map(
      (_item) => html`
      <div>
        ${
          /* Nested mapping would go here */ html`
          <span>
            ${
              /* Even more nesting */ html`
              <em>Deep nesting example</em>
            `
            }
          </span>
        `
        }
      </div>
    `
    )}
  </div>
`;

// ❌ DOESN'T WORK: Mixed Template Types
export const mixedTemplates = html`
  <div>
    <style>
      ${css`
        .dynamic {
          color: ${theme.primaryColor};
          background: ${theme.background};
        }
        
        @media (max-width: ${breakpoints.mobile}) {
          .dynamic {
            font-size: ${sizes.small};
          }
        }
      `}
    </style>
    <div class="dynamic">Content</div>
  </div>
`;

// 💡 WORKAROUND: Extract Complex Templates
// Instead of complex nesting, extract to separate functions:

export const itemTemplate = (item: Item) => html`
  <div class="item">
    <h3>${item.title}</h3>
    <p>${item.description}</p>
  </div>
`;

export const listTemplate = html`
  <div class="list">
    ${items.map(itemTemplate)}
  </div>
`;

// 💡 WORKAROUND: Pre-define Styles
export const dynamicStyles = css`
  .dynamic {
    color: ${theme.primaryColor};
    background: ${theme.background};
  }
`;

export const componentWithStyles = html`
  <div>
    <style>${dynamicStyles}</style>
    <div class="dynamic">Content</div>
  </div>
`;
