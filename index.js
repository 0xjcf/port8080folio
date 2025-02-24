const menu = document.querySelector(".menu");
const close = document.querySelector(".close");
const navlist = document.querySelector(".navlist");
const body = document.querySelector("body");
const cta = document.querySelector(".cta");
const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

menu.addEventListener("click", () => {
  navlist.classList.add("navlist--visible");
  menu.classList.add("menu--hide");
  close.classList.add("close--visible");
  body.classList.add("body--no-scroll");
  body.style.paddingRight = `${scrollBarWidth}px`;
});

close.addEventListener("click", () => {
  navlist.classList.remove("navlist--visible");
  menu.classList.remove("menu--hide");
  close.classList.remove("close--visible");
  body.classList.remove("body--no-scroll");
  body.style.paddingRight = "0px";
});

// Intersection Observer for CTA animation
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      // When CTA is 75% out of view, activate the style
      if (!entry.isIntersecting) {
        entry.target.classList.add("scroll-active");
      } else {
        // Only remove if it's fully visible again
        if (entry.intersectionRatio > 0.75) {
          entry.target.classList.remove("scroll-active");
        }
      }
    });
  },
  {
    threshold: [0, 0.75], // Track when element is hidden (0) and mostly visible (0.75)
    rootMargin: "-25% 0px" // Trigger slightly before the element leaves viewport
  }
);

// Observe the CTA element itself
observer.observe(cta);
