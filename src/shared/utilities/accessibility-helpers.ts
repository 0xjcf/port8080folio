/**
 * Re-export reactive accessibility utilities from the framework
 *
 * This module provides backward compatibility by re-exporting
 * the Actor-SPA framework's reactive accessibility implementations.
 *
 * Direct DOM manipulation is not allowed in the Actor-SPA framework.
 * All accessibility features should use the reactive patterns provided.
 */

// Re-export types from framework
export type {
  AccessibilityErrorMessage,
  AccessibilityIssue,
  AnnouncementConfig,
  AriaAttributes,
  FocusOptions,
  KeyboardConfig,
} from '../../framework/core/accessibility-utilities.js';

// Re-export pure utility functions
export {
  // Error messages
  AccessibilityErrorMessages,
  createAriaAttributeString,
  generateId,
  getColorScheme,
  // ARIA utilities
  isValidAriaAttribute,
  // String utilities
  kebabCase,
  prefersHighContrast,
  // User preference detection
  prefersReducedMotion,
} from '../../framework/core/accessibility-utilities.js';
// Re-export ARIA observer class and types
export {
  type AriaMapping,
  AriaObserver,
  type AriaObserverOptions,
} from '../../framework/core/aria-observer.js';
export type {
  DefaultFocusConfigType,
  FocusContext,
  FocusEvent,
  FocusManagementActor,
  FocusManagementConfig,
  FocusManagementSnapshot,
} from '../../framework/core/focus-management.js';
// Re-export focus management
export {
  createFocusManagementHelper,
  DefaultFocusConfigs,
  FocusManagementHelper,
  focusManagementMachine,
  getFirstFocusableElement,
  getFocusableElements,
  getLastFocusableElement,
  isFocusable,
} from '../../framework/core/focus-management.js';
export type {
  DefaultKeyboardConfigType,
  KeyboardNavigationActor,
  KeyboardNavigationConfig,
  KeyboardNavigationContext,
  KeyboardNavigationEvent,
  KeyboardNavigationSnapshot,
} from '../../framework/core/keyboard-navigation.js';
// Re-export keyboard navigation
export {
  createKeyboardNavigationHelper,
  DefaultKeyboardConfigs,
  KeyboardNavigationHelper,
  keyboardNavigationMachine,
} from '../../framework/core/keyboard-navigation.js';
export type {
  AnnouncementContext,
  AnnouncementEvent,
  AnnouncementMessage,
  ScreenReaderAnnouncementActor,
  ScreenReaderAnnouncementSnapshot,
} from '../../framework/core/screen-reader-announcements.js';
// Re-export screen reader announcements
export {
  createScreenReaderAnnouncementHelper,
  ScreenReaderAnnouncementHelper,
  screenReaderAnnouncementMachine,
} from '../../framework/core/screen-reader-announcements.js';

/**
 * @deprecated AriaManager is replaced by reactive patterns
 * Use AriaObserverHelper or template attributes instead
 */
export const AriaManager = {
  setAttributes: () => {
    console.warn(
      'AriaManager.setAttributes is deprecated. Use AriaObserverHelper or template attributes instead.'
    );
  },
  removeAttributes: () => {
    console.warn(
      'AriaManager.removeAttributes is deprecated. Use AriaObserverHelper or template attributes instead.'
    );
  },
  toggleAttribute: () => {
    console.warn(
      'AriaManager.toggleAttribute is deprecated. Use AriaObserverHelper or template attributes instead.'
    );
    return false;
  },
  ensureId: (_element: HTMLElement, prefix = 'element') => {
    console.warn('AriaManager.ensureId is deprecated. Use generateId() instead.');
    // generateId is already imported above
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },
  linkElements: () => {
    console.warn('AriaManager.linkElements is deprecated. Use template attributes instead.');
  },
};

/**
 * @deprecated FocusManager is replaced by focusManagementMachine
 * Use FocusManagementHelper instead
 */
export const FocusManager = {
  setFocus: () => {
    console.warn(
      'FocusManager.setFocus is deprecated. Use FocusManagementHelper.focusElement() instead.'
    );
    return false;
  },
  restoreFocus: () => {
    console.warn(
      'FocusManager.restoreFocus is deprecated. Use FocusManagementHelper.restoreFocus() instead.'
    );
    return false;
  },
  trapFocus: () => {
    console.warn(
      'FocusManager.trapFocus is deprecated. Use FocusManagementHelper.trapFocus() instead.'
    );
  },
  releaseFocusTrap: () => {
    console.warn(
      'FocusManager.releaseFocusTrap is deprecated. Use FocusManagementHelper.releaseFocusTrap() instead.'
    );
  },
  getFocusableElements: (_container: HTMLElement) => {
    console.warn(
      'FocusManager.getFocusableElements is deprecated. Use getFocusableElements() instead.'
    );
    // Return empty array for deprecated function
    return [];
  },
};

/**
 * Migration Guide:
 *
 * 1. Replace direct DOM manipulation with reactive patterns:
 *    - Use XState machines for state management
 *    - Use template functions for rendering
 *    - Use data attributes for styling
 *
 * 2. Replace AriaManager with:
 *    - AriaObserverHelper for reactive ARIA updates
 *    - createAriaAttributeString() for template attributes
 *
 * 3. Replace FocusManager with:
 *    - focusManagementMachine for focus state
 *    - FocusManagementHelper for template integration
 *
 * 4. Replace addEventListener with:
 *    - send attributes in templates
 *    - XState event handling
 *
 * 5. Replace setTimeout/requestAnimationFrame with:
 *    - XState delayed transitions
 *    - Animation services from the framework
 *
 * See the framework documentation for detailed examples.
 */
