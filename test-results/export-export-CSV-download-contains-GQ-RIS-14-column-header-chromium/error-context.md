# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: export.spec.js >> export CSV download contains GQ-RIS 14-column header
- Location: tests\export.spec.js:4:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "id,deviceSsid,userName,variety,amyloseClass,confidenceScore,capturedAt,submittedAt,verdict,verdictReason,trialStage,season,imageHash,reviewerIdentity"
Received: ""
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
          - text: DATA EXPORT > BATCH EXPORT CONFIGURATION
        - generic [ref=e42]:
          - generic [ref=e43]: Configure Batch Export
          - paragraph [ref=e44]: Define the parameters for your institutional data aggregate. Processing occurs in a secure isolated environment.
          - generic [ref=e45]:
            - generic [ref=e46]:
              - generic [ref=e47]: EXPORT FORMAT
              - button "CSV 14-column GQ-RIS schema" [ref=e49] [cursor=pointer]:
                - generic [ref=e50]: CSV
                - paragraph [ref=e51]: 14-column GQ-RIS schema
            - generic [ref=e52]:
              - generic [ref=e53]:
                - text: Start Date
                - textbox "Start Date" [ref=e54]: 2023-10-01
              - generic [ref=e55]:
                - text: End Date
                - textbox "End Date" [ref=e56]: 2023-12-31
            - generic [ref=e57]:
              - generic [ref=e58]:
                - text: Session Status
                - combobox "Session Status" [ref=e59]:
                  - option "Verified" [selected]
                  - option "Needs Review"
                  - option "All"
              - generic [ref=e60]:
                - text: Variety
                - combobox "Variety" [ref=e61]:
                  - option "All" [selected]
                  - option "IR64"
                  - option "IRRI-9"
            - paragraph [ref=e63]: Batch exports apply the selected filters and return a single standardized file.
            - generic [ref=e64]:
              - button "Cancel" [ref=e65] [cursor=pointer]
              - button "Generate Export" [ref=e66] [cursor=pointer]
              - button "Start Processing" [active] [ref=e67] [cursor=pointer]
        - complementary [ref=e68]:
          - generic [ref=e69]:
            - generic [ref=e70]: EXPORT CONTROL
            - paragraph [ref=e71]: Use the controls to export filtered session records through the standard 14-column GQ-RIS schema.
            - generic [ref=e72]:
              - generic [ref=e73]:
                - text: Format
                - strong [ref=e74]: CSV
              - generic [ref=e75]:
                - text: Status
                - strong [ref=e76]: VERIFIED
              - generic [ref=e77]:
                - text: Variety
                - strong [ref=e78]: All
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
  44 |     page.waitForResponse((r) => r.url().includes('/api/sessions/export') && r.status() === 200),
  45 |     page.click('text=Start Processing'),
  46 |   ])
  47 | 
  48 |   const text = await response.text()
  49 | 
  50 |   // Validate header
  51 |   const firstLine = text.split('\n')[0]
> 52 |   expect(firstLine).toBe('id,deviceSsid,userName,variety,amyloseClass,confidenceScore,capturedAt,submittedAt,verdict,verdictReason,trialStage,season,imageHash,reviewerIdentity')
     |                     ^ Error: expect(received).toBe(expected) // Object.is equality
  53 | })
  54 | 
```