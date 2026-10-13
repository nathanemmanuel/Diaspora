import React, { useState } from 'react';
import { useApp, WorkspaceView } from '../store/AppContext';
import { useCurrency } from '../hooks/useCurrency';
import { UserRole } from '../types';
import { ClientAuthModal } from './ClientAuthModal';
import { Shield, ChevronDown, CheckCircle2, UserCircle, Globe, Lock, UserPlus, LogIn } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentWorkspace, setCurrentWorkspace, currentUser, switchUserRole } = useApp();
  const { currency, setCurrency, allCurrencies } = useCurrency();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'SIGN_UP' | 'SIGN_IN'>('SIGN_UP');

  const workspaces: { id: WorkspaceView; label: string }[] = [
    { id: 'PUBLIC', label: 'Public Overview' },
    { id: 'CLIENT', label: 'Client Portal' },
    { id: 'ADMIN', label: 'Operations & Admin' },
    { id: 'FINANCE', label: 'Finance & Ledger' },
    { id: 'VENDOR', label: 'Field & Vendor' },
    { id: 'COMPLIANCE', label: 'Compliance & Audit' },
  ];

  const roleOptions: { role: UserRole; name: string; title: string }[] = [
    { role: 'DIASPORA_CLIENT', name: 'Dr. Emeka Okafor', title: 'Diaspora Client 1 (Atlanta, USA)' },
    { role: 'MAIN_ADMIN', name: 'Dr. Olufemi Balogun', title: 'Main Admin & Fiduciary Trustee' },
    { role: 'ADMIN_OPERATIONS', name: 'Aisha Bello', title: 'Head of Operations (Commissioned by Main Admin)' },
    { role: 'FINANCE_OFFICER', name: 'Kemi Balogun (FCA)', title: 'Finance Officer' },
    { role: 'PROJECT_MANAGER', name: 'Engr. Babatunde Alabi', title: 'Lead Project Manager' },
    { role: 'FIELD_ENGINEER', name: 'Segun Adelekan', title: 'Field QA Engineer' },
    { role: 'VENDOR_CONTRACTOR', name: 'Apex Structural Ltd', title: 'Lead Contractor' },
    { role: 'COMPLIANCE_OFFICER', name: 'Barr. Nnamdi Eze', title: 'Legal & Compliance' },
  ];

  const handleWorkspaceClick = (wsId: WorkspaceView) => {
    if (wsId === 'CLIENT' && currentUser.role !== 'DIASPORA_CLIENT') {
      // Require client registration or sign in before accessing client portal
      setAuthModalMode('SIGN_IN');
      setAuthModalOpen(true);
      return;
    }
    setCurrentWorkspace(wsId);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white">
      {/* Primary Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single clean text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm font-bold text-lg">
            D
          </div>
          <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap">
            DiasporaTrust
          </span>
        </div>

        {/* Zone 2: Navigation Links / Workspace Tabs (Single line, quiet) */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
          {workspaces.map((ws) => {
            const isActive = currentWorkspace === ws.id;
            return (
              <button
                key={ws.id}
                onClick={() => handleWorkspaceClick(ws.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 font-semibold border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {ws.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Currency Switcher & Primary Action & Role Switcher */}
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

          {/* Persona / Role Selector */}
          <div className="relative group">
            <div className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 cursor-pointer text-xs transition-colors">
              <UserCircle className="w-4 h-4 text-emerald-400" />
              <div className="text-left hidden sm:block">
                <div className="font-semibold text-slate-100 whitespace-nowrap">{currentUser.fullName}</div>
                <div className="text-[10px] text-slate-400 whitespace-nowrap">{currentUser.role.replace(/_/g, ' ')}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </div>

            {/* Role dropdown */}
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 hidden group-hover:block z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                Simulate System Persona
              </div>
              {roleOptions.map((opt) => (
                <button
                  key={opt.role}
                  onClick={() => switchUserRole(opt.role)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex items-center justify-between cursor-pointer ${
                    currentUser.role === opt.role ? 'bg-slate-800 text-emerald-400 font-medium' : 'text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-medium">{opt.name}</div>
                    <div className="text-[10px] text-slate-400">{opt.title}</div>
                  </div>
                  {currentUser.role === opt.role && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />}
                </button>
              ))}
            </div>
          </div>

          {currentWorkspace === 'PUBLIC' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAuthModalMode('SIGN_IN');
                  setAuthModalOpen(true);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                <span>Client Login</span>
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
            </div>
          ) : (
            <button
              onClick={() => setCurrentWorkspace('PUBLIC')}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              Public Overview
            </button>
          )}
        </div>
      </div>

      {/* Mobile Workspace Bar */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 bg-slate-950 border-t border-slate-800 text-xs">
        {workspaces.map((ws) => (
          <button
            key={ws.id}
            onClick={() => handleWorkspaceClick(ws.id)}
            className={`px-2.5 py-1 rounded text-[11px] whitespace-nowrap ${
              currentWorkspace === ws.id
                ? 'bg-emerald-600 text-white font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {ws.label}
          </button>
        ))}
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
