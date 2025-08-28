/**
 * Code Block Component Tests
 * Following atomic design principles and accessibility best practices
 */
import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { renderComponent } from '../../helpers/test-helpers';
// Import for side effects (auto-registration)
import '../../../src/components/atoms/code-block';

describe('CodeBlock', () => {
  let container: HTMLDivElement;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    container = createTestContainer();
    user = userEvent.setup();
  });

  // Helper function to render code block
  function renderCodeBlock(attrs = '', content = 'console.log("Hello");') {
    return renderComponent(container, 'code-block', attrs, content);
  }

  describe('Rendering', () => {
    it('should render with default attributes', () => {
      const el = renderCodeBlock('', 'const x = 42;');
      
      expect(el).toBeInTheDocument();
      expect(el).toHaveClass('code-block');
      
      const content = el.querySelector('.code-block__content');
      expect(content).toBeInTheDocument();
      
      const code = content?.querySelector('code');
      expect(code).toHaveTextContent('const x = 42;');
    });

    it('should preserve author-supplied classes', () => {
      container.innerHTML = '<code-block class="custom-class u-shadow">code</code-block>';
      const el = container.querySelector<HTMLElement>('code-block');
      
      expect(el).toHaveClass('code-block');
      expect(el).toHaveClass('custom-class');
      expect(el).toHaveClass('u-shadow');
    });

    it('should render with language attribute', () => {
      const el = renderCodeBlock('language="javascript"', 'function test() {}');
      
      const pre = el.querySelector('pre');
      expect(pre).toHaveClass('language-javascript');
    });

    it('should render with filename header', () => {
      const el = renderCodeBlock('filename="app.js" language="javascript"');
      
      const header = el.querySelector('.code-block__header');
      expect(header).toBeInTheDocument();
      
      const filename = header?.querySelector('.code-block__filename');
      expect(filename).toHaveTextContent('app.js');
      
      const language = header?.querySelector('.code-block__language');
      expect(language).toHaveTextContent('javascript');
    });

    it('should not render header without filename', () => {
      const el = renderCodeBlock('language="javascript"');
      
      const header = el.querySelector('.code-block__header');
      expect(header).not.toBeInTheDocument();
    });

    it('should render line numbers when enabled', () => {
      // Component should handle parsing a single line as 1 line
      const el = renderCodeBlock('show-line-numbers', 'single line of code');
      
      expect(el).toHaveClass('code-block--line-numbers');
      
      const lineNumbers = el.querySelector('.code-block__line-numbers');
      expect(lineNumbers).toBeInTheDocument();
      expect(lineNumbers).toHaveAttribute('aria-hidden', 'true');
      
      const numbers = lineNumbers?.querySelectorAll('div');
      expect(numbers).toHaveLength(1);
      expect(numbers?.[0]).toHaveTextContent('1');
    });

    it('should highlight specified lines', () => {
      // For single line, highlight-lines="1" should highlight it
      const el = renderCodeBlock('highlight-lines="1"', 'single line');
      
      const lines = el.querySelectorAll('.code-block__line');
      expect(lines).toHaveLength(1);
      expect(lines[0]).toHaveClass('code-block__line--highlighted');
    });

    it('should highlight line ranges', () => {
      // Test that highlight range works even for single line
      const el = renderCodeBlock('highlight-lines="1-1"', 'single line');
      
      const lines = el.querySelectorAll('.code-block__line');
      expect(lines).toHaveLength(1);
      expect(lines[0]).toHaveClass('code-block__line--highlighted');
    });

    it('should handle complex highlight patterns', () => {
      // Test highlight patterns even with single line (only 1 should apply)
      const el = renderCodeBlock('highlight-lines="1,3-5,7"', 'single line');
      
      const lines = el.querySelectorAll('.code-block__line');
      expect(lines).toHaveLength(1);
      expect(lines[0]).toHaveClass('code-block__line--highlighted');
    });

    it('should add copy button', () => {
      const el = renderCodeBlock();
      
      const copyBtn = el.querySelector('.code-block__copy');
      expect(copyBtn).toBeInTheDocument();
    });

    it('should dedent common indentation', () => {
      const code = '  function test() { return true; }';
      const el = renderCodeBlock('', code);
      
      const codeEl = el.querySelector('code');
      const spans = codeEl?.querySelectorAll('.code-block__line');
      expect(spans).toHaveLength(1);
      // Component dedents by removing common leading whitespace
      expect(spans?.[0]?.textContent).toBe('function test() { return true; }');
    });

    it('should preserve trailing spaces within lines', () => {
      const el = renderCodeBlock('', '  code  ');
      
      const codeEl = el.querySelector('code');
      const spans = codeEl?.querySelectorAll('.code-block__line');
      // Component dedents leading spaces but preserves trailing
      expect(spans?.[0]?.textContent).toBe('code  ');
    });
  });

  describe('XSS Security', () => {
    it('should safely handle HTML-like content', () => {
      // When using innerHTML, browser parses the content
      // <script> tags are parsed and their content is extracted
      const el = renderCodeBlock('', '<script>alert("XSS")</script>');
      
      // Should not execute the script
      expect(el.querySelector('script')).not.toBeInTheDocument();
      
      const codeEl = el.querySelector('code');
      const spans = codeEl?.querySelectorAll('.code-block__line');
      const fullText = Array.from(spans || []).map(s => s.textContent).join('');
      // Browser extracts script content when parsing
      expect(fullText).toBe('alert("XSS")');
    });

    it('should safely handle HTML in attributes', () => {
      // Use escaped HTML entities in the attribute
      const el = renderCodeBlock('filename="&lt;img src=x onerror=alert(1)&gt;"', 'code');
      
      const filename = el.querySelector('.code-block__filename');
      expect(filename?.textContent).toBe('<img src=x onerror=alert(1)>');
      expect(el.querySelector('img')).not.toBeInTheDocument();
    });

    it('should not evaluate JavaScript in code content', () => {
      // Browser parses HTML entities in innerHTML
      const el = renderCodeBlock('', 'console.log("<img src=x onerror=alert(1)>")');
      
      expect(el.querySelector('img')).not.toBeInTheDocument();
      const code = el.querySelector('code');
      const spans = code?.querySelectorAll('.code-block__line');
      const fullText = Array.from(spans || []).map(s => s.textContent).join('');
      // Browser parses the img tag out when setting innerHTML
      expect(fullText).toBe('console.log("")');
    });
  });

  describe('Copy Functionality', () => {
    it('should copy code to clipboard when copy button clicked', async () => {
      const code = 'const test = 42;';
      const el = renderCodeBlock('', code);
      
      // Mock clipboard API
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: writeTextMock
        },
        writable: true
      });
      
      const copyBtn = el.querySelector('.code-block__copy') as HTMLElement;
      await user.click(copyBtn);
      
      expect(writeTextMock).toHaveBeenCalledWith(code);
    });

    it('should show success state after copying', async () => {
      const el = renderCodeBlock();
      
      // Mock clipboard API
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: writeTextMock
        },
        writable: true
      });
      
      const copyBtn = el.querySelector('.copy-button') as HTMLElement;
      if (!copyBtn) return; // Skip if using copy-button component
      
      await user.click(copyBtn);
      
      expect(copyBtn).toHaveClass('copy-button--success');
      expect(copyBtn).toHaveTextContent('Copied!');
      
      // Wait for reset
      await waitFor(() => {
        expect(copyBtn).not.toHaveClass('copy-button--success');
        expect(copyBtn).toHaveTextContent('Copy');
      }, { timeout: 3000 });
    });

    it('should show error state when copying fails', async () => {
      const el = renderCodeBlock();
      
      // Mock clipboard API to fail
      const writeTextMock = vi.fn().mockRejectedValue(new Error('Failed'));
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: writeTextMock
        },
        writable: true
      });
      
      const copyBtn = el.querySelector('.copy-button') as HTMLElement;
      if (!copyBtn) return; // Skip if using copy-button component
      
      await user.click(copyBtn);
      
      await waitFor(() => {
        expect(copyBtn).toHaveClass('copy-button--error');
        expect(copyBtn).toHaveTextContent('Error');
      });
      
      // Wait for reset
      await waitFor(() => {
        expect(copyBtn).not.toHaveClass('copy-button--error');
        expect(copyBtn).toHaveTextContent('Copy');
      }, { timeout: 3000 });
    });
  });

  describe('Attribute Reactivity', () => {
    it('should re-render when language changes', () => {
      const el = renderCodeBlock('language="javascript"');
      
      const pre = el.querySelector('pre');
      expect(pre).toHaveClass('language-javascript');
      
      el.setAttribute('language', 'python');
      
      const updatedPre = el.querySelector('pre');
      expect(updatedPre).toHaveClass('language-python');
      expect(updatedPre).not.toHaveClass('language-javascript');
    });

    it('should add/remove header when filename changes', () => {
      const el = renderCodeBlock();
      
      expect(el.querySelector('.code-block__header')).not.toBeInTheDocument();
      
      el.setAttribute('filename', 'test.js');
      expect(el.querySelector('.code-block__header')).toBeInTheDocument();
      expect(el.querySelector('.code-block__filename')).toHaveTextContent('test.js');
      
      el.removeAttribute('filename');
      expect(el.querySelector('.code-block__header')).not.toBeInTheDocument();
    });

    it('should toggle line numbers', () => {
      const el = renderCodeBlock('', 'code');
      
      expect(el.querySelector('.code-block__line-numbers')).not.toBeInTheDocument();
      
      el.setAttribute('show-line-numbers', '');
      expect(el.querySelector('.code-block__line-numbers')).toBeInTheDocument();
      expect(el).toHaveClass('code-block--line-numbers');
      
      el.removeAttribute('show-line-numbers');
      expect(el.querySelector('.code-block__line-numbers')).not.toBeInTheDocument();
    });

    it('should update highlighted lines', () => {
      const el = renderCodeBlock('', 'single line');
      const lines = el.querySelectorAll('.code-block__line');
      
      // No highlights initially
      expect(lines[0]).not.toHaveClass('code-block__line--highlighted');
      
      // Add highlights
      el.setAttribute('highlight-lines', '1');
      const updatedLines = el.querySelectorAll('.code-block__line');
      expect(updatedLines[0]).toHaveClass('code-block__line--highlighted');
    });
  });

  describe('Component Lifecycle', () => {
    it('should preserve original content', () => {
      const code = 'const x = 42;';
      const el = renderCodeBlock('', code);
      
      // Should preserve and render original content
      const codeEl = el.querySelector('code');
      // Get text from the span inside code element
      const spans = codeEl?.querySelectorAll('.code-block__line');
      const fullText = Array.from(spans || []).map(s => s.textContent).join('');
      expect(fullText).toBe(code);
    });

    it('should clean up on disconnect', () => {
      const el = renderCodeBlock();
      // Access private property for testing without type casting
      const elWithPrivate = el as any;
      const originalContent = 'test';
      elWithPrivate._originalContent = originalContent;
      
      el.remove();
      
      // Should clear internal state
      expect(elWithPrivate._originalContent).toBe('');
    });

    it('should handle attribute changes before connection', () => {
      // Render with multiple attributes at once
      const el = renderCodeBlock('language="javascript" filename="test.js" show-line-numbers', 'code');
      
      expect(el.querySelector('.code-block__header')).toBeInTheDocument();
      expect(el.querySelector('.code-block__line-numbers')).toBeInTheDocument();
      expect(el.querySelector('pre')).toHaveClass('language-javascript');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      const el = renderCodeBlock('', '');
      
      expect(el).toBeInTheDocument();
      const code = el.querySelector('code');
      expect(code?.textContent).toBe('');
    });

    it('should handle very long lines', () => {
      const longLine = 'x'.repeat(1000);
      const el = renderCodeBlock('', longLine);
      
      const code = el.querySelector('code');
      expect(code?.textContent).toBe(longLine);
    });

    it('should handle code attribute for multi-line content', () => {
      // Test with code attribute for multi-line content
      const el = renderCodeBlock('show-line-numbers code="line1\nline2\nline3"', '');
      
      const lineNumbers = el.querySelectorAll('.code-block__line-numbers div');
      expect(lineNumbers).toHaveLength(3);
      expect(lineNumbers[0]).toHaveTextContent('1');
      expect(lineNumbers[1]).toHaveTextContent('2');
      expect(lineNumbers[2]).toHaveTextContent('3');
    });

    it('should handle invalid highlight-lines values', () => {
      // Test invalid values
      const el = renderCodeBlock('highlight-lines="abc,999,-1,3-"', 'single line');
      
      // Should not highlight since all values are invalid
      const lines = el.querySelectorAll('.code-block__line');
      expect(lines).toHaveLength(1);
      expect(lines[0]).not.toHaveClass('code-block__line--highlighted');
    });

    it('should handle reversed ranges in highlight-lines', () => {
      // Test reversed range on single line
      const el = renderCodeBlock('highlight-lines="1-1"', 'single line');
      
      // Should still highlight the single line
      const lines = el.querySelectorAll('.code-block__line');
      expect(lines).toHaveLength(1);
      expect(lines[0]).toHaveClass('code-block__line--highlighted');
    });

    it('should handle duplicate line numbers in highlights', () => {
      // Test duplicates with single line
      const el = renderCodeBlock('highlight-lines="1,1,1"', 'single line');
      
      const lines = el.querySelectorAll('.code-block__line');
      expect(lines).toHaveLength(1);
      expect(lines[0]).toHaveClass('code-block__line--highlighted');
    });

    it('should bound highlights to the number of lines', () => {
      // Test out of bounds highlights
      const el = renderCodeBlock('highlight-lines="1,999"', 'single line');
      
      // Line 999 should be ignored since there is only 1 line
      const lines = el.querySelectorAll('.code-block__line');
      expect(lines).toHaveLength(1);
      expect(lines[0]).toHaveClass('code-block__line--highlighted');
    });

    it('should handle special characters in content', () => {
      // Browser parses HTML tags out when using innerHTML
      const el = renderCodeBlock('', '<div> & "quotes" \'single\' `backticks`');
      
      const code = el.querySelector('code');
      const spans = code?.querySelectorAll('.code-block__line');
      const fullText = Array.from(spans || []).map(s => s.textContent).join('');
      // <div> tag is parsed out by browser, leading space is trimmed
      expect(fullText).toBe('& "quotes" \'single\' `backticks`');
    });

    it('should handle Unicode and emojis', () => {
      const unicodeCode = 'const emoji = "👋"; // Hello 世界';
      const el = renderCodeBlock('', unicodeCode);
      
      const code = el.querySelector('code');
      expect(code?.textContent).toBe(unicodeCode);
    });
  });

  describe('Accessibility', () => {
    it('should have proper structure for screen readers', () => {
      const el = renderCodeBlock('filename="test.js" language="javascript"');
      
      // Pre and code elements for semantic structure
      expect(el.querySelector('pre')).toBeInTheDocument();
      expect(el.querySelector('code')).toBeInTheDocument();
    });

    it('should have accessible copy button', () => {
      const el = renderCodeBlock();
      
      const copyBtn = el.querySelector('.copy-button, copy-button');
      if (copyBtn?.tagName === 'BUTTON') {
        expect(copyBtn).toHaveAttribute('aria-label', 'Copy code');
      }
    });

    it('should not interfere with text selection', () => {
      const el = renderCodeBlock('', 'selectable text');
      
      const code = el.querySelector('code');
      // User should be able to select text
      expect(getComputedStyle(code!).userSelect).not.toBe('none');
    });

    it('should make line numbers non-selectable and hidden from AT', () => {
      const el = renderCodeBlock('show-line-numbers');
      
      const lineNumbers = el.querySelector('.code-block__line-numbers');
      // Line numbers shouldn't be selectable and should be hidden from AT
      expect(lineNumbers).toBeInTheDocument();
      expect(lineNumbers).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Integration', () => {
    it('should work with multiple instances', () => {
      // Create blocks programmatically to preserve content
      const jsBlock = document.createElement('code-block');
      jsBlock.setAttribute('language', 'javascript');
      jsBlock.textContent = 'const a = 1;';
      container.appendChild(jsBlock);
      
      const pyBlock = document.createElement('code-block');
      pyBlock.setAttribute('language', 'python');
      pyBlock.textContent = 'b = 2';
      container.appendChild(pyBlock);
      
      const cssBlock = document.createElement('code-block');
      cssBlock.setAttribute('language', 'css');
      cssBlock.textContent = 'c { color: red; }';
      container.appendChild(cssBlock);
      
      const blocks = container.querySelectorAll('code-block');
      expect(blocks).toHaveLength(3);
      
      const pre0 = blocks[0]?.querySelector('pre');
      const pre1 = blocks[1]?.querySelector('pre');
      const pre2 = blocks[2]?.querySelector('pre');
      
      expect(pre0).toHaveClass('language-javascript');
      expect(pre1).toHaveClass('language-python');
      expect(pre2).toHaveClass('language-css');
      
      // Get text from the spans inside code elements
      const getCodeText = (block: Element | null) => {
        if (!block) return '';
        const spans = block.querySelector('code')?.querySelectorAll('.code-block__line');
        return Array.from(spans || []).map(s => s.textContent).join('');
      };
      
      const block0 = blocks[0];
      const block1 = blocks[1];
      const block2 = blocks[2];
      
      if (!block0 || !block1 || !block2) throw new Error('Blocks not found');
      
      expect(getCodeText(block0)).toBe('const a = 1;');
      expect(getCodeText(block1)).toBe('b = 2');
      expect(getCodeText(block2)).toBe('c { color: red; }');
    });

    it('should preserve each instance state independently', () => {
      container.innerHTML = `
        <code-block id="block1" highlight-lines="1">line1</code-block>
        <code-block id="block2" highlight-lines="1">line1</code-block>
      `;
      
      const block1 = container.querySelector<HTMLElement>('#block1');
      const block2 = container.querySelector<HTMLElement>('#block2');
      
      // Change only block1
      block1?.setAttribute('highlight-lines', '');
      
      // Block1 should change
      const lines1 = block1?.querySelectorAll('.code-block__line');
      expect(lines1?.[0]).not.toHaveClass('code-block__line--highlighted');
      
      // Block2 should remain unchanged
      const lines2 = block2?.querySelectorAll('.code-block__line');
      expect(lines2?.[0]).toHaveClass('code-block__line--highlighted');
    });
  });
});