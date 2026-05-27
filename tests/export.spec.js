import { test, expect } from '@playwright/test'
import fs from 'fs'

test('export CSV download contains GQ-RIS 14-column header', async ({ page }) => {
  // Make the app think the user is authenticated by responding to the bootstrap devices call
  await page.route('**/api/devices', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  })

  // Diagnostic logging: network and page console
  page.on('request', (r) => console.log('REQ', r.method(), r.url()))
  page.on('response', (r) => console.log('RES', r.status(), r.url()))
  page.on('console', (msg) => console.log('PAGE_CONSOLE', msg.text()))

  // Prepare a CSV payload matching the 14-column GQ-RIS header
  const header = 'id,deviceSsid,userName,variety,amyloseClass,confidenceScore,capturedAt,submittedAt,verdict,verdictReason,trialStage,season,imageHash,reviewerIdentity\n'
  const sample = 'SES-1,DEV-1,user1,Standard,High,0.98,2023-10-10T10:00:00Z,2023-10-10T10:05:00Z,verified,,stage1,2023,hash123,reviewerA\n'
  const csvBody = header + sample

  // Monkeypatch URL.createObjectURL to capture the blob object created by the app
  await page.addInitScript(() => {
    (function () {
      const original = URL.createObjectURL
      URL.createObjectURL = function (obj) {
        try { window.__lastBlob = obj } catch (e) { /* ignore */ }
        return original.call(URL, obj)
      }
    })()
  })

  // Intercept the export request and return the CSV
  await page.route('**/api/sessions/export**', (route) => {
    route.fulfill({ status: 200, contentType: 'text/csv', body: csvBody })
  })

  // Navigate to the export page (AuthProvider will bootstrap using the intercepted /api/devices)
  await page.goto('/app/export')

  // Click through the UI to trigger the export request and capture the network response
  await page.click('text=Download All Active Sessions')
  await page.click('text=BATCH EXPORT')

  const [response] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/api/sessions/export') && r.status() === 200),
    page.click('text=Start Processing'),
  ])

  const text = await response.text()

  // Validate header
  const firstLine = text.split('\n')[0]
  expect(firstLine).toBe('id,deviceSsid,userName,variety,amyloseClass,confidenceScore,capturedAt,submittedAt,verdict,verdictReason,trialStage,season,imageHash,reviewerIdentity')
})
