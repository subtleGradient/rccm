import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  server: { watch: { usePolling: true, interval: 300 } },
  build: {
    rollupOptions: {
      input: Object.fromEntries(['index', 'flow', 'cavities', 'tensor', 'playground', 'charge', 'starfield', 'pair'].map(name => [name, resolve(import.meta.dirname, `${name}.html`)])),
    },
  },
});
