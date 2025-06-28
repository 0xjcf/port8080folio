// Basic syntax highlighting tests for V2

// Load base validator
import('./base-validator.js').catch(err => console.error('Failed to load base validator:', err));

class V2BasicParser {
    constructor() {
        this.testCases = [
            {
                name: 'JavaScript Keywords & Control Flow',
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

for (let i = 0; i < count; i++) {
    if (i % 10 === 0) {
        continue;
    }
    console.log(i);
}

while (count > 0) {
    count--;
}

try {
    throw new Error('Test error');
} catch (error) {
    console.error(error);
} finally {
    console.log('Cleanup');
}
                `.trim()
            },
            {
                name: 'Functions & Arrow Functions',
                code: `
// Regular function
function add(a, b) {
    return a + b;
}

// Function expression
const multiply = function(x, y) {
    return x * y;
};

// Arrow functions
const divide = (a, b) => a / b;
const square = x => x * x;
const greet = () => 'Hello!';

// Arrow with block body
const calculate = (a, b) => {
    const sum = a + b;
    const product = a * b;
    return { sum, product };
};

// Async functions
async function fetchData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch failed:', error);
        throw error;
    }
}

// Async arrow
const fetchUser = async (id) => {
    const user = await db.users.findById(id);
    return user;
};

// Generator function
function* fibonacci() {
    let [a, b] = [0, 1];
    while (true) {
        yield a;
        [a, b] = [b, a + b];
    }
}
                `.trim()
            },
            {
                name: 'Classes & Objects',
                code: `
// ES6 Class
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
    
    get displayName() {
        return this.name.toUpperCase();
    }
    
    set displayName(value) {
        this.name = value.toLowerCase();
    }
}

// Class inheritance
class Button extends Component {
    constructor(name, onClick) {
        super(name);
        this.onClick = onClick;
    }
    
    render() {
        return \`<button>\${this.name}</button>\`;
    }
}

// Object literals
const config = {
    theme: 'dark',
    colors: {
        primary: '#0ea5e9',
        secondary: '#f472b6',
        background: '#1a1a1a'
    },
    // Method shorthand
    init() {
        console.log('Initializing...');
    },
    // Computed property
    ['dynamic' + 'Key']: 'value',
    // Getter
    get isValid() {
        return this.theme && this.colors;
    }
};

// Object destructuring
const { theme, colors: { primary } } = config;
const { init, ...rest } = config;
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
            const validations = this.validateHighlighting(result.content);
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
        console.log('Basic test - highlighted content sample:', highlightedContent.substring(0, 200) + '...');
        
        // Additional debug: Check for malformed HTML entities
        if (highlightedContent.includes('lt;') || highlightedContent.includes('gt;')) {
            console.warn('WARNING: Found incomplete HTML entities in output:', 
                highlightedContent.match(/[lg]t;[^&]*/g));
        }
        
        return {
            display: displayHtml,
            content: highlightedContent
        };
    }

    validateHighlighting(content) {
        // Use JavaScript validator if available
        if (window.JavaScriptValidator) {
            const validator = new window.JavaScriptValidator();
            return validator.validateContent(content);
        }
        
        // Fallback to base validator
        if (window.BaseSyntaxValidator) {
            const validator = new window.BaseSyntaxValidator();
            return validator.validateContent(content);
        }
        
        // Minimal fallback
        console.warn('Validators not loaded, using fallback validation');
        return this.fallbackValidation(content);
    }
    
    fallbackValidation(content) {
        // Minimal validation to ensure tests can run
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
        debugInfo += `Raw Code Sample:\n${escapeForDisplay(testCase.code.substring(0, 200))}...\n\n`;
        debugInfo += `Highlighted Output Sample:\n${escapeForDisplay(result.content.substring(0, 300))}...\n\n`;
        
        // Check for basic JavaScript CSS variables
        const jsVars = ['--keyword', '--string', '--number', '--function', '--operator', '--punctuation'];
        debugInfo += `JavaScript CSS Variables Found:\n`;
        jsVars.forEach(varName => {
            const found = result.content.includes(varName);
            debugInfo += `  ${varName}: ${found ? '✓ YES' : '✗ NO'}\n`;
        });
        
        // Check for specific patterns
        debugInfo += `\nCode Patterns:\n`;
        debugInfo += `  Contains function keyword: ${result.content.includes('function') ? '✓ YES' : '✗ NO'}\n`;
        debugInfo += `  Contains const/let/var: ${(result.content.includes('const') || result.content.includes('let') || result.content.includes('var')) ? '✓ YES' : '✗ NO'}\n`;
        debugInfo += `  Contains strings: ${(result.content.includes("'") || result.content.includes('"')) ? '✓ YES' : '✗ NO'}\n`;
        debugInfo += `  Has span elements: ${result.content.includes('<span') ? '✓ YES' : '✗ NO'}\n`;
        
        return debugInfo;
    }
}

// Register the parser
window.V2TestParsers = window.V2TestParsers || {};
window.V2TestParsers.basic = new V2BasicParser();
console.log('V2 Basic Parser registered');