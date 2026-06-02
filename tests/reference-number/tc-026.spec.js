// @ts-check
const { test, expect } = require('@playwright/test');
const { ManualJournalPage } = require('../../pages/ManualJournalPage');
const { SettingsPage } = require('../../pages/SettingsPage');

/**
 * TC-026 (+ TC-029): السماح بالتكرار = OFF + إدخال يدوي مكرر → يُرفض القيد الثاني.
 * Sets duplicate OFF, creates a manual reference, then tries the same reference again
 * and expects rejection (no successful save). Logs the rejection message (TC-029). Restores setting.
 * Writes 1-2 real entries + toggles a global setting (restored in finally).
 */
test.describe('Duplicate reference rejected', () => {
  test.setTimeout(300_000);
  test('TC-026: with duplicates disabled, a repeated manual reference is rejected', async ({ page }) => {
    const s = new SettingsPage(page);
    const j = new ManualJournalPage(page);
    const original = await s.readDuplicateAllowed();
    try {
      await s.setDuplicateAllowed('0');
      const ref = `DUP-NO-${Date.now()}`;
      const r1 = await j.createBalancedEntry({ reference: ref, tag: 'TC-026 first' });
      expect(r1.success, 'first (unique) entry saved').toBe(true);

      const r2 = await j.createBalancedEntry({ reference: ref, tag: 'TC-026 dup' });
      console.log(`[TC-026] duplicate attempt success=${r2.success} message="${r2.message}"`);
      expect(r2.success, 'a duplicate reference must be rejected when duplicates are disabled').toBe(false);
    } finally {
      await s.setDuplicateAllowed(original);
      console.log(`[TC-026] restored duplicate_reference_number=${original}`);
    }
  });
});
