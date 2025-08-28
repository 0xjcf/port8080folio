/**
 * Form Checkbox Component Tests
 * Following atomic design principles and accessibility best practices
 */
import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { renderComponent } from '../../helpers/test-helpers';
// Import for side effects (auto-registration)
import '../../../src/components/atoms/form-checkbox';
// Import type only for TypeScript
import type { FormCheckbox } from '../../../src/components/atoms/form-checkbox';

describe('FormCheckbox', () => {
  let container: HTMLDivElement;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    container = createTestContainer();
    user = userEvent.setup();
  });

  // Helper function to render component
  function renderCheckbox(attrs = '', content = '') {
    return renderComponent(container, 'form-checkbox', attrs, content);
  }

  describe('Rendering', () => {
    it('should render with default attributes', () => {
      const el = renderCheckbox();
      
      expect(el).toBeInTheDocument();
      expect(el).toHaveClass('form-checkbox');
      
      const input = el.querySelector('.form-checkbox__input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'checkbox');
      expect(input).toHaveAttribute('value', 'on');
      expect(input).not.toBeChecked();
      expect(input).not.toBeDisabled();
      
      const box = el.querySelector('.form-checkbox__box');
      expect(box).toBeInTheDocument();
      expect(box).toHaveAttribute('aria-hidden', 'true');
    });

    it('should render with label', () => {
      const el = renderCheckbox('label="Accept terms"');
      
      const text = el.querySelector('.form-checkbox__text');
      expect(text).toBeInTheDocument();
      expect(text).toHaveTextContent('Accept terms');
      
      const label = el.querySelector('.form-checkbox__label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute('for');
    });

    it('should render checked state', () => {
      const el = renderCheckbox('checked');
      
      const input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      expect(input).toBeChecked();
      expect(input).toHaveAttribute('aria-checked', 'true');
      expect(el).toHaveClass('is-checked');
    });

    it('should render disabled state', () => {
      const el = renderCheckbox('disabled');
      
      const input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      expect(input).toBeDisabled();
      expect(el).toHaveClass('is-disabled');
      
      const label = el.querySelector('.form-checkbox__label');
      expect(label).toHaveClass('form-checkbox__label--disabled');
    });

    it('should render required state', () => {
      const el = renderCheckbox('required label="Required field"');
      
      const input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      expect(input).toBeRequired();
      expect(input).toHaveAttribute('aria-required', 'true');
      
      const required = el.querySelector('.form-checkbox__required');
      expect(required).toBeInTheDocument();
      expect(required).toHaveAttribute('aria-label', 'required');
      expect(required).toHaveTextContent('*');
    });

    it('should render indeterminate state', () => {
      const el = renderCheckbox('indeterminate');
      
      const input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      expect(input?.indeterminate).toBe(true);
      expect(input).toHaveAttribute('aria-checked', 'mixed');
      expect(el).toHaveClass('is-indeterminate');
    });

    it('should render with custom name and value', () => {
      const el = renderCheckbox('name="terms" value="accepted"');
      
      const input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      expect(input).toHaveAttribute('name', 'terms');
      expect(input).toHaveAttribute('value', 'accepted');
    });

    it('should preserve author-supplied classes', () => {
      container.innerHTML = '<form-checkbox class="custom-class u-margin">test</form-checkbox>';
      const el = container.querySelector<HTMLElement>('form-checkbox');
      
      expect(el).toHaveClass('form-checkbox');
      expect(el).toHaveClass('custom-class');
      expect(el).toHaveClass('u-margin');
    });
  });

  describe('Attribute Reactivity', () => {
    it('should re-render when label changes', () => {
      const el = renderCheckbox('label="Original"');
      const text = el.querySelector('.form-checkbox__text');
      
      expect(text).toHaveTextContent('Original');
      
      el.setAttribute('label', 'Updated');
      const updatedText = el.querySelector('.form-checkbox__text');
      expect(updatedText).toHaveTextContent('Updated');
    });

    it('should toggle checked state when attribute changes', () => {
      const el = renderCheckbox();
      const input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      
      expect(input).not.toBeChecked();
      expect(el).not.toHaveClass('is-checked');
      
      el.setAttribute('checked', '');
      const updatedInput = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      expect(updatedInput).toBeChecked();
      expect(el).toHaveClass('is-checked');
      
      el.removeAttribute('checked');
      const finalInput = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      expect(finalInput).not.toBeChecked();
      expect(el).not.toHaveClass('is-checked');
    });

    it('should toggle disabled state when attribute changes', () => {
      const el = renderCheckbox();
      const input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      
      expect(input).not.toBeDisabled();
      
      el.setAttribute('disabled', '');
      const updatedInput = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      expect(updatedInput).toBeDisabled();
      expect(el).toHaveClass('is-disabled');
    });

    it('should handle indeterminate attribute changes', () => {
      const el = renderCheckbox();
      const input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      
      expect(input?.indeterminate).toBe(false);
      
      el.setAttribute('indeterminate', '');
      const updatedInput = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      expect(updatedInput?.indeterminate).toBe(true);
      expect(updatedInput).toHaveAttribute('aria-checked', 'mixed');
      expect(el).toHaveClass('is-indeterminate');
    });
  });

  describe('User Interaction', () => {
    it('should toggle checked state on click', async () => {
      const el = renderCheckbox('label="Click me"');
      let input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      
      expect(input).not.toBeChecked();
      
      if (!input) throw new Error('Input not found');
      await user.click(input);
      
      // Re-query after first click
      input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      expect(input).toBeChecked();
      expect(el).toHaveClass('is-checked');
      expect(el).toHaveAttribute('checked');
      
      if (!input) throw new Error('Input not found');
      await user.click(input);
      
      // Re-query after second click
      input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      expect(input).not.toBeChecked();
      expect(el).not.toHaveClass('is-checked');
      expect(el).not.toHaveAttribute('checked');
    });

    it('should dispatch checkbox-change event', async () => {
      const el = renderCheckbox('name="test" value="test-value"');
      const input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      const changeHandler = vi.fn();
      
      el.addEventListener('checkbox-change', changeHandler);
      
      if (!input) throw new Error('Input not found');
      await user.click(input);
      
      expect(changeHandler).toHaveBeenCalledTimes(1);
      const event = changeHandler.mock.calls[0][0];
      expect(event.detail).toEqual({
        checked: true,
        value: 'test-value',
        name: 'test'
      });
    });

    it('should clear indeterminate on user interaction', async () => {
      const el = renderCheckbox('indeterminate');
      let input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      
      expect(input?.indeterminate).toBe(true);
      expect(el).toHaveClass('is-indeterminate');
      
      if (!input) throw new Error('Input not found');
      await user.click(input);
      
      // Re-query after click which triggers re-render
      input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      expect(input?.indeterminate).toBe(false);
      expect(el).not.toHaveClass('is-indeterminate');
      expect(el).not.toHaveAttribute('indeterminate');
    });

    it('should not toggle when disabled', async () => {
      const el = renderCheckbox('disabled');
      const input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      
      expect(input).not.toBeChecked();
      
      if (!input) throw new Error('Input not found');
      await user.click(input);
      
      expect(input).not.toBeChecked();
    });

    it('should handle keyboard navigation', async () => {
      const el = renderCheckbox('label="Keyboard test"');
      let input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      
      if (!input) throw new Error('Input not found');
      input.focus();
      expect(document.activeElement).toBe(input);
      
      // Space key toggles checkbox
      await user.keyboard(' ');
      
      // Re-query after keyboard interaction
      input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      expect(input).toBeChecked();
      
      await user.keyboard(' ');
      
      // Re-query again
      input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      expect(input).not.toBeChecked();
    });

    it('should show focus state', async () => {
      const el = renderCheckbox('label="Focus me"');
      let input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      
      if (!input) throw new Error('Input not found');
      input.focus();
      
      // Re-query after focus event
      let label = el.querySelector('.form-checkbox__label');
      expect(label).toHaveClass('form-checkbox__label--focused');
      expect(el).toHaveClass('is-focused');
      
      input.blur();
      
      // Re-query after blur event
      label = el.querySelector('.form-checkbox__label');
      expect(label).not.toHaveClass('form-checkbox__label--focused');
      expect(el).not.toHaveClass('is-focused');
    });
  });

  describe('Public Methods', () => {
    it('should check/uncheck programmatically', () => {
      const el = renderCheckbox() as FormCheckbox;
      
      expect(el.isChecked()).toBe(false);
      
      el.setChecked(true);
      expect(el.isChecked()).toBe(true);
      expect(el).toHaveClass('is-checked');
      expect(el).toHaveAttribute('checked');
      
      el.setChecked(false);
      expect(el.isChecked()).toBe(false);
      expect(el).not.toHaveClass('is-checked');
      expect(el).not.toHaveAttribute('checked');
    });

    it('should toggle state', () => {
      const el = renderCheckbox() as FormCheckbox;
      
      expect(el.isChecked()).toBe(false);
      
      el.toggle();
      expect(el.isChecked()).toBe(true);
      
      el.toggle();
      expect(el.isChecked()).toBe(false);
    });

    it('should set indeterminate state', () => {
      const el = renderCheckbox() as FormCheckbox;
      let input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      
      el.setIndeterminate(true);
      // Re-query after setting indeterminate
      input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      expect(input?.indeterminate).toBe(true);
      expect(el).toHaveClass('is-indeterminate');
      expect(el).toHaveAttribute('indeterminate');
      
      el.setIndeterminate(false);
      // Re-query after unsetting indeterminate
      input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      expect(input?.indeterminate).toBe(false);
      expect(el).not.toHaveClass('is-indeterminate');
      expect(el).not.toHaveAttribute('indeterminate');
    });

    it('should get value when checked', () => {
      const el = renderCheckbox('value="custom-value"') as FormCheckbox;
      
      expect(el.getValue()).toBeNull();
      
      el.setChecked(true);
      expect(el.getValue()).toBe('custom-value');
      
      el.setChecked(false);
      expect(el.getValue()).toBeNull();
    });

    it('should get name', () => {
      const el = renderCheckbox('name="test-name"') as FormCheckbox;
      
      expect(el.getName()).toBe('test-name');
    });

    it('should handle disabled state', () => {
      const el = renderCheckbox() as FormCheckbox;
      
      expect(el.isDisabled()).toBe(false);
      
      el.setDisabled(true);
      expect(el.isDisabled()).toBe(true);
      expect(el).toHaveClass('is-disabled');
      expect(el).toHaveAttribute('disabled');
      
      const input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      expect(input).toBeDisabled();
      
      el.setDisabled(false);
      expect(el.isDisabled()).toBe(false);
      expect(el).not.toHaveClass('is-disabled');
      expect(el).not.toHaveAttribute('disabled');
    });

    it('should focus and blur', () => {
      const el = renderCheckbox() as FormCheckbox;
      const input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      
      el.focus();
      expect(document.activeElement).toBe(input);
      
      el.blur();
      expect(document.activeElement).not.toBe(input);
    });
  });

  describe('Component Lifecycle', () => {
    it('should setup component when added to DOM', () => {
      const el = document.createElement('form-checkbox') as FormCheckbox;
      el.setAttribute('label', 'Dynamic');
      el.setAttribute('checked', '');
      
      container.appendChild(el);
      
      expect(el).toHaveClass('form-checkbox');
      expect(el).toHaveClass('is-checked');
      
      const text = el.querySelector('.form-checkbox__text');
      expect(text).toHaveTextContent('Dynamic');
    });

    it('should clean up event listeners on disconnectedCallback', () => {
      const el = renderCheckbox() as FormCheckbox;
      const detachSpy = vi.spyOn(el, 'detachEvents');
      
      el.remove();
      
      expect(detachSpy).toHaveBeenCalled();
    });

    it('should handle re-attachment to DOM', () => {
      const el = renderCheckbox('label="Test"') as FormCheckbox;
      
      // Remove from DOM
      el.remove();
      
      // Re-attach
      container.appendChild(el);
      
      // Should still work
      const input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      expect(input).toBeInTheDocument();
      
      el.setChecked(true);
      expect(el.isChecked()).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      renderCheckbox('label="Accessible checkbox"');
      const results = await a11y(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes', () => {
      const el = renderCheckbox('checked required');
      const input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      
      expect(input).toHaveAttribute('aria-checked', 'true');
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('should handle indeterminate ARIA state', () => {
      const el = renderCheckbox('indeterminate');
      const input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      
      expect(input).toHaveAttribute('aria-checked', 'mixed');
    });

    it('should have proper ARIA disabled state', () => {
      const el = renderCheckbox('disabled');
      const input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      
      expect(input).toHaveAttribute('aria-disabled', 'true');
    });

    it('should be keyboard navigable', () => {
      const el = renderCheckbox();
      const input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      
      if (!input) throw new Error('Input not found');
      input.focus();
      
      expect(document.activeElement).toBe(input);
    });

    it('should have label associated with input', () => {
      const el = renderCheckbox('label="Associated label"');
      const input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      const label = el.querySelector('label');
      
      expect(input).toHaveAttribute('id');
      expect(label).toHaveAttribute('for', input?.getAttribute('id') || '');
    });

    it('should mark decorative elements appropriately', () => {
      const el = renderCheckbox();
      
      const box = el.querySelector('.form-checkbox__box');
      expect(box).toHaveAttribute('aria-hidden', 'true');
      
      const svg = el.querySelector('svg');
      expect(svg).toHaveAttribute('role', 'presentation');
    });
  });

  describe('Mobile-first considerations', () => {
    it('should have minimum touch target size', () => {
      const el = renderCheckbox();
      
      // CSS should ensure minimum 44x44px touch target
      expect(el).toHaveClass('form-checkbox');
    });

    it('should handle touch interactions', async () => {
      const el = renderCheckbox();
      const input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      
      if (!input) throw new Error('Input not found');
      
      // Simulate touch tap
      await user.click(input);
      
      expect(input).toBeChecked();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty label', () => {
      const el = renderCheckbox('label=""');
      
      const text = el.querySelector('.form-checkbox__text');
      expect(text).not.toBeInTheDocument();
    });

    it('should handle special characters in label', () => {
      const el = renderCheckbox('label="<script>alert(1)</script>"');
      
      const text = el.querySelector('.form-checkbox__text');
      expect(text).toHaveTextContent('<script>alert(1)</script>');
      // Should be escaped, not executed
      expect(container.querySelector('script')).not.toBeInTheDocument();
    });

    it('should handle rapid toggling', async () => {
      const el = renderCheckbox() as FormCheckbox;
      
      // Toggle rapidly
      el.toggle();
      el.toggle();
      el.toggle();
      el.toggle();
      el.toggle();
      
      // Should end up checked (5 toggles)
      expect(el.isChecked()).toBe(true);
    });

    it('should handle setting checked while indeterminate', () => {
      const el = renderCheckbox('indeterminate') as FormCheckbox;
      
      el.setChecked(true);
      
      expect(el.isChecked()).toBe(true);
      expect(el).not.toHaveClass('is-indeterminate');
      
      const input = el.querySelector<HTMLInputElement>('.form-checkbox__input');
      expect(input?.indeterminate).toBe(false);
    });
  });
});