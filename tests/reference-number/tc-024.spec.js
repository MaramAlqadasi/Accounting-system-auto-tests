// @ts-check
const { test, expect } = require('@playwright/test');
const { ManualJournalPage } = require('../../pages/ManualJournalPage');
const { SettingsPage } = require('../../pages/SettingsPage');

/**
 * TC-024: تغيير السماح بالتكرار من ON إلى OFF — القيود المكررة القديمة تبقى، والمحاولات الجديدة تُرفض.
 * With duplicates ON, create the same reference twice (both accepted). Switch to OFF, try the same
 * reference again -> rejected. Restores the original setting.
 * Writes 2-3 real entries + toggles a global setting (restored in finally).
 */
test.describe('Duplicate setting transition ON->OFF', () => {
  test.setTimeout(400_000);
  test('TC-024: existing duplicates remain but new duplicates are rejected after disabling', async ({ page }) => {
    const s = new SettingsPage(page);
    const j = new ManualJournalPage(page);
    const original = await s.readDuplicateAllowed();
    const ref = `TRANS-${Date.now()}`;
    try {
      await s.setDuplicateAllowed('1');
      const a = await j.createBalancedEntry({ reference: ref, tag: 'TC-024 dup-A' });
      const b = await j.createBalancedEntry({ reference: ref, tag: 'TC-024 dup-B' });
      console.log(`[TC-024] while ON: a=${a.success} b=${b.success}`);
      expect(a.success && b.success, 'both duplicates accepted while ON').toBe(true);

      await s.setDuplicateAllowed('0');
      const c = await j.createBalancedEntry({ reference: ref, tag: 'TC-024 dup-C after OFF' });
      console.log(`[TC-024] after OFF: c=${c.success} message="${c.message}"`);
      expect(c.success, 'a new duplicate is rejected after disabling duplicates').toBe(false);

      // the two old duplicates must still exist in the account statement
      const body = await j.accountStatementBody(44, ref);
      expect(body, 'pre-existing duplicate entries remain after disabling the setting').toContain(ref);
    } finally {
      await s.setDuplicateAllowed(original);
      console.log(`[TC-024] restored duplicate_reference_number=${original}`);
    }
  });
});
