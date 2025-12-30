import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const site = process.env.SITE_URL || (process.env.NODE_ENV === 'production'
  ? 'https://0xjcf.com'
  : 'https://staging.0xjcf.com');

export default defineConfig({
  output: 'static',
  build: { format: 'file' },
  trailingSlash: 'ignore',
  site,
  integrations: [sitemap()],
  vite: {
    server: {
      proxy: {
        '/api': 'http://localhost:8787'
      }
    }
  }
});
