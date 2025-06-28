import { extractHighlightedContent, createTestContainer, validateHighlighting, waitForHighlighting } from './test-helper.js';

export class BasicParser {
    constructor() {
        this.testCases = [
            {
                name: 'JavaScript Keywords',
                code: `
const message = 'Hello World';
let count = 42;
var isActive = true;
function greet(name) {
    return \`Hello \${name}!\`;
}
if (isActive) {
    console.log(message);
} else {
    console.log('Inactive');
}
                `.trim()
            },
            {
                name: 'JavaScript Functions',
                code: `
// Arrow functions
const add = (a, b) => a + b;
const multiply = (x, y) => {
    return x * y;
};

// Regular functions
function divide(a, b) {
    if (b === 0) {
        throw new Error('Division by zero');
    }
    return a / b;
}

// Async functions
async function fetchData() {
    try {
        const response = await fetch('/api/data');
        return await response.json();
    } catch (error) {
        console.error('Fetch failed:', error);
    }
}
                `.trim()
            },
            {
                name: 'Classes and Objects',
                code: `
class Component {
    constructor(name) {
        this.name = name;
        this._private = 'secret';
    }
    
    getName() {
        return this.name;
    }
    
    static create(name) {
        return new Component(name);
    }
}

const obj = {
    key: 'value',
    method() {
        return this.key;
    },
    arrow: () => 'arrow function'
};
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
                this.validateBasicTokens(outputs),
                this.validateKeywords(outputs),
                this.validateStrings(outputs),
                this.validateComments(outputs)
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

        // Test v2 syntax-highlighter (now using different element name)
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

    validateBasicTokens(outputs) {
        const checks = [];
        
        Object.entries(outputs).forEach(([version, html]) => {
            if (html.includes('Error:')) {
                checks.push({ version, issue: 'Component failed to render' });
                return;
            }
            
            // Use the helper to validate highlighting
            if (!validateHighlighting(html)) {
                checks.push({ version, issue: 'Invalid or missing syntax highlighting' });
            }
        });

        return {
            name: 'Basic Token Validation',
            passed: checks.length === 0,
            issues: checks
        };
    }

    validateKeywords(outputs) {
        const keywords = ['const', 'let', 'var', 'function', 'if', 'else', 'return'];
        const checks = [];
        
        Object.entries(outputs).forEach(([version, html]) => {
            if (html.includes('Error:')) return;
            
            keywords.forEach(keyword => {
                // Look for keyword wrapped in highlighting spans
                const keywordRegex = new RegExp(`<span[^>]*>${keyword}</span>`, 'i');
                if (!keywordRegex.test(html)) {
                    checks.push({ version, keyword, issue: 'Keyword not highlighted' });
                }
            });
        });

        return {
            name: 'Keyword Highlighting',
            passed: checks.length === 0,
            issues: checks
        };
    }

    validateStrings(outputs) {
        const checks = [];
        
        Object.entries(outputs).forEach(([version, html]) => {
            if (html.includes('Error:')) return;
            
            // Check for string highlighting
            const stringPatterns = [
                /'Hello World'/,
                /'secret'/,
                /'value'/
            ];
            
            stringPatterns.forEach((pattern, index) => {
                const stringRegex = new RegExp(`<span[^>]*>${pattern.source}</span>`, 'i');
                if (!stringRegex.test(html)) {
                    checks.push({ 
                        version, 
                        pattern: pattern.source, 
                        issue: 'String not highlighted' 
                    });
                }
            });
        });

        return {
            name: 'String Highlighting',
            passed: checks.length === 0,
            issues: checks
        };
    }

    validateComments(outputs) {
        const checks = [];
        
        Object.entries(outputs).forEach(([version, html]) => {
            if (html.includes('Error:')) return;
            
            // Check for comment highlighting
            const commentPatterns = [
                /\/\/ Arrow functions/,
                /\/\/ Regular functions/
            ];
            
            commentPatterns.forEach((pattern, index) => {
                const commentRegex = new RegExp(`<span[^>]*>${pattern.source}</span>`, 'i');
                if (!commentRegex.test(html)) {
                    checks.push({ 
                        version, 
                        pattern: pattern.source, 
                        issue: 'Comment not highlighted' 
                    });
                }
            });
        });

        return {
            name: 'Comment Highlighting',
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