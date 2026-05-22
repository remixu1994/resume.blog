import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
      '@devfolio-blog/content-data': new URL('./src/legacy/content-data/src/index.ts', import.meta.url).pathname,
      '@devfolio-blog/content-schema': new URL('./src/legacy/content-schema/src/index.ts', import.meta.url).pathname,
      '@devfolio-blog/i18n': new URL('./src/legacy/i18n/src/index.ts', import.meta.url).pathname,
      '@devfolio-blog/markdown': new URL('./src/legacy/markdown/src/index.ts', import.meta.url).pathname,
      '@devfolio-blog/shared-types': new URL('./src/legacy/shared-types/src/index.ts', import.meta.url).pathname,
    },
  },
});
