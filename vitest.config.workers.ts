// ✨ typed helper from the workers pool so TS knows about poolOptions.workers.*
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    name: 'workers',
    pool: '@cloudflare/vitest-pool-workers',
    include: ['tests/workers/**/*.{test,spec}.{ts,js}'],
    poolOptions: {
      workers: {
        // your Wrangler config path here
        wrangler: { configPath: './wrangler.toml' },
      },
    },
  },
});