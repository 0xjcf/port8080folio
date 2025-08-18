// Test file for XState formatter

// Mock template literal functions for testing
declare function html(template: TemplateStringsArray, ...args: unknown[]): string;
declare function css(template: TemplateStringsArray, ...args: unknown[]): string;

const userName = 'World';

// Single line HTML template
const simpleHtml = html`<div class="container"><h1>Hello ${userName}!</h1><p>This should be formatted by XState.</p></div>`;

// Multi-line HTML template
const complexHtml = html`
  <div class="wrapper">
    <h2>${'Dynamic Title'}</h2>
    <p>Count: ${42}</p>
    <div>${simpleHtml}</div>
  </div>
`;

// CSS template
const testCss = css`.container {background-color: #f0f0f0;padding: 20px;margin: 10px;border-radius: 5px;} .wrapper {display: flex;flex-direction: column;gap: 1rem;}`;

// HTML with embedded CSS
const appTemplate = html`
<div class="app">
<style>
${testCss}
</style>
<main>
${complexHtml}
</main>
</div>
`;

console.log('XState formatter test file loaded', { simpleHtml, complexHtml, testCss, appTemplate });
