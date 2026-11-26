import { defineConfig } from 'vite';

// Göreli taban yolu: site GitHub Pages'te alt klasörden de çalışır.
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 900 }, // three.js tek başına ~600 kB; GLTFLoader ile birlikte ~810 kB
});
