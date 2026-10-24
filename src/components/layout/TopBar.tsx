// src/components/layout/TopBar.tsx
import React, { useState } from 'react';
import {
  Mic,
  Sparkles,
  Bell,
  RotateCcw,
  Search,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  User,
  BookOpen,
  MapPin,
} from 'lucide-react';
import { Button } from '../common/Button';

interface TopBarProps {
  onOpenVoice: () => void;
  onOpenAssistant: () => void;
  onOpenTutorial: () => void;
  onResetDemo: () => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  isScarcityMode: boolean;
  blockedCount: number;
  criticalDeadlinesCount: number;
  selectedJurisdiction: string;
  onSelectJurisdiction: (code: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenVoice,
  onOpenAssistant,
  onOpenTutorial,
  onResetDemo,
  onSearchChange,
  searchQuery,
  isScarcityMode,
  blockedCount,
  criticalDeadlinesCount,
  selectedJurisdiction,
  onSelectJurisdiction,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 1,
      type: 'warning',
      title: 'Traffic Penalty Outstanding',
      msg: 'Challan #CH-KA-2026-881920 blocks RC & DL address updates.',
      time: '10m ago',
    },
    ...(isScarcityMode
      ? [
          {
            id: 2,
            type: 'danger',
            title: 'Urgent: Appointment Scarcity Active',
            msg: 'Slot delay shifted from 3 to 21 days. DL renewal is in CRITICAL RISK.',
            time: 'Just now',
          },
        ]
      : []),
    {
      id: 3,
      type: 'info',
      title: 'Driving Licence Validity Warning',
      msg: 'Licence KA-0120150008432 expires in 19 days (Nov 12, 2026).',
      time: '1h ago',
    },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Brand & Simulated Badge */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-900 via-blue-700 to-indigo-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
            R1
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 tracking-tight text-base">
                RTO <span className="text-blue-600">One</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-semibold uppercase tracking-wider border border-slate-200">
                Civic-Tech
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Every service connected. Every deadline visible.
            </p>
          </div>
        </div>

        {/* Global Demo Trust Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SIMULATED DEMO MODE</span>
          <span className="text-[10px] text-emerald-600 border-l border-emerald-200 pl-1.5">
            Synthetic Safe Data
          </span>
        </div>
      </div>

      {/* Center: Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search services, vehicles (KA-01), licences, challans..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Quick State/Jurisdiction Switcher */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="text-slate-500 font-medium">State:</span>
          <select
            value={selectedJurisdiction}
            onChange={(e) => onSelectJurisdiction(e.target.value)}
            className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
            title="Change active state transport rules"
          >
            <option value="KA">Karnataka (KA)</option>
            <option value="MH">Maharashtra (MH)</option>
            <option value="AP">Andhra Pradesh (AP)</option>
            <option value="OD">Odisha (OD - Fallback)</option>
          </select>
        </div>

        {/* Tutorial Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenTutorial}
          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs flex items-center gap-1.5"
          title="Open interactive 5-step quick tutorial and guide"
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-200" />
          <span>Tutorial</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
        </Button>

        {/* Voice Input Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenVoice}
          className="text-xs bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
          title="Voice-assisted vehicle plate entry with O/0 confirmation"
        >
          <Mic className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">Voice Entry</span>
        </Button>

        {/* Guided Assistant Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenAssistant}
          className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800 hover:from-blue-100 hover:to-indigo-100"
          title="Ask RTO One plain-language next-step assistant"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Assistant</span>
        </Button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="font-semibold text-xs text-slate-900">
                  Active Alerts ({notifications.length})
                </span>
                <span className="text-[10px] text-slate-400">Deterministic Engine</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                      n.type === 'danger'
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : n.type === 'warning'
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-blue-50 border-blue-200 text-blue-900'
                    }`}
                  >
                    {n.type === 'danger' ? (
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    ) : n.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">{n.title}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{n.msg}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Master Demo Reset Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetDemo}
          className="text-xs text-slate-600 hover:text-rose-700 hover:bg-rose-50"
          title="Reset all demo states and dependencies to initial clean baseline"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          <span className="hidden lg:inline">Reset Demo</span>
        </Button>

        {/* Active Household User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            RS
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-slate-900 leading-tight">
              Rajesh Sharma
            </div>
            <div className="text-[10px] text-slate-500">KA-01 Koramangala</div>
          </div>
        </div>
      </div>
    </header>
  );
};
