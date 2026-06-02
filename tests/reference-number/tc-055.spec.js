// @ts-check
const { test, expect } = require('@playwright/test');
const { ManualJournalPage } = require('../../pages/ManualJournalPage');

/**
 * TC-055: اللغة العربية في الرقم المرجعي — تُخزَّن وتُعرض بشكل صحيح (Unicode/RTL).
 * Enter an Arabic manual reference and assert it is saved verbatim. Writes 1 real entry.
 */
test.describe('Reference number Arabic/RTL', () => {
  test.setTimeout(150_000);
  test('TC-055: an Arabic manual reference is stored and read back correctly', async ({ page }) => {
    const j = new ManualJournalPage(page);
    const arabicRef = `مرجع-تجريبي-${Date.now()}`;
    const r = await j.createBalancedEntry({ reference: arabicRef, tag: 'TC-055 عربي' });
    console.log(`[TC-055] typed="${arabicRef}" saved ref="${r.ref}"`);
    expect(r.success).toBe(true);
    expect(r.ref, 'Arabic reference must round-trip unchanged').toBe(arabicRef);
  });
});
