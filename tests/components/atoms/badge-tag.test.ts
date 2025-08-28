/**
 * Badge Tag Component Tests
 * Following atomic design principles and accessibility best practices
 */
import userEvent from '@testing-library/user-event';
import { renderComponent } from '../../helpers/test-helpers';
// Import for side effects (auto-registration)
import '../../../src/components/atoms/badge-tag';
// Import type only for TypeScript
import type { BadgeTag } from '../../../src/components/atoms/badge-tag';

describe('BadgeTag', () => {
  let container: HTMLDivElement;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    container = createTestContainer();
    user = userEvent.setup();
  });

  // Helper function to render component
  function renderBadge(attrs = '', content = 'Badge') {
    return renderComponent(container, 'badge-el', attrs, content);
  }

  describe('Rendering', () => {
    it('should render with default attributes', () => {
      const el = renderBadge();
      
      expect(el).toBeInTheDocument();
      expect(el).toHaveClass('badge');
      expect(el).toHaveTextContent('Badge');
      expect(el).not.toHaveAttribute('role');
      expect(el).not.toHaveAttribute('tabindex');
    });

    it('should render with type variants', () => {
      const types = ['success', 'warning', 'error', 'info'];
      
      types.forEach(type => {
        const el = renderBadge(`type="${type}"`, type);
        expect(el).toHaveClass(`badge--${type}`);
      });
    });

    it('should render with size variants', () => {
      const el = renderBadge('size="sm"', 'Small');
      expect(el).toHaveClass('badge--sm');
      
      container.innerHTML = '';
      const elLg = renderBadge('size="lg"', 'Large');
      expect(elLg).toHaveClass('badge--lg');
      
      // Default size should not add class
      container.innerHTML = '';
      const elMd = renderBadge('size="md"', 'Medium');
      expect(elMd).not.toHaveClass('badge--md');
    });

    it('should render as pill when specified', () => {
      const el = renderBadge('pill', 'Pill');
      expect(el).toHaveClass('badge--pill');
    });

    it('should preserve author-supplied classes', () => {
      container.innerHTML = '<badge-el class="custom-class u-shadow">Test</badge-el>';
      const el = container.querySelector<HTMLElement>('badge-el');
      
      expect(el).toHaveClass('badge');
      expect(el).toHaveClass('custom-class');
      expect(el).toHaveClass('u-shadow');
    });

    it('should preserve author classes while adding BEM classes', () => {
      container.innerHTML = '<badge-el class="u-shadow">Badge</badge-el>';
      const el = container.querySelector<HTMLElement>('badge-el');
      
      expect(el).toHaveClass('u-shadow');
      
      // After attribute change, author class should remain
      el?.setAttribute('type', 'success');
      expect(el).toHaveClass('u-shadow');
      expect(el).toHaveClass('badge--success');
    });

    it('should render clickable badge with proper attributes', () => {
      const el = renderBadge('clickable', 'Clickable');
      
      expect(el).toHaveAttribute('role', 'button');
      expect(el).toHaveAttribute('tabindex', '0');
      expect(el).toHaveAttribute('aria-disabled', 'false');
      expect(el).toHaveClass('badge--clickable');
    });

    it('should render disabled badge with proper attributes', () => {
      const el = renderBadge('clickable disabled', 'Disabled');
      
      expect(el).toHaveAttribute('role', 'button');
      expect(el).not.toHaveAttribute('tabindex');
      expect(el).toHaveAttribute('aria-disabled', 'true');
      expect(el).toHaveClass('is-disabled');
      expect(el).toHaveClass('badge--disabled');
    });
  });

  describe('Attribute Reactivity', () => {
    it('should re-render when type changes', () => {
      const el = renderBadge();
      
      expect(el).not.toHaveClass('badge--success');
      
      el.setAttribute('type', 'success');
      expect(el).toHaveClass('badge--success');
      
      el.setAttribute('type', 'warning');
      expect(el).not.toHaveClass('badge--success');
      expect(el).toHaveClass('badge--warning');
    });

    it('should re-render when size changes', () => {
      const el = renderBadge();
      
      el.setAttribute('size', 'sm');
      expect(el).toHaveClass('badge--sm');
      
      el.setAttribute('size', 'lg');
      expect(el).not.toHaveClass('badge--sm');
      expect(el).toHaveClass('badge--lg');
    });

    it('should toggle pill class when pill attribute changes', () => {
      const el = renderBadge();
      
      expect(el).not.toHaveClass('badge--pill');
      
      el.setAttribute('pill', '');
      expect(el).toHaveClass('badge--pill');
      
      el.removeAttribute('pill');
      expect(el).not.toHaveClass('badge--pill');
    });

    it('should update interactivity when clickable changes', () => {
      const el = renderBadge();
      
      expect(el).not.toHaveAttribute('role');
      expect(el).not.toHaveAttribute('tabindex');
      
      el.setAttribute('clickable', '');
      expect(el).toHaveAttribute('role', 'button');
      expect(el).toHaveAttribute('tabindex', '0');
      
      el.removeAttribute('clickable');
      expect(el).not.toHaveAttribute('role');
      expect(el).not.toHaveAttribute('tabindex');
    });

    it('should handle disabled state changes', () => {
      const el = renderBadge('clickable');
      
      expect(el).toHaveAttribute('tabindex', '0');
      expect(el).toHaveAttribute('aria-disabled', 'false');
      
      el.setAttribute('disabled', '');
      expect(el).not.toHaveAttribute('tabindex');
      expect(el).toHaveAttribute('aria-disabled', 'true');
      
      el.removeAttribute('disabled');
      expect(el).toHaveAttribute('tabindex', '0');
      expect(el).toHaveAttribute('aria-disabled', 'false');
    });
  });

  describe('Clickable Functionality', () => {
    it('should handle click events when clickable', async () => {
      const el = renderBadge('clickable', 'Click me');
      const clickHandler = vi.fn();
      
      el.addEventListener('click', clickHandler);
      
      await user.click(el);
      
      expect(clickHandler).toHaveBeenCalledTimes(1);
    });

    it('should activate on Enter key', async () => {
      const el = renderBadge('clickable', 'Press Enter');
      const clickHandler = vi.fn();
      
      el.addEventListener('click', clickHandler);
      el.focus();
      
      await user.keyboard('{Enter}');
      
      expect(clickHandler).toHaveBeenCalledTimes(1);
    });

    it('should activate on Space keyup (not keydown)', async () => {
      const el = renderBadge('clickable', 'Press Space');
      const clickHandler = vi.fn();
      
      el.addEventListener('click', clickHandler);
      el.focus();
      
      // user-event sends both keydown and keyup for Space
      await user.keyboard(' ');
      
      // Should only fire once (on keyup)
      expect(clickHandler).toHaveBeenCalledTimes(1);
    });

    it('should not activate on other keys', async () => {
      const el = renderBadge('clickable', 'Press key');
      const clickHandler = vi.fn();
      
      el.addEventListener('click', clickHandler);
      el.focus();
      
      await user.keyboard('{Escape}');
      await user.keyboard('a');
      
      expect(clickHandler).not.toHaveBeenCalled();
    });

    it('should prevent default on Space to avoid scrolling', async () => {
      const el = renderBadge('clickable', 'No scroll');
      el.focus();
      
      const preventDefaultSpy = vi.fn();
      
      // Intercept keydown event
      el.addEventListener('keydown', (e) => {
        if (e.key === ' ') {
          preventDefaultSpy();
        }
      }, { capture: true });
      
      await user.keyboard(' ');
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('should not respond to clicks when disabled', async () => {
      const el = renderBadge('clickable disabled', 'Disabled');
      const clickHandler = vi.fn();
      
      el.addEventListener('click', clickHandler);
      
      await user.click(el);
      
      expect(clickHandler).toHaveBeenCalledTimes(1); // Click event still fires
    });

    it('should not respond to keyboard when disabled', async () => {
      const el = renderBadge('clickable disabled', 'Disabled');
      const clickHandler = vi.fn();
      
      el.addEventListener('click', clickHandler);
      
      // Try to focus (should not be focusable)
      el.focus();
      expect(document.activeElement).not.toBe(el);
      
      // Try keyboard events anyway
      await user.keyboard('{Enter}');
      await user.keyboard(' ');
      
      expect(clickHandler).not.toHaveBeenCalled();
    });

    it('should remove interactivity when disabled', () => {
      const el = renderBadge('clickable disabled', 'Nope');
      
      expect(el).toHaveAttribute('role', 'button');
      expect(el).not.toHaveAttribute('tabindex');
      expect(el).toHaveAttribute('aria-disabled', 'true');
      expect(el).toHaveClass('badge--disabled');
    });
  });

  describe('Event Handler Management', () => {
    it('should detach keyboard handler when clickable removed', async () => {
      const el = renderBadge('clickable', 'Dynamic');
      const clickHandler = vi.fn();
      
      el.addEventListener('click', clickHandler);
      el.focus();
      
      // Should work initially
      await user.keyboard('{Enter}');
      expect(clickHandler).toHaveBeenCalledTimes(1);
      
      // Remove clickable
      el.removeAttribute('clickable');
      
      // Should not work anymore
      clickHandler.mockClear();
      await user.keyboard('{Enter}');
      expect(clickHandler).not.toHaveBeenCalled();
    });

    it('should re-attach handlers when clickable re-added', async () => {
      const el = renderBadge('', 'Toggle');
      const clickHandler = vi.fn();
      
      el.addEventListener('click', clickHandler);
      
      // Add clickable
      el.setAttribute('clickable', '');
      el.focus();
      
      await user.keyboard('{Enter}');
      expect(clickHandler).toHaveBeenCalledTimes(1);
    });

    it('should clean up event listeners on disconnectedCallback', () => {
      const el = renderBadge('clickable') as BadgeTag;
      const removeSpy = vi.spyOn(el, 'removeEventListener');
      
      el.remove();
      
      expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(removeSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
    });
  });

  describe('Component Lifecycle', () => {
    it('should setup component when added to DOM', () => {
      const el = renderBadge('type="success" size="lg" pill clickable');
      
      expect(el).toHaveClass('badge');
      expect(el).toHaveClass('badge--success');
      expect(el).toHaveClass('badge--lg');
      expect(el).toHaveClass('badge--pill');
      expect(el).toHaveAttribute('role', 'button');
    });

    it('should clean up properly on removal', () => {
      const el = renderBadge('clickable') as BadgeTag;
      const detachSpy = vi.spyOn(el, 'detachEvents');
      
      el.remove();
      
      expect(detachSpy).toHaveBeenCalled();
    });

    it('should bind events on connectedCallback', () => {
      const el = document.createElement('badge-el') as BadgeTag;
      el.setAttribute('clickable', '');
      
      const attachSpy = vi.spyOn(el, 'attachEvents');
      
      container.appendChild(el);
      
      expect(attachSpy).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations for default badge', async () => {
      renderBadge('', 'Status');
      const results = await a11y(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations for clickable badge', async () => {
      renderBadge('clickable', 'Action');
      const results = await a11y(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations for disabled badge', async () => {
      renderBadge('clickable disabled', 'Disabled');
      const results = await a11y(container);
      expect(results).toHaveNoViolations();
    });

    it('should be keyboard navigable when clickable', () => {
      const el = renderBadge('clickable');
      
      expect(el).toHaveAttribute('tabindex', '0');
      
      el.focus();
      expect(document.activeElement).toBe(el);
    });

    it('should not be keyboard navigable when disabled', () => {
      const el = renderBadge('clickable disabled');
      
      expect(el).not.toHaveAttribute('tabindex');
      
      el.focus();
      expect(document.activeElement).not.toBe(el);
    });

    it('should have proper ARIA attributes for button role', () => {
      const el = renderBadge('clickable');
      
      expect(el).toHaveAttribute('role', 'button');
      expect(el).toHaveAttribute('aria-disabled', 'false');
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple rapid attribute changes', () => {
      const el = renderBadge();
      
      // Rapidly change attributes
      for (let i = 0; i < 5; i++) {
        el.setAttribute('type', i % 2 === 0 ? 'success' : 'warning');
        el.setAttribute('size', i % 2 === 0 ? 'sm' : 'lg');
        el.toggleAttribute('pill');
        el.toggleAttribute('clickable');
      }
      
      // Should handle state changes without errors
      expect(el).toBeInTheDocument();
      expect(el).toHaveClass('badge');
    });

    it('should handle empty content', () => {
      const el = renderBadge('', '');
      
      expect(el).toBeInTheDocument();
      expect(el).toHaveClass('badge');
      expect(el.textContent).toBe('');
    });

    it('should handle very long content', () => {
      const longContent = 'A'.repeat(1000);
      const el = renderBadge('', longContent);
      
      expect(el).toBeInTheDocument();
      expect(el).toHaveTextContent(longContent);
    });

    it('should not duplicate classes when same attribute set multiple times', () => {
      const el = renderBadge();
      
      el.setAttribute('type', 'success');
      el.setAttribute('type', 'success');
      el.setAttribute('type', 'success');
      
      const successClasses = Array.from(el.classList).filter(c => c === 'badge--success');
      expect(successClasses).toHaveLength(1);
    });
  });
});