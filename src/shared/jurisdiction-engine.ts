// src/shared/jurisdiction-engine.ts
// Jurisdiction Rule Engine & National Coverage Directory for RTO One

import { JurisdictionRulePack, RuleProvenance } from '../types';

export interface JurisdictionSummary {
  code: string;
  name: string;
  type: 'STATE' | 'UT';
  officialWebsite: string;
  citizenPortal: string;
  ruleStatus: 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'SYNTHETIC' | 'UNAVAILABLE';
  lastVerifiedAt?: string;
  availableServicesCount: number;
  knownGaps: string[];
}

export const KARNATAKA_RULE_PACK: JurisdictionRulePack = {
  jurisdictionCode: 'KA',
  jurisdictionName: 'Karnataka',
  version: '2.4.0',
  status: 'VERIFIED',
  lastUpdated: '2026-03-15T10:00:00Z',
  sourceUrl: 'https://transport.karnataka.gov.in/info-2/Fees+and+User+Charges/en',
  officialTransportPortal: 'https://transport.karnataka.gov.in/',
  services: [
    {
      serviceCode: 'DL_RENEWAL',
      title: 'Driving Licence Renewal',
      fees: {
        standard: 450,
        lateFeeTiers: [
          { daysLate: 30, fee: 1000 },
          { daysLate: 365, fee: 2000 },
        ],
      },
      feeProvenance: 'VERIFIED_OFFICIAL',
      processingDays: 7,
      gracePeriodDays: 30,
      requiredDocuments: [
        { name: 'Form 9 Application for Renewal', required: true, category: 'GENERAL' },
        { name: 'Form 1-A Medical Certificate (if age > 40)', required: true, category: 'MEDICAL' },
        { name: 'Original Expiring Driving Licence', required: true, category: 'IDENTITY' },
        { name: 'Aadhaar Card / Address Proof', required: true, category: 'ADDRESS' },
      ],
      dependencies: ['CHALLAN_CLEARANCE', 'DL_ADDRESS_UPDATE'],
    },
    {
      serviceCode: 'RC_TRANSFER',
      title: 'Vehicle Ownership Transfer',
      fees: { standard: 550 },
      feeProvenance: 'VERIFIED_OFFICIAL',
      processingDays: 14,
      gracePeriodDays: 0,
      requiredDocuments: [
        { name: 'Form 29 Notice of Transfer', required: true, category: 'VEHICLE' },
        { name: 'Form 30 Application for Transfer', required: true, category: 'VEHICLE' },
        { name: 'Original RC Book / Smart Card', required: true, category: 'VEHICLE' },
        { name: 'Valid Insurance Certificate', required: true, category: 'VEHICLE' },
        { name: 'Valid PUCC (Pollution) Certificate', required: true, category: 'VEHICLE' },
      ],
      dependencies: ['CHALLAN_CLEARANCE', 'RC_NOC_ISSUE'],
    },
    {
      serviceCode: 'RC_ADDRESS_UPDATE',
      title: 'RC Address Change',
      fees: { standard: 300 },
      feeProvenance: 'VERIFIED_OFFICIAL',
      processingDays: 10,
      gracePeriodDays: 30,
      requiredDocuments: [
        { name: 'Form 33 Intimation of Address Change', required: true, category: 'VEHICLE' },
        { name: 'New Address Proof (Aadhaar / Voter ID / Utility)', required: true, category: 'ADDRESS' },
        { name: 'Original RC Smart Card', required: true, category: 'VEHICLE' },
      ],
      dependencies: ['CHALLAN_CLEARANCE'],
    },
    {
      serviceCode: 'RC_NOC_ISSUE',
      title: 'No Objection Certificate (NOC)',
      fees: { standard: 100 },
      feeProvenance: 'VERIFIED_OFFICIAL',
      processingDays: 12,
      gracePeriodDays: 0,
      requiredDocuments: [
        { name: 'Form 28 Application for NOC (in triplicate)', required: true, category: 'VEHICLE' },
        { name: 'Police Clearance Certificate', required: true, category: 'GENERAL' },
        { name: 'Valid Commercial / Private Tax Clearance', required: true, category: 'VEHICLE' },
      ],
      dependencies: ['CHALLAN_CLEARANCE'],
    },
    {
      serviceCode: 'DL_ADDRESS_UPDATE',
      title: 'Driving Licence Address Change',
      fees: { standard: 200 },
      feeProvenance: 'VERIFIED_OFFICIAL',
      processingDays: 5,
      gracePeriodDays: 30,
      requiredDocuments: [
        { name: 'Form LL.D. / Online Parivahan Application', required: true, category: 'GENERAL' },
        { name: 'Present Address Proof with Match', required: true, category: 'ADDRESS' },
        { name: 'Original Driving Licence', required: true, category: 'IDENTITY' },
      ],
      dependencies: ['RC_ADDRESS_UPDATE'],
    },
  ],
};

