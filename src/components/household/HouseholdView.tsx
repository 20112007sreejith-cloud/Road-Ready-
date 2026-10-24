// src/components/household/HouseholdView.tsx
import React, { useState } from 'react';
import {
  Users,
  Car,
  CreditCard,
  ShieldCheck,
  Eye,
  EyeOff,
  UserCheck,
  Lock,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { HouseholdMember, Vehicle, DrivingLicence } from '../../types';
import { Button } from '../common/Button';
import { ConsentModal } from './ConsentModal';

interface HouseholdViewProps {
  members: HouseholdMember[];
  vehicles: Vehicle[];
  licences: DrivingLicence[];
  onConsentRecord: (entityId: string, entityType: 'VEHICLE' | 'LICENCE', purpose: string) => void;
  revealedEntities: Set<string>;
  setRevealedEntities: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export const HouseholdView: React.FC<HouseholdViewProps> = ({
  members,
  vehicles,
  licences,
  onConsentRecord,
  revealedEntities,
  setRevealedEntities,
}) => {
  const [consentTarget, setConsentTarget] = useState<{
    entityId: string;
    entityType: 'VEHICLE' | 'LICENCE';
    label: string;
  } | null>(null);

  const handleOpenConsent = (entityId: string, entityType: 'VEHICLE' | 'LICENCE', label: string) => {
    // If already revealed, click toggles remask immediately!
    if (revealedEntities.has(entityId)) {
      setRevealedEntities((prev) => {
        const next = new Set(prev);
        next.delete(entityId);
        return next;
      });
      return;
    }

    setConsentTarget({ entityId, entityType, label });
  };

  const handleConfirmConsent = (purpose: string) => {
    if (consentTarget) {
      onConsentRecord(consentTarget.entityId, consentTarget.entityType, purpose);
      setRevealedEntities((prev) => new Set(prev).add(consentTarget.entityId));
      setConsentTarget(null);
    }
  };

  const handleRemaskAll = () => {
    setRevealedEntities(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Privacy-First Household Profile & Unified Garage
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              Consent Gate Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage family vehicles and licences under one roof with client-side masking and purpose-bound access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {revealedEntities.size > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRemaskAll}
              className="text-xs text-rose-700 border-rose-300 hover:bg-rose-50"
            >
              <EyeOff className="w-3.5 h-3.5 mr-1" />
              Remask All ({revealedEntities.size})
            </Button>
          )}
          <span className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            DPDP Principle Enforced
          </span>
        </div>
      </div>

      {/* Household Members Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4 hover:border-blue-300 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
              {member.avatarInitials}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">{member.name}</h4>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {member.relation}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Car className="w-3 h-3 text-slate-400" /> {member.vehiclesCount} Vehicles
                </span>
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-slate-400" /> {member.licencesCount} Licences
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Household Vehicles Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Family Vehicles (Masked Identifiers)</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Click eye icon to request consent</span>
        </div>

        <div className="space-y-3">
          {vehicles.map((v) => {
            const isRevealed = revealedEntities.has(v.id);
            return (
              <div
                key={v.id}
                className="p-3.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-bold text-slate-900">
                      {isRevealed ? v.registrationNumber : v.maskedNumber}
                    </span>
                    <button
                      onClick={() => handleOpenConsent(v.id, 'VEHICLE', v.makeModel)}
                      className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                      title={isRevealed ? 'Click to Remask' : 'Consent to Reveal'}
                    >
                      {isRevealed ? (
                        <EyeOff className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    {isRevealed && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-800 font-bold rounded border border-emerald-200">
                        Consent Verified
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {v.makeModel} • Registered to <strong>{v.ownerName}</strong> ({v.rtoOffice})
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-500 font-medium">{v.taxUpto}</span>
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {v.rcStatus}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Household Licences Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">Family Driving Licences</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Click eye icon to request consent</span>
        </div>

        <div className="space-y-3">
          {licences.map((dl) => {
            const isRevealed = revealedEntities.has(dl.id);
            return (
              <div
                key={dl.id}
                className="p-3.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-bold text-slate-900">
                      {isRevealed ? dl.licenceNumber : dl.maskedNumber}
                    </span>
                    <button
                      onClick={() => handleOpenConsent(dl.id, 'LICENCE', dl.holderName)}
                      className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                      title={isRevealed ? 'Click to Remask' : 'Consent to Reveal'}
                    >
                      {isRevealed ? (
                        <EyeOff className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    {isRevealed && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-800 font-bold rounded border border-emerald-200">
                        Consent Verified
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Holder: <strong>{dl.holderName}</strong> • {dl.licenceClass.join(', ')}
                  </div>
                </div>

                <div className="text-xs font-semibold text-slate-700">
                  Valid Upto: <span className="font-mono text-slate-900">{dl.validityUpto}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Consent Modal Trigger */}
      {consentTarget && (
        <ConsentModal
          isOpen={!!consentTarget}
          onClose={() => setConsentTarget(null)}
          entityId={consentTarget.entityId}
          entityType={consentTarget.entityType}
          entityLabel={consentTarget.label}
          onConfirmConsent={handleConfirmConsent}
        />
      )}
    </div>
  );
};
