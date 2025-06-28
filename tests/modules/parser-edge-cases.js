import { extractHighlightedContent, createTestContainer, validateHighlighting, waitForHighlighting } from './test-helper.js';

export class EdgeCasesParser {
    constructor() {
        this.testCases = [
            {
                name: 'Nested Template Literals',
                code: `
const complexTemplate = \`
    Hello \${user.name}!
    Your balance is \${currency} \${
        balance.toFixed(2)
    }.
    \${isVIP ? \`
        VIP Status: \${vipLevel}
        Benefits: \${benefits.map(b => \`
            - \${b.name}: \${b.description}
        \`).join('')}
    \` : 'Standard member'}
\`;

const nestedQuery = \`
    SELECT * FROM users 
    WHERE status = '\${status}' 
    AND created_at > '\${new Date(Date.now() - 86400000).toISOString()}'
    \${filters.length > 0 ? \`
        AND (\${filters.map(f => \`\${f.field} \${f.operator} '\${f.value}'\`).join(' OR ')})
    \` : ''}
\`;
                `.trim()
            },
            {
                name: 'Mixed Quotes and Escapes',
                code: `
const messyStrings = {
    singleQuoted: 'He said, "Hello \\'world\\'!" and left.',
    doubleQuoted: "She replied, 'Don\\'t go!' with tears.",
    templateLiteral: \`The file path is "C:\\\\Users\\\\John's Folder\\\\file.txt"\`,
    regexWithQuotes: /["']([^"'\\\\]|\\\\.)*["']/g,
    escaped: "This is a \\"quoted\\" string with \\n newlines and \\t tabs",
    unicode: "Unicode: \\u0041\\u0042\\u0043 and emojis: \\ud83d\\ude00\\ud83c\\udf89",
    mixedTemplate: \`
        'Single quotes' in template
        "Double quotes" in template
        \\\` Escaped backticks \\\`
        \${/* comment in expression */ 'nested string'}
    \`
};

const trickyRegex = {
    quotes: /"([^"\\\\]|\\\\.)*"/g,
    templates: /\\\`([^\\\`\\\\]|\\\\.)*\\\`/g,
    comments: /\\/\\*[\\s\\S]*?\\*\\//g,
    urls: /https?:\\/\\/[^\\s"'<>]+/g
};
                `.trim()
            },
            {
                name: 'Complex Object Patterns',
                code: `
const complexObject = {
    // Nested objects with various patterns
    user: {
        profile: {
            name: 'John "The Developer" Doe',
            bio: \`Full-stack developer with 10+ years experience.
                   Specializes in React, Node.js, and "cutting-edge" technologies.\`,
            contact: {
                email: 'john@example.com',
                phone: '+1-555-123-4567'
            }
        },
        preferences: {
            theme: 'dark',
            notifications: {
                email: true,
                push: false,
                sms: user?.settings?.allowSMS ?? false
            }
        }
    },
    
    // Complex array patterns
    data: [
        { id: 1, tags: ['urgent', 'bug-fix'], status: 'open' },
        { id: 2, tags: ['feature', 'enhancement'], status: 'closed' },
        ...otherItems.filter(item => item.active)
    ],
    
    // Method definitions with various syntaxes
    methods: {
        async fetchUser(id) {
            const response = await fetch(\`/api/users/\${id}\`);
            return response.json();
        },
        
        calculateTotal: (items) => items.reduce((sum, item) => sum + item.price, 0),
        
        processData(data, options = {}) {
            const { 
                sortBy = 'date', 
                filterBy = null,
                limit = 100 
            } = options;
            
            return data
                .filter(item => filterBy ? item[filterBy.field] === filterBy.value : true)
                .sort((a, b) => a[sortBy] - b[sortBy])
                .slice(0, limit);
        },
        
        ['computed' + 'Property']: function() {
            return 'dynamic method';
        }
    },
    
    // Getters and setters
    get fullName() {
        return \`\${this.user.profile.name}\`;
    },
    
    set theme(value) {
        this.user.preferences.theme = value;
        this.emit('themeChanged', value);
    }
};
                `.trim()
            },
            {
                name: 'Arrow Functions and Destructuring',
                code: `
// Complex arrow function patterns
const utilities = {
    // Simple arrow
    add: (a, b) => a + b,
    
    // Arrow with block
    processUsers: (users) => {
        return users
            .filter(({ active, role }) => active && role === 'admin')
            .map(({ id, name, email, ...rest }) => ({
                id,
                displayName: name.toUpperCase(),
                contact: email,
                metadata: rest
            }));
    },
    
    // Nested arrows with destructuring
    createReducer: (initialState) => (state = initialState, action) => {
        const { type, payload } = action;
        switch (type) {
            case 'UPDATE_USER':
                return {
                    ...state,
                    users: state.users.map(user => 
                        user.id === payload.id 
                            ? { ...user, ...payload.updates }
                            : user
                    )
                };
            default:
                return state;
        }
    },
    
    // Higher-order function patterns
    memoize: (fn) => {
        const cache = new Map();
        return (...args) => {
            const key = JSON.stringify(args);
            if (cache.has(key)) {
                return cache.get(key);
            }
            const result = fn(...args);
            cache.set(key, result);
            return result;
        };
    },
    
    // Async arrow functions
    fetchWithRetry: async (url, retries = 3) => {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
                return await response.json();
            } catch (error) {
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }
};

// Complex destructuring patterns
const {
    user: {
        profile: { name: userName, bio },
        preferences: { theme, notifications: { email: emailNotifs } }
    },
    data: [firstItem, ...remainingItems],
    methods: { fetchUser, calculateTotal }
} = complexObject;

// Array destructuring with defaults
const [primary, secondary = 'default', ...others] = someArray;

// Function parameter destructuring
const processRequest = ({
    url,
    method = 'GET',
    headers = {},
    body,
    timeout = 5000,
    ...options
}) => {
    return fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(timeout),
        ...options
    });
};
                `.trim()
            },
            {
                name: 'Comments and Mixed Content',
                code: `
/**
 * Complex comment patterns and mixed content
 * @param {Object} config - Configuration object
 * @param {string} config.apiUrl - The API base URL
 * @param {number} config.timeout - Request timeout in ms
 * @returns {Promise<Object>} API client instance
 */
function createApiClient(config) {
    /* 
     * Multi-line comment with various patterns:
     * - URLs: https://api.example.com/v1
     * - Code: const result = api.get('/users');
     * - Special chars: @#$%^&*()_+-={}[]|\\:";'<>?,./ 
     */
    
    const baseUrl = config.apiUrl; // Single line comment with code: fetch(url)
    
    return {
        // Method with inline comments
        async get(endpoint /* string */, options = {} /* RequestOptions */) {
            const url = \`\${baseUrl}\${endpoint}\`; /* Template with comment */
            
            try {
                // TODO: Add caching mechanism
                const response = await fetch(url, {
                    method: 'GET', // HTTP method
                    headers: {
                        'Accept': 'application/json', /* Content type */
                        ...options.headers // Spread additional headers
                    },
                    ...options /* Rest of options */
                });
                
                /* 
                 * FIXME: Handle different response types
                 * Currently only supports JSON
                 */
                return await response.json(); // Parse JSON response
            } catch (error) {
                // NOTE: Error handling could be improved
                console.error('API Error:', error); /* Log the error */
                throw error; // Re-throw for caller to handle
            }
        },
        
        // POST method with JSDoc comments
        /**
         * Creates a new resource
         * @param {string} endpoint - API endpoint
         * @param {Object} data - Data to send
         * @param {Object} [options] - Additional options
         */
        async post(endpoint, data, options = {}) {
            /* Validation comment */
            if (!data) throw new Error('Data is required'); // Inline validation
            
            const response = await fetch(\`\${baseUrl}\${endpoint}\`, {
                method: 'POST', /* HTTP method */
                headers: {
                    'Content-Type': 'application/json', // JSON content type
                    ...options.headers /* Additional headers */
                },
                body: JSON.stringify(data) // Serialize data
            });
            
            return response.json(); /* Return parsed response */
        }
    };
}

// Comment with code examples
/* 
Usage examples:
const api = createApiClient({ apiUrl: 'https://api.example.com' });
const users = await api.get('/users');
const newUser = await api.post('/users', { name: 'John' });
*/

// Commented out code blocks
/*
const oldImplementation = {
    fetchData: function(url) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.onload = () => resolve(xhr.responseText);
            xhr.onerror = () => reject(new Error('Request failed'));
            xhr.send();
        });
    }
};
*/

// TODO comments with various formats
// TODO: Implement error boundary
/* TODO: Add unit tests */
// FIXME: Memory leak in event listeners
/* HACK: Temporary workaround for Safari bug */
// NOTE: This approach is deprecated
/* WARNING: Do not modify this without updating docs */
                `.trim()
            },
            {
                name: 'XState Edge Cases',
                code: `
import { createMachine, assign } from 'xstate';

// Complex XState machine with edge cases
const edgeCaseMachine = createMachine({
    id: 'edgeCase',
    initial: 'state with spaces',
    context: {
        'key-with-dashes': 'value',
        'context.with.dots': 42,
        'context["with"]["brackets"]': true,
        nested: {
            'property-name': 'nested value',
            array: [1, 2, 3],
            computed: {
                get value() { return this.array.length; }
            }
        }
    },
    states: {
        'state with spaces': {
            on: {
                'EVENT-WITH-DASHES': 'another-state',
                'EVENT.WITH.DOTS': 'state.with.dots',
                'COMPLEX_EVENT': {
                    target: 'complex-target',
                    cond: (context) => context['key-with-dashes'] === 'value',
                    actions: [
                        assign({
                            'key-with-dashes': (context, event) => event.newValue
                        }),
                        'action-with-dashes',
                        /* Complex action with comment */
                        (context, event) => {
                            console.log(\`Processing event: \${event.type}\`);
                            // Handle special case
                            if (event.special) {
                                context.nested['property-name'] = 'updated';
                            }
                        }
                    ]
                }
            }
        },
        'another-state': {
            invoke: {
                id: 'service-with-dashes',
                src: (context, event) => {
                    return new Promise((resolve, reject) => {
                        setTimeout(() => {
                            if (context['context.with.dots'] > 0) {
                                resolve({ result: 'success' });
                            } else {
                                reject(new Error('Invalid context value'));
                            }
                        }, 1000);
                    });
                },
                onDone: {
                    target: 'success-state',
                    actions: assign({
                        'context.with.dots': (context, event) => event.data.result
                    })
                }
            }
        },
        'state.with.dots': {
            type: 'compound',
            initial: 'sub-state',
            states: {
                'sub-state': {
                    on: {
                        INTERNAL: {
                            target: 'another-sub-state',
                            internal: true
                        }
                    }
                },
                'another-sub-state': {
                    entry: [
                        'log-entry',
                        assign((context) => ({
                            ...context,
                            timestamp: new Date().toISOString()
                        }))
                    ],
                    exit: /* Exit action */ 'log-exit'
                }
            }
        },
        'complex-target': {
            after: {
                1000: [
                    {
                        target: 'timeout-state',
                        cond: 'timeout-guard'
                    },
                    {
                        target: 'default-timeout'
                    }
                ]
            }
        }
    }
}, {
    actions: {
        'action-with-dashes': (context, event) => {
            /* Action implementation */
            console.log('Executing action with dashes');
        },
        'log-entry': () => console.log('Entering state'),
        'log-exit': () => console.log('Exiting state')
    },
    guards: {
        'timeout-guard': (context) => {
            return context['context.with.dots'] > 10;
        }
    }
});

// Machine with template literal in configuration
const templateMachine = createMachine({
    id: 'template',
    context: {
        message: \`
            Multi-line template in context
            with "quotes" and 'apostrophes'
            and \${interpolation} expressions
        \`
    },
    states: {
        active: {
            on: {
                LOG: {
                    actions: (context, event) => {
                        console.log(\`
                            Current state: active
                            Message: \${context.message}
                            Event data: \${JSON.stringify(event.data)}
                        \`);
                    }
                }
            }
        }
    }
});
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
                this.validateStringHandling(outputs, testCase.name),
                this.validateCommentHandling(outputs, testCase.name),
                this.validateTemplateliterals(outputs, testCase.name),
                this.validateSpecialCharacters(outputs, testCase.name),
                this.validateRobustness(outputs, testCase.name)
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

        // Test v2 syntax-highlighter
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

    validateStringHandling(outputs, testName) {
        const checks = [];
        
        Object.entries(outputs).forEach(([version, html]) => {
            if (html.includes('Error:')) {
                checks.push({ version, issue: 'Highlighter failed to render' });
                return;
            }
            
            // Check for proper string highlighting with various quote types
            const stringPatterns = [
                /'[^']*'/,  // Single quotes
                /"[^"]*"/,  // Double quotes
                /`[^`]*`/   // Template literals
            ];
            
            // Ensure strings are properly highlighted
            const hasStringHighlighting = stringPatterns.some(pattern => {
                const matches = html.match(new RegExp(`<span[^>]*>${pattern.source}</span>`, 'g'));
                return matches && matches.length > 0;
            });
            
            if (!hasStringHighlighting && testName.includes('Quote')) {
                checks.push({ 
                    version, 
                    issue: 'String patterns not properly highlighted' 
                });
            }
        });

        return {
            name: 'String Handling',
            passed: checks.length === 0,
            issues: checks
        };
    }