export const MAHARASHTRA_RULE_PACK: JurisdictionRulePack = {
  jurisdictionCode: 'MH',
  jurisdictionName: 'Maharashtra',
  version: '1.9.0',
  status: 'VERIFIED',
  lastUpdated: '2026-02-20T12:00:00Z',
  sourceUrl: 'https://transport.maharashtra.gov.in/',
  officialTransportPortal: 'https://transport.maharashtra.gov.in/',
  services: [
    {
      serviceCode: 'DL_RENEWAL',
      title: 'Driving Licence Renewal',
      fees: { standard: 400 },
      feeProvenance: 'VERIFIED_OFFICIAL',
      processingDays: 10,
      gracePeriodDays: 30,
      requiredDocuments: [
        { name: 'Form 9 Renewal', required: true, category: 'GENERAL' },
        { name: 'Form 1-A Medical Certificate', required: true, category: 'MEDICAL' },
        { name: 'Current Driving Licence', required: true, category: 'IDENTITY' },
      ],
      dependencies: ['CHALLAN_CLEARANCE'],
    },
    {
      serviceCode: 'RC_TRANSFER',
      title: 'Vehicle Ownership Transfer',
      fees: { standard: 600 },
      feeProvenance: 'VERIFIED_OFFICIAL',
      processingDays: 18,
      gracePeriodDays: 0,
      requiredDocuments: [
        { name: 'Form 29 & 30', required: true, category: 'VEHICLE' },
        { name: 'RC Smart Card', required: true, category: 'VEHICLE' },
        { name: 'Insurance & PUCC', required: true, category: 'VEHICLE' },
      ],
      dependencies: ['CHALLAN_CLEARANCE'],
    },
  ],
};

export const ANDHRA_PRADESH_RULE_PACK: JurisdictionRulePack = {
  jurisdictionCode: 'AP',
  jurisdictionName: 'Andhra Pradesh',
  version: '1.3.0',
  status: 'SYNTHETIC',
  lastUpdated: '2026-01-10T08:00:00Z',
  sourceUrl: 'https://aprtacitizen.epragathi.org/',
  officialTransportPortal: 'https://aprtacitizen.epragathi.org/',
  services: [
    {
      serviceCode: 'DL_RENEWAL',
      title: 'Driving Licence Renewal',
      fees: { standard: 450 },
      feeProvenance: 'SYNTHETIC_DEMO',
      processingDays: 8,
      gracePeriodDays: 30,
      requiredDocuments: [
        { name: 'Form 9 Online Citizen Portal', required: true, category: 'GENERAL' },
        { name: 'Medical Fitness Certificate', required: true, category: 'MEDICAL' },
      ],
      dependencies: ['CHALLAN_CLEARANCE'],
    },
  ],
};

