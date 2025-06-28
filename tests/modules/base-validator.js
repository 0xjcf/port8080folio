// Base validation class for syntax highlighter tests
class BaseSyntaxValidator {
    constructor() {
        this.validations = [];
    }

    // Core validation methods that all tests should use
    validateContent(content) {
        this.validations = [];

        // Check if we got any content
        const hasContent = content && content.length > 0;
        this.addValidation('Content Extraction', hasContent,
            hasContent ? [] : ['No content extracted from shadow DOM']);

        if (!hasContent) {
            return this.validations;
        }

        // Run only universal syntax highlighting validations
        this.validateHTMLEntityEscaping(content);
        this.validateHTMLWellFormedness(content);
        this.validateSyntaxHighlighting(content);
        this.validateStylingConsistency(content);
        this.validateControlFlowKeywords(content);

        return this.validations;
    }

    // CRITICAL: Check for broken HTML entities
    validateHTMLEntityEscaping(content) {
        const brokenEntityPattern = /(?<!&)[lg]t;/g;
        const brokenEntities = content.match(brokenEntityPattern) || [];
        const hasProperEscaping = brokenEntities.length === 0;

        this.addValidation('HTML Entity Escaping', hasProperEscaping,
            hasProperEscaping ? [] :
                [`Found ${brokenEntities.length} broken HTML entities. Template literals and HTML content must be properly escaped. Examples: ${brokenEntities.slice(0, 3).join(', ')}`]);

        // Additional check for template literals
        const hasTemplateLiterals = content.includes('`') || content.includes('${');
        if (hasTemplateLiterals) {
            const hasProperTemplateLiteralStructure = !content.includes('${this.') ||
                (content.includes('${') && content.includes('}') && !content.includes('lt;'));

            this.addValidation('Template Literal Handling', hasProperTemplateLiteralStructure,
                hasProperTemplateLiteralStructure ? [] :
                    ['Template literals are not properly handled. HTML inside template literals must be escaped correctly.']);
        }
    }

    // Check for basic syntax highlighting structure
    validateSyntaxHighlighting(content) {
        const spanCount = (content.match(/<span/g) || []).length;
        const hasSpans = spanCount > 0;

        this.addValidation('Syntax Highlighting Applied', hasSpans,
            hasSpans ? [] : ['No span elements found - syntax highlighting not applied']);

        return spanCount;
    }

    // Check for CSS variable usage (theme support)
    validateThemeSupport(content) {
        const cssVarMatches = content.match(/var\(--[\w-]+\)/g) || [];
        const uniqueCssVars = [...new Set(cssVarMatches)];
        const hasThemeSupport = uniqueCssVars.length >= 3;

        this.addValidation('Theme Support', hasThemeSupport,
            hasThemeSupport ? [] :
                [`Only ${uniqueCssVars.length} unique CSS variables found. A robust highlighter should use multiple theme variables.`]);

        return uniqueCssVars;
    }

    // Check for proper token categorization
    validateTokenCategorization(content) {
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

        this.addValidation('Token Categorization', hasDiverseTokens,
            hasDiverseTokens ? [] :
                [`Only ${foundCategories.length} token categories found: ${foundCategories.join(', ')}. Expected at least 4 different token types.`]);

        return foundCategories;
    }

    // Check highlighting density
    validateHighlightingCoverage(content) {
        const spanCount = (content.match(/<span/g) || []).length;
        const codeTextLength = content.replace(/<[^>]*>/g, '').length;
        const highlightingRatio = spanCount / Math.max(1, codeTextLength / 10);
        const hasReasonableDensity = highlightingRatio >= 0.3;

        this.addValidation('Highlighting Coverage', hasReasonableDensity,
            hasReasonableDensity ? [] :
                [`Low highlighting density: ${spanCount} spans for ~${Math.floor(codeTextLength / 10)} tokens. Most tokens should be highlighted.`]);
    }

    // Check for consistent styling pattern
    validateStylingConsistency(content) {
        const stylePattern = /style="[^"]+"/g;
        const styles = content.match(stylePattern) || [];
        const hasConsistentStyles = styles.length > 0 &&
            styles.every(style => style.includes('color:') || style.includes('var(--'));

        this.addValidation('Consistent Styling', hasConsistentStyles,
            hasConsistentStyles ? [] :
                ['Inconsistent or missing style attributes on highlighted elements']);
    }

    // Check for well-formed HTML
    validateHTMLWellFormedness(content) {
        const openTags = (content.match(/<[^/][^>]*>/g) || []).length;
        const closeTags = (content.match(/<\/[^>]+>/g) || []).length;
        const selfClosingTags = (content.match(/<[^>]*\/>/g) || []).length;
        const hasBalancedTags = Math.abs(openTags - (closeTags + selfClosingTags)) <= 2;

        this.addValidation('Well-formed HTML', hasBalancedTags,
            hasBalancedTags ? [] :
                [`Unbalanced HTML tags: ${openTags} opening, ${closeTags} closing, ${selfClosingTags} self-closing`]);
    }

    // Check for specific control flow keywords
    validateControlFlowKeywords(content) {
        const hasTry = content.includes('>try</span>');
        const hasCatch = content.includes('>catch</span>');
        const hasFinally = content.includes('>finally</span>');

        if (hasTry) {
            this.addValidation('Control Flow: `try...catch`', hasCatch,
                hasCatch ? [] : ['`try` was found, but `catch` was not highlighted.']);
        }

        if (hasTry && content.includes('finally')) { // Check if 'finally' exists in the raw text
            this.addValidation('Control Flow: `finally`', hasFinally,
                hasFinally ? [] : ['`finally` block was found, but the keyword was not highlighted.']);
        }
    }

    // Helper method to add validation results
    addValidation(name, passed, issues = []) {
        this.validations.push({
            name,
            passed,
            issues
        });
    }

    // Language-specific validators can extend these methods
    validateLanguageSpecific(content, language) {
        // Override in subclasses for language-specific checks
        return [];
    }
}

// Export for use in test modules
window.BaseSyntaxValidator = BaseSyntaxValidator;