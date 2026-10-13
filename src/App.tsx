import React from 'react';
import { AppProvider, useApp } from './store/AppContext';
import { CurrencyProvider } from './hooks/useCurrency';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PublicWebsite } from './components/PublicWebsite';
import { ClientPortal } from './components/ClientPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { FinanceWorkspace } from './components/FinanceWorkspace';
import { VendorFieldWorkspace } from './components/VendorFieldWorkspace';
import { ComplianceWorkspace } from './components/ComplianceWorkspace';

const MainContent: React.FC = () => {
  const { currentWorkspace } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1">
        {currentWorkspace === 'PUBLIC' && <PublicWebsite />}
        {currentWorkspace === 'CLIENT' && <ClientPortal />}
        {currentWorkspace === 'ADMIN' && <AdminDashboard />}
        {currentWorkspace === 'FINANCE' && <FinanceWorkspace />}
        {currentWorkspace === 'VENDOR' && <VendorFieldWorkspace />}
        {currentWorkspace === 'COMPLIANCE' && <ComplianceWorkspace />}
      </div>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <CurrencyProvider defaultCurrency="USD">
      <AppProvider>
        <MainContent />
      </AppProvider>
    </CurrencyProvider>
  );
}
