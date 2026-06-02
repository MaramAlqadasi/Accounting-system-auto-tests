// @ts-check
const { test, expect } = require('@playwright/test');
const { ManualJournalPage } = require('../../pages/ManualJournalPage');

/**
 * TC-042: ظهور الرقم المرجعي في تقرير/كشف القيود.
 * Create an entry (debit الصندوق id=44) with a unique reference, then read the
 * account statement (كشف الحساب) for account 44 and assert the reference appears
 * (the statement has a "Bond No" column = bone_number). Writes 1 real entry.
 */
test.describe('Reference number shows in report', () => {
  test.setTimeout(150_000);
  test('TC-042: the reference number appears in the account statement/report', async ({ page }) => {
    const j = new ManualJournalPage(page);
    const ref = `RPT-${Date.now()}`;
    const r = await j.createBalancedEntry({ reference: ref, tag: 'TC-042' });
    console.log(`[TC-042] created id=${r.id} ref="${r.ref}"`);
    expect(r.success).toBe(true);

    const body = await j.accountStatementBody(44);
    console.log(`[TC-042] statement body length=${body.length}, contains ref=${body.includes(ref)}`);
    expect(body, 'reference must appear in the account statement (Bond No column)').toContain(ref);
  });
});
