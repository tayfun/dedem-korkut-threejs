import { defineConfig } from 'vite';

// Göreli taban yolu: site GitHub Pages'te alt klasörden de çalışır.
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 800 }, // three.js tek başına ~600 kB
});
