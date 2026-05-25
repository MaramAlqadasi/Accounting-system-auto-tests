// @ts-check
const { test: setup, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const { LoginPage } = require('../pages/LoginPage');

const authFile = path.join(__dirname, '..', 'fixtures', 'auth.json');

setup('authenticate', async ({ page }) => {
  // Ensure the fixtures directory exists before Playwright writes auth.json.
  const dir = path.dirname(authFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const company = process.env.ERP_COMPANY;
  const user = process.env.ERP_USER;
  const pass = process.env.ERP_PASS;

  if (!company || !user || !pass) {
    throw new Error(
      'Missing ERP credentials. Make sure .env contains ERP_COMPANY, ERP_USER, ERP_PASS.'
    );
  }

  const login = new LoginPage(page);
  await login.goto();
  await login.login({ company, user, pass });
  await login.expectLoggedIn();

  // Sanity check: we should now be on an authenticated page.
  await expect(page).not.toHaveURL(/login/i);

  await page.context().storageState({ path: authFile });
});
