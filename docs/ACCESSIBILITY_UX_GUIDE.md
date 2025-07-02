# Accessibility & UX Guide for Actor-Based Architecture

## Overview

This guide covers accessibility and UX patterns beyond ARIA automation, ensuring our actor-based architecture provides an exceptional experience for all users.

## Table of Contents

1. [Focus Management](#focus-management)
2. [Keyboard Navigation](#keyboard-navigation)
3. [Motion & Animation](#motion--animation)
4. [Color & Contrast](#color--contrast)
5. [Loading & Feedback States](#loading--feedback-states)
6. [Error Handling](#error-handling)
7. [Touch & Gesture Support](#touch--gesture-support)
8. [Responsive Design](#responsive-design)
9. [Performance & Perceived Performance](#performance--perceived-performance)
10. [Internationalization (i18n)](#internationalization-i18n)
11. [Screen Reader Announcements](#screen-reader-announcements)
12. [Form Patterns](#form-patterns)

## Focus Management

### Focus Trap Pattern

Essential for modals, dropdowns, and overlays to keep keyboard navigation contained.

```typescript
// focus-trap.ts
export class FocusTrap {
  private element: HTMLElement;
  private previousFocus: Element | null = null;
  private focusableSelectors = [
    'a[href]:not([disabled])',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ];
  
  constructor(element: HTMLElement) {
    this.element = element;
  }
  
  activate(): void {
    // Save current focus
    this.previousFocus = document.activeElement;
    
    // Get focusable elements
    const focusables = this.getFocusableElements();
    if (focusables.length === 0) return;
    
    // Focus first element
    (focusables[0] as HTMLElement).focus();
    
    // Add event listeners
    this.element.addEventListener('keydown', this.handleKeyDown);
  }
  
  deactivate(): void {
    this.element.removeEventListener('keydown', this.handleKeyDown);
    
    // Restore focus
    if (this.previousFocus && this.previousFocus instanceof HTMLElement) {
      this.previousFocus.focus();
    }
  }
  
  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key !== 'Tab') return;
    
    const focusables = this.getFocusableElements();
    const firstFocusable = focusables[0] as HTMLElement;
    const lastFocusable = focusables[focusables.length - 1] as HTMLElement;
    
    if (e.shiftKey && document.activeElement === firstFocusable) {
      e.preventDefault();
      lastFocusable.focus();
    } else if (!e.shiftKey && document.activeElement === lastFocusable) {
      e.preventDefault();
      firstFocusable.focus();
    }
  };
  
  private getFocusableElements(): NodeListOf<Element> {
    return this.element.querySelectorAll(this.focusableSelectors.join(','));
  }
}

// Integration with actors
export const modalActions = {
  activateFocusTrap: ({ context }, event) => {
    const trap = new FocusTrap(event.element);
    trap.activate();
    return { ...context, focusTrap: trap };
  },
  
  deactivateFocusTrap: ({ context }) => {
    context.focusTrap?.deactivate();
    return { ...context, focusTrap: null };
  }
};
```

### Focus Ring Consistency

Ensure visible focus indicators across all interactive elements.

```css
/* focus-ring.css */
/* Use :focus-visible for keyboard-only focus */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Remove default outline for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :focus-visible {
    outline: 3px solid;
    outline-offset: 3px;
  }
}

/* Ensure focus ring works in Shadow DOM */
:host(:focus-visible) {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

## Keyboard Navigation

### Roving Tabindex Pattern

For lists and grids where only one item should be in the tab order.

```typescript
// roving-tabindex.ts
export class RovingTabindex {
  private items: HTMLElement[];
  private currentIndex = 0;
  
  constructor(container: HTMLElement, itemSelector: string) {
    this.items = Array.from(container.querySelectorAll(itemSelector));
    this.init();
  }
  
  private init(): void {
    // Set initial tabindex
    this.items.forEach((item, index) => {
      item.setAttribute('tabindex', index === 0 ? '0' : '-1');
      item.addEventListener('keydown', this.handleKeyDown);
      item.addEventListener('click', () => this.setFocus(index));
    });
  }
  
  private handleKeyDown = (e: KeyboardEvent): void => {
    const key = e.key;
    let newIndex = this.currentIndex;
    
    switch (key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        newIndex = (this.currentIndex + 1) % this.items.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        newIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = this.items.length - 1;
        break;
      default:
        return;
    }
    
    this.setFocus(newIndex);
  };
  
  private setFocus(index: number): void {
    // Update tabindex
    this.items[this.currentIndex].setAttribute('tabindex', '-1');
    this.items[index].setAttribute('tabindex', '0');
    this.items[index].focus();
    this.currentIndex = index;
  }
}

// Use with actor pattern
class NavigationController {
  private roving: RovingTabindex;
  
  constructor(component: HTMLElement) {
    const navList = component.querySelector('.nav-list');
    if (navList) {
      this.roving = new RovingTabindex(navList, '.nav-item');
    }
  }
}
```

### Keyboard Shortcuts

Implement discoverable keyboard shortcuts with proper announcements.

```typescript
// keyboard-shortcuts.ts
interface ShortcutConfig {
  key: string;
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  description: string;
  action: () => void;
}

export class KeyboardShortcuts {
  private shortcuts = new Map<string, ShortcutConfig>();
  private enabled = true;
  
  register(shortcuts: ShortcutConfig[]): void {
    shortcuts.forEach(shortcut => {
      const id = this.getShortcutId(shortcut);
      this.shortcuts.set(id, shortcut);
    });
    
    document.addEventListener('keydown', this.handleKeyDown);
  }
  
  private handleKeyDown = (e: KeyboardEvent): void => {
    if (!this.enabled) return;
    
    const shortcut = this.findMatchingShortcut(e);
    if (shortcut) {
      e.preventDefault();
      shortcut.action();
      this.announceShortcut(shortcut);
    }
  };
  
  private announceShortcut(shortcut: ShortcutConfig): void {
    // Create live region announcement
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = `${shortcut.description} activated`;
    
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }
  
  // Generate help dialog
  getHelpContent(): string {
    return Array.from(this.shortcuts.values())
      .map(s => `${this.formatShortcut(s)}: ${s.description}`)
      .join('\n');
  }
}

// Integration example
const shortcuts = new KeyboardShortcuts();
shortcuts.register([
  {
    key: '/',
    description: 'Open search',
    action: () => searchActor.send({ type: 'OPEN' })
  },
  {
    key: 'Escape',
    description: 'Close modal',
    action: () => modalActor.send({ type: 'CLOSE' })
  }
]);
```

## Motion & Animation

### Respecting Motion Preferences

Always check and respect `prefers-reduced-motion`.

```css
/* motion-safe.css */
/* Default: animations enabled */
.transition-all {
  transition: all var(--transition-base);
}

.animate-slide-in {
  animation: slide-in var(--transition-base) ease-out;
}

/* Reduced motion: instant transitions */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .animate-slide-in {
    animation: none;
  }
}

/* Data-state transitions with motion preference */
[data-state="opening"] {
  animation: expand var(--transition-base) ease-out;
}

@media (prefers-reduced-motion: reduce) {
  [data-state="opening"] {
    animation: none;
  }
}
```

```typescript
// motion-preference.ts
export class MotionPreference {
  private mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  private callbacks = new Set<(reduced: boolean) => void>();
  
  constructor() {
    this.mediaQuery.addEventListener('change', this.handleChange);
  }
  
  get prefersReduced(): boolean {
    return this.mediaQuery.matches;
  }
  
  subscribe(callback: (reduced: boolean) => void): () => void {
    this.callbacks.add(callback);
    callback(this.prefersReduced); // Initial call
    
    return () => this.callbacks.delete(callback);
  }
  
  private handleChange = (): void => {
    this.callbacks.forEach(cb => cb(this.prefersReduced));
  };
}

// Use in actors
export const animationActions = {
  setupMotionPreference: ({ context }) => {
    const motionPref = new MotionPreference();
    const unsubscribe = motionPref.subscribe(reduced => {
      // Update context based on preference
      context.animationsEnabled = !reduced;
    });
    
    return { ...context, motionCleanup: unsubscribe };
  }
};
```

## Color & Contrast

### Theme System with Contrast Support

```css
/* themes.css */
:root {
  /* Base colors with AA/AAA compliance */
  --color-bg: #080808;
  --color-fg: #F5F5F5; /* Contrast ratio: 18.1:1 ✅ AAA */
  --color-accent: #0D99FF; /* Contrast ratio: 4.5:1 ✅ AA */
  
  /* Semantic colors */
  --color-error: #FF4444;
  --color-success: #44FF44;
  --color-warning: #FFAA44;
  
  /* Focus colors */
  --color-focus: var(--color-accent);
  --color-focus-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  :root {
    --color-bg: #000000;
    --color-fg: #FFFFFF;
    --color-accent: #00FFFF;
    --color-focus-offset: 3px;
  }
  
  /* Increase border widths */
  * {
    border-width: max(2px, var(--border-width, 1px));
  }
}

/* Dark mode (already dark by default) */
@media (prefers-color-scheme: light) {
  :root {
    --color-bg: #FFFFFF;
    --color-fg: #080808;
    --color-accent: #0066CC;
  }
}

/* Forced colors mode (Windows High Contrast) */
@media (forced-colors: active) {
  :root {
    --color-bg: Canvas;
    --color-fg: CanvasText;
    --color-accent: LinkText;
  }
}
```

### Color Blind Friendly Patterns

```css
/* Don't rely on color alone */
.status-indicator {
  /* Shape + Color */
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
}

[data-status="success"] .status-indicator {
  background: var(--color-success);
  /* Add icon for non-color indication */
  &::after {
    content: '✓';
    color: var(--color-bg);
  }
}

[data-status="error"] .status-indicator {
  background: var(--color-error);
  /* Different shape */
  border-radius: 0;
  transform: rotate(45deg);
  &::after {
    content: '×';
    color: var(--color-bg);
  }
}

[data-status="warning"] .status-indicator {
  background: var(--color-warning);
  /* Triangle shape */
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  &::after {
    content: '!';
    color: var(--color-bg);
  }
}
```

## Loading & Feedback States

### Skeleton Screens

Provide immediate feedback while content loads.

```css
/* skeleton.css */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-secondary) 0%,
    var(--color-bg-tertiary) 50%,
    var(--color-bg-secondary) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}

@keyframes skeleton-pulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Skeleton variants */
.skeleton-text {
  height: 1em;
  margin-bottom: 0.5em;
  &:last-child {
    width: 80%;
  }
}

.skeleton-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
}

.skeleton-card {
  height: 10rem;
  border-radius: var(--radius-lg);
}

/* Respect motion preference */
@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
    background: var(--color-bg-secondary);
  }
}
```

```typescript
// skeleton-loader.ts
export class SkeletonLoader {
  static renderSkeleton(type: 'text' | 'card' | 'list', count = 1): string {
    switch (type) {
      case 'text':
        return Array(count).fill(0).map(() => 
          `<div class="skeleton skeleton-text"></div>`
        ).join('');
        
      case 'card':
        return `
          <div class="skeleton-card">
            <div class="skeleton skeleton-avatar"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
          </div>
        `;
        
      case 'list':
        return Array(count).fill(0).map(() => `
          <li class="skeleton-item">
            <div class="skeleton skeleton-text"></div>
          </li>
        `).join('');
    }
  }
}

// Use with actors
export const loadingStates = {
  showSkeleton: ({ context }, event) => {
    const element = event.element;
    element.innerHTML = SkeletonLoader.renderSkeleton(event.type, event.count);
    element.setAttribute('aria-busy', 'true');
    return context;
  },
  
  hideSkeleton: ({ context }, event) => {
    event.element.setAttribute('aria-busy', 'false');
    return context;
  }
};
```

### Progress Indicators

Show progress for long-running operations.

```typescript
// progress-indicator.ts
export class ProgressIndicator extends HTMLElement {
  private progressBar: HTMLDivElement;
  private label: HTMLSpanElement;
  
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback(): void {
    this.render();
  }
  
  static get observedAttributes(): string[] {
    return ['value', 'max', 'label'];
  }
  
  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    if (name === 'value') {
      this.updateProgress();
    }
  }
  
  private render(): void {
    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }
        
        .progress {
          height: 4px;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-full);
          overflow: hidden;
          position: relative;
        }
        
        .progress-bar {
          height: 100%;
          background: var(--color-accent);
          transition: width var(--transition-base);
          will-change: width;
        }
        
        .progress-label {
          display: block;
          margin-top: 0.5rem;
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
        }
        
        /* Indeterminate state */
        :host([value="-1"]) .progress-bar {
          width: 30%;
          animation: indeterminate 1.5s ease-in-out infinite;
        }
        
        @keyframes indeterminate {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .progress-bar {
            transition: none;
          }
          
          :host([value="-1"]) .progress-bar {
            animation: none;
            width: 50%;
          }
        }
      </style>
      
      <div class="progress" role="progressbar" 
           aria-valuenow="${this.getAttribute('value') || 0}"
           aria-valuemin="0"
           aria-valuemax="${this.getAttribute('max') || 100}"
           aria-label="${this.getAttribute('label') || 'Loading'}">
        <div class="progress-bar"></div>
      </div>
      <span class="progress-label" aria-live="polite"></span>
    `;
    
    this.progressBar = this.shadowRoot!.querySelector('.progress-bar')!;
    this.label = this.shadowRoot!.querySelector('.progress-label')!;
  }
  
  private updateProgress(): void {
    const value = parseInt(this.getAttribute('value') || '0');
    const max = parseInt(this.getAttribute('max') || '100');
    const percentage = Math.min(100, (value / max) * 100);
    
    if (this.progressBar) {
      this.progressBar.style.width = `${percentage}%`;
    }
    
    if (this.label) {
      this.label.textContent = `${Math.round(percentage)}% complete`;
    }
  }
}

customElements.define('progress-indicator', ProgressIndicator);
```

## Error Handling

### User-Friendly Error Messages

```typescript
// error-handler.ts
interface ErrorConfig {
  code: string;
  message: string;
  recovery?: string;
  action?: () => void;
}

export class ErrorHandler {
  private static errorMap = new Map<string, ErrorConfig>([
    ['NETWORK_ERROR', {
      code: 'NETWORK_ERROR',
      message: 'Connection problem',
      recovery: 'Check your internet connection and try again',
      action: () => window.location.reload()
    }],
    ['AUTH_REQUIRED', {
      code: 'AUTH_REQUIRED',
      message: 'Sign in required',
      recovery: 'Please sign in to continue',
      action: () => authActor.send({ type: 'SHOW_LOGIN' })
    }],
    ['NOT_FOUND', {
      code: 'NOT_FOUND',
      message: 'Page not found',
      recovery: 'The page you're looking for doesn't exist',
      action: () => window.history.back()
    }]
  ]);
  
  static renderError(error: Error | string): HTMLElement {
    const config = this.errorMap.get(error.toString()) || {
      code: 'UNKNOWN_ERROR',
      message: 'Something went wrong',
      recovery: 'Please try again later'
    };
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error-container';
    errorElement.setAttribute('role', 'alert');
    errorElement.setAttribute('aria-live', 'assertive');
    
    errorElement.innerHTML = `
      <div class="error-icon" aria-hidden="true">⚠️</div>
      <h3 class="error-title">${config.message}</h3>
      <p class="error-recovery">${config.recovery}</p>
      ${config.action ? `
        <button class="error-action" type="button">
          Try Again
        </button>
      ` : ''}
    `;
    
    if (config.action) {
      const button = errorElement.querySelector('.error-action');
      button?.addEventListener('click', config.action);
    }
    
    return errorElement;
  }
}

// Error boundary pattern for actors
export const errorBoundaryActions = {
  handleError: ({ context }, event) => {
    console.error('Actor error:', event.error);
    
    const errorElement = ErrorHandler.renderError(event.error);
    event.target.appendChild(errorElement);
    
    return {
      ...context,
      hasError: true,
      error: event.error
    };
  },
  
  clearError: ({ context }) => ({
    ...context,
    hasError: false,
    error: null
  })
};
```

## Touch & Gesture Support

### Touch-Friendly Interactions

```css
/* touch-targets.css */
/* Minimum touch target size: 44x44px (iOS) / 48x48px (Android) */
button,
a,
input,
select,
textarea,
[role="button"],
[tabindex="0"] {
  min-height: 44px;
  min-width: 44px;
  /* Increase tap area without affecting layout */
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -8px;
    right: -8px;
    bottom: -8px;
    left: -8px;
  }
}

/* Visual feedback for touch */
@media (hover: none) {
  button:active,
  a:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

/* Prevent text selection on interactive elements */
button,
[role="button"] {
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}
```

### Swipe Gestures

```typescript
// swipe-handler.ts
interface SwipeConfig {
  threshold?: number;
  timeout?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export class SwipeHandler {
  private startX = 0;
  private startY = 0;
  private startTime = 0;
  private config: Required<SwipeConfig>;
  
  constructor(element: HTMLElement, config: SwipeConfig = {}) {
    this.config = {
      threshold: 50,
      timeout: 500,
      onSwipeLeft: () => {},
      onSwipeRight: () => {},
      onSwipeUp: () => {},
      onSwipeDown: () => {},
      ...config
    };
    
    // Touch events
    element.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    element.addEventListener('touchend', this.handleTouchEnd, { passive: true });
    
    // Mouse events for testing
    element.addEventListener('mousedown', this.handleMouseDown);
    element.addEventListener('mouseup', this.handleMouseUp);
  }
  
  private handleStart(x: number, y: number): void {
    this.startX = x;
    this.startY = y;
    this.startTime = Date.now();
  }
  
  private handleEnd(x: number, y: number): void {
    const deltaX = x - this.startX;
    const deltaY = y - this.startY;
    const deltaTime = Date.now() - this.startTime;
    
    if (deltaTime > this.config.timeout) return;
    
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    if (absX > absY && absX > this.config.threshold) {
      // Horizontal swipe
      if (deltaX > 0) {
        this.config.onSwipeRight();
      } else {
        this.config.onSwipeLeft();
      }
    } else if (absY > absX && absY > this.config.threshold) {
      // Vertical swipe
      if (deltaY > 0) {
        this.config.onSwipeDown();
      } else {
        this.config.onSwipeUp();
      }
    }
  }
  
  private handleTouchStart = (e: TouchEvent): void => {
    const touch = e.touches[0];
    this.handleStart(touch.clientX, touch.clientY);
  };
  
  private handleTouchEnd = (e: TouchEvent): void => {
    const touch = e.changedTouches[0];
    this.handleEnd(touch.clientX, touch.clientY);
  };
  
  private handleMouseDown = (e: MouseEvent): void => {
    this.handleStart(e.clientX, e.clientY);
  };
  
  private handleMouseUp = (e: MouseEvent): void => {
    this.handleEnd(e.clientX, e.clientY);
  };
}

// Integration with actors
const mobileNavElement = document.querySelector('mobile-nav');
new SwipeHandler(mobileNavElement, {
  onSwipeLeft: () => navActor.send({ type: 'CLOSE', source: 'swipe' }),
  onSwipeRight: () => navActor.send({ type: 'OPEN', source: 'swipe' })
});
```

## Responsive Design

### Container Queries for Component-Based Responsiveness

```css
/* container-queries.css */
/* Define container contexts */
.card-container {
  container-type: inline-size;
  container-name: card;
}

.sidebar {
  container-type: inline-size;
  container-name: sidebar;
}

/* Component responds to its container, not viewport */
@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 150px 1fr;
    gap: 1rem;
  }
  
  .card-image {
    width: 100%;
    height: auto;
  }
}

@container card (max-width: 399px) {
  .card {
    display: flex;
    flex-direction: column;
  }
  
  .card-image {
    width: 100%;
    max-height: 200px;
    object-fit: cover;
  }
}

/* Sidebar adapts to available space */
@container sidebar (max-width: 300px) {
  .sidebar-nav {
    /* Icon-only mode */
    .nav-text {
      display: none;
    }
    
    .nav-icon {
      font-size: 1.5rem;
    }
  }
}

/* Data-state responsive patterns */
[data-viewport="mobile"] .responsive-grid {
  grid-template-columns: 1fr;
}

[data-viewport="tablet"] .responsive-grid {
  grid-template-columns: repeat(2, 1fr);
}

[data-viewport="desktop"] .responsive-grid {
  grid-template-columns: repeat(3, 1fr);
}
```

```typescript
// viewport-observer.ts
export class ViewportObserver {
  private breakpoints = {
    mobile: 640,
    tablet: 1024,
    desktop: Infinity
  };
  
  private callbacks = new Set<(viewport: string) => void>();
  private currentViewport: string;
  
  constructor() {
    this.currentViewport = this.getViewport();
    window.addEventListener('resize', this.handleResize);
  }
  
  private getViewport(): string {
    const width = window.innerWidth;
    
    for (const [name, breakpoint] of Object.entries(this.breakpoints)) {
      if (width <= breakpoint) return name;
    }
    
    return 'desktop';
  }
  
  private handleResize = (): void => {
    const newViewport = this.getViewport();
    
    if (newViewport !== this.currentViewport) {
      this.currentViewport = newViewport;
      this.callbacks.forEach(cb => cb(newViewport));
      
      // Update data attribute for CSS
      document.documentElement.dataset.viewport = newViewport;
    }
  };
  
  subscribe(callback: (viewport: string) => void): () => void {
    this.callbacks.add(callback);
    callback(this.currentViewport);
    
    return () => this.callbacks.delete(callback);
  }
}

// Actor integration
export const viewportActions = {
  setupViewportObserver: ({ context }) => {
    const observer = new ViewportObserver();
    const unsubscribe = observer.subscribe(viewport => {
      // Send event to actor when viewport changes
      context.viewport = viewport;
    });
    
    return { ...context, viewportCleanup: unsubscribe };
  }
};
```

## Performance & Perceived Performance

### Optimistic UI Updates

```typescript
// optimistic-updates.ts
export const optimisticActions = {
  // Immediately update UI, then sync with server
  addTodoOptimistic: ({ context }, event) => {
    const tempId = `temp-${Date.now()}`;
    const newTodo = {
      id: tempId,
      text: event.text,
      completed: false,
      isPending: true // Mark as pending
    };
    
    // Immediate UI update
    const updatedTodos = [...context.todos, newTodo];
    
    // Fire async request
    api.createTodo(event.text)
      .then(todo => {
        // Replace temp todo with real one
        actor.send({ 
          type: 'REPLACE_TEMP_TODO', 
          tempId, 
          todo 
        });
      })
      .catch(error => {
        // Rollback on error
        actor.send({ 
          type: 'REMOVE_TEMP_TODO', 
          tempId,
          error 
        });
      });
    
    return { ...context, todos: updatedTodos };
  },
  
  replaceTempTodo: ({ context }, event) => {
    const todos = context.todos.map(todo =>
      todo.id === event.tempId ? event.todo : todo
    );
    return { ...context, todos };
  },
  
  removeTempTodo: ({ context }, event) => {
    const todos = context.todos.filter(todo => todo.id !== event.tempId);
    return { 
      ...context, 
      todos,
      error: event.error 
    };
  }
};
```

### Lazy Loading Components

```typescript
// lazy-component.ts
export class LazyComponent extends HTMLElement {
  private hasLoaded = false;
  private observer: IntersectionObserver;
  
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback(): void {
    // Show placeholder
    this.shadowRoot!.innerHTML = `
      <div class="placeholder">
        <div class="skeleton skeleton-text"></div>
      </div>
    `;
    
    // Set up intersection observer
    this.observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !this.hasLoaded) {
          this.loadComponent();
        }
      },
      { rootMargin: '100px' } // Start loading 100px before visible
    );
    
    this.observer.observe(this);
  }
  
  disconnectedCallback(): void {
    this.observer?.disconnect();
  }
  
  private async loadComponent(): Promise<void> {
    this.hasLoaded = true;
    this.observer.disconnect();
    
    try {
      // Dynamic import
      const module = await import('./heavy-component.js');
      const Component = module.default;
      
      // Replace placeholder with real component
      const component = new Component();
      this.shadowRoot!.innerHTML = '';
      this.shadowRoot!.appendChild(component);
    } catch (error) {
      this.shadowRoot!.innerHTML = ErrorHandler.renderError(error).outerHTML;
    }
  }
}

customElements.define('lazy-component', LazyComponent);
```

## Internationalization (i18n)

### Text Direction & Language Support

```css
/* i18n.css */
/* RTL Support */
[dir="rtl"] {
  /* Flip horizontal properties */
  .nav-list {
    flex-direction: row-reverse;
  }
  
  .card {
    text-align: right;
  }
  
  /* Logical properties (automatic RTL support) */
  .button {
    padding-inline-start: 1rem;
    padding-inline-end: 1rem;
    margin-inline-start: 0.5rem;
  }
}

/* Language-specific adjustments */
:lang(ar) {
  font-family: 'Noto Sans Arabic', sans-serif;
  line-height: 1.8; /* Arabic needs more line height */
}

:lang(ja),
:lang(zh) {
  font-family: 'Noto Sans CJK', sans-serif;
  word-break: keep-all; /* Prevent breaking CJK text */
}

/* Prevent text overflow in any language */
.text-content {
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}
```

```typescript
// i18n-manager.ts
interface Translations {
  [key: string]: {
    [locale: string]: string;
  };
}

export class I18nManager {
  private currentLocale: string;
  private translations: Translations = {};
  private observers = new Set<(locale: string) => void>();
  
  constructor(defaultLocale = 'en') {
    this.currentLocale = this.detectLocale() || defaultLocale;
    this.updateDocumentLang();
  }
  
  private detectLocale(): string {
    return navigator.language.split('-')[0];
  }
  
  private updateDocumentLang(): void {
    document.documentElement.lang = this.currentLocale;
    document.documentElement.dir = this.isRTL() ? 'rtl' : 'ltr';
  }
  
  private isRTL(): boolean {
    return ['ar', 'he', 'fa', 'ur'].includes(this.currentLocale);
  }
  
  async loadTranslations(locale: string): Promise<void> {
    try {
      const response = await fetch(`/locales/${locale}.json`);
      const translations = await response.json();
      
      this.translations = { ...this.translations, ...translations };
      this.currentLocale = locale;
      this.updateDocumentLang();
      
      // Notify observers
      this.observers.forEach(cb => cb(locale));
    } catch (error) {
      console.error(`Failed to load locale ${locale}:`, error);
    }
  }
  
  t(key: string, params?: Record<string, any>): string {
    const translation = this.translations[key]?.[this.currentLocale] || key;
    
    if (!params) return translation;
    
    // Simple template replacement
    return translation.replace(/\{\{(\w+)\}\}/g, (match, param) => 
      params[param]?.toString() || match
    );
  }
  
  subscribe(callback: (locale: string) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }
}

// Web component integration
export class I18nText extends HTMLElement {
  private i18n = new I18nManager();
  private unsubscribe?: () => void;
  
  static get observedAttributes(): string[] {
    return ['key', 'params'];
  }
  
  connectedCallback(): void {
    this.unsubscribe = this.i18n.subscribe(() => this.render());
    this.render();
  }
  
  disconnectedCallback(): void {
    this.unsubscribe?.();
  }
  
  private render(): void {
    const key = this.getAttribute('key');
    if (!key) return;
    
    const params = this.getAttribute('params');
    const paramObj = params ? JSON.parse(params) : undefined;
    
    this.textContent = this.i18n.t(key, paramObj);
  }
}

customElements.define('i18n-text', I18nText);
```

## Screen Reader Announcements

### Live Regions for Dynamic Updates

```typescript
// announcer.ts
export class ScreenReaderAnnouncer {
  private container: HTMLElement;
  private timeout?: number;
  
  constructor() {
    this.container = this.createContainer();
  }
  
  private createContainer(): HTMLElement {
    const existing = document.getElementById('sr-announcer');
    if (existing) return existing;
    
    const container = document.createElement('div');
    container.id = 'sr-announcer';
    container.className = 'sr-only';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    
    document.body.appendChild(container);
    return container;
  }
  
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    // Clear previous timeout
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    
    // Update aria-live if needed
    if (this.container.getAttribute('aria-live') !== priority) {
      this.container.setAttribute('aria-live', priority);
    }
    
    // Clear and set new message
    this.container.textContent = '';
    
    // Use timeout to ensure screen readers pick up the change
    this.timeout = setTimeout(() => {
      this.container.textContent = message;
      
      // Clear after announcement
      this.timeout = setTimeout(() => {
        this.container.textContent = '';
      }, 1000);
    }, 100);
  }
  
  // Convenience methods
  announceSuccess(action: string): void {
    this.announce(`${action} successful`, 'polite');
  }
  
  announceError(error: string): void {
    this.announce(`Error: ${error}`, 'assertive');
  }
  
  announceLoading(resource: string): void {
    this.announce(`Loading ${resource}`, 'polite');
  }
}

// Global instance
export const announcer = new ScreenReaderAnnouncer();

// Actor integration
export const announcerActions = {
  announceStateChange: ({ context }, event) => {
    const stateMessages = {
      loading: 'Loading content',
      loaded: 'Content loaded',
      error: 'An error occurred',
      empty: 'No results found'
    };
    
    const message = stateMessages[event.state] || `State changed to ${event.state}`;
    announcer.announce(message);
    
    return context;
  }
};
```

## Form Patterns

### Accessible Form Validation

```typescript
// form-validator.ts
interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

export class FormValidator {
  private rules = new Map<string, ValidationRule[]>();
  private errors = new Map<string, string[]>();
  
  addRule(fieldName: string, rule: ValidationRule): void {
    const fieldRules = this.rules.get(fieldName) || [];
    fieldRules.push(rule);
    this.rules.set(fieldName, fieldRules);
  }
  
  validate(fieldName: string, value: string): boolean {
    const fieldRules = this.rules.get(fieldName) || [];
    const errors: string[] = [];
    
    for (const rule of fieldRules) {
      if (!rule.test(value)) {
        errors.push(rule.message);
      }
    }
    
    if (errors.length > 0) {
      this.errors.set(fieldName, errors);
      this.updateFieldError(fieldName, errors);
      return false;
    } else {
      this.errors.delete(fieldName);
      this.clearFieldError(fieldName);
      return true;
    }
  }
  
  private updateFieldError(fieldName: string, errors: string[]): void {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (!field) return;
    
    // Update ARIA attributes
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', `${fieldName}-error`);
    
    // Create or update error message
    let errorElement = document.getElementById(`${fieldName}-error`);
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = `${fieldName}-error`;
      errorElement.className = 'field-error';
      errorElement.setAttribute('role', 'alert');
      errorElement.setAttribute('aria-live', 'polite');
      field.parentElement?.appendChild(errorElement);
    }
    
    errorElement.textContent = errors.join('. ');
    
    // Announce to screen readers
    announcer.announce(`${fieldName}: ${errors.join('. ')}`, 'polite');
  }
  
  private clearFieldError(fieldName: string): void {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (!field) return;
    
    field.setAttribute('aria-invalid', 'false');
    field.removeAttribute('aria-describedby');
    
    const errorElement = document.getElementById(`${fieldName}-error`);
    errorElement?.remove();
  }
}

// Common validation rules
export const validationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    test: value => value.trim().length > 0,
    message
  }),
  
  email: (message = 'Enter a valid email'): ValidationRule => ({
    test: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message
  }),
  
  minLength: (min: number, message?: string): ValidationRule => ({
    test: value => value.length >= min,
    message: message || `Must be at least ${min} characters`
  }),
  
  pattern: (regex: RegExp, message: string): ValidationRule => ({
    test: value => regex.test(value),
    message
  })
};

// Form component with validation
export class ValidatedForm extends HTMLElement {
  private validator = new FormValidator();
  private controller: FormController;
  
  connectedCallback(): void {
    this.setupValidation();
    this.controller = new FormController(this);
  }
  
  private setupValidation(): void {
    // Add validation rules
    this.validator.addRule('email', validationRules.required());
    this.validator.addRule('email', validationRules.email());
    this.validator.addRule('password', validationRules.required());
    this.validator.addRule('password', validationRules.minLength(8));
    
    // Real-time validation
    this.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.name) {
        this.validator.validate(target.name, target.value);
      }
    });
    
    // Validate on submit
    this.addEventListener('submit', (e: Event) => {
      e.preventDefault();
      
      const formData = new FormData(this as HTMLFormElement);
      let isValid = true;
      
      for (const [name, value] of formData) {
        if (!this.validator.validate(name, value.toString())) {
          isValid = false;
        }
      }
      
      if (isValid) {
        this.controller.submit(formData);
      }
    });
  }
}
```

## Best Practices Checklist

### Accessibility
- [ ] All interactive elements have accessible names
- [ ] Focus indicators are visible and consistent
- [ ] Color is not the only indicator of state
- [ ] Touch targets are at least 44x44px
- [ ] Forms have proper labels and error messages
- [ ] Dynamic content changes are announced
- [ ] Keyboard navigation works throughout
- [ ] Skip links are provided for navigation
- [ ] Images have appropriate alt text
- [ ] Videos have captions and transcripts

### Performance
- [ ] Components lazy load when appropriate
- [ ] Animations respect prefers-reduced-motion
- [ ] Skeleton screens show during loading
- [ ] Optimistic updates provide instant feedback
- [ ] Long operations show progress indicators
- [ ] Error states have recovery actions
- [ ] Content is progressively enhanced
- [ ] Critical CSS is inlined
- [ ] Images are optimized and lazy loaded
- [ ] Code splitting is implemented

### User Experience
- [ ] Error messages are helpful and actionable
- [ ] Loading states are informative
- [ ] Gestures have keyboard equivalents
- [ ] Navigation is consistent and predictable
- [ ] Forms validate in real-time
- [ ] Success feedback is clear
- [ ] Content adapts to viewport/container
- [ ] Text remains readable when zoomed
- [ ] Interactive elements have hover/active states
- [ ] Back button behavior is predictable

### Internationalization
- [ ] Text can expand without breaking layout
- [ ] RTL languages display correctly
- [ ] Dates/times/numbers are localized
- [ ] Translations are loaded dynamically
- [ ] Language can be changed without reload
- [ ] Icons are culturally appropriate
- [ ] Color meanings are culturally aware
- [ ] Form inputs accept international formats
- [ ] Error messages are translated
- [ ] Currency displays are localized

## Implementation Priority

1. **Critical** (Do First)
   - Focus management
   - Keyboard navigation
   - ARIA automation
   - Error handling
   - Touch targets

2. **Important** (Do Soon)
   - Loading states
   - Motion preferences
   - Color contrast
   - Form validation
   - Screen reader announcements

3. **Enhancement** (Do Eventually)
   - Skeleton screens
   - Optimistic updates
   - Gesture support
   - Container queries
   - Internationalization

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Web.dev Accessibility](https://web.dev/accessibility/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [Inclusive Components](https://inclusive-components.design/)

## Conclusion

Building accessible, performant applications requires attention to detail and understanding of diverse user needs. This guide provides patterns and utilities that work seamlessly with our actor-based architecture, ensuring that state management, accessibility, and user experience work together harmoniously.

Remember: **Accessibility is not a feature, it's a fundamental requirement.** Every pattern in this guide should be considered essential for a production-ready application. 