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

// Add scroll-triggered animation for CTA
let isAnimating = false;
const triggerAnimation = (shouldActivate) => {
  if (shouldActivate && !cta.classList.contains("scroll-active")) {
    cta.classList.add("scroll-active");
  } else if (!shouldActivate && cta.classList.contains("scroll-active")) {
    cta.classList.remove("scroll-active");
  }
};

// Debounce function to limit scroll event firing
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Add scroll event listener with debouncing
window.addEventListener("scroll", debounce(() => {
  const scrollPosition = window.scrollY;
  const windowHeight = window.innerHeight;
  
  // Activate when scrolled down 25%, deactivate when scrolled back up
  triggerAnimation(scrollPosition > windowHeight * 0.25);
}, 150)); // Debounce wait time in milliseconds
