import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  SupportedCurrency,
  ClientMandate,
  Project,
  Milestone,
  FinancialAccount,
  LedgerTransaction,
  PaymentIntent,
  MilestoneReleaseRequest,
  Invoice,
  VendorProfile,
  KycCase,
  AuditLogItem,
  DisputeCase,
  MediaAsset,
  VaultDocument
} from '../types';
import {
  mockUsers,
  mockMandates,
  mockProjects,
  mockMilestones,
  mockFinancialAccounts,
  mockLedgerTransactions,
  mockPaymentIntents,
  mockReleaseRequests,
  mockInvoices,
  mockVendors,
  mockKycCases,
  mockAuditLogs,
  mockDisputes,
  mockVaultDocuments
} from '../data/mockData';

export type WorkspaceView =
  | 'PUBLIC'
  | 'CLIENT'
  | 'ADMIN'
  | 'FINANCE'
  | 'VENDOR'
  | 'COMPLIANCE';

interface AppContextType {
  currentWorkspace: WorkspaceView;
  setCurrentWorkspace: (ws: WorkspaceView) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchUserRole: (role: UserRole) => void;
  switchClientAccount: (userId: string) => void;
  allUsers: User[];

  // Client Confidentiality & Access Gate
  signUpClient: (clientData: {
    fullName: string;
    email: string;
    countryOfResidence: string;
    cityOfResidence: string;
    phone?: string;
    targetService?: string;
    initialBudgetUsd?: number;
    preferredCurrency?: SupportedCurrency;
  }) => User;
  loginClient: (userId: string) => void;

  // Main Admin Operations Governance
  addOperationsAdmin: (adminData: {
    fullName: string;
    email: string;
    assignedRegion: string;
    permissions: string[];
    phone?: string;
  }) => User;
  revokeOperationsAdmin: (adminId: string) => void;

  // Reactive Domain Entities
  mandates: ClientMandate[];
  projects: Project[];
  milestones: Milestone[];
  financialAccounts: FinancialAccount[];
  ledgerTransactions: LedgerTransaction[];
  paymentIntents: PaymentIntent[];
  releaseRequests: MilestoneReleaseRequest[];
  invoices: Invoice[];
  vendors: VendorProfile[];
  kycCases: KycCase[];
  auditLogs: AuditLogItem[];
  disputes: DisputeCase[];
  vaultDocuments: VaultDocument[];

