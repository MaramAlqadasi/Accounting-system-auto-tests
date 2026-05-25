// @ts-check
const { test, expect } = require('@playwright/test');
const { ManualJournalPage } = require('../../pages/ManualJournalPage');

/**
 * TC-001: توليد رقم مرجعي تلقائي عند ترك الحقل فارغاً
 *
 * Prerequisite (set up manually in the ERP before running):
 *   - Logged in as accountant (handled by auth.setup.js)
 *   - Branch sequencing disabled
 *   - Reference number prefix empty
 *
 * Steps:
 *   1. Open the manual journal entry creation screen.
 *   2. Fill all required fields EXCEPT the reference number.
 *   3. Click save.
 *
 * Expected:
 *   - Entry saved successfully.
 *   - System auto-generates a reference number that is the next in sequence
 *     (last entry's number + 1).
 *
 * NOTE: Selectors in ManualJournalPage are TODO placeholders. This test will
 * fail until Maram runs `npm run codegen` and updates them. The failure
 * itself is a useful signal that the auth pipeline works.
 */
test.describe('Reference number auto-generation', () => {
  test('TC-001: auto-generates reference number when field left empty', async ({ page, request }) => {
    const journal = new ManualJournalPage(page);

    // --- Arrange: capture the last reference number BEFORE creating the entry.
    // TODO: implement getLastReferenceNumber() once the journal list page
    // selectors are known. For now we use a placeholder that the test will
    // skip if not implemented.
    const lastRef = await getLastReferenceNumberPlaceholder(page);

    // --- Act
    await journal.goto();
    await journal.fillRequiredFieldsExceptReference({
      date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
      description: 'TC-001 اختبار توليد رقم مرجعي تلقائي',
      debitAccount: 'الصندوق',  // TODO: confirm a valid account label
      creditAccount: 'المبيعات', // TODO: confirm a valid account label
      amount: '100.00',
    });
    await journal.save();

    // --- Assert
    await journal.expectSaveSuccess();
    const newRef = await journal.getSavedReferenceNumber();

    expect(newRef, 'auto-generated reference number must not be empty').not.toBe('');

    if (lastRef !== null) {
      const lastNum = parseInt(lastRef, 10);
      const newNum = parseInt(newRef, 10);
      expect(newNum, 'new reference number should be last + 1').toBe(lastNum + 1);
    } else {
      console.warn('[TC-001] Could not capture last reference number — only verified non-empty.');
    }
  });
});

/**
 * Placeholder: returns the last reference number currently in the system, or
 * null if not yet implemented.
 *
 * TODO: replace with a real implementation once Maram identifies the
 * journal-entry list page (likely /accounting/journal_entries or similar).
 * Suggested approach: navigate to the list, sort desc by date, read the
 * first row's reference-number cell.
 */
async function getLastReferenceNumberPlaceholder(page) {
  return null;
}
