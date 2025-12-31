/* Lightweight analytics wiring
 * - Works with GA4 (gtag), Plausible, or PostHog if present
 * - Tracks CTA clicks, segment toggles, form submit attempts
 * - Attributes conversions on thank-you pages using sessionStorage
 */
(() => {
  let DEBUG = false;
  try { DEBUG = localStorage.getItem('analytics-debug') === '1'; } catch (_) { /* localStorage may not be available */ }

  // biome-ignore lint/suspicious/noConsole: <debugging>
  function log(...args) { if (DEBUG && typeof console !== 'undefined') console.log('[analytics]', ...args); }

  function hasGtag() { return typeof window !== 'undefined' && typeof window.gtag === 'function'; }
  function hasPlausible() { return typeof window !== 'undefined' && typeof window.plausible === 'function'; }
  function hasPosthog() { return typeof window !== 'undefined' && window.posthog && typeof window.posthog.capture === 'function'; }

  function track(name, props) {
    props = props || {};
    log(name, props);
    try {
      if (hasGtag()) {
        // GA4 accepts custom params directly
        window.gtag('event', name, Object.assign({
          event_category: 'engagement',
          transport_type: 'beacon'
        }, props));
      }
    } catch (_) { /* gtag may fail */ }
    try {
      if (hasPlausible()) {
        // Convert snake_case to Title Case for Plausible event names
        const title = name.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
        window.plausible(title, { props: props });
      }
    } catch (_) { /* plausible may fail */ }
    try {
      if (hasPosthog()) {
        window.posthog.capture(name, props);
      }
    } catch (_) { /* posthog may fail */ }
  }

  function slugify(text) {
    return (text || '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 80);
  }

  function getSectionId(el) {
    const sec = el?.closest?.('section[id]');
    return sec?.id || 'page';
  }

  function getCardInfo(el) {
    const art = el?.closest?.('article.service-card-std');
    if (!art) return {};
    return {
      card: art.getAttribute('data-card') || '',
      popular: art.classList.contains('is-popular') ? 1 : 0
    };
  }

  function getSegment() {
    const seg = document.body?.getAttribute('data-segment');
    return seg || 'sb';
  }

  function saveLastInteraction(meta) {
    try { sessionStorage.setItem('lastCTA', JSON.stringify(Object.assign({ t: Date.now() }, meta))); } catch (_) { /* sessionStorage may not be available */ }
  }

  // Generic click handler for CTAs
  document.addEventListener('click', (e) => {
    const target = e.target instanceof Element ? e.target.closest('a,button') : null;
    if (!target) return;

    const isCTA = target.classList.contains('btn-cta')
      || target.classList.contains('button--primary')
      || target.classList.contains('button--sticky')
      || target.closest?.('.cta-row')
      || (target.tagName === 'A' && /^#contact/.test(target.getAttribute('href') || ''));
    if (!isCTA) return;

    const href = target.getAttribute('href') || '';
    const text = (target.textContent || '').replace(/\s+/g, ' ').trim();
    const id = target.getAttribute('data-cta') || slugify(text);
    const section = getSectionId(target);
    const seg = getSegment();
    const cardInfo = getCardInfo(target);
    let isOutbound = 0;
    try {
      const url = new URL(href, location.href);
      isOutbound = url.origin !== location.origin ? 1 : 0;
    } catch (_) {
      isOutbound = /^mailto:|^tel:/i.test(href) ? 1 : 0;
    }
    const payload = Object.assign({
      id: id,
      text: text,
      href: href,
      section: section,
      segment: seg,
      outbound: isOutbound
    }, cardInfo);
    track('cta_click', payload);
    saveLastInteraction(payload);
  }, true);

  // Track segment toggle interactions
  document.addEventListener('click', (e) => {
    const pill = e.target instanceof Element ? e.target.closest('.seg-toggle .pill') : null;
    if (!pill) return;
    const seg = pill.getAttribute('data-seg') || '';
    const scope = pill.closest('#services') ? 'services' : (pill.closest('#about') ? 'about' : 'global');
    track('segment_toggle', { to: seg, scope: scope });
  }, true);

  // Track form submit attempts
  document.addEventListener('submit', (e) => {
    const form = e.target instanceof HTMLFormElement ? e.target : null;
    if (!form || !form.classList.contains('pe-form')) return;
    const section = getSectionId(form);
    const formId = form.getAttribute('id') || form.getAttribute('name') || 'contact';
    track('form_submit_attempt', { form_id: formId, section: section });
    saveLastInteraction({ id: 'form_submit', section: section, form_id: formId });
  }, true);

  // --- NEW: Form conversion tracking for in-page success (no redirect) ---
  // Works two ways:
  // 1) Listens for optional custom events from your form script: 'pe:success' / 'pe:error'
  // 2) Fallback MutationObserver watches .form-success-message become visible
  function isVisible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
  }

  const activeSuccessObservers = new Set();
  const activeRemovalObservers = new Set();
  let unloadCleanupAttached = false;
  const detachAllSuccessObservers = () => {
    activeSuccessObservers.forEach((observer) => observer.disconnect());
    activeRemovalObservers.forEach((observer) => observer.disconnect());
    activeSuccessObservers.clear();
    activeRemovalObservers.clear();
    document.querySelectorAll('.form-success-message').forEach((el) => {
      if (el.__mo) {
        delete el.__mo;
      }
      if (el.__removalMo) {
        delete el.__removalMo;
      }
    });
  };
  const ensureUnloadCleanup = () => {
    if (unloadCleanupAttached) return;
    const handler = () => {
      detachAllSuccessObservers();
    };
    window.addEventListener('pagehide', handler);
    window.addEventListener('beforeunload', handler);
    unloadCleanupAttached = true;
  };

  // 1) Custom event hooks (useful if your form script can dispatch them)
  document.addEventListener('pe:success', (e) => {
    const form = e.detail?.form ?? document.querySelector('.pe-form');
    const section = getSectionId(form || document.body);
    const formId = (form && (form.id || form.getAttribute('name'))) || 'contact';
    track('form_submit_success', { form_id: formId, section: section });
  });
  document.addEventListener('pe:error', (e) => {
    const form = e.detail?.form ?? document.querySelector('.pe-form');
    const section = getSectionId(form || document.body);
    const formId = (form && (form.id || form.getAttribute('name'))) || 'contact';
    track('form_submit_error', { form_id: formId, section: section });
  });

  // 2) Fallback: detect the success message appearing in the DOM
  function watchFormSuccess() {
    const forms = document.querySelectorAll('form.pe-form');
    forms.forEach((form) => {
      const success = form.querySelector('.form-success-message');
      if (!success || success.__mo) return;
      const section = getSectionId(form);
      const formId = form.getAttribute('id') || form.getAttribute('name') || 'contact';
      // Initial check (in case success is already shown)
      if (isVisible(success)) {
        track('form_submit_success', { form_id: formId, section: section });
        success.__alreadyTracked = true;
        return;
      }
      let removalObserver = null;
      const cleanup = () => {
        const observerRef = success.__mo;
        if (observerRef) {
          observerRef.disconnect();
          activeSuccessObservers.delete(observerRef);
          if (success.__mo === observerRef) {
            delete success.__mo;
          }
        }

        const removalRef = success.__removalMo || removalObserver;
        if (removalRef) {
          removalRef.disconnect();
          activeRemovalObservers.delete(removalRef);
          if (success.__removalMo === removalRef) {
            delete success.__removalMo;
          }
        }

        removalObserver = null;
      };
      const mo = new MutationObserver(() => {
        if (!success.isConnected || !form.contains(success)) {
          cleanup();
          return;
        }
        if (!success.__alreadyTracked && isVisible(success)) {
          success.__alreadyTracked = true;
          track('form_submit_success', { form_id: formId, section: section });
          cleanup();
        }
      });
      mo.observe(success, { attributes: true, attributeFilter: ['style', 'class'] });
      success.__mo = mo;
      activeSuccessObservers.add(mo);

      if (!success.__removalMo) {
        removalObserver = new MutationObserver(() => {
          if (!form.contains(success)) {
            cleanup();
          }
        });
        removalObserver.observe(form, { childList: true, subtree: true });
        success.__removalMo = removalObserver;
        activeRemovalObservers.add(removalObserver);
      }

      ensureUnloadCleanup();
    });
  }
  window.addEventListener('load', watchFormSuccess, { once: true });

  // Attribute conversion to last interaction on thank-you pages
  (() => {
    const path = location.pathname;
    let last = {};
    try { last = JSON.parse(sessionStorage.getItem('lastCTA') || '{}'); } catch (_) { /* sessionStorage may not be available */ }
    if (/contact-thanks\.html$/.test(path)) {
      track('conversion_contact', last);
    } else if (/newsletter-thanks\.html$/.test(path)) {
      track('conversion_newsletter', last);
    }
  })();

  // --- NEW: Calendly 'event scheduled' tracking (when using embedded widget) ---
  // If you switch from a plain link to an embedded Calendly widget, this will record the success.
  // Docs: https://help.calendly.com/hc/en-us/articles/360020458293
  window.addEventListener('message', (event) => {
    try {
      const origin = event.origin || '';
      const hostname = origin ? new URL(origin).hostname : '';
      const okOrigin = hostname === 'calendly.com' || hostname.endsWith('.calendly.com');
      const data = event.data || {};
      if (!okOrigin || !data.event) return;
      if (data.event === 'calendly.event_scheduled') {
        track('calendly_scheduled', {
          section: getSectionId(document.querySelector('#contact') || document.body)
        });
      }
    } catch (_) { /* ignore cross-origin issues */ }
  }, false);
})();

