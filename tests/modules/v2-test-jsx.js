// JSX/React syntax highlighting tests for V2

class V2JSXParser {
    constructor() {
        this.testCases = [
            {
                name: 'Basic JSX Elements',
                code: `
import React from 'react';

const Button = ({ onClick, children, variant = 'primary' }) => {
    return (
        <button 
            className={\`btn btn-\${variant}\`}
            onClick={onClick}
            disabled={false}
        >
            {children}
        </button>
    );
};

const App = () => {
    const [count, setCount] = React.useState(0);
    
    return (
        <div className="app">
            <h1>Counter: {count}</h1>
            <Button onClick={() => setCount(count + 1)}>
                Increment
            </Button>
        </div>
    );
};

export default App;
                `.trim()
            },
            {
                name: 'CoffeeShop UI Component',
                code: `
// In your React component - clean and simple!
const CoffeeShopUI = () => {
  const [state, send] = useMachine(customerMachine);
  
  return (
    <div>
      <h2>Customer: {state.value}</h2>
      
      {state.matches('browsing') && (
        <button onClick={() => send('ORDER')}>
          Order Coffee ☕
        </button>
      )}
      
      {state.matches('ordering') && (
        <button onClick={() => send('ORDER_CONFIRMED')}>
          Confirm Order ✓
        </button>
      )}
      
      {state.matches('paying') && (
        <button onClick={() => send('PAYMENT_COMPLETE')}>
          Complete Payment 💳
        </button>
      )}
      
      {state.matches('waiting') && (
        <div>
          <p>Waiting for coffee...</p>
          <button onClick={() => send('RECEIVE_COFFEE')}>
            Receive Coffee ☕
          </button>
        </div>
      )}
      
      {state.matches('enjoying') && (
        <p>☕ Enjoying coffee! (Will browse again soon...)</p>
      )}
    </div>
  );
};
                `.trim()
            },
            {
                name: 'JSX with Complex Expressions',
                code: `
const TodoList = ({ todos, filter }) => {
    const filteredTodos = todos.filter(todo => {
        switch (filter) {
            case 'active':
                return !todo.completed;
            case 'completed':
                return todo.completed;
            default:
                return true;
        }
    });

    return (
        <div className="todo-list">
            {filteredTodos.length === 0 ? (
                <p className="empty-state">No todos found</p>
            ) : (
                <ul>
                    {filteredTodos.map(todo => (
                        <li 
                            key={todo.id}
                            className={todo.completed ? 'completed' : 'active'}
                        >
                            <input 
                                type="checkbox"
                                checked={todo.completed}
                                onChange={() => toggleTodo(todo.id)}
                            />
                            <span>{todo.text}</span>
                            {todo.priority && (
                                <span className={\`priority-\${todo.priority}\`}>
                                    {todo.priority.toUpperCase()}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
                `.trim()
            },
            {
                name: 'JSX with Fragments and Portals',
                code: `
import React, { Fragment } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    
    return createPortal(
        <>
            <div className="modal-backdrop" onClick={onClose} />
            <div className="modal-content">
                {children}
            </div>
        </>,
        document.getElementById('modal-root')
    );
};

const DataDisplay = ({ items }) => (
    <>
        <h2>Data Items</h2>
        {items.map((item, index) => (
            <Fragment key={item.id}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
                {index < items.length - 1 && <hr />}
            </Fragment>
        ))}
    </>
);

// React.Fragment syntax
const List = ({ data }) => (
    <React.Fragment>
        {data.map(item => (
            <React.Fragment key={item.id}>
                <span>{item.name}</span>
                {item.description && <span> - {item.description}</span>}
            </React.Fragment>
        ))}
    </React.Fragment>
);
                `.trim()
            }
        ];
    }

    async runTests() {
        const results = [];
        
        for (const testCase of this.testCases) {
            const testResult = await this.runSingleTest(testCase);
            results.push(testResult);
        }

        const allPassed = results.every(result => result.passed);
        
        return {
            status: allPassed ? 'pass' : 'fail',
            tests: results,
            summary: {
                total: results.length,
                passed: results.filter(r => r.passed).length,
                failed: results.filter(r => !r.passed).length
            }
        };
    }

    async runSingleTest(testCase) {
        try {
            const result = await this.createHighlightedOutput(testCase.code);
            const validations = this.validateJSXHighlighting(result.content);
            const passed = validations.every(v => v.passed);
            
            // Add debug info for failing tests
            let debugInfo = null;
            if (!passed) {
                debugInfo = this.generateDebugInfo(testCase, result);
            }
            
            return {
                name: testCase.name,
                passed,
                output: result.display,
                validations: validations.filter(v => !v.passed),
                debugInfo
            };
        } catch (error) {
            return {
                name: testCase.name,
                passed: false,
                error: error.message
            };
        }
    }

    async createHighlightedOutput(code) {
        const container = document.createElement('div');
        const highlighter = document.createElement('syntax-highlighter');
        highlighter.setAttribute('language', 'jsx');
        highlighter.textContent = code;
        container.appendChild(highlighter);
        
        // Append to body temporarily to ensure proper rendering
        document.body.appendChild(container);
        
        // Wait for highlighting to complete
        await new Promise(resolve => setTimeout(resolve, 300));
        
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
        
        // Debug log
        console.log('JSX test - highlighted content sample:', highlightedContent.substring(0, 200) + '...');
        
        return {
            display: displayHtml,
            content: highlightedContent
        };
    }

