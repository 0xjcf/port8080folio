// JavaScript-specific validator extending base validator
class JavaScriptValidator extends window.BaseSyntaxValidator {
    validateContent(content) {
        // Run base validations first
        super.validateContent(content);
        
        // Add JavaScript-specific validations
        if (content && content.length > 0) {
            this.validateJavaScriptSpecific(content);
        }
        
        return this.validations;
    }
    
    validateJavaScriptSpecific(content) {
        // Check for proper theme support with JS-specific tokens
        this.validateJavaScriptThemeSupport(content);
        
        // Check for proper token categorization
        this.validateJavaScriptTokens(content);
        
        // Check highlighting density
        this.validateHighlightingCoverage(content);
    }
    
    validateJavaScriptThemeSupport(content) {
        const cssVarMatches = content.match(/var\(--[\w-]+\)/g) || [];
        const uniqueCssVars = [...new Set(cssVarMatches)];
        const hasThemeSupport = uniqueCssVars.length >= 3;
        
        this.addValidation('Theme Support', hasThemeSupport,
            hasThemeSupport ? [] : 
            [`Only ${uniqueCssVars.length} unique CSS variables found. A robust highlighter should use multiple theme variables.`]);
    }
    
    validateJavaScriptTokens(content) {
        const tokenCategories = {
            keywords: /var\(--keyword\)/,
            strings: /var\(--string\)/,
            comments: /var\(--comment\)/,
            functions: /var\(--function\)/,
            operators: /var\(--operator\)/,
            numbers: /var\(--number\)/
        };
        
        const foundCategories = Object.entries(tokenCategories)
            .filter(([_, regex]) => regex.test(content))
            .map(([category]) => category);
        
        const hasDiverseTokens = foundCategories.length >= 4;
        
        this.addValidation('JavaScript Token Types', hasDiverseTokens,
            hasDiverseTokens ? [] : 
            [`Only ${foundCategories.length} token categories found: ${foundCategories.join(', ')}. Expected at least 4 different token types.`]);
        
        // Check for specific JavaScript keywords
        const jsKeywords = ['const', 'let', 'var', 'function', 'if', 'else', 'for', 'while', 'return', 'try', 'catch'];
        const keywordRegex = /<span[^>]*>(\w+)</g;
        const highlightedWords = [];
        let match;
        while ((match = keywordRegex.exec(content)) !== null) {
            highlightedWords.push(match[1]);
        }
        
        const foundKeywords = jsKeywords.filter(keyword => highlightedWords.includes(keyword));
        
        this.addValidation('JavaScript Keywords', 
            foundKeywords.length >= 5,
            foundKeywords.length >= 5 ? [] : 
            [`Only ${foundKeywords.length} JavaScript keywords highlighted. Found: ${foundKeywords.join(', ')}`]
        );
    }
    
    validateHighlightingCoverage(content) {
        const spanCount = (content.match(/<span/g) || []).length;
        const codeTextLength = content.replace(/<[^>]*>/g, '').length;
        const highlightingRatio = spanCount / Math.max(1, codeTextLength / 10);
        const hasReasonableDensity = highlightingRatio >= 0.3;
        
        this.addValidation('Highlighting Coverage', hasReasonableDensity,
            hasReasonableDensity ? [] : 
            [`Low highlighting density: ${spanCount} spans for ~${Math.floor(codeTextLength / 10)} tokens. Most tokens should be highlighted.`]);
    }
}

// Export for use in test modules
window.JavaScriptValidator = JavaScriptValidator;