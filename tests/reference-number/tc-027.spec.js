// @ts-check
const { test, expect } = require('@playwright/test');
const { ManualJournalPage } = require('../../pages/ManualJournalPage');
const { SettingsPage } = require('../../pages/SettingsPage');

/**
 * TC-027: التوليد التلقائي يبقى فريداً حتى لو كان السماح بالتكرار = ON.
 * Sets duplicate ON, creates 5 auto entries, asserts all generated references are unique. Restores setting.
 * Writes 5 real entries + toggles a global setting (restored in finally).
 */
test.describe('Auto generation stays unique', () => {
  test.setTimeout(500_000);
  test('TC-027: auto-generated references are unique even when duplicates are allowed', async ({ page }) => {
    const s = new SettingsPage(page);
    const j = new ManualJournalPage(page);
    const original = await s.readDuplicateAllowed();
    try {
      await s.setDuplicateAllowed('1');
      const refs = [];
      for (let i = 1; i <= 5; i++) {
        const r = await j.createBalancedEntry({ tag: `TC-027 #${i}` });
        console.log(`[TC-027] #${i}: id=${r.id} ref="${r.ref}"`);
        expect(r.success).toBe(true);
        refs.push(r.ref);
      }
      const unique = new Set(refs);
      console.log(`[TC-027] refs=${JSON.stringify(refs)} unique=${unique.size}`);
      expect(unique.size, 'all 5 auto-generated references must be unique').toBe(5);
    } finally {
      await s.setDuplicateAllowed(original);
      console.log(`[TC-027] restored duplicate_reference_number=${original}`);
    }
  });
});
