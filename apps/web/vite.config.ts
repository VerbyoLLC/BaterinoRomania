import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': { target: 'http://localhost:3005', changeOrigin: true },
      '/sitemap.xml': { target: 'http://localhost:3005/sitemap.xml', changeOrigin: true },
    },
  },
  preview: {
    proxy: {
      '/api': { target: 'http://localhost:3005', changeOrigin: true },
      '/sitemap.xml': { target: 'http://localhost:3005/sitemap.xml', changeOrigin: true },
    },
  },
})
