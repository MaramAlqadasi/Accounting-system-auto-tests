// @ts-check
const { test, expect } = require('@playwright/test');
const { ManualJournalPage } = require('../../pages/ManualJournalPage');
const { SettingsPage } = require('../../pages/SettingsPage');

/**
 * TC-025: السماح بالتكرار = ON + إدخال يدوي مكرر → يُقبل القيدان.
 * Sets duplicate ON, creates the same manual reference twice, expects both saved. Restores the setting.
 * Writes 2 real entries + toggles a global setting (restored in finally).
 */
test.describe('Duplicate reference allowed', () => {
  test.setTimeout(300_000);
  test('TC-025: with duplicates allowed, the same manual reference is accepted twice', async ({ page }) => {
    const s = new SettingsPage(page);
    const j = new ManualJournalPage(page);
    const original = await s.readDuplicateAllowed();
    try {
      await s.setDuplicateAllowed('1');
      const ref = `DUP-OK-${Date.now()}`;
      const r1 = await j.createBalancedEntry({ reference: ref, tag: 'TC-025 first' });
      const r2 = await j.createBalancedEntry({ reference: ref, tag: 'TC-025 dup' });
      console.log(`[TC-025] r1.success=${r1.success} r2.success=${r2.success} ref="${ref}"`);
      expect(r1.success, 'first entry saved').toBe(true);
      expect(r2.success, 'duplicate accepted when duplicates are allowed').toBe(true);
      expect(r2.ref).toBe(ref);
    } finally {
      await s.setDuplicateAllowed(original);
      console.log(`[TC-025] restored duplicate_reference_number=${original}`);
    }
  });
});