// All 28 Indian States & 8 Union Territories
export const NATIONAL_JURISDICTIONS: JurisdictionSummary[] = [
  { code: 'AP', name: 'Andhra Pradesh', type: 'STATE', officialWebsite: 'https://aprtacitizen.epragathi.org/', citizenPortal: 'https://aprtacitizen.epragathi.org/', ruleStatus: 'SYNTHETIC', availableServicesCount: 2, knownGaps: ['e-Pragathi direct API pending approval'] },
  { code: 'AR', name: 'Arunachal Pradesh', type: 'STATE', officialWebsite: 'https://transport.arunachal.gov.in/', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'UNAVAILABLE', availableServicesCount: 0, knownGaps: ['Official state fee schedule unverified'] },
  { code: 'AS', name: 'Assam', type: 'STATE', officialWebsite: 'https://transport.assam.gov.in/', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'PARTIALLY_VERIFIED', availableServicesCount: 1, knownGaps: ['Hill district RTO variations'] },
  { code: 'BR', name: 'Bihar', type: 'STATE', officialWebsite: 'https://state.bihar.gov.in/transport/', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'PARTIALLY_VERIFIED', availableServicesCount: 1, knownGaps: ['Commercial fitness schedule pending'] },
  { code: 'CG', name: 'Chhattisgarh', type: 'STATE', officialWebsite: 'https://cgtransport.gov.in/', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'PARTIALLY_VERIFIED', availableServicesCount: 1, knownGaps: ['Tungsten card charges vary'] },
  { code: 'GA', name: 'Goa', type: 'STATE', officialWebsite: 'https://goatransport.gov.in/', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'PARTIALLY_VERIFIED', availableServicesCount: 1, knownGaps: ['Green cess updates required'] },
  { code: 'GJ', name: 'Gujarat', type: 'STATE', officialWebsite: 'https://cot.gujarat.gov.in/', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'PARTIALLY_VERIFIED', availableServicesCount: 2, knownGaps: ['Automated driving test track rules'] },
  { code: 'HR', name: 'Haryana', type: 'STATE', officialWebsite: 'https://haryanatransport.gov.in/', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'PARTIALLY_VERIFIED', availableServicesCount: 2, knownGaps: ['NCR vintage vehicle rules'] },
  { code: 'HP', name: 'Himachal Pradesh', type: 'STATE', officialWebsite: 'https://himachal.nic.in/transport/', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'UNAVAILABLE', availableServicesCount: 0, knownGaps: ['Snow season vehicle inspection norms'] },
  { code: 'JH', name: 'Jharkhand', type: 'STATE', officialWebsite: 'https://transport.jharkhand.gov.in/', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'UNAVAILABLE', availableServicesCount: 0, knownGaps: ['Mining vehicle NOC requirements'] },
  { code: 'KA', name: 'Karnataka', type: 'STATE', officialWebsite: 'https://transport.karnataka.gov.in/', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'VERIFIED', lastVerifiedAt: '2026-03-15', availableServicesCount: 5, knownGaps: [] },
  { code: 'KL', name: 'Kerala', type: 'STATE', officialWebsite: 'https://mvd.kerala.gov.in/', citizenPortal: 'https://mvd.kerala.gov.in/', ruleStatus: 'PARTIALLY_VERIFIED', availableServicesCount: 3, knownGaps: ['K-Smart integration pending'] },
  { code: 'MP', name: 'Madhya Pradesh', type: 'STATE', officialWebsite: 'https://transport.mp.gov.in/', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'PARTIALLY_VERIFIED', availableServicesCount: 1, knownGaps: ['Bhopal e-challan direct link'] },
  { code: 'MH', name: 'Maharashtra', type: 'STATE', officialWebsite: 'https://transport.maharashtra.gov.in/', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'VERIFIED', lastVerifiedAt: '2026-02-20', availableServicesCount: 2, knownGaps: [] },
  { code: 'MN', name: 'Manipur', type: 'STATE', officialWebsite: 'https://manipur.gov.in/transport/', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'UNAVAILABLE', availableServicesCount: 0, knownGaps: ['Border crossing permit details'] },
  { code: 'ML', name: 'Meghalaya', type: 'STATE', officialWebsite: 'https://megtransport.gov.in/', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'UNAVAILABLE', availableServicesCount: 0, knownGaps: ['High-altitude fitness protocols'] },
  { code: 'MZ', name: 'Mizoram', type: 'STATE', officialWebsite: 'https://transport.mizoram.gov.in/', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'UNAVAILABLE', availableServicesCount: 0, knownGaps: ['District council transport rules'] },
  { code: 'NL', name: 'Nagaland', type: 'STATE', officialWebsite: 'https://transport.nagaland.gov.in/', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'UNAVAILABLE', availableServicesCount: 0, knownGaps: ['NOC verification backchannel'] },
  { code: 'OD', name: 'Odisha', type: 'STATE', officialWebsite: 'https://odishatransport.gov.in/', citizenPortal: 'https://odishatransport.gov.in/', ruleStatus: 'UNAVAILABLE', availableServicesCount: 0, knownGaps: ['Rule pack deliberately unconfigured in Demo scenario'] },
  { code: 'PB', name: 'Punjab', type: 'STATE', officialWebsite: 'https://punjabtransport.org/', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'PARTIALLY_VERIFIED', availableServicesCount: 1, knownGaps: ['Tractor agricultural exemption details'] },
  { code: 'RJ', name: 'Rajasthan', type: 'STATE', officialWebsite: 'https://transport.rajasthan.gov.in/', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'PARTIALLY_VERIFIED', availableServicesCount: 1, knownGaps: ['e-Mitra service fee variations'] },
  { code: 'SK', name: 'Sikkim', type: 'STATE', officialWebsite: 'https://sikkim.gov.in/transport', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'UNAVAILABLE', availableServicesCount: 0, knownGaps: ['Tourist permit commercial rules'] },
  { code: 'TN', name: 'Tamil Nadu', type: 'STATE', officialWebsite: 'https://tnsta.gov.in/', citizenPortal: 'https://tnsta.gov.in/', ruleStatus: 'PARTIALLY_VERIFIED', availableServicesCount: 2, knownGaps: ['Smart card chip vendor specs'] },
  { code: 'TS', name: 'Telangana', type: 'STATE', officialWebsite: 'https://transport.telangana.gov.in/', citizenPortal: 'https://transport.telangana.gov.in/', ruleStatus: 'PARTIALLY_VERIFIED', availableServicesCount: 2, knownGaps: ['T-App Folio API pending'] },
  { code: 'TR', name: 'Tripura', type: 'STATE', officialWebsite: 'https://transport.tripura.gov.in/', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'UNAVAILABLE', availableServicesCount: 0, knownGaps: ['Local municipal taxes'] },
  { code: 'UP', name: 'Uttar Pradesh', type: 'STATE', officialWebsite: 'https://uptransport.upsdc.gov.in/', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'PARTIALLY_VERIFIED', availableServicesCount: 2, knownGaps: ['RTO counter token automation'] },
  { code: 'UK', name: 'Uttarakhand', type: 'STATE', officialWebsite: 'https://transport.uk.gov.in/', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'UNAVAILABLE', availableServicesCount: 0, knownGaps: ['Char Dham green card requirements'] },
  { code: 'WB', name: 'West Bengal', type: 'STATE', officialWebsite: 'https://transport.wb.gov.in/', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'PARTIALLY_VERIFIED', availableServicesCount: 2, knownGaps: ['Kolkata municipal zone permits'] },
  // 8 Union Territories
  { code: 'AN', name: 'Andaman & Nicobar Islands', type: 'UT', officialWebsite: 'https://andaman.gov.in/transport', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'UNAVAILABLE', availableServicesCount: 0, knownGaps: ['Island inter-ferry vehicle transport'] },
  { code: 'CH', name: 'Chandigarh', type: 'UT', officialWebsite: 'https://chdtransport.gov.in/', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'PARTIALLY_VERIFIED', availableServicesCount: 1, knownGaps: ['Tri-city permit harmonisation'] },
  { code: 'DN', name: 'Dadra & Nagar Haveli and Daman & Diu', type: 'UT', officialWebsite: 'https://daman.nic.in/transport.aspx', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'UNAVAILABLE', availableServicesCount: 0, knownGaps: ['Merged UT taxation updates'] },
  { code: 'DL', name: 'Delhi', type: 'UT', officialWebsite: 'https://transport.delhi.gov.in/', citizenPortal: 'https://transport.delhi.gov.in/', ruleStatus: 'PARTIALLY_VERIFIED', availableServicesCount: 3, knownGaps: ['10-yr diesel / 15-yr petrol deregistration'] },
  { code: 'JK', name: 'Jammu & Kashmir', type: 'UT', officialWebsite: 'https://jktranport.nic.in/', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'UNAVAILABLE', availableServicesCount: 0, knownGaps: ['Winter road tax seasonal waiver'] },
  { code: 'LA', name: 'Ladakh', type: 'UT', officialWebsite: 'https://ladakh.nic.in/transport', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'UNAVAILABLE', availableServicesCount: 0, knownGaps: ['High altitude sub-zero battery checks'] },
  { code: 'LD', name: 'Lakshadweep', type: 'UT', officialWebsite: 'https://lakshadweep.gov.in/transport', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'UNAVAILABLE', availableServicesCount: 0, knownGaps: ['Restricted entry permit coordination'] },
  { code: 'PY', name: 'Puducherry', type: 'UT', officialWebsite: 'https://transport.py.gov.in/', citizenPortal: 'https://parivahan.gov.in/', ruleStatus: 'PARTIALLY_VERIFIED', availableServicesCount: 1, knownGaps: ['Enclave vehicle registration transfer'] },
];

