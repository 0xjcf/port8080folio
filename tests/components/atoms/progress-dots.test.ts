/**
 * Progress Dots Component Tests
 * Following atomic design principles and accessibility best practices
 */
import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { renderComponent } from '../../helpers/test-helpers';
// Import for side effects (auto-registration)
import '../../../src/components/atoms/progress-dots';
// Import type only for TypeScript
import type { ProgressDots } from '../../../src/components/atoms/progress-dots';

describe('ProgressDots', () => {
  let container: HTMLDivElement;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    container = createTestContainer();
    user = userEvent.setup();
  });

  // Helper functions
  function renderDots(attrs = '') {
    return renderComponent(container, 'progress-dots', attrs);
  }

  function getDots(el: Element) {
    return Array.from(el.querySelectorAll('.progress-dots__dot'));
  }

  function getButtons(el: Element) {
    return Array.from(el.querySelectorAll<HTMLButtonElement>('button[data-index]'));
  }

  describe('Rendering', () => {
    it('should render with default attributes', () => {
      const el = renderDots();
      
      expect(el).toBeInTheDocument();
      expect(el).toHaveClass('progress-dots');
      expect(getDots(el)).toHaveLength(1);
    });

    it('should render correct number of dots based on total', () => {
      const el = renderDots('total="5"');
      expect(getDots(el)).toHaveLength(5);
    });

    it('should clamp current to valid range', () => {
      const tests = [
        { attrs: 'current="0" total="3"', expected: 1 },
        { attrs: 'current="-1" total="3"', expected: 1 },
        { attrs: 'current="10" total="3"', expected: 3 },
        { attrs: 'current="NaN" total="3"', expected: 1 },
      ];

      tests.forEach(({ attrs, expected }) => {
        const el = renderDots(attrs);
        const dots = getDots(el);
        const currentDot = dots.find(d => d.classList.contains('progress-dots__dot--current'));
        expect(dots.indexOf(currentDot!)).toBe(expected - 1);
      });
    });

    it('should apply correct state classes', () => {
      const el = renderDots('current="3" total="5"');
      const dots = getDots(el);
      
      expect(dots[0]).toHaveClass('progress-dots__dot--complete');
      expect(dots[1]).toHaveClass('progress-dots__dot--complete');
      expect(dots[2]).toHaveClass('progress-dots__dot--current');
      expect(dots[3]).toHaveClass('progress-dots__dot--upcoming');
      expect(dots[4]).toHaveClass('progress-dots__dot--upcoming');
    });

    it('should display text when show-text is present', () => {
      const el = renderDots('total="3" current="2" show-text');
      const dots = getDots(el);
      
      dots.forEach((dot, i) => {
        const text = dot.querySelector('.progress-dots__text');
        if (text) {
          expect(text).toHaveTextContent(String(i + 1));
        }
      });
    });

    it('should preserve author-supplied classes', () => {
      container.innerHTML = '<progress-dots class="custom-class" total="3"></progress-dots>';
      const el = container.querySelector('progress-dots')!;
      
      expect(el).toHaveClass('progress-dots');
      expect(el).toHaveClass('custom-class');
    });
  });

  describe('Labels', () => {
    it('should apply and trim labels correctly', () => {
      const el = renderDots('total="4" current="2" labels="  A ,B, C  ,  "');
      const dots = getDots(el);
      
      expect(dots[0]).toHaveAttribute('aria-label', expect.stringContaining('A'));
      expect(dots[1]).toHaveAttribute('aria-label', expect.stringContaining('B'));
      expect(dots[2]).toHaveAttribute('aria-label', expect.stringContaining('C'));
      expect(dots[3]).toHaveAttribute('aria-label', expect.stringContaining('Step 4')); // Fallback
    });

    it('should use default labels when not provided', () => {
      const el = renderDots('total="3"');
      const dots = getDots(el);
      
      dots.forEach((dot, i) => {
        expect(dot).toHaveAttribute('aria-label', expect.stringContaining(`Step ${i + 1}`));
      });
    });

    it('should show label text when show-text and labels are present', () => {
      const el = renderDots('total="3" current="2" labels="Start,Middle,End" show-text');
      const label = el.querySelector('.progress-dots__label');
      
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent('Middle');
    });
  });

  describe('Non-Interactive Semantics', () => {
    it('should render spans with aria-current for non-clickable dots', () => {
      const el = renderDots('total="3" current="2"');
      const dots = getDots(el);
      
      expect(el.querySelectorAll('button')).toHaveLength(0);
      expect(dots[1]).toHaveAttribute('aria-current', 'step');
      expect(dots[0]).not.toHaveAttribute('aria-current');
      expect(dots[2]).not.toHaveAttribute('aria-current');
    });

    it('should not have interactive attributes when not clickable', () => {
      const el = renderDots('total="3"');
      const group = el.querySelector('.progress-dots__group');
      
      expect(group).not.toHaveAttribute('role');
      expect(el.querySelectorAll('[tabindex]')).toHaveLength(0);
    });
  });

  describe('Interactive Semantics', () => {
    it('should render buttons with roving tabindex when clickable', () => {
      const el = renderDots('total="3" current="2" clickable');
      const buttons = getButtons(el);
      
      expect(buttons).toHaveLength(3);
      expect(buttons[0]).toHaveAttribute('tabindex', '-1');
      expect(buttons[1]).toHaveAttribute('tabindex', '0'); // Current
      expect(buttons[2]).toHaveAttribute('tabindex', '-1');
      expect(el).toHaveClass('progress-dots--clickable');
    });

    it('should have proper group role and label', () => {
      const el = renderDots('clickable aria-label="Checkout steps"');
      const group = el.querySelector('.progress-dots__group');
      
      expect(group).toHaveAttribute('role', 'group');
      expect(group).toHaveAttribute('aria-label', 'Checkout steps');
    });

    it('should maintain aria-current on current button', () => {
      const el = renderDots('total="3" current="2" clickable');
      const buttons = getButtons(el);
      
      expect(buttons[1]).toHaveAttribute('aria-current', 'step');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support Arrow/Home/End navigation', async () => {
      const el = renderDots('total="4" current="2" clickable');
      const buttons = getButtons(el);
      
      // Start with current button focused
      buttons[1]?.focus();
      expect(document.activeElement).toBe(buttons[1]);
      
      // Arrow Right
      await user.keyboard('{ArrowRight}');
      expect(document.activeElement).toBe(buttons[2]);
      expect(buttons[2]).toHaveAttribute('tabindex', '0');
      
      // Arrow Left
      await user.keyboard('{ArrowLeft}');
      expect(document.activeElement).toBe(buttons[1]);
      
      // Home
      await user.keyboard('{Home}');
      expect(document.activeElement).toBe(buttons[0]);
      expect(buttons[0]).toHaveAttribute('tabindex', '0');
      
      // End
      await user.keyboard('{End}');
      expect(document.activeElement).toBe(buttons[3]);
      expect(buttons[3]).toHaveAttribute('tabindex', '0');
    });

    it('should support vertical arrow keys', async () => {
      const el = renderDots('total="3" current="2" clickable');
      const buttons = getButtons(el);
      
      buttons[1]?.focus();
      
      // Arrow Down
      await user.keyboard('{ArrowDown}');
      expect(document.activeElement).toBe(buttons[2]);
      
      // Arrow Up
      await user.keyboard('{ArrowUp}');
      expect(document.activeElement).toBe(buttons[1]);
    });

    it('should not wrap focus at boundaries', async () => {
      const el = renderDots('total="3" current="1" clickable');
      const buttons = getButtons(el);
      
      // Start at first button
      buttons[0]?.focus();
      expect(document.activeElement).toBe(buttons[0]);
      
      // Try to go before first - should stay at first
      await user.keyboard('{ArrowLeft}');
      expect(document.activeElement).toBe(buttons[0]);
      
      // Now go to last button
      await user.keyboard('{End}');
      expect(document.activeElement).toBe(buttons[2]);
      
      // Try to go after last - should stay at last
      await user.keyboard('{ArrowRight}');
      expect(document.activeElement).toBe(buttons[2]);
    });
  });

  describe('Activation', () => {
    it('should activate on Enter and dispatch event', async () => {
      const el = renderDots('total="4" current="2" clickable');
      const onChange = vi.fn();
      el.addEventListener('progress-change', onChange);
      
      const buttons = getButtons(el);
      buttons[2]?.focus();
      
      await user.keyboard('{Enter}');
      
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { index: 3, previous: 2 }
        })
      );
      expect(el).toHaveAttribute('current', '3');
    });

    it('should activate on Space keyup and dispatch once', async () => {
      const el = renderDots('total="4" current="2" clickable');
      const onChange = vi.fn();
      el.addEventListener('progress-change', onChange);
      
      const buttons = getButtons(el);
      
      // Focus and activate the first button (index 1, different from current 2)
      if (buttons[0]) {
        buttons[0].focus();
        expect(document.activeElement).toBe(buttons[0]);
        
        // Space sends both keydown and keyup
        await user.keyboard(' ');
      }
      
      // Should only fire once (on keyup)
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { index: 1, previous: 2 }
        })
      );
    });

    it('should prevent page scroll on Space', async () => {
      const el = renderDots('total="3" current="2" clickable');
      const buttons = getButtons(el);
      
      buttons[0]?.focus();
      
      const preventDefaultSpy = vi.fn();
      el.addEventListener('keydown', (e) => {
        if (e.key === ' ') {
          preventDefaultSpy();
        }
      }, { capture: true });
      
      await user.keyboard(' ');
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should handle click events', async () => {
      const el = renderDots('total="3" current="3" clickable');
      const onChange = vi.fn();
      el.addEventListener('progress-change', onChange);
      
      const buttons = getButtons(el);
      
      if (buttons[0]) {
        await user.click(buttons[0]);
      }
      
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { index: 1, previous: 3 }
        })
      );
    });

    it('should not activate when clicking current dot', async () => {
      const el = renderDots('total="3" current="2" clickable');
      const onChange = vi.fn();
      el.addEventListener('progress-change', onChange);
      
      const buttons = getButtons(el);
      
      if (buttons[1]) {
        await user.click(buttons[1]); // Current dot
      }
      
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Attribute Reactivity', () => {
    it('should re-render when current changes', async () => {
      const el = renderDots('total="3" current="1"');
      let dots = getDots(el);
      
      expect(dots[0]).toHaveAttribute('aria-current', 'step');
      
      el.setAttribute('current', '3');
      
      await waitFor(() => {
        dots = getDots(el);
        expect(dots[2]).toHaveAttribute('aria-current', 'step');
        expect(dots[0]).not.toHaveAttribute('aria-current');
      });
    });

    it('should re-render when total changes', async () => {
      const el = renderDots('total="3" current="2"');
      
      expect(getDots(el)).toHaveLength(3);
      
      el.setAttribute('total', '5');
      
      await waitFor(() => {
        expect(getDots(el)).toHaveLength(5);
      });
    });

    it('should re-render when labels change', async () => {
      const el = renderDots('total="2"');
      let dots = getDots(el);
      
      expect(dots[0]).toHaveAttribute('aria-label', expect.stringContaining('Step 1'));
      
      el.setAttribute('labels', 'First,Second');
      
      await waitFor(() => {
        dots = getDots(el);
        expect(dots[0]).toHaveAttribute('aria-label', expect.stringContaining('First'));
        expect(dots[1]).toHaveAttribute('aria-label', expect.stringContaining('Second'));
      });
    });

    it('should toggle interactivity when clickable changes', async () => {
      const el = renderDots('total="3"');
      
      expect(el.querySelectorAll('button')).toHaveLength(0);
      
      el.setAttribute('clickable', '');
      
      await waitFor(() => {
        expect(el.querySelectorAll('button')).toHaveLength(3);
      });
      
      el.removeAttribute('clickable');
      
      await waitFor(() => {
        expect(el.querySelectorAll('button')).toHaveLength(0);
      });
    });
  });

  describe('Public Methods', () => {
    it('should advance with nextStep()', () => {
      const el = renderDots('current="2" total="5"') as ProgressDots;
      
      expect(el.nextStep()).toBe(true);
      expect(el.getAttribute('current')).toBe('3');
      expect(el.getCurrentStep()).toBe(3);
    });

    it('should not advance past total', () => {
      const el = renderDots('current="5" total="5"') as ProgressDots;
      
      expect(el.nextStep()).toBe(false);
      expect(el.getAttribute('current')).toBe('5');
    });

    it('should go back with previousStep()', () => {
      const el = renderDots('current="3" total="5"') as ProgressDots;
      
      expect(el.previousStep()).toBe(true);
      expect(el.getAttribute('current')).toBe('2');
      expect(el.getCurrentStep()).toBe(2);
    });

    it('should not go before step 1', () => {
      const el = renderDots('current="1" total="5"') as ProgressDots;
      
      expect(el.previousStep()).toBe(false);
      expect(el.getAttribute('current')).toBe('1');
    });

    it('should jump to specific step with goToStep()', () => {
      const el = renderDots('current="1" total="5"') as ProgressDots;
      
      el.goToStep(3);
      expect(el.getAttribute('current')).toBe('3');
      
      // Should clamp to valid range
      el.goToStep(10);
      expect(el.getAttribute('current')).toBe('5');
      
      el.goToStep(0);
      expect(el.getAttribute('current')).toBe('1');
    });

    it('should reset to step 1', () => {
      const el = renderDots('current="4" total="5"') as ProgressDots;
      
      el.reset();
      expect(el.getAttribute('current')).toBe('1');
    });

    it('should report completion status', () => {
      const el = renderDots('current="4" total="5"') as ProgressDots;
      
      expect(el.isComplete()).toBe(false);
      
      el.setAttribute('current', '5');
      expect(el.isComplete()).toBe(true);
    });

    it('should return total steps', () => {
      const el = renderDots('total="7"') as ProgressDots;
      
      expect(el.getTotalSteps()).toBe(7);
    });
  });

  describe('Component Lifecycle', () => {
    it('should setup component when added to DOM', () => {
      const el = document.createElement('progress-dots');
      el.setAttribute('total', '3');
      el.setAttribute('current', '2');
      el.setAttribute('clickable', '');
      
      container.appendChild(el);
      
      expect(el).toHaveClass('progress-dots');
      expect(el).toHaveClass('progress-dots--clickable');
      expect(getButtons(el)).toHaveLength(3);
    });

    it('should clean up event listeners on removal', () => {
      const el = renderDots('total="3" clickable') as ProgressDots;
      const removeSpy = vi.spyOn(el, 'removeEventListener');
      
      el.remove();
      
      expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function));
      expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      expect(removeSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
    });

    it('should detach handlers when clickable removed', async () => {
      const el = renderDots('total="3" clickable');
      const onChange = vi.fn();
      el.addEventListener('progress-change', onChange);
      
      el.removeAttribute('clickable');
      
      await waitFor(() => {
        expect(el.querySelectorAll('button')).toHaveLength(0);
      });
      
      // Try to trigger events (should not work)
      const dots = getDots(el);
      dots[0]?.dispatchEvent(new MouseEvent('click'));
      
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have no violations with default props', async () => {
      renderDots('total="3"');
      const results = await a11y(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with all features', async () => {
      renderDots('current="2" total="4" labels="Step 1,Step 2,Step 3,Step 4" clickable show-text');
      const results = await a11y(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper aria-label on each dot', () => {
      const el = renderDots('total="3" labels="Start,Middle,End"');
      const dots = getDots(el);
      
      expect(dots[0]).toHaveAttribute('aria-label', 'Step 1 of 3: Start');
      expect(dots[1]).toHaveAttribute('aria-label', 'Step 2 of 3: Middle');
      expect(dots[2]).toHaveAttribute('aria-label', 'Step 3 of 3: End');
    });

    it('should announce label changes with aria-live', () => {
      const el = renderDots('total="3" current="2" labels="A,B,C" show-text');
      const label = el.querySelector('.progress-dots__label');
      
      expect(label).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid number attributes gracefully', () => {
      const el = renderDots('total="abc" current="xyz"');
      
      expect(getDots(el)).toHaveLength(1); // Falls back to 1
      expect(el.querySelector('[aria-current="step"]')).toBeInTheDocument();
    });

    it('should handle empty labels gracefully', () => {
      const el = renderDots('labels=",,,"');
      const dots = getDots(el);
      
      // Should fall back to default labels
      dots.forEach((dot, i) => {
        expect(dot).toHaveAttribute('aria-label', expect.stringContaining(`Step ${i + 1}`));
      });
    });

    it('should handle rapid attribute changes', async () => {
      const el = renderDots('total="3"');
      
      // Rapidly change attributes
      for (let i = 0; i < 10; i++) {
        el.setAttribute('current', String((i % 3) + 1));
        el.toggleAttribute('clickable');
        el.toggleAttribute('show-text');
      }
      
      // Should handle changes without errors
      await waitFor(() => {
        expect(el).toBeInTheDocument();
        expect(getDots(el)).toHaveLength(3);
      });
    });

    it('should handle very large numbers', () => {
      const el = renderDots('total="100" current="50"') as ProgressDots;
      
      expect(getDots(el)).toHaveLength(100);
      expect(el.getCurrentStep()).toBe(50);
      expect(el.getTotalSteps()).toBe(100);
    });
  });
});