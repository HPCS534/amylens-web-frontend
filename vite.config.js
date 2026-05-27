import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev-only plugin to mock the export endpoint so Playwright e2e tests can run
function devExportMock() {
  return {
    name: 'dev-export-mock',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/api/sessions/export')) {
          const header = 'id,deviceSsid,userName,variety,amyloseClass,confidenceScore,capturedAt,submittedAt,verdict,verdictReason,trialStage,season,imageHash,reviewerIdentity\n'
          const sample = 'SES-1,DEV-1,user1,Standard,High,0.98,2023-10-10T10:00:00Z,2023-10-10T10:05:00Z,verified,,stage1,2023,hash123,reviewerA\n'
          res.setHeader('content-type', 'text/csv')
          res.statusCode = 200
          res.end(header + sample)
          return
        }
        next()
      })
    }
  }
}

const plugins = [react()]
if (process.env.USE_REAL_BACKEND !== 'true') plugins.push(devExportMock())

export default defineConfig({
  plugins,
  test: {
    include: ['src/**/*.test.{js,jsx,ts,tsx}'],
    exclude: ['tests/**'],
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})