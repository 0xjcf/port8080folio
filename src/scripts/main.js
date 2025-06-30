// Navbar component is imported in the module script block in HTML

// Utility functions
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Pre-fill email forms from URL parameters (useful for redirects from challenges page)
function handleEmailPreFill() {
  const urlParams = new URLSearchParams(window.location.search);
  const emailParam = urlParams.get('email');

  if (emailParam) {
    // Pre-fill all email inputs on the page
    const emailInputs = document.querySelectorAll('input[type="email"][name="EMAIL"]');
    emailInputs.forEach(input => {
      input.value = decodeURIComponent(emailParam);
    });

    // Clean up URL by removing the email parameter
    const cleanUrl = new URL(window.location);
    cleanUrl.searchParams.delete('email');
    history.replaceState({}, '', cleanUrl);

    // Focus on the newsletter signup section if it exists
    if (window.location.hash === '#newsletter-signup') {
      setTimeout(() => {
        const section = document.querySelector('#newsletter-signup');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }
}

// Run pre-fill check when DOM is ready
document.addEventListener('DOMContentLoaded', handleEmailPreFill);

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

        // Performance metrics collected for monitoring

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
if (cta) {
  cta.addEventListener('click', () => {
    trackEvent('engagement', 'cta_click', 'Lets Connect CTA');
  });
}

// Track form submissions with form data
const form = document.getElementById('mc-embedded-subscribe-form');
if (form) {
  form.addEventListener('submit', () => {
    trackEvent('engagement', 'newsletter_signup', 'Newsletter Form');
  });
}

// Mobile menu handling is now managed by the navbar component
// External link tracking for navbar component links is handled within the component

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
if (name) {
  observer.observe(name);
}

// Track SPA-like navigation
window.addEventListener('popstate', () => {
  if (window.gtag) {
    gtag('config', 'G-5TR1LWNXXY', {
      page_path: window.location.pathname,
      anonymize_ip: true
    });
  }
});

// Easter Eggs! 🎉
// Console message for fellow devs
console.log(
  '%c Hey there, fellow dev! 👋 Found any good bugs lately?',
  'color: #0D99FF; font-size: 16px; font-weight: bold; padding: 10px;'
);
console.log(
  '%c If you\'re reading this, you\'re probably the type who reads documentation too. I like you already! 😄',
  'color: #47B4FF; font-size: 14px; padding: 5px;'
);
console.log(
  '%c Want to see the code? Check out: https://github.com/0xjcf',
  'color: #F5F5F5; font-size: 12px; padding: 5px;'
);

// Konami Code Easter Egg
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
  if (e.key === konamiCode[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) {
      triggerKonamiEasterEgg();
      konamiIndex = 0;
    }
  } else {
    konamiIndex = 0;
  }
});

function triggerKonamiEasterEgg() {
  // Track the easter egg discovery
  trackEvent('engagement', 'easter_egg', 'konami_code');

  // Create confetti effect
  const confettiColors = ['#0D99FF', '#47B4FF', '#F5F5F5', '#FFD700'];
  const confettiCount = 100;

  for (let i = 0; i < confettiCount; i++) {
    createConfetti(confettiColors[Math.floor(Math.random() * confettiColors.length)]);
  }

  // Show achievement message
  const achievement = document.createElement('div');
  achievement.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(45deg, #0D99FF, #47B4FF);
    color: white;
    padding: 2rem 3rem;
    border-radius: 12px;
    font-size: 1.5rem;
    font-weight: bold;
    z-index: 10000;
    animation: achievementPop 0.5s ease-out;
    box-shadow: 0 10px 30px rgba(13, 153, 255, 0.4);
  `;
  achievement.innerHTML = '🎮 Achievement Unlocked: Konami Master! 🎉';
  document.body.appendChild(achievement);

  setTimeout(() => achievement.remove(), 3000);
}

function createConfetti(color) {
  const confetti = document.createElement('div');
  const startX = Math.random() * window.innerWidth;
  const endX = startX + (Math.random() - 0.5) * 200;
  const duration = 2000 + Math.random() * 1000;

  confetti.style.cssText = `
    position: fixed;
    width: 10px;
    height: 10px;
    background: ${color};
    left: ${startX}px;
    top: -20px;
    opacity: 1;
    transform: rotate(${Math.random() * 360}deg);
    pointer-events: none;
    z-index: 9999;
  `;

  document.body.appendChild(confetti);

  confetti.animate([
    {
      transform: `translate(0, 0) rotate(0deg)`,
      opacity: 1
    },
    {
      transform: `translate(${endX - startX}px, ${window.innerHeight + 20}px) rotate(${Math.random() * 720}deg)`,
      opacity: 0
    }
  ], {
    duration: duration,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  }).onfinish = () => confetti.remove();
}

// Add achievement animation to head
if (!document.getElementById('easter-egg-styles')) {
  const style = document.createElement('style');
  style.id = 'easter-egg-styles';
  style.textContent = `
    @keyframes achievementPop {
      0% {
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
      }
      50% {
        transform: translate(-50%, -50%) scale(1.1);
      }
      100% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
}
