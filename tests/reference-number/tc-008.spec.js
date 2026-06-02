// @ts-check
const { test, expect } = require('@playwright/test');
const { ManualJournalPage } = require('../../pages/ManualJournalPage');
const { SettingsPage } = require('../../pages/SettingsPage');

/**
 * TC-008: تغيير صيغة الرقم المرجعي لا يُعيد ضبط العدّاد (التسلسل يستمر).
 * The system has no free-text prefix; the closest lever is #reference_format. This test proves the
 * underlying counter is NOT reset when the format changes:
 *   format=3 -> auto A (numeric N)
 *   format=1 (YEAR/Sequence) -> auto B (structured)
 *   format=3 -> auto C (numeric) ; expect C > A  (sequence continued across the format change).
 * Restores the original format. Writes 3 real entries + changes a global setting (restored in finally).
 */
test.describe('Reference format change keeps the sequence', () => {
  test.setTimeout(400_000);
  test('TC-008: changing the reference format does not reset the sequence counter', async ({ page }) => {
    const s = new SettingsPage(page);
    const j = new ManualJournalPage(page);
    const original = await s.readReferenceFormat();
    try {
      await s.setReferenceFormat('3');
      const a = await j.createBalancedEntry({ tag: 'TC-008 fmt3-A' });
      console.log(`[TC-008] fmt3 A: ref="${a.ref}"`);
      expect(a.ref).toMatch(/^\d+$/);

      await s.setReferenceFormat('1'); // YEAR/Sequence
      const b = await j.createBalancedEntry({ tag: 'TC-008 fmt1-B' });
      console.log(`[TC-008] fmt1 B: ref="${b.ref}"`);
      expect(b.success).toBe(true);

      await s.setReferenceFormat('3');
      const c = await j.createBalancedEntry({ tag: 'TC-008 fmt3-C' });
      console.log(`[TC-008] fmt3 C: ref="${c.ref}"`);
      expect(c.ref).toMatch(/^\d+$/);

      expect(parseInt(c.ref, 10), 'sequence continued across format changes (counter not reset)')
        .toBeGreaterThan(parseInt(a.ref, 10));
    } finally {
      await s.setReferenceFormat(original);
      console.log(`[TC-008] restored reference_format=${original}`);
    }
  });
});
