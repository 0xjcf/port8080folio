# Jose Flores - Technical Advisor Landing Page

A clean, performant landing page built with HTML and CSS only (minimal JavaScript for mobile sticky CTA).

## Quick Start

```bash
# Development server (Python)
npm run dev

# Alternative server (Node)
npm run serve
```

Then open <http://localhost:8080>.

## Project Structure

```text
src/
├── index.html          # Main landing page
├── gibli-pfp.png      # Profile image
└── styles/            # CSS modules
    ├── 00-unified-theme.css
    ├── 01-reset.css
    ├── 02-tokens.css
    ├── 03-layout.css
    ├── 04-typography.css
    ├── 05-components.css
    ├── 06-utilities.css
    ├── 07-dark-theme.css
    ├── 08-hero.css
    ├── 09-about.css
    ├── 10-services.css
    ├── 11-contact.css
    ├── 12-contact-forms.css
    ├── 13-footer.css
    ├── 14-sticky-cta.css
    └── main.css       # Import aggregator
```

## Design Principles

- **HTML + CSS First**: Minimal JavaScript (only for mobile sticky CTA)
- **Performance**: Optimized for Core Web Vitals
- **Accessibility**: WCAG 2.1 AA compliant
- **Mobile First**: Responsive design with mobile-optimized interactions
- **Dark Theme**: Aggressive black/red/orange premium aesthetic

## Development

### Worker Development

```bash
# Start Wrangler dev server for forms
npm run dev:worker

# To disable Wrangler metrics collection, set environment variable:
WRANGLER_SEND_METRICS=false npm run dev:worker

# Or create a .env file (see .env.example) with:
# WRANGLER_SEND_METRICS=false
```

### Available Scripts

- `npm run dev` - Static file server for frontend
- `npm run dev:worker` - Wrangler dev server for form handling
- `npm run deploy:worker` - Deploy worker to Cloudflare

## Documentation

- `css-audit.md` - Comprehensive CSS audit and recommendations
- `docs/performance-optimization-plan.md` - Performance optimization strategy

## Deployment

This is a static site - simply serve the `src/` directory.

## License

MIT
