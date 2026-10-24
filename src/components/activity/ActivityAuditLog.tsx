// src/components/activity/ActivityAuditLog.tsx
import React, { useState } from 'react';
import { History, ShieldCheck, Filter, Clock, Search } from 'lucide-react';
import { AuditLogItem } from '../../types';

interface ActivityAuditLogProps {
  logs: AuditLogItem[];
}

export const ActivityAuditLog: React.FC<ActivityAuditLogProps> = ({ logs }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const categories = [
    { code: 'ALL', label: 'All Events' },
    { code: 'TASK_UPDATE', label: 'Task Transitions' },
    { code: 'PAYMENT_EVENT', label: 'Payment & Reconciliation' },
    { code: 'APPOINTMENT_EVENT', label: 'Appointments' },
    { code: 'PRIVACY_EVENT', label: 'Privacy & Consent' },
    { code: 'RULE_CHANGE', label: 'Rule Engine' },
    { code: 'DEMO_TRIGGER', label: 'Demo Lab Triggers' },
  ];

  const filteredLogs = logs.filter((log) => {
    const matchesCat = selectedCategory === 'ALL' || log.category === selectedCategory;
    const matchesSearch =
      log.triggeringAction.toLowerCase().includes(search.toLowerCase()) ||
      log.explanation.toLowerCase().includes(search.toLowerCase()) ||
      log.syntheticEntityId.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getCategoryBadge = (cat: AuditLogItem['category']) => {
    switch (cat) {
      case 'TASK_UPDATE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">TASK</span>;
      case 'PAYMENT_EVENT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">PAYMENT</span>;
      case 'APPOINTMENT_EVENT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">APPOINTMENT</span>;
      case 'PRIVACY_EVENT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">PRIVACY</span>;
      case 'RULE_CHANGE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">RULE</span>;
      case 'DEMO_TRIGGER':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">DEMO LAB</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">{cat}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Unified Activity, Compliance & Audit Trail
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              {logs.length} Total Audit Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-evident record of state transitions, payment reconciliation, appointment shifts, and DPDP consent actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Zero Raw Identifiers Stored
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
          {categories.map((c) => (
            <button
              key={c.code}
              onClick={() => setSelectedCategory(c.code)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === c.code
                  ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Event Timeline Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[580px]">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-900 font-semibold sticky top-0 z-10">
              <tr>
                <th className="p-3 w-32">Timestamp</th>
                <th className="p-3 w-28">Category</th>
                <th className="p-3 w-28">Entity ID</th>
                <th className="p-3">Triggering Action & State Change</th>
                <th className="p-3">Human-Readable Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="p-3">{getCategoryBadge(log.category)}</td>
                  <td className="p-3 font-mono font-semibold text-slate-800 text-[11px]">
                    {log.syntheticEntityId}
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-900">{log.triggeringAction}</div>
                    {log.previousStatus && log.newStatus && (
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5 flex items-center gap-1">
                        <span className="px-1.5 py-0.2 bg-slate-100 rounded border border-slate-200">{log.previousStatus}</span>
                        <span>→</span>
                        <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 font-bold rounded border border-blue-200">{log.newStatus}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-slate-600 text-[11px] leading-relaxed max-w-lg">
                    {log.explanation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
