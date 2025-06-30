# Local Development Guide

This site is configured to work with GitHub Pages at `/port8080folio/`. To properly test the site locally with the same base path, use one of the following methods:

## Option 1: Python Server (Recommended)

```bash
# Run the Python server
python3 serve-local.py

# Or using npm
npm run serve
```

Then visit: http://localhost:8080/port8080folio/

## Option 2: Node.js Server

```bash
# Run the Node.js server
node serve-local.js

# Or using npm
npm run serve:node
```

Then visit: http://localhost:8080/port8080folio/

## Option 3: Live Server (with auto-reload)

```bash
# Using npx (no installation required)
npm run serve:live
```

Then visit: http://localhost:8080/port8080folio/

## How it works

All these servers:
- Serve your site at `/port8080folio/` to match GitHub Pages
- Automatically redirect `/` to `/port8080folio/`
- Handle all the routing properly so navigation works correctly
- Add CORS headers for local development

## Troubleshooting

If port 8080 is already in use, you can modify the PORT variable in either `serve-local.py` or `serve-local.js` to use a different port.

## Why is this needed?

Since your site uses absolute paths like `/port8080folio/` for GitHub Pages compatibility, a regular static server won't work properly. These custom servers handle the base path routing so your site works the same locally as it does on GitHub Pages. 