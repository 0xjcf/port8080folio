const menu = document.querySelector(".menu");
const close = document.querySelector(".close");
const navlist = document.querySelector(".navlist");
const body = document.querySelector("body");
const cta = document.querySelector(".cta");
const name = document.querySelector(".name");
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

// Intersection Observer for CTA animation based on name visibility
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      // When name is not visible, activate CTA style
      if (!entry.isIntersecting) {
        cta.classList.add("scroll-active");
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