    validateCommentHandling(outputs, testName) {
        const checks = [];
        
        Object.entries(outputs).forEach(([version, html]) => {
            if (html.includes('Error:')) return;
            
            if (testName.includes('Comment')) {
                // Check for comment highlighting
                const commentPatterns = [
                    /\/\*[\s\S]*?\*\//,  // Multi-line comments
                    /\/\/.*$/m           // Single-line comments
                ];
                
                const hasCommentHighlighting = commentPatterns.some(pattern => {
                    return html.includes('/*') || html.includes('//');
                });
                
                if (!hasCommentHighlighting) {
                    checks.push({ 
                        version, 
                        issue: 'Comment patterns not found in output' 
                    });
                }
            }
        });

        return {
            name: 'Comment Handling',
            passed: checks.length === 0,
            issues: checks
        };
    }

    validateTemplateIterals(outputs, testName) {
        const checks = [];
        
        Object.entries(outputs).forEach(([version, html]) => {
            if (html.includes('Error:')) return;
            
            if (testName.includes('Template')) {
                // Check for template literal highlighting
                const hasTemplateMarkers = html.includes('`') || html.includes('&grave;');
                
                if (!hasTemplateMarkers) {
                    checks.push({ 
                        version, 
                        issue: 'Template literal markers not found' 
                    });
                }
                
                // Check for expression highlighting within templates
                const hasExpressionMarkers = html.includes('${') || html.includes('&#36;{');
                
                if (!hasExpressionMarkers && testName.includes('Nested')) {
                    checks.push({ 
                        version, 
                        issue: 'Template expressions not highlighted' 
                    });
                }
            }
        });

        return {
            name: 'Template Literals',
            passed: checks.length === 0,
            issues: checks
        };
    }

