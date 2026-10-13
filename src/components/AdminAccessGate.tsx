import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  Building2,
  Users,
  EyeOff
} from 'lucide-react';

export const AdminAccessGate: React.FC = () => {
  const { allUsers, loginAsAdmin, setCurrentWorkspace } = useApp();
  const adminUsers = allUsers.filter(
    (u) => u.role === 'MAIN_ADMIN' || u.role === 'ADMIN_OPERATIONS'
  );

  const [selectedAdminId, setSelectedAdminId] = useState<string>(adminUsers[0]?.id || 'usr-main-admin');
  const [passkey, setPasskey] = useState('••••••••••••');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    setTimeout(() => {
      const success = loginAsAdmin(selectedAdminId, passkey);
      if (!success) {
        setErrorMessage('Invalid admin authorization credentials.');
      }
      setIsSubmitting(false);
    }, 400);
  };

  const selectedAdmin = adminUsers.find((u) => u.id === selectedAdminId) || adminUsers[0];

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
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 mx-auto shadow-inner">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Operations & Admin Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
              Restricted executive workspace. Access is granted strictly to the Main Admin and commissioned Operations Admins. Public visitors and diaspora clients are not permitted.
            </p>
          </div>

          {/* Governance Security Callout */}
          <div className="p-4 bg-purple-950/40 border border-purple-800/50 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-2 text-purple-300 font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0 text-purple-400" />
              <span>Institutional Governance & Hierarchy Rule</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Operations Admins cannot self-register; they are commissioned and delegated jurisdiction exclusively by the Main Admin (Dr. Olufemi Balogun). All actions are permanently audited.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-200 text-xs rounded-lg">
              {errorMessage}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Select Authorized Operations Personnel:
              </label>
              <div className="space-y-2.5">
                {adminUsers.map((admin) => {
                  const isSelected = selectedAdminId === admin.id;
                  const isMain = admin.role === 'MAIN_ADMIN';
                  return (
                    <div
                      key={admin.id}
                      onClick={() => setSelectedAdminId(admin.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-slate-800 border-purple-500 text-white shadow-md'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {admin.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-white flex items-center gap-2">
                            <span>{admin.fullName}</span>
                            <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                              isMain ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {isMain ? 'Main Admin (Trustee)' : 'Operations Admin'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {admin.email} · {admin.assignedRegion || 'Headquarters'}
                          </div>
                        </div>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
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
                Admin Hardware Security Token / Passkey:
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  placeholder="Enter token or passkey"
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg hover:shadow-purple-500/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying Credentials...' : `Authenticate as ${selectedAdmin?.fullName}`}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>

          {/* Footer note */}
          <div className="pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
            Internal Operations Console · IP & Geo-fencing Audit Active
          </div>
        </div>
      </div>
    </div>
  );
};
