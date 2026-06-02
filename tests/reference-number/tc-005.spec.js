// @ts-check
const { test, expect } = require('@playwright/test');
const { ManualJournalPage } = require('../../pages/ManualJournalPage');

/**
 * TC-005: التوليد التلقائي بعد قيد يدوي يُكمل تسلسل التوليد التلقائي، لا قيمة اليدوي
 *
 * Sequence:
 *   1. Create an AUTO entry            -> refA (numeric, the auto counter)
 *   2. Create a MANUAL entry with a non-numeric reference (e.g. JV-MAN-...)
 *      that cannot match the numeric auto sequence.
 *   3. Create another AUTO entry       -> refB
 *
 * Expected: refB == refA + 1. The intervening manual (non-matching) reference
 * does NOT disturb the auto sequence — it continues from the auto counter, not
 * from the manual value. (See design memory: a manual value only advances the
 * counter when it MATCHES the next auto number.)
 *
 * NOTE: writes 3 real journal entries to the test ERP per run.
 */
test.describe('Reference number auto-after-manual', () => {
  test.setTimeout(300_000);

  test('TC-005: auto-generation after a manual entry continues the auto sequence', async ({ page }) => {
    const journal = new ManualJournalPage(page);

    const a = await journal.createBalancedEntry({ tag: 'TC-005 auto-A' });
    console.log(`[TC-005] auto A: id=${a.id} ref="${a.ref}"`);
    expect(a.ref, 'auto A must be numeric').toMatch(/^\d+$/);

    const manualRef = `JV-MAN-${Date.now()}`;
    const m = await journal.createBalancedEntry({ reference: manualRef, tag: 'TC-005 manual' });
    console.log(`[TC-005] manual: id=${m.id} typed="${manualRef}" ref="${m.ref}"`);
    expect(m.ref, 'manual reference kept verbatim').toBe(manualRef);

    const b = await journal.createBalancedEntry({ tag: 'TC-005 auto-B' });
    console.log(`[TC-005] auto B: id=${b.id} ref="${b.ref}"`);
    expect(b.ref, 'auto B must be numeric').toMatch(/^\d+$/);

    expect(parseInt(b.ref, 10), 'auto B continues the auto sequence (A + 1), unaffected by the manual entry')
      .toBe(parseInt(a.ref, 10) + 1);
  });
});
