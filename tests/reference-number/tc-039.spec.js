// @ts-check
const { test, expect } = require('@playwright/test');
const { ManualJournalPage } = require('../../pages/ManualJournalPage');

/**
 * TC-039: العدّاد لا يحجز رقماً إلا عند الحفظ الفعلي.
 * auto A1 -> open a new modal & abandon it (no save) -> auto A2 ; expect A2 == A1 + 1 (no gap).
 * Writes 2 real entries (the abandoned one must NOT consume a number).
 */
test.describe('Reference number not reserved until save', () => {
  test.setTimeout(250_000);
  test('TC-039: abandoning an unsaved entry does not consume a reference number', async ({ page }) => {
    const j = new ManualJournalPage(page);
    const a1 = await j.createBalancedEntry({ tag: 'TC-039 first' });
    console.log(`[TC-039] first: id=${a1.id} ref="${a1.ref}"`);
    expect(a1.ref).toMatch(/^\d+$/);

    await j.openModalAndAbandon(); // fills a form but navigates away without saving
    console.log('[TC-039] opened a modal and abandoned it (no save)');

    const a2 = await j.createBalancedEntry({ tag: 'TC-039 second' });
    console.log(`[TC-039] second: id=${a2.id} ref="${a2.ref}"`);
    expect(parseInt(a2.ref, 10), 'next saved entry continues with no gap (abandoned draft reserved nothing)')
      .toBe(parseInt(a1.ref, 10) + 1);
  });
});
