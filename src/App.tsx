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
import { ClientAccessGate } from './components/ClientAccessGate';
import { AdminAccessGate } from './components/AdminAccessGate';
import { GeminiAdvisorChatbot } from './components/GeminiAdvisorChatbot';

const MainContent: React.FC = () => {
  const { currentWorkspace, isAuthenticated, authRole } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1">
        {currentWorkspace === 'PUBLIC' && <PublicWebsite />}
        {currentWorkspace === 'CLIENT' && (
          isAuthenticated && authRole === 'CLIENT' ? (
            <ClientPortal />
          ) : (
            <ClientAccessGate />
          )
        )}
        {currentWorkspace === 'ADMIN' && (
          isAuthenticated && (authRole === 'MAIN_ADMIN' || authRole === 'OPERATIONS_ADMIN') ? (
            <AdminDashboard />
          ) : (
            <AdminAccessGate />
          )
        )}
        {currentWorkspace === 'FINANCE' && (
          isAuthenticated && (authRole === 'MAIN_ADMIN' || authRole === 'STAFF') ? (
            <FinanceWorkspace />
          ) : (
            <AdminAccessGate />
          )
        )}
        {currentWorkspace === 'VENDOR' && (
          isAuthenticated && (authRole === 'MAIN_ADMIN' || authRole === 'STAFF') ? (
            <VendorFieldWorkspace />
          ) : (
            <AdminAccessGate />
          )
        )}
        {currentWorkspace === 'COMPLIANCE' && (
          isAuthenticated && (authRole === 'MAIN_ADMIN' || authRole === 'STAFF') ? (
            <ComplianceWorkspace />
          ) : (
            <AdminAccessGate />
          )
        )}
      </div>
      <Footer />
      {/* Global Gemini Advisor Chatbot Launcher & Assistant Drawer */}
      <GeminiAdvisorChatbot />
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
