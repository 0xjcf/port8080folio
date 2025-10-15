import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'happy-dom',
    coverage: {
      reporter: ['text', 'html'],
    },
  },
});
