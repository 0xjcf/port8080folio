// Section highlighting tests for V2

class V2SectionsParser {
  constructor() {
    this.testCases = [
      {
        name: 'Basic Section Highlighting',
        code: `
// ==== imports ====
import React from 'react';
import { createMachine, assign } from 'xstate';

// ==== context ====
const initialContext = {
    user: null,
    items: [],
    loading: false
};

// ==== guards ====
const guards = {
    isAuthenticated: ({ context }) => !!context.user,
    hasItems: ({ context }) => context.items.length > 0
};

// ==== actions ====
const actions = {
    setUser: assign({
        user: ({ event }) => event.user
    }),
    addItem: assign({
        items: ({ context, event }) => [...context.items, event.item]
    })
};

// ==== machine ====
const appMachine = createMachine({
    id: 'app',
    initial: 'idle',
    context: initialContext,
    states: {
        idle: {
            on: {
                LOGIN: {
                    target: 'authenticated',
                    guard: 'isAuthenticated'
                }
            }
        },
        authenticated: {
            on: {
                ADD_ITEM: {
                    actions: 'addItem'
                }
            }
        }
    }
}, {
    guards,
    actions
});
                `.trim(),
      },
      {
        name: 'Mixed Sections with Components',
        code: `
// ==== imports ====
import React, { useState, useEffect } from 'react';
import { useMachine } from '@xstate/react';

// ==== types ====
interface User {
    id: string;
    name: string;
    email: string;
}

// ==== components ====
const UserProfile = ({ user }: { user: User }) => {
    return (
        <div className="profile">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
        </div>
    );
};

// ==== hooks ====
const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    
    useEffect(() => {
        // Fetch user data
        fetchUser().then(setUser);
    }, []);
    
    return { user };
};

// ==== utils ====
const fetchUser = async (): Promise<User> => {
    const response = await fetch('/api/user');
    return response.json();
};

// ==== main ====
const App = () => {
    const { user } = useAuth();
    
    if (!user) return <div>Loading...</div>;
    
    return <UserProfile user={user} />;
};
                `.trim(),
      },
      {
        name: 'Section Transitions',
        code: `
// ==== setup ====
const config = {
    apiUrl: 'https://api.example.com',
    timeout: 5000
};

// ==== models ====
class Task {
    constructor(public id: string, public title: string) {}
    
    complete() {
        return { ...this, completed: true };
    }
}

// ==== services ====
const taskService = {
    async fetchTasks() {
        const response = await fetch(\`\${config.apiUrl}/tasks\`);
        return response.json();
    },
    
    async createTask(title: string) {
        const response = await fetch(\`\${config.apiUrl}/tasks\`, {
            method: 'POST',
            body: JSON.stringify({ title })
        });
        return response.json();
    }
};

// ==== state ====
const taskMachine = createMachine({
    id: 'tasks',
    initial: 'loading',
    states: {
        loading: {
            invoke: {
                src: 'fetchTasks',
                onDone: 'ready',
                onError: 'error'
            }
        },
        ready: {
            on: {
                CREATE: 'creating'
            }
        },
        creating: {
            invoke: {
                src: 'createTask',
                onDone: 'ready',
                onError: 'error'
            }
        },
        error: {
            on: {
                RETRY: 'loading'
            }
        }
    }
});
                `.trim(),
      },
    ];
  }

  async runTests() {
    const results = [];

    for (const testCase of this.testCases) {
      const testResult = await this.runSingleTest(testCase);
      results.push(testResult);
    }

    const allPassed = results.every((result) => result.passed);

    return {
      status: allPassed ? 'pass' : 'fail',
      tests: results,
      summary: {
        total: results.length,
        passed: results.filter((r) => r.passed).length,
        failed: results.filter((r) => !r.passed).length,
      },
    };
  }

  async runSingleTest(testCase) {
    try {
      const result = await this.createHighlightedOutput(testCase.code);
      const validations = this.validateSectionHighlighting(result.content, testCase.code);
      const passed = validations.every((v) => v.passed);

      // Add debug info for failing tests
      let debugInfo = null;
      if (!passed) {
        debugInfo = this.generateDebugInfo(testCase, result);
      }

      return {
        name: testCase.name,
        passed,
        output: result.display,
        validations: validations.filter((v) => !v.passed),
        debugInfo,
      };
    } catch (error) {
      return {
        name: testCase.name,
        passed: false,
        error: error.message,
      };
    }
  }

  async createHighlightedOutput(code) {
    const container = document.createElement('div');
    const highlighter = document.createElement('syntax-highlighter');
    highlighter.textContent = code;
    highlighter.setAttribute('sections', 'true');
    container.appendChild(highlighter);

    // Append to body temporarily to ensure proper rendering
    document.body.appendChild(container);

    // Wait for highlighting to complete
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Get the shadow DOM content if available
    let highlightedContent = '';
    if (highlighter.shadowRoot) {
      const codeElement = highlighter.shadowRoot.querySelector('code, pre');
      if (codeElement) {
        highlightedContent = codeElement.innerHTML;
      } else {
        // Get all shadow root content
        highlightedContent = highlighter.shadowRoot.innerHTML;
      }
    }

    // For display purposes, keep the whole element
    const displayHtml = container.innerHTML;

    // Clean up
    document.body.removeChild(container);

    return {
      display: displayHtml,
      content: highlightedContent,
    };
  }

