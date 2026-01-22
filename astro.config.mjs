import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import githubDarkTheme from '@shikijs/themes/github-dark';
import githubLightTheme from '@shikijs/themes/github-light';

const site = process.env.SITE_URL || (process.env.NODE_ENV === 'production'
  ? 'https://0xjcf.com'
  : 'https://staging.0xjcf.com');

const parseInlineStyle = (style) => {
  if (!style) return {};
  return style
    .split(';')
    .map((rule) => rule.trim())
    .filter(Boolean)
    .reduce((acc, rule) => {
      const [prop, ...rest] = rule.split(':');
      if (!prop || rest.length === 0) return acc;
      acc[prop.trim()] = rest.join(':').trim();
      return acc;
    }, {});
};

const shikiThemeVarsTransformer = {
  name: 'shiki-theme-vars',
  pre(hast) {
    const style = typeof hast.properties?.style === 'string'
      ? hast.properties.style
      : '';
    const map = parseInlineStyle(style);
    const next = [];

    if (map['background-color']) {
      next.push(`--shiki-light-bg:${map['background-color']}`);
    }
    if (map['--shiki-dark-bg']) {
      next.push(`--shiki-dark-bg:${map['--shiki-dark-bg']}`);
    }
    if (map.color) {
      next.push(`--shiki-light:${map.color}`);
    }
    if (map['--shiki-dark']) {
      next.push(`--shiki-dark:${map['--shiki-dark']}`);
    }
    if (map['overflow-x']) {
      next.push(`overflow-x:${map['overflow-x']}`);
    }

    if (next.length) {
      hast.properties.style = next.join(';');
    } else {
      delete hast.properties.style;
    }
    return hast;
  },
  span(hast) {
    const style = typeof hast.properties?.style === 'string'
      ? hast.properties.style
      : '';
    if (!style) return hast;
    const map = parseInlineStyle(style);
    const next = [];

    if (map.color) {
      next.push(`--shiki-light:${map.color}`);
    }
    if (map['--shiki-dark']) {
      next.push(`--shiki-dark:${map['--shiki-dark']}`);
    }

    if (next.length) {
      hast.properties.style = next.join(';');
    } else {
      delete hast.properties.style;
    }
    return hast;
  }
};

export default defineConfig({
  output: 'static',
  build: { format: 'directory' },
  trailingSlash: 'always',
  site,
  integrations: [sitemap()],
  markdown: {
    syntaxHighlight: {
      type: 'shiki',
      excludeLangs: ['mermaid']
    },
    rehypePlugins: [],
    shikiConfig: {
      themes: {
        light: githubLightTheme,
        dark: githubDarkTheme
      },
      transformers: [shikiThemeVarsTransformer]
    }
  },
  vite: {
    server: {
      proxy: {
        '/api': 'http://localhost:8787'
      }
    }
  }
});