  // Workflows & Domain Operations
  approveMilestoneByClient: (milestoneId: string, comments: string) => void;
  rejectMilestoneByClient: (milestoneId: string, reason: string) => void;
  verifyMilestoneInternal: (milestoneId: string, notes: string, verifierName: string) => void;
  initiateMilestoneRelease: (milestoneId: string) => void;
  financeDualAuthorizeRelease: (releaseId: string) => void;
  createFundingIntent: (mandateReference: string, amount: number, currency: SupportedCurrency) => PaymentIntent;
  simulateConfirmPayment: (paymentIntentId: string) => void;
  raiseDispute: (projectId: string, category: string, description: string) => void;
  acceptMandateByClient: (mandateId: string) => void;
  verifyKycByCompliance: (kycId: string, notes: string) => void;
  submitFieldEvidence: (milestoneId: string, media: Partial<MediaAsset>) => void;
  verifyMediaAsset: (mediaId: string, verified: boolean, notes?: string) => void;
  addVaultDocument: (docData: Omit<VaultDocument, 'id' | 'documentNumber' | 'uploadDate' | 'sha256Hash'> & { sha256Hash?: string; documentNumber?: string }) => VaultDocument;
  verifyDocumentIntegrity: (documentId: string) => { isValid: boolean; hash: string; timestamp: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceView>('PUBLIC');
  const [allUsers, setAllUsers] = useState<User[]>(mockUsers);
  const [currentUser, setCurrentUser] = useState<User>(
    mockUsers.find((u) => u.id === 'usr-client-01') || mockUsers[0]
  );
  const [mandates, setMandates] = useState<ClientMandate[]>(mockMandates);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [milestones, setMilestones] = useState<Milestone[]>(mockMilestones);
  const [financialAccounts, setFinancialAccounts] = useState<FinancialAccount[]>(mockFinancialAccounts);
  const [ledgerTransactions, setLedgerTransactions] = useState<LedgerTransaction[]>(mockLedgerTransactions);
  const [paymentIntents, setPaymentIntents] = useState<PaymentIntent[]>(mockPaymentIntents);
  const [releaseRequests, setReleaseRequests] = useState<MilestoneReleaseRequest[]>(mockReleaseRequests);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [vendors, setVendors] = useState<VendorProfile[]>(mockVendors);
  const [kycCases, setKycCases] = useState<KycCase[]>(mockKycCases);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(mockAuditLogs);
  const [disputes, setDisputes] = useState<DisputeCase[]>(mockDisputes);
  const [vaultDocuments, setVaultDocuments] = useState<VaultDocument[]>(mockVaultDocuments);

  // Switch persona helper
  const switchUserRole = (role: UserRole) => {
    const targetUser = allUsers.find((u) => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
      // Auto-align workspace to role for intuitive navigation
      if (role === 'DIASPORA_CLIENT') setCurrentWorkspace('CLIENT');
      else if (role === 'MAIN_ADMIN' || role === 'ADMIN_OPERATIONS') setCurrentWorkspace('ADMIN');
      else if (role === 'FINANCE_OFFICER') setCurrentWorkspace('FINANCE');
      else if (role === 'FIELD_ENGINEER' || role === 'VENDOR_CONTRACTOR') setCurrentWorkspace('VENDOR');
      else if (role === 'COMPLIANCE_OFFICER') setCurrentWorkspace('COMPLIANCE');
    }
  };

  const switchClientAccount = (userId: string) => {
    const clientUser = allUsers.find((u) => u.id === userId && u.role === 'DIASPORA_CLIENT');
    if (clientUser) {
      setCurrentUser(clientUser);
      setCurrentWorkspace('CLIENT');
      addAuditLog(
        'CLIENT_SESSION_SWITCHED',
        'User',
        clientUser.id,
        `Client session active for ${clientUser.fullName} (${clientUser.cityOfResidence}, ${clientUser.countryOfResidence}). Confidential workspace engaged.`
      );
    }
  };

  const loginClient = (userId: string) => {
    switchClientAccount(userId);
  };

  const signUpClient = (clientData: {
    fullName: string;
    email: string;
    countryOfResidence: string;
    cityOfResidence: string;
    phone?: string;
    targetService?: string;
    initialBudgetUsd?: number;
    preferredCurrency?: SupportedCurrency;
  }): User => {
    const newId = `usr-client-${Date.now().toString().slice(-4)}`;
    const newUser: User = {
      id: newId,
      email: clientData.email,
      fullName: clientData.fullName,
      role: 'DIASPORA_CLIENT',
      countryOfResidence: clientData.countryOfResidence,
      cityOfResidence: clientData.cityOfResidence,
      accountStatus: 'ACTIVE',
      kycTier: 'TIER_2_STANDARD',
      kycStatus: 'VERIFIED',
      twoFactorEnabled: true,
      phone: clientData.phone || '+1 (555) 019-8234',
      registeredAt: new Date().toISOString().substring(0, 10),
      targetService: clientData.targetService || 'CONSTRUCTION_MANAGEMENT',
      initialBudgetUsd: clientData.initialBudgetUsd || 100000,
    };

    // Create an initial confidential mandate for this new client
    const newMandateRef = `DT-MAN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const serviceTitle =
      clientData.targetService === 'AGRICULTURAL_OPERATIONS'
        ? 'Commercial Farmland Development & Irrigation Setup'
        : clientData.targetService === 'REAL_ESTATE_LAND'
        ? 'Prime Land Acquisition & Alausa Cadastral Due Diligence'
        : clientData.targetService === 'CONSULTATION_ADVISORY'
        ? 'Feasibility Study & Regulatory Advisory'
        : 'Residential Villa Turnkey Construction Mandate';

    const newMandate: ClientMandate = {
      id: `man-${Date.now()}`,
      referenceNumber: newMandateRef,
      clientId: newId,
      clientName: clientData.fullName,
      serviceCategory: (clientData.targetService as any) || 'CONSTRUCTION_MANAGEMENT',
      title: `${clientData.fullName}'s ${serviceTitle}`,
      scopeDescription: `Dedicated fiduciary investment mandate commissioned by ${clientData.fullName}. Protected by milestone escrow, segregated account custody, and independent engineering verification.`,
      status: 'AWAITING_CLIENT_ACCEPTANCE',
      currency: clientData.preferredCurrency || 'USD',
      estimatedBudget: clientData.initialBudgetUsd || 120000,
      platformFeePercent: 5.0,
      fixedRetainerFee: 2000,
      assignedManagerName: 'Engr. Babatunde Alabi',
      startDate: new Date().toISOString().substring(0, 10),
      targetEndDate: '2027-01-31',
      contractVersion: 1,
      projectCount: 0,
      createdAt: new Date().toISOString().substring(0, 10),
    };

    setAllUsers((prev) => [newUser, ...prev]);
    setMandates((prev) => [newMandate, ...prev]);
    setCurrentUser(newUser);
    setCurrentWorkspace('CLIENT');

    addAuditLog(
      'CLIENT_SIGNUP_REGISTERED',
      'User',
      newId,
      `New diaspora client ${clientData.fullName} registered from ${clientData.cityOfResidence}, ${clientData.countryOfResidence}. Isolated confidential portal established with mandate reference ${newMandateRef}.`
    );

    return newUser;
  };

