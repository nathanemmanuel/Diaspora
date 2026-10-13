import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import {
  ShieldAlert,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Search,
  Scale,
  Building,
  UserCheck,
  Lock,
  Eye,
  X
} from 'lucide-react';

export const ComplianceWorkspace: React.FC = () => {
  const { currentUser, kycCases, auditLogs, disputes, verifyKycByCompliance } = useApp();

  const [activeTab, setActiveTab] = useState<'AUDIT' | 'KYC' | 'TITLE_SEARCH' | 'DISPUTES'>('AUDIT');
  const [selectedKycId, setSelectedKycId] = useState<string | null>(null);
  const [complianceNotes, setComplianceNotes] = useState('Enhanced due diligence completed. Proof of UK residency verified via utility bill and HMRC letter. BVN matched on NIBSS.');
  const [searchFilter, setSearchFilter] = useState('');

  const handleApproveKyc = (id: string) => {
    verifyKycByCompliance(id, complianceNotes);
    setSelectedKycId(null);
  };

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchFilter.toLowerCase()) ||
      log.actorEmail.toLowerCase().includes(searchFilter.toLowerCase()) ||
      log.summary.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Compliance Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                <span>Legal & Regulatory Risk Console</span>
                <span>/</span>
                <span className="text-slate-900 font-semibold">{currentUser.fullName}</span>
                <span>·</span>
                <span className="text-slate-600">Compliance & Title Due Diligence</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                Compliance, Land Registry & Audit Inspection
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-900 text-white rounded">
                Tamper-Evident Logging: Active
              </span>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto border-t border-slate-100 pt-3">
            {[
              { id: 'AUDIT', label: `Immutable Audit Log (${auditLogs.length} Events)` },
              { id: 'KYC', label: `KYC & AML Screening (${kycCases.length})` },
              { id: 'TITLE_SEARCH', label: 'Land Registry & Title Due Diligence' },
              { id: 'DISPUTES', label: `Dispute Arbitration (${disputes.length})` },
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* ========================================================= */}
        {/* TAB 1: AUDIT TRAIL */}
        {/* ========================================================= */}
        {activeTab === 'AUDIT' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Tamper-Evident System Audit Trail</h2>
                <p className="text-xs text-slate-500">
                  Cryptographically structured event logging for every security, financial, milestone, and administrative decision.
                </p>
              </div>

              <div className="relative w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by action, user or summary..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Timestamp</th>
                      <th className="px-6 py-3 font-semibold">Correlation ID</th>
                      <th className="px-6 py-3 font-semibold">Actor</th>
                      <th className="px-6 py-3 font-semibold">Action</th>
                      <th className="px-6 py-3 font-semibold">Resource</th>
                      <th className="px-6 py-3 font-semibold">Summary & Evidence Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{log.correlationId}</td>
                        <td className="px-6 py-4 font-sans font-medium text-slate-900 whitespace-nowrap">
                          {log.actorEmail}
                          <div className="text-[10px] text-slate-500">{log.actorRole}</div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">{log.action}</td>
                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                          {log.resourceType}:{log.resourceId}
                        </td>
                        <td className="px-6 py-4 font-sans text-xs text-slate-700 max-w-md leading-relaxed">
                          {log.summary}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: KYC & AML */}
        {/* ========================================================= */}
        {activeTab === 'KYC' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Identity & Proof of Address Queue</h2>
              <p className="text-xs text-slate-500">
                Tiered KYC screening: International Passports, NIBSS BVN Validation, Proof of Address in diaspora countries.
              </p>
            </div>

            <div className="space-y-4">
              {kycCases.map((k) => (
                <div key={k.id} className="p-6 bg-white rounded-xl border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{k.clientName}</h3>
                      <div className="text-xs text-slate-500">{k.email} · Resident: {k.idCountry}</div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded ${
                      k.status === 'VERIFIED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {k.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono p-4 bg-slate-50 rounded-lg">
                    <div>
                      <div className="text-slate-500 font-sans">KYC Tier:</div>
                      <div className="font-bold text-slate-900">{k.tier}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-sans">BVN Status:</div>
                      <div className="text-emerald-700 font-bold">{k.bvnMasked || 'N/A'} (Matched)</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-sans">Passport Ref:</div>
                      <div className="text-slate-800">{k.passportNumberMasked || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-sans">Diaspora Address:</div>
                      <div className="text-emerald-700 font-bold">
                        {k.addressVerified ? 'Verified' : 'Pending Proof'}
                      </div>
                    </div>
                  </div>

                  {k.reviewerNotes && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
                      <strong className="text-slate-800">Compliance Notes:</strong> {k.reviewerNotes}
                    </div>
                  )}

                  {k.status === 'UNDER_REVIEW' && (
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => setSelectedKycId(k.id)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                      >
                        Complete Enhanced Review
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: LAND REGISTRY TITLE DUE DILIGENCE */}
        {/* ========================================================= */}
        {activeTab === 'TITLE_SEARCH' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Land Title Registry Verification Dossiers</h2>
              <p className="text-xs text-slate-500">
                Official title search reports conducted at Lagos State Lands Bureau (Alausa, Ikeja) and Ogun State Bureau of Lands.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono text-xs text-slate-500 font-semibold">DT-PRJ-LK-008</span>
                    <h3 className="text-base font-bold text-slate-900">Lekki Phase 1 Residential Parcel</h3>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    CLEAN TITLE CONFIRMED
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Registry Location:</span>
                    <strong className="text-slate-800">Alausa Lands Registry, Ikeja</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Governor's Consent Ref:</span>
                    <span className="font-mono text-slate-800">GC-2021-9981-LAG</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Survey Plan Ref:</span>
                    <span className="font-mono text-slate-800">LS/D/BK-0928/2021</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Legal Counsel:</span>
                    <span className="text-slate-800">Banwo, Ighodalo & Partners</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-lg text-xs text-emerald-800 leading-relaxed border border-emerald-200/60">
                  Search certificate indicates zero pending lis pendens (court disputes), no government acquisition encumbrances, and valid unexpired 99-year leasehold.
                </div>
              </div>

              <div className="p-6 bg-white rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono text-xs text-slate-500 font-semibold">DT-PRJ-EP-031</span>
                    <h3 className="text-base font-bold text-slate-900">Epe Waterfront 1,200 sqm Parcel</h3>
                  </div>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    DUE DILIGENCE IN PROGRESS
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Registry Location:</span>
                    <strong className="text-slate-800">Alausa Lands Registry & Epe Zonal Office</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Survey Plan Ref:</span>
                    <span className="font-mono text-slate-800">OG/EP/2026-SV-44</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Seller Family:</span>
                    <span className="text-slate-800">Adeleke Royal Chieftaincy Family Estate</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Legal Counsel:</span>
                    <span className="text-slate-800">Templars Law Practice</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-800 leading-relaxed border border-amber-200">
                  Survey coordinates charted. Currently verifying family head power-of-attorney sign-offs and gazette excision boundary.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: DISPUTES */}
        {/* ========================================================= */}
        {activeTab === 'DISPUTES' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Dispute & Mediation Management Desk</h2>
              <p className="text-xs text-slate-500">
                Formal arbitration proceedings, contractor resolution records, and financial mediation.
              </p>
            </div>

            <div className="space-y-4">
              {disputes.map((d) => (
                <div key={d.id} className="p-6 bg-white rounded-xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-500 font-semibold">{d.disputeNumber}</span>
                      <span>·</span>
                      <span className="font-mono text-xs text-slate-500">{d.projectCode}</span>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded">
                      {d.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500">Raised by:</span> <strong>{d.raisedBy}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Category:</span> <strong>{d.category}</strong>
                    </div>
                    <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg">
                      "{d.description}"
                    </p>
                  </div>

                  {d.resolutionNotes && (
                    <div className="p-3 bg-emerald-50 rounded-lg text-xs text-emerald-800 leading-relaxed border border-emerald-200">
                      <strong>Resolution Outcome:</strong> {d.resolutionNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: KYC REVIEW */}
      {selectedKycId && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative border border-slate-200 space-y-4">
            <button
              onClick={() => setSelectedKycId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900">Approve KYC & AML Clearance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Certify that identity documents, sanctions screening, and proof of address meet regulatory criteria for mandate onboarding.
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Compliance Officer Audit Findings
              </label>
              <textarea
                rows={3}
                value={complianceNotes}
                onChange={(e) => setComplianceNotes(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedKycId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApproveKyc(selectedKycId)}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
              >
                Grant Full Clearance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
