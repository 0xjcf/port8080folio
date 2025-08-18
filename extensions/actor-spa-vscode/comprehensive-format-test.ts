// Comprehensive formatting test file - INTENTIONALLY POORLY FORMATTED
// Use "Format Document" to test the formatter

// Mock declarations for testing
declare const html: (strings: TemplateStringsArray, ...values: unknown[]) => string;
declare const css: (strings: TemplateStringsArray, ...values: unknown[]) => string;

// Test data
const theme = 'dark';
const colors = {
  primary: '#007acc',
  secondary: '#1e1e1e',
  accent: '#ff6b35',
  background: '#1a1a1a',
};
const user = { name: 'John Doe', role: 'admin' };
const isActive = true;
const menuItems = ['Home', 'About', 'Contact'];

// 🔴 TEST 1: Basic HTML - poorly formatted, no indentation
const basicHtml = html`
  <div class="container">
  <h1>Hello World</h1>
  <p>This is a paragraph with some <strong>bold text</strong> and <em>italic text</em>.</p>
    <ul>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
    </ul>
  </div>
`;

// 🔴 TEST 2: CSS with expressions - messy formatting
const messyCss = css`
  .theme-${theme} {
    --primary:${colors.primary};
    --secondary:${colors.secondary};
    --accent:${colors.accent};
    background:${colors.background};
    padding:20px;
    margin:0;
  }
  .button {
    padding:10px 20px;
    border:none;
    border-radius:4px;
    background:var(--primary);
    color:white;
    cursor:pointer;
  }
  .button:hover {
    background:var(--accent);
    transform:translateY(-2px);
  }
`;

// 🔴 TEST 3: Complex nested template literals - worst case scenario
const nestedChaos = html`
  <div class="app">
    <header class="header">
    <nav class="nav">${menuItems
      .map(
        (item) => html`
  <a href="#${item.toLowerCase()}" class="nav-link">${item}</a>
`
      )
      .join('')}</nav>
    </header>
    <main class="main">
      <section class="hero">
      <h1>Welcome ${user.name}</h1>
      <p>Your role is: ${user.role}</p>
    </section>
    <section class="content">
    <style>${css`
  .hero {
    background:linear-gradient(45deg,
    ${colors.primary},
    ${colors.accent});
    padding:60px 20px;
    text-align:center;
    color:white;
  }
  .hero h1 {
    font-size:3rem;
    margin:0 0 20px 0;
  }
  .content {
    padding:40px 20px;
  }
  .status {
    display:${isActive ? 'block' : 'none'};
  }
`}</style>
    <div class="status ${isActive ? 'active' : 'inactive'}">Status: ${isActive ? 'Active' : 'Inactive'}</div>
    </section>
  </main>
  <footer class="footer">
  <style>${css`
  .footer {
    background:${colors.secondary};
    padding:20px;
    text-align:center;
    color:${colors.primary};
  }
`}</style>
  <p>&copy; 2024 My App</p>
  </footer>
  </div>
`;

// 🔴 TEST 4: Multiple levels of nesting with conditional logic
const multiLevelNesting = html`
  <div class="dashboard ${theme}-theme">
    <aside class="sidebar">
    <style>${css`
  .sidebar {
    width:250px;
    background:${colors.secondary};
    height:100vh;
    padding:20px;
  }
  .sidebar ul {
    list-style:none;
    padding:0;
  }
  .sidebar li {
    margin:10px 0;
  }
  .sidebar a {
    color:${colors.primary};
    text-decoration:none;
    padding:8px 12px;
    display:block;
    border-radius:4px;
  }
  .sidebar a:hover {
    background:${colors.accent};
    color:white;
  }
`}</style>
    <ul>${menuItems
      .map(
        (item, index) => html`
  <li>
  <a href="#${item.toLowerCase()}" class="sidebar-link ${index === 0 ? 'active' : ''}">${item}</a>
    
  </li>
`
      )
      .join('')}</ul>
  </aside>
  <main class="dashboard-main">
    <header class="dashboard-header">
    <style>${css`
  .dashboard-header {
    background:${colors.background};
    padding:15px 30px;
    border-bottom:1px solid ${colors.secondary};
    display:flex;
    justify-content:space-between;
    align-items:center;
  }
  .user-info {
    display:flex;
    align-items:center;
    gap:10px;
  }
  .user-avatar {
    width:32px;
    height:32px;
    border-radius:50%;
    background:${colors.accent};
  }
