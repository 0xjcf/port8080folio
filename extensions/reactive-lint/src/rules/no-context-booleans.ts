import { SyntaxKind } from 'ts-morph';
import type { AnyRuleConfig, RuleContext, TsSourceFile, Violation } from '../types.js';
import { Rule } from './base.js';

export class NoContextBooleans extends Rule {
  // ✅ NEW: Behavioral state patterns that SHOULD be machine states
  private readonly BEHAVIORAL_STATE_PATTERNS = [
    /^is(Loading|Pending|Submitting|Processing|Saving|Fetching)$/i,
    /^is(Open|Closed|Visible|Hidden|Active|Inactive)$/i,
    /^is(Expanded|Collapsed|Selected|Focused|Pressed)$/i,
    /^is(Enabled|Disabled|Valid|Invalid|Dirty|Pristine)$/i,
    /^has(Error|Success|Failed|Complete)$/i,
    /^(loading|pending|submitting|processing|saving|fetching)$/i,
    /^(open|closed|visible|hidden|active|inactive)$/i,
    /^(expanded|collapsed|selected|focused|pressed)$/i,
    /^(enabled|disabled|valid|invalid|dirty|pristine)$/i,
    /^(error|success|failed|complete)$/i,
  ];

  // ✅ NEW: Derived/computed data patterns that are OK as booleans
  private readonly DERIVED_DATA_PATTERNS = [
    // Screen/viewport derived data
    /^is(Mobile|Desktop|Tablet|SmallScreen|LargeScreen|Portrait|Landscape)$/i,
    /^has(TouchSupport|KeyboardSupport|MouseSupport)$/i,

    // Computed permissions/capabilities
    /^(can|may|should|will|must)[A-Z]/,
    /^has(Permission|Access|Role|Right|Capability)$/i,
    /^is(Admin|User|Guest|Owner|Member|Authenticated|Authorized)$/i,

    // Configuration/feature flags
    /^(enable|disable|show|hide)[A-Z]/,
    /^is(Debug|Test|Development|Production|Feature\w+)$/i,
    /^(debug|test|development|production|feature\w+)Mode$/i,

    // Data existence/validation (computed from data)
    /^has(Data|Items|Content|Results|Entries|Values)$/i,
    /^is(Empty|Full|Available|Unavailable|Present|Absent)$/i,

    // Computed from arrays/collections
    /^has(Multiple|Single|Any|All|None)$/i,
    /^is(First|Last|Only|Multiple|Single)$/i,

    // Browser/environment derived
    /^is(Online|Offline|Supported|Compatible)$/i,
    /^has(LocalStorage|SessionStorage|Cookies|History)$/i,
  ];

