// DiasporaTrust Authoritative Domain Types & Interfaces

export type SupportedCurrency = 'NGN' | 'USD' | 'GBP' | 'EUR';

export type UserRole =
  | 'DIASPORA_CLIENT'
  | 'MAIN_ADMIN'
  | 'ADMIN_OPERATIONS'
  | 'FINANCE_OFFICER'
  | 'PROJECT_MANAGER'
  | 'FIELD_ENGINEER'
  | 'VENDOR_CONTRACTOR'
  | 'COMPLIANCE_OFFICER';

export type AccountStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED';

export type KycTier = 'TIER_1_BASIC' | 'TIER_2_STANDARD' | 'TIER_3_ENHANCED';
export type KycStatus = 'NOT_SUBMITTED' | 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  countryOfResidence: string;
  cityOfResidence: string;
  accountStatus: AccountStatus;
  kycTier: KycTier;
  kycStatus: KycStatus;
  avatarUrl?: string;
  twoFactorEnabled: boolean;
  phone?: string;
  addedBy?: string;
  addedDate?: string;
  permissions?: string[];
  assignedRegion?: string;
  registeredAt?: string;
  targetService?: string;
  initialBudgetUsd?: number;
  lastLogin?: string;
}

export type MandateStatus =
  | 'DRAFT'
  | 'AWAITING_CLIENT_ACCEPTANCE'
  | 'ACTIVE'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export type ServiceCategory =
  | 'REAL_ESTATE_LAND'
  | 'CONSTRUCTION_MANAGEMENT'
  | 'AGRICULTURAL_OPERATIONS'
  | 'CONSULTATION_ADVISORY';

export interface ClientMandate {
  id: string;
  referenceNumber: string;
  clientId: string;
  clientName: string;
  serviceCategory: ServiceCategory;
  title: string;
  scopeDescription: string;
  status: MandateStatus;
  currency: SupportedCurrency;
  estimatedBudget: number;
  platformFeePercent: number; // e.g. 5.0%
  fixedRetainerFee: number;
  assignedManagerName: string;
  startDate: string;
  targetEndDate: string;
  acceptedAt?: string;
  contractVersion: number;
  projectCount: number;
  createdAt: string;
}

export type ProjectType =
  | 'LAND_ACQUISITION'
  | 'CONSTRUCTION'
  | 'AGRICULTURE'
  | 'CONSULTATION_DELIVERY';

export type ProjectStatus =
  | 'PLANNING'
  | 'ACTIVE_EXECUTION'
  | 'PENDING_INSPECTION'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'DISPUTED';

export interface Project {
  id: string;
  projectCode: string;
  mandateId: string;
  mandateReference: string;
  clientId: string;
  projectType: ProjectType;
  title: string;
  locationState: string;
  locationCity: string;
  siteAddress: string;
  gpsCoordinates?: { lat: number; lng: number };
  status: ProjectStatus;
  currency: 'NGN' | 'USD';
  approvedBudget: number;
  committedCapital: number;
  actualExpenditure: number;
  startDate: string;
  targetEndDate: string;
  leadEngineer: string;
  progressPercent: number;
  milestonesCount: number;
  completedMilestones: number;
  openIssuesCount: number;
  lastUpdated: string;

  // Domain specific sub-models
  propertyDetails?: PropertyDetails;
  farmDetails?: FarmDetails;
  consultationDetails?: ConsultationDetails;
}

export interface PropertyDetails {
  landSizeSqM: number;
  zoningType: 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED_USE' | 'AGRICULTURAL';
  titleStatus: 'UNVERIFIED' | 'DUE_DILIGENCE_IN_PROGRESS' | 'CLEAN_TITLE_CONFIRMED' | 'ENCUMBRANCE_FOUND';
  cadastralSurveyPlanRef: string;
  registrySearched: string; // e.g., "Alausa Lands Registry, Lagos"
  cOfORefNumber?: string;
  governorConsentRef?: string;
  deedOfSubleaseRef?: string;
  sellerName: string;
  independentLegalCounsel: string;
}

export interface FarmDetails {
  totalHectares: number;
  waterSource: string;
  farmManager: string;
  currentCrop: string;
  cycleStatus: 'SOIL_PREPARATION' | 'PLANTING_INPUTS' | 'GROWTH_MAINTENANCE' | 'HARVEST_AGGREGATION' | 'SALES_SETTLED';
  projectedYieldTons: number;
  actualHarvestTons?: number;
  totalInputsCostNgn: number;
}

