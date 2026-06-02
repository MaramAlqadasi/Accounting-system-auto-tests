// @ts-check
const { test, expect } = require('@playwright/test');
const { ManualJournalPage } = require('../../pages/ManualJournalPage');

/**
 * TC-004: الرقم المرجعي المُدخل يدوياً يُحفظ كما هو ولا يُستبدل بالتوليد التلقائي
 *
 * Type an explicit (non-numeric, unique) reference, submit, then read it back
 * and assert the saved reference equals exactly what was typed.
 *
 * A unique suffix (timestamp) keeps the manual value from colliding with a
 * previous run when duplicate references are disallowed system-wide.
 *
 * NOTE: writes 1 real journal entry to the test ERP per run.
 */
test.describe('Reference number manual entry', () => {
  test.setTimeout(150_000);

  test('TC-004: a manually entered reference is kept verbatim', async ({ page }) => {
    const journal = new ManualJournalPage(page);
    const manualRef = `JV-MAN-${Date.now()}`;

    const r = await journal.createBalancedEntry({ reference: manualRef, tag: 'TC-004' });
    console.log(`[TC-004] typed="${manualRef}" id=${r.id} saved ref="${r.ref}"`);

    expect(r.success, 'entry should save').toBe(true);
    expect(r.ref, 'saved reference must equal the manually entered value').toBe(manualRef);
  });
});
