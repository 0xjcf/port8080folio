// XState-specific validator extending base validator
class XStateValidator extends window.BaseSyntaxValidator {
  validateContent(content) {
    // Run base validations first
    const _baseValidations = super.validateContent(content);

    // Add XState-specific validations
    if (content && content.length > 0) {
      this.validateXStateSpecific(content);
    }

    return this.validations;
  }

  validateXStateSpecific(content) {
    // Check for XState-specific keywords
    const xstateKeywords = ['createMachine', 'assign', 'spawn', 'sendTo', 'fromPromise', 'setup'];
    const keywordRegex = /<span[^>]*>(\w+)</g;
    const highlightedWords = [];
    let match = keywordRegex.exec(content);
    while (match !== null) {
      highlightedWords.push(match[1]);
      match = keywordRegex.exec(content);
    }

    const foundKeywords = xstateKeywords.filter((keyword) => highlightedWords.includes(keyword));

    this.addValidation(
      'XState Keywords',
      foundKeywords.length >= 2,
      foundKeywords.length >= 2
        ? []
        : [
            `Only ${foundKeywords.length} XState keywords highlighted. Found: ${foundKeywords.join(', ')}. Expected: ${xstateKeywords.join(', ')}`,
          ]
    );

    // Check for context property highlighting
    const contextRegex = /<span[^>]*style="[^"]*--context-property[^"]*">context</;
    const hasContextHighlighting =
      contextRegex.test(content) || (content.includes('>context<') && content.includes('var(--'));

    this.addValidation(
      'Context Property Highlighting',
      hasContextHighlighting,
      hasContextHighlighting
        ? []
        : ['Context properties should have special highlighting with CSS variables']
    );

    // Check for state-related keywords
    const stateKeywords = ['states', 'initial', 'on', 'target'];
    const foundStateKeywords = stateKeywords.filter(
      (keyword) => highlightedWords.includes(keyword) || content.includes(`>${keyword}<`)
    );

    this.addValidation(
      'State Definitions',
      foundStateKeywords.length >= 2,
      foundStateKeywords.length >= 2
        ? []
        : [
            `Only ${foundStateKeywords.length} state keywords found. Expected: states, initial, on, target`,
          ]
    );

    // Check for XState-specific CSS variables
    const xstateVars = [
      '--xstate-keyword',
      '--context-property',
      '--event-property',
      '--state-name',
    ];
    const foundXStateVars = xstateVars.filter((varName) => content.includes(varName));

    if (foundXStateVars.length > 0) {
      this.addValidation(
        'XState Theme Variables',
        foundXStateVars.length >= 2,
        foundXStateVars.length >= 2
          ? []
          : [`Only ${foundXStateVars.length} XState-specific theme variables found`]
      );
    }
  }
}

// Export for use in test modules
window.XStateValidator = XStateValidator;
