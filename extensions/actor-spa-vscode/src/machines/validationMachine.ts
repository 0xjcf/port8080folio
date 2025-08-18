import type * as vscode from 'vscode';
import { assign, fromPromise, setup } from 'xstate';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fixes: vscode.TextEdit[];
}

export interface ValidationContext {
  originalText: string;
  formattedText: string;
  edits: vscode.TextEdit[];
  results: ValidationResult[];
  errors: string[];
  stats: {
    totalValidations: number;
    passedValidations: number;
    failedValidations: number;
    warningsGenerated: number;
    fixesApplied: number;
    processingTime: number;
  };
}

export type ValidationEvent =
  | { type: 'VALIDATE'; originalText: string; formattedText: string; edits: vscode.TextEdit[] }
  | { type: 'VALIDATION_COMPLETE'; results: ValidationResult[] }
  | { type: 'ERROR'; error: string }
  | { type: 'RETRY' }
  | { type: 'RESET' };

// Helper functions for validation
function validateSyntax(text: string, language: 'html' | 'css'): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const fixes: vscode.TextEdit[] = [];

  if (language === 'html') {
    // Basic HTML validation
    const openTags = (text.match(/<[^/!][^>]*>/g) || []).filter((tag) => !tag.endsWith('/>'));
    const closeTags = text.match(/<\/[^>]*>/g) || [];

    // Check for mismatched tags
    if (openTags.length !== closeTags.length) {
      errors.push(`Mismatched HTML tags: ${openTags.length} opening, ${closeTags.length} closing`);
    }

    // Check for unclosed self-closing tags
    const unclosedSelfClosing =
      text.match(
        /<(img|br|hr|input|meta|link|area|base|col|embed|source|track|wbr)[^>]*(?!\/)>/gi
      ) || [];
    if (unclosedSelfClosing.length > 0) {
      warnings.push(`${unclosedSelfClosing.length} self-closing tags should end with />`);
    }

    // Check for deprecated attributes
    const deprecatedAttrs =
      text.match(/\b(bgcolor|border|cellpadding|cellspacing|color|face|size|width|height)\s*=/gi) ||
      [];
    if (deprecatedAttrs.length > 0) {
      warnings.push(`Found ${deprecatedAttrs.length} deprecated HTML attributes`);
    }
  } else if (language === 'css') {
    // Basic CSS validation
    const openBraces = (text.match(/\{/g) || []).length;
    const closeBraces = (text.match(/\}/g) || []).length;

    if (openBraces !== closeBraces) {
      errors.push(`Mismatched CSS braces: ${openBraces} opening, ${closeBraces} closing`);
    }

    // Check for missing semicolons
    const missingSemicolons = text.match(/[^;{}]\s*\n\s*[a-zA-Z-]+\s*:/g) || [];
    if (missingSemicolons.length > 0) {
      warnings.push(`${missingSemicolons.length} potential missing semicolons detected`);
    }

    // Check for vendor prefixes without standard property
    const vendorPrefixes = text.match(/-webkit-|-moz-|-ms-|-o-/g) || [];
    if (vendorPrefixes.length > 0) {
      warnings.push(`${vendorPrefixes.length} vendor-prefixed properties found`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fixes,
  };
}

function validateFormatting(originalText: string, formattedText: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const fixes: vscode.TextEdit[] = [];

  // Check if formatting actually changed anything
  if (originalText === formattedText) {
    warnings.push('No formatting changes were made');
  }

  // Check for excessive whitespace changes
  const originalLines = originalText.split('\n').length;
  const formattedLines = formattedText.split('\n').length;
  const lineDifference = Math.abs(originalLines - formattedLines);

  if (lineDifference > originalLines * 0.5) {
    warnings.push(`Significant line count change: ${originalLines} → ${formattedLines} lines`);
  }

  // Check for template literal integrity
  const originalTemplates = (originalText.match(/html`|css`/g) || []).length;
  const formattedTemplates = (formattedText.match(/html`|css`/g) || []).length;

  if (originalTemplates !== formattedTemplates) {
    errors.push(`Template literal count mismatch: ${originalTemplates} → ${formattedTemplates}`);
  }

  // Check for expression integrity
  const originalExpressions = (originalText.match(/\$\{/g) || []).length;
  const formattedExpressions = (formattedText.match(/\$\{/g) || []).length;

  if (originalExpressions !== formattedExpressions) {
    errors.push(`Expression count mismatch: ${originalExpressions} → ${formattedExpressions}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fixes,
  };
}

function validateEdits(edits: vscode.TextEdit[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const fixes: vscode.TextEdit[] = [];

  // Check for overlapping edits
  const sortedEdits = edits.sort((a, b) => a.range.start.compareTo(b.range.start));
  for (let i = 1; i < sortedEdits.length; i++) {
    const prevEdit = sortedEdits[i - 1];
    const currentEdit = sortedEdits[i];

    if (prevEdit.range.end.isAfter(currentEdit.range.start)) {
      errors.push(`Overlapping edits detected at line ${currentEdit.range.start.line + 1}`);
    }
  }

  // Check for empty edits
  const emptyEdits = edits.filter((edit) => edit.newText === '');
  if (emptyEdits.length > 0) {
    warnings.push(`${emptyEdits.length} empty edits (deletions) found`);
  }

  // Check for whitespace-only edits
  const whitespaceOnlyEdits = edits.filter((edit) => edit.newText.trim() === '');
  if (whitespaceOnlyEdits.length > 0) {
    warnings.push(`${whitespaceOnlyEdits.length} whitespace-only edits found`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fixes,
  };
}

// Actor for comprehensive validation
const comprehensiveValidationActor = fromPromise(
  async ({
    input,
  }: {
    input: { originalText: string; formattedText: string; edits: vscode.TextEdit[] };
  }) => {
    const { originalText, formattedText, edits } = input;
    const results: ValidationResult[] = [];

    // Validate formatting changes
    const formattingResult = validateFormatting(originalText, formattedText);
    results.push(formattingResult);

    // Validate edits
    const editsResult = validateEdits(edits);
    results.push(editsResult);

    // Validate syntax for any template literals found
    const htmlTemplates = formattedText.match(/html`([^`]*(?:`[^`]*`[^`]*)*)`/g) || [];
    for (const template of htmlTemplates) {
      const content = template.slice(5, -1); // Remove html` and `
      const htmlResult = validateSyntax(content, 'html');
      results.push(htmlResult);
    }

    const cssTemplates = formattedText.match(/css`([^`]*(?:`[^`]*`[^`]*)*)`/g) || [];
    for (const template of cssTemplates) {
      const content = template.slice(4, -1); // Remove css` and `
      const cssResult = validateSyntax(content, 'css');
      results.push(cssResult);
    }

    return results;
  }
);

export const validationMachine = setup({
  types: {
    context: {} as ValidationContext,
    events: {} as ValidationEvent,
  },
  actors: {
    comprehensiveValidation: comprehensiveValidationActor,
  },
  actions: {
    setValidationInput: assign({
      originalText: ({ event }) => {
        if (event.type === 'VALIDATE') {
          return event.originalText;
        }
        return '';
      },
      formattedText: ({ event }) => {
        if (event.type === 'VALIDATE') {
          return event.formattedText;
        }
        return '';
      },
      edits: ({ event }) => {
        if (event.type === 'VALIDATE') {
          return event.edits;
        }
        return [];
      },
      stats: () => ({
        totalValidations: 0,
        passedValidations: 0,
        failedValidations: 0,
        warningsGenerated: 0,
        fixesApplied: 0,
        processingTime: Date.now(),
      }),
    }),

    setValidationResults: assign({
      results: ({ event }) => {
        if (event.type === 'VALIDATION_COMPLETE') {
          return event.results;
        }
        return [];
      },
      stats: ({ context, event }) => {
        if (event.type === 'VALIDATION_COMPLETE') {
          const results = event.results;
          const endTime = Date.now();

          return {
            totalValidations: results.length,
            passedValidations: results.filter((r) => r.isValid).length,
            failedValidations: results.filter((r) => !r.isValid).length,
            warningsGenerated: results.reduce((sum, r) => sum + r.warnings.length, 0),
            fixesApplied: results.reduce((sum, r) => sum + r.fixes.length, 0),
            processingTime: endTime - context.stats.processingTime,
          };
        }
        return context.stats;
      },
    }),

    addError: assign({
      errors: ({ context, event }) => {
        if (event.type === 'ERROR') {
          return [...context.errors, event.error];
        }
        return context.errors;
      },
    }),

    resetState: assign({
      originalText: '',
      formattedText: '',
      edits: [],
      results: [],
      errors: [],
      stats: {
        totalValidations: 0,
        passedValidations: 0,
        failedValidations: 0,
        warningsGenerated: 0,
        fixesApplied: 0,
        processingTime: 0,
      },
    }),
  },
}).createMachine({
  id: 'validation',
  initial: 'idle',
  context: {
    originalText: '',
    formattedText: '',
    edits: [],
    results: [],
    errors: [],
    stats: {
      totalValidations: 0,
      passedValidations: 0,
      failedValidations: 0,
      warningsGenerated: 0,
      fixesApplied: 0,
      processingTime: 0,
    },
  },
  states: {
    idle: {
      on: {
        VALIDATE: {
          target: 'validating',
          actions: 'setValidationInput',
        },
      },
    },

    validating: {
      invoke: {
        id: 'comprehensiveValidation',
        src: 'comprehensiveValidation',
        input: ({ context }) => ({
          originalText: context.originalText,
          formattedText: context.formattedText,
          edits: context.edits,
        }),
        onDone: {
          target: 'completed',
          actions: assign({
            results: ({ event }) => event.output,
            stats: ({ context, event }) => {
              const results = event.output;
              const endTime = Date.now();

              return {
                totalValidations: results.length,
                passedValidations: results.filter((r: ValidationResult) => r.isValid).length,
                failedValidations: results.filter((r: ValidationResult) => !r.isValid).length,
                warningsGenerated: results.reduce(
                  (sum: number, r: ValidationResult) => sum + r.warnings.length,
                  0
                ),
                fixesApplied: results.reduce(
                  (sum: number, r: ValidationResult) => sum + r.fixes.length,
                  0
                ),
                processingTime: endTime - context.stats.processingTime,
              };
            },
          }),
        },
        onError: {
          target: 'error',
          actions: assign({
            errors: ({ context, event }) => [
              ...context.errors,
              `Validation error: ${String(event.error)}`,
            ],
          }),
        },
      },
    },

    completed: {
      on: {
        VALIDATE: {
          target: 'validating',
          actions: 'setValidationInput',
        },
        RESET: {
          target: 'idle',
          actions: 'resetState',
        },
      },
    },

    error: {
      on: {
        RETRY: {
          target: 'validating',
        },
        RESET: {
          target: 'idle',
          actions: 'resetState',
        },
      },
    },
  },
});
