# port8080folio - José Flores Portfolio

A modern, performant portfolio website showcasing expertise in Frontend Architecture and XState state management, built with vanilla JavaScript and Web Components.

🌐 **Live Site**: [https://joseflores.io](https://joseflores.io)

## Overview

This portfolio demonstrates advanced frontend concepts through interactive demos and educational content about state machines and the actor model. Built without frameworks to showcase fundamental web development skills and modern browser capabilities.

### Key Features

- 🎭 **Interactive Coffee Shop Demo** - Live demonstration of the actor model using XState v5
- 🎨 **Custom Syntax Highlighter** - Hand-built code highlighting with multiple theme support
- ⚡ **Zero Build Tools** - Runs directly in browser using ES modules
- 🔧 **Web Components** - Modular architecture using native browser APIs
- 📊 **Performance Focused** - Optimized for Core Web Vitals
- ♿ **Accessible** - WCAG compliant with semantic HTML
- 📱 **Responsive** - Mobile-first design approach

## Technology Stack

- **Languages**: JavaScript (ES6+), HTML5, CSS3
- **Architecture**: Web Components with Shadow DOM
- **State Management**: XState v5 (loaded from CDN)
- **Styling**: CSS Custom Properties, CSS Grid, Flexbox
- **Analytics**: Google Analytics 4 (privacy-focused implementation)
- **Newsletter**: Mailchimp integration
- **SEO**: Structured data, sitemap, robots.txt

## Local Development

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (see options below)
- Git for version control

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/port8080folio.git
   cd port8080folio
   ```

2. **Start a local server**

   Option A - Python (if installed):
   ```bash
   # Python 3
   python -m http.server 8080

   # Python 2
   python -m SimpleHTTPServer 8080
   ```

   Option B - Node.js (if installed):
   ```bash
   # Install http-server globally
   npm install -g http-server

   # Start server
   http-server -p 8080
   ```

   Option C - VS Code Live Server:
   - Install the "Live Server" extension
   - Right-click on `index.html`
   - Select "Open with Live Server"

3. **Open in browser**
   ```
   http://localhost:8080
   ```

## Project Structure

```
port8080folio/
├── index.html              # Main entry point
├── index.js                # Core application logic
├── styles.css              # Global styles
├── components/             # Web Components
│   ├── actors/            # Coffee shop demo components
│   │   ├── barista/       # Barista actor implementation
│   │   ├── cashier/       # Cashier actor implementation
│   │   └── customer/      # Customer actor implementation
│   ├── state-machine-*    # Educational components
│   ├── syntax-highlighter-* # Code highlighting components
│   └── ...                # Other UI components
├── test-modules/          # Component tests
├── assets/               # Images and static files
└── test-*.html          # Component test pages
```

## Component Architecture

Each component is a self-contained Web Component with:
- Custom element definition
- Shadow DOM for style encapsulation
- ES module exports
- Event-driven communication

Example component structure:
```javascript
class ComponentName extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback() {
    this.render();
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>/* Scoped styles */</style>
      <div><!-- Component HTML --></div>
    `;
  }
}

customElements.define('component-name', ComponentName);
```

## Testing

The project uses browser-based testing through dedicated test HTML files:

```bash
# View all tests
ls test-*.html

# Run specific test suites
open test-syntax-highlighting.html
open test-modules/v2-test-basic.js
```

## Performance Considerations

- **Lazy Loading**: Components load on-demand
- **Code Splitting**: Modular architecture enables selective loading
- **Caching**: 15-minute cache for external resources
- **Optimized Assets**: Images served in modern formats
- **Minimal Dependencies**: No framework overhead

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- Mobile browsers with ES6 support

## Contributing

While this is a personal portfolio, suggestions and bug reports are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit changes (`git commit -am 'Add improvement'`)
4. Push to branch (`git push origin feature/improvement`)
5. Open a Pull Request

## License

© 2024 José Flores. All rights reserved.

## Contact

- **Email**: info@joseflores.io
- **LinkedIn**: [joseflores-io](https://www.linkedin.com/in/joseflores-io/)
- **GitHub**: [@josecflores](https://github.com/josecflores)

---

Built with ❤️ and state machines by José Flores