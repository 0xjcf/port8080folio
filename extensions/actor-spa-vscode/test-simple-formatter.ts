// Test file for simple formatter
// This shows how html`` and css`` templates should be formatted

// Mock declarations
declare const html: (strings: TemplateStringsArray, ...values: unknown[]) => string;
declare const css: (strings: TemplateStringsArray, ...values: unknown[]) => string;

// Test data
const theme = { primary: '#007acc' };
const colors = { primary: '#007acc', secondary: '#1e1e1e' };
const user = { name: 'John' };
const handleClick = () => console.log('clicked');
const showHeader = true;
const title = 'My Title';
const items = [
  { title: 'Item 1', description: 'Description 1' },
  { title: 'Item 2', description: 'Description 2' },
];

// Test 1: Basic HTML (should format nicely)
const basicHtml = html`
  <div class="container"><h1>Hello ${user.name}</h1><p>This is a paragraph.</p><ul><li>Item 1</li><li>Item 2</li></ul></div>`;
// Test 2: Basic CSS (should format nicely)
const basicCss = css`
  .theme-dark{--primary:${colors.primary};--secondary:${colors.secondary};}
  .button{padding:10px;border:none;}
  .button:hover{background:${colors.primary};}`; // Test 3: Nested template
const nestedTemplate = html`<div class="app"><style>${css`.app{background:${colors.secondary};}

  .title{color:${colors.primary};}`}</style><h1>App Title</h1></div>

`;

// Before formatting:
const unformattedComponent = html`<div class="container"><h1>Hello World</h1><p>This is a ${user.name} component</p><button onclick=${handleClick}>Click me</button></div>`;

// After formatting (what we want):
const formattedComponent = html`
  <div class="container">
    <h1>Hello World</h1>
    <p>This is a ${user.name} component</p>
    <button onclick=${handleClick}>Click me</button>
  </div>
`;

// CSS example - before:
const unformattedStyles = css`.container{display:flex;flex-direction:column;gap:1rem;}.container h1{color:blue;font-size:2rem;}.container button{background:${theme.primary};color:white;padding:0.5rem 1rem;}`;

// CSS example - after:
const formattedStyles = css`
  .container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .container h1 {
    color: blue;
    font-size: 2rem;
  }
  .container button {
    background: ${theme.primary};
    color: white;
    padding: 0.5rem 1rem;
  }
`;

// Nested templates example:
const complexComponent = html`
  <div class="wrapper">
    ${
      showHeader
        ? html`
      <header>
        <h1>${title}</h1>
      </header>
    `
        : ''
    }
    <main>
      ${items.map(
        (item) => html`
        <article>
          <h2>${item.title}</h2>
          <p>${item.description}</p>
        </article>
      `
      )}
    </main>
  </div>
`;

// Mixed content with styles:
const styledComponent = () => {
  const styles = css`
    .my-component {
      padding: 1rem;
      background: white;
      border-radius: 8px;
    }
  `;

  return html`
    <div class="my-component">
      <style>${styles}</style>
      <h1>Styled Component</h1>
      <p>Content goes here</p>
    </div>
  `;
};

export { basicHtml, basicCss, nestedTemplate };
