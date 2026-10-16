/* One-time entrances. Content remains visible when JavaScript is unavailable. */
(() => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches || !Element.prototype.animate) return;

  const targets = document.querySelectorAll([
    '.feature-story',
    '.journal-aside',
    '.page-intro',
    '.section__title',
    '.writing-article > header > h1',
    '.writing-article__summary',
    '.writing-article__cover',
    '.essay-row',
  ].join(','));
  const animations = new Map();
  let observer;
  let stopped = false;

  const reveal = (element, delay = 0) => {
    if (stopped || element.contains(document.activeElement)) return;
    const animation = element.animate([
      { opacity: 0.65, transform: 'translateY(6px)' },
      { opacity: 1, transform: 'none' },
    ], { duration: 420, delay, fill: 'backwards', easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
    animations.set(element, animation);
    const forget = () => animations.delete(element);
    animation.finished.then(forget, forget);
  };

  const stop = () => {
    stopped = true;
    observer?.disconnect();
    animations.forEach(animation => animation.cancel());
    animations.clear();
  };
  preference.addEventListener('change', event => { if (event.matches) stop(); });
  window.addEventListener('beforeprint', stop);
  window.addEventListener('pagehide', stop, { once: true });
  document.addEventListener('focusin', event => {
    animations.forEach((animation, element) => {
      if (element.contains(event.target)) animation.cancel();
    });
  });

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        reveal(entry.target);
      });
    }, { threshold: 0.08 });
  }

  let visibleIndex = 0;
  targets.forEach(element => {
    const bounds = element.getBoundingClientRect();
    if (bounds.bottom <= 0) return;
    if (bounds.top < window.innerHeight) {
      reveal(element, Math.min(visibleIndex++ * 40, 120));
    } else {
      observer?.observe(element);
    }
  });
})();
