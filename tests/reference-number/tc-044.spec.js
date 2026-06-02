// @ts-check
const { test, expect } = require('@playwright/test');
const { ManualJournalPage } = require('../../pages/ManualJournalPage');

/**
 * TC-044: الرقم المرجعي في كشف الحساب يطابق رقم القيد الأصلي.
 * Create an entry that debits الصندوق (id=44) with a unique reference, then open the
 * account statement for account 44 and assert the reference (Bond No) is present and
 * matches what was saved. Writes 1 real entry.
 */
test.describe('Reference number in account statement', () => {
  test.setTimeout(150_000);
  test('TC-044: the reference in the account statement matches the saved entry', async ({ page }) => {
    const j = new ManualJournalPage(page);
    const ref = `STMT-${Date.now()}`;
    const r = await j.createBalancedEntry({ reference: ref, tag: 'TC-044' });
    console.log(`[TC-044] created id=${r.id} saved ref="${r.ref}"`);
    expect(r.success).toBe(true);
    expect(r.ref).toBe(ref);

    const body = await j.accountStatementBody(44);
    expect(body, 'the saved reference must appear in account 44 statement consistent with the entry').toContain(ref);
    console.log('[TC-044] reference is consistent between entry and account statement ✔');
  });
});
