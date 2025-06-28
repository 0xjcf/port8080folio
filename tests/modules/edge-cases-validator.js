// Edge cases validator extending base validator
class EdgeCasesValidator extends window.BaseSyntaxValidator {
    validateContent(content, testName) {
        // Run base validations first
        super.validateContent(content);
        
        // Add edge-case-specific validations based on test name
        if (content && content.length > 0) {
            this.validateEdgeCaseSpecific(content, testName);
        }
        
        return this.validations;
    }
    
    validateEdgeCaseSpecific(content, testName) {
        // Test-specific validations
        if (testName.includes('Template Literals')) {
            this.validateTemplateLiterals(content);
        }
        
        if (testName.includes('Quotes')) {
            this.validateQuoteHandling(content);
        }
        
        if (testName.includes('Destructuring')) {
            this.validateDestructuring(content);
        }
        
        if (testName.includes('XState')) {
            this.validateXStateEdgeCases(content);
        }
        
        if (testName.includes('Comments')) {
            this.validateComments(content);
        }
    }
    
    validateTemplateLiterals(content) {
        // Check for proper template literal handling
        const hasTemplateLiterals = content.includes('`') || content.includes('${');
        
        this.addValidation('Template Literal Detection',
            hasTemplateLiterals,
            hasTemplateLiterals ? [] : ['Template literals not detected in output']);
        
        // Check that template expressions are properly highlighted
        if (hasTemplateLiterals) {
            const hasExpressionHighlighting = content.includes('${</span>') || 
                                             content.includes('<span') && content.includes('${');
            
            this.addValidation('Template Expression Highlighting',
                hasExpressionHighlighting,
                hasExpressionHighlighting ? [] : 
                ['Template literal expressions should be highlighted separately']);
        }
    }
    
    validateQuoteHandling(content) {
        // Check for XSS prevention
        const hasNoScriptInjection = !content.includes('<script') && !content.includes('</script');
        
        this.addValidation('XSS Prevention',
            hasNoScriptInjection,
            hasNoScriptInjection ? [] : ['Potential XSS vulnerability - script tags not escaped']);
        
        // Check that different quote types are highlighted
        const quoteTypes = ['"', "'", '`'];
        const hasQuoteHighlighting = quoteTypes.some(quote => 
            content.includes(`>${quote}`) || content.includes(`${quote}<`)
        );
        
        this.addValidation('Quote Type Highlighting',
            hasQuoteHighlighting,
            hasQuoteHighlighting ? [] : ['Different quote types should be properly highlighted']);
    }
    
    validateDestructuring(content) {
        // Check for object/array destructuring patterns
        const hasDestructuring = content.includes('{') && content.includes('}') && 
                                content.includes('[') && content.includes(']');
        
        this.addValidation('Destructuring Syntax',
            hasDestructuring,
            hasDestructuring ? [] : ['Destructuring patterns not found in output']);
        
        // Check for spread operator
        const hasSpread = content.includes('...');
        
        this.addValidation('Spread Operator',
            hasSpread,
            hasSpread ? [] : ['Spread operator (...) not found in output']);
    }
    
    validateXStateEdgeCases(content) {
        // Check for special characters in state names
        const hasSpecialChars = content.includes('-') || content.includes('.');
        
        this.addValidation('Special Character Handling',
            hasSpecialChars,
            hasSpecialChars ? [] : ['Special characters in identifiers not properly handled']);
        
        // Check for XState keywords
        const hasXStateKeywords = content.includes('createMachine') || 
                                 content.includes('context') || 
                                 content.includes('states');
        
        this.addValidation('XState Keywords in Edge Cases',
            hasXStateKeywords,
            hasXStateKeywords ? [] : ['XState keywords not found in edge case output']);
    }
    
    validateComments(content) {
        // Check for different comment types
        const hasSingleLineComments = content.includes('//');
        const hasMultiLineComments = content.includes('/*') || content.includes('*/');
        
        this.addValidation('Comment Types',
            hasSingleLineComments || hasMultiLineComments,
            hasSingleLineComments || hasMultiLineComments ? [] : 
            ['Comments not properly detected in output']);
        
        // Check that comments have appropriate styling
        const hasCommentStyling = content.includes('var(--comment)');
        
        this.addValidation('Comment Styling',
            hasCommentStyling,
            hasCommentStyling ? [] : ['Comments should be styled with --comment CSS variable']);
    }
}

// Export for use in test modules
window.EdgeCasesValidator = EdgeCasesValidator;