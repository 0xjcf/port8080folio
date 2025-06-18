# I Rebuilt My Portfolio with Vanilla Web Components (And Only Cried Once) 🎯

*The journey from "I'll use React" to "Actually, let me try vanilla JS" and why it was worth it.*

## The Setup 🎬

Picture this: Me, staring at my outdated portfolio that screamed "corporate developer" while my blog was out there being all casual and friendly. The disconnect was real.

My first instinct? "Let's throw React at it!" But then I remembered something...

## The "Oh No" Moment 😅

I'd just spent weeks reducing bundle sizes by 61% on another project. Was I really about to add a 40KB+ framework to display what's essentially static content with some interactive bits?

That's when I thought: "What if I just... used web components?"

## The Journey: Vanilla Web Components in 2024 🛠️

### Step 1: Creating My First Component

```javascript
class HeroSection extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        /* Scoped styles! No CSS conflicts! */
        h1 { color: var(--heading-color, #FFFFFF); }
      </style>
      <h1>Hey there! 👋 I'm José</h1>
    `;
  }
}

customElements.define('hero-section', HeroSection);
```

That's it. No build step. No webpack config. Just... JavaScript.

### Step 2: The CORS Surprise

```
Access to script at 'file:///components/hero-section.js' 
from origin 'null' has been blocked by CORS policy
```

Ah yes, the classic "opening index.html directly" mistake. Lesson learned: Always use a local server!

```bash
python3 -m http.server 8080
```

### Step 3: Making Components Talk

Here's where it got interesting. Without a framework, how do you handle component communication?

```javascript
// Custom events to the rescue!
this.dispatchEvent(new CustomEvent('stat-clicked', {
  detail: { stat: 'bundle-size' },
  bubbles: true,
  composed: true
}));
```

### Step 4: The Loading State Challenge

Remember those loading states I wanted? Here's how simple it was:

```javascript
class LoadingState extends HTMLElement {
  constructor() {
    super();
    this.messages = [
      "Brewing some code magic... ☕",
      "Optimizing those bundles... 📦",
      "Making state machines behave... 🤖"
    ];
  }
  // Rotate messages every 3 seconds
}
```

## The Results 🏆

### What Worked Great

1. **Zero Dependencies** - The entire portfolio is vanilla JS. No npm install, no node_modules black hole.

2. **Tiny Bundle** - Each component is its own module, loaded only when needed.

3. **True Encapsulation** - Shadow DOM means my component styles never leak out.

4. **Developer Experience** - Hot reload just works. Change a component, save, refresh. Done.

### What Was Tricky

1. **No Virtual DOM** - Had to think about efficient DOM updates (but honestly, it made me write better code).

2. **Manual State Management** - No Redux, no Context. Just good ol' custom events and attributes.

3. **Template Literals** - Miss JSX? Me too. But template literals aren't that bad once you get used to them.

## Real Talk: Should You Do This? 💭

**Use vanilla web components when:**
- Building mostly static sites with some interactivity
- You want zero dependencies
- SEO and performance are critical
- You enjoy understanding how things actually work

**Maybe stick with a framework when:**
- Building complex SPAs with lots of state
- You need a rich ecosystem of components
- Your team already knows React/Vue/etc
- Time to market is more important than bundle size

## The Plot Twist 🎉

Remember my library [ignite-element](https://github.com/0xjcf/ignite-element)? It was built to make web components work with state management libraries. But for this portfolio, I didn't even need it!

Sometimes the best tool is no tool at all.

## Code Snippets That Might Help You

### 1. ES Module Imports Without Build Tools
```javascript
// In your HTML
<script type="module">
  import './components/hero-section.js';
  import './components/project-card.js';
</script>
```

### 2. CSS Custom Properties for Theming
```javascript
// In your component
:host {
  color: var(--text-color, #F5F5F5);
  background: var(--bg-color, #080808);
}
```

### 3. Lazy Loading Components
```javascript
// Only load when needed
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        import('./components/heavy-component.js');
      }
    });
  });
}
```

## Easter Eggs Because Why Not? 🎮

Added a Konami code easter egg because every portfolio needs one:

```javascript
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 
                    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
```

Try it on my portfolio. You're welcome. 😉

## The Bottom Line 🎯

Building with vanilla web components felt like coding with training wheels off. It's not always the right choice, but when it is, it's *really* satisfying.

The best part? My portfolio now loads instantly, works everywhere, and actually sounds like me instead of Corporate José™.

Sometimes the old ways are the best ways. And sometimes you just need to try something different to remember why frameworks exist in the first place.

---

*Want to see the code? Check out the [portfolio repo](https://github.com/0xjcf/port8080folio) or [view it live](https://0xjcf.github.io/port8080folio/).*

*Have you tried building with vanilla web components? Hit me up on [Twitter](https://twitter.com/0xjcf) – I'd love to hear about your experience!*

## Resources That Helped 📚

- [MDN Web Components Guide](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [Custom Elements Everywhere](https://custom-elements-everywhere.com/)
- [Web Components Community](https://www.webcomponents.org/)
- My own sanity (barely survived)

*P.S. - Yes, I did try to use my own library halfway through. No, I didn't need it. Yes, that was a humbling moment. 😅*