import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { useCurrency } from '../hooks/useCurrency';
import { Project, Milestone, ClientMandate, SupportedCurrency, DocumentCategory } from '../types';
import { ProjectMilestoneTracker } from './ProjectMilestoneTracker';
import { DocumentVault } from './DocumentVault';
import { SitePhotoGallery } from './SitePhotoGallery';
import { ClientAuthModal } from './ClientAuthModal';
import {
  Briefcase,
  Building2,
  Sprout,
  FileText,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Download,
  Plus,
  Eye,
  Camera,
  MapPin,
  Lock,
  ArrowUpRight,
  ExternalLink,
  Coins,
  X,
  FolderLock,
  Scale,
  Receipt,
  HardHat,
  Image as ImageIcon,
  UserPlus
} from 'lucide-react';

export const ClientPortal: React.FC = () => {
  const {
    currentUser,
    mandates,
    projects,
    milestones,
    paymentIntents,
    invoices,
    ledgerTransactions,
    vaultDocuments,
    allUsers,
    switchClientAccount,
    approveMilestoneByClient,
    rejectMilestoneByClient,
    raiseDispute,
    createFundingIntent,
    simulateConfirmPayment,
    acceptMandateByClient,
  } = useApp();

  const { currency, setCurrency, format, convert, formatRaw, allCurrencies, currentConfig, benchmarkSource } = useCurrency();

  // Confidentiality Scoping: Quarantined to current client
  const clientUsers = React.useMemo(() => allUsers.filter((u) => u.role === 'DIASPORA_CLIENT'), [allUsers]);

  const userMandates = React.useMemo(() => {
    return mandates.filter((m) => m.clientId === currentUser.id);
  }, [mandates, currentUser.id]);

  const userProjects = React.useMemo(() => {
    return projects.filter((p) => p.clientId === currentUser.id);
  }, [projects, currentUser.id]);

  const userProjectIds = React.useMemo(() => {
    return new Set(userProjects.map((p) => p.id));
  }, [userProjects]);

  const userMilestones = React.useMemo(() => {
    return milestones.filter((m) => userProjectIds.has(m.projectId));
  }, [milestones, userProjectIds]);

  const userVaultDocuments = React.useMemo(() => {
    return vaultDocuments.filter((d) => userProjectIds.has(d.projectId || '') || d.clientId === currentUser.id);
  }, [vaultDocuments, userProjectIds, currentUser.id]);

  const userPaymentIntents = React.useMemo(() => {
    const mandateRefs = new Set(userMandates.map((m) => m.referenceNumber));
    return paymentIntents.filter((pi) => mandateRefs.has(pi.mandateReference));
  }, [paymentIntents, userMandates]);

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MANDATES' | 'PROJECTS' | 'MILESTONES' | 'GALLERY' | 'VAULT' | 'FUNDING' | 'STATEMENTS'>('OVERVIEW');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [inspectMilestone, setInspectMilestone] = useState<Milestone | null>(null);
  const [vaultInitialCategory, setVaultInitialCategory] = useState<DocumentCategory | 'ALL'>('ALL');
  const [vaultInitialProjectId, setVaultInitialProjectId] = useState<string>('ALL');
  const [galleryInitialProjectId, setGalleryInitialProjectId] = useState<string>('ALL');
  const [galleryInitialMilestoneId, setGalleryInitialMilestoneId] = useState<string>('ALL');
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [fundingModalOpen, setFundingModalOpen] = useState(false);
  const [clientAuthModalOpen, setClientAuthModalOpen] = useState(false);
  const [clientAuthModalMode, setClientAuthModalMode] = useState<'SIGN_UP' | 'SIGN_IN'>('SIGN_UP');

  const totalSitePhotos = React.useMemo(() => {
    return userMilestones.reduce((sum, m) => sum + m.evidenceItems.filter((e) => e.category === 'SITE_PHOTO' || e.thumbnailUrl).length, 0);
  }, [userMilestones]);

  // Form states
  const [clientComment, setClientComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [disputeCategory, setDisputeCategory] = useState('QUALITY_DEFECT');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [fundingAmount, setFundingAmount] = useState('15000');
  const [fundingCurrency, setFundingCurrency] = useState<SupportedCurrency>(currency);
  const [selectedMandateRef, setSelectedMandateRef] = useState(userMandates[0]?.referenceNumber || 'DT-MAN-2026-0042');

  // Client calculations scoped strictly to user
  const activeMandatesCount = userMandates.filter((m) => m.status === 'ACTIVE').length;
  const activeProjectsCount = userProjects.filter((p) => p.status === 'ACTIVE_EXECUTION').length;
  const totalApprovedBudgetNgn = userProjects.reduce((acc, p) => acc + p.approvedBudget, 0);
  const totalActualExpenditureNgn = userProjects.reduce((acc, p) => acc + p.actualExpenditure, 0);
  const totalCommittedNgn = userProjects.reduce((acc, p) => acc + p.committedCapital, 0);
  const pendingMilestonesForReview = userMilestones.filter((m) => m.status === 'INTERNAL_VERIFIED');

  const handleApprove = () => {
    if (!inspectMilestone) return;
    approveMilestoneByClient(inspectMilestone.id, clientComment);
    setApproveModalOpen(false);
    setClientComment('');
    setInspectMilestone(null);
  };

  const handleReject = () => {
    if (!inspectMilestone || !rejectReason.trim()) return;
    rejectMilestoneByClient(inspectMilestone.id, rejectReason);
    setRejectModalOpen(false);
    setRejectReason('');
    setInspectMilestone(null);
  };

  const handleDispute = () => {
    if (!inspectMilestone || !disputeDescription.trim()) return;
    raiseDispute(inspectMilestone.projectId, disputeCategory, disputeDescription);
    setDisputeModalOpen(false);
    setDisputeDescription('');
    setInspectMilestone(null);
  };

  const handleCreateFunding = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(fundingAmount);
    if (isNaN(num) || num <= 0) return;
    createFundingIntent(selectedMandateRef, num, fundingCurrency);
    setFundingModalOpen(false);
    setActiveTab('FUNDING');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Client Header / Breadcrumbs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                <span>Diaspora Client Workspace</span>
                <span>/</span>
                <span className="text-slate-900 font-semibold">{currentUser.fullName}</span>
                <span>·</span>
                <span className="text-slate-600">{currentUser.cityOfResidence}, {currentUser.countryOfResidence}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                Portfolio & Project Governance Console
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Currency Selector for Client Portal */}
              <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5">
                <span className="text-[11px] font-semibold text-slate-500 px-2 flex items-center gap-1">
                  <Coins className="w-3 h-3 text-slate-400" />
                  Currency:
                </span>
                {allCurrencies.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setCurrency(c.code)}
                    title={`${c.name} · 1 ${c.code} = ₦${c.rateToNgn.toLocaleString()}`}
                    className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      currency === c.code
                        ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {c.code} ({c.symbol})
                  </button>
                ))}
              </div>

              {/* Dynamic CBN Benchmark cross rate badge */}
              <div className="hidden lg:flex items-center text-[11px] font-mono text-slate-600 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1">
                <span>1 {currency} = ₦{currentConfig.rateToNgn.toLocaleString()}</span>
                <span className="text-slate-400 mx-1.5">·</span>
                <span className="text-slate-500 text-[10px]">CBN Rate</span>
              </div>

              <button
                onClick={() => setFundingModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Fund Mandate Intent
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto border-t border-slate-100 pt-3">
            {[
              { id: 'OVERVIEW', label: 'Portfolio Overview' },
              { id: 'MANDATES', label: `My Mandates (${userMandates.length})` },
              { id: 'PROJECTS', label: `Projects (${userProjects.length})` },
              { id: 'MILESTONES', label: `Milestones & Verification (${pendingMilestonesForReview.length} Pending)` },
              { id: 'GALLERY', label: `Site Photos (${totalSitePhotos})` },
              { id: 'VAULT', label: `Document Vault (${userVaultDocuments.length})` },
              { id: 'FUNDING', label: 'Funding & Transactions' },
              { id: 'STATEMENTS', label: 'Financial Statements & Ledger' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSelectedProject(null);
                  if (tab.id === 'VAULT') {
                    setVaultInitialCategory('ALL');
                    setVaultInitialProjectId('ALL');
                  }
                  if (tab.id === 'GALLERY') {
                    setGalleryInitialProjectId('ALL');
                    setGalleryInitialMilestoneId('ALL');
                  }
                }}
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

      {/* Non-Client Role Alert if user switched role */}
      {currentUser.role !== 'DIASPORA_CLIENT' && (
        <div className="bg-amber-950 border-b border-amber-800 text-amber-200 py-2.5 px-4 sm:px-6 lg:px-8 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Confidentiality Notice:</strong> Currently viewing as <span className="font-semibold text-white">{currentUser.fullName}</span> ({currentUser.role.replace(/_/g, ' ')}). Every client has their own strictly confidential portal. Choose an active client or register a new one to test data isolation.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {clientUsers.slice(0, 2).map((c) => (
              <button
                key={c.id}
                onClick={() => switchClientAccount(c.id)}
                className="px-2.5 py-1 bg-amber-800 hover:bg-amber-700 text-amber-100 rounded text-[11px] font-semibold cursor-pointer"
              >
                Switch to {c.fullName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Confidentiality Isolation & Account Context Banner */}
      <div className="bg-slate-900 border-b border-slate-800 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-semibold text-white">Confidential Private Session:</span>{' '}
              <span className="text-slate-300">
                Logged in as <strong className="text-emerald-400">{currentUser.fullName}</strong> (Account ID: <span className="font-mono text-emerald-300">{currentUser.id}</span>).
              </span>
              <span className="text-slate-400 hidden lg:inline ml-1.5">
                All mandates, deeds, bank records, and site photos are quarantined strictly to your portal.
              </span>
            </div>
          </div>

          {/* Quick Switcher & New Client Register for Evaluating Client Confidentiality */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-[11px] text-slate-300 font-medium">Switch Client:</span>
              <select
                value={currentUser.id}
                onChange={(e) => switchClientAccount(e.target.value)}
                className="bg-slate-900 border border-slate-600 text-white text-[11px] font-semibold rounded-md px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
              >
                {clientUsers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.cityOfResidence})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setClientAuthModalMode('SIGN_UP');
                setClientAuthModalOpen(true);
              }}
              className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
              title="Register a new diaspora client with isolated confidential workspace"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Client</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW */}
        {/* ========================================================= */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-8">
            {/* Top High-Level Portfolio Stats (Tabular figures, unboxed text) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Approved Project Budgets</span>
                  <span className="text-[10px] font-mono text-slate-400 font-medium">{currency}</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                  {format(totalApprovedBudgetNgn, 'NGN', { compact: true })}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Full: {format(totalApprovedBudgetNgn, 'NGN')}</div>
              </div>

              <div className="p-5 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Committed Capital</span>
                  <span className="text-[10px] font-mono text-slate-400 font-medium">{currency}</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                  {format(totalCommittedNgn, 'NGN', { compact: true })}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Full: {format(totalCommittedNgn, 'NGN')}</div>
              </div>

              <div className="p-5 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Actual Recorded Expenditure</span>
                  <span className="text-[10px] font-mono text-emerald-600 font-medium">{currency}</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
                  {format(totalActualExpenditureNgn, 'NGN', { compact: true })}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Full: {format(totalActualExpenditureNgn, 'NGN')}</div>
              </div>

              <div className="p-5 bg-white rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Pending Client Approvals</div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
                  {pendingMilestonesForReview.length}
                </div>
                <div className="text-[11px] text-amber-700 font-medium mt-1">
                  {pendingMilestonesForReview.length > 0
                    ? `Action required on: ${pendingMilestonesForReview[0].projectTitle}`
                    : 'All milestones reviewed and up to date'}
                </div>
              </div>
            </div>

            {/* Pending Action Banner if applicable */}
            {pendingMilestonesForReview.length > 0 && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h2 className="text-sm font-bold text-amber-900">
                      Milestone Ready for Inspection: {pendingMilestonesForReview[0].title}
                    </h2>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Engr. Babatunde Alabi completed internal structural inspection (Score: 96%). Dated photographic evidence and COREN audit reports are attached.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setInspectMilestone(pendingMilestonesForReview[0]);
                    setActiveTab('MILESTONES');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-900 bg-amber-300 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap cursor-pointer self-start sm:self-auto"
                >
                  Inspect Evidence & Decide
                </button>
              </div>
            )}

            {/* Active Mandates Quick View */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900">Active Mandates & Engagements</h2>
                <button
                  onClick={() => setActiveTab('MANDATES')}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                >
                  View All Mandates <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userMandates.length === 0 ? (
                  <div className="col-span-2 p-6 bg-white rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                    <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
                    <h4 className="text-xs font-bold text-slate-800">No Active Mandates</h4>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Your confidential workspace is active. Create your first investment mandate to commence execution.
                    </p>
                  </div>
                ) : (
                  userMandates.slice(0, 2).map((mandate) => (
                    <div key={mandate.id} className="p-5 bg-white rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-slate-500 font-medium">{mandate.referenceNumber}</span>
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {mandate.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">{mandate.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {mandate.scopeDescription}
                      </p>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Manager: <strong className="text-slate-700">{mandate.assignedManagerName}</strong></span>
                        <span className="font-mono tabular-nums font-semibold text-slate-800">
                          Budget: {format(mandate.estimatedBudget, mandate.currency)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Active Investment Milestone Tracking Component */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Active Investment Milestone Tracking</h2>
                  <p className="text-xs text-slate-500">
                    Live completion percentages, certified COREN engineering inspection sign-offs, and staged capital disbursement progress.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('MILESTONES')}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                >
                  Inspect All Verification Evidence <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <ProjectMilestoneTracker
                projects={userProjects}
                milestones={userMilestones}
                onInspectMilestone={(m) => {
                  setInspectMilestone(m);
                  setActiveTab('MILESTONES');
                }}
              />
            </div>

            {/* Projects Overview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900">Supervised Site Projects</h2>
                <button
                  onClick={() => setActiveTab('PROJECTS')}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                >
                  View All Projects <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userProjects.length === 0 ? (
                  <div className="col-span-full p-8 bg-white rounded-xl border border-dashed border-slate-300 text-center space-y-3">
                    <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
                    <h4 className="text-xs font-bold text-slate-800">No Projects Commissioned Yet</h4>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Once your mandate is approved and contractor escrow is funded, your site project, timeline, and photo milestones will be initialized here.
                    </p>
                  </div>
                ) : (
                  userProjects.slice(0, 3).map((project) => (
                    <div
                      key={project.id}
                      onClick={() => {
                        setSelectedProject(project);
                        setActiveTab('PROJECTS');
                      }}
                      className="p-5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-slate-500">{project.projectCode}</span>
                        <span className="text-xs font-medium text-slate-600">{project.locationCity}, {project.locationState}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">{project.title}</h3>
                      
                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span>Milestone Progress</span>
                          <span className="font-mono tabular-nums">{project.progressPercent}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: `${project.progressPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Actual Spent</span>
                        <span className="font-mono font-bold text-slate-900 tabular-nums">
                          {format(project.actualExpenditure, project.currency, { compact: true })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Document Vault Archive Summary & Quick Access */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-100 text-slate-900 rounded-lg">
                    <FolderLock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Institutional Document Vault</h2>
                    <p className="text-xs text-slate-500">
                      AES-256 encrypted repository with immutable SHA-256 cryptographic fingerprints.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setVaultInitialCategory('ALL');
                    setVaultInitialProjectId('ALL');
                    setActiveTab('VAULT');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-auto"
                >
                  <span>Open Full Document Vault ({vaultDocuments.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 3 Categories Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => {
                    setVaultInitialCategory('LEGAL');
                    setActiveTab('VAULT');
                  }}
                  className="p-3.5 rounded-lg border border-indigo-100 bg-indigo-50/40 hover:bg-indigo-50/70 transition-colors cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-indigo-700" /> Legal & Title
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-200/70 text-indigo-900">
                      {vaultDocuments.filter((d) => d.category === 'LEGAL').length} Deeds
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    Lagos State C of O, Governor's Consent, Registered Survey Plans & Deeds of Conveyance.
                  </p>
                </div>

                <div
                  onClick={() => {
                    setVaultInitialCategory('FINANCIAL');
                    setActiveTab('VAULT');
                  }}
                  className="p-3.5 rounded-lg border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50/70 transition-colors cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-emerald-700" /> Financial & Escrow
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-200/70 text-emerald-900">
                      {vaultDocuments.filter((d) => d.category === 'FINANCIAL').length} Records
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    Stanbic IBTC Segregated Escrow Confirmations, CBN Inward Forex Slips & Dual-Auth Vouchers.
                  </p>
                </div>

                <div
                  onClick={() => {
                    setVaultInitialCategory('SITE_PROGRESS');
                    setActiveTab('VAULT');
                  }}
                  className="p-3.5 rounded-lg border border-amber-100 bg-amber-50/40 hover:bg-amber-50/70 transition-colors cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <HardHat className="w-3.5 h-3.5 text-amber-700" /> Site Progress
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-200/70 text-amber-900">
                      {vaultDocuments.filter((d) => d.category === 'SITE_PROGRESS').length} Dossiers
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    COREN Field Inspection Audits, Compressive Concrete Lab Tests & Drone Photogrammetry.
                  </p>
                </div>
              </div>
            </div>

            {/* Site Photography & Verification Feed */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-100 text-slate-900 rounded-lg">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Recent Site Photo Verifications & Inspection Feed</h2>
                    <p className="text-xs text-slate-500">
                      Timestamped and geo-tagged site images uploaded by field contractors and QA engineers.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setGalleryInitialProjectId('ALL');
                    setGalleryInitialMilestoneId('ALL');
                    setActiveTab('GALLERY');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-auto"
                >
                  <span>Open Full Photo Gallery ({totalSitePhotos})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Recent Photo Preview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {userMilestones.length === 0 ? (
                  <div className="col-span-full p-6 bg-slate-50 rounded-xl text-center text-xs text-slate-500 border border-dashed border-slate-200">
                    No site photos registered yet for your projects.
                  </div>
                ) : (
                  userMilestones
                    .flatMap((m) =>
                      m.evidenceItems
                        .filter((ev) => ev.category === 'SITE_PHOTO' || ev.thumbnailUrl)
                        .map((ev) => ({ ...ev, milestoneTitle: m.title, milestoneOrder: m.orderIndex, projectCode: m.projectCode }))
                    )
                    .slice(0, 4)
                    .map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => {
                        setGalleryInitialProjectId(photo.projectId);
                        setGalleryInitialMilestoneId(photo.milestoneId || 'ALL');
                        setActiveTab('GALLERY');
                      }}
                      className="group bg-slate-50 rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="relative aspect-4/3 bg-slate-900 overflow-hidden">
                        <img
                          src={photo.thumbnailUrl}
                          alt={photo.title || photo.filename}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-slate-900/80 text-white backdrop-blur-sm">
                          {photo.projectCode} · M#{photo.milestoneOrder}
                        </div>
                        {photo.isVerified && (
                          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-600/90 text-white flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                          </div>
                        )}
                        {photo.gpsCoordinates && (
                          <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-900/80 text-slate-200 flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-sky-400" />
                            {photo.gpsCoordinates.lat.toFixed(3)}°, {photo.gpsCoordinates.lng.toFixed(3)}°
                          </div>
                        )}
                      </div>

                      <div className="p-3 space-y-1">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {photo.title || photo.filename}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center justify-between">
                          <span>{photo.uploaderName}</span>
                          <span className="font-mono">{photo.claimedCaptureTime.split(' ')[0]}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MANDATES */}
        {/* ========================================================= */}
        {activeTab === 'MANDATES' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Contractual Client Mandates</h2>
              <p className="text-xs text-slate-500">
                Formal legal bilateral service agreements governing scope, project managers, and fee structures.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {userMandates.length === 0 ? (
                <div className="p-8 bg-white rounded-xl border border-dashed border-slate-300 text-center space-y-3">
                  <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">No Mandates Found for This Client</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Your personal portal is active and strictly isolated. Commission a mandate to begin tracking project execution.
                  </p>
                </div>
              ) : (
                userMandates.map((mandate) => (
                <div key={mandate.id} className="p-6 bg-white rounded-xl border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-500 font-semibold">{mandate.referenceNumber}</span>
                        <span>·</span>
                        <span className="text-xs font-medium text-slate-600">{mandate.serviceCategory.replace(/_/g, ' ')}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{mandate.title}</h3>
                    </div>
                    <div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded ${
                        mandate.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700'
                          : mandate.status === 'AWAITING_CLIENT_ACCEPTANCE'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {mandate.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    {mandate.scopeDescription}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg text-xs">
                    <div>
                      <div className="text-slate-500">Estimated Budget ({currency})</div>
                      <div className="font-mono font-bold text-slate-900 tabular-nums">
                        {format(mandate.estimatedBudget, mandate.currency)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Management Fee</div>
                      <div className="font-mono font-bold text-slate-900 tabular-nums">
                        {mandate.platformFeePercent}% on releases
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Assigned Lead</div>
                      <div className="font-medium text-slate-900">{mandate.assignedManagerName}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Target Completion</div>
                      <div className="font-mono text-slate-900">{mandate.targetEndDate}</div>
                    </div>
                  </div>

                  {mandate.status === 'AWAITING_CLIENT_ACCEPTANCE' && (
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                      <div className="text-xs text-amber-800">
                        Scope document finalized. Please review legal terms to activate mandate.
                      </div>
                      <button
                        onClick={() => acceptMandateByClient(mandate.id)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      >
                        Accept & Execute Mandate
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: PROJECTS */}
        {/* ========================================================= */}
        {activeTab === 'PROJECTS' && (
          <div className="space-y-6">
            {!selectedProject ? (
              <>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Managed Project Portfolio</h2>
                  <p className="text-xs text-slate-500">
                    Real estate, construction, agricultural parcels, and advisory deliverables under your account.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userProjects.length === 0 ? (
                    <div className="col-span-full p-8 bg-white rounded-xl border border-dashed border-slate-300 text-center space-y-3">
                      <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
                      <h4 className="text-sm font-bold text-slate-800">No Projects Commissioned</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Your private client portal has zero projects active. Once a mandate is approved by you, the execution project will appear here with live photo QA.
                      </p>
                    </div>
                  ) : (
                    userProjects.map((proj) => (
                    <div
                      key={proj.id}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden space-y-4 p-6"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-slate-500 font-semibold">{proj.projectCode}</span>
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
                          {proj.projectType}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">{proj.title}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{proj.siteAddress || `${proj.locationCity}, ${proj.locationState}`}</span>
                      </div>

                      {/* Domain specifics */}
                      {proj.propertyDetails && (
                        <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Land Title Status:</span>
                            <strong className="text-emerald-700">{proj.propertyDetails.titleStatus.replace(/_/g, ' ')}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Registry Search:</span>
                            <span className="text-slate-700">{proj.propertyDetails.registrySearched}</span>
                          </div>
                        </div>
                      )}

                      {proj.farmDetails && (
                        <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Crop Cycle:</span>
                            <strong className="text-emerald-700">{proj.farmDetails.currentCrop}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Farm Scale:</span>
                            <span className="text-slate-700">{proj.farmDetails.totalHectares} Hectares · {proj.farmDetails.waterSource}</span>
                          </div>
                        </div>
                      )}

                      {proj.consultationDetails && (
                        <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Deliverable Dossier:</span>
                            <strong className="text-slate-800">{proj.consultationDetails.deliverableDocumentName}</strong>
                          </div>
                        </div>
                      )}

                      {/* Financial progress */}
                      <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-slate-500">Approved Budget ({currency})</div>
                          <div className="font-mono font-bold text-slate-900 tabular-nums">
                            {format(proj.approvedBudget, proj.currency, { compact: true })}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500">Disbursed Expenditure ({currency})</div>
                          <div className="font-mono font-bold text-emerald-700 tabular-nums">
                            {format(proj.actualExpenditure, proj.currency, { compact: true })}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedProject(proj)}
                        className="w-full py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer text-center"
                      >
                        Open Comprehensive Project Dashboard
                      </button>
                    </div>
                  ))
                )}
                </div>
              </>
            ) : (
              /* PROJECT DETAIL VIEW */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer flex items-center gap-1"
                  >
                    ← Back to Projects Portfolio
                  </button>
                  <span className="font-mono text-xs text-slate-500 font-semibold">{selectedProject.projectCode}</span>
                </div>

                <div className="p-6 bg-white rounded-xl border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Mandate: {selectedProject.mandateReference}</div>
                      <h2 className="text-xl font-bold text-slate-900">{selectedProject.title}</h2>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Lead QA Engineer</div>
                      <div className="text-xs font-bold text-slate-800">{selectedProject.leadEngineer}</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Site: {selectedProject.siteAddress}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg text-xs">
                    <div>
                      <div className="text-slate-500">Approved Budget ({currency})</div>
                      <div className="font-mono font-bold text-slate-900 tabular-nums">
                        {format(selectedProject.approvedBudget, selectedProject.currency)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Actual Expenditure ({currency})</div>
                      <div className="font-mono font-bold text-emerald-700 tabular-nums">
                        {format(selectedProject.actualExpenditure, selectedProject.currency)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Committed Capital ({currency})</div>
                      <div className="font-mono font-bold text-slate-900 tabular-nums">
                        {format(selectedProject.committedCapital, selectedProject.currency)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Overall Progress</div>
                      <div className="font-mono font-bold text-slate-900 tabular-nums">
                        {selectedProject.progressPercent}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Milestones */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-4">Project Milestones & Verification Timeline</h3>
                  <ProjectMilestoneTracker
                    projects={[selectedProject]}
                    milestones={milestones}
                    initialProjectId={selectedProject.id}
                    onInspectMilestone={(milestone) => {
                      setInspectMilestone(milestone);
                      setActiveTab('MILESTONES');
                    }}
                  />
                </div>

                {/* Project Vault Documents Section */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-100 text-slate-800 rounded-lg">
                        <FolderLock className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Project Legal, Financial & Engineering Documents
                        </h3>
                        <p className="text-xs text-slate-500">
                          Official title deeds, escrow receipts, and COREN/drone reports registered for {selectedProject.projectCode}.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setVaultInitialCategory('ALL');
                        setVaultInitialProjectId(selectedProject.id);
                        setActiveTab('VAULT');
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Open in Document Vault</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {(() => {
                    const projectDocs = vaultDocuments.filter((d) => d.projectId === selectedProject.id);
                    if (projectDocs.length === 0) {
                      return (
                        <div className="p-4 bg-slate-50 rounded-lg text-center text-xs text-slate-500">
                          No documents currently deposited for this project.
                        </div>
                      );
                    }
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {projectDocs.map((doc) => (
                          <div
                            key={doc.id}
                            onClick={() => {
                              setVaultInitialCategory(doc.category);
                              setVaultInitialProjectId(selectedProject.id);
                              setActiveTab('VAULT');
                            }}
                            className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer space-y-2"
                          >
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-mono text-slate-400 font-semibold">{doc.documentNumber}</span>
                              <span
                                className={`font-semibold px-1.5 py-0.2 rounded-full ${
                                  doc.category === 'LEGAL'
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : doc.category === 'FINANCIAL'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {doc.category}
                              </span>
                            </div>
                            <div className="text-xs font-bold text-slate-900 line-clamp-1">{doc.title}</div>
                            <div className="text-[11px] text-slate-500 line-clamp-1">{doc.issuingAuthority}</div>
                            <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                              <span>{doc.fileType} · {doc.fileSizeMb}MB</span>
                              <span className="text-emerald-700 font-semibold">SHA-256 Sealed</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Project Site Photography & Geotagged Milestone Verification */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Camera className="w-4 h-4 text-slate-700" />
                        Timestamped & Geo-Tagged Site Photography ({selectedProject.projectCode})
                      </h3>
                      <p className="text-xs text-slate-500">
                        Physical field photos uploaded by contractors and surveyors to verify construction milestones.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setGalleryInitialProjectId(selectedProject.id);
                        setGalleryInitialMilestoneId('ALL');
                        setActiveTab('GALLERY');
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Project Photo Gallery</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {(() => {
                    const projectPhotos = milestones
                      .filter((m) => m.projectId === selectedProject.id)
                      .flatMap((m) =>
                        m.evidenceItems
                          .filter((ev) => ev.category === 'SITE_PHOTO' || ev.thumbnailUrl)
                          .map((ev) => ({ ...ev, milestone: m }))
                      );

                    if (projectPhotos.length === 0) {
                      return (
                        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                          No site photographs uploaded for this project yet.
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projectPhotos.map((photo) => (
                          <div
                            key={photo.id}
                            onClick={() => {
                              setGalleryInitialProjectId(selectedProject.id);
                              setGalleryInitialMilestoneId(photo.milestoneId || 'ALL');
                              setActiveTab('GALLERY');
                            }}
                            className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
                          >
                            <div className="relative aspect-4/3 bg-slate-900 overflow-hidden">
                              <img
                                src={photo.thumbnailUrl}
                                alt={photo.title || photo.filename}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-900/80 text-white backdrop-blur-sm">
                                Milestone #{photo.milestone?.orderIndex}
                              </div>
                              {photo.isVerified ? (
                                <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-600 text-white flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Verified
                                </div>
                              ) : (
                                <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500 text-white flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> Under Review
                                </div>
                              )}
                              {photo.gpsCoordinates && (
                                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900/80 text-slate-200 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-sky-400" />
                                  {photo.gpsCoordinates.lat.toFixed(4)}°N, {photo.gpsCoordinates.lng.toFixed(4)}°E
                                </div>
                              )}
                            </div>

                            <div className="p-3.5 space-y-2">
                              <div className="text-xs font-bold text-slate-900 line-clamp-1">{photo.title || photo.filename}</div>
                              <div className="text-[11px] text-slate-500 line-clamp-1">{photo.milestone?.title}</div>
                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                                <span>Capture: {photo.claimedCaptureTime.split(' ')[0]}</span>
                                <span>{photo.uploaderName.split(' ')[0]}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: MILESTONES & VERIFICATION INSPECTION */}
        {/* ========================================================= */}
        {activeTab === 'MILESTONES' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Milestone Evidence & Decision Center</h2>
              <p className="text-xs text-slate-500">
                Inspect high-resolution site photography, COREN engineering audit certifications, and decide on disbursement releases.
              </p>
            </div>

            {inspectMilestone ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <button
                    onClick={() => setInspectMilestone(null)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    ← Back to Active Investment Milestone Tracker
                  </button>
                  <span className="font-mono text-xs text-slate-500 font-semibold">{inspectMilestone.projectCode}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <span className="font-mono text-xs text-slate-500 font-semibold">{inspectMilestone.projectCode} · Milestone {inspectMilestone.orderIndex}</span>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">{inspectMilestone.title}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Allocated Budget ({currency})</div>
                    <div className="text-lg font-mono font-bold text-slate-900 tabular-nums">
                      {format(inspectMilestone.allocatedBudgetNgn, 'NGN')}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column: Scope & QA Verification Notes */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Acceptance Criteria & Scope
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed mb-3">
                        {inspectMilestone.description}
                      </p>
                      <ul className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-lg">
                        {inspectMilestone.acceptanceCriteria.map((c, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Internal QA Sign-Off */}
                    {inspectMilestone.internalVerification && (
                      <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs space-y-2">
                        <div className="flex items-center gap-2 font-bold text-emerald-900">
                          <ShieldCheck className="w-4 h-4 text-emerald-700" />
                          <span>COREN Internal QA Verification Sign-Off</span>
                        </div>
                        <p className="text-emerald-800 leading-relaxed">
                          "{inspectMilestone.internalVerification.notes}"
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-emerald-700 pt-1 border-t border-emerald-200/60">
                          <span>Verified by: {inspectMilestone.internalVerification.verifiedBy}</span>
                          <span>Timestamp: {inspectMilestone.internalVerification.verifiedAt}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Submitted Media & Checksums */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Physical Inspection Evidence Vault
                    </h4>

                    {inspectMilestone.evidenceItems.length === 0 ? (
                      <div className="p-6 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                        No photographic assets uploaded for this milestone yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {inspectMilestone.evidenceItems.map((ev) => (
                          <div key={ev.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-800">{ev.filename}</span>
                              <span className="text-[10px] text-slate-500">{ev.category} · {ev.fileSizeMb} MB</span>
                            </div>

                            {ev.thumbnailUrl && (
                              <div className="rounded-lg overflow-hidden border border-slate-200 h-44 bg-slate-100">
                                <img
                                  src={ev.thumbnailUrl}
                                  alt={ev.filename}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            {/* Checksum & GPS data */}
                            <div className="text-[10px] text-slate-500 font-mono space-y-0.5 bg-white p-2 rounded border border-slate-100">
                              <div>SHA-256: {ev.sha256Checksum}</div>
                              {ev.gpsCoordinates && (
                                <div>GPS Coordinates: Lat {ev.gpsCoordinates.lat}, Lng {ev.gpsCoordinates.lng} (Verified)</div>
                              )}
                              <div>Capture: {ev.claimedCaptureTime} · Upload: {ev.actualUploadTime}</div>
                            </div>

                            {ev.thumbnailUrl && (
                              <button
                                onClick={() => {
                                  setGalleryInitialProjectId(inspectMilestone.projectId);
                                  setGalleryInitialMilestoneId(inspectMilestone.id);
                                  setActiveTab('GALLERY');
                                }}
                                className="w-full py-1.5 px-3 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                Deep Inspect in Photo Gallery Lightbox
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Client Decision Actions */}
                <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs text-slate-600">
                    Milestone status: <strong className="text-slate-900">{inspectMilestone.status.replace(/_/g, ' ')}</strong>
                  </div>

                  {inspectMilestone.status === 'INTERNAL_VERIFIED' ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setDisputeModalOpen(true)}
                        className="px-3.5 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                      >
                        Raise Dispute
                      </button>
                      <button
                        onClick={() => setRejectModalOpen(true)}
                        className="px-3.5 py-2 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                      >
                        Reject Milestone
                      </button>
                      <button
                        onClick={() => setApproveModalOpen(true)}
                        className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-sm"
                      >
                        Approve Milestone & Authorize
                      </button>
                    </div>
                  ) : inspectMilestone.status === 'CLIENT_APPROVED' ? (
                    <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Approved by client. Ready for Finance dual-authorization payout.</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <ProjectMilestoneTracker
                projects={userProjects}
                milestones={userMilestones}
                onInspectMilestone={(m) => setInspectMilestone(m)}
              />
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: FUNDING & TRANSACTIONS */}
        {/* ========================================================= */}
        {activeTab === 'FUNDING' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Multi-Currency Funding Desk</h2>
                <p className="text-xs text-slate-500">
                  Fund your segregated client accounts with official CBN conversion rates. All transactions post directly to our double-entry ledger.
                </p>
              </div>
              <button
                onClick={() => setFundingModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                + New Funding Intent
              </button>
            </div>

            {/* List of Payment Intents */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Funding Intents & Payment Gateways</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Reference</th>
                      <th className="px-6 py-3 font-semibold">Mandate</th>
                      <th className="px-6 py-3 font-semibold">Currency Amount</th>
                      <th className="px-6 py-3 font-semibold">Exchange Rate</th>
                      <th className="px-6 py-3 font-semibold">Settlement (NGN)</th>
                      <th className="px-6 py-3 font-semibold">Status</th>
                      <th className="px-6 py-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {userPaymentIntents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-slate-500 text-xs">
                          No funding intents initiated yet for this client account. Click "+ New Funding Intent" above to fund your escrow account.
                        </td>
                      </tr>
                    ) : (
                      userPaymentIntents.map((pi) => (
                      <tr key={pi.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-mono font-semibold text-slate-800">{pi.referenceCode}</td>
                        <td className="px-6 py-4 text-slate-600">{pi.mandateReference}</td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-900 tabular-nums">
                          {pi.currency} ${pi.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-600 tabular-nums">
                          1 {pi.currency} = ₦{pi.exchangeRate.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-emerald-700 tabular-nums">
                          ₦{pi.settlementAmountNgn.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            pi.status === 'CONFIRMED_SETTLED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {pi.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {pi.status === 'AWAITING_PAYMENT' ? (
                            <button
                              onClick={() => simulateConfirmPayment(pi.id)}
                              className="px-3 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors cursor-pointer"
                            >
                              Simulate Card/Wire
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400">Ledger Settled</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: SITE PHOTO GALLERY & GEOTAG VERIFICATION */}
        {/* ========================================================= */}
        {activeTab === 'GALLERY' && (
          <SitePhotoGallery
            initialProjectId={galleryInitialProjectId}
            initialMilestoneId={galleryInitialMilestoneId}
            onNavigateToMilestones={(mId) => {
              if (mId) {
                const targetM = milestones.find((m) => m.id === mId);
                if (targetM) setInspectMilestone(targetM);
              }
              setActiveTab('MILESTONES');
            }}
            onNavigateToProject={(pId) => {
              const p = projects.find((x) => x.id === pId);
              if (p) {
                setSelectedProject(p);
                setActiveTab('PROJECTS');
              }
            }}
          />
        )}

        {/* ========================================================= */}
        {/* TAB 6: SECURE DOCUMENT VAULT */}
        {/* ========================================================= */}
        {activeTab === 'VAULT' && (
          <DocumentVault
            initialCategory={vaultInitialCategory}
            initialProjectId={vaultInitialProjectId}
            onSelectProject={(pId) => {
              const p = projects.find((x) => x.id === pId);
              if (p) {
                setSelectedProject(p);
                setActiveTab('PROJECTS');
              }
            }}
          />
        )}

        {/* ========================================================= */}
        {/* TAB 7: STATEMENTS & LEDGER */}
        {/* ========================================================= */}
        {activeTab === 'STATEMENTS' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Authorized Financial Statements & Ledger</h2>
                <p className="text-xs text-slate-500">
                  Comprehensive audit trail of all double-entry financial movements across client segregated and clearing accounts.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setVaultInitialCategory('FINANCIAL');
                    setActiveTab('VAULT');
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  View Financial Receipts in Vault
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export PDF Statement
                </button>
              </div>
            </div>

            {/* Financial Ledger Activity Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Double-Entry Account Statement</h3>
                <span className="text-xs text-slate-500">Official Audited Record</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Posting Time</th>
                      <th className="px-6 py-3 font-semibold">Tx Reference</th>
                      <th className="px-6 py-3 font-semibold">Transaction Description</th>
                      <th className="px-6 py-3 font-semibold">Module</th>
                      <th className="px-6 py-3 font-semibold text-right">Debit / Credit Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ledgerTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-mono text-slate-500">{tx.postedAt}</td>
                        <td className="px-6 py-4 font-mono font-semibold text-slate-900">{tx.transactionRef}</td>
                        <td className="px-6 py-4 text-slate-700 max-w-md">{tx.description}</td>
                        <td className="px-6 py-4 text-slate-500 text-[11px]">{tx.sourceModule}</td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-900 text-right tabular-nums">
                          {tx.currency} {tx.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ---------------------------------------------------- */}
      {/* MODAL: APPROVE MILESTONE */}
      {/* ---------------------------------------------------- */}
      {approveModalOpen && inspectMilestone && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative border border-slate-200 space-y-4">
            <button
              onClick={() => setApproveModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900">Confirm Milestone Sign-Off</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              You are certifying that you have reviewed the engineering evidence for <strong>{inspectMilestone.title}</strong>. Approving this milestone moves it to the Finance dual-authorization queue for contractor payout.
            </p>

            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Gross Milestone Budget ({currency}):</span>
                <span>{format(inspectMilestone.allocatedBudgetNgn, 'NGN')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Platform Management Fee (5%):</span>
                <span>-{format(inspectMilestone.allocatedBudgetNgn * 0.05, 'NGN')}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700 border-t border-slate-200 pt-1">
                <span>Net Contractor Disbursement:</span>
                <span>{format(inspectMilestone.allocatedBudgetNgn * 0.95, 'NGN')}</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Client Inspection Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Reviewed structural photos, alignment and parapet finish look solid."
                value={clientComment}
                onChange={(e) => setClientComment(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setApproveModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
              >
                Authorize Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: REJECT MILESTONE */}
      {/* ---------------------------------------------------- */}
      {rejectModalOpen && inspectMilestone && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative border border-slate-200 space-y-4">
            <button
              onClick={() => setRejectModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900">Reject Milestone Submission</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Please specify the precise technical defect or missing evidence. The contractor and lead project manager will be notified to rectify the work.
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Required Rejection Reason <span className="text-rose-600">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Parapet screeding shows uneven plastering in photo #3. Please re-skim and provide drone video evidence before re-submitting."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
              >
                Submit Rejection Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: RAISE DISPUTE */}
      {/* ---------------------------------------------------- */}
      {disputeModalOpen && inspectMilestone && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative border border-slate-200 space-y-4">
            <button
              onClick={() => setDisputeModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900">Initiate Formal Dispute</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Opening a dispute places a controlled hold on future disbursements for this milestone and triggers independent mediation by our legal and engineering arbitration officers.
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Dispute Category</label>
              <select
                value={disputeCategory}
                onChange={(e) => setDisputeCategory(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="QUALITY_DEFECT">Work Quality or Specification Discrepancy</option>
                <option value="BUDGET_OVERRUN">Unapproved Bill of Quantities Variation</option>
                <option value="TIMELINE_DELAY">Unjustified Construction Delay</option>
                <option value="SURVEY_BOUNDARY">Survey Beacon / Cadastral Issue</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Detailed Description</label>
              <textarea
                required
                rows={3}
                placeholder="State the contractual clause or quality standard you believe was violated..."
                value={disputeDescription}
                onChange={(e) => setDisputeDescription(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDisputeModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDispute}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer"
              >
                Open Formal Dispute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: CREATE FUNDING INTENT */}
      {/* ---------------------------------------------------- */}
      {fundingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative border border-slate-200 space-y-4">
            <button
              onClick={() => setFundingModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900">Initiate Segregated Mandate Deposit</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Create a secured funding intent. Deposit funds directly into your segregated trust account.
            </p>

            <form onSubmit={handleCreateFunding} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Mandate</label>
                <select
                  value={selectedMandateRef}
                  onChange={(e) => setSelectedMandateRef(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {userMandates.map((m) => (
                    <option key={m.id} value={m.referenceNumber}>
                      {m.referenceNumber} — {m.title.substring(0, 35)}...
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Currency</label>
                  <select
                    value={fundingCurrency}
                    onChange={(e) => setFundingCurrency(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="USD">USD ($ - US Dollar)</option>
                    <option value="EUR">EUR (€ - Euro)</option>
                    <option value="GBP">GBP (£ - British Pound)</option>
                    <option value="NGN">NGN (₦ - Nigerian Naira)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Amount</label>
                  <input
                    type="number"
                    min="100"
                    step="500"
                    value={fundingAmount}
                    onChange={(e) => setFundingAmount(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Exchange Rate Benchmark:</span>
                  <span className="font-mono">1 {fundingCurrency} = ₦{convert(1, fundingCurrency, 'NGN').toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Estimated Settlement (NGN):</span>
                  <span className="font-mono tabular-nums text-emerald-700">
                    ₦{convert(parseFloat(fundingAmount || '0'), fundingCurrency, 'NGN').toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
                {currency !== 'NGN' && (
                  <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>Equivalent in {currency}:</span>
                    <span className="font-mono tabular-nums">
                      {format(convert(parseFloat(fundingAmount || '0'), fundingCurrency, 'NGN'), 'NGN')}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFundingModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Generate Intent & Pay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Registration / Account Switch Modal */}
      <ClientAuthModal
        isOpen={clientAuthModalOpen}
        onClose={() => setClientAuthModalOpen(false)}
        initialMode={clientAuthModalMode}
      />
    </div>
  );
};