export interface ConsultationDetails {
  servicePackage: string;
  leadConsultant: string;
  durationMinutes: number;
  appointmentTime?: string;
  meetingStatus: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  deliverableStatus: 'PENDING' | 'SUBMITTED' | 'APPROVED';
  deliverableDocumentName?: string;
}

export type MilestoneStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'SUBMITTED_FOR_REVIEW'
  | 'INTERNAL_VERIFIED'
  | 'CLIENT_APPROVED'
  | 'REJECTED'
  | 'DISPUTED';

export interface Milestone {
  id: string;
  projectId: string;
  projectCode: string;
  projectTitle: string;
  orderIndex: number;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  allocatedBudgetNgn: number;
  percentProgress: number;
  status: MilestoneStatus;
  eligibleForRelease: boolean;
  releasePaid: boolean;
  plannedDueDate: string;
  contractorName: string;

  // Verification & Decision data
  internalVerification?: {
    verifiedBy: string;
    decision: 'VERIFIED' | 'REJECTED' | 'MORE_INFO_NEEDED';
    notes: string;
    verifiedAt: string;
    siteVisited: boolean;
    gpsConfirmed: boolean;
  };
  clientDecision?: {
    decidedBy: string;
    decision: 'APPROVED' | 'REJECTED' | 'DISPUTED';
    comments?: string;
    decidedAt: string;
  };

  evidenceItems: MediaAsset[];
}

export interface MediaAsset {
  id: string;
  projectId: string;
  milestoneId?: string;
  uploaderName: string;
  uploaderRole: string;
  category: 'SITE_PHOTO' | 'DRONE_VIDEO' | 'INSPECTION_REPORT' | 'SURVEY_PLAN' | 'LEGAL_DOC';
  filename: string;
  storageKey: string;
  thumbnailUrl?: string;
  fileSizeMb: number;
  sha256Checksum: string;
  claimedCaptureTime: string;
  actualUploadTime: string;
  gpsCoordinates?: { lat: number; lng: number };
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  title?: string;
  description?: string;
  cameraDevice?: string;
  elevationMeters?: number;
  azimuthBearing?: number;
  geoFenceStatus?: 'INSIDE_SITE_BOUNDARY' | 'PERIMETER_PROXIMITY' | 'DISCREPANCY_FLAGGED';
  accuracyMeters?: number;
  tags?: string[];
  weatherCondition?: string;
  contractorName?: string;
  inspectorNotes?: string;
}

// ----------------------------------------------------
// DOCUMENT VAULT TYPES & CRYPTOGRAPHIC CLASSIFICATION
// ----------------------------------------------------

export type DocumentCategory = 'LEGAL' | 'FINANCIAL' | 'SITE_PROGRESS';

export type DocumentSecurityLevel = 'CONFIDENTIAL' | 'RESTRICTED' | 'LEGAL_PRIVILEGED' | 'PUBLIC_RECORD';

export type DocumentVerificationStatus = 'VERIFIED' | 'UNDER_REVIEW' | 'PENDING_AUDIT';

export interface VaultDocument {
  id: string;
  documentNumber: string; // e.g. DOC-LEG-2026-081
  clientId?: string;
  projectId?: string;
  projectCode?: string;
  projectTitle?: string;
  milestoneId?: string;
  title: string;
  description: string;
  category: DocumentCategory;
  subCategory: string; // e.g. "Certificate of Occupancy", "Escrow Receipt", "COREN Structural Report"
  fileType: 'PDF' | 'DWG' | 'JPG' | 'PNG' | 'XLSX' | 'DOCX';
  fileSizeMb: number;
  sha256Hash: string;
  storageKey: string;
  encryptionAlgorithm: string; // e.g. AES-256-GCM
  securityClassification: DocumentSecurityLevel;
  verificationStatus: DocumentVerificationStatus;
  verifiedBy?: string;
  issuingAuthority: string; // e.g. "Lagos State Lands Registry", "Stanbic IBTC Bank", "COREN Council"
  uploadedBy: string;
  uploadedByRole: string;
  uploadDate: string;
  lastAuditedDate?: string;
  tags: string[];
  gpsCoordinates?: { lat: number; lng: number };
  downloadUrl?: string;
}

// ----------------------------------------------------
// FINANCIAL TYPES & DOUBLE-ENTRY LEDGER
// ----------------------------------------------------

