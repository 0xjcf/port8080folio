import type { AnyRuleConfig, Severity } from '../types.js';
import { Rule } from './base.js';

// Re-export the Rule class for external use
export { Rule };

import { NoContextBooleans } from './no-context-booleans.js';
import { NoDomManipulation } from './no-dom-manipulation.js';
import { NoDOMQuery } from './no-dom-query.js';
import { NoEventListeners } from './no-event-listeners.js';
import { NoMultipleDataAttributes } from './no-multiple-data-attributes.js';
import { NoTimers } from './no-timers.js';
import { PreferExtractedTemplates } from './prefer-extracted-templates.js';

export const rules: Record<string, new (config: AnyRuleConfig) => Rule> = {
  'no-context-booleans': NoContextBooleans,
  'no-dom-query': NoDOMQuery,
  'no-dom-manipulation': NoDomManipulation,
  'no-event-listeners': NoEventListeners,
  'no-multiple-data-attributes': NoMultipleDataAttributes,
  'no-timers': NoTimers,
  'prefer-extracted-templates': PreferExtractedTemplates,
};

export {
  NoContextBooleans,
  NoDomManipulation,
  NoDOMQuery,
  NoEventListeners,
  NoMultipleDataAttributes,
  NoTimers,
  PreferExtractedTemplates,
};

/**
 * Load rules based on configuration
 */
export function loadRules(
  config: Record<string, unknown>,
  options?: { verbose?: boolean }
): Record<string, Rule> {
  const loadedRules: Record<string, Rule> = {};

  for (const [ruleId, ruleConfig] of Object.entries(config)) {
    if (ruleConfig === false || ruleConfig === 'off') {
      continue; // Skip disabled rules
    }

    const RuleClass = rules[ruleId];
    if (!RuleClass) {
      continue;
    }

    // 🔍 DEBUG: Log the raw rule config to see what we're receiving
    if (ruleId === 'no-event-listeners' && options?.verbose) {
      console.log(
        '🔍 [DEBUG] loadRules raw config for no-event-listeners:',
        JSON.stringify(ruleConfig, null, 2)
      );
    }

    // Convert rule config to proper format
    let finalConfig: AnyRuleConfig = {};

    if (typeof ruleConfig === 'string') {
      finalConfig = { severity: ruleConfig as Severity };
    } else if (typeof ruleConfig === 'object' && ruleConfig !== null) {
      finalConfig = ruleConfig as AnyRuleConfig;
    } else if (ruleConfig === true) {
      finalConfig = { severity: 'error' };
    }

    // 🔍 DEBUG: Log the final config to see what gets passed to the constructor
    if (ruleId === 'no-event-listeners' && options?.verbose) {
      console.log(
        '🔍 [DEBUG] loadRules final config for no-event-listeners:',
        JSON.stringify(finalConfig, null, 2)
      );
    }

    loadedRules[ruleId] = new RuleClass(finalConfig);
  }

  return loadedRules;
}

/**
 * Get all available rules
 */
export function getAvailableRules(): string[] {
  return Object.keys(rules);
}

/**
 * Register a custom rule
 */
export function registerRule(name: string, RuleClass: new (config: AnyRuleConfig) => Rule): void {
  rules[name] = RuleClass;
}
