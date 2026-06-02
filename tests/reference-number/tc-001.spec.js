// @ts-check
const { test, expect } = require('@playwright/test');
const { ManualJournalPage } = require('../../pages/ManualJournalPage');

/**
 * TC-001: توليد رقم مرجعي تلقائي عند ترك الحقل فارغاً
 *
 * Prerequisite (assumed already configured in the test ERP):
 *   - Logged in as accountant (handled by auth.setup.js).
 *   - Reference-number prefix empty (auto numbers come back as plain digits e.g. "0007").
 *
 * Steps:
 *   1. Open the manual journal entry creation modal.
 *   2. Fill a balanced entry (debit الصندوق / credit مصروفات تسويقية = 100) and
 *      leave the reference number field EMPTY.
 *   3. Submit.
 *
 * Expected:
 *   - Entry is saved (POST returns success + a new entry id).
 *   - The system auto-generates a non-empty reference number for the saved entry.
 *
 * NOTE: this test WRITES a real journal entry to the test ERP each run.
 */
test.describe('Reference number auto-generation', () => {
  // The flow uses a remote modal + Select2 AJAX + read-back fetch; allow headroom.
  test.setTimeout(150_000);

  test('TC-001: auto-generates a reference number when the field is left empty', async ({ page }) => {
    const journal = new ManualJournalPage(page);

    // --- Arrange / Act
    await journal.openCreateModal();
    await journal.dismissOverlays();

    // reference field must start empty (so auto-gen kicks in)
    expect(await journal.referenceValue(), 'reference field should start empty').toBe('');

    const debit = await journal.pickAccount(1, 'الصندوق');
    expect(debit.val, 'debit account (الصندوق) should resolve to id 44').toBe('44');
    await journal.fillDebitRow(1, { amount: '100', statement: 'TC-001 توليد رقم مرجعي تلقائي - مدين' });

    const credit = await journal.pickAccount(2, 'مصروفات تسويقية');
    expect(credit.val, 'credit account (مصروفات تسويقية) should resolve to id 129').toBe('129');
    await journal.fillCreditRow(2, { amount: '100', statement: 'TC-001 توليد رقم مرجعي تلقائي - دائن' });

    // confirm the entry is balanced before submitting
    expect(await journal.totalDebit.inputValue()).toBe('100');
    expect(await journal.totalCredit.inputValue()).toBe('100');

    const res = await journal.submit();

    // --- Assert: saved
    expect(res.success, 'submit should report success').toBe(true);
    expect(res.id, 'submit should return a new entry id').not.toBe('');

    // --- Assert: a reference number was auto-generated
    const ref = await journal.readReferenceNumber(res.id);
    console.log(`[TC-001] entry id=${res.id} -> auto reference number = "${ref}"`);
    expect(ref, 'auto-generated reference number must not be empty').not.toBe('');
  });
});
