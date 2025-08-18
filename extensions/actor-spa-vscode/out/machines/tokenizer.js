Object.defineProperty(exports, '__esModule', { value: true });
exports.tokenizeForMachine = tokenizeForMachine;
exports.formatWithMachine = formatWithMachine;
function tokenizeForMachine(text) {
  const events = [];
  let i = 0;
  while (i < text.length) {
    const char = text[i];
    // Check for template tags
    if (text.slice(i, i + 5) === 'html`') {
      events.push({ type: 'TEMPLATE_TAG', tag: 'html' });
      i += 4; // advance to the backtick
    } else if (text.slice(i, i + 4) === 'css`') {
      events.push({ type: 'TEMPLATE_TAG', tag: 'css' });
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
function formatWithMachine(text, version) {
  const events = tokenizeForMachine(text);
  // TODO: This is where you'd run the events through the XState machine
  // For now, return empty edits as placeholder
  console.log(`[XState Tokenizer v${version}] Tokenized ${events.length} events`);
  return { edits: [] };
}
//# sourceMappingURL=tokenizer.js.map
