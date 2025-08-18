// Simple debug test for Actor-SPA formatting
console.log('🟢 Debug test file loaded');

// @ts-ignore - Used in template literal
const html = (strings: TemplateStringsArray, ...values: unknown[]): string => {
  console.log('🟡 html function called');
  return strings.join('');
};

console.log('🟢 About to create template literal');
const test = html`<div class="test">Hello World</div>`;
console.log('🟢 Template literal created:', test);
console.log('🟢 html function reference:', typeof html);

export { test, html };
