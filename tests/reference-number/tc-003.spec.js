// @ts-check
const { test, expect } = require('@playwright/test');
const { ManualJournalPage } = require('../../pages/ManualJournalPage');

/**
 * TC-003: ثلاثة قيود تلقائية متتالية تتزايد بمقدار 1 بدون فجوات
 *
 * Create 3 consecutive auto entries (reference left empty) and assert the
 * auto-generated reference numbers are numeric, strictly increasing, and each
 * is exactly the previous + 1 (no gaps).
 *
 * NOTE: writes 3 real journal entries to the test ERP per run.
 */
test.describe('Reference number sequence', () => {
  test.setTimeout(300_000);

  test('TC-003: three consecutive auto entries increment by 1 with no gaps', async ({ page }) => {
    const journal = new ManualJournalPage(page);
    const refs = [];

    for (let i = 1; i <= 3; i++) {
      const r = await journal.createBalancedEntry({ tag: `TC-003 #${i}` });
      console.log(`[TC-003] entry ${i}: id=${r.id} ref="${r.ref}"`);
      expect(r.success, `entry ${i} should save`).toBe(true);
      expect(r.ref, `entry ${i} reference must not be empty`).not.toBe('');
      expect(r.ref, `entry ${i} reference must be numeric`).toMatch(/^\d+$/);
      refs.push(parseInt(r.ref, 10));
    }

    console.log(`[TC-003] sequence: ${refs.join(' -> ')}`);
    expect(refs[1], 'second = first + 1').toBe(refs[0] + 1);
    expect(refs[2], 'third = second + 1').toBe(refs[1] + 1);
  });
});
