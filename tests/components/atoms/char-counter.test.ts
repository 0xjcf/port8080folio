/**
 * Character Counter Component Tests
 * Following atomic design principles and accessibility best practices
 */
import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { renderComponent, renderHTML, querySelector } from '../../helpers/test-helpers';
// Import for side effects (auto-registration)
import '../../../src/components/atoms/char-counter';

describe('CharCounter', () => {
  let container: HTMLDivElement;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    container = createTestContainer();
    user = userEvent.setup();
  });

  // Helper function to render counter (char-counter needs a target input/textarea)
  function renderCounter(inputType = 'input', max = '100', initialValue = '') {
    // First create the input element
    if (inputType === 'textarea') {
      renderHTML(container, `<textarea id="test-input">${initialValue}</textarea>`);
    } else {
      renderHTML(container, `<input id="test-input" type="text" value="${initialValue}">`);
    }
    
    // Then add the counter component using renderComponent
    const tempDiv = document.createElement('div');
    const counter = renderComponent(tempDiv, 'char-counter', `target="#test-input" max="${max}"`);
    container.appendChild(counter);
    
    const input = querySelector<HTMLInputElement | HTMLTextAreaElement>(container, '#test-input');
    
    return { input, counter };
  }

  describe('Rendering', () => {
    it('should render with character count when no max specified', () => {
      const { counter } = renderCounter('input', '0', 'Hello');
      
      expect(counter).toBeInTheDocument();
      expect(counter).toHaveClass('char-counter');
      const countEl = counter.querySelector('.char-counter__count');
      expect(countEl).toHaveTextContent('5 characters');
    });

    it('should render with remaining count when max specified', () => {
      const { counter } = renderCounter('input', '50', 'Hello');
      
      const countEl = counter.querySelector('.char-counter__count');
      expect(countEl).toHaveTextContent('45 characters remaining');
    });

    it('should work with textarea elements', () => {
      const { counter } = renderCounter('textarea', '100', 'Test content');
      
      const countEl = counter.querySelector('.char-counter__count');
      expect(countEl).toHaveTextContent('88 characters remaining');
    });

    it('should not render if target not found', () => {
      container.innerHTML = '<char-counter target="#nonexistent" max="100"></char-counter>';
      const counter = container.querySelector('char-counter');
      
      expect(counter).toBeInTheDocument();
      expect(counter).toHaveTextContent('');
    });

    it('should not render if target attribute missing', () => {
      container.innerHTML = '<char-counter max="100"></char-counter>';
      const counter = container.querySelector('char-counter');
      
      expect(counter).toBeInTheDocument();
      expect(counter).toHaveTextContent('');
    });
  });

  describe('Real-time Updates', () => {
    it('should update count on input', async () => {
      const { input, counter } = renderCounter('input', '50');
      
      await user.type(input, 'Hello world');
      
      const countEl = counter.querySelector('.char-counter__count');
      expect(countEl).toHaveTextContent('39 characters remaining');
    });

    it('should update count on deletion', async () => {
      const { input, counter } = renderCounter('input', '50', 'Hello world');
      
      const countEl = counter.querySelector('.char-counter__count');
      expect(countEl).toHaveTextContent('39 characters remaining');
      
      await user.clear(input);
      await user.type(input, 'Hi');
      
      expect(countEl).toHaveTextContent('48 characters remaining');
    });

    it('should handle paste events', async () => {
      const { input, counter } = renderCounter('input', '50');
      
      input.value = 'Pasted content here';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      
      await waitFor(() => {
        const countEl = counter.querySelector('.char-counter__count');
        expect(countEl).toHaveTextContent('31 characters remaining');
      });
    });

    it('should handle programmatic value changes', async () => {
      const { input, counter } = renderCounter('input', '50');
      
      input.value = 'Programmatic text';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      
      await waitFor(() => {
        const countEl = counter.querySelector('.char-counter__count');
        expect(countEl).toHaveTextContent('33 characters remaining');
      });
    });
  });

  describe('Visual Feedback', () => {
    it('should show warning color when approaching limit', () => {
      const { counter } = renderCounter('input', '50', 'This is a text that is getting close to limit');
      
      // 46 chars, 4 remaining - should have warning class
      const countEl = counter.querySelector('.char-counter__count');
      expect(countEl).toHaveClass('char-counter__count--warning');
    });

    it('should show error color when over limit', async () => {
      const { input, counter } = renderCounter('input', '10', 'Short');
      
      const countEl = counter.querySelector('.char-counter__count')!;
      
      // Start with 5 chars, 5 remaining - should have warning class (< 10)
      expect(countEl).toHaveClass('char-counter__count--warning');
      expect(countEl).not.toHaveClass('char-counter__count--error');
      
      // Type more to exceed limit
      await user.type(input, ' text that exceeds');
      
      // Now over limit - should have error class (not warning)
      expect(countEl).toHaveClass('char-counter__count--error');
      expect(countEl).not.toHaveClass('char-counter__count--warning');
      expect(countEl).toHaveTextContent('-13 characters remaining');
    });

    it('should use default styling when within safe range', () => {
      const { counter } = renderCounter('input', '100', 'Normal text');
      
      const countEl = counter.querySelector('.char-counter__count');
      expect(countEl).not.toHaveClass('char-counter__count--warning');
      expect(countEl).not.toHaveClass('char-counter__count--error');
    });

    it('should transition classes at correct thresholds', async () => {
      const { input, counter } = renderCounter('input', '20');
      const countEl = counter.querySelector('.char-counter__count')!;
      
      // Start empty - no warning/error class
      expect(countEl).not.toHaveClass('char-counter__count--warning');
      expect(countEl).not.toHaveClass('char-counter__count--error');
      
      // Type to exactly 10 chars remaining - still normal
      await user.type(input, '1234567890');
      expect(countEl).not.toHaveClass('char-counter__count--warning');
      
      // Type one more - now 9 remaining - should be warning
      await user.type(input, '1');
      expect(countEl).toHaveClass('char-counter__count--warning');
      
      // Type to exceed - should be error
      await user.type(input, '234567890123');
      expect(countEl).toHaveClass('char-counter__count--error');
      expect(countEl).not.toHaveClass('char-counter__count--warning');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input', () => {
      const { counter } = renderCounter('input', '50', '');
      
      const countEl = counter.querySelector('.char-counter__count');
      expect(countEl).toHaveTextContent('50 characters remaining');
    });

    it('should handle very long text', async () => {
      const longText = 'A'.repeat(1000);
      const { input, counter } = renderCounter('textarea', '100');
      
      input.value = longText;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      
      await waitFor(() => {
        const countEl = counter.querySelector('.char-counter__count');
        expect(countEl).toHaveTextContent('-900 characters remaining');
        expect(countEl).toHaveClass('char-counter__count--error');
      });
    });

    it('should handle invalid max attribute', () => {
      const { counter } = renderCounter('input', 'invalid', 'Test');
      
      // Should fall back to character count only
      const countEl = counter.querySelector('.char-counter__count');
      expect(countEl).toHaveTextContent('4 characters');
    });

    it('should handle negative max values', () => {
      const { counter } = renderCounter('input', '-50', 'Test');
      
      // Should treat as no max
      const countEl = counter.querySelector('.char-counter__count');
      expect(countEl).toHaveTextContent('4 characters');
    });

    it('should handle special characters and emojis', async () => {
      const { input, counter } = renderCounter('input', '50');
      
      await user.type(input, 'Hello 👋 world! 🌍');
      
      // Should count actual characters including emojis (grapheme clusters)
      // "Hello 👋 world! 🌍" = 16 characters with proper emoji counting
      const countEl = counter.querySelector('.char-counter__count');
      expect(countEl).toHaveTextContent('34 characters remaining');
    });

    it('should handle multi-line text in textarea', async () => {
      const { input, counter } = renderCounter('textarea', '100');
      
      input.value = 'Line 1\nLine 2\nLine 3';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      
      await waitFor(() => {
        const countEl = counter.querySelector('.char-counter__count');
        expect(countEl).toHaveTextContent('80 characters remaining');
      });
    });
  });

  describe('Component Lifecycle', () => {
    it('should setup counter when added to DOM', () => {
      container.innerHTML = '<input id="test-input" value="Initial">';
      
      const counter = document.createElement('char-counter');
      counter.setAttribute('target', '#test-input');
      counter.setAttribute('max', '50');
      
      container.appendChild(counter);
      
      const countEl = counter.querySelector('.char-counter__count');
      expect(countEl).toHaveTextContent('43 characters remaining');
    });

    it('should remove listeners on disconnect', async () => {
      const { input, counter } = renderCounter('input', '50');
      const removeSpy = vi.spyOn(input, 'removeEventListener');
      
      counter.remove(); // triggers disconnectedCallback
      
      expect(removeSpy).toHaveBeenCalledWith('input', expect.any(Function));
    });

    it('should handle multiple counters for different inputs', () => {
      container.innerHTML = `
        <input id="input1" value="First">
        <textarea id="input2">Second text</textarea>
        <char-counter id="counter1" target="#input1" max="20"></char-counter>
        <char-counter id="counter2" target="#input2" max="30"></char-counter>
      `;
      
      const counter1 = container.querySelector('#counter1');
      const counter2 = container.querySelector('#counter2');
      
      const countEl1 = counter1?.querySelector('.char-counter__count');
      const countEl2 = counter2?.querySelector('.char-counter__count');
      
      expect(countEl1).toHaveTextContent('15 characters remaining');
      expect(countEl2).toHaveTextContent('19 characters remaining');
    });

  });

  describe('Accessibility', () => {
    it('should have appropriate ARIA attributes', () => {
      const { counter } = renderCounter('input', '50', 'Test');
      
      // Counter should have appropriate ARIA attributes
      expect(counter).toHaveAttribute('role', 'status');
      expect(counter).toHaveAttribute('aria-live', 'polite');
      expect(counter).toHaveAttribute('aria-atomic', 'true');
    });

    it('should provide clear text feedback', () => {
      const { counter } = renderCounter('input', '50', '');
      
      // Text should be clear and descriptive
      const countEl = counter.querySelector('.char-counter__count');
      expect(countEl?.textContent).toMatch(/\d+ characters remaining/);
    });

    it('should have proper styling via classes', () => {
      const { counter } = renderCounter('input', '50', 'Text');
      
      // Using CSS classes for styling, not inline styles
      const countEl = counter.querySelector('.char-counter__count');
      expect(countEl).toHaveClass('char-counter__count');
      expect(countEl).not.toHaveAttribute('style');
    });

    it('should work with screen readers', () => {
      const { counter } = renderCounter('input', '50', 'Accessible');
      
      // Check for live region attributes
      expect(counter).toHaveAttribute('role', 'status');
      expect(counter).toHaveAttribute('aria-live', 'polite');
      expect(counter).toHaveAttribute('aria-atomic', 'true');
      
      // Text content should be readable by screen readers
      const countEl = counter.querySelector('.char-counter__count');
      expect(countEl).toHaveTextContent('40 characters remaining');
    });
  });

  describe('Integration', () => {
    it('should work with form validation', async () => {
      container.innerHTML = `
        <form>
          <input id="test-input" maxlength="50" required>
          <char-counter target="#test-input" max="50"></char-counter>
        </form>
      `;
      
      const input = container.querySelector<HTMLInputElement>('#test-input');
      const counter = container.querySelector('char-counter');
      
      if (!input || !counter) throw new Error('Elements not found');
      
      await user.type(input, 'Form input text');
      
      const countEl = counter.querySelector('.char-counter__count');
      expect(countEl).toHaveTextContent('35 characters remaining');
      expect(input.validity.valid).toBe(true);
    });

    it('should complement HTML maxlength attribute', async () => {
      container.innerHTML = `
        <input id="test-input" maxlength="20">
        <char-counter target="#test-input" max="20"></char-counter>
      `;
      
      const input = container.querySelector<HTMLInputElement>('#test-input');
      const counter = container.querySelector('char-counter');
      
      if (!input || !counter) throw new Error('Elements not found');
      
      // Try to type more than maxlength allows
      await user.type(input, 'This is exactly twenty!!');
      
      // Should stop at 20 chars due to maxlength
      expect(input.value).toHaveLength(20);
      const countEl = counter.querySelector('.char-counter__count');
      expect(countEl).toHaveTextContent('0 characters remaining');
    });

    it('should handle dynamic input creation', () => {
      // Create input dynamically
      const input = document.createElement('input');
      input.id = 'dynamic-input';
      input.value = 'Dynamic';
      container.appendChild(input);
      
      // Create counter
      const counter = document.createElement('char-counter');
      counter.setAttribute('target', '#dynamic-input');
      counter.setAttribute('max', '30');
      container.appendChild(counter);
      
      const countEl = counter.querySelector('.char-counter__count');
      expect(countEl).toHaveTextContent('23 characters remaining');
    });
  });
});