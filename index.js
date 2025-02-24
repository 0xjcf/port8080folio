// Utility functions
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Only track events if analytics are enabled
function trackEvent(category, action, label) {
  if (window.gtag && localStorage.getItem('analytics_consent') === 'accepted') {
    gtag('event', action, {
      'event_category': category,
      'event_label': label
    });
  }
}

// Performance tracking
window.addEventListener('load', () => {
  setTimeout(() => {
    if (window.performance) {
      const timing = performance.getEntriesByType('navigation')[0];
      trackEvent('performance', 'timing_complete', 'Page Load Time', Math.round(timing.duration));
      
      // Track Core Web Vitals
      if ('web-vital' in window) {
        webVitals.getCLS(metric => trackEvent('web_vitals', 'cls', '', Math.round(metric.value * 1000)));
        webVitals.getFID(metric => trackEvent('web_vitals', 'fid', '', Math.round(metric.value)));
        webVitals.getLCP(metric => trackEvent('web_vitals', 'lcp', '', Math.round(metric.value)));
      }
    }
  }, 0);
});

// Error tracking
window.addEventListener('error', (event) => {
  trackEvent('error', 'exception', `${event.message} at ${event.filename}:${event.lineno}`);
});

// Track scroll depth
let lastScrollDepth = 0;
window.addEventListener('scroll', debounce(() => {
  const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
  if (scrollPercent > lastScrollDepth && scrollPercent % 25 === 0) {
    trackEvent('engagement', 'scroll_depth', `${scrollPercent}%`);
    lastScrollDepth = scrollPercent;
  }
}, 200));

// DOM Elements
const menu = document.querySelector(".menu");
const close = document.querySelector(".close");
const navlist = document.querySelector(".navlist");
const body = document.querySelector("body");
const cta = document.querySelector(".cta");
const name = document.querySelector(".name");
const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

// Track external link clicks with improved handling
const trackExternalLink = (event) => {
  const link = event.currentTarget;
  trackEvent('external_link', 'click', link.href);
};

// Add tracking to all external links
document.querySelectorAll('a[target="_blank"]').forEach(link => {
  link.addEventListener('click', trackExternalLink);
});

// Track CTA clicks with enhanced data
cta.addEventListener('click', () => {
  trackEvent('engagement', 'cta_click', 'Lets Connect CTA');
});

// Track form submissions with form data
const form = document.getElementById('mc-embedded-subscribe-form');
form.addEventListener('submit', () => {
  trackEvent('engagement', 'newsletter_signup', 'Newsletter Form');
});

// Mobile menu handling with tracking
menu.addEventListener("click", () => {
  navlist.classList.add("navlist--visible");
  menu.classList.add("menu--hide");
  close.classList.add("close--visible");
  body.classList.add("body--no-scroll");
  body.style.paddingRight = `${scrollBarWidth}px`;
  trackEvent('navigation', 'menu_open', 'Mobile Menu');
});

close.addEventListener("click", () => {
  navlist.classList.remove("navlist--visible");
  menu.classList.remove("menu--hide");
  close.classList.remove("close--visible");
  body.classList.remove("body--no-scroll");
  body.style.paddingRight = "0px";
  trackEvent('navigation', 'menu_close', 'Mobile Menu');
});

// Enhanced Intersection Observer for CTA animation
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        cta.classList.add("scroll-active");
        trackEvent('engagement', 'cta_visible', 'CTA Activated');
      } else {
        cta.classList.remove("scroll-active");
      }
    });
  },
  {
    threshold: 0.2,
    rootMargin: "0px"
  }
);

// Observe the name element
observer.observe(name);

// Track SPA-like navigation
window.addEventListener('popstate', () => {
  if (window.gtag) {
    gtag('config', 'G-5TR1LWNXXY', {
      page_path: window.location.pathname,
      anonymize_ip: true
    });
  }
});
