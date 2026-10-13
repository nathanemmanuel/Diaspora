# DiasporaTrust Financial Workflows & Ledger Invariants

## 1. Double-Entry Accounting Model

DiasporaTrust enforces strict double-entry bookkeeping across all client and operational funds. Every financial event generates balanced debit and credit entries.

### Chart of Accounts Structure:
- `1000-USD-CLIENT-SEGREGATED` (Asset): Segregated USD client funds held in commercial trust accounts.
- `1010-NGN-CLIENT-SEGREGATED` (Asset): Segregated NGN client operational funds in Nigerian banking partners.
- `1020-OPERATIONAL-CLEARING` (Asset): Payment gateway in-flight settlement clearing.
- `2000-CLIENT-MANDATE-LIABILITY` (Liability): Platform obligation to client mandates.
- `2010-VENDOR-ACCOUNTS-PAYABLE` (Liability): Contractor and vendor approved liabilities.
- `4000-PLATFORM-FEE-REVENUE` (Revenue): DiasporaTrust 5% project management earned fees.
- `4010-ADVISORY-FEE-REVENUE` (Revenue): DiasporaTrust professional consultation retainers.

### Invariant Rules:
1. `Sum(Debits) == Sum(Credits)` for every `LedgerTransaction`.
2. Posted transactions are immutable; corrections require compensating reversal transactions.
3. Client balances are dynamically derived from ledger entries, not an editable single database column.

---

## 2. Segregation of Duties (Dual Authorization Workflow)

1. **Submission**: Contractor completes physical work and submits dated GPS-tagged evidence.
2. **QA Inspection**: COREN-certified Project Manager inspects work on site, records technical notes, and issues QA verification.
3. **Client Approval**: Client reviews inspection photos, lab reports, and GPS logs in their portal, then authorizes milestone sign-off.
4. **Disbursement Initiation**: Lead PM initiates a `MilestoneReleaseRequest` specifying contractor bank details, gross amount, and 5% platform fee deduction.
5. **Dual Authorization (Finance)**: A certified Finance Officer independently reviews the authorization queue and approves the wire instruction.
6. **Ledger Posting**: The release is marked `SETTLED`, funds are deducted from the segregated bank account, the client mandate obligation is reduced, platform fee is credited to Revenue, and the milestone is flagged as paid.