`}</style>
    <h2>Dashboard</h2>
      <div class="user-info">
        <div class="user-avatar">
        </div>
      <span>Hello, ${user.name}!</span>
      </div>
    </header>
    <section class="dashboard-content">
    <style>${css`
  .dashboard-content {
    padding:30px;
  }
  .widget {
    background:${colors.background};
    border:1px solid ${colors.secondary};
    border-radius:8px;
    padding:20px;
    margin:20px 0;
  }
  .widget h3 {
    color:${colors.primary};
    margin:0 0 15px 0;
  }
  .metric {
    font-size:2rem;
    font-weight:bold;
    color:${colors.accent};
  }
`}</style>
      <div class="widget">
      <h3>User Statistics</h3>
      <div class="metric">${isActive ? '✅ Online' : '❌ Offline'}</div>
      <p>Role: ${user.role}</p>
    </div>
    <div class="widget">
    <h3>Recent Activity</h3>
    <ul>${menuItems
      .map(
        (item) => html`
  <li>Visited ${item} page</li>
`
      )
      .join('')}</ul>
    </div>
  </section>
  </main>
  </div>
`;

// 🔴 TEST 5: Edge cases with special characters and complex expressions
const edgeCases = html`
  <div data-theme="${theme}" class="app-${theme === 'dark' ? 'night' : 'day'}">
  <style>${css`
  [data-theme="${theme}"] {
    --bg:${colors.background};
    --fg:${colors.primary};
    --accent:${colors.accent};
    font-family:"SF Pro Display",
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  }
  .app-${theme === 'dark' ? 'night' : 'day'} {
    background:var(--bg);
    color:var(--fg);
    min-height:100vh;
  }
  .special-chars::before {
    content:"★ ♦ ♣ ♠ ♥";
    color:${colors.accent};
  }
  .unicode-test {
    content:"🚀 🎉 ✨ 💫 🌟";
  }
`}</style>
    <div class="content">
    <h1>Testing Special Characters: &lt;&gt;&amp;&quot;&#39;</h1>
    <p>Unicode: 你好 世界 🌍 🚀</p>
    <pre>
    <code>&lt;div class="example"&gt;${JSON.stringify({ theme, colors }, null, 2)}&lt;/div&gt;</code>
    </pre>
  </div>
  </div>
`;

// 🔴 TEST 6: Performance test with deep nesting
const deepNesting = html`
  <div>
    <div>
      <div>
        <div>
          <div>
          <style>${css`
  div {
    margin:1px;
    padding:1px;
    border:1px solid ${colors.secondary};
  }
  div div {
    background:${colors.background};
  }
  div div div {
    color:${colors.primary};
  }
  div div div div {
    border-color:${colors.accent};
  }
  div div div div div {
    background:linear-gradient(to right,
    ${colors.primary},
    ${colors.accent});
  }
`}</style>
          <span>Deep nesting level 5 with ${user.name}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

// 🔴 TEST 7: Mixed content types in single template
const mixedContent = html`
  <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width,initial-scale=1.0">
          <title>${user.name}'s Profile</title>
          <style>${css`
  * {
    margin:0;
    padding:0;
    box-sizing:border-box;
  }
  body {
    font-family:system-ui,
    -apple-system,
    sans-serif;
    background:${colors.background};
    color:${colors.primary};
  }
  header {
    background:${colors.secondary};
    padding:1rem 2rem;
    border-bottom:2px solid ${colors.accent};
  }
  main {
    max-width:1200px;
    margin:0 auto;
    padding:2rem;
  }
  footer {
    background:${colors.secondary};
    text-align:center;
    padding:1rem;
    margin-top:2rem;
  }
`}</style>
          </head>
          <body>
            <header>
            <h1>Welcome to ${user.name}'s Profile</h1>
              <nav>
              <a href="#about">About</a>
              <a href="#projects">Projects</a>
              <a href="#contact">Contact</a>
              </nav>
            </header>
            <main>
              <section id="about">
              <h2>About Me</h2>
              <p>I'm ${user.name}, a ${user.role} developer.</p>
            </section>
            <section id="projects">
            <h2>My Projects</h2>
            <div class="project-grid">${menuItems
              .map(
                (project) => html`
  <div class="project-card">
  <h3>${project}</h3>
            
  <p>Description of ${project} project</p>
          
  </div>
`
              )
              .join('')}</div>
        </section>
      </main>
      <footer>
      <p>&copy; 2024 ${user.name}. All rights reserved.</p>
    </footer>
  </body>
  </html>
`;

export {
  basicHtml,
  messyCss,
  nestedChaos,
  multiLevelNesting,
  edgeCases,
  deepNesting,
  mixedContent,
};
