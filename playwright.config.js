// @ts-check
require('dotenv').config();
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright configuration for the SmartERP accounting system.
 * - Chromium-only (low disk space).
 * - Headed mode by default so Maram can watch tests run.
 * - RTL/Arabic locale to match the ERP UI.
 * - Auth setup runs first and shares storage state with all other tests.
 */
module.exports = defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: process.env.ERP_URL || 'https://acc.devsub.smartlifesys.online',
    headless: false,
    viewport: { width: 1440, height: 900 },
    locale: 'ar-SA',
    timezoneId: 'Asia/Riyadh',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.js/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'fixtures/auth.json',
      },
      dependencies: ['setup'],
      testIgnore: /auth\.setup\.js/,
    },
  ],
});
