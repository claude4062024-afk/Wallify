import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  // Dev server on port 5179
  server: {
    port: 5179,
  },
  // Static output with server API routes (Astro 5 default)
  output: 'static',
  build: {
    // Optimized for fast loading
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      // Minimize bundle size
      cssMinify: true,
      minify: 'esbuild',
    },
  },
  // Node adapter for API routes
  adapter: node({
    mode: 'standalone',
  }),
});
