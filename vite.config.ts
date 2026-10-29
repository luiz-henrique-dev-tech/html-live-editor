import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// GitHub Pages serves a project site under /<repo>/, not at the domain root
// that Vercel uses for the real deploy, so only that build sets a base path.
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/html-live-editor/' : '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        preview: resolve(import.meta.dirname, 'preview.html'),
        sandbox: resolve(import.meta.dirname, 'sandbox.html'),
      },
    },
  },
});
