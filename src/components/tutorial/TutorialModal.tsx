// src/components/tutorial/TutorialModal.tsx
// Interactive, beginner-friendly guided tutorial for RTO One

import React, { useState } from 'react';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Layers,
  Calendar,
  ShieldCheck,
  FlaskConical,
  HelpCircle,
  Car,
  Clock,
  Play,
} from 'lucide-react';
import { Button } from '../common/Button';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: any) => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Welcome to RTO One',
      tagline: 'Vehicle & Driving Services Made Simple',
      icon: Sparkles,
      iconColor: 'text-blue-600 bg-blue-50 border-blue-200',
      description:
        'In India, transport services are split across multiple official portals: Vahan (vehicles), Sarathi (licences), e-Challan (penalties), and RTO appointment systems. RTO One connects them all into a single, clear, intelligent roadmap.',
      highlights: [
        'One unified dashboard for all family vehicles & driving licences',
        'No surprise rejections — see hidden prerequisites before you apply',
        'Automatic deadline tracking so you never pay late-renewal fines',
        '100% privacy-protected with masked identifiers by default',
      ],
      tip: 'You can test every feature using safe, synthetic demo data.',
      actionText: 'Next: How Prerequisites Work',
    },
    {
      title: 'Why Services Get Blocked',
      tagline: 'Understanding Service Dependencies',
      icon: Layers,
      iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      description:
        'Ever applied for an address change only to find out you were rejected because of an unpaid traffic camera ticket? RTO One models services as a step-by-step chain so you always know what must be finished first.',
      highlights: [
        'Red / Blocked: A prerequisite step is pending (e.g. unpaid fine or missing NOC)',
        'Amber / Attention: Ready to prepare documents or approaching a deadline',
        'Green / Ready: All prerequisites cleared — you can safely submit!',
        'Clicking any blocked task shows you the exact reason in plain English',
      ],
      tip: 'Try it: Resolving the ₹1,000 fine instantly unlocks the RC Address Update!',
      targetView: 'graph',
      actionText: 'Next: How Deadlines Are Calculated',
    },
    {
      title: 'Never Miss an Expiry Deadline',
      tagline: 'Smart Latest Safe Start Date',
      icon: Calendar,
      iconColor: 'text-amber-600 bg-amber-50 border-amber-200',
      description:
        'Waiting until your licence expires is risky because RTO processing and appointment bookings take days or weeks. RTO One automatically calculates your "Latest Safe Start Date" using calendar arithmetic.',
      highlights: [
        'Considers official grace periods + processing times + appointment queue days',
        'Color-coded risk: Safe (>7 days), Attention (1–7 days), Critical (<24h / expired)',
        'If RTO appointment queues suddenly inflate from 3 to 21 days, deadlines recalculate automatically!',
      ],
      tip: 'Check "Deadline Watch" on the Dashboard to see which family service needs action first.',
      targetView: 'licences',
      actionText: 'Next: Privacy & Voice Assistant',
    },
    {
      title: 'Privacy & Voice Plate Entry',
      tagline: 'Accessible & DPDP Act 2023 Compliant',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      description:
        'We designed RTO One for real citizens — including those with limited digital literacy or those who find typing 10-character alphanumeric registration numbers frustrating on mobile.',
      highlights: [
        'Private by Default: Number plates are masked (KA-01-**-5021) until you give explicit consent',
        'Zero PII Leakage: Access reasons are logged, but full numbers are never stored in server logs',
        'Voice Input: Speak your plate number naturally with NATO support (e.g. "KA zero one...")',
        'Smart Disambiguation: Detects tricky voice errors like letter "O" vs digit "0" and asks you to confirm',
      ],
      tip: 'Click the Microphone icon in the top bar anytime to test voice plate entry!',
      targetView: 'household',
      actionText: 'Next: The Judge Demo Lab',
    },
    {
      title: 'One-Click Demo Lab',
      tagline: 'Simulate Real-Life Scenarios Easily',
      icon: FlaskConical,
      iconColor: 'text-purple-600 bg-purple-50 border-purple-200',
      description:
        'Want to see how RTO One handles sudden real-world curveballs? The Demo Lab has one-click buttons to simulate common transport emergencies without changing any code or database records.',
      highlights: [
        'Trigger 21-Day Appointment Queue Scarcity and watch deadlines jump',
        'Simulate Payment Timeout (Gateway Error) and see safe non-duplicate reconciliation',
        'Switch to unconfigured Odisha (OD) to verify honest fallback behavior without fake fees',
        'Master Reset: 1 click restores everything to a clean starting baseline',
      ],
      tip: 'Go to Demo Lab anytime to test each hackathon scenario in under 30 seconds!',
      targetView: 'demo',
      actionText: 'Get Started!',
    },
  ];

  const step = steps[currentStep];
  const IconComponent = step.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleJumpToView = (view: any) => {
    onNavigate(view);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100/70 px-2.5 py-0.5 rounded-full">
              Quick Tutorial
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Main Card */}
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 shadow-xs ${step.iconColor}`}
            >
              <IconComponent className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                {step.tagline}
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5 tracking-tight">
                {step.title}
              </h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>

          {/* Highlights Checklist */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2.5">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Key Things to Know:
            </div>
            <div className="space-y-2">
              {step.highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Helpful Tip */}
          {step.tip && (
            <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200/60 flex items-start gap-2.5 text-xs text-blue-900">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Pro Tip: </span>
                <span>{step.tip}</span>
              </div>
            </div>
          )}

          {/* Optional Jump to Live Feature button */}
          {step.targetView && (
            <div className="pt-1 flex items-center justify-between border-t border-slate-100 text-xs">
              <span className="text-slate-500">Want to see this in action right now?</span>
              <button
                onClick={() => handleJumpToView(step.targetView)}
                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline"
              >
                <span>Take me there</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
          {/* Step Dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentStep
                    ? 'w-6 bg-blue-600'
                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button size="sm" variant="outline" onClick={handleBack} className="text-xs">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back
              </Button>
            )}

            <Button
              size="sm"
              variant="primary"
              onClick={handleNext}
              className="text-xs bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              <span>{step.actionText}</span>
              {currentStep < steps.length - 1 ? (
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 ml-1" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
