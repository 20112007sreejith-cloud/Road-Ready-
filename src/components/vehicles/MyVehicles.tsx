// src/components/vehicles/MyVehicles.tsx
import React, { useState } from 'react';
import { Car, Eye, EyeOff, ShieldCheck, AlertTriangle, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Vehicle } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface MyVehiclesProps {
  vehicles: Vehicle[];
  onStartService: (serviceCode: string, vehicleId: string) => void;
  onRequestConsent: (entityId: string, entityType: 'VEHICLE', label: string) => void;
  revealedEntities: Set<string>;
}

export const MyVehicles: React.FC<MyVehiclesProps> = ({
  vehicles,
  onStartService,
  onRequestConsent,
  revealedEntities,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Registered Household Vehicles</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              {vehicles.length} Vehicles
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative synthetic records mapped across Karnataka (KA) and Maharashtra (MH) jurisdictions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Privacy Default: Masked Identifiers
          </span>
        </div>
      </div>

      {/* Vehicle Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vehicles.map((v) => {
          const isRevealed = revealedEntities.has(v.id);
          const displayNumber = isRevealed ? v.registrationNumber : v.maskedNumber;

          return (
            <div
              key={v.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Plate & Make Top Banner */}
                <div className="bg-slate-900 text-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                      {v.fuelType} • {v.jurisdiction}
                    </span>
                    <button
                      onClick={() => onRequestConsent(v.id, 'VEHICLE', v.makeModel)}
                      className="flex items-center gap-1 text-[11px] text-blue-300 hover:text-white px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 transition-colors"
                      title={isRevealed ? 'Revealed with Consent' : 'Request Consent to Reveal Full Plate'}
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

                  <div className="mt-2 flex items-center justify-between">
                    <div className="font-mono text-lg font-extrabold tracking-wide text-white">
                      {displayNumber}
                    </div>
                    {v.unpaidChallansCount > 0 && (
                      <span className="text-[10px] px-2 py-0.5 bg-rose-500/20 text-rose-300 font-bold rounded border border-rose-500/30">
                        {v.unpaidChallansCount} Challan Unpaid
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-300 mt-1 font-medium">{v.makeModel}</div>
                </div>

                {/* Body Specs */}
                <div className="p-4 space-y-3 text-xs text-slate-600">
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Registered Owner:</span>
                    <span className="font-semibold text-slate-900">{v.ownerName}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Issuing RTO:</span>
                    <span className="font-medium text-slate-800 text-right">{v.rtoOffice}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">RC Status:</span>
                    <span
                      className={`font-semibold ${
                        v.rcStatus === 'ACTIVE' ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {v.rcStatus === 'TRANSFER_PENDING' ? 'Ownership Transfer Pending' : v.rcStatus}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Insurance Valid Upto:</span>
                    <span className="font-medium text-slate-800">{v.insuranceUpto}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">PUCC Pollution:</span>
                    <span className="font-medium text-slate-800">{v.puccUpto}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Road Tax Status:</span>
                    <span className="font-medium text-slate-800">{v.taxUpto}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                {v.hasAddressUpdatePending ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs text-blue-700 border-blue-200 hover:bg-blue-50"
                    onClick={() => onStartService('RC_ADDRESS_UPDATE', v.id)}
                  >
                    View Address Change Task
                  </Button>
                ) : v.hasNocPending ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs text-amber-800 border-amber-200 hover:bg-amber-50"
                    onClick={() => onStartService('RC_NOC_ISSUE', v.id)}
                  >
                    View Cross-State NOC Task
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => onStartService('RC_TRANSFER', v.id)}
                  >
                    Manage Vehicle Services
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
