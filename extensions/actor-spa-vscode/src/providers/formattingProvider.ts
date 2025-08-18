import { exec } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { promisify } from 'node:util';
import * as vscode from 'vscode';

// Import bundled formatters
let prettier: typeof import('prettier') | undefined;

try {
  prettier = require('prettier');
} catch (_error) {
  // Prettier not available
}

const execAsync = promisify(exec);

interface TemplateInfo {
  range: vscode.Range;
  content: string;
  language: 'html' | 'css';
  indentLevel: number;
  isNested: boolean;
}

interface ExpressionInfo {
  placeholder: string;
  original: string;
  hasNestedTemplate: boolean;
}

export class ActorSpaFormattingProvider implements vscode.DocumentFormattingEditProvider {
  private version: string;

  constructor(private outputChannel?: vscode.OutputChannel) {
    // Get extension version
    const extension = vscode.extensions.getExtension('actor-spa.actor-spa-framework');
    this.version = extension?.packageJSON?.version || 'unknown';
  }

  private log(message: string, data?: unknown): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [Actor-SPA Formatter] ${message}`;
    if (this.outputChannel) {
      const dataStr = data ? ` | Data: ${JSON.stringify(data, null, 2)}` : '';
      this.outputChannel.appendLine(`${logMessage}${dataStr}`);
    }
  }

  private logDebug(message: string, data?: unknown): void {
    const config = vscode.workspace.getConfiguration('actor-spa');
    if (config.get<boolean>('enableDiagnostics', true)) {
      this.log(`[DEBUG] ${message}`, data);
    }
  }

  async provideDocumentFormattingEdits(
    document: vscode.TextDocument,
    options: vscode.FormattingOptions,
    token: vscode.CancellationToken
  ): Promise<vscode.TextEdit[]> {
    this.log(
      `🚀 Starting Actor-SPA document formatting v${this.version} (Biome → Prettier → Simple fallback)`,
      {
        fileName: document.fileName,
        languageId: document.languageId,
        lineCount: document.lineCount,
      }
    );

    const config = vscode.workspace.getConfiguration('actor-spa.formatting');
    if (!config.get<boolean>('enabled', true)) {
      this.log('❌ Formatting disabled in configuration');
      return [];
    }

    const edits: vscode.TextEdit[] = [];
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

  private findTemplates(document: vscode.TextDocument): TemplateInfo[] {
    this.logDebug('🔍 Starting template discovery');

    const templates: TemplateInfo[] = [];
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

  private findTemplatesOfType(
    text: string,
    document: vscode.TextDocument,
    type: 'html' | 'css',
    templates: TemplateInfo[]
  ): number {
    const regex = new RegExp(`\\b(${type})\\s*\``, 'g');
    let match: RegExpExecArray | null;
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

  private isNestedTemplate(text: string, currentPos: number): boolean {
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

  private findClosingBacktick(text: string, start: number): number {
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

  private getIndentLevel(document: vscode.TextDocument, lineNumber: number): number {
    const line = document.lineAt(lineNumber);
    const match = line.text.match(/^(\s*)/);
    const indentLevel = match ? Math.floor(match[1].length / 2) : 0;
    this.logDebug(`📏 Calculated indent level: ${indentLevel} for line ${lineNumber + 1}`);
    return indentLevel;
  }

  private validateTemplateContent(template: TemplateInfo): {
    isValid: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];
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

  private async formatTemplate(
    template: TemplateInfo,
    options: vscode.FormattingOptions
  ): Promise<string> {
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

  private async formatWithBiome(content: string, language: 'html' | 'css'): Promise<string> {
    this.logDebug(`🔧 Formatting ${language} content (Biome CLI → Prettier → Legacy)`, {
      contentLength: content.length,
    });

    try {
      // Step 1: Try Biome CLI first
      try {
        this.logDebug(`🟪 Attempting Biome CLI formatting for ${language}`);

        // Get the extension path for the biome binary
        const extensionPath = vscode.extensions.getExtension(
          'actor-spa.actor-spa-framework'
        )?.extensionPath;

        if (!extensionPath) {
          throw new Error('Extension path not found');
        }

        // Use the biome command from node_modules
        const biomeCommand = path.join(extensionPath, 'node_modules', '.bin', 'biome');

        // Check if biome exists, if not try global installation
        let biomePath = biomeCommand;
        try {
          await fs.promises.access(biomeCommand);
        } catch {
          // Try global biome installation
          biomePath = 'biome';
        }

        // Create a temporary file with the content
        const tempDir = os.tmpdir();
        const tempFile = path.join(tempDir, `biome-format-${Date.now()}.${language}`);

        await fs.promises.writeFile(tempFile, content, 'utf8');

        // Use proper Biome CLI command format: biome format [options] [files...]
        const biomeArgs = ['format', '--write', tempFile];

        try {
          const { stdout, stderr } = await execAsync(`"${biomePath}" ${biomeArgs.join(' ')}`, {
            cwd: extensionPath,
            timeout: 10000, // 10 second timeout
          });

          // Log any output from biome
          if (stdout) {
            this.logDebug('🟪 Biome CLI stdout:', { output: stdout });
          }
          if (stderr) {
            this.logDebug('🟪 Biome CLI stderr:', { output: stderr });
          }

          // Read the formatted content
          const formatted = await fs.promises.readFile(tempFile, 'utf8');

          // Clean up temp file
          await fs.promises.unlink(tempFile).catch(() => {
            // Ignore cleanup errors
          });

          this.logDebug(`✅ Biome CLI formatting successful for ${language}`);
          return formatted;
        } catch (biomeError) {
          // Clean up temp file on error
          await fs.promises.unlink(tempFile).catch(() => {
            // Ignore cleanup errors
          });

          this.logDebug(`⚠️ Biome CLI formatting failed for ${language}`, {
            error: biomeError instanceof Error ? biomeError.message : String(biomeError),
          });
        }
      } catch (biomeSetupError) {
        this.logDebug(`⚠️ Biome CLI setup failed for ${language}`, {
          error:
            biomeSetupError instanceof Error ? biomeSetupError.message : String(biomeSetupError),
        });
      }

      // Step 2: Try bundled Prettier
      if (prettier) {
        try {
          this.logDebug(`🟦 Attempting Prettier formatting for ${language}`);
          const parser = language === 'html' ? 'html' : 'css';
          const formatted = await prettier.format(content, {
            parser,
            printWidth: 100,
            tabWidth: 2,
            useTabs: false,
            semi: true,
            singleQuote: false,
            trailingComma: 'es5',
          });

          this.logDebug(`✅ Prettier formatting successful for ${language}`);
          return formatted;
        } catch (prettierError) {
          this.logDebug(`⚠️ Prettier bundled formatting failed for ${language}`, {
            error: prettierError instanceof Error ? prettierError.message : String(prettierError),
          });
        }
      } else {
        this.logDebug('⚠️ Prettier not available, falling back to legacy');
      }

      // Step 3: Fallback to legacy simple formatting
      this.logDebug(`🟨 Using legacy simple formatting for ${language}`);
      return this.simpleFormat(content, language);
    } catch (error) {
      this.logDebug(`❌ Formatting error for ${language}`, {
        error: error instanceof Error ? error.message : String(error),
      });
      // Return original content if formatting fails
      return content;
    }
  }

  private simpleFormat(content: string, language: 'html' | 'css'): string {
    this.logDebug(`🔧 Applying simple ${language} formatting`);

    if (language === 'html') {
      return this.simpleHtmlFormat(content);
    }
    return this.simpleCssFormat(content);
  }

  private simpleHtmlFormat(content: string): string {
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
    const formatted: string[] = [];
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

  private tryCreateSingleLineTag(
    lines: string[],
    startIndex: number
  ): { success: boolean; content: string; skipToIndex: number } {
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

  private simpleCssFormat(content: string): string {
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
    const indentedLines: string[] = [];
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

  private extractExpressions(content: string): { content: string; expressions: ExpressionInfo[] } {
    this.logDebug('🔍 Extracting template expressions');

    const expressions: ExpressionInfo[] = [];
    let result = content;
    let index = 0;

    // More sophisticated regex to handle nested braces
    const expressionRegex = /\$\{[^}]*(?:\{[^}]*\}[^}]*)*\}/g;
    let match: RegExpExecArray | null;

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

  private restoreExpressions(content: string, expressions: ExpressionInfo[]): string {
    this.logDebug(`🔄 Restoring ${expressions.length} expressions`);

    let result = content;
    for (const expr of expressions) {
      result = result.replace(new RegExp(expr.placeholder, 'g'), expr.original);
    }

    this.logDebug('✅ Expression restoration complete');
    return result;
  }

  private applyTemplateLiteralStyle(content: string, baseIndent: number): string {
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

export class ActorSpaRangeFormattingProvider implements vscode.DocumentRangeFormattingEditProvider {
  private formattingProvider: ActorSpaFormattingProvider;

  constructor(outputChannel?: vscode.OutputChannel) {
    this.formattingProvider = new ActorSpaFormattingProvider(outputChannel);
  }

  async provideDocumentRangeFormattingEdits(
    document: vscode.TextDocument,
    _range: vscode.Range,
    options: vscode.FormattingOptions,
    token: vscode.CancellationToken
  ): Promise<vscode.TextEdit[]> {
    return this.formattingProvider.provideDocumentFormattingEdits(document, options, token);
  }
}
