var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: () => m[k] };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : (o, v) => {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (() => {
    var ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          var ar = [];
          for (var k in o) if (Object.hasOwn(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.ActorSpaRangeFormattingProvider = exports.ActorSpaFormattingProvider = void 0;
const node_child_process_1 = require('node:child_process');
const fs = __importStar(require('node:fs'));
const os = __importStar(require('node:os'));
const path = __importStar(require('node:path'));
const node_util_1 = require('node:util');
const vscode = __importStar(require('vscode'));
const execAsync = (0, node_util_1.promisify)(node_child_process_1.exec);
class ActorSpaFormattingProvider {
  constructor(outputChannel) {
    this.outputChannel = outputChannel;
    // Get extension version
    const extension = vscode.extensions.getExtension('actor-spa.actor-spa-framework');
    this.version = extension?.packageJSON?.version || 'unknown';
  }
  log(message, data) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [Actor-SPA Formatter] ${message}`;
    console.log(logMessage, data || '');
    if (this.outputChannel) {
      const dataStr = data ? ` | Data: ${JSON.stringify(data, null, 2)}` : '';
      this.outputChannel.appendLine(`${logMessage}${dataStr}`);
    }
  }
  logDebug(message, data) {
    const config = vscode.workspace.getConfiguration('actor-spa');
    if (config.get('enableDiagnostics', true)) {
      this.log(`[DEBUG] ${message}`, data);
    }
  }
  async provideDocumentFormattingEdits(document, options, token) {
    this.log(
      `🚀 Starting Actor-SPA document formatting v${this.version} (Biome → Prettier → Simple fallback)`,
      {
        fileName: document.fileName,
        languageId: document.languageId,
        lineCount: document.lineCount,
      }
    );
    const config = vscode.workspace.getConfiguration('actor-spa.formatting');
    if (!config.get('enabled', true)) {
      this.log('❌ Formatting disabled in configuration');
      return [];
    }
    const edits = [];
    const templates = this.findTemplates(document);
    // 🔧 IMPROVEMENT: Add performance warnings for large documents
    if (templates.length > 50) {
      this.log('⚠️ Large number of templates detected, formatting may take longer', {
        templateCount: templates.length,
      });
    }
    // 🔧 IMPROVEMENT: Track processing statistics
    const processingStats = {
      totalTemplates: templates.length,
      nestedTemplates: templates.filter((t) => t.isNested).length,
      htmlTemplates: templates.filter((t) => t.language === 'html').length,
      cssTemplates: templates.filter((t) => t.language === 'css').length,
      startTime: Date.now(),
    };
    this.log(`📋 Found ${templates.length} templates to format`, {
      templates: templates.map((t) => ({
        language: t.language,
        isNested: t.isNested,
        indentLevel: t.indentLevel,
        contentLength: t.content.length,
        lineRange: `${t.range.start.line + 1}-${t.range.end.line + 1}`,
        linesSpanned: t.range.end.line - t.range.start.line + 1, // 🔧 ADDED: Line span info
      })),
      summary: processingStats,
    });
    // 🔧 IMPROVEMENT: Process templates with better error isolation
    let successCount = 0;
    let errorCount = 0;
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      if (token.isCancellationRequested) {
        this.log('⚠️ Formatting cancelled by user', {
          processedCount: i,
          totalCount: templates.length,
        });
        break;
      }
      this.logDebug(`🔧 Processing template ${i + 1}/${templates.length}`, {
        language: template.language,
        isNested: template.isNested,
        originalLength: template.content.length,
        linesSpanned: template.range.end.line - template.range.start.line + 1,
      });
      try {
        const formatted = await this.formatTemplate(template, options);
        if (formatted !== template.content) {
          edits.push(vscode.TextEdit.replace(template.range, formatted));
          successCount++;
          this.logDebug(`✅ Template ${i + 1} formatted successfully`, {
            originalLength: template.content.length,
            formattedLength: formatted.length,
            changePercent: Math.round(
              ((formatted.length - template.content.length) / template.content.length) * 100
            ),
          });
        } else {
          this.logDebug(`⏭️ Template ${i + 1} unchanged (already formatted)`);
          successCount++;
        }
      } catch (error) {
        errorCount++;
        this.log(`❌ Failed to format template ${i + 1}`, {
          error: error instanceof Error ? error.message : String(error),
          template: {
            language: template.language,
            length: template.content.length,
            isNested: template.isNested,
          },
        });
        // 🔧 IMPROVEMENT: Continue processing other templates on error
      }
    }
    // 🔧 IMPROVEMENT: Enhanced completion summary with performance metrics
    const processingTime = Date.now() - processingStats.startTime;
    this.log('🎉 Formatting complete', {
      totalEdits: edits.length,
      templatesProcessed: templates.length,
      successCount,
      errorCount,
      processingTimeMs: processingTime,
      averageTimePerTemplate:
        templates.length > 0 ? Math.round(processingTime / templates.length) : 0,
      performance: processingTime > 5000 ? 'slow' : processingTime > 2000 ? 'moderate' : 'fast',
    });
    return edits;
  }
  findTemplates(document) {
    this.logDebug('🔍 Starting template discovery');
    const templates = [];
    const text = document.getText();
    // Find html`` templates
    const htmlTemplates = this.findTemplatesOfType(text, document, 'html', templates);
    this.logDebug(`Found ${htmlTemplates} HTML templates`);
    // Find css`` templates
    const cssTemplates = this.findTemplatesOfType(text, document, 'css', templates);
    this.logDebug(`Found ${cssTemplates} CSS templates`);
    this.logDebug('📊 Template discovery summary', {
      htmlTemplates,
      cssTemplates,
      totalTemplates: templates.length,
      nestedTemplates: templates.filter((t) => t.isNested).length,
    });
    return templates;
  }
  findTemplatesOfType(text, document, type, templates) {
    const regex = new RegExp(`\\b(${type})\\s*\``, 'g');
    let match;
    let count = 0;
    match = regex.exec(text);
    while (match !== null) {
      const tagStart = match.index;
      const contentStart = tagStart + match[0].length;
      this.logDebug(`🎯 Found ${type} template at position ${tagStart}`);
      // Find the closing backtick
      const contentEnd = this.findClosingBacktick(text, contentStart);
      if (contentEnd === -1) {
        this.logDebug(`⚠️ No closing backtick found for ${type} template at position ${tagStart}`);
        match = regex.exec(text);
        continue;
      }
      const content = text.slice(contentStart, contentEnd);
      const startPos = document.positionAt(contentStart);
      const endPos = document.positionAt(contentEnd);
      // 🔧 IMPROVEMENT: Better line range calculation
      const actualStartLine = startPos.line;
      const actualEndLine = endPos.line;
      const indentLevel = this.getIndentLevel(document, startPos.line);
      // Check if this is a nested template (inside another template)
      const isNested = this.isNestedTemplate(text, tagStart);
      templates.push({
        range: new vscode.Range(startPos, endPos),
        content,
        language: type,
        indentLevel,
        isNested,
      });
      count++;
      this.logDebug(`✅ ${type} template processed`, {
        position: tagStart,
        contentLength: content.length,
        isNested,
        indentLevel,
        lineRange: `${actualStartLine + 1}-${actualEndLine + 1}`, // 🔧 FIXED: Show actual line range
        linesSpanned: actualEndLine - actualStartLine + 1,
      });
      match = regex.exec(text);
    }
    return count;
  }
  isNestedTemplate(text, currentPos) {
    this.logDebug(`🔍 Checking if template at position ${currentPos} is nested`);
    // Look backwards to see if we're inside another template literal
    let templateDepth = 0;
    let expressionDepth = 0;
    let i = currentPos - 1;
    let inString = false;
    let stringChar = '';
    while (i >= 0) {
      const char = text[i];
      const nextChar = text[i + 1];
      // Handle escaped characters
      if (char === '\\') {
        i -= 2;
        continue;
      }
      // Handle string literals
      if (!inString && (char === '"' || char === "'" || char === '`')) {
        // Check if this backtick is part of a template literal tag
        if (char === '`') {
          // Look backwards to see if there's a tag before this backtick
          let j = i - 1;
          while (j >= 0 && /\s/.test(text[j])) {
            j--;
          } // Skip whitespace
          const tagEnd = j + 1;
          while (j >= 0 && /[a-zA-Z_$]/.test(text[j])) {
            j--;
          } // Find tag start
          if (j >= 0 && /\b(html|css)$/.test(text.slice(j + 1, tagEnd))) {
            templateDepth--;
            this.logDebug(
              `🎯 Found template tag at position ${j + 1}, template depth: ${templateDepth}`
            );
            // If we're inside a template and find another template tag, we're nested
            if (templateDepth > 0 || expressionDepth > 0) {
              this.logDebug(
                `🪆 Template is nested (template depth: ${templateDepth}, expression depth: ${expressionDepth})`
              );
              return true;
            }
          } else {
            // Regular string backtick
            inString = true;
            stringChar = char;
          }
        } else {
          inString = true;
          stringChar = char;
        }
      } else if (inString && char === stringChar) {
        inString = false;
        stringChar = '';
      }
      if (!inString) {
        if (char === '}' && nextChar !== '}') {
          expressionDepth++;
        } else if (char === '$' && nextChar === '{') {
          expressionDepth--;
          if (expressionDepth < 0) {
            expressionDepth = 0;
          }
        } else if (char === '`') {
          templateDepth++;
        }
      }
      i--;
    }
    this.logDebug('📄 Template is top-level (not nested)');
    return false;
  }
  findClosingBacktick(text, start) {
    this.logDebug(`🔍 Finding closing backtick starting from position ${start}`);
    this.logDebug(`📝 Context: "${text.slice(Math.max(0, start - 10), start + 50)}"`);
    let depth = 0;
    let i = start;
    let inString = false;
    let stringChar = '';
    let inRegex = false;
    while (i < text.length) {
      const char = text[i];
      const nextChar = text[i + 1];
      // Add detailed character logging for first 20 characters
      if (i < start + 20) {
        this.logDebug(
          `📍 Pos ${i}: char='${char}' depth=${depth} inString=${inString} inRegex=${inRegex}`
        );
      }
      // Handle escaped characters
      if (char === '\\') {
        this.logDebug(`🔄 Escaped character at ${i}, skipping`);
        i += 2; // Skip escaped character and continue
        continue;
      }
      // Handle regex literals (to avoid confusion with division)
      if (!inString && char === '/' && nextChar !== '/' && nextChar !== '*') {
        // Look back to see if this could be a regex
        let j = i - 1;
        while (j >= 0 && /\s/.test(text[j])) {
          j--;
        } // Skip whitespace
        const prevChar = text[j];
        if (prevChar && '=({[,;:!&|?+\n'.includes(prevChar)) {
          inRegex = true;
          this.logDebug(`🔤 Entering regex at ${i}`);
          i++;
          continue;
        }
      }
      if (inRegex) {
        if (char === '/' && text[i - 1] !== '\\') {
          inRegex = false;
          this.logDebug(`🔤 Exiting regex at ${i}`);
        }
        i++;
        continue;
      }
      // Now handle the actual template literal parsing FIRST
      if (char === '`') {
        if (depth === 0) {
          this.logDebug(`✅ Found closing backtick at position ${i} (depth: ${depth})`);
          return i;
        }
        // This is a nested template literal closing
        depth--;
        this.logDebug(`📉 Nested template closed, depth now: ${depth}`);
      } else if (char === '$' && nextChar === '{') {
        depth++;
        this.logDebug(`📈 Template expression opened, depth now: ${depth}`);
        i++; // Skip the '{'
      } else if (char === '}' && depth > 0) {
        depth--;
        this.logDebug(`📉 Template expression closed, depth now: ${depth}`);
      }
      // Handle string literals inside template expressions (only when depth > 0)
      if (!inString && (char === '"' || char === "'" || (char === '`' && depth > 0))) {
        inString = true;
        stringChar = char;
        this.logDebug(`🎨 Entering string '${char}' at ${i}`);
        i++;
        continue;
      }
      if (inString) {
        if (char === stringChar && text[i - 1] !== '\\') {
          inString = false;
          stringChar = '';
          this.logDebug(`🎨 Exiting string at ${i}`);
        }
        i++;
        continue;
      }
      i++;
    }
    this.logDebug(`❌ No closing backtick found (ended at depth: ${depth})`);
    this.logDebug(`📝 Final context: "${text.slice(Math.max(0, i - 20), i + 10)}"`);
    return -1;
  }
  getIndentLevel(document, lineNumber) {
    const line = document.lineAt(lineNumber);
    const match = line.text.match(/^(\s*)/);
    const indentLevel = match ? Math.floor(match[1].length / 2) : 0;
    this.logDebug(`📏 Calculated indent level: ${indentLevel} for line ${lineNumber + 1}`);
    return indentLevel;
  }
  validateTemplateContent(template) {
    const warnings = [];
    const isValid = true;
    // 🔧 IMPROVEMENT: Detect potentially problematic templates
    if (template.content.length > 10000) {
      warnings.push(`Large template (${template.content.length} chars)`);
    }
    if (template.isNested && template.content.includes('${')) {
      const expressionCount = (template.content.match(/\$\{/g) || []).length;
      if (expressionCount > 20) {
        warnings.push(`High expression density (${expressionCount} expressions)`);
      }
    }
    // Check for common formatting issues
    if (template.language === 'html' && template.content.includes('<script')) {
      warnings.push('Contains script tags - may need special handling');
    }
    if (template.language === 'css' && template.content.includes('@import')) {
      warnings.push('Contains @import - may need special handling');
    }
    // Check for deeply nested templates
    const nestedTemplateCount = (template.content.match(/html`|css`/g) || []).length;
    if (nestedTemplateCount > 5) {
      warnings.push(`Deep template nesting (${nestedTemplateCount} nested templates)`);
    }
    return { isValid, warnings };
  }
  async formatTemplate(template, options) {
    const { content, language, indentLevel } = template;
    this.logDebug(`🎨 Starting ${language} template formatting`, {
      contentLength: content.length,
      indentLevel,
      tabSize: options.tabSize,
    });
    if (!content.trim()) {
      this.logDebug('⏭️ Skipping empty template');
      return content;
    }
    // 🔧 IMPROVEMENT: Validate template content
    const validation = this.validateTemplateContent(template);
    if (validation.warnings.length > 0) {
      this.logDebug('⚠️ Template validation warnings', {
        warnings: validation.warnings,
        language: template.language,
        isNested: template.isNested,
      });
    }
    try {
      // Step 1: Extract template expressions
      const { content: cleanContent, expressions } = this.extractExpressions(content);
      this.logDebug(`🔧 Extracted ${expressions.length} expressions`, {
        expressionsWithNestedTemplates: expressions.filter((e) => e.hasNestedTemplate).length,
        cleanContentLength: cleanContent.length,
      });
      // Step 2: Format with Biome CLI (with Prettier fallback)
      const formatted = await this.formatWithBiome(cleanContent, language);
      this.logDebug(`✨ ${language} formatting applied`, {
        originalLength: cleanContent.length,
        formattedLength: formatted.length,
      });
      // Step 3: Restore template expressions
      const withExpressions = this.restoreExpressions(formatted, expressions);
      this.logDebug(`🔄 Restored ${expressions.length} expressions`);
      // Step 4: Apply template literal style
      const final = this.applyTemplateLiteralStyle(withExpressions, indentLevel);
      this.logDebug('🎯 Applied template literal styling', {
        finalLength: final.length,
        totalChangePercent: Math.round(((final.length - content.length) / content.length) * 100),
      });
      return final;
    } catch (error) {
      this.log(`❌ Formatting failed for ${language} template`, {
        error: error instanceof Error ? error.message : String(error),
        contentLength: content.length,
        indentLevel,
      });
      return content;
    }
  }
  async formatWithBiome(content, language) {
    this.logDebug(`🔧 Formatting ${language} content with Biome (with Prettier fallback)`, {
      contentLength: content.length,
    });
    // Create a temporary file with the appropriate extension
    const extension = language === 'html' ? '.html' : '.css';
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `biome-format-${Date.now()}${extension}`);
    try {
      // Write content to temp file
      await fs.promises.writeFile(tempFile, content, 'utf8');
      this.logDebug(`📝 Written content to temp file: ${tempFile}`);
      // Try Biome first, then Prettier, then fallback to simple formatting
      let formattedContent;
      try {
        // Try biome first
        const biomeCommand = `pnpm exec biome format --write "${tempFile}"`;
        this.logDebug(`🏃 Executing Biome command: ${biomeCommand}`);
        await execAsync(biomeCommand, {
          cwd: process.cwd(),
          timeout: 10000, // 10 second timeout
        });
        // Read the formatted content back
        formattedContent = await fs.promises.readFile(tempFile, 'utf8');
        this.logDebug(`✅ Biome formatting successful for ${language}`);
        return formattedContent;
      } catch (biomeError) {
        this.logDebug(`⚠️ Biome not available or doesn't support ${language}, trying Prettier`, {
          error: biomeError instanceof Error ? biomeError.message : String(biomeError),
        });
        try {
          // Try prettier as fallback
          const prettierCommand = `pnpm exec prettier --write "${tempFile}"`;
          this.logDebug(`🏃 Executing Prettier command: ${prettierCommand}`);
          await execAsync(prettierCommand, {
            cwd: process.cwd(),
            timeout: 10000, // 10 second timeout
          });
          // Read the formatted content back
          formattedContent = await fs.promises.readFile(tempFile, 'utf8');
          this.logDebug(`✅ Prettier formatting successful for ${language}`);
          return formattedContent;
        } catch (prettierError) {
          this.logDebug(`⚠️ Prettier not available, using simple formatting for ${language}`, {
            biomeError: biomeError instanceof Error ? biomeError.message : String(biomeError),
            prettierError:
              prettierError instanceof Error ? prettierError.message : String(prettierError),
          });
          // Fallback to simple formatting
          return this.simpleFormat(content, language);
        }
      }
    } catch (error) {
      this.logDebug(`❌ Formatting error for ${language}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      // Return original content if formatting fails
      return content;
    } finally {
      // Clean up temp file
      try {
        await fs.promises.unlink(tempFile);
        this.logDebug(`🗑️ Cleaned up temp file: ${tempFile}`);
      } catch (cleanupError) {
        this.logDebug(`⚠️ Failed to clean up temp file: ${tempFile}`, {
          error: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
        });
      }
    }
  }
  simpleFormat(content, language) {
    this.logDebug(`🔧 Applying simple ${language} formatting`);
    if (language === 'html') {
      return this.simpleHtmlFormat(content);
    }
    return this.simpleCssFormat(content);
  }
  simpleHtmlFormat(content) {
    // First, break up single-line HTML into multiple lines by adding newlines around tags
    const preFormatted = content
      // Add newlines before opening tags (but not the first one)
      .replace(/(?<!^)(<[^/])/g, '\n$1')
      // Add newlines before closing tags
      .replace(/(<\/)/g, '\n$1')
      // Add newlines after closing tags (but not the last one)
      .replace(/(\/>|>)/g, '$1\n')
      // Clean up multiple newlines and trim
      .replace(/\n+/g, '\n')
      .trim();
    const lines = preFormatted.split('\n');
    const formatted = [];
    let indentLevel = 0;
    const indentSize = 2;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        continue;
      }
      // Check if this is a simple tag that should stay on one line
      if (line.startsWith('<') && !line.startsWith('</')) {
        // Look ahead to see if we can combine with the next few lines
        const combined = this.tryCreateSingleLineTag(lines, i);
        if (combined.success) {
          formatted.push(' '.repeat(indentLevel * indentSize) + combined.content);
          i = combined.skipToIndex; // Skip the lines we've combined
          continue;
        }
      }
      // Decrease indent for closing tags
      if (line.startsWith('</')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      // Add indented line
      formatted.push(' '.repeat(indentLevel * indentSize) + line);
      // Increase indent for opening tags (but not self-closing)
      if (line.startsWith('<') && !line.startsWith('</') && !line.endsWith('/>')) {
        // Check if it's not a self-closing tag
        const tagMatch = line.match(/<(\w+)/);
        if (tagMatch) {
          const tagName = tagMatch[1].toLowerCase();
          // Don't indent for void elements
          const voidElements = [
            'area',
            'base',
            'br',
            'col',
            'embed',
            'hr',
            'img',
            'input',
            'link',
            'meta',
            'param',
            'source',
            'track',
            'wbr',
          ];
          if (!voidElements.includes(tagName)) {
            indentLevel++;
          }
        }
      }
    }
    return formatted.join('\n');
  }
  tryCreateSingleLineTag(lines, startIndex) {
    const openingLine = lines[startIndex].trim();
    // Only consider simple opening tags (not complex ones with lots of attributes)
    if (openingLine.length > 50 || openingLine.includes('\n')) {
      return { success: false, content: '', skipToIndex: startIndex };
    }
    const tagMatch = openingLine.match(/<(\w+)/);
    if (!tagMatch) {
      return { success: false, content: '', skipToIndex: startIndex };
    }
    const tagName = tagMatch[1].toLowerCase();
    const expectedClosingTag = `</${tagName}>`;
    // Look for the closing tag within the next few lines
    let textContent = '';
    let currentIndex = startIndex + 1;
    let foundClosing = false;
    let totalLength = openingLine.length;
    while (currentIndex < lines.length && currentIndex < startIndex + 5) {
      const currentLine = lines[currentIndex].trim();
      if (currentLine === expectedClosingTag) {
        foundClosing = true;
        totalLength += currentLine.length;
        break;
      }
      // If we encounter another tag or the content is getting too long, abort
      if (currentLine.includes('<') || totalLength > 80) {
        break;
      }
      textContent += (textContent ? ' ' : '') + currentLine;
      totalLength += currentLine.length + 1; // +1 for space
      currentIndex++;
    }
    // Only combine if we found the closing tag, content is short, and it's simple
    if (foundClosing && totalLength <= 80 && !textContent.includes('\n')) {
      const combined = textContent
        ? `${openingLine}${textContent}${expectedClosingTag}`
        : `${openingLine}${expectedClosingTag}`;
      return {
        success: true,
        content: combined,
        skipToIndex: currentIndex,
      };
    }
    return { success: false, content: '', skipToIndex: startIndex };
  }
  simpleCssFormat(content) {
    // First, break up single-line CSS into multiple lines
    const formatted = content
      // Add newlines after semicolons (but not inside url() or other functions)
      .replace(/;(?![^()]*\))/g, ';\n')
      // Add newlines before opening braces (with proper spacing)
      .replace(/\s*\{/g, ' {\n')
      // Add newlines after closing braces
      .replace(/\}/g, '\n}\n')
      // Clean up multiple consecutive newlines
      .replace(/\n+/g, '\n')
      // Clean up extra spaces
      .replace(/[ \t]+/g, ' ')
      .trim();
    // Now apply proper indentation
    const lines = formatted.split('\n');
    const indentedLines = [];
    let indentLevel = 0;
    const indentSize = 2;
    for (let line of lines) {
      line = line.trim();
      if (!line) {
        continue;
      }
      // Decrease indent for closing braces
      if (line === '}') {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      // Add indented line
      indentedLines.push(' '.repeat(indentLevel * indentSize) + line);
      // Increase indent for opening braces
      if (line.endsWith('{')) {
        indentLevel++;
      }
    }
    return indentedLines.join('\n');
  }
  extractExpressions(content) {
    this.logDebug('🔍 Extracting template expressions');
    const expressions = [];
    let result = content;
    let index = 0;
    // More sophisticated regex to handle nested braces
    const expressionRegex = /\$\{[^}]*(?:\{[^}]*\}[^}]*)*\}/g;
    let match;
    match = expressionRegex.exec(content);
    while (match !== null) {
      const placeholder = `__EXPR_${index}__`;
      const original = match[0];
      const hasNestedTemplate = original.includes('html`') || original.includes('css`');
      expressions.push({
        placeholder,
        original,
        hasNestedTemplate,
      });
      this.logDebug(`📦 Extracted expression ${index}`, {
        length: original.length,
        hasNestedTemplate,
        preview: original.length > 50 ? `${original.substring(0, 47)}...` : original,
      });
      result = result.replace(original, placeholder);
      index++;
      match = expressionRegex.exec(content);
    }
    this.logDebug('✅ Expression extraction complete', {
      totalExpressions: expressions.length,
      nestedTemplateExpressions: expressions.filter((e) => e.hasNestedTemplate).length,
    });
    return { content: result, expressions };
  }
  restoreExpressions(content, expressions) {
    this.logDebug(`🔄 Restoring ${expressions.length} expressions`);
    let result = content;
    for (const expr of expressions) {
      result = result.replace(new RegExp(expr.placeholder, 'g'), expr.original);
    }
    this.logDebug('✅ Expression restoration complete');
    return result;
  }
  applyTemplateLiteralStyle(content, baseIndent) {
    this.logDebug('🎯 Applying template literal styling', {
      baseIndent,
      contentLines: content.split('\n').length,
    });
    if (!content.trim()) {
      return content;
    }
    const lines = content.split('\n');
    const indentStr = '  '.repeat(baseIndent + 1);
    const indentedLines = lines.map((line) => (line.trim() ? indentStr + line : line));
    const result = `\n${indentedLines.join('\n')}\n${'  '.repeat(baseIndent)}`;
    this.logDebug('✅ Template literal styling applied', {
      inputLines: lines.length,
      outputLength: result.length,
    });
    return result;
  }
}
exports.ActorSpaFormattingProvider = ActorSpaFormattingProvider;
class ActorSpaRangeFormattingProvider {
  constructor(outputChannel) {
    this.formattingProvider = new ActorSpaFormattingProvider(outputChannel);
  }
  async provideDocumentRangeFormattingEdits(document, _range, options, token) {
    return this.formattingProvider.provideDocumentFormattingEdits(document, options, token);
  }
}
exports.ActorSpaRangeFormattingProvider = ActorSpaRangeFormattingProvider;
//# sourceMappingURL=formattingProvider.js.map
