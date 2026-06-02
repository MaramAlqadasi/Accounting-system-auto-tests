// @ts-check
const { test, expect } = require('@playwright/test');
const { ManualJournalPage } = require('../../pages/ManualJournalPage');

/**
 * TC-031: مزج قيود يدوية وتلقائية — العدّاد التلقائي مستقل عن الإدخال اليدوي.
 * auto A1 -> manual -> auto A2 ; expect A2 == A1 + 1 (manual entries don't shift the auto counter).
 * Writes 3 real entries.
 */
test.describe('Reference number mixing manual & auto', () => {
  test.setTimeout(300_000);
  test('TC-031: auto counter is unaffected by interleaved manual entries', async ({ page }) => {
    const j = new ManualJournalPage(page);
    const a1 = await j.createBalancedEntry({ tag: 'TC-031 auto-1' });
    console.log(`[TC-031] auto A1: id=${a1.id} ref="${a1.ref}"`);
    expect(a1.ref).toMatch(/^\d+$/);

    const man = await j.createBalancedEntry({ reference: `MAN-${Date.now()}`, tag: 'TC-031 manual' });
    console.log(`[TC-031] manual: id=${man.id} ref="${man.ref}"`);

    const a2 = await j.createBalancedEntry({ tag: 'TC-031 auto-2' });
    console.log(`[TC-031] auto A2: id=${a2.id} ref="${a2.ref}"`);
    expect(a2.ref).toMatch(/^\d+$/);

    expect(parseInt(a2.ref, 10), 'auto A2 = auto A1 + 1 (manual did not consume an auto number)')
      .toBe(parseInt(a1.ref, 10) + 1);
  });
});
