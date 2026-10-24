// src/types/index.ts
// Comprehensive Domain Types for RTO One

export type TaskStatus =
  | 'DRAFT'
  | 'READY'
  | 'IN_PROGRESS'
  | 'PENDING'
  | 'COMPLETED'
  | 'BLOCKED'
  | 'REJECTED'
  | 'FAILED'
  | 'WITHDRAWN'
  | 'RULES_UNAVAILABLE';

export type PaymentStatus =
  | 'NOT_STARTED'
  | 'INITIATED'
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'UNKNOWN'
  | 'RECONCILIATION_REQUIRED';

export type RiskLevel = 'SAFE' | 'ATTENTION' | 'CRITICAL' | 'UNKNOWN';

export type RuleProvenance =
  | 'VERIFIED_OFFICIAL'
  | 'OFFICIAL_SOURCE_NOT_YET_VERIFIED'
  | 'SYNTHETIC_DEMO'
  | 'THIRD_PARTY_INFORMATION'
  | 'STALE_INFORMATION'
  | 'UNAVAILABLE';

export type IntegrationMode =
  | 'LIVE'
  | 'SANDBOX'
  | 'DEMO'
  | 'PENDING_APPROVAL'
  | 'CREDENTIALS_MISSING'
  | 'UNAVAILABLE'
  | 'DEGRADED'
  | 'DISABLED';

export interface DocumentRequirement {
  id: string;
  name: string;
  category: 'IDENTITY' | 'ADDRESS' | 'VEHICLE' | 'MEDICAL' | 'GENERAL' | 'OTHER';
  isRequired: boolean;
  status: 'AVAILABLE' | 'MISSING' | 'UPLOADED' | 'NOT_APPLICABLE' | 'UNKNOWN';
  sourceRule: string;
  maxSizeMb?: number;
  acceptedFormats?: string[];
  mockFileName?: string;
  uploadedAt?: string;
}

export interface WorkflowTask {
  id: string;
  title: string;
  category: 'VEHICLE' | 'DRIVING_LICENCE' | 'CHALLAN' | 'APPOINTMENT' | 'GENERAL';
  status: TaskStatus;
  dependencyIds: string[]; // direct prerequisites
  jurisdiction: string; // state code e.g. 'KA', 'MH', 'AP', 'OD'
  entityId?: string; // vehicle or licence id e.g. 'veh-1'
  entityLabel?: string; // e.g. 'KA-01-MJ-5021'
  estimatedFee: number; // in INR
  feeLabel: string; // 'SIMULATED' or 'VERIFIED_OFFICIAL'
  processingDays: number;
  deadlineInfo?: {
    expiryDate: string; // YYYY-MM-DD
    gracePeriodDays: number;
    appointmentLeadDays: number;
    safetyBufferDays: number;
    recommendedStartDate?: string;
    daysRemaining?: number;
    riskLevel?: RiskLevel;
  };
  requiredDocuments: DocumentRequirement[];
  blockerExplanation?: string;
  directBlockers?: string[];
  transitiveBlockers?: string[];
  availableActions: string[];
  ruleProvenance: RuleProvenance;
  lastUpdated: string;
  rejectionReason?: string;
  paymentId?: string;
}

export interface DependencyGraphData {
  tasks: WorkflowTask[];
  edges: { from: string; to: string; label?: string }[];
  topologicalOrder: string[];
  parallelTaskGroups: string[][];
  hasCycles: boolean;
  cycleNodes?: string[];
}

export interface Vehicle {
  id: string;
  registrationNumber: string; // unmasked e.g. 'KA-01-MJ-5021'
  maskedNumber: string; // e.g. 'KA-01-**-5021'
  makeModel: string;
  fuelType: 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'CNG';
  registrationDate: string;
  rcStatus: 'ACTIVE' | 'EXPIRED' | 'TRANSFER_PENDING' | 'SUSPENDED';
  fitnessUpto: string;
  insuranceUpto: string;
  puccUpto: string;
  taxUpto: string;
  jurisdiction: string;
  rtoOffice: string;
  ownerName: string;
  ownerId: string;
  hasNocPending?: boolean;
  hasAddressUpdatePending?: boolean;
  unpaidChallansCount: number;
}

