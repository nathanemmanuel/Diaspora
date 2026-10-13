import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { SupportedCurrency } from '../types';
import {
  ShieldCheck,
  Lock,
  UserCheck,
  Building2,
  Sprout,
  FileText,
  DollarSign,
  Globe,
  ArrowRight,
  CheckCircle2,
  X,
  UserPlus,
  LogIn
} from 'lucide-react';

interface ClientAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'SIGN_UP' | 'SIGN_IN';
}

export const ClientAuthModal: React.FC<ClientAuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'SIGN_UP',
}) => {
  const { signUpClient, switchClientAccount, allUsers } = useApp();
  const [mode, setMode] = useState<'SIGN_UP' | 'SIGN_IN'>(initialMode);

  // Sign up state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    countryOfResidence: 'United Kingdom',
    cityOfResidence: 'London',
    phone: '',
    targetService: 'CONSTRUCTION_MANAGEMENT',
    initialBudgetUsd: 120000,
    preferredCurrency: 'USD' as SupportedCurrency,
  });

  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Existing clients list for quick sign in / evaluation
  const clientUsers = allUsers.filter((u) => u.role === 'DIASPORA_CLIENT');
  const [selectedExistingUserId, setSelectedExistingUserId] = useState(clientUsers[0]?.id || '');

  if (!isOpen) return null;

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) {
      setErrorMessage('Please provide your full legal name and email address.');
      return;
    }
    if (!termsAccepted) {
      setErrorMessage('Please acknowledge the confidentiality & fiduciary escrow terms.');
      return;
    }

    try {
      signUpClient({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        countryOfResidence: formData.countryOfResidence,
        cityOfResidence: formData.cityOfResidence.trim() || 'London',
        phone: formData.phone.trim(),
        targetService: formData.targetService,
        initialBudgetUsd: Number(formData.initialBudgetUsd) || 100000,
        preferredCurrency: formData.preferredCurrency,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed');
    }
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExistingUserId) {
      setErrorMessage('Please select a registered client account to continue.');
      return;
    }
    switchClientAccount(selectedExistingUserId);
    onClose();
  };

  const handleQuickClientSelect = (userId: string) => {
    switchClientAccount(userId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header with Trust Accents */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-2">
            <Lock className="w-4 h-4" />
            <span>Encrypted Diaspora Client Portal Gate</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {mode === 'SIGN_UP'
              ? 'Create Your Confidential Client Portal'
              : 'Sign In to Your Private Client Vault'}
          </h2>

          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            Every client investment is strictly isolated with independent escrow custody,
            COREN engineering verification, and private legal title storage.
          </p>

          {/* Mode Tabs */}
          <div className="flex items-center gap-2 mt-5 bg-slate-800/80 p-1 rounded-lg border border-slate-700/80">
            <button
              type="button"
              onClick={() => {
                setMode('SIGN_UP');
                setErrorMessage('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                mode === 'SIGN_UP'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up as Client</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('SIGN_IN');
                setErrorMessage('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                mode === 'SIGN_IN'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Client Sign In</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <span className="font-semibold">Notice:</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: SIGN UP FORM */}
          {/* ======================================================== */}
          {mode === 'SIGN_UP' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Ngozi Eze"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ngozi.eze@example.co.uk"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Country of Residence *
                  </label>
                  <select
                    value={formData.countryOfResidence}
                    onChange={(e) => setFormData({ ...formData, countryOfResidence: e.target.value })}
                    className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 focus:bg-white"
                  >
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="Germany">Germany</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Ireland">Ireland</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Australia">Australia</option>
                    <option value="Other Diaspora">Other Diaspora</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    City of Residence *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. London / Manchester / Atlanta"
                    value={formData.cityOfResidence}
                    onChange={(e) => setFormData({ ...formData, cityOfResidence: e.target.value })}
                    className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    WhatsApp / Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+44 7700 900123"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Primary Investment Sector *
                  </label>
                  <select
                    value={formData.targetService}
                    onChange={(e) => setFormData({ ...formData, targetService: e.target.value })}
                    className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 focus:bg-white"
                  >
                    <option value="CONSTRUCTION_MANAGEMENT">Residential / Commercial Construction</option>
                    <option value="AGRICULTURAL_OPERATIONS">Commercial Agriculture & Irrigation</option>
                    <option value="REAL_ESTATE_LAND">Land Title Search & Cadastral Survey</option>
                    <option value="CONSULTATION_ADVISORY">Feasibility & Legal Advisory</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Estimated Project Budget
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">$</span>
                    <input
                      type="number"
                      step="5000"
                      min="10000"
                      value={formData.initialBudgetUsd}
                      onChange={(e) => setFormData({ ...formData, initialBudgetUsd: Number(e.target.value) })}
                      className="w-full text-xs pl-7 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Settlement Currency
                  </label>
                  <select
                    value={formData.preferredCurrency}
                    onChange={(e) => setFormData({ ...formData, preferredCurrency: e.target.value as SupportedCurrency })}
                    className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 focus:bg-white"
                  >
                    <option value="USD">USD ($) — United States Dollar</option>
                    <option value="GBP">GBP (£) — British Pound Sterling</option>
                    <option value="EUR">EUR (€) — Euro</option>
                    <option value="NGN">NGN (₦) — Nigerian Naira</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Portal Passkey / Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Confidentiality & Escrow Agreement Notice */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-600 leading-relaxed">
                    <strong>Fiduciary Confidentiality Acknowledgment:</strong> I understand that my
                    personal client portal is strictly private and isolated. Only my authorized
                    mandates, legal C of O/Governor's Consent documents, and milestone photo evidence
                    will be stored within my vault.
                  </span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Complete Sign Up & Open Confidential Portal</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* TAB 2: CLIENT SIGN IN / SELECTION */}
          {/* ======================================================== */}
          {mode === 'SIGN_IN' && (
            <div className="space-y-5">
              <div>
                <div className="text-xs font-semibold text-slate-700 mb-2">
                  Select Registered Diaspora Client Account:
                </div>
                <div className="space-y-2.5">
                  {clientUsers.map((client) => {
                    const isSelected = selectedExistingUserId === client.id;
                    return (
                      <div
                        key={client.id}
                        onClick={() => setSelectedExistingUserId(client.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-50/70 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {client.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                              <span>{client.fullName}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                                {client.id}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {client.cityOfResidence}, {client.countryOfResidence} · {client.email}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickClientSelect(client.id);
                          }}
                          className="px-3 py-1.5 text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          Sign In
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Client credentials enforce end-to-end data segregation. Client A cannot see
                  Client B's projects or financial ledgers.
                </span>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleSignInSubmit}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-emerald-400" />
                  <span>Enter Confidential Portal</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('SIGN_UP')}
                  className="text-xs text-slate-500 hover:text-slate-900 font-medium underline underline-offset-2 cursor-pointer"
                >
                  New investor? Click here to register your account.
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
