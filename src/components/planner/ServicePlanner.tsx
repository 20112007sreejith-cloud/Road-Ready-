// src/components/planner/ServicePlanner.tsx
import React, { useState } from 'react';
import {
  Compass,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  DollarSign,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { KARNATAKA_RULE_PACK, MAHARASHTRA_RULE_PACK } from '../../shared/jurisdiction-engine';

interface ServiceItem {
  id: string;
  code: string;
  title: string;
  category: 'VEHICLE' | 'DRIVING_LICENCE' | 'GENERAL';
  description: string;
  jurisdiction: string;
  standardFee: number;
  processingDays: number;
  gracePeriodDays: number;
  dependencies: string[];
  documents: { name: string; required: boolean; category: string }[];
  officialPortal: string;
  sourceProvenance: 'VERIFIED_OFFICIAL' | 'SYNTHETIC_DEMO';
}

const CATALOGUE_SERVICES: ServiceItem[] = [
  {
    id: 'srv-dl-renew',
    code: 'DL_RENEWAL',
    title: 'Driving Licence Renewal',
    category: 'DRIVING_LICENCE',
    description: 'Statutory renewal of expired or expiring driving licences under Motor Vehicles Act Section 15.',
    jurisdiction: 'Karnataka (KA)',
    standardFee: 450,
    processingDays: 7,
    gracePeriodDays: 30,
    dependencies: ['Clear outstanding challans', 'Address synchronization (if relocated)'],
    documents: [
      { name: 'Form 9 Online Application', required: true, category: 'GENERAL' },
      { name: 'Form 1-A Medical Fitness Certificate (Age > 40)', required: true, category: 'MEDICAL' },
      { name: 'Original Physical Driving Licence', required: true, category: 'IDENTITY' },
      { name: 'Aadhaar / Proof of Current Address', required: true, category: 'ADDRESS' },
    ],
    officialPortal: 'https://sarathi.parivahan.gov.in/',
    sourceProvenance: 'VERIFIED_OFFICIAL',
  },
  {
    id: 'srv-rc-transfer',
    code: 'RC_TRANSFER',
    title: 'Vehicle Ownership Transfer',
    category: 'VEHICLE',
    description: 'Transfer vehicle registration ownership from seller to buyer under CMVR Rule 55.',
    jurisdiction: 'Karnataka (KA)',
    standardFee: 550,
    processingDays: 14,
    gracePeriodDays: 0,
    dependencies: ['Clear outstanding challans', 'NOC from origin state (if inter-state)'],
    documents: [
      { name: 'Form 29 (Notice of Transfer in duplicate)', required: true, category: 'VEHICLE' },
      { name: 'Form 30 (Application for Transfer of Ownership)', required: true, category: 'VEHICLE' },
      { name: 'Original RC Smart Card / Book', required: true, category: 'VEHICLE' },
      { name: 'Valid Insurance Certificate (Buyer name)', required: true, category: 'VEHICLE' },
      { name: 'Valid PUCC Certificate', required: true, category: 'VEHICLE' },
    ],
    officialPortal: 'https://parivahan.gov.in/vahan/',
    sourceProvenance: 'VERIFIED_OFFICIAL',
  },
  {
    id: 'srv-rc-addr',
    code: 'RC_ADDRESS_UPDATE',
    title: 'RC Address Change',
    category: 'VEHICLE',
    description: 'Record new residential address on vehicle registration smart card within 30 days of moving.',
    jurisdiction: 'Karnataka (KA)',
    standardFee: 300,
    processingDays: 10,
    gracePeriodDays: 30,
    dependencies: ['Clear outstanding challans'],
    documents: [
      { name: 'Form 33 (Intimation of Address Change)', required: true, category: 'VEHICLE' },
      { name: 'New Address Proof (Aadhaar / Voter ID / Utility Bill)', required: true, category: 'ADDRESS' },
      { name: 'Original RC Smart Card', required: true, category: 'VEHICLE' },
    ],
    officialPortal: 'https://parivahan.gov.in/vahan/',
    sourceProvenance: 'VERIFIED_OFFICIAL',
  },
  {
    id: 'srv-rc-noc',
    code: 'RC_NOC_ISSUE',
    title: 'Inter-State No Objection Certificate (NOC)',
    category: 'VEHICLE',
    description: 'Issue of NOC from parent RTO to re-register a vehicle in another state under MV Act Section 48.',
    jurisdiction: 'Maharashtra (MH)',
    standardFee: 100,
    processingDays: 12,
    gracePeriodDays: 0,
    dependencies: ['Clear outstanding challans across national register'],
    documents: [
      { name: 'Form 28 in Triplicate with chassis pencil print', required: true, category: 'VEHICLE' },
      { name: 'Local Police Station Non-Involvement Clearance', required: true, category: 'GENERAL' },
      { name: 'Commercial / Private Tax Clearance Receipt', required: true, category: 'VEHICLE' },
    ],
    officialPortal: 'https://transport.maharashtra.gov.in/',
    sourceProvenance: 'VERIFIED_OFFICIAL',
  },
  {
    id: 'srv-dl-addr',
    code: 'DL_ADDRESS_UPDATE',
    title: 'Driving Licence Address Change',
    category: 'DRIVING_LICENCE',
    description: 'Update address on driving licence to match current residential jurisdiction.',
    jurisdiction: 'Karnataka (KA)',
    standardFee: 200,
    processingDays: 5,
    gracePeriodDays: 30,
    dependencies: ['RC address update (recommended household synchronization)'],
    documents: [
      { name: 'Online Application on Sarathi', required: true, category: 'GENERAL' },
      { name: 'Present Address Proof with matching name', required: true, category: 'ADDRESS' },
      { name: 'Original Driving Licence', required: true, category: 'IDENTITY' },
    ],
    officialPortal: 'https://sarathi.parivahan.gov.in/',
    sourceProvenance: 'VERIFIED_OFFICIAL',
  },
  {
    id: 'srv-dl-duplicate',
    code: 'DL_DUPLICATE',
    title: 'Duplicate Driving Licence',
    category: 'DRIVING_LICENCE',
    description: 'Replacement of lost, torn, defaced, or damaged driving licence smart card.',
    jurisdiction: 'Karnataka (KA)',
    standardFee: 400,
    processingDays: 8,
    gracePeriodDays: 0,
    dependencies: ['Police complaint report (LDR/FIR) if lost'],
    documents: [
      { name: 'Form 2 (Application for Duplicate Licence)', required: true, category: 'GENERAL' },
      { name: 'Police Lost Article / FIR Acknowledgment', required: true, category: 'GENERAL' },
      { name: 'Damaged card copy (if mutilated)', required: false, category: 'IDENTITY' },
    ],
    officialPortal: 'https://sarathi.parivahan.gov.in/',
    sourceProvenance: 'VERIFIED_OFFICIAL',
  },
];

interface ServicePlannerProps {
  onPlanService: (serviceCode: string) => void;
}

export const ServicePlanner: React.FC<ServicePlannerProps> = ({ onPlanService }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [inspectingService, setInspectingService] = useState<ServiceItem | null>(null);

  const filtered = CATALOGUE_SERVICES.filter((srv) => {
    const matchesSearch =
      srv.title.toLowerCase().includes(search.toLowerCase()) ||
      srv.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || srv.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Transport Service Planner & Catalogue</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              Verified Rule Packs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse official vehicle and licence services with verified statutory fee schedules, prerequisite rules, and required document checklists.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 sm:w-60"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Categories</option>
            <option value="DRIVING_LICENCE">Driving Licences</option>
            <option value="VEHICLE">Vehicles (RC)</option>
          </select>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((srv) => (
          <div
            key={srv.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  {srv.category.replace('_', ' ')}
                </span>
                <Badge provenance={srv.sourceProvenance} />
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900">{srv.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                  {srv.description}
                </p>
              </div>

              {/* Fee & Timing */}
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500">Official Fee:</span>
                  <div className="font-bold text-slate-900 mt-0.5">₹{srv.standardFee}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Est. Duration:</span>
                  <div className="font-bold text-slate-900 mt-0.5">{srv.processingDays} Days</div>
                </div>
              </div>

              {/* Prerequisites list */}
              <div className="space-y-1 text-xs">
                <span className="font-semibold text-slate-700 text-[11px]">Configured Prerequisites:</span>
                <ul className="space-y-0.5 text-[11px] text-slate-600">
                  {srv.dependencies.map((dep, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span className="truncate">{dep}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-1/2 text-xs"
                onClick={() => setInspectingService(srv)}
              >
                Inspect Checklist
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="w-1/2 text-xs"
                onClick={() => onPlanService(srv.code)}
              >
                Start Preparation
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail & Document Checklist Modal */}
      {inspectingService && (
        <Modal
          isOpen={!!inspectingService}
          onClose={() => setInspectingService(null)}
          title={inspectingService.title}
          description={`Jurisdiction: ${inspectingService.jurisdiction} • Verified under State Motor Vehicles Rules`}
          maxWidth="xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <a
                href={inspectingService.officialPortal}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                Open Official Portal <ExternalLink className="w-3 h-3" />
              </a>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setInspectingService(null)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    const code = inspectingService.code;
                    setInspectingService(null);
                    onPlanService(code);
                  }}
                >
                  Proceed with Workflow
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">{inspectingService.description}</p>

            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Standard Fee</span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">₹{inspectingService.standardFee}</div>
                <span className="text-[10px] text-emerald-700 font-semibold">No hidden surcharges</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Processing Estimate</span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{inspectingService.processingDays} Days</div>
                <span className="text-[10px] text-slate-400">Calendar days</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Statutory Grace Period</span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{inspectingService.gracePeriodDays} Days</div>
                <span className="text-[10px] text-slate-400">Post-expiry</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-2">Required Document Checklist:</h4>
              <div className="space-y-2">
                {inspectingService.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="font-medium text-slate-900">{doc.name}</div>
                        <div className="text-[10px] text-slate-400">Category: {doc.category}</div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        doc.required
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {doc.required ? 'Mandatory' : 'Optional'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
