// Test file for Biome CLI-based formatting
// import { html, css } from 'actor-spa-framework';

// Mock template functions for testing
const html = (strings: TemplateStringsArray, ..._values: unknown[]) => strings.raw.join('');
const css = (strings: TemplateStringsArray, ..._values: unknown[]) => strings.raw.join('');

const testHtml = html`
  <div class="container">
    <h1>Test HTML</h1>
    <p>This should be properly formatted with Biome CLI.</p>
    <ul>
      <li>Item 1</li>
      <li>Item 2</li>
    </ul>
  </div>
`;

const testCss = css`
  .container {
    background-color: #f0f0f0;
    padding: 20px;
    margin: 10px;
    border-radius: 5px;
  }
  .container h1 {
    color: #333;
    font-size: 24px;
    margin-bottom: 10px;
  }
  .container p {
    line-height: 1.6;
    color: #666;
  }
`;

// Test with template expressions
const dynamicHtml = html`
  <div class="wrapper">
    <h2>${'Dynamic Title'}</h2>
    <p>Count: ${42}</p>
    ${testHtml}
  </div>
`;

// Test nested templates
const nestedExample = html`
  <div class="app">
    <style>${testCss}</style>
    <main>${dynamicHtml}</main>
  </div>
`;

export { testHtml, testCss, dynamicHtml, nestedExample, html, css };
