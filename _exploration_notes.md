# Exploration Notes — Manual Journal Entry Screen

## Status: NOT EXPLORED (shell access unavailable in scaffolding session)

The setup agent did not have permission to run shell commands, so live
exploration of the ERP (logging in via headless Chromium and dumping the nav
menu) could not be performed. The project was scaffolded based on the known
login selectors only.

## What Maram should do next

Run codegen to discover the manual journal entry page selectors:

```powershell
cd C:\Users\Maram\playwright-tests
npm install
npx playwright install chromium
npx playwright codegen https://acc.devsub.smartlifesys.online
```

In the codegen window:

1. Log in with company=test_maram2, user=test_maram2, pass=12345678.
2. Click the navigation item that leads to manual journal entry creation
   (Arabic: قيد يدوي / إضافة قيد / قيود محاسبية).
3. Note the URL of the manual journal entry form — paste it into
   `pages/ManualJournalPage.js` as `this.url`.
4. For each form field below, copy the selector codegen generates:
   - Reference number input (الرقم المرجعي)
   - Date input (التاريخ)
   - Description / narration (البيان)
   - Debit account (حساب مدين)
   - Credit account (حساب دائن)
   - Amount (المبلغ)
   - Save button (حفظ)
5. After saving, observe what the success indicator looks like (toast?
   redirect to a detail page? a banner?) and update `successMessage` and
   `savedReferenceNumber` accordingly.

## Best guesses (based on the ERP's existing routing patterns)

From memory, the ERP uses paths like:
- `/accounting/index`
- `/accounting/accounts`
- `/accounting/details/{id}`
- `/accounting/customers_balances`

So the manual journal entry page is **likely** one of:
- `/accounting/journal_entries/new`
- `/accounting/manual_entry`
- `/accounting/entries/new`

These are guesses only — confirm via codegen.

## Fields that will need real account labels

TC-001 uses placeholder account names ("الصندوق", "المبيعات"). Maram should
replace these with two valid account names from her test_maram2 chart of
accounts. If the account picker is a typeahead/search rather than a
`<select>`, the `selectOption` calls in `ManualJournalPage.js` must change
to `fill` + click-on-suggestion.
