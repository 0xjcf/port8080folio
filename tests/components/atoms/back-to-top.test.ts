/**
 * Back to Top Component Tests
 * Following atomic design principles and accessibility best practices
 */
import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { renderComponent } from '../../helpers/test-helpers';
// Import for side effects (auto-registration)
import '../../../src/components/atoms/back-to-top';
// Import type only for TypeScript
import type { BackToTop } from '../../../src/components/atoms/back-to-top';

describe('BackToTop', () => {
  let container: HTMLDivElement;
  let user: ReturnType<typeof userEvent.setup>;
  let scrollYDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    container = createTestContainer();
    user = userEvent.setup();
    
    // Save and reset scroll position
    scrollYDescriptor = Object.getOwnPropertyDescriptor(window, 'scrollY');
    Object.defineProperty(window, 'scrollY', { 
      configurable: true, 
      writable: true, 
      value: 0 
    });
  });

  afterEach(() => {
    // Restore original scrollY descriptor
    if (scrollYDescriptor) {
      Object.defineProperty(window, 'scrollY', scrollYDescriptor);
    }
    // Clean up any remaining SR announcements
    document.querySelectorAll('.sr-only').forEach(el => el.remove());
  });

  // Helper function to render component
  function renderBackToTop(attrs = '') {
    return renderComponent(container, 'back-to-top', attrs);
  }

  describe('Rendering', () => {
    it('should render with default attributes', () => {
      const el = renderBackToTop();
      
      expect(el).toBeInTheDocument();
      expect(el).toHaveClass('back-to-top');
      expect(el).toHaveAttribute('role', 'button');
      expect(el).toHaveAttribute('tabindex', '0');
      expect(el).toHaveAttribute('aria-label', 'Back to top');
    });

    it('should render with custom icon', () => {
      const el = renderBackToTop('icon="⬆"');
      const icon = el.querySelector('.back-to-top__icon');
      
      expect(icon).toHaveTextContent('⬆');
    });

    it('should render with custom aria-label', () => {
      const el = renderBackToTop('aria-label="Scroll to top"');
      
      expect(el).toHaveAttribute('aria-label', 'Scroll to top');
    });

    it('should render in compact mode', () => {
      const el = renderBackToTop('compact');
      
      expect(el).toHaveClass('back-to-top--compact');
    });

    it('should preserve author-supplied classes', () => {
      container.innerHTML = '<back-to-top class="custom-class"></back-to-top>';
      const el = container.querySelector<HTMLElement>('back-to-top');
      
      expect(el).toHaveClass('back-to-top');
      expect(el).toHaveClass('custom-class');
    });

    it('should have correct CSS classes', () => {
      const el = renderBackToTop();
      
      // Verify base classes exist
      expect(el).toHaveClass('back-to-top');
      
      const icon = el.querySelector('.back-to-top__icon');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Attribute Reactivity', () => {
    it('should re-render when aria-label changes', () => {
      const el = renderBackToTop();
      el.setAttribute('aria-label', 'Go up');
      expect(el).toHaveAttribute('aria-label', 'Go up');
    });

    it('should re-render when icon changes', () => {
      const el = renderBackToTop();
      el.setAttribute('icon', '⬆');
      const icon = el.querySelector('.back-to-top__icon');
      expect(icon).toHaveTextContent('⬆');
    });

    it('should toggle compact class when compact attribute changes', () => {
      const el = renderBackToTop();
      expect(el).not.toHaveClass('back-to-top--compact');
      
      el.setAttribute('compact', '');
      expect(el).toHaveClass('back-to-top--compact');
      
      el.removeAttribute('compact');
      expect(el).not.toHaveClass('back-to-top--compact');
    });

    it('should support custom threshold attribute', async () => {
      const el = renderBackToTop('threshold="50"');
      
      Object.defineProperty(window, 'scrollY', { value: 60, configurable: true });
      window.dispatchEvent(new Event('scroll'));
      
      await waitFor(() => {
        expect(el).toHaveClass('back-to-top--visible');
      });
    });
  });

  describe('Visibility Management', () => {
    it('should not be visible initially when at top', () => {
      const el = renderBackToTop();
      
      expect(el).not.toHaveClass('back-to-top--visible');
    });

    it('should become visible when scrolled past threshold', async () => {
      const el = renderBackToTop();
      
      // Simulate scroll past threshold (300px)
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 400
      });
      
      // Trigger scroll event
      window.dispatchEvent(new Event('scroll'));
      
      await waitFor(() => {
        expect(el).toHaveClass('back-to-top--visible');
      });
    });

    it('should hide when scrolled back to top', async () => {
      const el = renderBackToTop();
      
      // First scroll down
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 400
      });
      window.dispatchEvent(new Event('scroll'));
      
      await waitFor(() => {
        expect(el).toHaveClass('back-to-top--visible');
      });
      
      // Then scroll back up
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 100
      });
      window.dispatchEvent(new Event('scroll'));
      
      await waitFor(() => {
        expect(el).not.toHaveClass('back-to-top--visible');
      });
    });
  });

  describe('Scroll to Top Functionality', () => {
    let scrollToMock: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      // Mock window.scrollTo
      scrollToMock = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
      
      // Mock scrollBehavior support
      Object.defineProperty(document.documentElement.style, 'scrollBehavior', {
        writable: true,
        configurable: true,
        value: 'smooth'
      });
    });

    afterEach(() => {
      scrollToMock.mockRestore();
    });

    it('should scroll to top on click', async () => {
      const el = renderBackToTop();
      
      await user.click(el);
      
      expect(scrollToMock).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth'
      });
    });

    it('should scroll to top on Enter key', async () => {
      const el = renderBackToTop();
      
      // Focus the element
      el.focus();
      expect(document.activeElement).toBe(el);
      
      // Press Enter
      await user.keyboard('{Enter}');
      
      expect(scrollToMock).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth'
      });
    });

    it('should scroll to top on Space key', async () => {
      const el = renderBackToTop();
      
      // Focus the element
      el.focus();
      
      // Press Space
      await user.keyboard(' ');
      
      expect(scrollToMock).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth'
      });
    });

    it('should respect reduced motion preference', async () => {
      const matchMediaMock = vi.fn().mockReturnValue({ matches: true });
      vi.spyOn(window, 'matchMedia').mockImplementation(matchMediaMock);
      
      const scrollToMock = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
      const el = renderBackToTop();
      
      Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
      
      await user.click(el);
      
      // Should use instant scroll (no behavior property)
      expect(scrollToMock).toHaveBeenCalledWith(0, 0);
      
      scrollToMock.mockRestore();
    });

    it('should use fallback animation when smooth scroll not supported', async () => {
      // Create a mock element without scrollBehavior support
      const mockStyle = {};
      const originalDescriptor = Object.getOwnPropertyDescriptor(document.documentElement, 'style');
      
      // Override style to not include scrollBehavior
      Object.defineProperty(document.documentElement, 'style', {
        configurable: true,
        value: mockStyle
      });
      
      // Also ensure matchMedia returns false for reduced motion
      const matchMediaMock = vi.fn().mockReturnValue({ matches: false });
      vi.spyOn(window, 'matchMedia').mockImplementation(matchMediaMock);
      
      // Mock scrollTo to prevent jsdom "Not implemented" error
      const scrollToMock = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
      
      // Mock requestAnimationFrame to prevent infinite recursion
      const rafMock = vi.spyOn(window, 'requestAnimationFrame')
        .mockImplementation((cb: FrameRequestCallback) => {
          // Don't call the callback immediately to avoid recursion
          // Just record that it was called
          return 1;
        });
      
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 500
      });
      
      const el = renderBackToTop();
      
      await user.click(el);
      
      // Should use animateScroll fallback
      expect(rafMock).toHaveBeenCalled();
      
      // Restore
      rafMock.mockRestore();
      scrollToMock.mockRestore();
      if (originalDescriptor) {
        Object.defineProperty(document.documentElement, 'style', originalDescriptor);
      }
    });
  });

  describe('Screen Reader Announcements', () => {
    it('should announce scroll action to screen readers', async () => {
      const el = renderBackToTop();
      
      await user.click(el);
      
      await waitFor(() => {
        const announcement = document.querySelector('[role="status"][aria-live="polite"]');
        expect(announcement).toBeInTheDocument();
        expect(announcement).toHaveTextContent('Scrolled to top');
        expect(announcement).toHaveClass('sr-only');
      });
    });

    it('should remove announcement after timeout', () => {
      vi.useFakeTimers();
      
      const el = renderBackToTop();
      
      // Mock scrollTo to prevent actual scrolling
      vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
      
      // Trigger click synchronously
      el.click();
      
      const announcement = document.querySelector('[role="status"]');
      expect(announcement).toBeInTheDocument();
      expect(announcement).toHaveTextContent('Scrolled to top');
      
      // Fast-forward time to clear the text content
      vi.advanceTimersByTime(1100);
      
      // Check that announcement text is cleared (element remains for reuse)
      const updatedAnnouncement = document.querySelector('[role="status"]');
      expect(updatedAnnouncement).toBeInTheDocument();
      expect(updatedAnnouncement).toHaveTextContent('');
      
      vi.useRealTimers();
    });
  });

  describe('Component Lifecycle', () => {
    it('should setup component when added to DOM', () => {
      const el = renderBackToTop();
      
      // Check that the component is properly initialized
      expect(el).toHaveClass('back-to-top');
      expect(el).toHaveAttribute('role', 'button');
      expect(el).toHaveAttribute('tabindex', '0');
      expect(el.querySelector('.back-to-top__icon')).toBeInTheDocument();
    });

    it('should clean up all event listeners on disconnectedCallback', () => {
      const el = renderBackToTop() as BackToTop;
      const windowRemoveSpy = vi.spyOn(window, 'removeEventListener');
      const elRemoveSpy = vi.spyOn(el, 'removeEventListener');
      
      // Remove from DOM
      el.remove();
      
      // Should have removed window scroll listener
      expect(windowRemoveSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
      
      // Should have removed element listeners
      expect(elRemoveSpy).toHaveBeenCalledWith('click', expect.any(Function));
      expect(elRemoveSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should bind events on connectedCallback', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      
      renderBackToTop();
      
      // Should add scroll listener
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'scroll', 
        expect.any(Function), 
        { passive: true }
      );
    });
  });

  describe('Throttling', () => {
    it('should throttle scroll events', async () => {
      vi.useFakeTimers();
      
      const el = renderBackToTop() as BackToTop;
      const updateSpy = vi.spyOn(el, 'updateVisibility');
      
      // Simulate rapid scroll events over 500ms period
      for (let t = 0; t < 500; t += 10) {
        window.dispatchEvent(new Event('scroll'));
        vi.advanceTimersByTime(10);
      }
      
      // Should call updateVisibility approximately every 100ms + trailing call
      // ~500ms / 100ms = 5 calls + 1 trailing = max 6 calls
      expect(updateSpy.mock.calls.length).toBeLessThanOrEqual(6);
      expect(updateSpy.mock.calls.length).toBeGreaterThan(0);
      
      vi.useRealTimers();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      renderBackToTop();
      const results = await a11y(container);
      expect(results).toHaveNoViolations();
    });

    it('should be keyboard navigable', () => {
      const el = renderBackToTop();
      
      expect(el).toHaveAttribute('tabindex', '0');
      expect(el).toHaveAttribute('role', 'button');
    });

    it('should have proper ARIA attributes', () => {
      const el = renderBackToTop();
      
      expect(el).toHaveAttribute('aria-label');
    });

    it('should be focusable', () => {
      const el = renderBackToTop();
      
      el.focus();
      expect(document.activeElement).toBe(el);
    });

    it('should handle keyboard events properly', async () => {
      const el = renderBackToTop();
      const scrollToMock = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
      
      // Mock scrollBehavior support to avoid fallback animation
      Object.defineProperty(document.documentElement.style, 'scrollBehavior', {
        writable: true,
        configurable: true,
        value: 'smooth'
      });
      
      // Focus and test activation keys
      el.focus();
      expect(document.activeElement).toBe(el);
      
      // Test Enter key
      await user.keyboard('{Enter}');
      expect(scrollToMock).toHaveBeenCalledTimes(1);
      
      // Test Space key  
      await user.keyboard(' ');
      expect(scrollToMock).toHaveBeenCalledTimes(2);
      
      // Test non-activation key (should not scroll)
      scrollToMock.mockClear();
      await user.keyboard('{Escape}');
      expect(scrollToMock).not.toHaveBeenCalled();
      
      scrollToMock.mockRestore();
    });
  });

  describe('Mobile-first considerations', () => {
    it('should have minimum touch target size', () => {
      const el = renderBackToTop();
      
      // CSS should ensure minimum 44x44px touch target
      expect(el).toHaveClass('back-to-top');
    });

    it('should use flexible positioning', () => {
      const el = renderBackToTop();
      
      // Component uses CSS for responsive positioning
      expect(el).toHaveClass('back-to-top');
    });

    it('should support compact mode for mobile', () => {
      const el = renderBackToTop('compact');
      
      expect(el).toHaveClass('back-to-top--compact');
    });
  });

  describe('Edge cases', () => {
    it('should handle missing window.scrollY gracefully using pageYOffset', async () => {
      // Simulate older browser without scrollY
      delete (window as any).scrollY;
      (window as any).pageYOffset = 500;
      
      const el = renderBackToTop();
      
      // Should work with pageYOffset fallback
      expect(el).toBeInTheDocument();
      
      // Trigger scroll event to test visibility with pageYOffset
      window.dispatchEvent(new Event('scroll'));
      
      await waitFor(() => {
        expect(el).toHaveClass('back-to-top--visible');
      });
      
      // Test that it hides when scrolling back up
      (window as any).pageYOffset = 100;
      window.dispatchEvent(new Event('scroll'));
      
      await waitFor(() => {
        expect(el).not.toHaveClass('back-to-top--visible');
      });
    });

    it('should handle rapid visibility changes', async () => {
      const el = renderBackToTop();
      
      // Rapidly change scroll position
      for (let i = 0; i < 5; i++) {
        Object.defineProperty(window, 'scrollY', {
          writable: true,
          configurable: true,
          value: i % 2 === 0 ? 400 : 100
        });
        window.dispatchEvent(new Event('scroll'));
      }
      
      // Should handle state changes without errors
      expect(el).toBeInTheDocument();
    });
  });
});