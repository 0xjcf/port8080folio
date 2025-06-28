import { extractHighlightedContent, createTestContainer, validateHighlighting, waitForHighlighting } from './test-helper.js';

export class JSXParser {
    constructor() {
        this.testCases = [
            {
                name: 'React Component with JSX',
                code: `
import React, { useState, useEffect } from 'react';

function Counter({ initialValue = 0 }) {
    const [count, setCount] = useState(initialValue);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        console.log(\`Count changed to: \${count}\`);
    }, [count]);

    const handleIncrement = () => {
        setCount(prev => prev + 1);
    };

    return (
        <div className="counter-container">
            <h2>Current Count: {count}</h2>
            <button 
                onClick={handleIncrement}
                disabled={!isActive}
                style={{ 
                    backgroundColor: isActive ? '#007bff' : '#ccc',
                    color: 'white' 
                }}
            >
                Increment
            </button>
            <button onClick={() => setIsActive(!isActive)}>
                {isActive ? 'Disable' : 'Enable'}
            </button>
        </div>
    );
}

export default Counter;
                `.trim()
            },
            {
                name: 'JSX with Complex Expressions',
                code: `
const TodoList = ({ todos, onToggle, onDelete }) => {
    const completedCount = todos.filter(todo => todo.completed).length;
    const remainingCount = todos.length - completedCount;

    return (
        <div className="todo-list">
            <header>
                <h1>Todo App</h1>
                <p>
                    {remainingCount} remaining, {completedCount} completed
                </p>
            </header>
            
            <ul className="todo-items">
                {todos.map(todo => (
                    <li 
                        key={todo.id}
                        className={\`todo-item \${todo.completed ? 'completed' : ''}\`}
                    >
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => onToggle(todo.id)}
                        />
                        <span className="todo-text">
                            {todo.text}
                        </span>
                        <button 
                            onClick={() => onDelete(todo.id)}
                            aria-label={\`Delete \${todo.text}\`}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
            
            {todos.length === 0 && (
                <p className="empty-state">No todos yet!</p>
            )}
        </div>
    );
};
                `.trim()
            },
            {
                name: 'JSX with React Hooks and State Management',
                code: `
import { useReducer, useCallback, useMemo } from 'react';

const todoReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_TODO':
            return [...state, {
                id: Date.now(),
                text: action.text,
                completed: false
            }];
        case 'TOGGLE_TODO':
            return state.map(todo =>
                todo.id === action.id 
                    ? { ...todo, completed: !todo.completed }
                    : todo
            );
        case 'DELETE_TODO':
            return state.filter(todo => todo.id !== action.id);
        default:
            return state;
    }
};

function TodoApp() {
    const [todos, dispatch] = useReducer(todoReducer, []);
    const [newTodo, setNewTodo] = useState('');

    const addTodo = useCallback((text) => {
        if (text.trim()) {
            dispatch({ type: 'ADD_TODO', text });
            setNewTodo('');
        }
    }, []);

    const toggleTodo = useCallback((id) => {
        dispatch({ type: 'TOGGLE_TODO', id });
    }, []);

    const deleteTodo = useCallback((id) => {
        dispatch({ type: 'DELETE_TODO', id });
    }, []);

    const todoStats = useMemo(() => ({
        total: todos.length,
        completed: todos.filter(t => t.completed).length,
        remaining: todos.filter(t => !t.completed).length
    }), [todos]);

    return (
        <div className="app">
            <form onSubmit={(e) => {
                e.preventDefault();
                addTodo(newTodo);
            }}>
                <input
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="What needs to be done?"
                    className="new-todo-input"
                />
                <button type="submit">Add Todo</button>
            </form>
            
            <TodoList 
                todos={todos}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
            />
            
            <footer className="stats">
                Total: {todoStats.total} | 
                Completed: {todoStats.completed} | 
                Remaining: {todoStats.remaining}
            </footer>
        </div>
    );
}
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
            const outputs = await this.testAllHighlighters(testCase.code);
            
            const validations = [
                this.validateJSXTags(outputs),
                this.validateJSXAttributes(outputs),
                this.validateJSXExpressions(outputs),
                this.validateReactHooks(outputs),
                this.validateJSXComponents(outputs)
            ];

            const passed = validations.every(v => v.passed);
            
            return {
                name: testCase.name,
                passed,
                output: this.generateComparisonHTML(outputs),
                validations: validations.filter(v => !v.passed)
            };
        } catch (error) {
            return {
                name: testCase.name,
                passed: false,
                error: error.message
            };
        }
    }

    async testAllHighlighters(code) {
        const outputs = {};
        
        // Wait for highlighters to be loaded
        if (window.highlightersLoaded) {
            await window.highlightersLoaded;
        }
        
        // Test original syntax-highlighter
        try {
            const originalEl = document.createElement('syntax-highlighter');
            originalEl.textContent = code;
            document.body.appendChild(originalEl);
            await waitForHighlighting(originalEl);
            outputs.original = extractHighlightedContent(originalEl);
            document.body.removeChild(originalEl);
        } catch (error) {
            outputs.original = `Error: ${error.message}`;
        }

        // Test v2 syntax-highlighter (should have best JSX support)
        try {
            const v2El = document.createElement('syntax-highlighter-v2');
            v2El.textContent = code;
            document.body.appendChild(v2El);
            await waitForHighlighting(v2El);
            outputs.v2 = extractHighlightedContent(v2El);
            document.body.removeChild(v2El);
        } catch (error) {
            outputs.v2 = `Error: ${error.message}`;
        }

        // Test code-highlight
        try {
            const simpleEl = document.createElement('code-highlight');
            simpleEl.textContent = code;
            document.body.appendChild(simpleEl);
            await waitForHighlighting(simpleEl);
            outputs.simple = extractHighlightedContent(simpleEl);
            document.body.removeChild(simpleEl);
        } catch (error) {
            outputs.simple = `Error: ${error.message}`;
        }

        return outputs;
    }

    validateJSXTags(outputs) {
        const jsxTags = ['div', 'button', 'span', 'input', 'form', 'ul', 'li', 'h1', 'h2', 'p', 'header', 'footer'];
        const checks = [];
        
        Object.entries(outputs).forEach(([version, html]) => {
            if (html.includes('Error:')) return;
            
            jsxTags.forEach(tag => {
                // Look for JSX tags with proper highlighting
                const openTagRegex = new RegExp(`<span[^>]*>&lt;${tag}[^&]*&gt;</span>`, 'i');
                const closeTagRegex = new RegExp(`<span[^>]*>&lt;/${tag}&gt;</span>`, 'i');
                
                if (!openTagRegex.test(html) && !closeTagRegex.test(html)) {
                    checks.push({ version, tag, issue: 'JSX tag not highlighted' });
                }
            });
        });

        return {
            name: 'JSX Tags',
            passed: checks.length === 0,
            issues: checks
        };
    }

    validateJSXAttributes(outputs) {
        const jsxAttributes = [
            'className', 'onClick', 'onChange', 'onSubmit', 'disabled', 
            'style', 'type', 'checked', 'value', 'placeholder', 'key'
        ];
        const checks = [];
        
        Object.entries(outputs).forEach(([version, html]) => {
            if (html.includes('Error:')) return;
            
            jsxAttributes.forEach(attr => {
                // Look for JSX attributes with proper highlighting
                const attrRegex = new RegExp(`<span[^>]*>${attr}</span>`, 'i');
                if (!attrRegex.test(html)) {
                    checks.push({ version, attribute: attr, issue: 'JSX attribute not highlighted' });
                }
            });
        });

        return {
            name: 'JSX Attributes',
            passed: checks.length === 0,
            issues: checks
        };
    }

    validateJSXExpressions(outputs) {
        const checks = [];
        
        Object.entries(outputs).forEach(([version, html]) => {
            if (html.includes('Error:')) return;
            
            // Look for JSX expressions (curly braces with content)
            const expressionPatterns = [
                /\{count\}/,
                /\{todo\.text\}/,
                /\{todo\.id\}/,
                /\{isActive \? 'Disable' : 'Enable'\}/
            ];
            
            expressionPatterns.forEach((pattern, index) => {
                // JSX expressions should be highlighted differently from regular braces
                const found = html.includes(pattern.source.replace(/[{}]/g, '')) || 
                             html.includes(pattern.source);
                
                if (!found) {
                    checks.push({ 
                        version, 
                        pattern: pattern.source, 
                        issue: 'JSX expression not found/highlighted' 
                    });
                }
            });
        });

        return {
            name: 'JSX Expressions',
            passed: checks.length === 0,
            issues: checks
        };
    }

    validateReactHooks(outputs) {
        const reactHooks = [
            'useState', 'useEffect', 'useCallback', 'useMemo', 'useReducer'
        ];
        const checks = [];
        
        Object.entries(outputs).forEach(([version, html]) => {
            if (html.includes('Error:')) return;
            
            reactHooks.forEach(hook => {
                // Look for React hooks with proper highlighting
                const hookRegex = new RegExp(`<span[^>]*>${hook}</span>`, 'i');
                if (!hookRegex.test(html)) {
                    checks.push({ version, hook, issue: 'React hook not highlighted' });
                }
            });
        });

        return {
            name: 'React Hooks',
            passed: checks.length === 0,
            issues: checks
        };
    }

    validateJSXComponents(outputs) {
        const components = ['Counter', 'TodoList', 'TodoApp'];
        const checks = [];
        
        Object.entries(outputs).forEach(([version, html]) => {
            if (html.includes('Error:')) return;
            
            components.forEach(component => {
                // Look for component names with proper highlighting
                const componentRegex = new RegExp(`<span[^>]*>${component}</span>`, 'i');
                if (!componentRegex.test(html)) {
                    checks.push({ version, component, issue: 'React component not highlighted' });
                }
            });
        });

        return {
            name: 'React Components',
            passed: checks.length === 0,
            issues: checks
        };
    }

    generateComparisonHTML(outputs) {
        // Return just the three columns without headers (headers are in the parent grid)
        return `
            <div class="highlighter-output">
                ${createTestContainer(outputs.original || 'No output')}
            </div>
            <div class="highlighter-output">
                ${createTestContainer(outputs.v2 || 'No output')}
            </div>
            <div class="highlighter-output">
                ${createTestContainer(outputs.simple || 'No output')}
            </div>
        `;
    }
}