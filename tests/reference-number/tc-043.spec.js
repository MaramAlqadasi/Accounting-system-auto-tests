// @ts-check
const { test, expect } = require('@playwright/test');
const { ManualJournalPage } = require('../../pages/ManualJournalPage');

/**
 * TC-043: البحث بالرقم المرجعي (كامل) — يُرجع المطابقة، ولا يُرجع رقماً غير موجود.
 * Create an entry with a unique reference, then query the account statement filtered
 * by that reference (the getdetailsnew endpoint accepts a bone_number filter).
 * Writes 1 real entry.
 */
test.describe('Reference number search', () => {
  test.setTimeout(150_000);
  test('TC-043: filtering the statement by reference returns the match and excludes non-matches', async ({ page }) => {
    const j = new ManualJournalPage(page);
    const ref = `SRCH-${Date.now()}`;
    const r = await j.createBalancedEntry({ reference: ref, tag: 'TC-043' });
    console.log(`[TC-043] created id=${r.id} ref="${r.ref}"`);
    expect(r.success).toBe(true);

    const hit = await j.accountStatementBody(44, ref);
    expect(hit, 'searching by the exact reference must return the entry').toContain(ref);

    const miss = await j.accountStatementBody(44, `NOPE-${Date.now()}-x`);
    expect(miss, 'searching by a non-existent reference must NOT return our entry').not.toContain(ref);
    console.log('[TC-043] exact-match found, non-existent search excluded it ✔');
  });
});