    validateSpecialCharacters(outputs, testName) {
        const checks = [];
        
        Object.entries(outputs).forEach(([version, html]) => {
            if (html.includes('Error:')) return;
            
            // Check that special characters are properly escaped
            const specialChars = ['<', '>', '&'];
            
            specialChars.forEach(char => {
                // Raw special characters should be escaped in HTML output
                if (html.includes(char) && !html.includes(`&${char === '<' ? 'lt' : char === '>' ? 'gt' : 'amp'};`)) {
                    // This might be intentional, so only flag as warning for certain patterns
                    if (html.split(char).length > 3) { // Multiple occurrences
                        checks.push({ 
                            version, 
                            character: char, 
                            issue: 'Special character might not be properly escaped' 
                        });
                    }
                }
            });
        });

        return {
            name: 'Special Characters',
            passed: checks.length === 0,
            issues: checks
        };
    }

    validateRobustness(outputs, testName) {
        const checks = [];
        
        Object.entries(outputs).forEach(([version, html]) => {
            if (html.includes('Error:')) {
                checks.push({ version, issue: 'Highlighter crashed on edge case' });
                return;
            }
            
            // Check that output contains reasonable amount of highlighting
            const spanCount = (html.match(/<span/g) || []).length;
            const totalLength = html.length;
            
            // Should have some highlighting spans for complex code
            if (spanCount === 0 && totalLength > 100) {
                checks.push({ 
                    version, 
                    issue: 'No highlighting spans found in complex code' 
                });
            }
            
            // Check for balanced tags
            const openSpans = (html.match(/<span/g) || []).length;
            const closeSpans = (html.match(/<\/span>/g) || []).length;
            
            if (openSpans !== closeSpans) {
                checks.push({ 
                    version, 
                    issue: `Unbalanced span tags: ${openSpans} open, ${closeSpans} close` 
                });
            }
            
            // Check for malformed HTML
            const malformedPatterns = [
                /<span[^>]*>[^<]*<span/,  // Nested spans without closing
                /<\/span>[^<]*<\/span>/   // Multiple closings
            ];
            
            malformedPatterns.forEach((pattern, index) => {
                if (pattern.test(html)) {
                    checks.push({ 
                        version, 
                        issue: `Potentially malformed HTML detected (pattern ${index + 1})` 
                    });
                }
            });
        });

        return {
            name: 'Robustness',
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