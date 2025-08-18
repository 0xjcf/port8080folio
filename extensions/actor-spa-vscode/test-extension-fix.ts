// Test file to verify the extension formatting works
// import { html, css } from 'some-library';

// Mock html and css functions for testing
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const html = (strings: TemplateStringsArray, ..._values: unknown[]) => strings.join('');
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const css = (strings: TemplateStringsArray, ..._values: unknown[]) => strings.join('');

export function testComponent() {
  const template = html`<div class="container"><p>Hello World</p><span>Test</span></div>`;

  const styles = css`
    .container {
      display: flex;
      padding: 20px;
    }
  `;

  return { template, styles };
}
