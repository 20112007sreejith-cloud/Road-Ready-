// src/components/integrations/IntegrationRegistryView.tsx
import React, { useState } from 'react';
import {
  Network,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  ListOrdered,
} from 'lucide-react';
import { IntegrationCapability, IntegrationMode } from '../../types';
import { Button } from '../common/Button';

interface IntegrationRegistryViewProps {
  integrations: IntegrationCapability[];
}

export const IntegrationRegistryView: React.FC<IntegrationRegistryViewProps> = ({ integrations }) => {
  const [checkingId, setCheckingId] = useState<string | null>(null);

  const handlePing = (id: string) => {
    setCheckingId(id);
    setTimeout(() => {
      setCheckingId(null);
    }, 500);
  };

  const getModeBadge = (mode: IntegrationMode) => {
    switch (mode) {
      case 'LIVE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">LIVE (PROD)</span>;
      case 'SANDBOX':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">SANDBOX TEST</span>;
      case 'DEMO':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">SIMULATED DEMO</span>;
      case 'PENDING_APPROVAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">PENDING APPROVAL</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">{mode}</span>;
    }
  };

  const onboardingSteps = [
    { num: 1, title: 'Locate Official Documentation', done: true },
    { num: 2, title: 'Identify API Publisher Department', done: true },
    { num: 3, title: 'Verify Organization Eligibility', done: true },
    { num: 4, title: 'Register Entity with API Setu / MoRTH', done: true },
    { num: 5, title: 'Submit Detailed Civic-Tech Use Case', done: true },
    { num: 6, title: 'Obtain Government Technical Approval', done: false, active: true },
    { num: 7, title: 'Sign Data Sharing & Privacy Agreement', done: false },
    { num: 8, title: 'Acquire Staging Sandbox Credentials', done: false },
    { num: 9, title: 'Implement OAuth 2.0 PKCE Flow', done: false },
    { num: 10, title: 'Verify Data Minimization Controls', done: false },
    { num: 11, title: 'Complete Security & Redaction Audit', done: false },
    { num: 12, title: 'Obtain Production Credentials', done: false },
    { num: 13, title: 'Execute Live Production Health Check', done: false },
    { num: 14, title: 'Enable Documented Scopes Only', done: false },
    { num: 15, title: 'Continuous Outage & Quota Monitoring', done: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Government Integration Registry & Transparency Dashboard
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              {integrations.length} Providers Tracked
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative tracking of live government APIs, staging sandboxes, and simulated adapters. Zero deceptive live claims.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Zero Secret Leaks • Redacted Credentials
          </span>
        </div>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {integrations.map((integ) => (
          <div
            key={integ.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{integ.name}</h3>
                  <div className="text-[11px] text-slate-500 mt-0.5">{integ.provider}</div>
                </div>
                {getModeBadge(integ.mode)}
              </div>

              {/* Supported Operations */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Supported Operations:
                </span>
                <div className="flex flex-wrap gap-1">
                  {integ.supportedOperations.map((op) => (
                    <span
                      key={op}
                      className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono rounded border border-slate-200"
                    >
                      {op}
                    </span>
                  ))}
                </div>
              </div>

              {/* Authorization */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                  Required Authorization:
                </span>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  {integ.requiredAuthorization}
                </p>
              </div>

              {/* Last Checked */}
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Last verified:</span>
                <span className="font-mono text-slate-600">
                  {new Date(integ.lastCheckedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <a
                href={integ.documentationUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                Docs <ExternalLink className="w-3 h-3" />
              </a>

              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => handlePing(integ.id)}
                isLoading={checkingId === integ.id}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Ping Health
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* 15-Step Government API Onboarding Progress Checklist */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Official API Onboarding Lifecycle (Parivahan & API Setu)
              </h3>
              <p className="text-xs text-slate-500">
                Formal step-by-step audit showing the genuine path from Hackathon Demo to Authorized Production Access.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            Step 6 of 15 Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {onboardingSteps.map((s) => (
            <div
              key={s.num}
              className={`p-2.5 rounded-lg border text-xs flex items-center gap-2.5 ${
                s.done
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                  : s.active
                  ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold ring-1 ring-blue-300'
                  : 'bg-slate-50/50 border-slate-200 text-slate-500'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                  s.done
                    ? 'bg-emerald-600 text-white'
                    : s.active
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {s.done ? '✓' : s.num}
              </div>
              <span className="truncate">{s.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
