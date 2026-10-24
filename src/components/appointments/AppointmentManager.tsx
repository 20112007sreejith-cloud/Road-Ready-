// src/components/appointments/AppointmentManager.tsx
import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
} from 'lucide-react';
import { AppointmentSlot } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface AppointmentManagerProps {
  slots: AppointmentSlot[];
  isScarcityMode: boolean;
  appointmentLeadDays: number;
  onBookSlot: (slotId: string) => void;
  onCancelSlot: (slotId: string) => void;
  onToggleScarcity: (activate: boolean) => void;
}

export const AppointmentManager: React.FC<AppointmentManagerProps> = ({
  slots,
  isScarcityMode,
  appointmentLeadDays,
  onBookSlot,
  onCancelSlot,
  onToggleScarcity,
}) => {
  const [selectedRto, setSelectedRto] = useState<string>('ALL');

  const filteredSlots = slots.filter((s) => {
    if (selectedRto === 'ALL') return true;
    return s.rtoCode === selectedRto;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">RTO Appointment & Biometrics Management</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              Synthetic Slots Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulated appointment calendar for driving licence biometrics and vehicle fitness inspections.
          </p>
        </div>

        {/* Scarcity Curveball Control */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isScarcityMode ? 'outline' : 'danger'}
            onClick={() => onToggleScarcity(!isScarcityMode)}
            className="text-xs font-semibold"
          >
            <Flame className="w-3.5 h-3.5 mr-1" />
            {isScarcityMode ? 'Restore 3-Day Normal Slots' : 'Trigger Appointment Scarcity (21 Days)'}
          </Button>
        </div>
      </div>

      {/* Scarcity Curveball Warning Banner */}
      {isScarcityMode ? (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-50 to-amber-50 border-2 border-rose-300 text-rose-950 space-y-2">
          <div className="flex items-start gap-3">
            <Flame className="w-6 h-6 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-rose-950 flex items-center gap-2">
                <span>Appointment Scarcity Curveball Active</span>
                <span className="text-[10px] px-2 py-0.2 bg-rose-200 text-rose-800 rounded font-bold">
                  21-Day Slot Delay
                </span>
              </h3>
              <p className="text-xs text-rose-900 leading-relaxed">
                Slot availability at <strong>KA-01 Bangalore Central (Koramangala)</strong> has dropped to zero due to backlog.
                RTO One has automatically recalculated all dependent recommended start dates and identified verified alternative slots at{' '}
                <strong>KA-03 Bangalore East (Indiranagar)</strong>.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Current lead-time assumption: <strong>{appointmentLeadDays} calendar days</strong> (Normal capacity across all Bangalore RTOs).
            </span>
          </div>
          <span className="text-[11px] text-blue-700 font-medium">Standard slot allocation</span>
        </div>
      )}

      {/* RTO Filter Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 font-semibold shrink-0">Filter RTO Location:</span>
        {[
          { code: 'ALL', name: 'All RTOs' },
          { code: 'KA-01', name: 'KA-01 Bangalore Central (Koramangala)' },
          { code: 'KA-03', name: 'KA-03 Bangalore East (Indiranagar) [Alternative]' },
          { code: 'KA-05', name: 'KA-05 Bangalore South (Jayanagar)' },
        ].map((rto) => (
          <button
            key={rto.code}
            onClick={() => setSelectedRto(rto.code)}
            className={`px-3 py-1.5 rounded-lg border font-medium shrink-0 transition-colors ${
              selectedRto === rto.code
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-semibold'
                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
            }`}
          >
            {rto.name}
          </button>
        ))}
      </div>

      {/* Slot Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSlots.map((slot) => {
          const isFull = slot.availableSlots <= 0;
          const isAlternative = slot.rtoCode === 'KA-03' || slot.rtoCode === 'KA-05';

          return (
            <div
              key={slot.id}
              className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                slot.isBookedByCurrentUser
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : isFull
                  ? 'border-rose-200 bg-rose-50/10 opacity-80'
                  : isAlternative && isScarcityMode
                  ? 'border-emerald-300 ring-2 ring-emerald-200'
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      {slot.rtoCode}
                    </span>
                    {isAlternative && isScarcityMode && (
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">
                        ★ Recommended Alternative RTO
                      </span>
                    )}
                  </div>
                  {slot.isBookedByCurrentUser ? (
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Reserved by You
                    </span>
                  ) : isFull ? (
                    <span className="text-xs font-semibold text-rose-700 flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      <AlertTriangle className="w-3.5 h-3.5" /> No Slots Available
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {slot.availableSlots} of {slot.totalSlots} Slots Free
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900">{slot.serviceTitle}</h4>
                  <div className="text-xs text-slate-600 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{slot.rtoLocation}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Date</span>
                    <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      {slot.date}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Time Window</span>
                    <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      {slot.timeSlot}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  Simulated biometric counter slot
                </span>

                {slot.isBookedByCurrentUser ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
                    onClick={() => onCancelSlot(slot.id)}
                  >
                    Cancel Booking
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant={isAlternative && isScarcityMode ? 'success' : 'primary'}
                    disabled={isFull}
                    onClick={() => onBookSlot(slot.id)}
                    className="text-xs"
                  >
                    {isFull ? 'Slot Exhausted' : 'Reserve Slot'}
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