export type AccountType =
  | 'ASSET_CLIENT_SEGREGATED'
  | 'ASSET_OPERATIONAL_CLEARING'
  | 'LIABILITY_CLIENT_FUNDS'
  | 'LIABILITY_VENDOR_PAYABLE'
  | 'EQUITY_CAPITAL'
  | 'REVENUE_MANAGEMENT_FEES'
  | 'REVENUE_ADVISORY_FEES'
  | 'EXPENSE_BANK_FEES';

export interface FinancialAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  accountType: AccountType;
  currency: SupportedCurrency;
  balance: number;
  lastReconciledAt: string;
}

export interface LedgerEntry {
  id: string;
  debitAccountId: string;
  debitAccountName: string;
  creditAccountId: string;
  creditAccountName: string;
  amount: number;
  currency: string;
  exchangeRateToNgn: number;
}

export interface LedgerTransaction {
  id: string;
  transactionRef: string;
  idempotencyKey: string;
  description: string;
  currency: SupportedCurrency;
  totalAmount: number;
  postedAt: string;
  isReversed: boolean;
  sourceModule: 'FUNDING' | 'MILESTONE_RELEASE' | 'FEE_COLLECTION' | 'REFUND';
  sourceReference: string;
  entries: LedgerEntry[];
}

export type PaymentIntentStatus =
  | 'CREATED'
  | 'AWAITING_PAYMENT'
  | 'SETTLEMENT_PROCESSING'
  | 'CONFIRMED_SETTLED'
  | 'FAILED'
  | 'CANCELLED';

export interface PaymentIntent {
  id: string;
  referenceCode: string;
  mandateReference: string;
  clientName: string;
  currency: SupportedCurrency;
  amount: number;
  settlementCurrency: 'NGN';
  exchangeRate: number; // e.g. 1 USD = 1,480 NGN
  settlementAmountNgn: number;
  providerName: 'SANDBOX_GATEWAY' | 'PAYSTACK' | 'FLUTTERWAVE';
  status: PaymentIntentStatus;
  createdAt: string;
  settledAt?: string;
}

export type ReleaseStatus =
  | 'REQUESTED'
  | 'AWAITING_FINANCE_DUAL_AUTH'
  | 'APPROVED_FOR_PAYOUT'
  | 'PAYOUT_SUBMITTED'
  | 'SETTLED'
  | 'REJECTED';

export interface MilestoneReleaseRequest {
  id: string;
  releaseReference: string;
  milestoneId: string;
  milestoneTitle: string;
  projectId: string;
  projectCode: string;
  vendorName: string;
  vendorBankDetails: string;
  releaseAmountNgn: number;
  platformFeeDeductionNgn: number; // e.g. 5%
  netDisbursedNgn: number;
  status: ReleaseStatus;
  initiatedBy: string;
  initiatedAt: string;
  financeApprovedBy?: string;
  financeApprovedAt?: string;
  rejectionReason?: string;
  payoutProviderTxId?: string;
  payoutSettledAt?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  mandateReference: string;
  clientName: string;
  currency: 'USD' | 'GBP' | 'NGN';
  subtotal: number;
  platformFee: number;
  totalDue: number;
  dueDate: string;
  paidAt?: string;
  status: 'ISSUED' | 'PAID' | 'OVERDUE' | 'VOID';
}

export interface VendorProfile {
  id: string;
  businessName: string;
  cacRegistrationNum: string;
  contactPerson: string;
  email: string;
  phone: string;
  specialtyCategory: string;
  ratingAverage: number;
  completedJobsCount: number;
  verificationStatus: 'VERIFIED' | 'DOCUMENTS_SUBMITTED' | 'SUSPENDED';
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankDetailsVerified: boolean;
  assignedProjectsCount: number;
}

export interface KycCase {
  id: string;
  userId: string;
  clientName: string;
  email: string;
  tier: KycTier;
  status: KycStatus;
  bvnMasked?: string;
  passportNumberMasked?: string;
  idCountry: string;
  addressVerified: boolean;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  correlationId: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress: string;
  timestamp: string;
  summary: string;
}

export interface DisputeCase {
  id: string;
  disputeNumber: string;
  projectId: string;
  projectCode: string;
  raisedBy: string;
  category: string;
  description: string;
  status: 'OPEN' | 'INVESTIGATING' | 'MEDIATED_RESOLVED' | 'ESCALATED';
  resolutionNotes?: string;
  createdAt: string;
}
