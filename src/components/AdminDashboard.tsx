import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { useCurrency } from '../hooks/useCurrency';
import {
  Users,
  Briefcase,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  UserCheck,
  Shield,
  Search,
  Plus,
  Filter,
  Check,
  X
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    mandates,
    projects,
    milestones,
    vendors,
    kycCases,
    disputes,
    allUsers,
    addOperationsAdmin,
    revokeOperationsAdmin,
    setCurrentUser,
    verifyMilestoneInternal,
    initiateMilestoneRelease,
  } = useApp();

  const { format, currency } = useCurrency();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CLIENTS' | 'MANDATES' | 'EVIDENCE' | 'VENDORS' | 'OPERATIONS_ADMINS'>('OVERVIEW');
  const [evidenceVerifyModal, setEvidenceVerifyModal] = useState<string | null>(null);
  const [qaNotes, setQaNotes] = useState('Physical site inspection carried out. Reinforcement layout and concrete curing conforms to specifications.');

  // Operations Admins state
  const opsAdmins = allUsers.filter((u) => u.role === 'ADMIN_OPERATIONS');
  const isMainAdmin = currentUser.role === 'MAIN_ADMIN';
  const mainAdminUser = allUsers.find((u) => u.role === 'MAIN_ADMIN');

  const [addAdminModalOpen, setAddAdminModalOpen] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    fullName: '',
    email: '',
    assignedRegion: 'Lagos Island & Lekki Corridor',
    phone: '',
    permissions: ['EVIDENCE_VERIFY', 'MANDATE_OPERATIONS'],
  });
  const [adminFormError, setAdminFormError] = useState<string | null>(null);
  const [adminFormSuccess, setAdminFormSuccess] = useState<string | null>(null);

  // Unverified or submitted milestones
  const submittedMilestones = milestones.filter((m) => m.status === 'SUBMITTED_FOR_REVIEW');
  const clientApprovedMilestones = milestones.filter((m) => m.status === 'CLIENT_APPROVED' && !m.releasePaid);

  const handleVerifySubmission = (milestoneId: string) => {
    verifyMilestoneInternal(milestoneId, qaNotes, currentUser.fullName);
    setEvidenceVerifyModal(null);
  };

  const handleAddAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminFormData.fullName.trim() || !adminFormData.email.trim()) {
      setAdminFormError('Please provide both full name and official email.');
      return;
    }

    try {
      addOperationsAdmin({
        fullName: adminFormData.fullName.trim(),
        email: adminFormData.email.trim(),
        assignedRegion: adminFormData.assignedRegion,
        phone: adminFormData.phone.trim(),
        permissions: adminFormData.permissions,
      });

      setAdminFormSuccess(`Operations Admin ${adminFormData.fullName} added successfully.`);
      setAdminFormData({
        fullName: '',
        email: '',
        assignedRegion: 'Lagos Island & Lekki Corridor',
        phone: '',
        permissions: ['EVIDENCE_VERIFY', 'MANDATE_OPERATIONS'],
      });
      setTimeout(() => {
        setAddAdminModalOpen(false);
        setAdminFormSuccess(null);
        setAdminFormError(null);
      }, 1200);
    } catch (err: any) {
      setAdminFormError(err.message || 'Failed to add Operations Admin');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Admin Operations Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                <span>Internal Command Console</span>
                <span>/</span>
                <span className="text-slate-900 font-semibold">{currentUser.fullName}</span>
                <span>·</span>
                <span className="text-slate-600">
                  {isMainAdmin ? 'Main Admin & Fiduciary Trustee' : 'Operations & Field Supervision'}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                Diaspora Operations & Project Supervision Desk
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded border ${
                isMainAdmin
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {isMainAdmin ? 'Role: Main Admin (Super Authority)' : 'Role: Operations Admin'}
              </span>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto border-t border-slate-100 pt-3">
            {[
              { id: 'OVERVIEW', label: 'Executive Operations Overview' },
              { id: 'OPERATIONS_ADMINS', label: `Operations Admins (${opsAdmins.length})` },
              { id: 'CLIENTS', label: `Client Due Diligence & KYC (${kycCases.length})` },
              { id: 'MANDATES', label: `Mandate Operations (${mandates.length})` },
              { id: 'EVIDENCE', label: `Evidence Verification Queue (${submittedMilestones.length} Pending)` },
              { id: 'VENDORS', label: `Vendor & Contractor Roster (${vendors.length})` },
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
        {/* TAB 1: EXECUTIVE OPERATIONS OVERVIEW */}
        {/* ========================================================= */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 bg-white rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Supervised Mandates</div>
                <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                  {mandates.length}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">3 active, 1 awaiting sign-off</div>
              </div>

              <div className="p-5 bg-white rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Pending Evidence QA</div>
                <div className="text-2xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
                  {submittedMilestones.length}
                </div>
                <div className="text-[11px] text-amber-700 font-medium mt-1">Field inspection reviews</div>
              </div>

              <div className="p-5 bg-white rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Client Approved Milestones</div>
                <div className="text-2xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
                  {clientApprovedMilestones.length}
                </div>
                <div className="text-[11px] text-emerald-700 font-medium mt-1">Ready for release execution</div>
              </div>

              <div className="p-5 bg-white rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Active Dispute Inquiries</div>
                <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                  {disputes.filter((d) => d.status === 'OPEN').length}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">1 resolved successfully</div>
              </div>
            </div>

            {/* Evidence Verification Action Item */}
            {submittedMilestones.length > 0 && (
              <div className="p-5 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                    <Clock className="w-4 h-4 text-amber-700" />
                    <span>Field Submission Awaiting QA Sign-Off: {submittedMilestones[0].title}</span>
                  </div>
                  <button
                    onClick={() => {
                      setEvidenceVerifyModal(submittedMilestones[0].id);
                      setActiveTab('EVIDENCE');
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-amber-300 hover:bg-amber-400 rounded-md transition-colors cursor-pointer"
                  >
                    Conduct Technical Audit
                  </button>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Project: <strong>{submittedMilestones[0].projectTitle}</strong> ({submittedMilestones[0].projectCode}) · Contractor: {submittedMilestones[0].contractorName} submitted weighbridge documents and moisture certificates.
                </p>
              </div>
            )}

            {/* Quick Mandate Grid */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900">Current Operational Mandate Pipelines</h2>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Reference</th>
                      <th className="px-6 py-3 font-semibold">Client</th>
                      <th className="px-6 py-3 font-semibold">Category</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                      <th className="px-6 py-3 font-semibold">Budget</th>
                      <th className="px-6 py-3 font-semibold">Lead Manager</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mandates.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-mono font-semibold text-slate-800">{m.referenceNumber}</td>
                        <td className="px-6 py-4 font-medium text-slate-900">{m.clientName}</td>
                        <td className="px-6 py-4 text-slate-600">{m.serviceCategory.replace(/_/g, ' ')}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            m.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {m.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-900 tabular-nums">
                          {format(m.estimatedBudget, m.currency)}
                        </td>
                        <td className="px-6 py-4 text-slate-700">{m.assignedManagerName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: CLIENT DUE DILIGENCE & KYC */}
        {/* ========================================================= */}
        {activeTab === 'CLIENTS' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Diaspora Client Identity & Risk Dossiers</h2>
              <p className="text-xs text-slate-500">
                Tiered verification records, diaspora address verification, and Bank Verification Number (BVN) cross-referencing.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Client Name</th>
                    <th className="px-6 py-3 font-semibold">Email</th>
                    <th className="px-6 py-3 font-semibold">KYC Tier</th>
                    <th className="px-6 py-3 font-semibold">ID Country</th>
                    <th className="px-6 py-3 font-semibold">Verification Status</th>
                    <th className="px-6 py-3 font-semibold">Reviewer Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kycCases.map((kyc) => (
                    <tr key={kyc.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-900">{kyc.clientName}</td>
                      <td className="px-6 py-4 text-slate-600">{kyc.email}</td>
                      <td className="px-6 py-4 font-mono font-semibold text-slate-700">{kyc.tier}</td>
                      <td className="px-6 py-4 text-slate-600">{kyc.idCountry}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          kyc.status === 'VERIFIED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {kyc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 max-w-xs">{kyc.reviewerNotes || 'None'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: MANDATE OPERATIONS */}
        {/* ========================================================= */}
        {activeTab === 'MANDATES' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Mandates Configuration & Scopes</h2>
                <p className="text-xs text-slate-500">
                  Manage bilateral agreements, fee retainers, and assigned project management teams.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {mandates.map((m) => (
                <div key={m.id} className="p-5 bg-white rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs text-slate-500 font-semibold">{m.referenceNumber}</span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{m.title}</h3>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                      {m.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{m.scopeDescription}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-500">Client:</span>
                      <div className="font-semibold text-slate-800">{m.clientName}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Platform Fee:</span>
                      <div className="font-mono font-bold text-slate-800">{m.platformFeePercent}%</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Estimated Budget:</span>
                      <div className="font-mono font-bold text-slate-800">{format(m.estimatedBudget, m.currency)}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Supervising Lead:</span>
                      <div className="font-semibold text-slate-800">{m.assignedManagerName}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: EVIDENCE VERIFICATION QUEUE */}
        {/* ========================================================= */}
        {activeTab === 'EVIDENCE' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Quality Assurance & Milestone Verification Queue</h2>
              <p className="text-xs text-slate-500">
                COREN engineers and agronomists certify physical site evidence before requesting client sign-off.
              </p>
            </div>

            <div className="space-y-4">
              {submittedMilestones.length === 0 ? (
                <div className="p-8 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                  No submissions currently awaiting internal review.
                </div>
              ) : (
                submittedMilestones.map((m) => (
                  <div key={m.id} className="p-6 bg-white rounded-xl border border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <span className="font-mono text-xs text-slate-500 font-semibold">{m.projectCode} · Milestone #{m.orderIndex}</span>
                        <h3 className="text-base font-bold text-slate-900 mt-1">{m.title}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Contractor</div>
                        <div className="text-xs font-bold text-slate-800">{m.contractorName}</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{m.description}</p>

                    <div className="flex items-center justify-between pt-2">
                      <span className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                        Allocated Budget: {format(m.allocatedBudgetNgn, 'NGN')}
                      </span>
                      <button
                        onClick={() => setEvidenceVerifyModal(m.id)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                      >
                        Verify & Certify Submission
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: VENDOR ROSTER */}
        {/* ========================================================= */}
        {activeTab === 'VENDORS' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Vetted Vendor & Contractor Directory</h2>
              <p className="text-xs text-slate-500">
                Corporate Affairs Commission (CAC) registered contractors, verified bank account details, and performance evaluations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {vendors.map((v) => (
                <div key={v.id} className="p-5 bg-white rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-500 font-semibold">{v.cacRegistrationNum}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded">
                      {v.verificationStatus}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{v.businessName}</h3>
                  <div className="text-xs text-slate-600">{v.specialtyCategory.replace(/_/g, ' ')}</div>

                  <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                    <div className="text-slate-500">Bank Verification:</div>
                    <div className="font-semibold text-slate-800">{v.bankName} · {v.accountNumber}</div>
                    <div className="text-[11px] text-slate-600">{v.accountName}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Completed Jobs: <strong className="text-slate-800">{v.completedJobsCount}</strong></span>
                    <span className="text-amber-700 font-bold">★ {v.ratingAverage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: OPERATIONS ADMINS & GOVERNANCE */}
        {/* ========================================================= */}
        {activeTab === 'OPERATIONS_ADMINS' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Operations Admins & Governance Hierarchy</h2>
                <p className="text-xs text-slate-500">
                  Operations Admins are added exclusively by the Main Admin to coordinate field inspections, verify vendor milestones, and manage diaspora mandates.
                </p>
              </div>

              {isMainAdmin ? (
                <button
                  onClick={() => {
                    setAdminFormError(null);
                    setAdminFormSuccess(null);
                    setAddAdminModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Operations Admin</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">Viewing as Ops Admin.</span>
                  {mainAdminUser && (
                    <button
                      onClick={() => setCurrentUser(mainAdminUser)}
                      className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Switch to Main Admin ({mainAdminUser.fullName})
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Governance Callout */}
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${
              isMainAdmin
                ? 'bg-purple-50/70 border-purple-200 text-purple-900'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}>
              <Shield className={`w-5 h-5 shrink-0 mt-0.5 ${isMainAdmin ? 'text-purple-600' : 'text-amber-600'}`} />
              <div className="text-xs space-y-1">
                <div className="font-bold">
                  {isMainAdmin
                    ? 'Main Admin Fiduciary Privilege Active'
                    : 'Restricted Governance Authority: Main Admin Commissioning Only'}
                </div>
                <p className="leading-relaxed text-[11px] opacity-90">
                  {isMainAdmin
                    ? 'As the Main Admin (Dr. Olufemi Balogun), you hold supreme governance rights. Operations Admins cannot self-register; they are explicitly provisioned, credentialed, and delegated regional authority by you.'
                    : 'Operations Admins cannot self-register on the public overview. New Operations staff are commissioned exclusively by the Main Admin (Dr. Olufemi Balogun).'}
                </p>
              </div>
            </div>

            {/* Operations Admins Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {opsAdmins.map((admin) => (
                <div
                  key={admin.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 hover:border-slate-300 transition-all shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {admin.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{admin.fullName}</h3>
                        <div className="text-[11px] text-slate-500 font-mono">{admin.email}</div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      admin.accountStatus === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {admin.accountStatus}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 border border-slate-100">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-500">Region:</span>
                      <strong className="text-slate-800">{admin.assignedRegion || 'Lagos State'}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-500">Phone:</span>
                      <span className="font-mono text-slate-700">{admin.phone || '+234 800 000 0000'}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/60 text-[11px]">
                      <span className="text-slate-500">Commissioned By:</span>
                      <span className="text-slate-700 font-medium">{admin.addedBy || 'Main Admin'}</span>
                    </div>
                    {admin.addedDate && (
                      <div className="flex items-center justify-between text-slate-600 text-[11px]">
                        <span className="text-slate-500">Added Date:</span>
                        <span className="font-mono text-slate-700">{admin.addedDate}</span>
                      </div>
                    )}
                  </div>

                  {/* Permissions Badges */}
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Delegated Operational Powers
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(admin.permissions || ['EVIDENCE_VERIFY', 'MANDATE_OPERATIONS']).map((perm) => (
                        <span
                          key={perm}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                        >
                          {perm.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action (Revoke / Re-activate if Main Admin) */}
                  {isMainAdmin && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">ID: {admin.id}</span>
                      {admin.accountStatus === 'ACTIVE' ? (
                        <button
                          onClick={() => revokeOperationsAdmin(admin.id)}
                          className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
                        >
                          Suspend Access
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400">Suspended</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ADD OPERATIONS ADMIN (Main Admin Only) */}
      {addAdminModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative border border-slate-200 space-y-4">
            <button
              onClick={() => {
                setAddAdminModalOpen(false);
                setAdminFormError(null);
                setAdminFormSuccess(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>Main Admin Delegation Authority</span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Commission New Operations Admin</h3>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                As Main Admin ({currentUser.fullName}), provision internal supervisory credentials for project coordination, contractor review, and milestone QA.
              </p>
            </div>

            {adminFormError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {adminFormError}
              </div>
            )}

            {adminFormSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{adminFormSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddAdminSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engr. Tolu Adeyemi"
                    value={adminFormData.fullName}
                    onChange={(e) => setAdminFormData({ ...adminFormData, fullName: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="tolu.adeyemi@diasporatrust.ng"
                    value={adminFormData.email}
                    onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+234 803 234 5678"
                    value={adminFormData.phone}
                    onChange={(e) => setAdminFormData({ ...adminFormData, phone: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Assigned Regional Jurisdiction *</label>
                  <select
                    value={adminFormData.assignedRegion}
                    onChange={(e) => setAdminFormData({ ...adminFormData, assignedRegion: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                  >
                    <option value="Lagos Island & Lekki Corridor">Lagos Island & Lekki Corridor</option>
                    <option value="Lagos Mainland & Ikeja Industrial">Lagos Mainland & Ikeja Industrial</option>
                    <option value="Ogun State Agro Belt (Siun / Kobape)">Ogun State Agro Belt (Siun / Kobape)</option>
                    <option value="Abuja FCT & North-Central">Abuja FCT & North-Central</option>
                    <option value="South-East (Enugu / Anambra)">South-East (Enugu / Anambra)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                  Granted Operational Permissions
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {[
                    { id: 'EVIDENCE_VERIFY', label: 'Site Photo & Drone QA' },
                    { id: 'MANDATE_OPERATIONS', label: 'Mandate Operations' },
                    { id: 'VENDOR_REVIEW', label: 'Vendor Directory Review' },
                    { id: 'FIELD_COORDINATION', label: 'Field Inspector Dispatch' },
                  ].map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adminFormData.permissions.includes(perm.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAdminFormData({
                              ...adminFormData,
                              permissions: [...adminFormData.permissions, perm.id],
                            });
                          } else {
                            setAdminFormData({
                              ...adminFormData,
                              permissions: adminFormData.permissions.filter((p) => p !== perm.id),
                            });
                          }
                        }}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span className="text-[11px]">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddAdminModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  Authorize Operations Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VERIFY EVIDENCE SUBMISSION */}
      {evidenceVerifyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative border border-slate-200 space-y-4">
            <button
              onClick={() => setEvidenceVerifyModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900">Conduct Technical Quality Audit</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              As COREN Engineer / Operations Supervisor, certify that work conforms to structural drawings, bills of quantities, and safety guidelines.
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Quality Inspection Report & Audit Notes
              </label>
              <textarea
                rows={3}
                value={qaNotes}
                onChange={(e) => setQaNotes(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setEvidenceVerifyModal(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerifySubmission(evidenceVerifyModal)}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
              >
                Certify & Advance to Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
