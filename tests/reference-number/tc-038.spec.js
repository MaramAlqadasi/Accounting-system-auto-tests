// @ts-check
const { test, expect } = require('@playwright/test');
const { ManualJournalPage } = require('../../pages/ManualJournalPage');

/**
 * TC-038: قيد بتاريخ سابق (Backdated) — الترقيم يتبع ترتيب الإدخال لا تاريخ القيد.
 * auto A1 (today) -> auto A2 with a past date ; expect A2 == A1 + 1.
 * Writes 2 real entries.
 */
test.describe('Reference number backdated entry', () => {
  test.setTimeout(200_000);
  test('TC-038: a backdated entry still gets the next sequential number (by insertion order)', async ({ page }) => {
    const j = new ManualJournalPage(page);
    const a1 = await j.createBalancedEntry({ tag: 'TC-038 today' });
    console.log(`[TC-038] today: id=${a1.id} ref="${a1.ref}"`);
    expect(a1.ref).toMatch(/^\d+$/);

    const a2 = await j.createBalancedEntry({ date: '05-01-2026 10:00', tag: 'TC-038 backdated' });
    console.log(`[TC-038] backdated(05-01-2026): id=${a2.id} ref="${a2.ref}"`);
    expect(a2.ref).toMatch(/^\d+$/);

    expect(parseInt(a2.ref, 10), 'backdated entry = previous + 1 (sequence follows insertion order, not date)')
      .toBe(parseInt(a1.ref, 10) + 1);
  });
});
