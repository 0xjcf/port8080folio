/**
 * Accessibility helper utilities for the actor-based architecture
 * Based on patterns from docs/ACCESSIBILITY_UX_GUIDE.md
 */

// Simple screen reader announcer
class SimpleAnnouncer {
  private container: HTMLElement;
  
  constructor() {
    this.container = this.createContainer();
  }
  
  private createContainer(): HTMLElement {
    const existing = document.getElementById('sr-announcer');
    if (existing) return existing;
    
    const container = document.createElement('div');
    container.id = 'sr-announcer';
    container.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    
    document.body.appendChild(container);
    return container;
  }
  
  announce(message: string): void {
    this.container.textContent = '';
    setTimeout(() => {
      this.container.textContent = message;
    }, 100);
  }
  
  announceLoading(resource: string): void {
    this.announce(`Loading ${resource}`);
  }
  
  announceError(error: string): void {
    this.announce(`Error: ${error}`);
  }
  
  announceSuccess(action: string): void {
    this.announce(`${action} successful`);
  }
}

// Create singleton instance
export const announcer = new SimpleAnnouncer();

// Quick helpers for common patterns

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Get current color scheme preference
 */
export function getColorScheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/**
 * Ensure minimum touch target size (44x44px)
 */
export function ensureTouchTarget(element: HTMLElement): void {
  const rect = element.getBoundingClientRect();
  const minSize = 44;
  
  if (rect.width < minSize || rect.height < minSize) {
    // Add invisible expansion area
    element.style.position = 'relative';
    
    const expander = document.createElement('div');
    expander.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      min-width: ${minSize}px;
      min-height: ${minSize}px;
      pointer-events: none;
    `;
    
    element.appendChild(expander);
  }
}

/**
 * Add skip link for keyboard navigation
 */
export function addSkipLink(targetId: string, text = 'Skip to main content'): void {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.className = 'skip-link';
  skipLink.textContent = text;
  
  // Style as visually hidden but accessible
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--color-accent);
    color: var(--color-bg);
    padding: 8px;
    text-decoration: none;
    border-radius: 0 0 4px 0;
    z-index: 100;
  `;
  
  // Show on focus
  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0';
  });
  
  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });
  
  document.body.insertBefore(skipLink, document.body.firstChild);
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Focus management for actor state changes
 */
export interface FocusManagerConfig {
  restoreFocus?: boolean;
  focusFirst?: boolean;
  trapFocus?: boolean;
}

export class FocusManager {
  private previousFocus: Element | null = null;
  
  saveFocus(): void {
    this.previousFocus = document.activeElement;
  }
  
  restoreFocus(): void {
    if (this.previousFocus && this.previousFocus instanceof HTMLElement) {
      this.previousFocus.focus();
    }
  }
  
  focusFirst(container: HTMLElement): void {
    const focusable = container.querySelector<HTMLElement>(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusable) {
      focusable.focus();
    }
  }
  
  /**
   * Actor integration helper
   */
  static createFocusActions(config: FocusManagerConfig = {}) {
    const manager = new FocusManager();
    
    return {
      saveFocus: () => {
        if (config.restoreFocus) {
          manager.saveFocus();
        }
      },
      
      handleOpen: (element: HTMLElement) => {
        if (config.focusFirst) {
          requestAnimationFrame(() => {
            manager.focusFirst(element);
          });
        }
      },
      
      handleClose: () => {
        if (config.restoreFocus) {
          manager.restoreFocus();
        }
      }
    };
  }
}

/**
 * Loading state helper
 */
export function setLoadingState(element: HTMLElement, isLoading: boolean): void {
  element.setAttribute('aria-busy', isLoading.toString());
  element.dataset.loading = isLoading.toString();
  
  if (isLoading) {
    // Optionally announce loading state
    announcer.announceLoading(element.getAttribute('aria-label') || 'content');
  }
}

/**
 * Error state helper
 */
export function setErrorState(
  element: HTMLElement, 
  hasError: boolean, 
  errorMessage?: string
): void {
  element.setAttribute('aria-invalid', hasError.toString());
  element.dataset.error = hasError.toString();
  
  if (hasError && errorMessage) {
    // Create error message element if needed
    let errorEl = element.querySelector('[role="alert"]');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.setAttribute('role', 'alert');
      errorEl.className = 'error-message';
      element.appendChild(errorEl);
    }
    
    errorEl.textContent = errorMessage;
    announcer.announceError(errorMessage);
  } else {
    // Remove error message
    element.querySelector('[role="alert"]')?.remove();
  }
}

/**
 * Success feedback helper
 */
export function showSuccessFeedback(message: string, duration = 3000): void {
  announcer.announceSuccess(message);
  
  // Visual feedback (toast, etc.)
  const toast = document.createElement('div');
  toast.className = 'success-toast';
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    background: var(--color-success);
    color: var(--color-bg);
    padding: 1rem;
    border-radius: var(--radius-md);
    animation: slide-in 0.3s ease-out;
    z-index: var(--z-toast);
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slide-out 0.3s ease-in';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Roving tabindex helper for lists
 */
export function setupRovingTabindex(
  container: HTMLElement, 
  itemSelector: string
): () => void {
  const items = Array.from(container.querySelectorAll<HTMLElement>(itemSelector));
  let currentIndex = 0;
  
  // Initialize tabindex
  items.forEach((item, index) => {
    item.tabIndex = index === 0 ? 0 : -1;
  });
  
  const handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key;
    let newIndex = currentIndex;
    
    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        newIndex = (currentIndex + 1) % items.length;
        break;
        
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = (currentIndex - 1 + items.length) % items.length;
        break;
        
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
        
      case 'End':
        e.preventDefault();
        newIndex = items.length - 1;
        break;
        
      default:
        return;
    }
    
    // Update tabindex and focus
    items[currentIndex].tabIndex = -1;
    items[newIndex].tabIndex = 0;
    items[newIndex].focus();
    currentIndex = newIndex;
  };
  
  container.addEventListener('keydown', handleKeyDown);
  
  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

// Export all patterns for easy access
export const a11yPatterns = {
  prefersReducedMotion,
  prefersHighContrast,
  getColorScheme,
  ensureTouchTarget,
  addSkipLink,
  debounce,
  throttle,
  setLoadingState,
  setErrorState,
  showSuccessFeedback,
  setupRovingTabindex,
  FocusManager
} as const; 