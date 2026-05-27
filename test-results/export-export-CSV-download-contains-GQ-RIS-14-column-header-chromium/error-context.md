# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: export.spec.js >> export CSV download contains GQ-RIS 14-column header
- Location: tests\export.spec.js:4:1

# Error details

```
TimeoutError: page.waitForResponse: Timeout 10000ms exceeded while waiting for event "response"
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]: Control Center
      - generic [ref=e7]: Management Dashboard
    - navigation "Module 4 navigation" [ref=e8]:
      - link "▣ Devices" [ref=e9] [cursor=pointer]:
        - /url: /app/devices
        - generic [ref=e10]: ▣
        - generic [ref=e11]: Devices
      - link "⚠ Flagged Sessions" [ref=e12] [cursor=pointer]:
        - /url: /app/flagged-sessions
        - generic [ref=e13]: ⚠
        - generic [ref=e14]: Flagged Sessions
      - link "▤ Analytics" [ref=e15] [cursor=pointer]:
        - /url: /app/analytics
        - generic [ref=e16]: ▤
        - generic [ref=e17]: Analytics
      - link "⇪ Data Export" [ref=e18] [cursor=pointer]:
        - /url: /app/export
        - generic [ref=e19]: ⇪
        - generic [ref=e20]: Data Export
    - button "⎋ Sign Out" [ref=e22] [cursor=pointer]:
      - generic [ref=e23]: ⎋
      - generic [ref=e24]: Sign Out
  - generic [ref=e25]:
    - generic [ref=e26]:
      - generic [ref=e27]:
        - generic [ref=e28]: Data Export
        - generic [ref=e29]:
          - generic [ref=e30]: ⌕
          - textbox "Search sessions" [ref=e31]:
            - /placeholder: Search sessions...
      - generic [ref=e33]:
        - generic [ref=e34]: AS
        - generic [ref=e35]:
          - generic [ref=e36]: Alex Sterling
          - generic [ref=e37]: TEAM LEAD
    - main [ref=e38]:
      - generic [ref=e39]:
        - generic [ref=e40]:
          - button "←" [ref=e41] [cursor=pointer]
          - text: ADMIN > DATA EXPORT
        - generic [ref=e42]:
          - generic [ref=e43]:
            - generic [ref=e44]:
              - heading "Data Export Management" [level=2] [ref=e45]
              - generic [ref=e46]: Batch export in progress
            - button "BATCH EXPORT" [ref=e47] [cursor=pointer]
          - generic [ref=e48]:
            - generic [ref=e49]:
              - generic [ref=e50]: TOTAL EXPORTS
              - generic [ref=e51]: 1,284
            - generic [ref=e52]:
              - generic [ref=e53]: ACTIVE TRANSFERS
              - generic [ref=e54]: "0"
            - generic [ref=e55]:
              - generic [ref=e56]: AVG PROCESSING TIME
              - generic [ref=e57]: 4.2s
            - generic [ref=e58]:
              - generic [ref=e59]: SUCCESS RATE
              - generic [ref=e60]: 99.8%
          - generic [ref=e61]:
            - generic [ref=e62]:
              - heading "Export History" [level=3] [ref=e63]
              - button "Filter" [ref=e64] [cursor=pointer]
            - table [ref=e66]:
              - rowgroup [ref=e67]:
                - row "BATCH ID TIMESTAMP RECORDS SCHEMA STATUS ACTION" [ref=e68]:
                  - columnheader "BATCH ID" [ref=e69]
                  - columnheader "TIMESTAMP" [ref=e70]
                  - columnheader "RECORDS" [ref=e71]
                  - columnheader "SCHEMA" [ref=e72]
                  - columnheader "STATUS" [ref=e73]
                  - columnheader "ACTION" [ref=e74]
              - rowgroup [ref=e75]:
                - row "EXP-2023-094 Oct 24, 2023 14:22 1,402 GQ-RIS Core ● COMPLETED DOWNLOAD" [ref=e76]:
                  - cell "EXP-2023-094" [ref=e77]
                  - cell "Oct 24, 2023 14:22" [ref=e78]
                  - cell "1,402" [ref=e79]
                  - cell "GQ-RIS Core" [ref=e80]
                  - cell "● COMPLETED" [ref=e81]
                  - cell "DOWNLOAD" [ref=e82]:
                    - button "DOWNLOAD" [ref=e83] [cursor=pointer]
                - row "EXP-2023-093 Oct 24, 2023 11:05 842 Legacy JSON ● COMPLETED DOWNLOAD" [ref=e84]:
                  - cell "EXP-2023-093" [ref=e85]
                  - cell "Oct 24, 2023 11:05" [ref=e86]
                  - cell "842" [ref=e87]
                  - cell "Legacy JSON" [ref=e88]
                  - cell "● COMPLETED" [ref=e89]
                  - cell "DOWNLOAD" [ref=e90]:
                    - button "DOWNLOAD" [ref=e91] [cursor=pointer]
                - row "EXP-2023-092 Oct 23, 2023 09:15 12,045 GQ-RIS Core ● FAILED RETRY" [ref=e92]:
                  - cell "EXP-2023-092" [ref=e93]
                  - cell "Oct 23, 2023 09:15" [ref=e94]
                  - cell "12,045" [ref=e95]
                  - cell "GQ-RIS Core" [ref=e96]
                  - cell "● FAILED" [ref=e97]
                  - cell "RETRY" [ref=e98]:
                    - button "RETRY" [ref=e99] [cursor=pointer]
        - complementary [ref=e100]:
          - generic [ref=e101]:
            - generic [ref=e102]: EXPORT SUMMARY
            - generic [ref=e103]: 1,284
            - generic [ref=e104]:
              - generic [ref=e105]:
                - text: Estimated Size
                - strong [ref=e106]: 14.2 MB
              - generic [ref=e107]:
                - text: Privacy Compliance
                - strong [ref=e108]: AES-256
              - generic [ref=e109]:
                - text: Estimated Time
                - strong [ref=e110]: ~45 seconds
              - generic [ref=e111]:
                - text: Schema
                - strong [ref=e112]: 14-col GQ-RIS
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import fs from 'fs'
  3  | 
  4  | test('export CSV download contains GQ-RIS 14-column header', async ({ page }) => {
  5  |   // Make the app think the user is authenticated by responding to the bootstrap devices call
  6  |   await page.route('**/api/devices', (route) => {
  7  |     route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  8  |   })
  9  | 
  10 |   // Diagnostic logging: network and page console
  11 |   page.on('request', (r) => console.log('REQ', r.method(), r.url()))
  12 |   page.on('response', (r) => console.log('RES', r.status(), r.url()))
  13 |   page.on('console', (msg) => console.log('PAGE_CONSOLE', msg.text()))
  14 | 
  15 |   // Prepare a CSV payload matching the 14-column GQ-RIS header
  16 |   const header = 'id,deviceSsid,userName,variety,amyloseClass,confidenceScore,capturedAt,submittedAt,verdict,verdictReason,trialStage,season,imageHash,reviewerIdentity\n'
  17 |   const sample = 'SES-1,DEV-1,user1,Standard,High,0.98,2023-10-10T10:00:00Z,2023-10-10T10:05:00Z,verified,,stage1,2023,hash123,reviewerA\n'
  18 |   const csvBody = header + sample
  19 | 
  20 |   // Monkeypatch URL.createObjectURL to capture the blob object created by the app
  21 |   await page.addInitScript(() => {
  22 |     (function () {
  23 |       const original = URL.createObjectURL
  24 |       URL.createObjectURL = function (obj) {
  25 |         try { window.__lastBlob = obj } catch (e) { /* ignore */ }
  26 |         return original.call(URL, obj)
  27 |       }
  28 |     })()
  29 |   })
  30 | 
  31 |   // Intercept the export request and return the CSV
  32 |   await page.route('**/api/sessions/export**', (route) => {
  33 |     route.fulfill({ status: 200, contentType: 'text/csv', body: csvBody })
  34 |   })
  35 | 
  36 |   // Navigate to the export page (AuthProvider will bootstrap using the intercepted /api/devices)
  37 |   await page.goto('/app/export')
  38 | 
  39 |   // Click through the UI to trigger the export request and capture the network response
  40 |   await page.click('text=Download All Active Sessions')
  41 |   await page.click('text=BATCH EXPORT')
  42 | 
  43 |   const [response] = await Promise.all([
> 44 |     page.waitForResponse((r) => r.url().includes('/api/sessions/export') && r.status() === 200),
     |          ^ TimeoutError: page.waitForResponse: Timeout 10000ms exceeded while waiting for event "response"
  45 |     page.click('text=Start Processing'),
  46 |   ])
  47 | 
  48 |   const text = await response.text()
  49 | 
  50 |   // Validate header
  51 |   const firstLine = text.split('\n')[0]
  52 |   expect(firstLine).toBe('id,deviceSsid,userName,variety,amyloseClass,confidenceScore,capturedAt,submittedAt,verdict,verdictReason,trialStage,season,imageHash,reviewerIdentity')
  53 | })
  54 | 
```