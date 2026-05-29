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
        configure(proxy) {
          proxy.on('proxyReq', (proxyReq) => {
            const target = process.env.VITE_API_URL || 'https://amylens-backend.onrender.com'
            proxyReq.setHeader('origin', target)
            proxyReq.setHeader('referer', `${target}/`)
          })
        },
        onProxyRes(proxyRes) {
          const target = process.env.VITE_API_URL || 'https://amylens-backend.onrender.com'
          const location = proxyRes.headers && proxyRes.headers.location
          if (location && location.startsWith(target)) {
            proxyRes.headers.location = location.replace(target, '')
          }
          const setCookie = proxyRes.headers && proxyRes.headers['set-cookie']
          if (Array.isArray(setCookie)) {
            proxyRes.headers['set-cookie'] = setCookie.map((cookie) => cookie.replace(/;\s*Secure/gi, ''))
          }
        },
      },
    },
  },
})
