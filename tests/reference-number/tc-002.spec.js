// @ts-check
const { test } = require('@playwright/test');

/**
 * TC-002: أول قيد على الإطلاق يبدأ من القيمة الافتراضية (1)
 *
 * NOT automatable against the shared test ERP: that system already contains
 * ~10,855+ journal entries, so the "first-ever entry" precondition (an empty
 * sequence) can never be reproduced without a fresh/reset database.
 *
 * To verify TC-002 you need an isolated, freshly-seeded environment where the
 * reference-number counter has never advanced. Run it there as a MANUAL check,
 * or wire it into a CI job that provisions a clean DB. Until such an environment
 * exists, this case is skipped (documented, not silently dropped).
 */
test.describe('Reference number first-ever entry', () => {
  test.skip('TC-002: first-ever entry starts from the default value (1) — needs a clean DB', async () => {
    // Intentionally empty: cannot satisfy the "empty sequence" precondition here.
  });
});