    validateJSXHighlighting(content) {
        // Use JSX validator if available
        if (window.JSXValidator) {
            const validator = new window.JSXValidator();
            return validator.validateContent(content);
        }
        
        // Fallback to base validator
        if (window.BaseSyntaxValidator) {
            const validator = new window.BaseSyntaxValidator();
            return validator.validateContent(content);
        }
        
        // Minimal fallback
        console.warn('Validators not loaded, using minimal validation');
        return [{
            name: 'Content Extraction',
            passed: content && content.length > 0,
            issues: content ? [] : ['No content extracted from shadow DOM']
        }];
    }
    
    generateDebugInfo(testCase, result) {
        const escapeForDisplay = (str) => str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
            
        let debugInfo = `Test: ${testCase.name}\n`;
        debugInfo += `Language attribute: jsx\n`;
        debugInfo += `Raw Code Length: ${testCase.code.length} chars\n`;
        debugInfo += `Highlighted Output Length: ${result.content.length} chars\n\n`;
        
        debugInfo += `=== COPY THIS FOR ANALYSIS ===\n`;
        debugInfo += `Raw Code (first 300 chars):\n${escapeForDisplay(testCase.code.substring(0, 300))}...\n\n`;
        debugInfo += `Full Highlighted Output (first 500 chars):\n${escapeForDisplay(result.content.substring(0, 500))}...\n`;
        debugInfo += `=== END COPY ===\n\n`;
        
        // Check for JSX-specific CSS variables
        const jsxVars = ['--jsx-tag', '--jsx-bracket', '--jsx-attribute', 'jsxTag', 'jsxBracket', 'jsxAttribute'];
        debugInfo += `JSX CSS Variables Found:\n`;
        jsxVars.forEach(varName => {
            const found = result.content.includes(varName);
            debugInfo += `  ${varName}: ${found ? '✓ YES' : '✗ NO'}\n`;
        });
        
        // Check for specific JSX patterns
        debugInfo += `\nJSX Patterns in Output:\n`;
        debugInfo += `  Contains &lt;div: ${result.content.includes('&lt;div') ? '✓ YES' : '✗ NO'}\n`;
        debugInfo += `  Contains &lt;button: ${result.content.includes('&lt;button') ? '✓ YES' : '✗ NO'}\n`;
        debugInfo += `  Contains &lt;/div: ${result.content.includes('&lt;/div') ? '✓ YES' : '✗ NO'}\n`;
        debugInfo += `  Contains &lt;/button: ${result.content.includes('&lt;/button') ? '✓ YES' : '✗ NO'}\n`;
        debugInfo += `  Contains className: ${result.content.includes('className') ? '✓ YES' : '✗ NO'}\n`;
        debugInfo += `  Contains onClick: ${result.content.includes('onClick') ? '✓ YES' : '✗ NO'}\n`;
        
        // Count JSX elements
        const divMatches = (result.content.match(/&lt;div/g) || []).length;
        const buttonMatches = (result.content.match(/&lt;button/g) || []).length;
        const closingDivMatches = (result.content.match(/&lt;\/div/g) || []).length;
        const closingButtonMatches = (result.content.match(/&lt;\/button/g) || []).length;
        
        debugInfo += `\nJSX Element Counts:\n`;
        debugInfo += `  <div> tags: ${divMatches}\n`;
        debugInfo += `  </div> tags: ${closingDivMatches}\n`;
        debugInfo += `  <button> tags: ${buttonMatches}\n`;
        debugInfo += `  </button> tags: ${closingButtonMatches}\n`;
        
        // Check if elements are highlighted
        const highlightedDivs = (result.content.match(/style="[^"]*--jsx[^"]*"[^>]*&lt;div/g) || []).length;
        const highlightedButtons = (result.content.match(/style="[^"]*--jsx[^"]*"[^>]*&lt;button/g) || []).length;
        
        debugInfo += `\nHighlighted JSX Elements:\n`;
        debugInfo += `  Highlighted <div> tags: ${highlightedDivs}\n`;
        debugInfo += `  Highlighted <button> tags: ${highlightedButtons}\n`;
        
        // Find where JSX elements might be
        const firstDiv = result.content.indexOf('&lt;div');
        const firstButton = result.content.indexOf('&lt;button');
        
        if (firstDiv >= 0) {
            debugInfo += `\nFirst <div> found at position ${firstDiv}:\n`;
            debugInfo += escapeForDisplay(result.content.substring(Math.max(0, firstDiv - 50), firstDiv + 100)) + '\n';
        }
        
        if (firstButton >= 0) {
            debugInfo += `\nFirst <button> found at position ${firstButton}:\n`;
            debugInfo += escapeForDisplay(result.content.substring(Math.max(0, firstButton - 50), firstButton + 100)) + '\n';
        }
        
        // Add a section to copy the complete output for external analysis
        debugInfo += `\n=== COMPLETE OUTPUT FOR DEBUGGING ===\n`;
        debugInfo += `Copy and analyze this to see the actual highlighted output:\n`;
        debugInfo += `${escapeForDisplay(result.content.substring(0, Math.min(1000, result.content.length)))}\n`;
        if (result.content.length > 1000) {
            debugInfo += `... (truncated, total length: ${result.content.length} chars)\n`;
        }
        debugInfo += `=== END COMPLETE OUTPUT ===\n`;
        
        return debugInfo;
    }
}

// Register the parser
window.V2TestParsers = window.V2TestParsers || {};
window.V2TestParsers.jsx = new V2JSXParser();
console.log('V2 JSX Parser registered');