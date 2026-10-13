import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { useCurrency } from '../hooks/useCurrency';
import { ClientAuthModal } from './ClientAuthModal';
import { Project, Milestone } from '../types';
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  MapPin,
  ArrowRight,
  TrendingUp,
  Building,
  Sprout,
  Briefcase,
  Lock,
  Camera,
  AlertTriangle,
  X,
  UserPlus,
  LogIn,
  Eye,
  Clock,
  Layers,
  ChevronRight,
  Check,
  Sparkles
} from 'lucide-react';

export const PublicWebsite: React.FC = () => {
  const { setCurrentWorkspace, projects, milestones, currentUser } = useApp();
  const { format, currency } = useCurrency();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'SIGN_UP' | 'SIGN_IN'>('SIGN_UP');

  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: 'United States',
    serviceCategory: 'CONSTRUCTION_MANAGEMENT',
    targetLocation: 'Lagos State (Lekki / Ikoyi Axis)',
    estimatedBudgetUsd: '100,000 - 250,000',
    scopeNotes: '',
  });

  // Client Work Progress Section Filters
  const [progressFilter, setProgressFilter] = useState<'ALL' | 'CONSTRUCTION' | 'AGRICULTURE' | 'LAND_ACQUISITION'>('ALL');
  const [inspectedProject, setInspectedProject] = useState<Project | null>(null);

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnquirySuccess(true);
  };

  const handleOpenAuth = (mode: 'SIGN_UP' | 'SIGN_IN') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  // Filter projects for the public showcase
  const filteredProjects = projects.filter((p) => {
    if (progressFilter === 'ALL') return true;
    return p.projectType === progressFilter;
  });

  const getClientBadge = (clientId?: string) => {
    if (clientId === 'usr-client-02') {
      return { code: 'Client CLI-882', location: 'London, UK', name: 'Engr. Funke A.' };
    }
    return { code: 'Client CLI-701', location: 'Atlanta, USA', name: 'Dr. Emeka O.' };
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* 1. HERO SECTION */}
      <section className="relative bg-slate-950 text-white overflow-hidden border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Institutional Project Governance in Nigeria</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] max-w-2xl">
                Your Investments in Nigeria. Managed with Total Transparency.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                From luxury residential construction and commercial agricultural cycles to land registry title searches, DiasporaTrust provides global Nigerians with institutional fiduciary oversight, independent engineering verification, and private client portals.
              </p>

              {/* Action Buttons: Explicit Sign Up & Sign In Before Portal Access */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  onClick={() => handleOpenAuth('SIGN_UP')}
                  className="px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 cursor-pointer flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up as Client</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={() => handleOpenAuth('SIGN_IN')}
                  className="px-5 py-3.5 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-emerald-400" />
                  <span>Client Sign In</span>
                </button>

                <a
                  href="#client-progress"
                  className="px-4 py-3.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span>View Clients Work Progress</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Strict Client Confidentiality</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>COREN Engineering Oversight</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Title Searches at Alausa Lands Registry</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Carrier */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 group">
                <img
                  src="/src/assets/images/hero_diasporatrust_estate_1791679668862.jpg"
                  alt="Contemporary residential estate construction supervised in Lagos Nigeria"
                  referrerPolicy="no-referrer"
                  className="w-full h-80 sm:h-96 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-900/90 backdrop-blur border border-slate-700/80 text-xs">
                  <div className="flex items-center justify-between text-slate-300 mb-1">
                    <span className="font-semibold text-white">Lekki Phase 1 Residential Villa</span>
                    <span className="font-mono text-emerald-400 font-bold tabular-nums">Progress: 68%</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Client: CLI-701 (Atlanta, USA)</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> COREN QA Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CONFIDENTIALITY NOTICE BANNER */}
      <section className="bg-emerald-950 border-b border-emerald-800/80 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white">Strict Individual Client Confidentiality:</span>{' '}
              <span className="text-emerald-200/90">
                Each investor operates inside an isolated, private portal. Your contracts, title deeds, bank statements, and site coordinates are completely invisible to other clients.
              </span>
            </div>
          </div>
          <button
            onClick={() => handleOpenAuth('SIGN_UP')}
            className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Create Your Private Portal
          </button>
        </div>
      </section>

      {/* 3. WHAT WE DO: THREE CORE SERVICE LINES */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              What We Do
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Engineered for accountability across key Nigerian asset classes
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Every mandate follows structured engineering milestones, independent legal due diligence, and verified financial controls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1: Real Estate & Construction */}
            <div className="flex flex-col bg-slate-50 rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors">
              <div className="h-52 overflow-hidden bg-slate-100 relative">
                <img
                  src="/src/assets/images/realestate_construction_site_1791679679170.jpg"
                  alt="Construction and structural engineering management in Lagos Nigeria"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur text-white text-[10px] font-semibold px-2.5 py-1 rounded">
                  01. REAL ESTATE & BUILD
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    Construction & Development Management
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    End-to-end residential and commercial construction oversight. Bills of quantities (BOQ) audit, contractor vetting, COREN-certified structural testing, and milestone-governed disbursements.
                  </p>
                  <ul className="text-xs text-slate-600 space-y-1.5 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Concrete cube crush tests & rebar certificates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Dated GPS-tagged high-resolution photography</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>No payouts before client milestone sign-off</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handleOpenAuth('SIGN_UP')}
                  className="w-full py-2.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer text-center"
                >
                  Sign Up for Construction Mandate
                </button>
              </div>
            </div>

            {/* Service 2: Agricultural Investment & Farm Operations */}
            <div className="flex flex-col bg-slate-50 rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors">
              <div className="h-52 overflow-hidden bg-slate-100 relative">
                <img
                  src="/src/assets/images/agriculture_farm_operations_1791679688199.jpg"
                  alt="Commercial agricultural farmland and crop management in Nigeria"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur text-white text-[10px] font-semibold px-2.5 py-1 rounded">
                  02. AGRICULTURE
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    Managed Farm Cycles & Agro-Infrastructure
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    Commercial agricultural execution across cashew, maize, cassava, and poultry. Full agronomic supervision, solar drip irrigation setups, input verification, and transparent sales accounting.
                  </p>
                  <ul className="text-xs text-slate-600 space-y-1.5 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Certified seedling sourcing & health inspections</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Licensed off-taker weighbridge documentation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Strict distinction between projected vs actual yields</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handleOpenAuth('SIGN_UP')}
                  className="w-full py-2.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer text-center"
                >
                  Sign Up for Agricultural Project
                </button>
              </div>
            </div>

            {/* Service 3: Consultation & Title Due Diligence */}
            <div className="flex flex-col bg-slate-50 rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors">
              <div className="h-52 overflow-hidden bg-slate-100 relative">
                <img
                  src="/src/assets/images/consultation_advisory_meeting_1791679698861.jpg"
                  alt="Executive advisory and feasibility consulting in Lagos"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur text-white text-[10px] font-semibold px-2.5 py-1 rounded">
                  03. ADVISORY & TITLE SEARCH
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    Land Title Due Diligence & Advisory
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    Independent legal scrutiny at State Lands Registries (Alausa Ikeja, Ogun Bureau of Lands), cadastral chartings, Governor's Consent verifications, and business feasibility studies.
                  </p>
                  <ul className="text-xs text-slate-600 space-y-1.5 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Surveyor beacon coordinate verification</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Encumbrance & family chieftaincy dispute checks</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Executive financial models & NEPC export briefs</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handleOpenAuth('SIGN_UP')}
                  className="w-full py-2.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer text-center"
                >
                  Book Advisory Consultation
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CLIENTS WORK PROGRESS: LIVE MILESTONE SHOWCASE */}
      <section id="client-progress" className="py-20 bg-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider mb-2">
                <Clock className="w-3.5 h-3.5 text-slate-600" />
                <span>Live Portfolio Transparency</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Clients Work Progress & Milestone Verification
              </h2>
              <p className="mt-2 text-base text-slate-600 max-w-2xl">
                Real-time progress tracking across active diaspora client investments in Nigeria.
                Every percentage increase is backed by independent engineering inspections and timestamped photographic proof.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
              {[
                { id: 'ALL', label: 'All Projects' },
                { id: 'CONSTRUCTION', label: 'Construction' },
                { id: 'AGRICULTURE', label: 'Agriculture' },
                { id: 'LAND_ACQUISITION', label: 'Land & Survey' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setProgressFilter(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    progressFilter === tab.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Project Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const projMilestones = milestones.filter((m) => m.projectId === project.id);
              const latestEvidence = projMilestones
                .flatMap((m) => m.evidenceItems)
                .find((e) => e.category === 'SITE_PHOTO' || e.thumbnailUrl);

              const activeOrNextMilestone =
                projMilestones.find((m) => m.status === 'INTERNAL_VERIFIED' || m.status === 'SUBMITTED_FOR_REVIEW') ||
                projMilestones.find((m) => m.status === 'IN_PROGRESS') ||
                projMilestones[0];

              const clientBadge = getClientBadge(project.clientId);

              return (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-slate-300 hover:shadow-md transition-all"
                >
                  {/* Card Media Preview */}
                  <div className="h-48 relative overflow-hidden bg-slate-900">
                    <img
                      src={
                        latestEvidence?.thumbnailUrl ||
                        (project.projectType === 'AGRICULTURE'
                          ? '/src/assets/images/agriculture_farm_operations_1791679688199.jpg'
                          : project.projectType === 'LAND_ACQUISITION'
                          ? '/src/assets/images/site_survey_cadastral_1791788889389.jpg'
                          : '/src/assets/images/site_foundation_rebar_1791788795760.jpg')
                      }
                      alt={project.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                    {/* Confidential Anonymized Client Badge */}
                    <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-lg px-2.5 py-1 text-[11px] font-medium text-slate-200 flex items-center gap-1.5 shadow-sm">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      <span>{clientBadge.code}</span>
                      <span className="text-slate-400">({clientBadge.location})</span>
                    </div>

                    <div className="absolute top-3 right-3 bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                      {project.status.replace(/_/g, ' ')}
                    </div>

                    {/* Bottom overlay with GPS coordinates */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        {project.locationCity}, {project.locationState} State
                      </span>
                      {project.gpsCoordinates && (
                        <span className="font-mono text-[10px] text-slate-400">
                          {project.gpsCoordinates.lat.toFixed(4)}°N, {project.gpsCoordinates.lng.toFixed(4)}°E
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="text-[11px] text-slate-500 font-mono font-medium mb-1">
                        {project.projectCode} · {project.projectType.replace(/_/g, ' ')}
                      </div>
                      <h3 className="font-bold text-base text-slate-900 leading-snug">
                        {project.title}
                      </h3>
                    </div>

                    {/* Progress Bar & Metric */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-700">Completion Progress</span>
                        <span className="font-bold font-mono text-emerald-600 text-sm tabular-nums">
                          {project.progressPercent}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${project.progressPercent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                        <span>Milestones: {project.completedMilestones} of {project.milestonesCount} Completed</span>
                        <span>Lead: {project.leadEngineer.split(' ')[0]} {project.leadEngineer.split(' ')[1]}</span>
                      </div>
                    </div>

                    {/* Current Milestone Highlight */}
                    {activeOrNextMilestone && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">
                          Active Verification Stage
                        </div>
                        <div className="font-semibold text-slate-900 line-clamp-1">
                          {activeOrNextMilestone.title}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>COREN QA & On-Site Surveyor Verification</span>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => setInspectedProject(project)}
                        className="flex-1 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Progress Proof</span>
                      </button>

                      <button
                        onClick={() => handleOpenAuth('SIGN_UP')}
                        className="py-2 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <span>Start Similar</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. HOW DIASPORATRUST WORKS (4-STAGE GOVERNANCE) */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Operational Governance Framework
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              How DiasporaTrust Protects Your Capital
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Eliminating the single point of failure: Family reliance, untracked cash advances, and unverified contractor claims are replaced with institutional protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h3 className="font-bold text-slate-900 text-base">Mandate & Scope Setup</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You execute an explicit bilateral service contract defining project scope, bills of quantities, milestone acceptance criteria, and transparent 5% platform management fees.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h3 className="font-bold text-slate-900 text-base">Segregated Account Custody</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Funds are held in segregated trust accounts (USD/NGN) with licensed commercial banks. Every deposit and release is tracked in an immutable double-entry ledger.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h3 className="font-bold text-slate-900 text-base">Physical QA & Verification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Registered engineers and agronomists conduct physical site inspections, capturing GPS-stamped photo/video evidence and engineering test reports.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                04
              </div>
              <h3 className="font-bold text-slate-900 text-base">Dual-Auth Payout Release</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You review evidence and approve the milestone in your portal. DiasporaTrust Finance independently dual-authorizes the contractor disbursement via electronic settlement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. QUANTITATIVE SUPERVISION NUMBERS */}
      <section className="py-16 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono tabular-nums">
                ₦358.5M
              </div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">
                Capital Under Supervision
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono tabular-nums">
                100%
              </div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">
                Milestones Verified with Evidence
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums">
                0
              </div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">
                Unreconciled Ledger Variances
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono tabular-nums">
                24/7
              </div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">
                Private Diaspora Portal Visibility
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION FOR CLIENT PORTAL ACCESS */}
      <section className="py-16 bg-emerald-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800 border border-emerald-700 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Dedicated Confidential Client Workspaces</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Manage Your Nigerian Investments with Total Governance?
          </h2>

          <p className="text-emerald-100 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Before accessing the client portal, you must sign up for your private account.
            Every client receives an isolated portal guaranteeing complete confidentiality for legal title documents, financial escrow ledgers, and photographic site inspection assets.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => handleOpenAuth('SIGN_UP')}
              className="px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-950 bg-white hover:bg-emerald-50 rounded-xl transition-all shadow-lg cursor-pointer flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-emerald-700" />
              <span>Sign Up for Your Private Portal</span>
            </button>

            <button
              onClick={() => handleOpenAuth('SIGN_IN')}
              className="px-6 py-3.5 text-xs sm:text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-700 border border-emerald-600 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
            >
              <LogIn className="w-4 h-4 text-emerald-300" />
              <span>Existing Client Sign In</span>
            </button>
          </div>
        </div>
      </section>

      {/* 8. RISK DISCLOSURES & STATUTORY BOUNDARIES */}
      <section className="py-16 bg-slate-100 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 bg-white rounded-xl border border-slate-300 space-y-4">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Mandatory Risk Disclosures & Operational Constraints</span>
            </div>
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                <strong>No Guaranteed Returns:</strong> DiasporaTrust does not offer pooled investment schemes, collective investment vehicles, or guaranteed capital returns. Agricultural and commercial projects carry inherent operating risks including seasonal rainfall variations, macroeconomic input inflation, and market commodity prices.
              </p>
              <p>
                <strong>Title Verification Disclaimer:</strong> Title due diligence reports reflect records officially registered at relevant State land registries at the search timestamp. Final purchase decisions remain the client’s prerogative following independent legal advice.
              </p>
              <p>
                <strong>Payment & Custody Controls:</strong> Payout releases occur solely upon dual internal authorization and client milestone approval. Funds are never co-mingled with platform operational capital.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. INSPECT PROJECT MILESTONES MODAL */}
      {inspectedProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-6 relative">
              <button
                onClick={() => setInspectedProject(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-[11px] font-mono text-emerald-400 font-semibold mb-1">
                {inspectedProject.projectCode} · {inspectedProject.projectType.replace(/_/g, ' ')}
              </div>
              <h3 className="text-xl font-bold text-white">{inspectedProject.title}</h3>
              <p className="text-xs text-slate-300 mt-1">
                {inspectedProject.siteAddress} · Supervised by {inspectedProject.leadEngineer}
              </p>

              <div className="flex items-center gap-4 mt-4 text-xs">
                <div>
                  <span className="text-slate-400">Progress: </span>
                  <span className="font-mono font-bold text-emerald-400">{inspectedProject.progressPercent}%</span>
                </div>
                <span>·</span>
                <div>
                  <span className="text-slate-400">Completed Milestones: </span>
                  <span className="font-semibold text-white">
                    {inspectedProject.completedMilestones} of {inspectedProject.milestonesCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Milestone Verification Schedule:
              </div>

              {milestones
                .filter((m) => m.projectId === inspectedProject.id)
                .map((m, idx) => {
                  const isDone = m.status === 'CLIENT_APPROVED';
                  const isUnderReview = m.status === 'INTERNAL_VERIFIED' || m.status === 'SUBMITTED_FOR_REVIEW';
                  return (
                    <div
                      key={m.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : isUnderReview
                          ? 'bg-amber-50/50 border-amber-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                              isDone
                                ? 'bg-emerald-600 text-white'
                                : isUnderReview
                                ? 'bg-amber-500 text-white'
                                : 'bg-slate-300 text-slate-700'
                            }`}
                          >
                            {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900">{m.title}</div>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                              {m.description}
                            </p>
                            {m.acceptanceCriteria && m.acceptanceCriteria.length > 0 && (
                              <div className="mt-2 text-[10px] text-slate-500 space-y-0.5">
                                <span className="font-semibold text-slate-700">Acceptance Criteria:</span>
                                {m.acceptanceCriteria.map((c, cIdx) => (
                                  <div key={cIdx} className="flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-slate-400" />
                                    <span>{c}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap shrink-0 ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : isUnderReview
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {m.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Evidence attached */}
                      {m.evidenceItems && m.evidenceItems.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-600 flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{m.evidenceItems.length} Timestamped & Geotagged Evidence Files</span>
                          </span>
                          {m.evidenceItems[0].gpsCoordinates && (
                            <span className="font-mono text-[10px] text-slate-500">
                              {m.evidenceItems[0].gpsCoordinates.lat.toFixed(4)}°N, {m.evidenceItems[0].gpsCoordinates.lng.toFixed(4)}°E
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                To manage and fund your own project milestones, sign up for your confidential portal.
              </span>
              <button
                onClick={() => {
                  setInspectedProject(null);
                  handleOpenAuth('SIGN_UP');
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Sign Up as Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. CLIENT AUTH MODAL (SIGN UP / SIGN IN) */}
      <ClientAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
};
