import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    name: 'dom',
    environment: 'jsdom',
    globals: true,
    include: ['tests/components/**/*.{test,spec}.{ts,tsx,js,jsx}'],
    setupFiles: [path.resolve(__dirname, 'tests/setup-dom.ts')],
    environmentOptions: {
      jsdom: { url: 'http://localhost/', pretendToBeVisual: true },
    },
  },
});