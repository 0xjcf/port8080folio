/**
 * Form Checkbox Group Component Tests
 * Following atomic design principles and accessibility best practices
 */
import { waitFor } from '@testing-library/dom';
import { renderComponent } from '../../helpers/test-helpers';
// Import for side effects (auto-registration)
import '../../../src/components/atoms/form-checkbox';
import '../../../src/components/atoms/form-checkbox-group';
// Import type only for TypeScript
import type { FormCheckbox } from '../../../src/components/atoms/form-checkbox';
import type { FormCheckboxGroup } from '../../../src/components/atoms/form-checkbox-group';

describe('FormCheckboxGroup', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = createTestContainer();
  });

  // Helper function to render component
  function renderCheckboxGroup(attrs = '', content = '') {
    return renderComponent<FormCheckboxGroup>(container, 'form-checkbox-group', attrs, content);
  }

  describe('Rendering', () => {
    it('should render with default attributes', () => {
      const el = renderCheckboxGroup();

      expect(el).toBeInTheDocument();
      expect(el).toHaveClass('form-field');
      expect(el).toHaveClass('form-field--checkbox-group');

      const groupContainer = el.querySelector('.form-checkbox-group');
      expect(groupContainer).toBeInTheDocument();

      const optionsContainer = el.querySelector('.form-checkbox-group__options');
      expect(optionsContainer).toBeInTheDocument();
    });

    it('should render with label using fieldset', () => {
      const el = renderCheckboxGroup('label="Select options"');

      const fieldset = el.querySelector('fieldset.form-checkbox-group');
      expect(fieldset).toBeInTheDocument();

      const legend = fieldset?.querySelector('legend.form-field__label');
      expect(legend).toBeInTheDocument();
      expect(legend).toHaveTextContent('Select options');
    });

    it('should render without label using div', () => {
      const el = renderCheckboxGroup('options="opt1:Option 1,opt2:Option 2"');

      const div = el.querySelector('div.form-checkbox-group');
      expect(div).toBeInTheDocument();

      const fieldset = el.querySelector('fieldset');
      expect(fieldset).not.toBeInTheDocument();
    });

    it('should render with required indicator', () => {
      const el = renderCheckboxGroup('label="Required Group" required');

      const legend = el.querySelector('.form-field__label');
      expect(legend).toBeInTheDocument();

      const required = legend?.querySelector('.form-field__required');
      expect(required).toBeInTheDocument();
      expect(required).toHaveTextContent('*');

      const fieldset = el.querySelector('fieldset');
      expect(fieldset).toHaveAttribute('aria-required', 'true');
    });

    it('should render checkboxes from options', () => {
      const el = renderCheckboxGroup('name="colors" options="red:Red,blue:Blue,green:Green"');

      const checkboxes = el.querySelectorAll('form-checkbox');
      expect(checkboxes).toHaveLength(3);

      expect(checkboxes[0]).toHaveAttribute('name', 'colors[]');
      expect(checkboxes[0]).toHaveAttribute('value', 'red');
      expect(checkboxes[0]).toHaveAttribute('label', 'Red');

      expect(checkboxes[1]).toHaveAttribute('value', 'blue');
      expect(checkboxes[1]).toHaveAttribute('label', 'Blue');

      expect(checkboxes[2]).toHaveAttribute('value', 'green');
      expect(checkboxes[2]).toHaveAttribute('label', 'Green');
    });

    it('should render with pre-selected values', () => {
      const el = renderCheckboxGroup('options="a:A,b:B,c:C" values="a,c"');

      const checkboxes = el.querySelectorAll<HTMLElement & FormCheckbox>('form-checkbox');

      expect(checkboxes[0]).toHaveAttribute('checked');
      expect(checkboxes[1]).not.toHaveAttribute('checked');
      expect(checkboxes[2]).toHaveAttribute('checked');
    });

    it('should render inline layout', () => {
      const el = renderCheckboxGroup('options="a:A,b:B" inline');

      const optionsContainer = el.querySelector('.form-checkbox-group__options');
      expect(optionsContainer).toHaveClass('form-checkbox-group__options--inline');
      expect(el).toHaveClass('form-field--inline');
    });

    it('should render error message', () => {
      const el = renderCheckboxGroup('error="Please select at least one"');

      const error = el.querySelector('.form-field__error');
      expect(error).toBeInTheDocument();
      expect(error).toHaveTextContent('Please select at least one');
      expect(error).toHaveAttribute('role', 'alert');
      expect(el).toHaveClass('form-field--error');
    });

    it('should render error message with options', () => {
      const el = renderCheckboxGroup('options="a:A,b:B" error="Please select at least one"');

      // Check if error attribute is preserved
      expect(el).toHaveAttribute('error', 'Please select at least one');
      
      const error = el.querySelector('.form-field__error');
      expect(error).toBeInTheDocument();
      expect(error).toHaveTextContent('Please select at least one');
      expect(error).toHaveAttribute('role', 'alert');
      expect(el).toHaveClass('form-field--error');
    });

    it('should render helper text', () => {
      const el = renderCheckboxGroup('helper="Choose multiple options"');

      const helper = el.querySelector('.form-field__helper');
      expect(helper).toBeInTheDocument();
      expect(helper).toHaveTextContent('Choose multiple options');
    });

    it('should not render helper when error exists', () => {
      const el = renderCheckboxGroup('helper="Help text" error="Error text"');

      const error = el.querySelector('.form-field__error');
      expect(error).toBeInTheDocument();

      const helper = el.querySelector('.form-field__helper');
      expect(helper).not.toBeInTheDocument();
    });
  });

  describe('Attribute Reactivity', () => {
    it('should update label dynamically', () => {
      const el = renderCheckboxGroup('label="Original"');

      let legend = el.querySelector('.form-field__label');
      expect(legend).toHaveTextContent('Original');

      el.setAttribute('label', 'Updated');

      legend = el.querySelector('.form-field__label');
      expect(legend).toHaveTextContent('Updated');
    });

    it('should update required state', () => {
      const el = renderCheckboxGroup('label="Group"');

      let required = el.querySelector('.form-field__required');
      expect(required).not.toBeInTheDocument();

      el.setAttribute('required', '');

      required = el.querySelector('.form-field__required');
      expect(required).toBeInTheDocument();

      const fieldset = el.querySelector('fieldset');
      expect(fieldset).toHaveAttribute('aria-required', 'true');
    });

    it('should toggle inline layout', () => {
      const el = renderCheckboxGroup('options="a:A,b:B"');

      const optionsContainer = el.querySelector('.form-checkbox-group__options');
      expect(optionsContainer).not.toHaveClass('form-checkbox-group__options--inline');

      el.setAttribute('inline', '');
      expect(optionsContainer).toHaveClass('form-checkbox-group__options--inline');
      expect(el).toHaveClass('form-field--inline');

      el.removeAttribute('inline');
      expect(optionsContainer).not.toHaveClass('form-checkbox-group__options--inline');
      expect(el).not.toHaveClass('form-field--inline');
    });

    it('should update options dynamically', () => {
      const el = renderCheckboxGroup('options="a:A,b:B"');

      let checkboxes = el.querySelectorAll('form-checkbox');
      expect(checkboxes).toHaveLength(2);

      el.setAttribute('options', 'x:X,y:Y,z:Z');

      checkboxes = el.querySelectorAll('form-checkbox');
      expect(checkboxes).toHaveLength(3);
      expect(checkboxes[0]).toHaveAttribute('value', 'x');
      expect(checkboxes[1]).toHaveAttribute('value', 'y');
      expect(checkboxes[2]).toHaveAttribute('value', 'z');
    });

    it('should preserve checked state when options update', () => {
      const el = renderCheckboxGroup('options="a:A,b:B,c:C" values="a,c"');

      // Toggle middle checkbox
      const checkboxes = el.querySelectorAll<HTMLElement & FormCheckbox>('form-checkbox');
      if (checkboxes[1]?.setChecked) {
        checkboxes[1].setChecked(true);
      }

      const valuesBefore = el.getValues();
      expect(valuesBefore).toEqual(['a', 'b', 'c']);

      // Update options (should preserve checked state)
      el.setAttribute('options', 'a:Apple,b:Banana,c:Cherry');

      const valuesAfter = el.getValues();
      expect(valuesAfter).toEqual(['a', 'b', 'c']);
    });

    it('should update values dynamically', () => {
      const el = renderCheckboxGroup('options="a:A,b:B,c:C"');

      el.setAttribute('values', 'b,c');

      const checkboxes = el.querySelectorAll<HTMLElement & FormCheckbox>('form-checkbox');

      expect(checkboxes[0]).not.toHaveAttribute('checked');
      expect(checkboxes[1]).toHaveAttribute('checked');
      expect(checkboxes[2]).toHaveAttribute('checked');
    });

    it('should show/hide error dynamically', () => {
      const el = renderCheckboxGroup();

      let error = el.querySelector('.form-field__error');
      expect(error).not.toBeInTheDocument();

      el.setAttribute('error', 'This is an error');

      error = el.querySelector('.form-field__error');
      expect(error).toBeInTheDocument();
      expect(error).toHaveTextContent('This is an error');
      expect(el).toHaveClass('form-field--error');

      el.removeAttribute('error');

      error = el.querySelector('.form-field__error');
      expect(error).not.toBeInTheDocument();
      expect(el).not.toHaveClass('form-field--error');
    });

    it('should show/hide helper dynamically', () => {
      const el = renderCheckboxGroup();

      let helper = el.querySelector('.form-field__helper');
      expect(helper).not.toBeInTheDocument();

      el.setAttribute('helper', 'Helpful text');

      helper = el.querySelector('.form-field__helper');
      expect(helper).toBeInTheDocument();
      expect(helper).toHaveTextContent('Helpful text');

      // Helper should disappear when error is shown
      el.setAttribute('error', 'Error text');

      helper = el.querySelector('.form-field__helper');
      expect(helper).not.toBeInTheDocument();
    });
  });

  describe('User Interaction', () => {
    it('should dispatch checkbox-group-change event when checkbox changes', async () => {
      const el = renderCheckboxGroup('name="test" options="a:A,b:B,c:C"');
      const changeHandler = vi.fn();

      el.addEventListener('checkbox-group-change', changeHandler);

      const firstCheckbox = el.querySelector('form-checkbox');
      if (!firstCheckbox) throw new Error('Checkbox not found');

      // Simulate checkbox change event
      firstCheckbox.dispatchEvent(new CustomEvent('checkbox-change', {
        detail: { checked: true, value: 'a', name: 'test[]' },
        bubbles: true
      }));

      await waitFor(() => {
        expect(changeHandler).toHaveBeenCalledTimes(1);
      });

      const event = changeHandler.mock.calls[0][0];
      expect(event.detail).toHaveProperty('values');
      expect(event.detail).toHaveProperty('name', 'test');
    });

    it('should clear error on checkbox change', async () => {
      const el = renderCheckboxGroup('options="a:A,b:B" error="Initial error"');

      let error = el.querySelector('.form-field__error');
      expect(error).toBeInTheDocument();

      const firstCheckbox = el.querySelector('form-checkbox');
      if (!firstCheckbox) throw new Error('Checkbox not found');

      // Trigger checkbox change
      firstCheckbox.dispatchEvent(new CustomEvent('checkbox-change', {
        detail: { checked: true },
        bubbles: true
      }));

      await waitFor(() => {
        error = el.querySelector('.form-field__error');
        expect(error).not.toBeInTheDocument();
      });
    });

    it('should handle multiple checkbox selections', async () => {
      const el = renderCheckboxGroup('options="a:A,b:B,c:C"');

      const checkboxes = el.querySelectorAll<HTMLElement & FormCheckbox>('form-checkbox');

      // Check first and third checkboxes
      if (checkboxes[0]?.setChecked) checkboxes[0].setChecked(true);
      if (checkboxes[2]?.setChecked) checkboxes[2].setChecked(true);

      const values = el.getValues();
      expect(values).toEqual(['a', 'c']);
    });
  });

  describe('Public Methods', () => {
    it('should get values of checked checkboxes', () => {
      const el = renderCheckboxGroup('options="a:A,b:B,c:C" values="a,c"');

      const values = el.getValues();
      expect(values).toEqual(['a', 'c']);
    });

    it('should set values programmatically', () => {
      const el = renderCheckboxGroup('options="a:A,b:B,c:C"');

      el.setValues(['b', 'c']);

      const values = el.getValues();
      expect(values).toEqual(['b', 'c']);

      const checkboxes = el.querySelectorAll<HTMLElement & FormCheckbox>('form-checkbox');
      expect(checkboxes[0]).not.toHaveAttribute('checked');
      expect(checkboxes[1]).toHaveAttribute('checked');
      expect(checkboxes[2]).toHaveAttribute('checked');
    });

    it('should clear all selections', () => {
      const el = renderCheckboxGroup('options="a:A,b:B,c:C" values="a,b,c"');

      expect(el.getValues()).toEqual(['a', 'b', 'c']);

      el.clear();

      expect(el.getValues()).toEqual([]);

      const checkboxes = el.querySelectorAll('form-checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).not.toHaveAttribute('checked');
      });
    });

    it('should clear error when clearing selections', () => {
      const el = renderCheckboxGroup('options="a:A,b:B" error="Error text"');

      let error = el.querySelector('.form-field__error');
      expect(error).toBeInTheDocument();

      el.clear();

      error = el.querySelector('.form-field__error');
      expect(error).not.toBeInTheDocument();
    });

    it('should validate required field', () => {
      const el = renderCheckboxGroup('options="a:A,b:B" required');

      // Should fail validation when empty
      let isValid = el.validate();
      expect(isValid).toBe(false);

      let error = el.querySelector('.form-field__error');
      expect(error).toBeInTheDocument();
      expect(error).toHaveTextContent('Please select at least one option');

      // Should pass validation when has selection
      el.setValues(['a']);
      isValid = el.validate();
      expect(isValid).toBe(true);

      error = el.querySelector('.form-field__error');
      expect(error).not.toBeInTheDocument();
    });

    it('should validate non-required field', () => {
      const el = renderCheckboxGroup('options="a:A,b:B"');

      // Should always pass validation when not required
      const isValid = el.validate();
      expect(isValid).toBe(true);

      const error = el.querySelector('.form-field__error');
      expect(error).not.toBeInTheDocument();
    });

    it('should set error programmatically', () => {
      const el = renderCheckboxGroup();

      el.setError('Custom error message');

      let error = el.querySelector('.form-field__error');
      expect(error).toBeInTheDocument();
      expect(error).toHaveTextContent('Custom error message');

      el.setError('');

      error = el.querySelector('.form-field__error');
      expect(error).not.toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('should setup component when added to DOM', () => {
      const el = document.createElement('form-checkbox-group');
      el.setAttribute('label', 'Dynamic Group');
      el.setAttribute('options', 'a:A,b:B');
      el.setAttribute('values', 'a');

      container.appendChild(el);

      expect(el).toHaveClass('form-field');
      expect(el).toHaveClass('form-field--checkbox-group');

      const legend = el.querySelector('.form-field__label');
      expect(legend).toHaveTextContent('Dynamic Group');

      const checkboxes = el.querySelectorAll('form-checkbox');
      expect(checkboxes).toHaveLength(2);
      expect(checkboxes[0]).toHaveAttribute('checked');
    });

    it('should clean up event listeners on disconnectedCallback', () => {
      const el = renderCheckboxGroup('options="a:A,b:B"');
      const detachSpy = vi.spyOn(el as any, 'detachEvents');

      el.remove();

      expect(detachSpy).toHaveBeenCalled();
    });

    it('should handle re-attachment to DOM', () => {
      const el = renderCheckboxGroup('options="a:A,b:B" values="a"');

      // Remove from DOM
      el.remove();

      // Re-attach
      container.appendChild(el);

      // Should still work
      const checkboxes = el.querySelectorAll('form-checkbox');
      expect(checkboxes).toHaveLength(2);

      const values = el.getValues();
      expect(values).toEqual(['a']);
    });
  });

  describe('Options Parsing', () => {
    it('should parse options with colon separator', () => {
      const el = renderCheckboxGroup('options="val1:Label 1,val2:Label 2"');

      const checkboxes = el.querySelectorAll('form-checkbox');

      expect(checkboxes[0]).toHaveAttribute('value', 'val1');
      expect(checkboxes[0]).toHaveAttribute('label', 'Label 1');

      expect(checkboxes[1]).toHaveAttribute('value', 'val2');
      expect(checkboxes[1]).toHaveAttribute('label', 'Label 2');
    });

    it('should use value as label when no colon', () => {
      const el = renderCheckboxGroup('options="Option1,Option2"');

      const checkboxes = el.querySelectorAll('form-checkbox');

      expect(checkboxes[0]).toHaveAttribute('value', 'Option1');
      expect(checkboxes[0]).toHaveAttribute('label', 'Option1');

      expect(checkboxes[1]).toHaveAttribute('value', 'Option2');
      expect(checkboxes[1]).toHaveAttribute('label', 'Option2');
    });

    it('should handle empty options', () => {
      const el = renderCheckboxGroup('options=""');

      const checkboxes = el.querySelectorAll('form-checkbox');
      expect(checkboxes).toHaveLength(0);
    });

    it('should trim whitespace from options', () => {
      const el = renderCheckboxGroup('options=" val1 : Label 1 , val2 : Label 2 "');

      const checkboxes = el.querySelectorAll('form-checkbox');

      expect(checkboxes[0]).toHaveAttribute('value', 'val1');
      expect(checkboxes[0]).toHaveAttribute('label', 'Label 1');

      expect(checkboxes[1]).toHaveAttribute('value', 'val2');
      expect(checkboxes[1]).toHaveAttribute('label', 'Label 2');
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      renderCheckboxGroup('label="Accessible group" options="a:A,b:B"');
      const results = await a11y(container);
      expect(results).toHaveNoViolations();
    });

    it('should use fieldset/legend for labeled groups', () => {
      const el = renderCheckboxGroup('label="Group label"');

      const fieldset = el.querySelector('fieldset');
      expect(fieldset).toBeInTheDocument();

      const legend = el.querySelector('legend');
      expect(legend).toBeInTheDocument();
      expect(legend).toHaveTextContent('Group label');
    });

    it('should have proper ARIA attributes', () => {
      const el = renderCheckboxGroup('label="Required group" required');

      const fieldset = el.querySelector('fieldset');
      expect(fieldset).toHaveAttribute('aria-required', 'true');
    });

    it('should have error with alert role', () => {
      const el = renderCheckboxGroup('error="Error message"');

      const error = el.querySelector('.form-field__error');
      expect(error).toHaveAttribute('role', 'alert');
    });

    it('should use role="group" for unlabeled groups', () => {
      const el = renderCheckboxGroup('options="a:A,b:B"');

      const groupContainer = el.querySelector('.form-checkbox-group');
      expect(groupContainer).toHaveAttribute('role', 'group');
    });

    it('should link error via aria-describedby and set aria-invalid', () => {
      const el = renderCheckboxGroup('label="Pick" options="x:X" error="Required"');

      const group = el.querySelector('.form-checkbox-group');
      const err = el.querySelector('.form-field__error');

      expect(group).toHaveAttribute('aria-invalid', 'true');
      expect(err).toHaveAttribute('id');

      const describedBy = group?.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      if (describedBy && err) {
        expect(describedBy.split(' ')).toContain(err.id);
      }
    });

    it('should link helper via aria-describedby when no error', () => {
      const el = renderCheckboxGroup('label="Pick" options="x:X" helper="Tip here"');

      const group = el.querySelector('.form-checkbox-group');
      const help = el.querySelector('.form-field__helper');

      expect(group).not.toHaveAttribute('aria-invalid');
      expect(help).toHaveAttribute('id');

      const describedBy = group?.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      if (describedBy && help) {
        expect(describedBy.split(' ')).toContain(help.id);
      }
    });
  });

  describe('Mobile-first considerations', () => {
    it('should support flexible layout', () => {
      const el = renderCheckboxGroup('options="a:A,b:B"');

      const optionsContainer = el.querySelector('.form-checkbox-group__options');
      expect(optionsContainer).toBeInTheDocument();

      // Should stack vertically by default (mobile-first)
      expect(optionsContainer).not.toHaveClass('form-checkbox-group__options--inline');
    });

    it('should support inline layout for larger screens', () => {
      const el = renderCheckboxGroup('options="a:A,b:B" inline');

      const optionsContainer = el.querySelector('.form-checkbox-group__options');
      expect(optionsContainer).toHaveClass('form-checkbox-group__options--inline');
    });
  });

  describe('Edge Cases', () => {
    it('should handle no options attribute', () => {
      const el = renderCheckboxGroup();

      const checkboxes = el.querySelectorAll('form-checkbox');
      expect(checkboxes).toHaveLength(0);

      const values = el.getValues();
      expect(values).toEqual([]);
    });

    it('should handle malformed options', () => {
      const el = renderCheckboxGroup('options="a:A:Extra,b:,:::"');

      const checkboxes = el.querySelectorAll('form-checkbox');

      // Should handle various edge cases gracefully
      expect(checkboxes[0]).toHaveAttribute('value', 'a');
      expect(checkboxes[0]).toHaveAttribute('label', 'A:Extra'); // Takes everything after first colon
    });

    it('should handle setting values for non-existent options', () => {
      const el = renderCheckboxGroup('options="a:A,b:B"');

      el.setValues(['a', 'x', 'y', 'z']);

      const values = el.getValues();
      expect(values).toEqual(['a']); // Only 'a' exists
    });

    it('should handle rapid attribute changes', () => {
      const el = renderCheckboxGroup();

      // Rapidly change attributes
      el.setAttribute('options', 'a:A');
      el.setAttribute('options', 'b:B');
      el.setAttribute('options', 'c:C');
      el.setAttribute('values', 'c');
      el.setAttribute('error', 'Error');
      el.removeAttribute('error');
      el.setAttribute('helper', 'Help');

      // Final state should be consistent
      const checkboxes = el.querySelectorAll('form-checkbox');
      expect(checkboxes).toHaveLength(1);
      expect(checkboxes[0]).toHaveAttribute('value', 'c');
      expect(checkboxes[0]).toHaveAttribute('checked');

      const helper = el.querySelector('.form-field__helper');
      expect(helper).toHaveTextContent('Help');
    });
  });

  describe('Name and Disabled Attributes', () => {
    it('should update child checkbox names when group name changes', () => {
      const el = renderCheckboxGroup('name="colors" options="r:Red,g:Green,b:Blue" values="g"');

      el.setAttribute('name', 'flavors');

      const boxes = el.querySelectorAll('form-checkbox');
      boxes.forEach(cb => {
        expect(cb).toHaveAttribute('name', 'flavors[]');
      });
    });

    it('should disable all children when group is disabled', () => {
      const el = renderCheckboxGroup('options="a:A,b:B"');

      el.setAttribute('disabled', '');

      expect(el).toHaveClass('form-field--disabled');
      el.querySelectorAll('form-checkbox').forEach(cb => {
        expect(cb).toHaveAttribute('disabled');
      });
    });

    it('should enable all children when group disabled is removed', () => {
      const el = renderCheckboxGroup('options="a:A,b:B" disabled');

      el.removeAttribute('disabled');

      expect(el).not.toHaveClass('form-field--disabled');
      el.querySelectorAll('form-checkbox').forEach(cb => {
        expect(cb).not.toHaveAttribute('disabled');
      });
    });

    it('should inherit disabled state when adding new options', () => {
      const el = renderCheckboxGroup('disabled');

      el.setAttribute('options', 'x:X,y:Y');

      el.querySelectorAll('form-checkbox').forEach(cb => {
        expect(cb).toHaveAttribute('disabled');
      });
    });
  });
});