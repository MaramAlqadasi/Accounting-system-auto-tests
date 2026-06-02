// @ts-check
const { test, expect } = require('@playwright/test');
const { SettingsPage } = require('../../pages/SettingsPage');

/**
 * SETTINGS SMOKE: prove that SettingsPage can read, change, and RESTORE a global
 * setting on the shared system without leaving it altered. Run this before the
 * settings-mutating Group B tests. Toggles duplicate_reference_number and puts it back.
 */
test.describe('Settings round-trip (smoke)', () => {
  test.setTimeout(180_000);
  test('can read, change, and restore duplicate_reference_number', async ({ page }) => {
    const s = new SettingsPage(page);
    const original = await s.readDuplicateAllowed();
    console.log(`[smoke] original duplicate_reference_number = ${original}`);
    expect(['0', '1']).toContain(String(original));

    const flipped = String(original) === '1' ? '0' : '1';
    try {
      const after = await s.setDuplicateAllowed(flipped);
      console.log(`[smoke] after set -> ${after}`);
      expect(String(after)).toBe(flipped);
    } finally {
      const restored = await s.setDuplicateAllowed(original);
      console.log(`[smoke] restored -> ${restored}`);
      expect(String(restored)).toBe(String(original));
    }
  });
});
