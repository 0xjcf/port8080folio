// Test file for debug logging system
// This file tests the centralized debug logging functionality

// Mock template literal functions for testing
declare function html(template: TemplateStringsArray, ...args: unknown[]): string;
declare function css(template: TemplateStringsArray, ...args: unknown[]): string;

const userName = 'TestUser';
const count = 42;

// Test template that should trigger formatting
const testTemplate = html`
  <div class="test-container">
    <h1>Debug Test: ${userName}</h1>
    <p>Count: ${count}</p>
    <div class="nested">
      <span>This template should trigger debug logging</span>
    </div>
  </div>
`;

// Test CSS template
const testStyles = css`
  .test-container {
    background-color: #f0f0f0;
    padding: 20px;
    margin: 10px;
    border-radius: 5px;
  }
  .nested {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
`;

// Complex template with multiple elements
const complexTemplate = html`
<div class="app">
  <header>
    <h1>Debug Logging Test</h1>
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
    </nav>
  </header>
  <main>
    <section>
      <h2>Section Title</h2>
      <p>This is a test paragraph for debugging the formatter.</p>
      <div class="card">
        <h3>Card Title</h3>
        <p>Card content goes here.</p>
      </div>
    </section>
  </main>
  <footer>
    <p>&copy; 2024 Debug Test</p>
  </footer>
</div>
`;

// Template with embedded styles
const templateWithStyles = html`
<div class="styled-component">
  <style>
    ${testStyles}
    .styled-component {
      font-family: Arial, sans-serif;
      color: #333;
    }
  </style>
  <div class="content">
    ${testTemplate}
  </div>
</div>
`;

console.log('Debug logging test file loaded', {
  testTemplate,
  testStyles,
  complexTemplate,
  templateWithStyles,
});

// Function to test error scenarios
function testErrorScenario() {
  const undefinedVariable = undefined;
  const malformedTemplate = html`
    <div class="error-test">
      <h1>This template has ${undefinedVariable}</h1>
      <p>This should trigger error logging</p>
    </div>
  `;

  return malformedTemplate;
}

// Export for testing
export { testTemplate, testStyles, complexTemplate, templateWithStyles, testErrorScenario };
