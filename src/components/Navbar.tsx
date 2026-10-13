import React, { useState } from 'react';
import { useApp, WorkspaceView } from '../store/AppContext';
import { useCurrency } from '../hooks/useCurrency';
import { ClientAuthModal } from './ClientAuthModal';
import {
  Shield,
  ChevronDown,
  CheckCircle2,
  UserCircle,
  Globe,
  Lock,
  UserPlus,
  LogIn,
  LogOut,
  Sparkles,
  ShieldAlert,
  Building2,
  HardHat
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentWorkspace,
    setCurrentWorkspace,
    currentUser,
    isAuthenticated,
    authRole,
    logout,
    openChatbotWithPrompt,
    setChatbotOpen,
  } = useApp();
  const { currency, setCurrency, allCurrencies } = useCurrency();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'SIGN_UP' | 'SIGN_IN'>('SIGN_IN');

  const handleClientPortalClick = () => {
    if (!isAuthenticated || authRole !== 'CLIENT') {
      setAuthModalMode('SIGN_IN');
      setAuthModalOpen(true);
    } else {
      setCurrentWorkspace('CLIENT');
    }
  };

  const handleAdminPortalClick = () => {
    setCurrentWorkspace('ADMIN');
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Wordmark */}
        <div
          onClick={() => setCurrentWorkspace('PUBLIC')}
          className="flex items-center gap-3 shrink-0 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm font-bold text-lg">
            D
          </div>
          <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap">
            DiasporaTrust
          </span>
        </div>

        {/* Navigation Links based on Authentication State */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-1">
          {/* Public Visitor Navigation */}
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => setCurrentWorkspace('PUBLIC')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  currentWorkspace === 'PUBLIC'
                    ? 'bg-slate-800 text-emerald-400 font-semibold border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Overview
              </button>
              <a
                href="#what-we-do"
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-md whitespace-nowrap transition-colors"
              >
                What We Do
              </a>
              <a
                href="#client-progress"
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-md whitespace-nowrap transition-colors"
              >
                Client Work Progress
              </a>
              <button
                onClick={() => openChatbotWithPrompt('African Market Update & Services Enquiry')}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:text-emerald-200 bg-emerald-950/40 border border-emerald-800/50 hover:bg-emerald-900/50 rounded-md whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>AI Advisory Copilot</span>
              </button>
            </>
          ) : authRole === 'CLIENT' ? (
            /* Authorized Client Navigation */
            <>
              <button
                onClick={() => setCurrentWorkspace('CLIENT')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  currentWorkspace === 'CLIENT'
                    ? 'bg-slate-800 text-emerald-400 font-semibold border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                My Confidential Portal
              </button>
              <button
                onClick={() => setCurrentWorkspace('PUBLIC')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  currentWorkspace === 'PUBLIC'
                    ? 'bg-slate-800 text-emerald-400 font-semibold border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Public Overview
              </button>
              <button
                onClick={() => openChatbotWithPrompt('Please help me draft an investment proposal or project cost estimate')}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/40 border border-emerald-800/50 hover:bg-emerald-900/50 rounded-md whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Draft Proposal with AI</span>
              </button>
            </>
          ) : (
            /* Authorized Admin / Staff Navigation */
            <>
              <button
                onClick={() => setCurrentWorkspace('ADMIN')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  currentWorkspace === 'ADMIN'
                    ? 'bg-slate-800 text-purple-400 font-semibold border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Operations Desk
              </button>
              <button
                onClick={() => setCurrentWorkspace('FINANCE')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  currentWorkspace === 'FINANCE'
                    ? 'bg-slate-800 text-emerald-400 font-semibold border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Finance & Ledger
              </button>
              <button
                onClick={() => setCurrentWorkspace('VENDOR')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  currentWorkspace === 'VENDOR'
                    ? 'bg-slate-800 text-amber-400 font-semibold border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Field QA
              </button>
              <button
                onClick={() => setCurrentWorkspace('COMPLIANCE')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  currentWorkspace === 'COMPLIANCE'
                    ? 'bg-slate-800 text-sky-400 font-semibold border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Compliance
              </button>
              <button
                onClick={() => setCurrentWorkspace('PUBLIC')}
                className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Public Site
              </button>
            </>
          )}
        </nav>

        {/* Right Zone: Currency Switcher, AI Chatbot Trigger & Authentication Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Multi-Currency Segmented Switcher */}
          <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg p-0.5">
            {allCurrencies.map((c) => (
              <button
                key={c.code}
                onClick={() => setCurrency(c.code)}
                title={`${c.name} (1 ${c.code} = ₦${c.rateToNgn.toLocaleString()})`}
                className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  currency === c.code
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {c.code}
              </button>
            ))}
          </div>

          {/* AI Chatbot Launcher in Header */}
          <button
            onClick={() => setChatbotOpen(true)}
            className="p-2 sm:px-3 sm:py-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Open Gemini AI Investment Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>

          {/* Authentication Actions */}
          {!isAuthenticated ? (
            /* PUBLIC VISITOR ACTIONS */
            <div className="flex items-center gap-2">
              <button
                onClick={handleClientPortalClick}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors cursor-pointer"
                title="Sign in with your authorized client account"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Client</span> Sign In
              </button>

              <button
                onClick={() => {
                  setAuthModalMode('SIGN_UP');
                  setAuthModalOpen(true);
                }}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>

              <button
                onClick={handleAdminPortalClick}
                className="p-1.5 text-slate-400 hover:text-purple-400 border border-transparent hover:border-slate-700 rounded-lg transition-colors cursor-pointer"
                title="Operations & Admin Login"
              >
                <Shield className="w-4 h-4" />
              </button>
            </div>
          ) : authRole === 'CLIENT' ? (
            /* AUTHORIZED CLIENT ACTIONS */
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-emerald-950/50 border border-emerald-800/60 rounded-lg px-2.5 py-1 text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-emerald-200 hidden sm:inline">{currentUser.fullName}</span>
                <span className="text-[10px] text-emerald-400 font-mono">({currentUser.cityOfResidence})</span>
              </div>

              <button
                onClick={logout}
                className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs text-slate-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                title="Log out and return to public overview"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit Portal</span>
              </button>
            </div>
          ) : (
            /* AUTHORIZED ADMIN / STAFF ACTIONS */
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-purple-950/60 border border-purple-800/60 rounded-lg px-2.5 py-1 text-xs">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <span className="font-semibold text-purple-200 hidden sm:inline">{currentUser.fullName}</span>
                <span className="text-[10px] text-purple-300 font-bold">
                  {authRole === 'MAIN_ADMIN' ? 'Main Admin' : 'Ops Admin'}
                </span>
              </div>

              <button
                onClick={logout}
                className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs text-slate-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                title="Log out and return to public overview"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin Exit</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-2 bg-slate-950 border-t border-slate-800 text-xs">
        {!isAuthenticated ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentWorkspace('PUBLIC')}
              className={`px-2 py-1 rounded text-[11px] ${
                currentWorkspace === 'PUBLIC' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400'
              }`}
            >
              Public Overview
            </button>
            <button
              onClick={handleClientPortalClick}
              className="px-2 py-1 rounded text-[11px] text-emerald-400 font-semibold flex items-center gap-1"
            >
              <Lock className="w-3 h-3" /> Client Portal
            </button>
            <button
              onClick={handleAdminPortalClick}
              className="px-2 py-1 rounded text-[11px] text-purple-400 font-medium flex items-center gap-1"
            >
              <Shield className="w-3 h-3" /> Admin Desk
            </button>
          </div>
        ) : authRole === 'CLIENT' ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] text-emerald-300 font-semibold">
              Client: {currentUser.fullName}
            </span>
            <button
              onClick={logout}
              className="text-[11px] text-rose-400 font-semibold"
            >
              Log Out
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] text-purple-300 font-semibold">
              Staff: {currentUser.fullName}
            </span>
            <button
              onClick={logout}
              className="text-[11px] text-rose-400 font-semibold"
            >
              Admin Exit
            </button>
          </div>
        )}
      </div>

      {/* Client Sign-Up / Sign-In Modal */}
      <ClientAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </header>
  );
};