export class JurisdictionRuleEngine {
  private static rulePacks: Map<string, JurisdictionRulePack> = new Map([
    ['KA', KARNATAKA_RULE_PACK],
    ['MH', MAHARASHTRA_RULE_PACK],
    ['AP', ANDHRA_PRADESH_RULE_PACK],
  ]);

  public static getRulePack(jurisdictionCode: string): JurisdictionRulePack {
    const code = jurisdictionCode.toUpperCase();
    const pack = this.rulePacks.get(code);

    if (!pack) {
      // Missing Odisha or unconfigured jurisdiction!
      // Must NOT guess fees or substitute another state!
      throw new Error(
        `Rules unavailable for jurisdiction "${code}". Official estimates are unavailable because a validated rule pack has not been configured. We will not guess fees, required documents, or processing times.`
      );
    }

    return pack;
  }

  public static isJurisdictionConfigured(jurisdictionCode: string): boolean {
    return this.rulePacks.has(jurisdictionCode.toUpperCase());
  }

  public static getNationalCoverage(): JurisdictionSummary[] {
    return NATIONAL_JURISDICTIONS;
  }

  public static getOfficialPortal(jurisdictionCode: string): string {
    const code = jurisdictionCode.toUpperCase();
    const item = NATIONAL_JURISDICTIONS.find((j) => j.code === code);
    return item?.officialWebsite || 'https://parivahan.gov.in/';
  }

  public static getProvenanceLabel(provenance: RuleProvenance): {
    label: string;
    description: string;
    isVerified: boolean;
  } {
    switch (provenance) {
      case 'VERIFIED_OFFICIAL':
        return {
          label: 'Verified Official',
          description: 'Documented from gazetted state transport department notifications.',
          isVerified: true,
        };
      case 'OFFICIAL_SOURCE_NOT_YET_VERIFIED':
        return {
          label: 'Official Pending Verification',
          description: 'Extracted from public government portals, pending legal audit.',
          isVerified: false,
        };
      case 'SYNTHETIC_DEMO':
        return {
          label: 'Simulated Demo Value',
          description: 'Synthetic configuration for demonstration purposes only.',
          isVerified: false,
        };
      case 'STALE_INFORMATION':
        return {
          label: 'Stale Information',
          description: 'Rule pack needs re-validation with state transport gazette.',
          isVerified: false,
        };
      case 'UNAVAILABLE':
      default:
        return {
          label: 'Rules Unavailable',
          description: 'No verified rule pack configured. Refer to official state portal.',
          isVerified: false,
        };
    }
  }
}
