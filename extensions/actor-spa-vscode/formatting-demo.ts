// Formatting Demo - Actor-SPA Framework VS Code Extension
// This file demonstrates the fixed formatting behavior for template literals

// Mock functions
function html(strings: TemplateStringsArray, ...values: unknown[]): string {
  return String.raw(strings, ...values);
}

function css(strings: TemplateStringsArray, ...values: unknown[]): string {
  return String.raw(strings, ...values);
}

// Test data
const theme = 'dark';
const colors = { primary: '#007bff', secondary: '#6c757d' };
const user = { name: 'John', id: '123' };

// ✅ FIXED: CSS with template expressions now formats correctly
const dynamicStyles = css`
  .theme-${theme} {
    --primary: ${colors.primary};
    --secondary: ${colors.secondary};
    background: var(--primary);
  }
  
  .user-card {
    color: ${colors.primary};
    border: 1px solid ${colors.secondary};
  }
`;

// ✅ FIXED: Nested template literals now format correctly
const componentWithStyles = html`
  <div class="component">
    <style>
      ${css`
        .component {
          display: flex;
          padding: 20px;
          background: white;
        }
        
        .component h1 {
          color: ${colors.primary};
          margin: 0;
        }
      `}
    </style>
    
    <h1>Hello ${user.name}</h1>
    <p>User ID: ${user.id}</p>
  </div>
`;

// ✅ Complex nested expressions also work
const advancedTemplate = html`
  <div class="advanced">
    ${user.name ? html`<h1>Welcome ${user.name}!</h1>` : html`<h1>Welcome Guest!</h1>`}
    
    <style>
      ${css`
        .advanced {
          background: ${theme === 'dark' ? '#333' : '#fff'};
          color: ${theme === 'dark' ? '#fff' : '#333'};
        }
      `}
    </style>
  </div>
`;

// Export the examples
export { dynamicStyles, componentWithStyles, advancedTemplate };
