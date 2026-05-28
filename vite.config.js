import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/**/*.test.{js,jsx,ts,tsx}'],
    exclude: ['tests/**'],
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://amylens-backend.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/login': {
        target: process.env.VITE_API_URL || 'https://amylens-backend.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/logout': {
        target: process.env.VITE_API_URL || 'https://amylens-backend.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})