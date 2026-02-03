import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
// Cloudflare Pages SSR build
export default defineConfig({
  // Dev server on port 5179
  server: {
    port: 5179,
  },

  // Server output - renders on request
  output: 'server',

  build: {
    // Optimized for fast loading
    inlineStylesheets: 'auto',
  },

  vite: {
    build: {
      // Minimize bundle size
      cssMinify: true,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('@react-three')) return 'react-three';
            if (id.includes('three')) return 'three-core';
            if (id.includes('rapier')) return 'rapier';
            return undefined;
          },
        },
      },
    },
  },

  adapter: cloudflare({
    imageService: 'cloudflare',
  }),

  integrations: [react()],
});