  validateSectionHighlighting(content, originalCode) {
    const validations = [];

    // Check if we got any content
    const hasContent = content && content.length > 0;
    validations.push({
      name: 'Content Extraction',
      passed: hasContent,
      issues: hasContent ? [] : ['No content extracted from shadow DOM'],
    });

    if (!hasContent) {
      return validations;
    }

    // Check for section markers in original code
    const sectionRegex = /\/\/ ==== (\w+) ====/g;
    const sections = [];
    let match = sectionRegex.exec(originalCode);
    while (match !== null) {
      sections.push(match[1]);
      match = sectionRegex.exec(originalCode);
    }

    // Check for section highlighting elements
    const hasSectionElements =
      content.includes('section-marker') ||
      content.includes('data-section') ||
      content.includes('class="section');

    validations.push({
      name: 'Section Markers',
      passed: hasSectionElements || sections.length === 0,
      issues:
        hasSectionElements || sections.length === 0
          ? []
          : [
              `Found ${sections.length} section markers (${sections.join(', ')}) but no section highlighting elements`,
            ],
    });

    // Check for highlighted spans (general syntax highlighting)
    const hasSpans = content.includes('<span');
    validations.push({
      name: 'Syntax Highlighting',
      passed: hasSpans,
      issues: hasSpans ? [] : ['No span elements found - syntax highlighting not applied'],
    });

    // Check for section headers
    const sectionHeaders = sections.filter(
      (section) => content.includes(section) || content.includes(`==== ${section} ====`)
    );

    validations.push({
      name: 'Section Headers Preserved',
      passed: sectionHeaders.length >= Math.min(2, sections.length),
      issues:
        sectionHeaders.length >= Math.min(2, sections.length)
          ? []
          : [`Only ${sectionHeaders.length} of ${sections.length} section headers found in output`],
    });

    // Check for CSS variables
    const hasThemeVars = content.includes('var(--');
    validations.push({
      name: 'Theme Variables',
      passed: hasThemeVars,
      issues: hasThemeVars ? [] : ['No CSS theme variables found'],
    });

    // Check for proper code structure preservation
    const hasCodeStructure =
      content.includes('import') || content.includes('const') || content.includes('function');

    validations.push({
      name: 'Code Structure',
      passed: hasCodeStructure,
      issues: hasCodeStructure ? [] : ['Code structure not preserved in output'],
    });

    return validations;
  }

  generateDebugInfo(testCase, result) {
    const escapeForDisplay = (str) =>
      str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    let debugInfo = `Test: ${testCase.name}\n`;
    debugInfo += `Raw Code Sample:\n${escapeForDisplay(testCase.code.substring(0, 200))}...\n\n`;
    debugInfo += `Highlighted Output Sample:\n${escapeForDisplay(result.content.substring(0, 300))}...\n\n`;

    // Check for section highlighting CSS
    debugInfo += 'Section Highlighting:\n';
    debugInfo += `  Contains --section-highlight: ${result.content.includes('--section-highlight') ? '✓ YES' : '✗ NO'}\n`;
    debugInfo += `  Contains --section-dim: ${result.content.includes('--section-dim') ? '✓ YES' : '✗ NO'}\n`;
    debugInfo += `  Has highlight-mode attribute: ${result.content.includes('highlight-mode') ? '✓ YES' : '✗ NO'}\n`;
    debugInfo += `  Has highlight-section attribute: ${result.content.includes('highlight-section') ? '✓ YES' : '✗ NO'}\n`;

    // Check for section markers in code
    debugInfo += '\nSection Markers in Code:\n';
    const sections = ['context', 'states', 'actions', 'guards', 'imports', 'machine'];
    sections.forEach((section) => {
      const hasMarker = testCase.code.includes(`==== ${section} ====`);
      debugInfo += `  ${section} marker: ${hasMarker ? '✓ YES' : '✗ NO'}\n`;
    });

    // Check if specific sections are being highlighted
    debugInfo += '\nSection Content Checks:\n';
    debugInfo += `  Context keyword highlighted: ${result.content.includes('context') && result.content.includes('--xstate-keyword') ? '✓ YES' : '✗ NO'}\n`;
    debugInfo += `  States keyword highlighted: ${result.content.includes('states') && result.content.includes('--xstate-config') ? '✓ YES' : '✗ NO'}\n`;
    debugInfo += `  Actions keyword highlighted: ${result.content.includes('actions') && result.content.includes('--xstate-config') ? '✓ YES' : '✗ NO'}\n`;

    return debugInfo;
  }
}

// Register the parser
window.V2TestParsers = window.V2TestParsers || {};
window.V2TestParsers.sections = new V2SectionsParser();
