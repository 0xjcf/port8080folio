// Utility functions
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Only track events if analytics are enabled
function trackEvent(category, action, label, value) {
  if (window.gtag && localStorage.getItem('analytics_consent') === 'accepted') {
    const eventParams = {
      'event_category': category,
      'event_label': label,
      'non_interaction': category === 'performance' || category === 'error' || category === 'web_vitals'
    };
    
    if (value !== undefined) {
      eventParams.value = value;
    }
    
    gtag('event', action, eventParams);
  }
}

// Enhanced performance tracking
window.addEventListener('load', () => {
  setTimeout(() => {
    if (window.performance) {
      const timing = performance.getEntriesByType('navigation')[0];
      if (timing) {
        // Track more detailed performance metrics
        const metrics = {
          'Page Load Time': Math.round(timing.duration),
          'DOM Content Loaded': Math.round(timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart),
          'First Byte': Math.round(timing.responseStart - timing.requestStart),
          'DNS Lookup': Math.round(timing.domainLookupEnd - timing.domainLookupStart),
          'TCP Connection': Math.round(timing.connectEnd - timing.connectStart)
        };
        
        // Log metrics for debugging
        console.debug('Performance metrics:', metrics);
        
        // Track in analytics if enabled
        Object.entries(metrics).forEach(([label, value]) => {
          trackEvent('performance', 'timing', label, value);
        });
      }
    }
    
    // Track Core Web Vitals if the library is loaded
    if (typeof webVitals !== 'undefined') {
      webVitals.getCLS(metric => {
        trackEvent('web_vitals', 'cls', 'Cumulative Layout Shift', Math.round(metric.value * 1000));
      });
      
      webVitals.getFID(metric => {
        trackEvent('web_vitals', 'fid', 'First Input Delay', Math.round(metric.value));
      });
      
      webVitals.getLCP(metric => {
        trackEvent('web_vitals', 'lcp', 'Largest Contentful Paint', Math.round(metric.value));
      });
      
      webVitals.getFCP(metric => {
        trackEvent('web_vitals', 'fcp', 'First Contentful Paint', Math.round(metric.value));
      });
      
      webVitals.getTTFB(metric => {
        trackEvent('web_vitals', 'ttfb', 'Time to First Byte', Math.round(metric.value));
      });
    }
  }, 0);
});

// Error tracking with improved error details
window.addEventListener('error', (event) => {
  const errorDetails = {
    message: event.message,
    source: event.filename,
    line: event.lineno,
    column: event.colno,
    stack: event.error ? event.error.stack : 'No stack trace available'
  };
  
  trackEvent('error', 'exception', `${event.message} at ${event.filename}:${event.lineno}`);
  
  // Log detailed error info to console in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.error('Tracked error:', errorDetails);
  }
  
  return false; // Let the error propagate
});

// Track scroll depth with improved calculation
let lastScrollDepth = 0;
window.addEventListener('scroll', debounce(() => {
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  
  // Calculate scroll percentage more accurately
  const scrollPercent = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);
  
  // Track at 25%, 50%, 75%, and 100% scroll depths
  if (scrollPercent > lastScrollDepth && [25, 50, 75, 100].includes(scrollPercent)) {
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
  // Use beacon transport for exit links to ensure the event is sent
  trackEvent('external_link', 'click', link.href);
  
  // Don't delay navigation for external links
  // The event will be sent via beacon API in modern browsers
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
