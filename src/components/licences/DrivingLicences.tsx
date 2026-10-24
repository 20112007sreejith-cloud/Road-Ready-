// src/components/licences/DrivingLicences.tsx
import React from 'react';
import { CreditCard, Eye, EyeOff, ShieldCheck, Clock, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { DrivingLicence } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface DrivingLicencesProps {
  licences: DrivingLicence[];
  onStartRenewal: () => void;
  onRequestConsent: (entityId: string, entityType: 'LICENCE', label: string) => void;
  revealedEntities: Set<string>;
  isScarcityMode: boolean;
}

export const DrivingLicences: React.FC<DrivingLicencesProps> = ({
  licences,
  onStartRenewal,
  onRequestConsent,
  revealedEntities,
  isScarcityMode,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Driving Licences (Sarathi Portal)</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              {licences.length} Licences
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative driving licences for family members. Monitored for statutory expiry and biometric appointments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={onStartRenewal}
            className="text-xs"
          >
            Renew Expiring Licence
          </Button>
        </div>
      </div>

      {/* Licence Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {licences.map((dl) => {
          const isRevealed = revealedEntities.has(dl.id);
          const displayNumber = isRevealed ? dl.licenceNumber : dl.maskedNumber;
          const isExpiring = dl.status === 'EXPIRING_SOON';

          return (
            <div
              key={dl.id}
              className={`bg-white rounded-xl border shadow-xs overflow-hidden flex flex-col justify-between ${
                isExpiring ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
              }`}
            >
              <div>
                {/* Top Smart Card Header */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">
                        Government of {dl.jurisdiction === 'KA' ? 'Karnataka' : dl.jurisdiction} • Transport Department
                      </div>
                      <div className="text-xs font-semibold text-slate-200 mt-0.5">
                        DRIVING LICENCE (FORM 7 SMART CARD)
                      </div>
                    </div>
                    <button
                      onClick={() => onRequestConsent(dl.id, 'LICENCE', dl.holderName)}
                      className="flex items-center gap-1 text-[11px] text-indigo-200 hover:text-white px-2 py-0.5 rounded bg-indigo-900/60 border border-indigo-700 transition-colors"
                      title={isRevealed ? 'Revealed with Consent' : 'Request Consent to Reveal Licence Number'}
                    >
                      {isRevealed ? (
                        <>
                          <EyeOff className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">Revealed</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3 text-slate-400" />
                          <span>Reveal</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        Licence Number
                      </div>
                      <div className="font-mono text-lg font-bold text-white tracking-wider">
                        {displayNumber}
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-indigo-800/80 border border-indigo-600 flex items-center justify-center font-bold text-xs text-indigo-100 shadow-inner">
                      CHIP
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-5 space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-slate-500 text-[11px]">Holder Name:</span>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">{dl.holderName}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px]">Blood Group:</span>
                      <div className="font-semibold text-slate-800 mt-0.5">{dl.bloodGroup}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-slate-500 text-[11px]">Valid Upto:</span>
                      <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                        <span>{dl.validityUpto}</span>
                        {isExpiring && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 font-bold rounded">
                            19 Days Left
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px]">Issuing Authority:</span>
                      <div className="font-medium text-slate-800 mt-0.5">{dl.issuingRto}</div>
                    </div>
                  </div>

                  <div className="pb-3 border-b border-slate-100">
                    <span className="text-slate-500 text-[11px]">Vehicle Classes Endorsed:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {dl.licenceClass.map((cls) => (
                        <span
                          key={cls}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded border border-slate-200 text-[11px]"
                        >
                          {cls}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[11px]">Registered Address:</span>
                    <p className="text-slate-700 mt-0.5 leading-relaxed">{dl.address}</p>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                {isExpiring ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="text-xs">
                      <span className="font-semibold text-amber-900">Renewal Recommended</span>
                      <p className="text-[11px] text-slate-500">
                        {isScarcityMode
                          ? 'CRITICAL RISK due to 21-day appointment delay'
                          : 'Grace period: 30 days past expiry'}
                      </p>
                    </div>
                    <Button size="sm" variant="primary" onClick={onStartRenewal} className="text-xs">
                      Start Renewal
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Valid & In Good Standing
                    </span>
                    <span className="text-[11px]">Next renewal: {dl.validityUpto}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
