// src/components/demo/DemoLabView.tsx
import React, { useState } from 'react';
import {
  FlaskConical,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Flame,
  CreditCard,
  RefreshCw,
  FileX,
  BookOpen,
  Mic,
  Eye,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { WorkflowTask } from '../../types';
import { Button } from '../common/Button';

interface DemoLabViewProps {
  tasks: WorkflowTask[];
  isScarcityMode: boolean;
  appointmentLeadDays: number;
  onCompleteTask: (taskId: string) => void;
  onUpdateStatus: (taskId: string, status: any, reason?: string) => void;
  onPaymentAction: (paymentId: string, action: 'INITIATE' | 'SUCCESS' | 'FAILED' | 'TIMEOUT' | 'RECONCILE') => void;
  onToggleScarcity: (activate: boolean) => void;
  onResetAll: () => void;
  onOpenVoice: () => void;
  onNavigate: (view: any) => void;
  onTriggerVoiceAmbiguity: (transcript: string) => void;
}

export const DemoLabView: React.FC<DemoLabViewProps> = ({
  tasks,
  isScarcityMode,
  appointmentLeadDays,
  onCompleteTask,
  onUpdateStatus,
  onPaymentAction,
  onToggleScarcity,
  onResetAll,
  onOpenVoice,
  onNavigate,
  onTriggerVoiceAmbiguity,
}) => {
  const [lastExecutedAction, setLastExecutedAction] = useState<string>(
    'Default Baseline Initialized (3-day appointments, 1 blocker pending).'
  );

  const executeAction = (actionTitle: string, fn: () => void) => {
    fn();
    setLastExecutedAction(actionTitle);
  };

  const challanTask = tasks.find((t) => t.id === 'TASK-CHALLAN');
  const rcAddrTask = tasks.find((t) => t.id === 'TASK-RC-ADDR');
  const dlRenewTask = tasks.find((t) => t.id === 'TASK-DL-RENEW');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-purple-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-bold text-slate-900">
              Judge Demonstration Lab (One-Click Scenario Controls)
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold border border-purple-300">
              Deterministic Test Harness
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reproduce and verify each hackathon challenge instantly without editing code, database tables, or environment variables.
          </p>
        </div>

        <Button
          size="sm"
          variant="danger"
          onClick={() => executeAction('Reset All Scenarios to Clean Baseline', onResetAll)}
          className="text-xs bg-rose-600 hover:bg-rose-700"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          Master Reset Baseline
        </Button>
      </div>

      {/* Last Executed Status Bar */}
      <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200 text-xs text-purple-950 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
          <span>
            Last Executed Trigger: <strong>{lastExecutedAction}</strong>
          </span>
        </div>
        <span className="text-[11px] font-mono text-purple-700">Real-time DAG Synchronized</span>
      </div>

      {/* Current Real-time Engine Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5 shadow-xs">
          <div className="flex justify-between items-center text-slate-500">
            <span className="font-semibold">Challan Blocker State:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded ${
                challanTask?.status === 'COMPLETED'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-800'
              }`}
            >
              {challanTask?.status}
            </span>
          </div>
          <div className="text-[11px] text-slate-600">
            RC Address Update status: <strong>{rcAddrTask?.status}</strong>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5 shadow-xs">
          <div className="flex justify-between items-center text-slate-500">
            <span className="font-semibold">Appointment Lead Time:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded ${
                isScarcityMode ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
              }`}
            >
              {appointmentLeadDays} Days
            </span>
          </div>
          <div className="text-[11px] text-slate-600">
            DL Renewal Risk: <strong>{dlRenewTask?.deadlineInfo?.riskLevel}</strong> (Start:{' '}
            {dlRenewTask?.deadlineInfo?.recommendedStartDate})
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5 shadow-xs">
          <div className="flex justify-between items-center text-slate-500">
            <span className="font-semibold">Payment Engine State:</span>
            <span className="font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
              Idempotent Handled
            </span>
          </div>
          <div className="text-[11px] text-slate-600">
            Zero duplicate debit policy enforced on timeouts.
          </div>
        </div>
      </div>

      {/* Judge Trigger Buttons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Scenario 1: Resolve Penalty */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                CHALLENGE 1 (DAG)
              </span>
              <span className="text-[10px] text-slate-400">Trigger #1</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 mt-2">
              Resolve Traffic Penalty (₹1,000)
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Clears the traffic fine prerequisite and recalculates the DAG: immediately unlocks the downstream RC Address Update.
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            className="w-full text-xs"
            onClick={() =>
              executeAction('Resolved traffic fine prerequisite: RC Address Update UNLOCKED', () =>
                onCompleteTask('TASK-CHALLAN')
              )
            }
          >
            <Zap className="w-3.5 h-3.5 mr-1" />
            Resolve Fine & Unlock Downstream
          </Button>
        </div>

        {/* Scenario 2: Scarcity Curveball */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                CHALLENGE 2 (CURVEBALL)
              </span>
              <span className="text-[10px] text-slate-400">Trigger #2</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 mt-2">
              Trigger Appointment Scarcity (3d → 21d)
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Inflates lead-time buffer to 21 days. Driving licence renewal safe start date recalculates into CRITICAL OVERDUE.
            </p>
          </div>
          <Button
            size="sm"
            variant={isScarcityMode ? 'outline' : 'danger'}
            className="w-full text-xs font-semibold"
            onClick={() =>
              executeAction(
                isScarcityMode ? 'Reset appointment lead time to 3 days' : 'Triggered 21-day appointment scarcity: DL is CRITICAL',
                () => onToggleScarcity(!isScarcityMode)
              )
            }
          >
            <Flame className="w-3.5 h-3.5 mr-1" />
            {isScarcityMode ? 'Restore 3-Day Normal Lead' : 'Trigger 21-Day Scarcity'}
          </Button>
        </div>

        {/* Scenario 3: Payment Timeout & Reconciliation */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                CHALLENGE 4 (PAYMENTS)
              </span>
              <span className="text-[10px] text-slate-400">Trigger #3</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 mt-2">
              Simulate Payment Timeout (Unknown Outcome)
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Simulates treasury gateway timeout. Puts payment in UNKNOWN state, strictly preventing double-payment retries.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="w-1/2 text-xs text-amber-800 bg-amber-50 border-amber-300"
              onClick={() =>
                executeAction('Payment Gateway Timeout: UNKNOWN state active', () =>
                  onPaymentAction('pay-challan-1', 'TIMEOUT')
                )
              }
            >
              Timeout
            </Button>
            <Button
              size="sm"
              variant="primary"
              className="w-1/2 text-xs bg-emerald-600 hover:bg-emerald-700"
              onClick={() =>
                executeAction('Reconciled with Treasury Ledger: Payment SUCCESS confirmed', () =>
                  onPaymentAction('pay-challan-1', 'RECONCILE')
                )
              }
            >
              Reconcile
            </Button>
          </div>
        </div>

        {/* Scenario 4: Application Rejection */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                CHALLENGE 4 (REJECTIONS)
              </span>
              <span className="text-[10px] text-slate-400">Trigger #4</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 mt-2">
              Simulate Mid-Demo Application Rejection
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              RTO officer rejects RC Address Change due to address proof mismatch. Freezes downstream DL tasks and displays recovery.
            </p>
          </div>
          <Button
            size="sm"
            variant="danger"
            className="w-full text-xs"
            onClick={() =>
              executeAction(
                'Application REJECTED: Address proof mismatch on RC Address Change',
                () =>
                  onUpdateStatus(
                    'TASK-RC-ADDR',
                    'REJECTED',
                    'Address proof mismatch between Aadhaar and electricity bill.'
                  )
              )
            }
          >
            <FileX className="w-3.5 h-3.5 mr-1" />
            Reject Application
          </Button>
        </div>

        {/* Scenario 5: Missing Odisha Rule Pack */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                CHALLENGE 3 (RULES)
              </span>
              <span className="text-[10px] text-slate-400">Trigger #5</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 mt-2">
              Switch to Missing Odisha Rule Pack
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Verifies safe failure: system refuses to invent fees or processing times and provides official Odisha Transport link.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs border-purple-300 text-purple-800 hover:bg-purple-50"
            onClick={() => {
              executeAction('Opened Missing Odisha Rule Pack Fallback', () => {
                onNavigate('rules');
              });
            }}
          >
            <BookOpen className="w-3.5 h-3.5 mr-1" />
            Inspect Odisha Fallback
          </Button>
        </div>

        {/* Scenario 6: Voice O vs 0 Ambiguity */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                CHALLENGE 6 (VOICE)
              </span>
              <span className="text-[10px] text-slate-400">Trigger #6</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 mt-2">
              Trigger O vs 0 Ambiguity Example
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Simulates spoken plate "KA 01 AB 123 O" where final character is ambiguous O (letter) vs 0 (number). Requires explicit citizen confirmation.
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            className="w-full text-xs bg-indigo-600 hover:bg-indigo-700"
            onClick={() => {
              executeAction('Voice O vs 0 Ambiguity Resolution Opened', () => {
                onTriggerVoiceAmbiguity('KA 01 AB 123 O');
              });
            }}
          >
            <Mic className="w-3.5 h-3.5 mr-1" />
            Test O vs 0 Ambiguity
          </Button>
        </div>

        {/* Scenario 7: Privacy Reveal & Remask */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                CHALLENGE 5 (PRIVACY)
              </span>
              <span className="text-[10px] text-slate-400">Trigger #7</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 mt-2">
              Consent-Gated Household Reveal
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Demonstrates DPDP Act purpose-bound consent modal for unmasking vehicle plate KA-01-**-5021 with zero raw PII logging.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50"
            onClick={() => {
              executeAction('Navigated to Household Privacy View', () => {
                onNavigate('household');
              });
            }}
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            Open Household Privacy View
          </Button>
        </div>

        {/* Scenario 8: National Coverage Matrix */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                NATIONAL SCALE
              </span>
              <span className="text-[10px] text-slate-400">Trigger #8</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 mt-2">
              National Coverage Matrix (36 States)
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Inspect directory of all 28 Indian States and 8 Union Territories with official portal URLs and verified rule pack status.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            onClick={() => {
              executeAction('Opened National Jurisdiction Matrix', () => {
                onNavigate('rules');
              });
            }}
          >
            <BookOpen className="w-3.5 h-3.5 mr-1" />
            Inspect All 36 States & UTs
          </Button>
        </div>

        {/* Scenario 9: Benchmark Metrics */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                EVALUATION
              </span>
              <span className="text-[10px] text-slate-400">Trigger #9</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 mt-2">
              Measurable Benchmark Comparison
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Compare baseline manual Parivahan journey vs RTO One across 9 concrete metrics (actions, re-entries, prevented errors).
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            onClick={() => {
              executeAction('Opened Benchmark Comparison', () => {
                onNavigate('benchmark');
              });
            }}
          >
            Inspect 9 Measured Metrics <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
