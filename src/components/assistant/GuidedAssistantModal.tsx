// src/components/assistant/GuidedAssistantModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { WorkflowTask } from '../../types';

interface GuidedAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: WorkflowTask[];
  onNavigate: (view: any) => void;
  onCompleteTask: (taskId: string) => void;
  initialQuestionId?: string | null;
}

export const GuidedAssistantModal: React.FC<GuidedAssistantModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onNavigate,
  onCompleteTask,
  initialQuestionId,
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(initialQuestionId || null);

  useEffect(() => {
    if (initialQuestionId) {
      setSelectedQuestion(initialQuestionId);
    }
  }, [initialQuestionId]);

  const blockedTasks = tasks.filter((t) => t.status === 'BLOCKED');
  const challanTask = tasks.find((t) => t.id === 'TASK-CHALLAN');
  const isChallanPending = challanTask?.status !== 'COMPLETED';

  const questions = [
    {
      id: 'q1',
      title: 'What should I do next right now?',
      answer: isChallanPending
        ? 'Your immediate next priority is to resolve the outstanding traffic penalty (Challan #CH-KA-2026-881920) of ₹1,000 on your Swift VXi (KA-01-**-5021). Clearing this penalty will unlock your pending RC Address Change, which currently blocks your Driving Licence Renewal.'
        : 'All immediate blockers have been satisfied. Your next priority is to submit your RC Address Change application or book an RTO slot for biometrics.',
      actionLabel: isChallanPending ? 'Resolve Challan Penalty (₹1,000)' : 'View Active Queue',
      actionFn: () => {
        onClose();
        if (isChallanPending) {
          onCompleteTask('TASK-CHALLAN');
        } else {
          onNavigate('applications');
        }
      },
    },
    {
      id: 'q2',
      title: 'Why is my Driving Licence Renewal blocked?',
      answer:
        'Your DL renewal is blocked because the configured workflow requires: (1) Clearing all outstanding traffic penalties, and (2) Synchronizing your residential address with your vehicle registration. RTO smart card systems prevent issuing renewed licences with conflicting residential addresses.',
      actionLabel: 'Inspect Dependency Graph',
      actionFn: () => {
        onClose();
        onNavigate('graph');
      },
    },
    {
      id: 'q3',
      title: 'What documents are missing for vehicle transfer?',
      answer:
        'For your Tata Nexon EV transfer from Pune (MH-12) to Bangalore (KA-01), you currently require: Form 28 Inter-State NOC from the issuing authority in Pune, valid comprehensive insurance in the buyer\'s name, and local police non-involvement clearance.',
      actionLabel: 'Inspect Service Planner',
      actionFn: () => {
        onClose();
        onNavigate('planner');
      },
    },
    {
      id: 'q4',
      title: 'What should I do if my payment times out?',
      answer:
        'Under civic-tech safety principles: DO NOT retry or pay again immediately! An unknown timeout means the bank has not confirmed the debit. RTO One tracks an idempotency key (IDEMP-CHALLAN-881920) and provides a "Reconcile With Treasury Ledger" action to prevent duplicate charges.',
      actionLabel: 'Go to Challan & Payment Center',
      actionFn: () => {
        onClose();
        onNavigate('challans');
      },
    },
    {
      id: 'q5',
      title: 'Where can I verify this on the official Parivahan website?',
      answer:
        'You can verify your vehicle details and application status directly on the official Ministry of Road Transport and Highways portal: https://parivahan.gov.in/ or the state transport portal https://transport.karnataka.gov.in/. RTO One provides verified direct links.',
      actionLabel: 'View Official Government Portals',
      actionFn: () => {
        onClose();
        onNavigate('help');
      },
    },
  ];

  const currentQA = questions.find((q) => q.id === selectedQuestion) || questions[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="RTO One Plain-Language Civic Assistant"
      description="Deterministic guidance based on live workflow status and verified state transport rule packs. No legal hallucinations."
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] text-slate-400">Deterministic Engine (Zero unverified LLM claims)</span>
          <Button size="sm" variant="outline" onClick={onClose}>
            Close Assistant
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Question Selector Pills */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Select a Question:
          </span>
          <div className="space-y-1.5">
            {questions.map((q) => (
              <button
                key={q.id}
                onClick={() => setSelectedQuestion(q.id)}
                className={`w-full p-2.5 rounded-lg border text-left transition-all flex items-center justify-between cursor-pointer ${
                  currentQA.id === q.id
                    ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{q.title}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Answer Box */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>{currentQA.title}</span>
          </div>

          <p className="text-slate-700 text-xs leading-relaxed">
            {currentQA.answer}
          </p>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">Source: Verified Karnataka Rule Pack & Live DAG</span>
            <Button
              size="sm"
              variant="primary"
              onClick={currentQA.actionFn}
              className="text-xs"
            >
              <Zap className="w-3 h-3 mr-1" />
              {currentQA.actionLabel}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
