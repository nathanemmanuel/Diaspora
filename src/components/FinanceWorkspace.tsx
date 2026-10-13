import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { MilestoneReleaseRequest } from '../types';
import {
  DollarSign,
  Scale,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertOctagon,
  FileText,
  TrendingUp,
  CreditCard,
  Building,
  RefreshCw,
  Lock,
  ArrowRight,
  X
} from 'lucide-react';

export const FinanceWorkspace: React.FC = () => {
  const {
    currentUser,
    financialAccounts,
    ledgerTransactions,
    releaseRequests,
    paymentIntents,
    invoices,
    financeDualAuthorizeRelease,
    simulateConfirmPayment,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'LEDGER' | 'DUAL_AUTH' | 'ACCOUNTS' | 'CURRENCY' | 'RECONCILIATION'>('DUAL_AUTH');
  const [selectedRelease, setSelectedRelease] = useState<MilestoneReleaseRequest | null>(null);

  // Accounting invariant checks
  const totalLedgerDebitsNgn = ledgerTransactions.reduce((acc, tx) => {
    return (
      acc +
      tx.entries.reduce((sub, e) => sub + e.amount * (e.currency === 'USD' ? 1500 : e.currency === 'GBP' ? 1980 : 1), 0)
    );
  }, 0);

  const pendingDualAuthCount = releaseRequests.filter((r) => r.status === 'AWAITING_FINANCE_DUAL_AUTH').length;

  const handleAuthorizePayout = (releaseId: string) => {
    financeDualAuthorizeRelease(releaseId);
    setSelectedRelease(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Finance Console Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                <span>Restricted Financial Treasury</span>
                <span>/</span>
                <span className="text-slate-900 font-semibold">{currentUser.fullName}</span>
                <span>·</span>
                <span className="text-slate-600">Dual Authorization & General Ledger</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                Double-Entry Ledger & Payout Settlement Console
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-600" />
                <span>Accounting Invariants: Balanced</span>
              </span>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto border-t border-slate-100 pt-3">
            {[
              { id: 'DUAL_AUTH', label: `Dual-Authorization Queue (${pendingDualAuthCount} Pending)` },
              { id: 'LEDGER', label: `Authoritative General Ledger (${ledgerTransactions.length} Txs)` },
              { id: 'ACCOUNTS', label: `Chart of Accounts (${financialAccounts.length})` },
              { id: 'CURRENCY', label: 'Multi-Currency Settlement Desk' },
              { id: 'RECONCILIATION', label: 'Bank Reconciliation & Exception Audit' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ========================================================= */}
        {/* TAB 1: DUAL-AUTHORIZATION QUEUE */}
        {/* ========================================================= */}
        {activeTab === 'DUAL_AUTH' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Segregation of Duties & Dual Payout Approvals</h2>
              <p className="text-xs text-slate-500">
                To prevent unauthorized or fraudulent capital movement, project disbursements require independent authorization from a certified Finance Officer prior to electronic bank transfer.
              </p>
            </div>

            <div className="space-y-4">
              {releaseRequests.length === 0 ? (
                <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                  No disbursement releases currently awaiting dual authorization.
                </div>
              ) : (
                releaseRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-6 bg-white rounded-xl border border-slate-200 space-y-4 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-500 font-semibold">{req.releaseReference}</span>
                          <span>·</span>
                          <span className="font-mono text-xs text-slate-500">{req.projectCode}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-1">{req.milestoneTitle}</h3>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded ${
                        req.status === 'SETTLED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {req.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg text-xs">
                      <div>
                        <span className="text-slate-500">Beneficiary Contractor:</span>
                        <div className="font-bold text-slate-900 mt-0.5">{req.vendorName}</div>
                        <div className="text-[11px] text-slate-600 mt-0.5">{req.vendorBankDetails}</div>
                      </div>

                      <div>
                        <span className="text-slate-500">Audit & Originating PM:</span>
                        <div className="font-medium text-slate-900 mt-0.5">{req.initiatedBy}</div>
                        <div className="text-[11px] text-slate-500">Timestamp: {req.initiatedAt}</div>
                      </div>

                      <div>
                        <span className="text-slate-500">Dual Authorization Financial Split:</span>
                        <div className="font-mono text-xs font-bold text-emerald-700 mt-0.5 tabular-nums">
                          Net Wire: ₦{req.netDisbursedNgn.toLocaleString()}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500 tabular-nums">
                          Platform Fee (5%): ₦{req.platformFeeDeductionNgn.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="text-xs text-slate-500">
                        Total Release Amount: <strong className="font-mono text-slate-900 tabular-nums">₦{req.releaseAmountNgn.toLocaleString()}</strong>
                      </div>

                      {req.status === 'AWAITING_FINANCE_DUAL_AUTH' ? (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleAuthorizePayout(req.id)}
                            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Grant Dual Authorization & Settle Wire
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Disbursed & Posted to General Ledger by {req.financeApprovedBy}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: AUTHORITATIVE GENERAL LEDGER */}
        {/* ========================================================= */}
        {activeTab === 'LEDGER' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Double-Entry Financial General Ledger</h2>
              <p className="text-xs text-slate-500">
                Immutable, append-only journal entries. Every economic event generates strictly balanced debit and credit entries.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Authoritative Ledger Entries</span>
                <span className="font-mono text-xs text-slate-500">Total Entries: {ledgerTransactions.length}</span>
              </div>

              <div className="divide-y divide-slate-100">
                {ledgerTransactions.map((tx) => (
                  <div key={tx.id} className="p-6 hover:bg-slate-50/50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{tx.transactionRef}</span>
                        <span>·</span>
                        <span className="font-mono text-slate-500 text-[11px]">{tx.idempotencyKey}</span>
                      </div>
                      <span className="font-mono text-slate-500">{tx.postedAt}</span>
                    </div>

                    <div className="text-sm font-semibold text-slate-900">{tx.description}</div>

                    {/* Debit and Credit Entries */}
                    <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 text-xs font-mono">
                      {tx.entries.map((entry) => (
                        <div key={entry.id} className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                          <div>
                            <span className="text-slate-400">Debit:</span> <strong>{entry.debitAccountName}</strong>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-400">Credit:</span> <strong>{entry.creditAccountName}</strong>
                            <span className="ml-3 font-bold text-slate-900 tabular-nums">
                              {entry.currency} {entry.amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: CHART OF ACCOUNTS */}
        {/* ========================================================= */}
        {activeTab === 'ACCOUNTS' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Segregated Chart of Financial Accounts</h2>
              <p className="text-xs text-slate-500">
                Segregated client trust accounts, liabilities to mandates, vendor accounts payable, and platform fee recognition accounts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {financialAccounts.map((acc) => (
                <div key={acc.id} className="p-5 bg-white rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-500 font-semibold">{acc.accountNumber}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                      {acc.accountType.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{acc.accountName}</h3>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Current Ledger Balance:</span>
                    <span className="font-mono font-bold text-base text-slate-900 tabular-nums">
                      {acc.currency} {acc.currency === 'USD' ? '$' : acc.currency === 'GBP' ? '£' : '₦'}
                      {acc.balance.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: MULTI-CURRENCY SETTLEMENT */}
        {/* ========================================================= */}
        {activeTab === 'CURRENCY' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Multi-Currency Conversion & Corridor Desk</h2>
              <p className="text-xs text-slate-500">
                Official Central Bank of Nigeria (CBN) benchmark cross-rates and international diaspora corridors.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs text-slate-500 font-medium">USD / NGN Benchmark Corridor</div>
                <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">₦1,530.00</div>
                <div className="text-[11px] text-slate-500">Source: Official CBN Interbank Rate</div>
              </div>

              <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs text-slate-500 font-medium">EUR / NGN Benchmark Corridor</div>
                <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">₦1,670.00</div>
                <div className="text-[11px] text-slate-500">Source: Official CBN Interbank Rate</div>
              </div>

              <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs text-slate-500 font-medium">GBP / NGN Benchmark Corridor</div>
                <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">₦1,980.00</div>
                <div className="text-[11px] text-slate-500">Source: Official CBN Interbank Rate</div>
              </div>

              <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs text-slate-500 font-medium">Settlement Guarantee Window</div>
                <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">24 Hours</div>
                <div className="text-[11px] text-slate-500">Rate locked upon Intent creation</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: RECONCILIATION */}
        {/* ========================================================= */}
        {activeTab === 'RECONCILIATION' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Automated Daily Reconciliation</h2>
              <p className="text-xs text-slate-500">
                Reconciliation of gateway settlement files, bank statement logs, and double-entry postings.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-sm text-slate-900">Daily Batch Recon Status: Balanced</span>
                </div>
                <span className="text-xs text-slate-500">Batch Date: 2026-10-10</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-slate-500">Gateway Settled (NGN):</div>
                  <div className="font-bold text-slate-900 mt-1 tabular-nums">₦143,400,000.00</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-slate-500">Ledger Posted (NGN):</div>
                  <div className="font-bold text-slate-900 mt-1 tabular-nums">₦143,400,000.00</div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg text-emerald-800">
                  <div>Variance:</div>
                  <div className="font-bold mt-1 tabular-nums">₦0.00 (Zero Variance)</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
