// Test file for formatting fixes
declare const html: (strings: TemplateStringsArray, ...values: unknown[]) => string;
declare const css: (strings: TemplateStringsArray, ...values: unknown[]) => string;

const testData = {
  title: 'Test Page',
  theme: 'dark',
  colors: {
    primary: '#007acc',
    secondary: '#1e1e1e',
  },
};

// Test 1: Poorly formatted HTML
const testHtml = html`
  <div class="container">
    <h1>
      Hello World
    </h1>
    <p>
      This is a paragraph with some
      <strong>
        bold text
      </strong>
      and
      <em>
        italic text
      </em>
      .
    </p>
    <ul>
      <li>
        Item 1
      </li>
      <li>
        Item 2
      </li>
      <li>
        Item 3
      </li>
    </ul>
  </div>
`;

// Test 2: Poorly formatted CSS
const testCss = css`
  .theme-${testData.theme} {
    --primary: ${testData.colors.primary};
    --secondary: ${testData.colors.secondary};
    background: ${testData.colors.secondary};
    padding: 20px;
    margin: 0;
  }

  .button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    background: var(--primary);
    color: white;
    cursor: pointer;
  }

  .button:hover {
    background: var(--primary);
    transform: translateY(-2px);
  }
`;

export { testHtml, testCss };
