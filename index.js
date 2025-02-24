const menu = document.querySelector(".menu");
const close = document.querySelector(".close");
const navlist = document.querySelector(".navlist");
const body = document.querySelector("body");
const cta = document.querySelector(".cta");
const name = document.querySelector(".name");
const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

// Track external link clicks
const trackExternalLink = (event) => {
  const link = event.currentTarget;
  gtag('event', 'click', {
    'event_category': 'external_link',
    'event_label': link.href,
    'transport_type': 'beacon'
  });
};

// Add tracking to all external links
document.querySelectorAll('a[target="_blank"]').forEach(link => {
  link.addEventListener('click', trackExternalLink);
});

// Track CTA clicks
cta.addEventListener('click', () => {
  gtag('event', 'click', {
    'event_category': 'engagement',
    'event_label': 'Lets Connect CTA'
  });
});

// Track form submissions
const form = document.getElementById('mc-embedded-subscribe-form');
form.addEventListener('submit', () => {
  gtag('event', 'form_submit', {
    'event_category': 'engagement',
    'event_label': 'Newsletter Signup'
  });
});

menu.addEventListener("click", () => {
  navlist.classList.add("navlist--visible");
  menu.classList.add("menu--hide");
  close.classList.add("close--visible");
  body.classList.add("body--no-scroll");
  body.style.paddingRight = `${scrollBarWidth}px`;
  
  // Track menu open
  gtag('event', 'click', {
    'event_category': 'navigation',
    'event_label': 'Open Mobile Menu'
  });
});

close.addEventListener("click", () => {
  navlist.classList.remove("navlist--visible");
  menu.classList.remove("menu--hide");
  close.classList.remove("close--visible");
  body.classList.remove("body--no-scroll");
  body.style.paddingRight = "0px";
  
  // Track menu close
  gtag('event', 'click', {
    'event_category': 'navigation',
    'event_label': 'Close Mobile Menu'
  });
});

// Intersection Observer for CTA animation based on name visibility
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      // When name is not visible, activate CTA style
      if (!entry.isIntersecting) {
        cta.classList.add("scroll-active");
        // Track when CTA becomes active
        gtag('event', 'scroll', {
          'event_category': 'engagement',
          'event_label': 'CTA Activated'
        });
      } else {
        cta.classList.remove("scroll-active");
      }
    });
  },
  {
    threshold: 0.2, // Trigger when name is 20% visible
    rootMargin: "0px"
  }
);

// Observe the name element
observer.observe(name);
