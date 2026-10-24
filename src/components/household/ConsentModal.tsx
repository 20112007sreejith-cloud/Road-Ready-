// src/components/household/ConsentModal.tsx
import React, { useState } from 'react';
import { Eye, ShieldAlert, Lock, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityType: 'VEHICLE' | 'LICENCE';
  entityLabel: string;
  onConfirmConsent: (purpose: string) => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  isOpen,
  onClose,
  entityId,
  entityType,
  entityLabel,
  onConfirmConsent,
}) => {
  const [selectedPurpose, setSelectedPurpose] = useState<string>('Insurance Policy Renewal');
  const [customNote, setCustomNote] = useState<string>('');

  const purposes = [
    'Insurance Policy Renewal / Quote Verification',
    'Traffic Challan Dispute Evidence Check',
    'Inter-State Ownership Transfer Application',
    'Driving Licence Biometrics / Renewal',
    'Commercial Fleet / Tax Compliance Audit',
  ];

  const handleConfirm = () => {
    const finalPurpose = selectedPurpose === 'Other' ? customNote || 'Administrative verification' : selectedPurpose;
    onConfirmConsent(finalPurpose);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Consent-Gated Identifier Unmasking"
      description={`Requesting explicit citizen authorization to view unmasked ${entityType} for "${entityLabel}".`}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] text-slate-400">Zero raw identifiers logged</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={onClose}>
              Cancel (Keep Masked)
            </Button>
            <Button size="sm" variant="primary" onClick={handleConfirm}>
              <Eye className="w-3.5 h-3.5 mr-1" />
              Consent & Reveal
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 leading-relaxed">
          <div className="font-semibold flex items-center gap-1.5 mb-1">
            <Lock className="w-4 h-4 text-blue-700" />
            Digital Personal Data Protection (DPDP) Principle:
          </div>
          Under Section 6 of the DPDP Act, personal vehicle registration and licence numbers remain masked by default. Revealing requires an explicit legitimate purpose.
        </div>

        <div>
          <label className="font-semibold text-slate-800 block mb-1">
            Select Purpose for Unmasking:
          </label>
          <div className="space-y-1.5">
            {purposes.map((p) => (
              <label
                key={p}
                className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name="purpose"
                  checked={selectedPurpose === p}
                  onChange={() => setSelectedPurpose(p)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-800 font-medium">{p}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-500 text-[11px]">
          <strong>Notice:</strong> Closing this view or refreshing the page will immediately re-mask the identifier. A privacy audit event will record the timestamp and purpose, but never the unmasked identifier.
        </div>
      </div>
    </Modal>
  );
};
