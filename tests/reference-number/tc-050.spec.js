// @ts-check
const { test, expect } = require('@playwright/test');
const { ManualJournalPage } = require('../../pages/ManualJournalPage');

/**
 * TC-050: حقن XSS في الرقم المرجعي اليدوي — يُخزَّن/يُعرض كنص بدون تنفيذ.
 * Enter a <script> payload as the manual reference, save, and assert NO script executes
 * (no dialog), and the entry saves. Writes 1 real entry.
 */
test.describe('Reference number XSS safety', () => {
  test.setTimeout(150_000);
  test('TC-050: a <script> payload in the manual reference is not executed', async ({ page }) => {
    let dialogFired = false;
    page.on('dialog', async (d) => { dialogFired = true; await d.dismiss().catch(() => {}); });

    const j = new ManualJournalPage(page);
    const payload = `<script>alert('XSS')</script>`;
    const r = await j.createBalancedEntry({ reference: payload, tag: 'TC-050 xss' });
    console.log(`[TC-050] payload saved as ref="${r.ref}" success=${r.success}`);

    // re-open the saved entry's list/detail context is implicit in read-back; ensure no execution
    await page.waitForTimeout(1000);
    expect(r.success, 'entry should save').toBe(true);
    expect(dialogFired, 'no script/dialog should execute (output must be escaped)').toBe(false);
    expect(r.ref, 'the payload text is retained (escaped or literal), not silently dropped').toMatch(/script/i);
  });
});
