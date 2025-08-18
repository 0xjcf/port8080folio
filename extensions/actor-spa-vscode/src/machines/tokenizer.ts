import * as vscode from 'vscode';

// Add the tokenizer event types
export type TokenizerEvent =
  | { type: 'TEMPLATE_TAG'; tag: 'html' | 'css' }
  | { type: 'BACKTICK' }
  | { type: 'DOLLAR_LBRACE' }
  | { type: 'LBRACE' }
  | { type: 'RBRACE' }
  | { type: 'NEWLINE' }
  | { type: 'CHAR'; char: string }
  | { type: 'EOF' };

export function tokenizeForMachine(text: string): TokenizerEvent[] {
  const events: TokenizerEvent[] = [];
  let i = 0;

  // Starting tokenization - logging disabled to follow actor pattern

  while (i < text.length) {
    const char = text[i];

    // Check for template tags
    if (text.slice(i, i + 5) === 'html`') {
      events.push({ type: 'TEMPLATE_TAG', tag: 'html' });
      // Found html template tag
      i += 4; // advance to the backtick
    } else if (text.slice(i, i + 4) === 'css`') {
      events.push({ type: 'TEMPLATE_TAG', tag: 'css' });
      // Found css template tag
      i += 3; // advance to the backtick
    }
    // Check for template literal markers
    else if (char === '`') {
      events.push({ type: 'BACKTICK' });
    }
    // Check for interpolation start
    else if (char === '$' && text[i + 1] === '{') {
      events.push({ type: 'DOLLAR_LBRACE' });
      i++; // skip the {
    }
    // Check for braces
    else if (char === '{') {
      events.push({ type: 'LBRACE' });
    } else if (char === '}') {
      events.push({ type: 'RBRACE' });
    }
    // Check for newlines
    else if (char === '\n') {
      events.push({ type: 'NEWLINE' });
    }
    // Regular character
    else {
      events.push({ type: 'CHAR', char });
    }

    i++;
  }

  events.push({ type: 'EOF' });
  return events;
}

// Helper function to format document using XState machine
export function formatWithMachine(
  text: string,
  _version: string,
  options: vscode.FormattingOptions
): { edits: Array<{ range: vscode.Range; newText: string }> } {
  const events = tokenizeForMachine(text);
  const edits: Array<{ range: vscode.Range; newText: string }> = [];

  // Tokenized events - logging disabled to follow actor pattern

  // Process events to generate formatting edits
  let currentLine = 0;
  let currentColumn = 0;
  const indentLevel = 0;
  let inTemplate = false;
  let templateType: 'html' | 'css' | null = null;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const nextEvent = events[i + 1];

    switch (event.type) {
      case 'TEMPLATE_TAG':
        templateType = event.tag;
        inTemplate = true;
        break;

      case 'BACKTICK':
        if (inTemplate && templateType) {
          if (nextEvent && nextEvent.type !== 'EOF') {
            // Add newline after opening backtick
            const position = new vscode.Position(currentLine, currentColumn + 1);
            const indent = options.insertSpaces
              ? ' '.repeat(options.tabSize * (indentLevel + 1))
              : '\t'.repeat(indentLevel + 1);
            const range = new vscode.Range(position, position);
            edits.push({
              range,
              newText: `\n${indent}`,
            });
          }
          inTemplate = !inTemplate;
        }
        break;

      case 'NEWLINE':
        currentLine++;
        currentColumn = 0;

        if (inTemplate && templateType) {
          // Add proper indentation for template content
          const nextPos = new vscode.Position(currentLine, 0);
          const indent = options.insertSpaces
            ? ' '.repeat(options.tabSize * (indentLevel + 1))
            : '\t'.repeat(indentLevel + 1);
          const range = new vscode.Range(nextPos, nextPos);
          edits.push({
            range,
            newText: indent,
          });
        }
        break;

      case 'DOLLAR_LBRACE':
        // Handle template expressions - no special formatting needed for now
        break;

      case 'LBRACE':
      case 'RBRACE':
        // Handle brace matching - no special formatting needed for now
        break;

      case 'CHAR':
        currentColumn++;
        break;

      case 'EOF':
        // End of file - finalize any pending edits
        break;
    }
  }

  return { edits };
}
