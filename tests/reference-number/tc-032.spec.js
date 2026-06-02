// @ts-check
const { test, expect } = require('@playwright/test');
const { ManualJournalPage } = require('../../pages/ManualJournalPage');

/**
 * TC-032: إدخال رقم يدوي يطابق الرقم التالي في التسلسل التلقائي → العدّاد يتقدّم بعده.
 * auto A (nA) -> manual = nA+1 (the next auto value) -> auto B ; expect B == nA+2.
 * (Design: a manual value matching the next auto number is accepted and the counter advances past it.)
 * Writes 3 real entries.
 */
test.describe('Reference number manual matches next auto', () => {
  test.setTimeout(300_000);
  test('TC-032: manual value equal to next auto advances the counter past it', async ({ page }) => {
    const j = new ManualJournalPage(page);
    const a = await j.createBalancedEntry({ tag: 'TC-032 auto-A' });
    console.log(`[TC-032] auto A: id=${a.id} ref="${a.ref}"`);
    expect(a.ref).toMatch(/^\d+$/);

    const nA = parseInt(a.ref, 10);
    const manualVal = String(nA + 1).padStart(a.ref.length, '0'); // the would-be next auto number
    const m = await j.createBalancedEntry({ reference: manualVal, tag: 'TC-032 manual=next' });
    console.log(`[TC-032] manual(next): typed="${manualVal}" id=${m.id} ref="${m.ref}"`);
    expect(m.ref).toBe(manualVal);

    const b = await j.createBalancedEntry({ tag: 'TC-032 auto-B' });
    console.log(`[TC-032] auto B: id=${b.id} ref="${b.ref}"`);
    expect(parseInt(b.ref, 10), 'auto B continues AFTER the manually-entered matching number')
      .toBe(nA + 2);
  });
});
