// Test file for Actor-SPA Framework formatting capabilities
// This file demonstrates various formatting scenarios for html`` and css`` template literals

// Mock functions for testing
function html(strings: TemplateStringsArray, ...values: unknown[]): string {
  return String.raw(strings, ...values);
}

function css(strings: TemplateStringsArray, ...values: unknown[]): string {
  return String.raw(strings, ...values);
}

// Mock data for testing
const user = {
  avatar: 'https://example.com/avatar.jpg',
  name: 'John Doe',
  bio: 'Software developer and coffee enthusiast',
  id: '123',
};

const theme = 'dark';
const colors = {
  primary: '#007bff',
  secondary: '#6c757d',
  background: '#f8f9fa',
};

const width = 300;
const height = 200;
const borderRadius = 8;
const columns = 3;
const gap = 16;
const mobileColumns = 1;

// Test 1: Basic HTML formatting
const basicHtml = html`
  <div>
    <h1>Hello World</h1>
    <p>This is a paragraph with    extra spaces.</p>
  </div>
`;

// Test 2: HTML with attributes and nested elements
const complexHtml = html`
  <div class="container" id="main">
    <header>
      <nav class="navigation">
        <ul>
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
    </header>
    <main>
      <section class="hero">
        <h1>Welcome to Actor-SPA</h1>
        <p>A modern framework for building reactive web applications.</p>
        <button send="START_DEMO" class="cta-button">Get Started</button>
      </section>
    </main>
  </div>
`;

// Test 3: HTML with template expressions
const dynamicHtml = html`
  <div class="user-profile">
    <img src="${user.avatar}" alt="${user.name}">
    <h2>${user.name}</h2>
    <p>${user.bio}</p>
    <button send:click="EDIT_PROFILE" payload='{"userId": "${user.id}"}'>Edit Profile</button>
  </div>
`;

// Test 4: Basic CSS formatting
const basicCss = css`
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
`;

// Test 5: Complex CSS with nested rules and media queries
const complexCss = css`
  :host {
    --primary-color: #007bff;
    --secondary-color: #6c757d;
    --background-color: #f8f9fa;
    --border-radius: 8px;
    --box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .hero-section {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    padding: 60px 0;
    text-align: center;
  }

  .hero-section h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    font-weight: 700;
  }

  .hero-section p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    opacity: 0.9;
  }

  .cta-button {
    background: white;
    color: var(--primary-color);
    border: none;
    padding: 12px 32px;
    border-radius: var(--border-radius);
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: var(--box-shadow);
  }

  .cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }

  @media (max-width: 768px) {
    .hero-section h1 {
      font-size: 2rem;
    }
    
    .hero-section p {
      font-size: 1rem;
    }
    
    .cta-button {
      padding: 10px 24px;
      font-size: 1rem;
    }
  }
`;

// Test 6: CSS with template expressions (now properly formatted)
const dynamicCss = css`
  .theme-${theme} {
    --primary: ${colors.primary};
    --secondary: ${colors.secondary};
    --background: ${colors.background};
  }

  .dynamic-component {
    width: ${width}px;
    height: ${height}px;
    background-color: var(--primary);
    border-radius: ${borderRadius}px;
  }

  .responsive-grid {
    display: grid;
    grid-template-columns: repeat(${columns}, 1fr);
    gap: ${gap}px;
  }

  @media (max-width: 768px) {
    .responsive-grid {
      grid-template-columns: repeat(${mobileColumns}, 1fr);
    }
  }
`;

// Test 7: Mixed HTML and CSS in component (now properly formatted)
const componentTemplate = html`
  <div class="actor-component">
    <style>
      ${css`
        .actor-component {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .actor-component h2 {
          margin: 0 0 16px 0;
          color: #333;
        }
        
        .actor-component button {
          padding: 8px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      `}
    </style>
    
    <h2>Actor Component</h2>
    <p>This component demonstrates nested CSS in HTML.</p>
    <button send:click="COMPONENT_ACTION">Click Me</button>
  </div>
`;

// Test 8: Malformed HTML (should still format what it can)
const malformedHtml = html`
  <div>
    <h1>Unclosed header
    <p>This paragraph is properly closed</p>
    <div>
      <span>Nested content</span>
    </div>
  </div>
`;

// Test 9: Complex CSS with animations and keyframes
const animationCss = css`
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .fade-in {
    animation: fadeIn 0.3s ease-out;
  }

  .spinner {
    animation: spin 1s linear infinite;
  }

  .complex-animation {
    animation: 
      fadeIn 0.5s ease-out,
      spin 2s linear infinite 0.5s;
  }
`;

// Test 10: CSS Grid and Flexbox layouts
const layoutCss = css`
  .layout-container {
    display: grid;
    grid-template-areas: 
      "header header header"
      "sidebar main aside"
      "footer footer footer";
    grid-template-columns: 250px 1fr 200px;
    grid-template-rows: 60px 1fr 40px;
    min-height: 100vh;
    gap: 16px;
  }

  .header { grid-area: header; }
  .sidebar { grid-area: sidebar; }
  .main { grid-area: main; }
  .aside { grid-area: aside; }
  .footer { grid-area: footer; }

  .flex-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 16px;
  }

  .flex-item {
    flex: 1;
    min-width: 0;
  }

  .flex-item:first-child {
    flex: 0 0 auto;
  }

  .flex-item:last-child {
    flex: 2;
  }
`;

// Export for testing
export {
  basicHtml,
  complexHtml,
  dynamicHtml,
  basicCss,
  complexCss,
  dynamicCss,
  componentTemplate,
  malformedHtml,
  animationCss,
  layoutCss,
};
