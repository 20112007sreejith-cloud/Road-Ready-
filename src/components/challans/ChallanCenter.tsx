// src/components/challans/ChallanCenter.tsx
import React, { useState } from 'react';
import {
  AlertOctagon,
  CreditCard,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Camera,
  RotateCcw,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Challan, PaymentRecord } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface ChallanCenterProps {
  challans: Challan[];
  payments: PaymentRecord[];
  onCompleteChallanTask: () => void;
  onPaymentAction: (paymentId: string, action: 'INITIATE' | 'SUCCESS' | 'FAILED' | 'TIMEOUT' | 'RECONCILE') => void;
}

export const ChallanCenter: React.FC<ChallanCenterProps> = ({
  challans,
  payments,
  onCompleteChallanTask,
  onPaymentAction,
}) => {
  const [inspectingEvidence, setInspectingEvidence] = useState<Challan | null>(null);
  const [paymentInFlight, setPaymentInFlight] = useState(false);

  const mainPayment = payments.find((p) => p.id === 'pay-challan-1') || payments[0];
  const isUnknownTimeout = mainPayment?.status === 'UNKNOWN';
  const isPaid = mainPayment?.status === 'SUCCESS' || challans.every((c) => c.status === 'PAID');

  const handlePayInstant = () => {
    setPaymentInFlight(true);
    setTimeout(() => {
      onPaymentAction('pay-challan-1', 'SUCCESS');
      setPaymentInFlight(false);
    }, 400);
  };

  const handleSimulateTimeout = () => {
    onPaymentAction('pay-challan-1', 'TIMEOUT');
  };

  const handleReconcile = () => {
    onPaymentAction('pay-challan-1', 'RECONCILE');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">Traffic e-Challan & Penalty Center</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-semibold border border-amber-200">
              e-Challan Portal Gateway
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative lookup across Bangalore Traffic Police & National e-Challan repository. Unpaid challans block vehicle endorsements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge provenance="VERIFIED_OFFICIAL" />
        </div>
      </div>

      {/* Critical Payment Timeout / Unknown Outcome Warning Banner */}
      {isUnknownTimeout && (
        <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-400 text-amber-950 shadow-sm space-y-2 animate-in fade-in">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-amber-950">
                Payment Status Unknown (Gateway Timeout Protocol Active)
              </h3>
              <p className="text-xs text-amber-900 leading-relaxed">
                Payment session timed out without a definitive ACK from issuing bank. Under civic-tech safety principles:{' '}
                <strong>DO NOT PAY AGAIN</strong>. Retrying immediately risks duplicate deductions. We have triggered an automated reconciliation query.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 pl-8">
            <Button
              size="sm"
              variant="primary"
              className="text-xs bg-amber-700 hover:bg-amber-800 text-white"
              onClick={handleReconcile}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Reconcile With Treasury Ledger
            </Button>
            <span className="text-[11px] text-amber-800">
              Idempotency Key: <span className="font-mono font-bold">IDEMP-CHALLAN-881920</span>
            </span>
          </div>
        </div>
      )}

      {/* Paid Confirmation Banner */}
      {isPaid && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-sm">All Traffic Penalties Cleared</div>
              <p className="text-xs text-emerald-800 mt-0.5">
                Receipt #RCPT-KA-991823 issued. Prerequisite restriction lifted: Vehicle RC Address Change is now UNLOCKED!
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold text-emerald-800 bg-white px-2.5 py-1 rounded border border-emerald-200">
            PAID ₹1,000
          </span>
        </div>
      )}

      {/* Challan Card */}
      <div className="space-y-4">
        {challans.map((ch) => (
          <div
            key={ch.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {ch.challanNumber}
                </span>
                <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {ch.maskedVehicleNumber}
                </span>
                <Badge payment={isPaid ? 'SUCCESS' : isUnknownTimeout ? 'UNKNOWN' : 'PENDING'} />
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900">{ch.offense}</h4>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                  <span>Location: <strong>{ch.location}</strong></span>
                  <span>•</span>
                  <span>Date: <strong>{ch.date}</strong></span>
                </div>
              </div>

              <div className="text-xs text-rose-700 bg-rose-50/60 p-2.5 rounded-lg border border-rose-100">
                <strong>Why this blocks services:</strong> Motor Vehicles Act Section 49 mandates that vehicle endorsements (address change, NOC, transfer) cannot be executed while statutory traffic penalties remain unresolved.
              </div>
            </div>

            {/* Right: Payment Amount & Actions */}
            <div className="shrink-0 flex flex-col items-end gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Penalty Amount</span>
                <div className="text-2xl font-black text-slate-900">₹{ch.amount}</div>
                <span className="text-[10px] text-slate-500 font-medium">Fine code: Sec 183 MV Act</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setInspectingEvidence(ch)}
                  className="text-xs"
                >
                  <Camera className="w-3.5 h-3.5 mr-1" />
                  View Photographic Evidence
                </Button>

                {!isPaid && !isUnknownTimeout && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handlePayInstant}
                    isLoading={paymentInFlight}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CreditCard className="w-3.5 h-3.5 mr-1" />
                    Pay Fine (₹{ch.amount})
                  </Button>
                )}

                {!isPaid && !isUnknownTimeout && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleSimulateTimeout}
                    className="text-xs text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100"
                    title="Simulate bank gateway timeout to demonstrate safe reconciliation without double payment"
                  >
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    Simulate Timeout
                  </Button>
                )}

                {isUnknownTimeout && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleReconcile}
                    className="text-xs bg-amber-700 hover:bg-amber-800"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    Reconcile
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Photographic Evidence Modal */}
      {inspectingEvidence && (
        <Modal
          isOpen={!!inspectingEvidence}
          onClose={() => setInspectingEvidence(null)}
          title={`Traffic Violation Evidence: ${inspectingEvidence.challanNumber}`}
          description={`Automated Speed Radar Capture at ${inspectingEvidence.location}`}
          maxWidth="md"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500 font-mono">Camera ID: ANPR-BLR-094</span>
              <Button size="sm" variant="outline" onClick={() => setInspectingEvidence(null)}>
                Close Evidence
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
              <img
                src={inspectingEvidence.evidenceUrl}
                alt="Traffic violation photographic evidence"
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Recorded Speed:</span>
                <span className="font-bold text-rose-700 font-mono">82 km/h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Speed Limit:</span>
                <span className="font-semibold text-slate-900 font-mono">60 km/h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Captured Plate:</span>
                <span className="font-bold text-slate-900 font-mono">{inspectingEvidence.maskedVehicleNumber}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
