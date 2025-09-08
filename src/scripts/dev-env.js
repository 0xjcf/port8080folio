// Dev-only helper: if running on localhost and form endpoints contain
// template placeholders, set them to local worker defaults so forms work
// without HTML preprocessing.
(() => {
  const isLocal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  if (!isLocal) return;

  const contactPath = '/api/contact';
  const newsletterPath = '/api/newsletter';
  const base = 'http://127.0.0.1:8787';

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('form.pe-form').forEach((form) => {
      const current = form.getAttribute('data-endpoint') || '';
      const needs = !current || current.includes('{{');
      if (!needs) return;

      // Heuristic: contact form has a message textarea
      const isContact = !!form.querySelector('#message, textarea[name="message"]');
      const path = isContact ? contactPath : newsletterPath;
      form.setAttribute('data-endpoint', base + path);
    });
  });
})();

