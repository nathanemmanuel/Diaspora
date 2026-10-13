# DiasporaTrust Architecture & System Design Documentation

## 1. Executive Summary

DiasporaTrust is an institutional, multi-currency managed investment, real estate/construction, agricultural operations, and professional consultation platform designed for Nigerians living abroad. It bridges geographic distance through verifiable physical evidence, segregated client custody, dual-authorized disbursements, and an immutable double-entry financial ledger.

---

## 2. Monorepo & Application Architecture

The system is designed as a cohesive modular monolith encompassing six core operational workspaces:

1. **Public Website (`/`)**: Service discovery, institutional trust building, risk disclosures, and lead onboarding.
2. **Diaspora Client Portal (`/client`)**: Portfolio summary, bilateral mandate execution, milestone inspections with photo/GPS/lab evidence, and multi-currency funding intents.
3. **Operations & Admin Console (`/admin`)**: Client KYC vetting, mandate configuration, vendor management, and internal engineering QA queues.
4. **Finance & Ledger Treasury (`/finance`)**: Restricted finance workstation managing double-entry journal entries, dual-authorization payout releases, multi-currency corridor rates, and automated reconciliation.
5. **Vendor & Field Operations Portal (`/field`)**: Mobile-first field engineer and contractor workspace for logging daily site tasks, GPS-tagged photography, material delivery receipts, and milestone completion claims.
6. **Compliance, Land Registry & Audit Desk (`/compliance`)**: Land title due diligence registry (Alausa Lands Registry, Governor's Consent, C of O, cadastral beacons), tiered KYC verification, and tamper-evident audit logs.

---

## 3. Core Database Entities (Prisma & PostgreSQL)

The schema in `/prisma/schema.prisma` formalizes:
- **Identity & Access**: `User`, `Role`, `UserRole`, `Permission`, `RolePermission`, `KycCase`, `KycDocumentReference`.
- **Mandates & Contracts**: `ClientProfile`, `ClientMandate`, `EngagementContract`, `MandateStatusHistory`.
- **Projects & Change Requests**: `Project`, `ProjectChangeRequest`, `ProjectRisk`, `DisputeCase`.
- **Milestones & Physical Verification**: `Milestone`, `MilestoneSubmission`, `MilestoneVerification`, `MilestoneDecision`, `MediaAsset`.
- **Real Estate & Title Due Diligence**: `PropertyAsset`, `TitleDueDiligenceCase` (tracking Alausa Searches, Governor's Consent, survey beacon validation).
- **Agriculture**: `FarmSite`, `ProductionCycle`, `AgriculturalInput`, `FieldObservation`, `AgriculturalSalesRecord`.
- **Consultation**: `ConsultationEngagement`, `ConsultationAppointment`.
- **Vendors**: `VendorProfile`, `VendorProjectAssignment`, `VendorInvoice`.
- **Financial Architecture**: `FinancialAccount`, `LedgerTransaction`, `LedgerEntry`, `Invoice`, `PaymentIntent`, `MilestoneReleaseRequest`, `RefundRequest`, `ReconciliationBatch`.
- **Auditability**: `AuditLog`, `AdministrativeApproval`.

---

## 4. Security & Compliance Boundaries

- **Segregation of Duties**: Payout releases initiated by Project Managers MUST be independently approved by a Finance Officer before settlement.
- **Custody Integrity**: Client deposits are held in segregated trust accounts (USD/NGN) with licensed commercial banking institutions in Nigeria. Funds are never co-mingled with platform operational capital.
- **Evidence Verification**: Completed milestones require COREN-certified engineering inspection, timestamped high-resolution photos, and SHA-256 cryptographic checksums before client approval.
- **No Guaranteed Returns**: Agricultural and commercial mandates are individual service agreements without guaranteed yields or speculative return promises.