  const addOperationsAdmin = (adminData: {
    fullName: string;
    email: string;
    assignedRegion: string;
    permissions: string[];
    phone?: string;
  }): User => {
    if (currentUser.role !== 'MAIN_ADMIN') {
      throw new Error('Access Denied: Only the Main Admin can add Operations Admins.');
    }

    const newAdminId = `usr-admin-${Date.now().toString().slice(-4)}`;
    const newAdmin: User = {
      id: newAdminId,
      email: adminData.email,
      fullName: adminData.fullName,
      role: 'ADMIN_OPERATIONS',
      countryOfResidence: 'Nigeria',
      cityOfResidence: adminData.assignedRegion.split(' ')[0] || 'Lagos',
      accountStatus: 'ACTIVE',
      kycTier: 'TIER_3_ENHANCED',
      kycStatus: 'VERIFIED',
      twoFactorEnabled: true,
      phone: adminData.phone || '+234 801 000 0000',
      addedBy: `${currentUser.fullName} (Main Admin)`,
      addedDate: new Date().toISOString().substring(0, 10),
      permissions: adminData.permissions && adminData.permissions.length > 0 ? adminData.permissions : ['EVIDENCE_VERIFY', 'MANDATE_OPERATIONS'],
      assignedRegion: adminData.assignedRegion,
    };

    setAllUsers((prev) => [...prev, newAdmin]);

    addAuditLog(
      'OPERATIONS_ADMIN_ADDED',
      'User',
      newAdminId,
      `Main Admin ${currentUser.fullName} added Operations Admin ${adminData.fullName} (${adminData.email}) with jurisdiction in ${adminData.assignedRegion}.`
    );

    return newAdmin;
  };

