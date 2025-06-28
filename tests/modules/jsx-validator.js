// JSX/React-specific validator extending base validator
class JSXValidator extends window.BaseSyntaxValidator {
    validateContent(content) {
        // Run base validations first
        const baseValidations = super.validateContent(content);
        
        // Add JSX-specific validations
        if (content && content.length > 0) {
            this.validateJSXSpecific(content);
        }
        
        return this.validations;
    }
    
    validateJSXSpecific(content) {
        // SAFEGUARD: Check for JSX tag highlighting with proper CSS variables
        const hasJSXTagHighlighting = content.includes('--jsx-tag') || content.includes('jsxTag');
        const hasJSXBracketHighlighting = content.includes('--jsx-bracket') || content.includes('jsxBracket');
        const hasJSXAttributeHighlighting = content.includes('--jsx-attribute') || content.includes('jsxAttribute');
        
        this.addValidation('JSX Tag Highlighting',
            hasJSXTagHighlighting,
            hasJSXTagHighlighting ? [] : ['JSX tags are NOT being highlighted! Missing --jsx-tag CSS variable. This means matchJSX() is not working.']
        );
        
        this.addValidation('JSX Bracket Highlighting',
            hasJSXBracketHighlighting,
            hasJSXBracketHighlighting ? [] : ['JSX brackets (< >) are NOT being highlighted! Missing --jsx-bracket CSS variable.']
        );
        
        // SAFEGUARD: Check if JSX elements are actually highlighted as JSX, not just as regular text
        const jsxElementPattern = /<span[^>]*style="[^"]*var\(--jsx[^)]*\)"[^>]*>&lt;/;
        const hasProperJSXElements = jsxElementPattern.test(content);
        
        this.addValidation('JSX Elements Properly Highlighted',
            hasProperJSXElements,
            hasProperJSXElements ? [] : ['JSX elements (like <div>, <button>) are NOT highlighted as JSX! They are being treated as plain text.']
        );
        
        // Check for JSX tag detection
        const hasJSXTags = content.includes('&lt;') && content.includes('&gt;');
        
        this.addValidation('JSX Tag Detection',
            hasJSXTags,
            hasJSXTags ? [] : ['JSX tags not properly detected (should see &lt; and &gt;)']
        );
        
        // SAFEGUARD: Specifically check for common JSX patterns
        if (content.includes('&lt;div') || content.includes('&lt;button') || content.includes('&lt;span')) {
            const jsxPatternsHighlighted = content.includes('--jsx-') || content.includes('jsx');
            this.addValidation('JSX Pattern Recognition',
                jsxPatternsHighlighted,
                jsxPatternsHighlighted ? [] : ['Code contains JSX elements but they are NOT highlighted with JSX-specific styles!']
            );
        }
        
        // Check for React keywords
        const reactKeywords = ['React', 'useState', 'useEffect', 'import', 'export', 'return'];
        const keywordRegex = /<span[^>]*>(\w+)</g;
        const highlightedWords = [];
        let match;
        while ((match = keywordRegex.exec(content)) !== null) {
            highlightedWords.push(match[1]);
        }
        
        const foundKeywords = reactKeywords.filter(keyword => highlightedWords.includes(keyword));
        
        this.addValidation('React Keywords',
            foundKeywords.length >= 3,
            foundKeywords.length >= 3 ? [] : 
            [`Only ${foundKeywords.length} React keywords found. Expected: ${reactKeywords.join(', ')}`]
        );
        
        // Check for JSX attribute highlighting
        const jsxAttributes = ['className', 'onClick', 'onChange', 'key', 'ref'];
        const foundAttributes = jsxAttributes.filter(attr => content.includes(attr));
        
        this.addValidation('JSX Attributes',
            foundAttributes.length >= 1,
            foundAttributes.length >= 1 ? [] : 
            [`No JSX attributes found. Expected at least one of: ${jsxAttributes.join(', ')}`]
        );
        
        // SAFEGUARD: Check if attributes in JSX tags are highlighted
        if (foundAttributes.length > 0 && hasJSXAttributeHighlighting === false) {
            this.addValidation('JSX Attribute Highlighting Applied',
                false,
                ['JSX attributes exist but are NOT highlighted with --jsx-attribute CSS variable!']
            );
        }
        
        // Check for JSX expression highlighting
        const hasExpressions = content.includes('{') && content.includes('}');
        
        this.addValidation('JSX Expressions',
            hasExpressions,
            hasExpressions ? [] : ['JSX expressions {} not found in highlighted output']
        );
        
        // Check for React component highlighting
        const componentRegex = /<span[^>]*style="[^"]*--react-component[^"]*">/;
        const hasComponentHighlighting = componentRegex.test(content);
        
        if (content.includes('Component') || content.includes('Button') || content.includes('App')) {
            this.addValidation('React Component Highlighting',
                hasComponentHighlighting,
                hasComponentHighlighting ? [] : 
                ['React components should be highlighted with --react-component CSS variable']
            );
        }
        
        // Check for proper JSX structure
        const hasProperJSXStructure = !content.includes('&lt;/') || 
            (content.includes('&lt;') && content.includes('&gt;') && 
             !content.includes('lt;/') && !content.includes('gt;'));
        
        this.addValidation('JSX Structure Integrity',
            hasProperJSXStructure,
            hasProperJSXStructure ? [] : 
            ['JSX structure appears broken - check for malformed tags']
        );
        
        // SAFEGUARD: Final check - if we have JSX code but no JSX highlighting at all, FAIL
        const hasAnyJSXHighlighting = hasJSXTagHighlighting || hasJSXBracketHighlighting || hasJSXAttributeHighlighting;
        if (hasJSXTags && !hasAnyJSXHighlighting) {
            this.addValidation('Critical: JSX Highlighting System',
                false,
                ['CRITICAL FAILURE: Code contains JSX but NO JSX-specific highlighting is applied! The JSX parser is not working at all.']
            );
        }
    }
}

// Export for use in test modules
window.JSXValidator = JSXValidator;