export interface DrivingLicence {
  id: string;
  licenceNumber: string; // unmasked e.g. 'KA-0120150008432'
  maskedNumber: string; // e.g. 'KA-01****8432'
  holderName: string;
  holderId: string;
  dateOfIssue: string;
  validityUpto: string; // expiry date
  licenceClass: string[]; // e.g. ['MCWG', 'LMV']
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'BLOCKED';
  jurisdiction: string;
  issuingRto: string;
  address: string;
  bloodGroup: string;
}

export interface Challan {
  id: string;
  challanNumber: string;
  vehicleNumber: string;
  maskedVehicleNumber: string;
  offense: string;
  date: string;
  location: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'DISPUTED';
  evidenceUrl?: string;
  paymentId?: string;
  ruleProvenance: RuleProvenance;
}

export interface AppointmentSlot {
  id: string;
  serviceCode: string;
  serviceTitle: string;
  jurisdiction: string;
  rtoCode: string;
  rtoLocation: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. '10:30 AM - 11:30 AM'
  availableSlots: number;
  totalSlots: number;
  isBookedByCurrentUser?: boolean;
  isScarcityMode?: boolean;
}

export interface PaymentRecord {
  id: string;
  applicationId: string;
  taskTitle: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  idempotencyKey: string;
  providerReference?: string;
  initiatedAt: string;
  completedAt?: string;
  reconciledAt?: string;
  failureReason?: string;
  statusHistory: { status: PaymentStatus; timestamp: string; note: string }[];
}

export interface HouseholdMember {
  id: string;
  name: string;
  relation: 'SELF' | 'SPOUSE' | 'CHILD' | 'PARENT';
  avatarInitials: string;
  vehiclesCount: number;
  licencesCount: number;
}

export interface PrivacyConsentEvent {
  id: string;
  entityId: string;
  entityType: 'VEHICLE' | 'LICENCE';
  purpose: string;
  revealedAt: string;
  remaskedAt?: string;
  userFictionalId: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  category:
    | 'TASK_UPDATE'
    | 'PAYMENT_EVENT'
    | 'APPOINTMENT_EVENT'
    | 'APPLICATION_EXCEPTION'
    | 'RULE_CHANGE'
    | 'PRIVACY_EVENT'
    | 'DEMO_TRIGGER';
  syntheticEntityId: string;
  previousStatus?: string;
  newStatus?: string;
  triggeringAction: string;
  explanation: string;
}

export interface IntegrationCapability {
  id: string;
  name: string;
  provider: string;
  mode: IntegrationMode;
  supportedOperations: string[];
  lastCheckedAt: string;
  lastSuccessAt?: string;
  lastErrorMessage?: string;
  requiredAuthorization: string;
  documentationUrl: string;
  capabilities: string[];
}

export interface JurisdictionRulePack {
  jurisdictionCode: string;
  jurisdictionName: string;
  version: string;
  status: 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'SYNTHETIC' | 'UNAVAILABLE';
  lastUpdated: string;
  sourceUrl: string;
  officialTransportPortal: string;
  services: {
    serviceCode: string;
    title: string;
    fees: { standard: number; lateFeeTiers?: { daysLate: number; fee: number }[] };
    feeProvenance: RuleProvenance;
    processingDays: number;
    gracePeriodDays: number;
    requiredDocuments: { name: string; required: boolean; category: string }[];
    dependencies: string[];
  }[];
}

export interface DemoLabState {
  appointmentLeadDays: number;
  isScarcityActive: boolean;
  selectedJurisdiction: string;
  rejectedAppId?: string;
  unknownPaymentId?: string;
  scenarioHistory: { scenarioId: string; title: string; timestamp: string }[];
}
