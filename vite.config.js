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
      '/api/login': {
        target: process.env.VITE_API_URL || 'https://amylens-backend.onrender.com',
        changeOrigin: true,
        secure: true,
        rewrite: () => '/login',
        onProxyRes(proxyRes) {
          const target = process.env.VITE_API_URL || 'https://amylens-backend.onrender.com'
          const loc = proxyRes.headers && proxyRes.headers.location
          if (loc && loc.startsWith(target)) {
            proxyRes.headers.location = loc.replace(target, '')
          }
          const setCookie = proxyRes.headers && proxyRes.headers['set-cookie']
          if (Array.isArray(setCookie)) {
            proxyRes.headers['set-cookie'] = setCookie.map((cookie) => cookie.replace(/;\s*Secure/gi, ''))
          }
        },
        configure(proxy) {
          proxy.on('proxyReq', (proxyReq) => {
            const target = process.env.VITE_API_URL || 'https://amylens-backend.onrender.com'
            proxyReq.setHeader('origin', target)
            proxyReq.setHeader('referer', `${target}/`)
          })
        },
      },
      '/api/logout': {
        target: process.env.VITE_API_URL || 'https://amylens-backend.onrender.com',
        changeOrigin: true,
        secure: true,
        rewrite: () => '/logout',
        configure(proxy) {
          proxy.on('proxyReq', (proxyReq) => {
            const target = process.env.VITE_API_URL || 'https://amylens-backend.onrender.com'
            proxyReq.setHeader('origin', target)
            proxyReq.setHeader('referer', `${target}/`)
          })
        },
      },
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
          const loc = proxyRes.headers && proxyRes.headers.location
          const target = process.env.VITE_API_URL || 'https://amylens-backend.onrender.com'
          if (loc && loc.startsWith(target)) {
            proxyRes.headers.location = loc.replace(target, '')
          }
        },
      },
    },
  },
})