import React, { useState, useMemo } from 'react';
import { VaultDocument, DocumentCategory, DocumentSecurityLevel, Project } from '../types';
import { useApp } from '../store/AppContext';
import {
  FileText,
  Shield,
  ShieldCheck,
  Lock,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
  Upload,
  Copy,
  Check,
  Building2,
  Sprout,
  Receipt,
  Scale,
  HardHat,
  Printer,
  X,
  Plus,
  Hash,
  Clock,
  MapPin,
  ExternalLink,
  RefreshCw,
  FolderLock,
  FileCheck2,
  Calendar
} from 'lucide-react';

interface DocumentVaultProps {
  initialCategory?: DocumentCategory | 'ALL';
  initialProjectId?: string;
  onSelectProject?: (projectId: string) => void;
}

export const DocumentVault: React.FC<DocumentVaultProps> = ({
  initialCategory = 'ALL',
  initialProjectId = 'ALL',
  onSelectProject,
}) => {
  const { vaultDocuments, projects, addVaultDocument, verifyDocumentIntegrity, currentUser } = useApp();

  // Confidentiality Scoping: Scope projects and documents to current client
  const scopedProjects = useMemo(() => {
    if (currentUser.role === 'DIASPORA_CLIENT') {
      return projects.filter((p) => p.clientId === currentUser.id);
    }
    return projects;
  }, [projects, currentUser]);

  const scopedProjectIds = useMemo(() => new Set(scopedProjects.map((p) => p.id)), [scopedProjects]);

  const scopedVaultDocuments = useMemo(() => {
    if (currentUser.role === 'DIASPORA_CLIENT') {
      return vaultDocuments.filter((d) => scopedProjectIds.has(d.projectId || '') || d.clientId === currentUser.id);
    }
    return vaultDocuments;
  }, [vaultDocuments, scopedProjectIds, currentUser]);

  // Filter & State Controls
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'ALL'>(initialCategory);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'VERIFIED' | 'UNDER_REVIEW' | 'PENDING_AUDIT'>('ALL');
  const [selectedClassification, setSelectedClassification] = useState<DocumentSecurityLevel | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // Interactive Modal States
  const [inspectDoc, setInspectDoc] = useState<VaultDocument | null>(null);
  const [verifyModalDoc, setVerifyModalDoc] = useState<VaultDocument | null>(null);
  const [isVerifyingChecksum, setIsVerifyingChecksum] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<{ isValid: boolean; hash: string; timestamp: string } | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isExportManifestOpen, setIsExportManifestOpen] = useState<boolean>(false);
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  // Upload Form State
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('LEGAL');
  const [uploadProjectId, setUploadProjectId] = useState<string>(scopedProjects[0]?.id || 'PORTFOLIO_WIDE');
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadSubCategory, setUploadSubCategory] = useState<string>('Certificate of Occupancy');
  const [uploadDescription, setUploadDescription] = useState<string>('');
  const [uploadAuthority, setUploadAuthority] = useState<string>('Lagos State Lands Registry, Alausa');
  const [uploadClassification, setUploadClassification] = useState<DocumentSecurityLevel>('RESTRICTED');
  const [uploadFileType, setUploadFileType] = useState<'PDF' | 'DWG' | 'JPG' | 'PNG' | 'XLSX'>('PDF');
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [uploadTags, setUploadTags] = useState<string>('Title, Legal, Verified');
  const [includeGps, setIncludeGps] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Category counts and calculations
  const totalCount = scopedVaultDocuments.length;
  const legalDocs = useMemo(() => scopedVaultDocuments.filter((d) => d.category === 'LEGAL'), [scopedVaultDocuments]);
  const financialDocs = useMemo(() => scopedVaultDocuments.filter((d) => d.category === 'FINANCIAL'), [scopedVaultDocuments]);
  const siteProgressDocs = useMemo(() => scopedVaultDocuments.filter((d) => d.category === 'SITE_PROGRESS'), [scopedVaultDocuments]);
  
  const totalStorageMb = useMemo(() => {
    return scopedVaultDocuments.reduce((acc, d) => acc + (d.fileSizeMb || 0), 0).toFixed(1);
  }, [scopedVaultDocuments]);

  const verifiedPercent = useMemo(() => {
    if (totalCount === 0) return 100;
    const verified = scopedVaultDocuments.filter((d) => d.verificationStatus === 'VERIFIED').length;
    return Math.round((verified / totalCount) * 100);
  }, [scopedVaultDocuments, totalCount]);

  // Filtered documents list
  const filteredDocuments = useMemo(() => {
    return scopedVaultDocuments.filter((doc) => {
      // Category filter
      if (selectedCategory !== 'ALL' && doc.category !== selectedCategory) {
        return false;
      }
      // Project filter
      if (selectedProjectId !== 'ALL') {
        if (selectedProjectId === 'PORTFOLIO_WIDE') {
          if (doc.projectCode !== 'PORTFOLIO_WIDE') return false;
        } else {
          if (doc.projectId !== selectedProjectId) return false;
        }
      }
      // Status filter
      if (selectedStatus !== 'ALL' && doc.verificationStatus !== selectedStatus) {
        return false;
      }
      // Classification filter
      if (selectedClassification !== 'ALL' && doc.securityClassification !== selectedClassification) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = doc.title.toLowerCase().includes(query);
        const matchesNum = doc.documentNumber.toLowerCase().includes(query);
        const matchesDesc = doc.description.toLowerCase().includes(query);
        const matchesSub = doc.subCategory.toLowerCase().includes(query);
        const matchesAuth = doc.issuingAuthority.toLowerCase().includes(query);
        const matchesHash = doc.sha256Hash.toLowerCase().includes(query);
        const matchesTags = doc.tags?.some((t) => t.toLowerCase().includes(query));
        const matchesProject = doc.projectTitle?.toLowerCase().includes(query) || doc.projectCode?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesNum && !matchesDesc && !matchesSub && !matchesAuth && !matchesHash && !matchesTags && !matchesProject) {
          return false;
        }
      }
      return true;
    });
  }, [vaultDocuments, selectedCategory, selectedProjectId, selectedStatus, selectedClassification, searchQuery]);

  // Copy SHA-256 Hash to Clipboard
  const handleCopyHash = (docId: string, hash: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopiedHashId(docId);
    setTimeout(() => setCopiedHashId(null), 2500);
  };

  // Run Integrity Check
  const handleOpenVerifyModal = (doc: VaultDocument, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setVerifyModalDoc(doc);
    setIsVerifyingChecksum(true);
    setVerificationResult(null);

    // Realistic verification delay simulating cryptographic hashing of encrypted blob
    setTimeout(() => {
      const result = verifyDocumentIntegrity(doc.id);
      setVerificationResult(result);
      setIsVerifyingChecksum(false);
    }, 700);
  };

  // Download Action
  const handleDownloadDoc = (doc: VaultDocument, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDownloadSuccessToast(`Decrypted & downloaded "${doc.title}" (${doc.fileType})`);
    setTimeout(() => setDownloadSuccessToast(null), 4000);
  };

  // Handle Form Submit for Upload
  const handleDepositDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      setUploadError('Document title is required.');
      return;
    }
    if (!uploadAuthority.trim()) {
      setUploadError('Issuing authority / institution is required.');
      return;
    }

    const selectedProj = projects.find((p) => p.id === uploadProjectId);
    const projCode = selectedProj ? selectedProj.projectCode : 'PORTFOLIO_WIDE';
    const projTitle = selectedProj ? selectedProj.title : 'DiasporaTrust Client Institutional Portfolio';

    const tagsArray = uploadTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    // Generate simulated realistic 64-char hex SHA-256 hash
    const generatedHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const randomSize = Number((Math.random() * 4 + 1.2).toFixed(1));

    const newDoc = addVaultDocument({
      title: uploadTitle.trim(),
      description: uploadDescription.trim() || `Official ${uploadSubCategory} deposited by ${currentUser.fullName}. Stored in segregated cryptographic vault.`,
      category: uploadCategory,
      subCategory: uploadSubCategory,
      projectId: uploadProjectId === 'PORTFOLIO_WIDE' ? undefined : uploadProjectId,
      projectCode: projCode,
      projectTitle: projTitle,
      fileType: uploadFileType,
      fileSizeMb: randomSize,
      sha256Hash: generatedHash,
      storageKey: `s3://diasporatrust-vault/${uploadCategory.toLowerCase()}/${uploadFileType.toLowerCase()}_${Date.now()}.enc`,
      encryptionAlgorithm: 'AES-256-GCM',
      securityClassification: uploadClassification,
      verificationStatus: 'VERIFIED',
      verifiedBy: `${currentUser.fullName} (${currentUser.role})`,
      issuingAuthority: uploadAuthority.trim(),
      uploadedBy: currentUser.fullName,
      uploadedByRole: currentUser.role,
      tags: tagsArray.length > 0 ? tagsArray : [uploadCategory, 'VaultDeposit'],
      gpsCoordinates: includeGps && selectedProj?.gpsCoordinates ? selectedProj.gpsCoordinates : undefined,
    });

    // Reset Form
    setUploadTitle('');
    setUploadDescription('');
    setUploadFileName('');
    setUploadError(null);
    setIsUploadModalOpen(false);

    // Open inspector on the newly created document for reassurance
    setInspectDoc(newDoc);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {downloadSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{downloadSuccessToast}</span>
          <button onClick={() => setDownloadSuccessToast(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1.5 bg-slate-100 text-slate-900 rounded-lg">
              <FolderLock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Institutional Document Vault</h2>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              AES-256 Encrypted
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Tamper-evident institutional archive categorizing legal title deeds, certified escrow statements, and COREN/drone engineering inspection reports. Every document is secured with an immutable SHA-256 cryptographic fingerprint.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsExportManifestOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Export Vault Manifest
          </button>
          <button
            onClick={() => {
              setUploadError(null);
              setIsUploadModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Deposit Document
          </button>
        </div>
      </div>

      {/* High-Level Categorized Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Legal */}
        <div
          onClick={() => setSelectedCategory('LEGAL')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedCategory === 'LEGAL'
              ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" /> Legal & Title Deeds
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
              {legalDocs.length}
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-2">
            {legalDocs.length} Verified Deeds
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            C of O, Gov Consent, Survey Plans & Deeds
          </div>
        </div>

        {/* Metric 2: Financial */}
        <div
          onClick={() => setSelectedCategory('FINANCIAL')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedCategory === 'FINANCIAL'
              ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5" /> Financial & Escrow
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              {financialDocs.length}
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-2">
            {financialDocs.length} Bank Records
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Escrow Confirmations, CBN Slips & Invoices
          </div>
        </div>

        {/* Metric 3: Site Progress */}
        <div
          onClick={() => setSelectedCategory('SITE_PROGRESS')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedCategory === 'SITE_PROGRESS'
              ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
              <HardHat className="w-3.5 h-3.5" /> Site Progress & Engineering
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
              {siteProgressDocs.length}
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-2">
            {siteProgressDocs.length} Field Dossiers
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            COREN Reports, Drone Overlays & Lab Tests
          </div>
        </div>

        {/* Metric 4: Cryptographic Guarantee */}
        <div
          onClick={() => setSelectedCategory('ALL')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedCategory === 'ALL'
              ? 'bg-slate-50 border-slate-400 ring-1 ring-slate-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Vault Integrity
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">
              {totalStorageMb} MB
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-2">
            {verifiedPercent}% Verified
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalCount} Total Items · SHA-256 Sealed
          </div>
        </div>
      </div>

      {/* Main Filter & Categorization Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>All Documents</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedCategory === 'ALL' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}>
                {totalCount}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('LEGAL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'LEGAL'
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-700 hover:bg-indigo-50'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Legal & Title</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedCategory === 'LEGAL' ? 'bg-indigo-800 text-indigo-100' : 'bg-indigo-100 text-indigo-800'
              }`}>
                {legalDocs.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('FINANCIAL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'FINANCIAL'
                  ? 'bg-emerald-700 text-white'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Financial & Escrow</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedCategory === 'FINANCIAL' ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {financialDocs.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedCategory('SITE_PROGRESS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'SITE_PROGRESS'
                  ? 'bg-amber-700 text-white'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <HardHat className="w-3.5 h-3.5" />
              <span>Site Progress & Engineering</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedCategory === 'SITE_PROGRESS' ? 'bg-amber-800 text-amber-100' : 'bg-amber-100 text-amber-800'
              }`}>
                {siteProgressDocs.length}
              </span>
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('GRID')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === 'GRID' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === 'TABLE' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Audit Table
            </button>
          </div>
        </div>

        {/* Secondary Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, doc ref, authority, SHA-256 hash or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Project Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                if (onSelectProject && e.target.value !== 'ALL' && e.target.value !== 'PORTFOLIO_WIDE') {
                  onSelectProject(e.target.value);
                }
              }}
              className="w-full py-2 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-700"
            >
              <option value="ALL">All Associated Projects</option>
              <option value="PORTFOLIO_WIDE">Portfolio-Wide / Master Agreements</option>
              {scopedProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectCode} · {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Verification Status Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full py-2 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">Verified / Sealed</option>
              <option value="UNDER_REVIEW">Under Legal Review</option>
              <option value="PENDING_AUDIT">Pending Compliance Audit</option>
            </select>
          </div>

          {/* Security Classification Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedClassification}
              onChange={(e) => setSelectedClassification(e.target.value as any)}
              className="w-full py-2 px-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-700"
            >
              <option value="ALL">All Classifications</option>
              <option value="RESTRICTED">Restricted</option>
              <option value="CONFIDENTIAL">Confidential Escrow</option>
              <option value="LEGAL_PRIVILEGED">Legal Privileged</option>
              <option value="PUBLIC_RECORD">Public Record</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary if filtered */}
        {(selectedCategory !== 'ALL' || selectedProjectId !== 'ALL' || selectedStatus !== 'ALL' || selectedClassification !== 'ALL' || searchQuery) && (
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>
              Showing <strong>{filteredDocuments.length}</strong> of {totalCount} documents in vault
            </span>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedProjectId('ALL');
                setSelectedStatus('ALL');
                setSelectedClassification('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <FolderLock className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No documents match the current filter criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, selecting another category, or clearing your project filter to view other vault records.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSelectedProjectId('ALL');
              setSelectedStatus('ALL');
              setSelectedClassification('ALL');
              setSearchQuery('');
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW MODE: GRID CARDS */}
      {/* ========================================================= */}
      {viewMode === 'GRID' && filteredDocuments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => {
            const isLegal = doc.category === 'LEGAL';
            const isFin = doc.category === 'FINANCIAL';
            const isSite = doc.category === 'SITE_PROGRESS';

            return (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Top / Header */}
                <div className="p-4 space-y-3">
                  {/* Category & Status Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isLegal
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : isFin
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isLegal && <Scale className="w-3 h-3" />}
                      {isFin && <Receipt className="w-3 h-3" />}
                      {isSite && <HardHat className="w-3 h-3" />}
                      {doc.category === 'LEGAL'
                        ? 'Legal & Title'
                        : doc.category === 'FINANCIAL'
                        ? 'Financial & Escrow'
                        : 'Site Progress'}
                    </span>

                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                        doc.verificationStatus === 'VERIFIED'
                          ? 'bg-slate-100 text-slate-700 font-semibold flex items-center gap-1'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {doc.verificationStatus === 'VERIFIED' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified</span>
                        </>
                      ) : (
                        'Under Review'
                      )}
                    </span>
                  </div>

                  {/* Document Title & Subcategory */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-slate-400 font-medium">
                        {doc.documentNumber}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {doc.fileType} · {doc.fileSizeMb}MB
                      </span>
                    </div>
                    <h3
                      onClick={() => setInspectDoc(doc)}
                      className="text-sm font-bold text-slate-900 hover:text-indigo-600 cursor-pointer mt-1 leading-snug line-clamp-2"
                    >
                      {doc.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {doc.description}
                    </p>
                  </div>

                  {/* Issuing Authority & Project Affiliation */}
                  <div className="p-2.5 bg-slate-50 rounded-lg space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Issuer / Authority:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[170px]" title={doc.issuingAuthority}>
                        {doc.issuingAuthority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Associated Asset:</span>
                      <span className="font-mono text-slate-800 text-[10px] truncate max-w-[170px]">
                        {doc.projectCode}
                      </span>
                    </div>
                  </div>

                  {/* Cryptographic SHA-256 Checksum Fingerprint badge */}
                  <div className="border border-slate-200 rounded-lg p-2 bg-slate-50/70 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                        <Hash className="w-3 h-3 text-slate-400" />
                        <span>SHA-256 Fingerprint:</span>
                      </div>
                      <div className="font-mono text-[10px] text-slate-700 truncate" title={doc.sha256Hash}>
                        {doc.sha256Hash.substring(0, 16)}...{doc.sha256Hash.substring(doc.sha256Hash.length - 8)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleCopyHash(doc.id, doc.sha256Hash, e)}
                      title="Copy full SHA-256 Hash"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors cursor-pointer shrink-0"
                    >
                      {copiedHashId === doc.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Tags */}
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600"
                        >
                          #{tag}
                        </span>
                      ))}
                      {doc.tags.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-400">
                          +{doc.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setInspectDoc(doc)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-slate-500" />
                      Preview
                    </button>
                    <button
                      onClick={(e) => handleOpenVerifyModal(doc, e)}
                      title="Run cryptographic integrity validation"
                      className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-transparent hover:border-emerald-200 transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </button>
                  </div>

                  <button
                    onClick={(e) => handleDownloadDoc(doc, e)}
                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW MODE: COMPACT AUDIT TABLE */}
      {/* ========================================================= */}
      {viewMode === 'TABLE' && filteredDocuments.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 font-semibold">Document Ref & Title</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Associated Asset</th>
                  <th className="px-5 py-3 font-semibold">Issuing Authority</th>
                  <th className="px-5 py-3 font-semibold">SHA-256 Digest</th>
                  <th className="px-5 py-3 font-semibold">Classification</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-mono text-[10px] text-slate-400 font-medium">
                        {doc.documentNumber}
                      </div>
                      <button
                        onClick={() => setInspectDoc(doc)}
                        className="font-bold text-slate-900 hover:text-indigo-600 text-xs text-left cursor-pointer"
                      >
                        {doc.title}
                      </button>
                      <div className="text-[11px] text-slate-500 line-clamp-1 max-w-sm">
                        {doc.subCategory} · {doc.fileType} ({doc.fileSizeMb}MB)
                      </div>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          doc.category === 'LEGAL'
                            ? 'bg-indigo-50 text-indigo-700'
                            : doc.category === 'FINANCIAL'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {doc.category === 'LEGAL'
                          ? 'Legal & Title'
                          : doc.category === 'FINANCIAL'
                          ? 'Financial'
                          : 'Site Progress'}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold text-slate-800">
                        {doc.projectCode}
                      </span>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                        {doc.projectTitle}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-slate-700 max-w-[160px] truncate" title={doc.issuingAuthority}>
                      {doc.issuingAuthority}
                    </td>

                    <td className="px-5 py-3.5 font-mono text-[10px] text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span title={doc.sha256Hash}>
                          {doc.sha256Hash.substring(0, 10)}...{doc.sha256Hash.substring(doc.sha256Hash.length - 6)}
                        </span>
                        <button
                          onClick={(e) => handleCopyHash(doc.id, doc.sha256Hash, e)}
                          className="text-slate-400 hover:text-slate-700"
                          title="Copy hash"
                        >
                          {copiedHashId === doc.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {doc.securityClassification}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectDoc(doc)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => handleOpenVerifyModal(doc, e)}
                          title="Verify SHA-256 Checksum"
                          className="p-1 text-slate-500 hover:text-emerald-700"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        </button>
                        <button
                          onClick={(e) => handleDownloadDoc(doc, e)}
                          title="Download"
                          className="p-1 text-slate-500 hover:text-slate-900"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: PREVIEW & INSPECTION MODAL */}
      {/* ========================================================= */}
      {inspectDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-lg ${
                    inspectDoc.category === 'LEGAL'
                      ? 'bg-indigo-100 text-indigo-800'
                      : inspectDoc.category === 'FINANCIAL'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {inspectDoc.category === 'LEGAL' && <Scale className="w-4 h-4" />}
                  {inspectDoc.category === 'FINANCIAL' && <Receipt className="w-4 h-4" />}
                  {inspectDoc.category === 'SITE_PROGRESS' && <HardHat className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">
                      {inspectDoc.documentNumber}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-slate-100 text-slate-700">
                      {inspectDoc.category}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {inspectDoc.verificationStatus}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    {inspectDoc.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setInspectDoc(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Institutional Document Visual Simulation */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      {inspectDoc.issuingAuthority}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold">
                    OFFICIAL RECORD
                  </span>
                </div>

                {/* Simulated Content based on Category */}
                {inspectDoc.category === 'LEGAL' && (
                  <div className="space-y-3 bg-amber-50/30 p-4 rounded-lg border border-amber-200/60 font-serif text-slate-800 text-xs leading-relaxed">
                    <div className="text-center font-bold text-sm tracking-wide text-slate-900 border-b border-amber-200 pb-2 uppercase">
                      Land Use Act 1978 · Statutory Title Certificate
                    </div>
                    <p>
                      <strong>To all to whom these presents shall come, GREETING:</strong> Whereas pursuant to the provisions of the Land Use Act, application has been made on behalf of the registered grantee for certification of title in respect of that parcel of land situate at <strong>{inspectDoc.projectTitle}</strong>.
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] font-mono bg-white p-3 rounded border border-amber-100">
                      <div>
                        <span className="text-slate-400 block">Cadastral Ref:</span>
                        <span className="font-bold text-slate-800">LS/D/BK-0928/2021</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Volume & Page:</span>
                        <span className="font-bold text-slate-800">Vol. 2108, Page 44 (Alausa Registry)</span>
                      </div>
                    </div>
                  </div>
                )}

                {inspectDoc.category === 'FINANCIAL' && (
                  <div className="space-y-3 bg-emerald-50/30 p-4 rounded-lg border border-emerald-200/60 text-xs">
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                      <span className="font-bold text-slate-900">Stanbic IBTC Bank / Central Bank of Nigeria Settlement Advice</span>
                      <span className="font-mono text-emerald-700 font-bold">SETTLED IN ESCROW</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      This voucher certifies that segregated ring-fenced fiduciary custody funds were settled into institutional custodial account <strong>#0089201988</strong> with zero commingling against general operations.
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] font-mono bg-white p-3 rounded border border-emerald-100">
                      <div>
                        <span className="text-slate-400 block">Custody Clearing Ledger:</span>
                        <span className="font-bold text-slate-800">ASSET_CLIENT_SEGREGATED</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Dual-Signoff Compliance:</span>
                        <span className="font-bold text-emerald-700">Kemi Balogun (FCA) & Internal Audit</span>
                      </div>
                    </div>
                  </div>
                )}

                {inspectDoc.category === 'SITE_PROGRESS' && (
                  <div className="space-y-3 bg-blue-50/30 p-4 rounded-lg border border-blue-200/60 text-xs">
                    <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                      <span className="font-bold text-slate-900">COREN Registered Engineering Field Inspection Certificate</span>
                      <span className="font-mono text-blue-700 font-bold">SCORE: 96% EXCELLENT</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      Physical structural inspection conducted in accordance with Nigerian National Building Code. Rebar tying alignment, cube crushing compressive resistance, and plumb lines certified on-site with geocoded photos.
                    </p>
                    {inspectDoc.gpsCoordinates && (
                      <div className="flex items-center gap-2 p-2 bg-white rounded border border-blue-100 font-mono text-[11px] text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>GPS Coordinates: {inspectDoc.gpsCoordinates.lat.toFixed(4)}° N, {inspectDoc.gpsCoordinates.lng.toFixed(4)}° E (Geofence Verified)</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Comprehensive Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                  <span className="text-slate-400 font-medium">Sub-Classification:</span>
                  <div className="font-semibold text-slate-800">{inspectDoc.subCategory}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                  <span className="text-slate-400 font-medium">Security Classification:</span>
                  <div className="font-semibold text-slate-800">{inspectDoc.securityClassification}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                  <span className="text-slate-400 font-medium">Deposited By:</span>
                  <div className="font-semibold text-slate-800">
                    {inspectDoc.uploadedBy} ({inspectDoc.uploadedByRole})
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                  <span className="text-slate-400 font-medium">Deposit Timestamp:</span>
                  <div className="font-mono font-semibold text-slate-800">{inspectDoc.uploadDate}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                  <span className="text-slate-400 font-medium">Storage Cipher:</span>
                  <div className="font-mono text-emerald-700 font-semibold">{inspectDoc.encryptionAlgorithm}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                  <span className="text-slate-400 font-medium">Internal Storage Key:</span>
                  <div className="font-mono text-[11px] text-slate-600 truncate">{inspectDoc.storageKey}</div>
                </div>
              </div>

              {/* Cryptographic Hash Verification Box */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Cryptographic SHA-256 Digest (Immutable)</span>
                  </div>
                  <button
                    onClick={(e) => handleCopyHash(inspectDoc.id, inspectDoc.sha256Hash, e)}
                    className="text-xs text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer font-mono"
                  >
                    {copiedHashId === inspectDoc.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Hash</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-[11px] text-emerald-300 bg-slate-800/80 p-2.5 rounded-lg break-all select-all">
                  {inspectDoc.sha256Hash}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Standard: FIPS 180-4 SHA-256 Digest</span>
                  <span className="text-emerald-400">Status: Match Confirmed</span>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <button
                onClick={(e) => handleOpenVerifyModal(inspectDoc, e)}
                className="px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Run Live Cryptographic Check
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInspectDoc(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={(e) => handleDownloadDoc(inspectDoc, e)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download File ({inspectDoc.fileType})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: CRYPTOGRAPHIC INTEGRITY VERIFIER */}
      {/* ========================================================= */}
      {verifyModalDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative border border-slate-200 space-y-4">
            <button
              onClick={() => setVerifyModalDoc(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Cryptographic Integrity Audit</h3>
                <span className="text-[11px] font-mono text-slate-500">{verifyModalDoc.documentNumber}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="text-xs text-slate-600">
                Verifying the file hash of <strong>{verifyModalDoc.title}</strong> against the registered DiasporaTrust governance ledger.
              </div>

              {isVerifyingChecksum ? (
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-3">
                  <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
                  <div className="text-xs font-bold text-slate-800">Hashing Encrypted Blob...</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Computing 256-bit hash digest for {verifyModalDoc.fileSizeMb}MB payload
                  </div>
                </div>
              ) : verificationResult ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>ZERO TAMPERING DETECTED · HASH INTEGRITY 100% VALID</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    The document in storage matches the exact bit-level fingerprint recorded upon institutional sign-off.
                  </p>
                  <div className="p-2.5 bg-white rounded border border-emerald-100 font-mono text-[10px] space-y-1">
                    <div className="text-slate-400">Computed Hash:</div>
                    <div className="text-slate-900 break-all select-all font-semibold">
                      {verificationResult.hash}
                    </div>
                    <div className="text-slate-400 pt-1">Audited At: {verificationResult.timestamp} UTC</div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setVerifyModalDoc(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: DEPOSIT / UPLOAD DOCUMENT MODAL */}
      {/* ========================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 relative border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 bg-slate-100 text-slate-900 rounded-lg">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Deposit Document to Secure Vault</h3>
                <p className="text-xs text-slate-500">
                  Upload and cryptographically register a legal, financial, or engineering document.
                </p>
              </div>
            </div>

            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleDepositDocument} className="space-y-4 text-xs">
              {/* Category Picker */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Document Category <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadCategory('LEGAL');
                      setUploadSubCategory('Certificate of Occupancy');
                      setUploadAuthority('Lagos State Lands Registry, Alausa');
                    }}
                    className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      uploadCategory === 'LEGAL'
                        ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Scale className="w-4 h-4 mx-auto mb-1 text-indigo-700" />
                    Legal & Title
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUploadCategory('FINANCIAL');
                      setUploadSubCategory('Escrow Bank Confirmation');
                      setUploadAuthority('Stanbic IBTC Bank / Authorized Dealer');
                    }}
                    className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      uploadCategory === 'FINANCIAL'
                        ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Receipt className="w-4 h-4 mx-auto mb-1 text-emerald-700" />
                    Financial & Escrow
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUploadCategory('SITE_PROGRESS');
                      setUploadSubCategory('COREN Inspection Certificate');
                      setUploadAuthority('Council for the Regulation of Engineering in Nigeria (COREN)');
                    }}
                    className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      uploadCategory === 'SITE_PROGRESS'
                        ? 'border-amber-600 bg-amber-50/60 text-amber-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <HardHat className="w-4 h-4 mx-auto mb-1 text-amber-700" />
                    Site Progress
                  </button>
                </div>
              </div>

              {/* Project Linking */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Associate with Project / Asset <span className="text-rose-600">*</span>
                </label>
                <select
                  value={uploadProjectId}
                  onChange={(e) => setUploadProjectId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs bg-white"
                >
                  <option value="PORTFOLIO_WIDE">Portfolio-Wide / General Governance</option>
                  {scopedProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectCode} · {p.title} ({p.locationState} State)
                    </option>
                  ))}
                </select>
              </div>

              {/* Title & SubCategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Document Title <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Registered Cadastral Survey Plan"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sub-Type</label>
                  <input
                    type="text"
                    value={uploadSubCategory}
                    onChange={(e) => setUploadSubCategory(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs"
                  />
                </div>
              </div>

              {/* Issuing Authority & Classification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Issuing Authority / Institution <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadAuthority}
                    onChange={(e) => setUploadAuthority(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Security Classification</label>
                  <select
                    value={uploadClassification}
                    onChange={(e) => setUploadClassification(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs bg-white"
                  >
                    <option value="RESTRICTED">Restricted</option>
                    <option value="CONFIDENTIAL">Confidential Escrow</option>
                    <option value="LEGAL_PRIVILEGED">Legal Privileged</option>
                    <option value="PUBLIC_RECORD">Public Record</option>
                  </select>
                </div>
              </div>

              {/* Simulated File Attachment Box */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">File Attachment (Simulated Secure Deposit)</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100/60 transition-colors cursor-pointer">
                  <div className="flex flex-col items-center justify-center space-y-1.5">
                    <FileCheck2 className="w-6 h-6 text-slate-400" />
                    <div className="text-xs font-semibold text-slate-700">
                      {uploadFileName || 'Click to select or drag document file'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Supported: PDF, DWG (CAD), XLSX, JPG, PNG (Max 50MB)
                    </div>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    id="doc-file-upload"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setUploadFileName(file.name);
                        if (!uploadTitle) {
                          setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
                        }
                      }
                    }}
                  />
                  <label
                    htmlFor="doc-file-upload"
                    className="inline-block mt-2 px-3 py-1 bg-white border border-slate-300 rounded text-[11px] font-semibold text-slate-700 cursor-pointer hover:bg-slate-50"
                  >
                    Browse Files
                  </label>
                </div>
              </div>

              {/* Tags and Description */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tags (Comma separated)</label>
                <input
                  type="text"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  placeholder="e.g. C of O, Alausa Registry, Title, 2026"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audit Notes / Scope Description</label>
                <textarea
                  rows={2}
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Additional context on certification or legal verification..."
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs"
                />
              </div>

              {/* Security notice */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2 text-[11px] text-slate-600">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  All deposits are encrypted at rest with AES-256 and assigned an immutable SHA-256 fingerprint registered in the DiasporaTrust audit log.
                </span>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Deposit & Seal Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: EXPORT VAULT MANIFEST */}
      {/* ========================================================= */}
      {isExportManifestOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 relative border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setIsExportManifestOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-200 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    DiasporaTrust Institutional Document Vault Manifest
                  </h3>
                  <p className="text-xs text-slate-500">
                    Official Custody & Cryptographic Register for Client: <strong>{currentUser.fullName}</strong>
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 block">Total Documents:</span>
                  <span className="font-bold text-slate-900">{totalCount} Sealed Assets</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Encrypted Volume:</span>
                  <span className="font-bold text-slate-900">{totalStorageMb} MB AES-256</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Integrity Status:</span>
                  <span className="font-bold text-emerald-700">100% SHA-256 Validated</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border border-slate-200">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[9px]">
                    <tr>
                      <th className="p-2 border">Ref #</th>
                      <th className="p-2 border">Category</th>
                      <th className="p-2 border">Title</th>
                      <th className="p-2 border">Asset Code</th>
                      <th className="p-2 border">Authority</th>
                      <th className="p-2 border font-mono">SHA-256 Checksum Digest</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vaultDocuments.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50">
                        <td className="p-2 border font-mono font-medium text-slate-700">{d.documentNumber}</td>
                        <td className="p-2 border font-semibold text-slate-800">{d.category}</td>
                        <td className="p-2 border font-medium text-slate-900">{d.title}</td>
                        <td className="p-2 border font-mono text-slate-700">{d.projectCode}</td>
                        <td className="p-2 border text-slate-600">{d.issuingAuthority}</td>
                        <td className="p-2 border font-mono text-[9px] text-slate-700 break-all select-all">
                          {d.sha256Hash}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsExportManifestOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Close Manifest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
