// @ts-check
const { test, expect } = require('@playwright/test');
const { ManualJournalPage } = require('../../pages/ManualJournalPage');

/**
 * TC-034: مسافات في بداية/نهاية الرقم اليدوي تُقتطع (Trim).
 * Enter "  REF-...  " and expect the saved reference to be trimmed.
 * Writes 1 real entry.
 */
test.describe('Reference number manual trim', () => {
  test.setTimeout(150_000);
  test('TC-034: leading/trailing spaces in a manual reference are trimmed', async ({ page }) => {
    const j = new ManualJournalPage(page);
    const core = `REF-TRIM-${Date.now()}`;
    const r = await j.createBalancedEntry({ reference: `   ${core}   `, tag: 'TC-034' });
    console.log(`[TC-034] typed="   ${core}   " saved ref="${r.ref}"`);
    expect(r.success).toBe(true);
    expect(r.ref, 'saved reference must be trimmed').toBe(core);
  });
});
