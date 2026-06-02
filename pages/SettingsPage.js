// @ts-check

/**
 * Page Object for the system / accounting settings that govern reference numbers.
 *
 * Verified controls (2026-06-02):
 *  - /system_settings  : #reference_format (1=YEAR/Seq, 2=YEAR/MONTH/Seq, 3=Sequence, 4=Random),
 *                        #duplicate_reference_number (0=No, 1=Yes). Save button: #update_settings.
 *  - /accounting/settings : select[name="sequence_numbers_daily"] (true/false = branch sequencing
 *                        for journal entries), form #accounting_setting (POST ?branch=0).
 *
 * NOTE: these are GLOBAL settings on a shared system. Every helper that changes a value
 * is meant to be paired with a restore (read original -> set -> ... -> set original).
 * There is NO free-text prefix field for journal entries (only #reference_format).
 */
class SettingsPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.base = process.env.ERP_URL || 'https://acc.devsub.smartlifesys.online';
  }

  // ---------- /system_settings ----------
  async _gotoSystem() {
    await this.page.goto(`${this.base}/system_settings`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await this.page.waitForTimeout(1800);
  }

  /** read a system-settings select value by element name */
  async readSystem(name) {
    await this._gotoSystem();
    return await this.page.evaluate((n) => {
      const el = document.querySelector(`[name="${n}"]`);
      return el ? el.value : null;
    }, name);
  }

  /** set a system-settings select by name (value), then submit the whole settings form */
  async setSystem(name, value) {
    await this._gotoSystem();
    await this.page.evaluate(({ n, v }) => {
      const el = document.querySelector(`[name="${n}"]`);
      if (!el) throw new Error('settings field not found: ' + n);
      el.value = String(v);
      el.dispatchEvent(new Event('change', { bubbles: true }));
      if (window.jQuery) window.jQuery(el).trigger('change');
    }, { n: name, v: value });
    await this.page.waitForTimeout(400);
    const resp = this.page.waitForResponse(
      (r) => /\/system_settings/.test(r.url()) && r.request().method() === 'POST',
      { timeout: 30_000 }
    ).catch(() => null);
    await this.page.locator('#update_settings').click();
    await resp;
    await this.page.waitForTimeout(1500);
    // verify persisted
    const now = await this.readSystem(name);
    if (String(now) !== String(value)) {
      throw new Error(`setSystem(${name}) did not persist: wanted ${value}, got ${now}`);
    }
    return now;
  }

  // ---------- /accounting/settings ----------
  async _gotoAccounting() {
    await this.page.goto(`${this.base}/accounting/settings`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await this.page.waitForTimeout(1800);
  }

  async readAccounting(name) {
    await this._gotoAccounting();
    return await this.page.evaluate((n) => {
      const el = document.querySelector(`[name="${n}"]`);
      return el ? el.value : null;
    }, name);
  }

  /** set an accounting-settings field by name, then submit form #accounting_setting */
  async setAccounting(name, value) {
    await this._gotoAccounting();
    await this.page.evaluate(({ n, v }) => {
      const el = document.querySelector(`[name="${n}"]`);
      if (!el) throw new Error('accounting settings field not found: ' + n);
      el.value = String(v);
      el.dispatchEvent(new Event('change', { bubbles: true }));
      if (window.jQuery) window.jQuery(el).trigger('change');
    }, { n: name, v: value });
    await this.page.waitForTimeout(400);
    const resp = this.page.waitForResponse(
      (r) => /\/accounting\/settings/.test(r.url()) && r.request().method() === 'POST',
      { timeout: 30_000 }
    ).catch(() => null);
    // submit the accounting settings form (button text "Update"/"حفظ" inside #accounting_setting)
    const btn = this.page.locator('#accounting_setting button[type=submit], #accounting_setting input[type=submit]').first();
    if (await btn.count()) {
      await btn.scrollIntoViewIfNeeded().catch(() => {});
      await btn.click();
    } else {
      await this.page.evaluate(() => document.querySelector('#accounting_setting')?.submit());
    }
    await resp;
    await this.page.waitForTimeout(1500);
    const now = await this.readAccounting(name);
    if (String(now) !== String(value)) {
      throw new Error(`setAccounting(${name}) did not persist: wanted ${value}, got ${now}`);
    }
    return now;
  }

  // ---------- convenience wrappers for the reference-number settings ----------
  readDuplicateAllowed() { return this.readSystem('duplicate_reference_number'); }     // '0' | '1'
  setDuplicateAllowed(v) { return this.setSystem('duplicate_reference_number', v); }
  readReferenceFormat() { return this.readSystem('reference_format'); }                 // '1'..'4'
  setReferenceFormat(v) { return this.setSystem('reference_format', v); }
  readBranchSequencing() { return this.readAccounting('sequence_numbers_daily'); }       // 'true' | 'false'
  setBranchSequencing(v) { return this.setAccounting('sequence_numbers_daily', v); }
}

module.exports = { SettingsPage };