  // ✅ NEW: Context clues that suggest derived data
  private readonly DERIVED_DATA_CLUES = [
    // Assignment from calculations
    /window\.inner(Width|Height)/,
    /screen\.(width|height)/,
    /\.length\s*[><=]/,
    /Math\./,
    /Date\./,
    /navigator\./,
    /localStorage\./,
    /sessionStorage\./,

    // Computed from other properties
    /context\.\w+\./,
    /event\./,
    /input\./,
    /state\./,

    // Boolean operations
    /&&|\|\||!/,
    /\.includes\(/,
    /\.some\(/,
    /\.every\(/,
    /\.find\(/,
    /\.test\(/,
  ];

  constructor(config: AnyRuleConfig = {}) {
    super({
      ...config,
      message: config.message || 'Use machine states instead of boolean flags for behavioral state',
    });
  }

  async check(
    sourceFile: TsSourceFile,
    content: string,
    context: RuleContext
  ): Promise<Violation[]> {
    const violations: Violation[] = [];

    // Find all object literal expressions
    const objectLiterals = sourceFile.getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression);

    for (const objectLiteral of objectLiterals) {
      // Check if this looks like a context object
      if (this.isContextObject(objectLiteral)) {
        // Check each property in the context
        const properties = objectLiteral.getProperties();

        for (const property of properties) {
          if (property.getKind() === SyntaxKind.PropertyAssignment) {
            const propAssignment = property.asKind(SyntaxKind.PropertyAssignment);
            if (!propAssignment) continue;

            const name = propAssignment.getName();
            const initializer = propAssignment.getInitializer();

            // ✅ NEW: Only flag if it's behavioral state, not derived data
            if (this.isBehavioralStateBoolean(name, initializer, content)) {
              const position = this.getNodePosition(property);
              const sourceContext = this.getSourceContext(sourceFile, position.line);

              violations.push(
                this.createViolation({
                  ruleId: 'no-context-booleans',
                  file: context.file,
                  line: position.line,
                  column: position.column,
                  endLine: position.endLine,
                  endColumn: position.endColumn,
                  source: sourceContext,
                  message: `Boolean flag '${name}' represents behavioral state and should be a machine state instead. Consider using states like 'idle' | 'loading' | 'success' | 'error'.`,
                  fix: this.generatePrimaryFix(name, propAssignment),
                  suggestions: this.generateSuggestions(name, propAssignment),
                })
              );
            }
          }
        }
      }
    }

    return violations;
  }

  /**
   * ✅ NEW: Smart check for behavioral state vs derived data
   */
  private isBehavioralStateBoolean(
    name: string,
    initializer: import('ts-morph').Node | undefined,
    content: string
  ): boolean {
    // First check if it's a boolean at all
    if (!this.isBooleanProperty(initializer)) {
      return false;
    }

    // ✅ NEW: Skip if it matches derived data patterns
    if (this.isDerivedDataBoolean(name, content)) {
      return false;
    }

    // ✅ NEW: Flag if it matches behavioral state patterns
    return this.BEHAVIORAL_STATE_PATTERNS.some((pattern) => pattern.test(name));
  }

  /**
   * ✅ NEW: Check if boolean represents derived/computed data
   */
  private isDerivedDataBoolean(name: string, content: string): boolean {
    // Check against derived data patterns
    if (this.DERIVED_DATA_PATTERNS.some((pattern) => pattern.test(name))) {
      return true;
    }

    // Look for context clues in the assignment
    const propertyRegex = new RegExp(`${name}:\\s*([^,}]+)`, 'g');
    const match = propertyRegex.exec(content);

    if (match) {
      const assignment = match[1];

      // Check if assignment suggests derived data
      if (this.DERIVED_DATA_CLUES.some((clue) => clue.test(assignment))) {
        return true;
      }
    }

    // Look for assignments in actions that suggest derived data
    const actionRegex = new RegExp(`${name}:\\s*\\([^)]*\\)\\s*=>\\s*([^,}]+)`, 'g');
    const actionMatch = actionRegex.exec(content);

    if (actionMatch) {
      const computation = actionMatch[1];

      if (this.DERIVED_DATA_CLUES.some((clue) => clue.test(computation))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if object literal looks like a context object
   */
  private isContextObject(objectLiteral: import('ts-morph').ObjectLiteralExpression): boolean {
    // Look for context indicators in the code structure
    const parent = objectLiteral.getParent();

    // Check if this is assigned to 'context' property
    if (parent && parent.getKind() === SyntaxKind.PropertyAssignment) {
      const propAssignment = parent.asKind(SyntaxKind.PropertyAssignment);
      if (propAssignment && propAssignment.getName() === 'context') {
        return true;
      }
    }

    // Check if it's in a setup() call pattern (XState v5)
    const ancestors = objectLiteral.getAncestors();
    for (const ancestor of ancestors) {
      if (ancestor.getKind() === SyntaxKind.CallExpression) {
        const callExpr = ancestor.asKind(SyntaxKind.CallExpression);
        if (callExpr) {
          const expression = callExpr.getExpression();
          if (
            expression.getText().includes('setup') ||
            expression.getText().includes('createMachine')
          ) {
            // Check if the object contains context-like properties
            const text = objectLiteral.getText();
            if (text.includes('context') || this.hasContextLikeProperties(objectLiteral)) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  /**
   * Check if object has context-like properties
   */
  private hasContextLikeProperties(
    objectLiteral: import('ts-morph').ObjectLiteralExpression
  ): boolean {
    const properties = objectLiteral.getProperties();

    for (const property of properties) {
      if (property.getKind() === SyntaxKind.PropertyAssignment) {
        const propAssignment = property.asKind(SyntaxKind.PropertyAssignment);
        if (propAssignment) {
          const name = propAssignment.getName();
          // Look for typical context property patterns
          if (this.BEHAVIORAL_STATE_PATTERNS.some((pattern) => pattern.test(name))) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Check if a property is a boolean type/value
   */
  private isBooleanProperty(initializer: import('ts-morph').Node | undefined): boolean {
    if (initializer) {
      const initText = initializer.getText();

      // Direct boolean values
      if (initText === 'true' || initText === 'false') {
        return true;
      }

      // Boolean type annotations
      if (initText === 'boolean') {
        return true;
      }

      // Type-only property (TypeScript context interface)
      if (initText.includes('boolean')) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate suggestions for fixing the violation
   */
  private generateSuggestions(
    propertyName: string,
    node?: import('ts-morph').Node
  ): Array<{ desc: string; fix: { range: [number, number]; text: string } }> {
    const suggestions = [];

    // Calculate real ranges if we have a node
    const start = node?.getStart() || 0;
    const end = node?.getEnd() || 0;

    // Suggest specific state names based on the boolean property name
    const stateNames = this.suggestStateNames(propertyName);

    suggestions.push({
      desc: `Replace '${propertyName}' with states: ${stateNames.join(' | ')}`,
      fix: {
        range: [start, end] as [number, number],
        text: this.formatTodo(
          `Replace ${propertyName} boolean with states: ${stateNames.join(' | ')}`
        ),
      },
    });

    suggestions.push({
      desc: 'Use XState machine states for behavioral state management',
      fix: {
        range: [start, end] as [number, number],
        text: this.formatTodo(
          'Define behavioral states in your machine instead of boolean context properties'
        ),
      },
    });

    return suggestions;
  }

  /**
   * Suggest appropriate state names based on boolean property name
   */
  private suggestStateNames(propertyName: string): string[] {
    // Common patterns and their suggested state alternatives
    const stateMap: Record<string, string[]> = {
      loading: ['idle', 'loading', 'success', 'error'],
      pending: ['idle', 'pending', 'complete', 'error'],
      submitting: ['idle', 'submitting', 'submitted', 'error'],
      visible: ['hidden', 'visible'],
      open: ['closed', 'opening', 'open', 'closing'],
      active: ['inactive', 'active'],
      enabled: ['disabled', 'enabled'],
      expanded: ['collapsed', 'expanding', 'expanded', 'collapsing'],
      selected: ['unselected', 'selected'],
      valid: ['invalid', 'validating', 'valid'],
      error: ['idle', 'pending', 'success', 'error'],
      success: ['idle', 'pending', 'success', 'error'],
      complete: ['pending', 'inProgress', 'complete'],
      dirty: ['pristine', 'dirty'],
    };

    // Try to match the property name to known patterns
    for (const [pattern, states] of Object.entries(stateMap)) {
      if (propertyName.toLowerCase().includes(pattern)) {
        return states;
      }
    }

    // Generic boolean to state mapping
    if (propertyName.startsWith('is') || propertyName.startsWith('has')) {
      const baseName = propertyName.replace(/^(is|has)/, '').toLowerCase();
      return ['idle', baseName, 'complete'];
    }

    // Default state suggestions
    return ['idle', 'active', 'complete'];
  }

  /**
   * Generate a primary fix for a boolean context property.
   */
  private generatePrimaryFix(
    propertyName: string,
    property: import('ts-morph').PropertyAssignment
  ): { range: [number, number]; text: string } | null {
    const stateNames = this.suggestStateNames(propertyName);
    const start = property.getStart();
    const end = property.getEnd();

    return {
      range: [start, end] as [number, number],
      text: this.formatTodo(
        `Replace ${propertyName} boolean with states: ${stateNames.join(' | ')}`
      ),
    };
  }
}

export default NoContextBooleans;
