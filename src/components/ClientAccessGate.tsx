import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { ClientAuthModal } from './ClientAuthModal';
import {
  Lock,
  ShieldCheck,
  UserCheck,
  UserPlus,
  ArrowRight,
  Globe,
  Building2,
  FileText,
  KeyRound,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';

export const ClientAccessGate: React.FC = () => {
  const { allUsers, loginAsClient, setCurrentWorkspace } = useApp();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'SIGN_UP' | 'SIGN_IN'>('SIGN_IN');

  const clientUsers = allUsers.filter((u) => u.role === 'DIASPORA_CLIENT');
  const [selectedUserId, setSelectedUserId] = useState<string>(clientUsers[0]?.id || '');
  const [password, setPassword] = useState('••••••••••••');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setIsSubmitting(true);
    setTimeout(() => {
      loginAsClient(selectedUserId);
      setIsSubmitting(false);
    }, 400);
  };

  const selectedClient = clientUsers.find((u) => u.id === selectedUserId) || clientUsers[0];

  return (
    <div className="min-h-[85vh] bg-slate-950 text-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Back to Public Overview */}
        <div>
          <button
            onClick={() => setCurrentWorkspace('PUBLIC')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Public Overview</span>
          </button>
        </div>

        {/* Security Shield Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-10 space-y-8 relative overflow-hidden">
          {/* Decorative Corner Glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Confidential Client Portal Access
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
              Public access is restricted. DiasporaTrust mandates, title deeds, double-authorization escrow ledgers, and site verification photos are quarantined strictly to authorized clients.
            </p>
          </div>

          {/* Institutional Security Notice */}
          <div className="p-4 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Cryptographic Data Isolation Guarantee</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Every client has a private, segregated environment. No client or public visitor can see another investor&apos;s project budgets, bank release authorizations, or cadastral coordinates.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleClientLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Select Authorized Client Portfolio:
              </label>
              <div className="space-y-2.5">
                {clientUsers.map((client) => {
                  const isSelected = selectedUserId === client.id;
                  return (
                    <div
                      key={client.id}
                      onClick={() => setSelectedUserId(client.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-slate-800 border-emerald-500 text-white shadow-md'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {client.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-white flex items-center gap-2">
                            <span>{client.fullName}</span>
                            <span className="font-mono text-[10px] text-emerald-400 font-normal">
                              ({client.id})
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {client.cityOfResidence}, {client.countryOfResidence} · {client.email}
                          </div>
                        </div>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Client Security Passkey / 2FA:
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  placeholder="Enter your security passkey"
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Authenticating...' : `Enter Private Portal as ${selectedClient?.fullName}`}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>

          {/* New Client Sign Up Callout */}
          <div className="pt-6 border-t border-slate-800 text-center space-y-3">
            <div className="text-xs text-slate-400">
              Not yet registered as a diaspora client?
            </div>
            <button
              onClick={() => {
                setAuthModalMode('SIGN_UP');
                setAuthModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-emerald-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Create Authorized Client Account (Sign Up)</span>
            </button>
          </div>
        </div>
      </div>

      <ClientAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
};
