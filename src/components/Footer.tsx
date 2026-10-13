import React from 'react';
import { useApp } from '../store/AppContext';
import { ShieldCheck, Lock, Building2, MapPin, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentWorkspace } = useApp();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Column 1: Organization & Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                D
              </div>
              <span className="text-base font-bold text-white tracking-tight">DiasporaTrust</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Institutional managed services and project governance for Nigerians abroad. Transparent execution, verifiable field evidence, and double-entry financial controls.
            </p>
            <div className="flex items-center gap-3 text-slate-500 text-[11px] pt-1">
              <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-emerald-400" /> Segregated Accounts</span>
              <span>·</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-400" /> COREN Verified</span>
            </div>
          </div>

          {/* Column 2: Service Lines */}
          <div className="space-y-2">
            <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">Core Mandate Services</div>
            <ul className="space-y-1.5 text-slate-400">
              <li><button onClick={() => setCurrentWorkspace('PUBLIC')} className="hover:text-white transition-colors cursor-pointer text-left">Real Estate & Land Due Diligence</button></li>
              <li><button onClick={() => setCurrentWorkspace('PUBLIC')} className="hover:text-white transition-colors cursor-pointer text-left">Residential & Commercial Construction</button></li>
              <li><button onClick={() => setCurrentWorkspace('PUBLIC')} className="hover:text-white transition-colors cursor-pointer text-left">Commercial Agricultural Operations</button></li>
              <li><button onClick={() => setCurrentWorkspace('PUBLIC')} className="hover:text-white transition-colors cursor-pointer text-left">Executive Feasibility & Legal Advisory</button></li>
            </ul>
          </div>

          {/* Column 3: Governance & Security */}
          <div className="space-y-2">
            <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">System Governance</div>
            <ul className="space-y-1.5 text-slate-400">
              <li><button onClick={() => setCurrentWorkspace('FINANCE')} className="hover:text-white transition-colors cursor-pointer text-left">Double-Entry Financial Ledger</button></li>
              <li><button onClick={() => setCurrentWorkspace('COMPLIANCE')} className="hover:text-white transition-colors cursor-pointer text-left">Land Title Registry Verification (Alausa)</button></li>
              <li><button onClick={() => setCurrentWorkspace('COMPLIANCE')} className="hover:text-white transition-colors cursor-pointer text-left">Tamper-Evident Audit Trail</button></li>
              <li><button onClick={() => setCurrentWorkspace('ADMIN')} className="hover:text-white transition-colors cursor-pointer text-left">Vendor CAC & Bank Authentication</button></li>
            </ul>
          </div>

          {/* Column 4: Contact & Operations */}
          <div className="space-y-2">
            <div className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">Contact & Offices</div>
            <div className="space-y-1.5 text-slate-400 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>Water Corporation Road, Landmark Towers Axis, Victoria Island, Lagos</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>mandates@diasporatrust.ng</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>+234 1 293 8800 · +1 (404) 920-8190</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Regulatory Disclosures Section */}
        <div className="pt-6 border-t border-slate-900 text-[11px] text-slate-500 space-y-2">
          <p className="leading-relaxed">
            <strong className="text-slate-400 font-semibold">Regulatory Notice & Service Boundary:</strong> DiasporaTrust operates as a managed service, project supervision, and fiduciary governance platform under individual bilateral client service mandates. DiasporaTrust does not offer pooled investment schemes, collective investment portfolios, or guaranteed investment yields. All projects are bespoke contractual engagements managed on behalf of designated clients.
          </p>
          <p className="leading-relaxed">
            Custody and banking transactions are held in segregated trust and operational clearing accounts with licensed commercial banking institutions in Nigeria. Milestone disbursements are released exclusively upon verifiable physical inspection, certified compliance sign-off, and client authorization.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 text-slate-600 gap-2">
            <div>© {new Date().getFullYear()} DiasporaTrust Technologies Ltd. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <span className="hover:text-slate-400 cursor-pointer">Terms of Mandate</span>
              <span>·</span>
              <span className="hover:text-slate-400 cursor-pointer">NDPR Privacy Compliance</span>
              <span>·</span>
              <span className="hover:text-slate-400 cursor-pointer">Risk Disclosures</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
