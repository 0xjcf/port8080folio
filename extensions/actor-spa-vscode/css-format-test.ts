// CSS Formatting Test - Focus on template literal CSS formatting
// Use "Format Document" to test the CSS formatter

declare const css: (strings: TemplateStringsArray, ...values: unknown[]) => string;

// Test data
const theme = 'dark';
const colors = {
  primary: '#007acc',
  secondary: '#1e1e1e',
  accent: '#ff6b35',
  background: '#1a1a1a',
};

// 🔴 CSS TEST: Messy formatting that should be cleaned up
const messyCss = css`
  .theme-${theme}{--primary:${colors.primary};--secondary:${colors.secondary};--accent:${colors.accent};background:${colors.background};padding:20px;margin:0;}
  .button{padding:10px 20px;border:none;border-radius:4px;background:var(--primary);color:white;cursor:pointer;}
  .button:hover{background:var(--accent);transform:translateY(-2px);}`;
// 🔴 CSS TEST: Long single line that needs breaking
const longCss = css`body{font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif;background:${colors.background};color:${colors.primary};margin:0;padding:0;}
  .container{max-width:1200px;margin:0 auto;padding:2rem;}
  .header{background:${colors.secondary};padding:1rem 2rem;border-bottom:2px solid ${colors.accent};}
  .nav{display:flex;gap:1rem;}
  .nav a{color:${colors.primary};text-decoration:none;padding:0.5rem 1rem;border-radius:4px;}
  .nav a:hover{background:${colors.accent};color:white;}`;
// 🔴 CSS TEST: Complex gradients and functions
const complexCss = css`.hero{background:linear-gradient(45deg,${colors.primary},${colors.accent},rgba(255,255,255,0.1));background-size:400% 400%;animation:gradient 15s ease infinite;box-shadow:0 4px 6px rgba(0,0,0,0.1),0 1px 3px rgba(0,0,0,0.08);transform:perspective(1000px) rotateX(10deg) rotateY(5deg);}
  .card{background:radial-gradient(circle at center,${colors.background},${colors.secondary});border:1px solid ${colors.accent};filter:drop-shadow(0 10px 20px rgba(0,0,0,0.25)) blur(0.5px);}
`;

export { messyCss, longCss, complexCss };
