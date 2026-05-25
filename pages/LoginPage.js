// @ts-check
const { expect } = require('@playwright/test');

/**
 * Page Object for the SmartERP login screen.
 * Selectors confirmed from memory (ERP System Access).
 */
class LoginPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.companyInput = page.locator('#this_company');
    this.identityInput = page.locator('#identity');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('#form_login button[type="submit"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  /**
   * @param {{ company: string, user: string, pass: string }} creds
   */
  async login({ company, user, pass }) {
    await this.companyInput.waitFor({ state: 'visible' });
    await this.companyInput.fill(company);
    await this.identityInput.fill(user);
    await this.passwordInput.fill(pass);
    await Promise.all([
      this.page.waitForLoadState('networkidle'),
      this.submitButton.click(),
    ]);
  }

  async expectLoggedIn() {
    // After login, we expect to be off the login form. We assert the company
    // input is gone (no longer the login page).
    await expect(this.companyInput).toHaveCount(0, { timeout: 15_000 });
  }
}

module.exports = { LoginPage };
