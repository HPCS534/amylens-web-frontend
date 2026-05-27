/** @type {import('@playwright/test').PlaywrightTestConfig} */
export default {
  testDir: 'tests',
  timeout: 30000,
  use: {
    headless: true,
    baseURL: 'http://localhost:5177',
    actionTimeout: 10000,
    ignoreHTTPSErrors: true,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
}
