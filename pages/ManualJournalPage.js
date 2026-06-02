// @ts-check
const { expect } = require('@playwright/test');

/**
 * Page Object for the Manual Journal Entry screen (شاشة القيد اليدوي).
 *
 * Interaction model fully verified live on 2026-06-02 (see project memory
 * `project-playwright-reference-number`). Key facts baked in below:
 *
 *  - The create form is a REMOTE Bootstrap modal fragment injected into the
 *    dailymove list page. Opening it with a native Playwright `.click()` follows
 *    the <a href> and breaks jQuery/Select2 — so we trigger the jQuery-delegated
 *    handler instead: jQuery('a.add_btn').trigger('click').
 *  - Accounts use Select2 v3 backed by AJAX (`/ajax/get_accounts`). There is ONE
 *    shared #select2-drop appended to <body>; only the active one is visible.
 *    NEVER press Escape to close a dropdown — Escape closes the whole modal.
 *  - Submit posts to /accounting/edit_dailymove/ and returns JSON
 *    {"success":true,"id":"<entryId>"}. The reference number is NOT in that
 *    response — read it back from GET /accounting/edit_dailymove/<id> by parsing
 *    the #bone_number_daily value.
 *
 * Verified test accounts:
 *   id=44  -> "1030301,الصندوق"          (cash, use as DEBIT)
 *   id=129 -> "504,مصروفات تسويقية"       (marketing expense, use as CREDIT)
 */
class ManualJournalPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.base = process.env.ERP_URL || 'https://acc.devsub.smartlifesys.online';

    this.listUrl = '/accounting/dailymove';

    // Create-form fields (inside the modal fragment).
    this.referenceInput = page.locator('#bone_number_daily'); // leave EMPTY for auto-gen
    this.dateInput = page.locator('#edit_date');
    this.branchSelect = page.locator('#branch_id');
    this.yearSelect = page.locator('#year');
    this.recordNumber = page.locator('#edit_record_number'); // auto, readonly
    this.totalDebit = page.locator('#total_all_debit');
    this.totalCredit = page.locator('#total_all_credite');
    this.notes = page.locator('#description');
    this.submitButton = page.locator('#insert_dailymove'); // an <input type=submit>
  }

  /**
   * Open the create-entry modal without navigating (preserves jQuery/Select2).
   */
  async openCreateModal() {
    await this.page.goto(`${this.base}${this.listUrl}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await this.page.locator('a.add_btn[href*="edit_dailymove"]').first().waitFor({ state: 'visible', timeout: 25_000 });
    await this.page.waitForLoadState('load').catch(() => {});
    await this.page.waitForTimeout(3500); // let external JS bind delegated handlers
    await this.page.evaluate(() => window.jQuery('a.add_btn[href*="edit_dailymove"]').first().trigger('click'));
    await this.referenceInput.waitFor({ state: 'visible', timeout: 25_000 });
    await this.page.waitForTimeout(2500);
  }

  /**
   * Pick an account in a given row via Select2 v3 AJAX search.
   * @param {number} row 1-based row index
   * @param {string} term search term (e.g. 'الصندوق')
   * @returns {Promise<{val: string|undefined, chosen: string|undefined}>}
   */
  /**
   * Remove transient overlays (SweetAlert popups, leftover dropdowns) that can
   * intercept pointer events on the dailymove page.
   */
  async dismissOverlays() {
    await this.page.evaluate(() => {
      document.querySelectorAll('.swal2-container, .sweet-alert, .swal2-backdrop-show').forEach(e => e.remove());
      if (window.jQuery) window.jQuery('#select2-drop').hide();
    });
    await this.page.waitForTimeout(150);
  }

  async pickAccount(row, term) {
    // clear any SweetAlert / open dropdown WITHOUT Escape (Escape closes the modal)
    await this.dismissOverlays();
    const choice = this.page.locator(`#s2id_choose_account_${row} .select2-choice`).first();
    await choice.scrollIntoViewIfNeeded().catch(() => {});
    await choice.click();
    await this.page.waitForTimeout(600);
    const input = this.page.locator('#select2-drop input.select2-input').filter({ visible: true }).first();
    await input.waitFor({ state: 'visible', timeout: 15_000 });
    await input.fill(term);
    await this.page.waitForTimeout(2500); // AJAX get_accounts
    const result = this.page.locator('#select2-drop li.select2-result-selectable').filter({ visible: true }).first();
    await result.click();
    await this.page.waitForTimeout(800);
    return await this.page.evaluate((r) => ({
      val: document.querySelector(`#choose_account_${r}`)?.value,
      chosen: document.querySelector(`#s2id_choose_account_${r} .select2-chosen`)?.textContent?.trim(),
    }), row);
  }

  /**
   * Fill a debit amount + statement for a row (account picked separately).
   */
  async fillDebitRow(row, { amount, statement }) {
    await this.page.locator(`#amount_${row}_debit`).fill(String(amount));
    if (statement) await this.page.locator(`#statement_${row}`).fill(statement);
  }

  async fillCreditRow(row, { amount, statement }) {
    await this.page.locator(`#amount_${row}_credite`).fill(String(amount));
    if (statement) await this.page.locator(`#statement_${row}`).fill(statement);
    // nudge totals to recompute
    await this.page.evaluate((r) => { if (window.jQuery) window.jQuery(`#amount_${r}_credite`).trigger('keyup').trigger('change'); }, row);
    await this.page.waitForTimeout(500);
  }

  /** @returns {Promise<string>} the current reference-number input value */
  async referenceValue() {
    return (await this.referenceInput.inputValue());
  }

  /**
   * Submit the entry and return the new entry id parsed from the POST response.
   * @returns {Promise<{id: string, success: boolean, raw: any}>}
   */
  async submit() {
    const respPromise = this.page.waitForResponse(
      (r) => /\/accounting\/edit_dailymove\/?$/.test(r.url()) && r.request().method() === 'POST',
      { timeout: 30_000 }
    );
    await this.submitButton.click();
    const resp = await respPromise;
    let json = {};
    try { json = JSON.parse(await resp.text()); } catch { /* non-JSON */ }
    return { id: String(json.id ?? ''), success: !!json.success, raw: json };
  }

  /**
   * Convenience: create one balanced entry (debit الصندوق / credit مصروفات تسويقية)
   * and return its id + read-back reference number.
   * @param {{ reference?: string, amount?: string|number, tag?: string }} [opts]
   *   reference: if provided, typed into #bone_number_daily (manual); if omitted, left empty (auto).
   * @returns {Promise<{id: string, success: boolean, ref: string, typedReference: string|null}>}
   */
  async createBalancedEntry(opts = {}) {
    const { reference, amount = '100', tag = '' } = opts;
    await this.openCreateModal();
    await this.dismissOverlays();
    if (reference !== undefined) await this.referenceInput.fill(String(reference));
    await this.pickAccount(1, 'الصندوق');
    await this.fillDebitRow(1, { amount, statement: `${tag} مدين`.trim() });
    await this.pickAccount(2, 'مصروفات تسويقية');
    await this.fillCreditRow(2, { amount, statement: `${tag} دائن`.trim() });
    const res = await this.submit();
    const ref = await this.readReferenceNumber(res.id);
    return { id: res.id, success: res.success, ref, typedReference: reference !== undefined ? String(reference) : null };
  }

  /**
   * Read back the auto-generated reference number for a saved entry by loading
   * its edit fragment and extracting #bone_number_daily.
   * @param {string|number} entryId
   * @returns {Promise<string>}
   */
  async readReferenceNumber(entryId) {
    const html = await this.page.evaluate(async (url) => {
      const r = await fetch(url, { credentials: 'include' });
      return await r.text();
    }, `${this.base}/accounting/edit_dailymove/${entryId}`);
    const m = html.match(/id=["']bone_number_daily["'][^>]*value=["']([^"']*)["']/i)
          || html.match(/name=["']bone_number["'][^>]*value=["']([^"']*)["']/i);
    return m ? m[1].trim() : '';
  }
}

module.exports = { ManualJournalPage };
