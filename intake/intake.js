document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('intakeForm');
  const requiredFields = form.querySelectorAll('[required]');

  // Add aria-live region for form validation messages
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.classList.add('sr-only');
  form.appendChild(liveRegion);

  // Function to announce validation messages
  // TODO: This setTimeout should be replaced with XState delay pattern
  // See intake.ts for proper state machine implementation
  function announceMessage(message) {
    liveRegion.textContent = message;
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 3000);
  }

  // Function to validate email format
  function _validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Function to validate required fields
  function validateRequiredFields() {
    let isValid = true;
    const missingFields = [];

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        isValid = false;
        const label = field.labels[0]?.textContent.replace('*', '').trim();
        missingFields.push(label);
        field.setAttribute('aria-invalid', 'true');

        // Add error message for screen readers
        const errorMessage = document.createElement('span');
        errorMessage.classList.add('error-message');
        errorMessage.textContent = `${label} is required`;
        errorMessage.setAttribute('role', 'alert');
        field.parentNode.appendChild(errorMessage);
      } else {
        field.removeAttribute('aria-invalid');
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
          existingError.remove();
        }
      }
    });

    if (!isValid) {
      const message = `Please fill in the following required fields: ${missingFields.join(', ')}`;
      announceMessage(message);
      return false;
    }

    return true;
  }

  // Add focus styles for keyboard navigation
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-navigation');
    }
  });

  form.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
  });

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateRequiredFields()) {
      // Focus on the first invalid field
      const firstInvalidField = form.querySelector("[aria-invalid='true']");
      if (firstInvalidField) {
        firstInvalidField.focus();
      }
      return;
    }

    const formData = new FormData(form);
    const _data = Object.fromEntries(formData.entries());

    try {
      // For now, just log the form data
      // Form submission data processed

      // Show success message
      announceMessage(
        'Thank you for submitting the form! I will review your requirements and get back to you soon.'
      );

      // Reset form
      form.reset();

      // Focus on the first field after reset
      const firstField = form.querySelector('input, textarea, select');
      if (firstField) {
        firstField.focus();
      }
    } catch (_error) {
      announceMessage('There was an error submitting the form. Please try again later.');
    }
  });

  // Add real-time validation for required fields
  requiredFields.forEach((field) => {
    field.addEventListener('blur', () => {
      if (!field.value.trim()) {
        field.setAttribute('aria-invalid', 'true');
        const label = field.labels[0]?.textContent.replace('*', '').trim();
        announceMessage(`${label} is required`);
      } else {
        field.removeAttribute('aria-invalid');
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
          existingError.remove();
        }
      }
    });
  });

  // Add keyboard navigation support for form sections
  const sections = form.querySelectorAll('.section');
  sections.forEach((section, _index) => {
    const heading = section.querySelector('h2');
    if (heading) {
      heading.setAttribute('tabindex', '0');
      heading.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const firstField = section.querySelector('input, textarea, select');
          if (firstField) {
            firstField.focus();
          }
        }
      });
    }
  });
});
