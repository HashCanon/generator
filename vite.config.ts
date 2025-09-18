// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';        
export default defineConfig({
  plugins: [
    react(),   
    tailwindcss(), 
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), 
    },
  },
  build: {
    outDir: 'docs',  
    emptyOutDir: true,
  },
  base: '/generator/',
  server: { port: 5175 },
});