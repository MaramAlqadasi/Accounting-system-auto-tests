// @ts-check
const { expect } = require('@playwright/test');

/**
 * Page Object for the Manual Journal Entry screen.
 *
 * WARNING - SELECTORS ARE PLACEHOLDERS (TODO).
 * The login flow is verified; the manual journal entry page selectors below
 * are best-guess based on Arabic UI conventions ("قيد يدوي" = manual entry).
 *
 * HOW TO REPLACE THESE:
 *   1. Run: npx playwright codegen https://acc.devsub.smartlifesys.online
 *   2. Log in with company/user/pass = test_maram2 / test_maram2 / 12345678
 *   3. Click through to the manual journal entry screen.
 *   4. Copy the recorded selectors into the locator definitions below.
 *   5. Replace every `TODO:` placeholder.
 */
class ManualJournalPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    // TODO: replace with the actual URL path discovered via codegen.
    // Likely candidates based on the ERP routing pattern:
    //   /accounting/journal_entries/new
    //   /accounting/manual_entry
    this.url = '/accounting/journal_entries/new';

    // TODO: confirm via codegen. Common patterns in this ERP:
    //   - link with text "قيد يدوي" or "إضافة قيد"
    //   - id like #btn_add_journal
    this.navLink = page.getByRole('link', { name: /قيد|Journal/i });

    // Form fields - TODO: confirm all selectors.
    this.referenceNumberInput = page.locator('input[name="reference_number"]'); // TODO
    this.dateInput = page.locator('input[name="entry_date"]');                  // TODO
    this.descriptionInput = page.locator('textarea[name="description"]');       // TODO
    this.debitAccountSelect = page.locator('select[name="debit_account"]');     // TODO
    this.creditAccountSelect = page.locator('select[name="credit_account"]');   // TODO
    this.amountInput = page.locator('input[name="amount"]');                    // TODO

    // Save button - TODO: confirm.
    this.saveButton = page.getByRole('button', { name: /حفظ|Save/i });

    // Success indicator - TODO: confirm. Could be a toast, a redirect, or a
    // success banner.
    this.successMessage = page.locator('.alert-success, .toast-success');

    // Reference number on the saved entry view - TODO.
    this.savedReferenceNumber = page.locator('[data-field="reference_number"]');
  }

  async goto() {
    await this.page.goto(this.url);
  }

  /**
   * Fill all required fields EXCEPT reference number.
   * @param {{ date: string, description: string, debitAccount: string, creditAccount: string, amount: string }} data
   */
  async fillRequiredFieldsExceptReference(data) {
    await this.dateInput.fill(data.date);
    await this.descriptionInput.fill(data.description);
    await this.debitAccountSelect.selectOption({ label: data.debitAccount });
    await this.creditAccountSelect.selectOption({ label: data.creditAccount });
    await this.amountInput.fill(data.amount);
    // Intentionally do NOT touch referenceNumberInput.
  }

  async save() {
    await this.saveButton.click();
  }

  async expectSaveSuccess() {
    await expect(this.successMessage).toBeVisible({ timeout: 15_000 });
  }

  /** @returns {Promise<string>} the auto-generated reference number */
  async getSavedReferenceNumber() {
    await this.savedReferenceNumber.waitFor({ state: 'visible' });
    return (await this.savedReferenceNumber.textContent())?.trim() ?? '';
  }
}

module.exports = { ManualJournalPage };
