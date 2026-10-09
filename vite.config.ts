import { defineConfig } from 'vite';

export default defineConfig({
  // відносні шляхи, щоб збірку можна було розгорнути на GitHub Pages у підпапці
  base: './',
  server: {
    port: 9000,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
