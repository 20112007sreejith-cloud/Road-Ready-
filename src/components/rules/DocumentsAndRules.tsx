// src/components/rules/DocumentsAndRules.tsx
import React, { useState } from 'react';
import {
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Search,
  CheckCircle2,
  FileText,
  DollarSign,
  Clock,
  Layers,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import {
  JurisdictionRuleEngine,
  KARNATAKA_RULE_PACK,
  MAHARASHTRA_RULE_PACK,
  ANDHRA_PRADESH_RULE_PACK,
  NATIONAL_JURISDICTIONS,
  JurisdictionSummary,
} from '../../shared/jurisdiction-engine';

export const DocumentsAndRules: React.FC = () => {
  const [selectedJurCode, setSelectedJurCode] = useState<string>('KA');
  const [showNationalMatrix, setShowNationalMatrix] = useState(false);
  const [matrixSearch, setMatrixSearch] = useState('');

  const isOdisha = selectedJurCode === 'OD';
  const isKarnataka = selectedJurCode === 'KA';
  const isMaharashtra = selectedJurCode === 'MH';
  const isAndhra = selectedJurCode === 'AP';

  const currentPack = isKarnataka
    ? KARNATAKA_RULE_PACK
    : isMaharashtra
    ? MAHARASHTRA_RULE_PACK
    : isAndhra
    ? ANDHRA_PRADESH_RULE_PACK
    : null;

  const filteredNational = NATIONAL_JURISDICTIONS.filter(
    (j: JurisdictionSummary) =>
      j.name.toLowerCase().includes(matrixSearch.toLowerCase()) ||
      j.code.toLowerCase().includes(matrixSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Jurisdiction Rule Packs & Legal Provenance
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              Versioned Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Separates national statutory rules from state-specific fee schedules and office procedures with strict source attribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => setShowNationalMatrix(true)}
          >
            <Layers className="w-3.5 h-3.5 mr-1" />
            National Coverage Matrix (36 States & UTs)
          </Button>
        </div>
      </div>

      {/* Jurisdiction Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 font-semibold shrink-0">Select Jurisdiction:</span>
        {[
          { code: 'KA', label: 'Karnataka (Verified v2.4.0)', status: 'VERIFIED' },
          { code: 'MH', label: 'Maharashtra (Verified v1.9.0)', status: 'VERIFIED' },
          { code: 'AP', label: 'Andhra Pradesh (Synthetic v1.3.0)', status: 'SYNTHETIC' },
          { code: 'OD', label: 'Odisha (Deliberately Missing Fallback)', status: 'UNAVAILABLE' },
        ].map((tab) => (
          <button
            key={tab.code}
            onClick={() => setSelectedJurCode(tab.code)}
            className={`px-3 py-1.5 rounded-lg border font-medium shrink-0 transition-colors flex items-center gap-1.5 ${
              selectedJurCode === tab.code
                ? tab.code === 'OD'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-2xs font-semibold'
                  : 'bg-blue-600 text-white border-blue-600 shadow-2xs font-semibold'
                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
            }`}
          >
            {tab.code === 'OD' && <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Missing Odisha Fallback View */}
      {isOdisha ? (
        <div className="bg-white rounded-xl border border-purple-300 p-8 shadow-xs text-center max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto text-purple-700">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Rules Unavailable for Jurisdiction: Odisha (OD)
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Official estimates are unavailable because a validated rule pack has not been configured. Under our civic-tech trust principles,{' '}
              <strong>we will not guess fees, required documents, or processing times</strong>, nor silently substitute another state's legal requirements.
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-left text-xs text-purple-900 space-y-2">
            <div className="font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-700" />
              Honest Public Service Guarantee:
            </div>
            <ul className="space-y-1 list-disc list-inside text-purple-800 text-[11px]">
              <li>Zero fabricated fees or guessed late penalties.</li>
              <li>No cross-state legal assumptions or generic placeholder numbers.</li>
              <li>Transparent handoff directly to the authoritative state transport portal.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="https://odishatransport.gov.in/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Open Official Odisha Transport Portal <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedJurCode('KA')}
              className="text-xs"
            >
              Return to Supported Jurisdictions (KA)
            </Button>
          </div>
        </div>
      ) : currentPack ? (
        /* Configured Rule Pack View */
        <div className="space-y-5">
          {/* Metadata Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900">
                    {currentPack.jurisdictionName} Rule Pack
                  </h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold border border-slate-200">
                    v{currentPack.version}
                  </span>
                  <Badge provenance={currentPack.status === 'VERIFIED' ? 'VERIFIED_OFFICIAL' : 'SYNTHETIC_DEMO'} />
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Last verified: {new Date(currentPack.lastUpdated).toLocaleDateString()} • Source:{' '}
                  <a
                    href={currentPack.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {currentPack.sourceUrl}
                  </a>
                </div>
              </div>

              <a
                href={currentPack.officialTransportPortal}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                Official Transport Portal <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="text-xs text-slate-600">
              Configured services: <strong>{currentPack.services.length} workflow definitions</strong>. All fees and document checklists enforced by Application State Machine.
            </div>
          </div>

          {/* Services List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {currentPack.services.map((srv: any) => (
              <div
                key={srv.serviceCode}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">{srv.title}</h4>
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ₹{srv.fees.standard}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-lg text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px]">Processing Estimate:</span>
                    <div className="font-semibold text-slate-800">{srv.processingDays} Days</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Statutory Grace Period:</span>
                    <div className="font-semibold text-slate-800">{srv.gracePeriodDays} Days</div>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-slate-700 text-[11px]">Required Documents:</span>
                  <div className="space-y-1">
                    {srv.requiredDocuments.map((doc: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                        <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{doc.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* National Coverage Matrix Modal */}
      {showNationalMatrix && (
        <Modal
          isOpen={showNationalMatrix}
          onClose={() => setShowNationalMatrix(false)}
          title="National Jurisdiction Coverage Matrix (All 28 States & 8 UTs)"
          description="Transparent tracking of rule pack status, verification dates, official state websites, and known digital integration gaps."
          maxWidth="3xl"
          footer={
            <Button size="sm" variant="outline" onClick={() => setShowNationalMatrix(false)}>
              Close Matrix
            </Button>
          }
        >
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by state or UT name..."
                value={matrixSearch}
                onChange={(e) => setMatrixSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="overflow-x-auto max-h-96 rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-900 sticky top-0">
                  <tr>
                    <th className="p-2.5">Code</th>
                    <th className="p-2.5">Jurisdiction</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Rule Status</th>
                    <th className="p-2.5">Official Portal</th>
                    <th className="p-2.5">Known Gaps</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredNational.map((jur: JurisdictionSummary) => (
                    <tr key={jur.code} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-mono font-bold text-slate-900">{jur.code}</td>
                      <td className="p-2.5 font-medium">{jur.name}</td>
                      <td className="p-2.5 text-[11px] text-slate-500">{jur.type}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            jur.ruleStatus === 'VERIFIED'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : jur.ruleStatus === 'SYNTHETIC'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : jur.ruleStatus === 'PARTIALLY_VERIFIED'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {jur.ruleStatus}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <a
                          href={jur.officialWebsite}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1 text-[11px]"
                        >
                          Portal <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="p-2.5 text-[11px] text-slate-500 max-w-xs truncate">
                        {jur.knownGaps.join('; ') || 'None'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
