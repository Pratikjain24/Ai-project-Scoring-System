import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Use 'localhost' instead of '0.0.0.0' to enable camera access
    // Camera API requires HTTPS or localhost for security
    // If you need network access, use HTTPS with SSL certificates
    host: 'localhost',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
})
