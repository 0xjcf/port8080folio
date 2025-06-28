// Edge case tests for V2 syntax highlighter

class V2EdgeCasesParser {
    constructor() {
        this.testCases = [
            {
                name: 'Nested Template Literals',
                code: `
const complexTemplate = \`
    User: \${user.name}
    Balance: $\${account.balance.toFixed(2)}
    Status: \${isActive ? \`Active since \${startDate}\` : 'Inactive'}
    Nested: \${items.map(item => \`
        - \${item.name}: \${item.value}
        \${item.children ? \`
            Children: \${item.children.join(', ')}
        \` : ''}
    \`).join('\\n')}
\`;

const sqlQuery = \`
    SELECT * FROM users 
    WHERE status = '\${status}' 
    AND created_at > '\${date.toISOString()}'
    \${filters.length > 0 ? \`
        AND (\${filters.map(f => \`\${f.field} = '\${f.value}'\`).join(' OR ')})
    \` : ''}
\`;
                `.trim()
            },
            {
                name: 'Mixed Quotes and Escapes',
                code: `
const quotes = {
    single: 'He said, "Hello world!"',
    double: "She replied, 'Don\\'t go!'",
    backtick: \`Path: "C:\\\\Users\\\\John's Documents\\\\file.txt"\`,
    mixed: 'This is a "quoted" string with \\'nested\\' quotes',
    escaped: "Line 1\\nLine 2\\tTabbed\\r\\nWindows style",
    unicode: "Unicode: \\u0041\\u0042\\u0043 Emoji: \\ud83d\\ude00",
    raw: String.raw\`C:\\Users\\Documents\\file.txt\`,
    regex: /["']([^"'\\\\]|\\\\.)*["']/g,
    complexRegex: /(?:(?:https?|ftp):\\/\\/)(?:\\S+(?::\\S*)?@)?(?:(?!10(?:\\.\\d{1,3}){3})/g
};

// Edge case with quotes in comments
/* This is a "comment" with 'quotes' and \`backticks\` */
// Another comment with "quotes" and special chars: \${}

const jsx = (
    <div title="A \\"quoted\\" attribute" data-value='Single quotes'>
        {"String in JSX expression"}
        {'Another string with "quotes"'}
        {\`Template in JSX: \${value}\`}
    </div>
);
                `.trim()
            },
            {
                name: 'Complex Object Destructuring',
                code: `
// Nested destructuring with defaults and renaming
const {
    user: {
        profile: {
            name: userName = 'Anonymous',
            email,
            preferences: {
                theme = 'dark',
                notifications: {
                    email: emailNotifs = true,
                    push: pushNotifs = false
                } = {}
            } = {}
        } = {},
        settings: userSettings
    } = {},
    system: {
        config: systemConfig = defaultConfig,
        ...systemRest
    } = {},
    ...rest
} = complexData;

// Array destructuring with nested patterns
const [
    first,
    second = 'default',
    [nested1, nested2] = [],
    ...remaining
] = someArray;

// Function parameter destructuring
function processData({
    data: {
        items = [],
        total = 0,
        page: currentPage = 1
    } = {},
    options: {
        filter = null,
        sort: {
            field = 'id',
            order = 'asc'
        } = {}
    } = {},
    ...extraParams
} = {}) {
    console.log({ items, total, currentPage, filter, field, order, extraParams });
}

// Complex arrow function destructuring
const transform = ({
    input: { value, ...inputRest },
    config: { mode = 'default', ...configRest } = {}
}) => ({
    result: value * 2,
    metadata: { mode, ...inputRest, ...configRest }
});
                `.trim()
            },
            {
                name: 'XState with Special Characters',
                code: `
const machine = createMachine({
    id: 'special-chars-machine',
    initial: 'state.with.dots',
    context: {
        'key-with-dashes': 'value',
        'context.with.dots': true,
        'special!@#$%': 123,
        'spaces in key': 'allowed',
        ['computed' + 'Key']: 'dynamic'
    },
    states: {
        'state.with.dots': {
            on: {
                'EVENT-WITH-DASHES': 'another-state',
                'EVENT.WITH.DOTS': 'state-2',
                'EVENT WITH SPACES': '#special-chars-machine.final',
                '*': 'wildcard-transition'
            }
        },
        'another-state': {
            entry: assign({
                'key-with-dashes': (context, event) => event.value
            }),
            invoke: {
                id: 'service-with-dashes',
                src: 'service.with.dots',
                onDone: {
                    target: 'state-2',
                    actions: assign({
                        'context.with.dots': false
                    })
                }
            }
        },
        'state-2': {
            always: [
                {
                    target: 'final',
                    cond: (context) => context['key-with-dashes'] === 'done'
                }
            ]
        },
        'wildcard-transition': {
            type: 'history',
            history: 'deep'
        },
        final: {
            type: 'final'
        }
    }
}, {
    guards: {
        'guard-with-dashes': (context) => true,
        'guard.with.dots': (context) => context['context.with.dots']
    },
    actions: {
        'action-with-dashes': () => console.log('Action executed'),
        'action.with.dots': assign({
            'special!@#$%': 456
        })
    }
});
                `.trim()
            },
            {
                name: 'Comments in Tricky Places',
                code: `
// Function with comments in various positions
function example(
    param1, // inline comment
    /* block comment */ param2,
    param3 /* another block */,
    // comment before param
    param4
) /* comment after params */ {
    return /* inline return comment */ {
        // Comment in object
        key: /* before value */ 'value' /* after value */,
        method(/* comment in params */) /* comment before brace */ {
            // Method body
        } /* comment after method */
    }; /* comment after return */
} /* comment after function */

// JSX with comments
const jsx = (
    <div
        // Comment in JSX
        className="test"
        /* Block comment in JSX */
        onClick={/* comment in expression */ () => {}}
    >
        {/* Comment in JSX children */}
        <span>{/* comment before */ value /* comment after */}</span>
        {
            // Comment in JSX expression
            items.map(item => (
                <div key={item.id}>{item.name}</div>
            ))
        }
    </div>
);

// Regex with comment-like patterns
const regex1 = /\/\/ not a comment/g;
const regex2 = /\/\* also not a comment \*\//;
const url = "https://example.com/path"; // This is a comment
const notComment = "// This is a string, not a comment";
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
            const validations = this.validateHighlighting(result.content, testCase.name);
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
        
        return {
            display: displayHtml,
            content: highlightedContent
        };
    }

    validateHighlighting(content, testName) {
        // Use edge cases validator if available
        if (window.EdgeCasesValidator) {
            const validator = new window.EdgeCasesValidator();
            return validator.validateContent(content, testName);
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
    
    validateEdgeCasesOld(content, testName) {
        const validations = [];
        
        // Check if we got any content
        const hasContent = content && content.length > 0;
        validations.push({
            name: 'Content Extraction',
            passed: hasContent,
            issues: hasContent ? [] : ['No content extracted from shadow DOM']
        });
        
        if (!hasContent) {
            return validations;
        }
        
        // Check that highlighting was applied
        const hasSpans = content.includes('<span');
        validations.push({
            name: 'Syntax Highlighting Applied',
            passed: hasSpans,
            issues: hasSpans ? [] : ['No span elements found - syntax highlighting not applied']
        });
        
        // Check for CSS variables (theme support)
        const hasThemeVars = content.includes('var(--');
        validations.push({
            name: 'Theme Variables',
            passed: hasThemeVars,
            issues: hasThemeVars ? [] : ['No CSS theme variables found']
        });
        
        // Test-specific validations
        if (testName.includes('Template Literals')) {
            // Check for proper template literal handling
            const hasTemplateLiterals = content.includes('`') || content.includes('${');
            validations.push({
                name: 'Template Literal Handling',
                passed: hasTemplateLiterals,
                issues: hasTemplateLiterals ? [] : ['Template literals not properly highlighted']
            });
        }
        
        if (testName.includes('Quotes')) {
            // Check for proper quote handling - no unescaped script tags
            const hasNoScriptInjection = !content.includes('<script') && !content.includes('</script');
            validations.push({
                name: 'XSS Prevention',
                passed: hasNoScriptInjection,
                issues: hasNoScriptInjection ? [] : ['Potential XSS vulnerability - script tags not escaped']
            });
            
            // Check that quotes are highlighted
            const quotesInSpans = /<span[^>]*>['"`][^<]*['"`]<\/span>/.test(content) ||
                                 /<span[^>]*>[^<]*['"`][^<]*<\/span>/.test(content);
            validations.push({
                name: 'Quote Highlighting',
                passed: quotesInSpans,
                issues: quotesInSpans ? [] : ['Quotes not properly highlighted in spans']
            });
        }
        
        if (testName.includes('Destructuring')) {
            // Check for object/array destructuring patterns
            const hasDestructuring = content.includes('{') && content.includes('}') && 
                                    content.includes('[') && content.includes(']');
            validations.push({
                name: 'Destructuring Syntax',
                passed: hasDestructuring,
                issues: hasDestructuring ? [] : ['Destructuring patterns not found']
            });
        }
        
        if (testName.includes('XState')) {
            // Check for XState-specific highlighting
            const hasXStateKeywords = content.includes('createMachine') || 
                                     content.includes('context') || 
                                     content.includes('states');
            validations.push({
                name: 'XState Keywords',
                passed: hasXStateKeywords,
                issues: hasXStateKeywords ? [] : ['XState keywords not found in output']
            });
        }
        
        if (testName.includes('Comments')) {
            // Check for comment highlighting
            const hasComments = content.includes('//') || content.includes('/*') || content.includes('*/');
            validations.push({
                name: 'Comment Detection',
                passed: hasComments,
                issues: hasComments ? [] : ['Comments not found in highlighted output']
            });
        }
        
        return validations;
    }
    
    generateDebugInfo(testCase, result) {
        const escapeForDisplay = (str) => str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
            
        let debugInfo = `Test: ${testCase.name}\n`;
        debugInfo += `Raw Code Sample:\n${escapeForDisplay(testCase.code.substring(0, 200))}...\n\n`;
        debugInfo += `Highlighted Output Sample:\n${escapeForDisplay(result.content.substring(0, 300))}...\n\n`;
        
        // Check for edge case specific patterns based on test name
        debugInfo += `Edge Case Patterns:\n`;
        
        if (testCase.name.includes('Template')) {
            debugInfo += `  Contains template literals: ${result.content.includes('`') ? '✓ YES' : '✗ NO'}\n`;
            debugInfo += `  Contains ${}: ${result.content.includes('${') ? '✓ YES' : '✗ NO'}\n`;
            debugInfo += `  Nested templates handled: ${result.content.includes('templateLiteral') ? '✓ YES' : '✗ NO'}\n`;
        }
        
        if (testCase.name.includes('Quotes')) {
            debugInfo += `  Single quotes: ${result.content.includes("'") ? '✓ YES' : '✗ NO'}\n`;
            debugInfo += `  Double quotes: ${result.content.includes('"') ? '✓ YES' : '✗ NO'}\n`;
            debugInfo += `  Escaped quotes: ${result.content.includes("\\'") || result.content.includes('\\"') ? '✓ YES' : '✗ NO'}\n`;
            debugInfo += `  No script injection: ${!result.content.includes('<script') ? '✓ YES' : '✗ NO'}\n`;
        }
        
        if (testCase.name.includes('Destructuring')) {
            debugInfo += `  Object destructuring {}: ${result.content.includes('{') && result.content.includes('}') ? '✓ YES' : '✗ NO'}\n`;
            debugInfo += `  Array destructuring []: ${result.content.includes('[') && result.content.includes(']') ? '✓ YES' : '✗ NO'}\n`;
            debugInfo += `  Spread operator ...: ${result.content.includes('...') ? '✓ YES' : '✗ NO'}\n`;
        }
        
        if (testCase.name.includes('XState')) {
            debugInfo += `  Special characters in keys: ${result.content.includes('-') || result.content.includes('.') ? '✓ YES' : '✗ NO'}\n`;
            debugInfo += `  XState patterns highlighted: ${result.content.includes('--xstate') ? '✓ YES' : '✗ NO'}\n`;
        }
        
        if (testCase.name.includes('Comments')) {
            debugInfo += `  Line comments //: ${result.content.includes('//') ? '✓ YES' : '✗ NO'}\n`;
            debugInfo += `  Block comments /* */: ${result.content.includes('/*') && result.content.includes('*/') ? '✓ YES' : '✗ NO'}\n`;
            debugInfo += `  JSX comments {/* */}: ${result.content.includes('{/*') ? '✓ YES' : '✗ NO'}\n`;
        }
        
        // General checks
        debugInfo += `\nGeneral Checks:\n`;
        debugInfo += `  Has highlighting spans: ${result.content.includes('<span') ? '✓ YES' : '✗ NO'}\n`;
        debugInfo += `  Has CSS variables: ${result.content.includes('var(--') ? '✓ YES' : '✗ NO'}\n`;
        debugInfo += `  HTML entities escaped: ${result.content.includes('&lt;') || result.content.includes('&gt;') ? '✓ YES' : '✗ NO'}\n`;
        
        return debugInfo;
    }
}

// Register the parser
window.V2TestParsers = window.V2TestParsers || {};
window.V2TestParsers['edge-cases'] = new V2EdgeCasesParser();
console.log('v2-test-edge-cases registered');
