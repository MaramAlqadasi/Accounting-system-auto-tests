// @ts-check
const { test, expect } = require('@playwright/test');
const { ManualJournalPage } = require('../../pages/ManualJournalPage');
const { SettingsPage } = require('../../pages/SettingsPage');

/**
 * TC-007: صيغة "Sequence Number" → رقم رقمي بحت بدون بادئة.
 * NOTE: this ERP has NO free-text prefix for journals; the reference structure is governed by
 * #reference_format (1=YEAR/Seq, 2=YEAR/MONTH/Seq, 3=Sequence, 4=Random). Format 3 = plain digits.
 * Sets format=3, creates an auto entry, asserts the reference is purely numeric. Restores setting.
 */
test.describe('Reference format - plain sequence', () => {
  test.setTimeout(250_000);
  test('TC-007: with format=Sequence Number the auto reference is purely numeric (no prefix)', async ({ page }) => {
    const s = new SettingsPage(page);
    const j = new ManualJournalPage(page);
    const original = await s.readReferenceFormat();
    try {
      await s.setReferenceFormat('3');
      const r = await j.createBalancedEntry({ tag: 'TC-007 seq-format' });
      console.log(`[TC-007] format=3 -> ref="${r.ref}"`);
      expect(r.success).toBe(true);
      expect(r.ref, 'reference must be purely numeric digits, no prefix/space/dash').toMatch(/^\d+$/);
    } finally {
      await s.setReferenceFormat(original);
      console.log(`[TC-007] restored reference_format=${original}`);
    }
  });
});