  const revokeOperationsAdmin = (adminId: string) => {
    if (currentUser.role !== 'MAIN_ADMIN') {
      throw new Error('Access Denied: Only the Main Admin can revoke Operations Admins.');
    }

    setAllUsers((prev) =>
      prev.map((u) => (u.id === adminId ? { ...u, accountStatus: 'SUSPENDED' as const } : u))
    );

    addAuditLog(
      'OPERATIONS_ADMIN_SUSPENDED',
      'User',
      adminId,
      `Main Admin ${currentUser.fullName} suspended Operations Admin account ${adminId}.`
    );
  };

  const addAuditLog = (action: string, resourceType: string, resourceId: string, summary: string) => {
    const newLog: AuditLogItem = {
      id: `aud-${Date.now()}`,
      correlationId: `req-${Math.random().toString(36).substring(2, 9)}`,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      action,
      resourceType,
      resourceId,
      ipAddress: '197.210.84.19',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      summary,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Client Approves Milestone
  const approveMilestoneByClient = (milestoneId: string, comments: string) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id === milestoneId) {
          return {
            ...m,
            status: 'CLIENT_APPROVED',
            clientDecision: {
              decidedBy: currentUser.fullName,
              decision: 'APPROVED',
              comments: comments || 'Approved by client after evidence inspection.',
              decidedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            },
          };
        }
        return m;
      })
    );

    addAuditLog(
      'CLIENT_APPROVE_MILESTONE',
      'Milestone',
      milestoneId,
      `Client ${currentUser.fullName} approved milestone ${milestoneId}. Comments: "${comments || 'None'}". Ready for disbursement authorization.`
    );
  };

  // Client Rejects Milestone
  const rejectMilestoneByClient = (milestoneId: string, reason: string) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id === milestoneId) {
          return {
            ...m,
            status: 'REJECTED',
            clientDecision: {
              decidedBy: currentUser.fullName,
              decision: 'REJECTED',
              comments: reason,
              decidedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            },
          };
        }
        return m;
      })
    );

    addAuditLog(
      'CLIENT_REJECT_MILESTONE',
      'Milestone',
      milestoneId,
      `Client rejected milestone ${milestoneId}. Reason: ${reason}`
    );
  };

  // Internal QA / PM Verification
  const verifyMilestoneInternal = (milestoneId: string, notes: string, verifierName: string) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id === milestoneId) {
          return {
            ...m,
            status: 'INTERNAL_VERIFIED',
            internalVerification: {
              verifiedBy: verifierName,
              decision: 'VERIFIED',
              notes,
              verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
              siteVisited: true,
              gpsConfirmed: true,
            },
            eligibleForRelease: true,
          };
        }
        return m;
      })
    );

    addAuditLog(
      'INTERNAL_VERIFY_MILESTONE',
      'Milestone',
      milestoneId,
      `Internal QA verifier ${verifierName} certified milestone ${milestoneId}. Status advanced to INTERNAL_VERIFIED.`
    );
  };

  // Initiate Milestone Release (Project Manager Action)
  const initiateMilestoneRelease = (milestoneId: string) => {
    const milestone = milestones.find((m) => m.id === milestoneId);
    if (!milestone) return;

    const netDisbursed = milestone.allocatedBudgetNgn * 0.95;
    const feeRetained = milestone.allocatedBudgetNgn * 0.05;

    const newReq: MilestoneReleaseRequest = {
      id: `rel-${Date.now()}`,
      releaseReference: `REL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      milestoneId: milestone.id,
      milestoneTitle: milestone.title,
      projectId: milestone.projectId,
      projectCode: milestone.projectCode,
      vendorName: milestone.contractorName,
      vendorBankDetails: 'Providus Bank · Account: 0192837461 (Apex Structural)',
      releaseAmountNgn: milestone.allocatedBudgetNgn,
      platformFeeDeductionNgn: feeRetained,
      netDisbursedNgn: netDisbursed,
      status: 'AWAITING_FINANCE_DUAL_AUTH',
      initiatedBy: currentUser.fullName,
      initiatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setReleaseRequests((prev) => [newReq, ...prev]);

    addAuditLog(
      'INITIATE_MILESTONE_RELEASE',
      'MilestoneReleaseRequest',
      newReq.id,
      `Disbursement instruction ${newReq.releaseReference} initiated for ₦${netDisbursed.toLocaleString()} by ${currentUser.fullName}. Segregated dual authorization required.`
    );
  };

  // Dual Authorization & Payout Settlement (Finance Officer Action)
  const financeDualAuthorizeRelease = (releaseId: string) => {
    const req = releaseRequests.find((r) => r.id === releaseId);
    if (!req) return;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // 1. Update release status
    setReleaseRequests((prev) =>
      prev.map((r) => {
        if (r.id === releaseId) {
          return {
            ...r,
            status: 'SETTLED',
            financeApprovedBy: currentUser.fullName,
            financeApprovedAt: now,
            payoutProviderTxId: `PO-NIBSS-${Date.now()}`,
            payoutSettledAt: now,
          };
        }
        return r;
      })
    );

    // 2. Mark milestone releasePaid = true
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id === req.milestoneId) {
          return {
            ...m,
            releasePaid: true,
          };
        }
        return m;
      })
    );

    // 3. Post immutable Double-Entry Ledger Transaction
    // Debit: 2000-CLIENT-MANDATE-LIABILITY (Reduction in client held funds)
    // Credit: 1010-NGN-CLIENT-SEGREGATED (Reduction in bank cash balance)
    // Credit: 4000-PLATFORM-FEE-REVENUE (Platform 5% fee realization)
    const newTx: LedgerTransaction = {
      id: `ltx-${Date.now()}`,
      transactionRef: `LTX-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      idempotencyKey: `IDEMP-REL-${req.releaseReference}`,
      description: `Disbursement: ${req.milestoneTitle} to ${req.vendorName} (Net: ₦${req.netDisbursedNgn.toLocaleString()}, Fee: ₦${req.platformFeeDeductionNgn.toLocaleString()})`,
      currency: 'NGN',
      totalAmount: req.releaseAmountNgn,
      postedAt: now,
      isReversed: false,
      sourceModule: 'MILESTONE_RELEASE',
      sourceReference: req.releaseReference,
      entries: [
        {
          id: `entry-${Date.now()}-1`,
          debitAccountId: 'acc-2000',
          debitAccountName: '2000-CLIENT-MANDATE-LIABILITY',
          creditAccountId: 'acc-1010',
          creditAccountName: '1010-NGN-CLIENT-SEGREGATED',
          amount: req.netDisbursedNgn,
          currency: 'NGN',
          exchangeRateToNgn: 1.0,
        },
        {
          id: `entry-${Date.now()}-2`,
          debitAccountId: 'acc-2000',
          debitAccountName: '2000-CLIENT-MANDATE-LIABILITY',
          creditAccountId: 'acc-4000',
          creditAccountName: '4000-PLATFORM-FEE-REVENUE',
          amount: req.platformFeeDeductionNgn,
          currency: 'NGN',
          exchangeRateToNgn: 1.0,
        },
      ],
    };

    setLedgerTransactions((prev) => [newTx, ...prev]);

    // 4. Update account balances
    setFinancialAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === 'acc-1010') {
          return { ...acc, balance: acc.balance - req.netDisbursedNgn };
        }
        if (acc.id === 'acc-4000') {
          return { ...acc, balance: acc.balance + req.platformFeeDeductionNgn };
        }
        return acc;
      })
    );

    // 5. Update Project actual expenditure
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === req.projectId) {
          return {
            ...p,
            actualExpenditure: p.actualExpenditure + req.releaseAmountNgn,
          };
        }
        return p;
      })
    );

    addAuditLog(
      'FINANCE_DUAL_AUTH_GRANTED',
      'MilestoneReleaseRequest',
      req.id,
      `Dual-authorization approved by Finance Officer ${currentUser.fullName}. Disbursed ₦${req.netDisbursedNgn.toLocaleString()} to ${req.vendorName}. Ledger transaction ${newTx.transactionRef} posted.`
    );
  };

  // Create Funding Intent
  const createFundingIntent = (
    mandateReference: string,
    amount: number,
    currency: SupportedCurrency
  ): PaymentIntent => {
    const exchangeRates: Record<SupportedCurrency, number> = {
      USD: 1530.0,
      GBP: 1980.0,
      EUR: 1670.0,
      NGN: 1.0,
    };
    const rate = exchangeRates[currency] || 1530.0;
    const settlementNgn = amount * rate;

    const newIntent: PaymentIntent = {
      id: `pi-${Date.now()}`,
      referenceCode: `PI-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      mandateReference,
      clientName: currentUser.fullName,
      currency,
      amount,
      settlementCurrency: 'NGN',
      exchangeRate: rate,
      settlementAmountNgn: settlementNgn,
      providerName: 'SANDBOX_GATEWAY',
      status: 'AWAITING_PAYMENT',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setPaymentIntents((prev) => [newIntent, ...prev]);

    addAuditLog(
      'CREATE_FUNDING_INTENT',
      'PaymentIntent',
      newIntent.id,
      `Created funding intent ${newIntent.referenceCode} for ${currency} ${amount.toLocaleString()} (~₦${settlementNgn.toLocaleString()})`
    );

    return newIntent;
  };

  // Authoritative Payment Confirmation (Sandbox or Gateway Webhook)
  const simulateConfirmPayment = (paymentIntentId: string) => {
    const intent = paymentIntents.find((p) => p.id === paymentIntentId);
    if (!intent) return;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // 1. Update intent status
    setPaymentIntents((prev) =>
      prev.map((p) => (p.id === paymentIntentId ? { ...p, status: 'CONFIRMED_SETTLED', settledAt: now } : p))
    );

    // 2. Post atomic double-entry ledger transaction
    // Debit: 1000-USD-CLIENT-SEGREGATED (if USD) or 1010-NGN (if NGN)
    // Credit: 2000-CLIENT-MANDATE-LIABILITY (Trust obligation to client)
    const debitAccId = intent.currency === 'USD' ? 'acc-1000' : 'acc-1010';
    const debitAccName = intent.currency === 'USD' ? '1000-USD-CLIENT-SEGREGATED' : '1010-NGN-CLIENT-SEGREGATED';

    const newTx: LedgerTransaction = {
      id: `ltx-${Date.now()}`,
      transactionRef: `LTX-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      idempotencyKey: `IDEMP-WEBHOOK-${intent.referenceCode}`,
      description: `Funding Receipt: ${intent.clientName} (${intent.currency} ${intent.amount.toLocaleString()}) for Mandate ${intent.mandateReference}`,
      currency: intent.currency,
      totalAmount: intent.amount,
      postedAt: now,
      isReversed: false,
      sourceModule: 'FUNDING',
      sourceReference: intent.referenceCode,
      entries: [
        {
          id: `entry-${Date.now()}`,
          debitAccountId: debitAccId,
          debitAccountName: debitAccName,
          creditAccountId: 'acc-2000',
          creditAccountName: '2000-CLIENT-MANDATE-LIABILITY',
          amount: intent.amount,
          currency: intent.currency,
          exchangeRateToNgn: intent.exchangeRate,
        },
      ],
    };

    setLedgerTransactions((prev) => [newTx, ...prev]);

    // 3. Update account cached balance
    setFinancialAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === debitAccId) return { ...acc, balance: acc.balance + intent.amount };
        if (acc.id === 'acc-2000' && intent.currency === 'USD') return { ...acc, balance: acc.balance + intent.amount };
        return acc;
      })
    );

    addAuditLog(
      'CONFIRM_PAYMENT_SETTLED',
      'PaymentIntent',
      intent.id,
      `Authoritative payment confirmation received for ${intent.referenceCode}. Ledger transaction ${newTx.transactionRef} posted atomically.`
    );
  };

  // Raise Dispute
  const raiseDispute = (projectId: string, category: string, description: string) => {
    const proj = projects.find((p) => p.id === projectId);
    const newDispute: DisputeCase = {
      id: `dsp-${Date.now()}`,
      disputeNumber: `DSP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      projectId,
      projectCode: proj?.projectCode || 'PROJECT',
      raisedBy: currentUser.fullName,
      category,
      description,
      status: 'OPEN',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setDisputes((prev) => [newDispute, ...prev]);

    addAuditLog(
      'DISPUTE_RAISED',
      'DisputeCase',
      newDispute.id,
      `Dispute ${newDispute.disputeNumber} raised on project ${newDispute.projectCode} by ${currentUser.fullName}. Category: ${category}.`
    );
  };

  // Accept Mandate Scope & Terms
  const acceptMandateByClient = (mandateId: string) => {
    setMandates((prev) =>
      prev.map((m) =>
        m.id === mandateId
          ? {
              ...m,
              status: 'ACTIVE',
              acceptedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            }
          : m
      )
    );

    addAuditLog(
      'CLIENT_ACCEPT_MANDATE',
      'ClientMandate',
      mandateId,
      `Client ${currentUser.fullName} executed engagement contract terms for mandate ${mandateId}. Status transitioned to ACTIVE.`
    );
  };

  // Verify KYC Case (Compliance Officer)
  const verifyKycByCompliance = (kycId: string, notes: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setKycCases((prev) =>
      prev.map((k) =>
        k.id === kycId
          ? {
              ...k,
              status: 'VERIFIED',
              reviewedBy: currentUser.fullName,
              reviewedAt: now,
              reviewerNotes: notes,
            }
          : k
      )
    );

    addAuditLog(
      'COMPLIANCE_VERIFY_KYC',
      'KycCase',
      kycId,
      `Compliance Officer ${currentUser.fullName} approved KYC case ${kycId}. Status set to VERIFIED.`
    );
  };

  // Field Evidence Submission
  const submitFieldEvidence = (milestoneId: string, mediaData: Partial<MediaAsset>) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newAsset: MediaAsset = {
      id: `ev-${Date.now()}`,
      projectId: mediaData.projectId || 'prj-01',
      milestoneId,
      uploaderName: currentUser.fullName,
      uploaderRole: currentUser.role,
      category: mediaData.category || 'SITE_PHOTO',
      filename: mediaData.filename || 'site_inspection_photo.jpg',
      storageKey: `/vault/submissions/${Date.now()}.jpg`,
      thumbnailUrl: mediaData.thumbnailUrl || '/src/assets/images/realestate_construction_site_1791679679170.jpg',
      fileSizeMb: mediaData.fileSizeMb || 5.2,
      sha256Checksum: mediaData.sha256Checksum || 'a6c8e31048b2e1f4091a78e8c1048b924190c42901b08910a24089c198b1',
      claimedCaptureTime: now,
      actualUploadTime: now,
      gpsCoordinates: mediaData.gpsCoordinates || { lat: 6.4474, lng: 3.4739 },
      isVerified: false,
    };

    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id === milestoneId) {
          return {
            ...m,
            status: 'SUBMITTED_FOR_REVIEW',
            evidenceItems: [...m.evidenceItems, newAsset],
          };
        }
        return m;
      })
    );

    addAuditLog(
      'SUBMIT_FIELD_EVIDENCE',
      'Milestone',
      milestoneId,
      `Field personnel ${currentUser.fullName} submitted inspection media "${newAsset.filename}" with SHA-256 checksum.`
    );
  };

  const verifyMediaAsset = (mediaId: string, verified: boolean, notes?: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setMilestones((prev) =>
      prev.map((m) => {
        const hasAsset = m.evidenceItems.some((item) => item.id === mediaId);
        if (!hasAsset) return m;

        return {
          ...m,
          evidenceItems: m.evidenceItems.map((item) => {
            if (item.id === mediaId) {
              return {
                ...item,
                isVerified: verified,
                verifiedBy: currentUser.fullName,
                verifiedAt: now,
                inspectorNotes: notes || item.inspectorNotes,
              };
            }
            return item;
          }),
        };
      })
    );

    addAuditLog(
      'VERIFY_MEDIA_ASSET',
      'MediaAsset',
      mediaId,
      `${currentUser.fullName} (${currentUser.role}) ${verified ? 'marked photo asset verified' : 'flagged photo asset for review'}${notes ? `: "${notes}"` : '.'}`
    );
  };

  const addVaultDocument = (docData: Omit<VaultDocument, 'id' | 'documentNumber' | 'uploadDate' | 'sha256Hash'> & { sha256Hash?: string; documentNumber?: string }): VaultDocument => {
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);
    const categoryPrefix = docData.category === 'LEGAL' ? 'LEG' : docData.category === 'FINANCIAL' ? 'FIN' : 'ENG';
    const randomHex = Math.random().toString(16).substring(2, 10);
    const random64Hash = docData.sha256Hash || Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    const newDoc: VaultDocument = {
      ...docData,
      id: `doc-${categoryPrefix.toLowerCase()}-${Date.now()}`,
      documentNumber: docData.documentNumber || `DOC-${categoryPrefix}-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      uploadDate: dateStr,
      sha256Hash: random64Hash,
      storageKey: docData.storageKey || `s3://diasporatrust-vault/${docData.category.toLowerCase()}/${randomHex}.enc`,
      encryptionAlgorithm: docData.encryptionAlgorithm || 'AES-256-GCM',
      verificationStatus: docData.verificationStatus || 'VERIFIED',
    };

    setVaultDocuments((prev) => [newDoc, ...prev]);

    addAuditLog(
      'VAULT_DOCUMENT_DEPOSITED',
      'VaultDocument',
      newDoc.id,
      `User ${currentUser.fullName} deposited "${newDoc.title}" (${newDoc.documentNumber}) into the secure ${newDoc.category} vault. Cryptographic SHA-256 registered.`
    );

    return newDoc;
  };

  const verifyDocumentIntegrity = (documentId: string): { isValid: boolean; hash: string; timestamp: string } => {
    const doc = vaultDocuments.find((d) => d.id === documentId);
    if (!doc) {
      return { isValid: false, hash: '', timestamp: new Date().toISOString() };
    }
    const isValid = doc.sha256Hash.length === 64 && /^[0-9a-fA-F]+$/.test(doc.sha256Hash);
    return {
      isValid,
      hash: doc.sha256Hash,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
  };

  return (
    <AppContext.Provider
      value={{
        currentWorkspace,
        setCurrentWorkspace,
        currentUser,
        setCurrentUser,
        switchUserRole,
        switchClientAccount,
        allUsers,
        signUpClient,
        loginClient,
        addOperationsAdmin,
        revokeOperationsAdmin,
        mandates,
        projects,
        milestones,
        financialAccounts,
        ledgerTransactions,
        paymentIntents,
        releaseRequests,
        invoices,
        vendors,
        kycCases,
        auditLogs,
        disputes,
        vaultDocuments,
        approveMilestoneByClient,
        rejectMilestoneByClient,
        verifyMilestoneInternal,
        initiateMilestoneRelease,
        financeDualAuthorizeRelease,
        createFundingIntent,
        simulateConfirmPayment,
        raiseDispute,
        acceptMandateByClient,
        verifyKycByCompliance,
        submitFieldEvidence,
        verifyMediaAsset,
        addVaultDocument,
        verifyDocumentIntegrity,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
