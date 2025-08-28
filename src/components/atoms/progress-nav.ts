/**
 * Progress Bar Navigation Component
 * Atomic Design: Atom
 * 
 * Shows reading/scroll progress as a horizontal bar
 * Renders in light DOM for accessibility
 */
export class ProgressNav extends HTMLElement {
  private scrollHandler?: () => void;

  connectedCallback() {
    this.render();
    this.bindEvents();
  }

  disconnectedCallback() {
    this.unbindEvents();
  }

  render() {
    this.className = 'progress-nav';
    this.innerHTML = `
      <div class="progress-nav__bar" style="width: 0%"></div>
    `;
  }

  bindEvents() {
    this.scrollHandler = this.throttle(() => {
      this.updateProgress();
    }, 10);

    window.addEventListener('scroll', this.scrollHandler, { passive: true });

    // Initial update
    this.updateProgress();
  }

  unbindEvents() {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
  }

  updateProgress() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;

    const scrollableHeight = documentHeight - windowHeight;
    const scrollProgress = (scrollTop / scrollableHeight) * 100;

    const bar = this.querySelector('.progress-nav__bar') as HTMLElement;
    if (bar) {
      bar.style.width = `${Math.min(scrollProgress, 100)}%`;
    }
  }

  throttle(func: Function, delay: number): () => void {
    let timeoutId: number | undefined;
    let lastExecTime = 0;

    return function (this: any, ...args: any[]) {
      const currentTime = Date.now();

      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }
}

// Register component
customElements.define('progress-nav', ProgressNav);
