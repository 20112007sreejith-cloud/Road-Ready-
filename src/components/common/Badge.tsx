// src/components/common/Badge.tsx
import React from 'react';
import { TaskStatus, RiskLevel, RuleProvenance, PaymentStatus } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'status' | 'risk' | 'provenance' | 'payment' | 'custom';
  status?: TaskStatus;
  risk?: RiskLevel;
  provenance?: RuleProvenance;
  payment?: PaymentStatus;
  className?: string;
  label?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'custom',
  status,
  risk,
  provenance,
  payment,
  className = '',
  label,
}) => {
  if (status) {
    const config: Record<TaskStatus, { bg: string; text: string; label: string; dot: string }> = {
      COMPLETED: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Completed', dot: 'bg-emerald-500' },
      READY: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Ready to Start', dot: 'bg-blue-500' },
      IN_PROGRESS: { bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700', label: 'In Progress', dot: 'bg-sky-500' },
      PENDING: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', label: 'Pending Authority', dot: 'bg-amber-500' },
      BLOCKED: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', label: 'Blocked by Prereq', dot: 'bg-rose-500' },
      REJECTED: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', label: 'Rejected', dot: 'bg-red-600' },
      FAILED: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', label: 'Failed', dot: 'bg-red-500' },
      WITHDRAWN: { bg: 'bg-slate-100 border-slate-300', text: 'text-slate-700', label: 'Withdrawn', dot: 'bg-slate-400' },
      DRAFT: { bg: 'bg-slate-50 border-slate-200', text: 'text-slate-600', label: 'Draft', dot: 'bg-slate-400' },
      RULES_UNAVAILABLE: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', label: 'Rules Unavailable', dot: 'bg-purple-500' },
    };
    const c = config[status] || config.DRAFT;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${className}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
        {label || c.label}
      </span>
    );
  }

  if (risk) {
    const config: Record<RiskLevel, { bg: string; text: string; label: string; icon: string }> = {
      SAFE: { bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', text: 'text-emerald-700', label: 'Safe (>7 days)', icon: '●' },
      ATTENTION: { bg: 'bg-amber-50 border-amber-200 text-amber-800', text: 'text-amber-800', label: 'Attention (1-7 days)', icon: '▲' },
      CRITICAL: { bg: 'bg-rose-50 border-rose-300 text-rose-800 font-bold', text: 'text-rose-700', label: 'Critical (<24h / Overdue)', icon: '⚠' },
      UNKNOWN: { bg: 'bg-slate-100 border-slate-200 text-slate-700', text: 'text-slate-700', label: 'Unknown', icon: '?' },
    };
    const c = config[risk] || config.UNKNOWN;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${className}`}>
        <span>{c.icon}</span>
        {label || c.label}
      </span>
    );
  }

  if (provenance) {
    const isVerified = provenance === 'VERIFIED_OFFICIAL';
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
          isVerified
            ? 'bg-blue-50 border-blue-200 text-blue-700'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        } ${className}`}
      >
        <span>{isVerified ? '✓ Verified Source' : '⚠ Simulated Demo Value'}</span>
      </span>
    );
  }

  if (payment) {
    const config: Record<PaymentStatus, { bg: string; text: string; label: string }> = {
      NOT_STARTED: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600', label: 'Unpaid' },
      INITIATED: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Initiated' },
      PENDING: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'Payment Pending' },
      SUCCESS: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Paid & Settled' },
      FAILED: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', label: 'Payment Failed' },
      UNKNOWN: { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-900', label: 'Outcome Unknown (Reconciling)' },
      RECONCILIATION_REQUIRED: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-800', label: 'Reconciliation Needed' },
    };
    const c = config[payment] || config.NOT_STARTED;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${className}`}>
        {c.label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
      {children || label}
    </span>
  );
};
