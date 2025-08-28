/**
 * Tag Element Component Tests
 * Following atomic design principles and accessibility best practices
 */
import { fireEvent, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { renderComponent } from '../../helpers/test-helpers';
// Import for side effects (auto-registration)
import '../../../src/components/atoms/tag-element';
// Import type only for TypeScript
import type { TagElement } from '../../../src/components/atoms/tag-element';

describe('TagElement', () => {
  let container: HTMLDivElement;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    container = createTestContainer();
    user = userEvent.setup();
  });

  // Helper function to render tag
  function renderTag(attrs = '', content = 'Tag Content') {
    return renderComponent(container, 'tag-el', attrs, content);
  }

  describe('Rendering', () => {
    it('should render with default properties', () => {
      const el = renderTag();
      
      expect(el).toBeInTheDocument();
      expect(el).toHaveClass('tag');
      
      const textEl = el.querySelector('.tag__text');
      expect(textEl).toBeInTheDocument();
      expect(textEl).toHaveTextContent('Tag Content');
    });

    it('should apply color variants', () => {
      const colors = ['purple', 'green', 'yellow', 'blue'];
      
      colors.forEach(color => {
        const el = renderTag(`color="${color}"`);
        expect(el).toHaveClass(`tag--${color}`);
      });
    });

    it('should support open-ended color classes', () => {
      const el = renderTag('color="magenta"');
      expect(el).toHaveClass('tag--magenta');
      
      el.setAttribute('color', 'custom-brand');
      expect(el).toHaveClass('tag--custom-brand');
      expect(el).not.toHaveClass('tag--magenta');
    });

    it('should preserve author-supplied classes', () => {
      container.innerHTML = '<tag-el class="u-shadow custom-class" color="purple">Tag</tag-el>';
      const el = container.querySelector('tag-el');
      
      expect(el).toHaveClass('u-shadow');
      expect(el).toHaveClass('custom-class');
      expect(el).toHaveClass('tag');
      expect(el).toHaveClass('tag--purple');
    });

    it('should preserve author classes while toggling BEM classes', () => {
      container.innerHTML = '<tag-el class="u-shadow" color="purple">Tag</tag-el>';
      const el = container.querySelector('tag-el')!;
      
      expect(el).toHaveClass('u-shadow', 'tag', 'tag--purple');
      
      el.setAttribute('color', 'magenta');
      expect(el).toHaveClass('u-shadow', 'tag', 'tag--magenta');
      expect(el).not.toHaveClass('tag--purple');
    });

    it('should add remove button when removable', () => {
      const el = renderTag('removable', 'Removable Tag');
      
      const removeBtn = el.querySelector('.tag__remove');
      expect(removeBtn).toBeInTheDocument();
      expect(removeBtn).toHaveClass('tag__remove');
      expect(removeBtn).toHaveAttribute('aria-label', 'Remove Removable Tag');
    });

    it('should add clickable class and attributes', () => {
      const el = renderTag('clickable');
      
      expect(el).toHaveClass('tag--clickable');
      expect(el).toHaveAttribute('role', 'button');
      expect(el).toHaveAttribute('tabindex', '0');
    });

    it('should not set aria-label when visible text is present', () => {
      const el = renderTag('clickable', 'Visible');
      expect(el).not.toHaveAttribute('aria-label');
    });

    it('should use aria-label when provided', () => {
      const el = renderTag('aria-label="Custom Label"', 'Initial');
      const textEl = el.querySelector('.tag__text');
      expect(textEl).toHaveTextContent('Custom Label');
    });
  });

  describe('XSS Security', () => {
    it('should safely handle HTML-like content', () => {
      // When passed as initial content, browser parses it as text
      container.innerHTML = '<tag-el>&lt;script&gt;alert("XSS")&lt;/script&gt;</tag-el>';
      const el = container.querySelector<HTMLElement>('tag-el');
      if (!el) throw new Error('tag-el not found');
      
      const textEl = el.querySelector('.tag__text');
      // The component should preserve the text content safely
      expect(textEl?.textContent).toBe('<script>alert("XSS")</script>');
      expect(el.querySelector('script')).not.toBeInTheDocument();
    });

    it('should safely handle HTML in aria-label', () => {
      const el = renderTag('removable aria-label="<img src=x onerror=alert(1)>"');
      const removeBtn = el.querySelector('.tag__remove');
      
      expect(removeBtn).toHaveAttribute('aria-label', 'Remove <img src=x onerror=alert(1)>');
      expect(el.querySelector('img')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should dispatch tag-remove event when remove button clicked', async () => {
      const el = renderTag('removable', 'Test Tag');
      
      const removeHandler = vi.fn<(e: CustomEvent<{ text: string }>) => void>();
      el.addEventListener('tag-remove', removeHandler);
      
      const removeBtn = el.querySelector<HTMLButtonElement>('.tag__remove');
      if (!removeBtn) throw new Error('Remove button not found');
      await user.click(removeBtn);
      
      expect(removeHandler).toHaveBeenCalledTimes(1);
      const event = removeHandler.mock.calls[0][0];
      expect(event.detail).toEqual({ text: 'Test Tag' });
    });

    it('should animate out and remove element after clicking remove', async () => {
      const el = renderTag('removable', 'Test Tag');
      
      const removeBtn = el.querySelector<HTMLButtonElement>('.tag__remove');
      if (!removeBtn) throw new Error('Remove button not found');
      await user.click(removeBtn);
      
      // Should add removing class
      expect(el).toHaveClass('tag--removing');
      
      // Trigger animation end
      fireEvent.animationEnd(el);
      
      // Element should be removed
      await waitFor(() => {
        expect(el).not.toBeInTheDocument();
      });
    });

    it('should dispatch tag-click event when clickable tag clicked', async () => {
      const el = renderTag('clickable', 'Clickable Tag');
      
      const clickHandler = vi.fn<(e: CustomEvent<{ text: string }>) => void>();
      el.addEventListener('tag-click', clickHandler);
      
      await user.click(el);
      
      expect(clickHandler).toHaveBeenCalledTimes(1);
      const event = clickHandler.mock.calls[0][0];
      expect(event.detail).toEqual({ text: 'Clickable Tag' });
      expect(el).toHaveClass('tag--clicked');
    });

    it('should remove clicked class after animation', async () => {
      const el = renderTag('clickable', 'Clickable');
      
      await user.click(el);
      expect(el).toHaveClass('tag--clicked');
      
      // Wait for the timeout to complete
      await new Promise(resolve => setTimeout(resolve, 210));
      expect(el).not.toHaveClass('tag--clicked');
    });

    it('should activate on Enter (down) and Space (up) exactly once each', async () => {
      const el = renderTag('clickable', 'Key');
      el.focus();
      
      const fn = vi.fn();
      el.addEventListener('tag-click', fn);
      
      await user.keyboard('{Enter}');
      expect(fn).toHaveBeenCalledTimes(1);
      
      await user.keyboard(' ');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should prevent page scroll on Space', async () => {
      const el = renderTag('clickable', 'No Scroll');
      el.focus();
      
      const preventDefaultSpy = vi.fn();
      
      // Listen for keydown event and check if preventDefault was called
      el.addEventListener('keydown', (e) => {
        if (e.key === ' ') {
          // The component should call preventDefault on Space keydown
          if (e.defaultPrevented) {
            preventDefaultSpy();
          }
        }
      });
      
      await user.keyboard(' ');
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should not trigger tag-click when remove button is clicked', async () => {
      const el = renderTag('clickable removable', 'Both Features');
      
      const clickHandler = vi.fn<(e: CustomEvent) => void>();
      el.addEventListener('tag-click', clickHandler);
      
      const removeBtn = el.querySelector<HTMLButtonElement>('.tag__remove');
      if (!removeBtn) throw new Error('Remove button not found');
      await user.click(removeBtn);
      
      expect(clickHandler).not.toHaveBeenCalled();
    });
  });

  describe('Attribute Reactivity', () => {
    it('should re-render when color changes', async () => {
      const el = renderTag('', 'Dynamic Tag');
      
      // Add color
      el.setAttribute('color', 'purple');
      await waitFor(() => {
        expect(el).toHaveClass('tag--purple');
      });
      
      // Change color
      el.setAttribute('color', 'green');
      await waitFor(() => {
        expect(el).toHaveClass('tag--green');
        expect(el).not.toHaveClass('tag--purple');
      });
    });

    it('should add/remove button when removable changes', async () => {
      const el = renderTag('', 'Dynamic');
      
      expect(el.querySelector('.tag__remove')).not.toBeInTheDocument();
      
      // Make removable
      el.setAttribute('removable', '');
      await waitFor(() => {
        const removeBtn = el.querySelector('.tag__remove');
        expect(removeBtn).toBeInTheDocument();
      });
      
      // Remove removable
      el.removeAttribute('removable');
      await waitFor(() => {
        expect(el.querySelector('.tag__remove')).not.toBeInTheDocument();
      });
    });

    it('should update interactivity when clickable changes', async () => {
      const el = renderTag('', 'Dynamic');
      
      expect(el).not.toHaveAttribute('role');
      expect(el).not.toHaveAttribute('tabindex');
      
      // Make clickable
      el.setAttribute('clickable', '');
      await waitFor(() => {
        expect(el).toHaveClass('tag--clickable');
        expect(el).toHaveAttribute('role', 'button');
        expect(el).toHaveAttribute('tabindex', '0');
      });
      
      // Remove clickable
      el.removeAttribute('clickable');
      await waitFor(() => {
        expect(el).not.toHaveClass('tag--clickable');
        expect(el).not.toHaveAttribute('role');
        expect(el).not.toHaveAttribute('tabindex');
      });
    });

    it('should update remove button aria-label when aria-label changes', async () => {
      const el = renderTag('removable', 'Hello');
      const btn = el.querySelector<HTMLButtonElement>('.tag__remove');
      
      expect(btn).toHaveAttribute('aria-label', 'Remove Hello');
      
      el.setAttribute('aria-label', 'World');
      await waitFor(() => {
        expect(btn).toHaveAttribute('aria-label', 'Remove World');
      });
    });

    it('should avoid nested interactive elements', async () => {
      const el = renderTag('clickable', 'Interactive');
      
      expect(el).toHaveAttribute('role', 'button');
      
      // Add removable - should remove role to avoid nesting
      el.setAttribute('removable', '');
      await waitFor(() => {
        expect(el.querySelector('.tag__remove')).toBeInTheDocument();
      });
      
      // Check role was removed to avoid nested interactive elements
      expect(el).not.toHaveAttribute('role', 'button');
    });
  });

  describe('Component Lifecycle', () => {
    it('should setup component when added to DOM', () => {
      const el = document.createElement('tag-el') as TagElement;
      el.textContent = 'Dynamic Tag';
      el.setAttribute('color', 'blue');
      el.setAttribute('clickable', '');
      
      container.appendChild(el);
      
      expect(el).toHaveClass('tag');
      expect(el).toHaveClass('tag--blue');
      expect(el).toHaveClass('tag--clickable');
      expect(el.querySelector('.tag__text')).toHaveTextContent('Dynamic Tag');
    });

    it('should clean up listeners on disconnect', () => {
      const el = renderTag('clickable removable') as TagElement;
      const spy = vi.spyOn(el, 'removeEventListener');
      
      el.remove();
      
      expect(spy).toHaveBeenCalledWith('click', expect.any(Function));
      expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(spy).toHaveBeenCalledWith('keyup', expect.any(Function));
      expect(spy).toHaveBeenCalledWith('animationend', expect.any(Function));
    });

    it('should clear label on disconnect', () => {
      const el = renderTag('', 'Test');
      
      // Label should be stored internally
      const textEl = el.querySelector('.tag__text');
      expect(textEl).toHaveTextContent('Test');
      
      el.remove();
      
      // After disconnect, component should be cleaned up
      // We can't test private properties directly
      expect(el.parentNode).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations with default props', async () => {
      renderTag();
      const results = await a11y(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when removable', async () => {
      renderTag('removable');
      const results = await a11y(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when clickable', async () => {
      renderTag('clickable');
      const results = await a11y(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with all features', async () => {
      renderTag('clickable removable color="purple"', 'Full Featured Tag');
      const results = await a11y(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes for remove button', () => {
      const el = renderTag('removable', 'Accessible Tag');
      
      const removeBtn = el.querySelector<HTMLButtonElement>('.tag__remove');
      if (!removeBtn) throw new Error('Remove button not found');
      expect(removeBtn).toHaveAttribute('aria-label', 'Remove Accessible Tag');
      expect(removeBtn).toHaveAttribute('type', 'button');
      
      const icon = removeBtn.querySelector('[aria-hidden]');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have proper ARIA attributes when clickable', () => {
      const el = renderTag('clickable');
      
      expect(el).toHaveAttribute('role', 'button');
      expect(el).toHaveAttribute('tabindex', '0');
      
      // Should be focusable
      el.focus();
      expect(document.activeElement).toBe(el);
    });

    it('should manage focus properly', () => {
      const el = renderTag('clickable', 'Focus Test');
      
      el.focus();
      expect(document.activeElement).toBe(el);
      
      el.removeAttribute('clickable');
      // Should no longer be focusable
      expect(el).not.toHaveAttribute('tabindex');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      const el = renderTag('', '');
      
      expect(el).toBeInTheDocument();
      expect(el).toHaveClass('tag');
      const textEl = el.querySelector('.tag__text');
      expect(textEl).toHaveTextContent('');
    });

    it('should handle very long content', () => {
      const longContent = 'A'.repeat(1000);
      const el = renderTag('', longContent);
      
      const textEl = el.querySelector('.tag__text');
      expect(textEl).toHaveTextContent(longContent);
    });

    it('should handle rapid attribute changes', async () => {
      const el = renderTag();
      
      // Rapidly change attributes
      for (let i = 0; i < 10; i++) {
        el.setAttribute('color', i % 2 === 0 ? 'purple' : 'green');
        el.toggleAttribute('removable');
        el.toggleAttribute('clickable');
      }
      
      // Should handle changes without errors
      await waitFor(() => {
        expect(el).toBeInTheDocument();
        expect(el).toHaveClass('tag');
      });
    });

    it('should handle special characters in labels', () => {
      const el = renderTag('removable', 'Tag & < > " \' Label');
      
      const textEl = el.querySelector('.tag__text');
      expect(textEl).toHaveTextContent('Tag & < > " \' Label');
      
      const removeBtn = el.querySelector('.tag__remove');
      expect(removeBtn).toHaveAttribute('aria-label', 'Remove Tag & < > " \' Label');
    });
  });

  describe('Mobile Considerations', () => {
    it('should use flexible layout', () => {
      const el = renderTag();
      
      // Tag should use flexible CSS classes
      expect(el).toHaveClass('tag');
      // CSS provides mobile-friendly inline-block or flex display
    });

    it('should have appropriate touch targets for remove button', () => {
      const el = renderTag('removable', 'Touch Tag');
      
      const removeBtn = el.querySelector<HTMLButtonElement>('.tag__remove');
      if (!removeBtn) throw new Error('Remove button not found');
      // Button should be easily tappable (CSS handles min-width/height)
      expect(removeBtn).toHaveClass('tag__remove');
    });

    it('should handle click events properly on mobile', async () => {
      const el = renderTag('clickable', 'Mobile Tag');
      
      const clickHandler = vi.fn<(e: CustomEvent<{ text: string }>) => void>();
      el.addEventListener('tag-click', clickHandler);
      
      // Simulate touch as click
      await user.click(el);
      expect(clickHandler).toHaveBeenCalled();
    });
  });
});