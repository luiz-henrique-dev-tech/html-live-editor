import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    exclude: ['e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      all: true,
      include: ['src/**/*.ts'],
      exclude: ['src/main.ts', 'src/**/*.test.ts', 'src/vite-env.d.ts'],
    },
  },
});
