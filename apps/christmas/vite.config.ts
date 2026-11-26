import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        village: resolve(__dirname, 'index.html'),
        parent: resolve(__dirname, 'parent/index.html'),
      },
    },
  },
});
