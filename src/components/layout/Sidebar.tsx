// src/components/layout/Sidebar.tsx
import React from 'react';
import {
  LayoutDashboard,
  Car,
  CreditCard,
  Compass,
  GitBranch,
  FileCheck,
  AlertOctagon,
  Calendar,
  BookOpen,
  Network,
  Users,
  History,
  FlaskConical,
  BarChart3,
  ExternalLink,
} from 'lucide-react';

export type NavView =
  | 'overview'
  | 'vehicles'
  | 'licences'
  | 'planner'
  | 'graph'
  | 'applications'
  | 'challans'
  | 'appointments'
  | 'rules'
  | 'integrations'
  | 'household'
  | 'audit'
  | 'demo'
  | 'benchmark'
  | 'help';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  blockedCount: number;
  criticalDeadlinesCount: number;
  unpaidChallansCount: number;
  isScarcityMode: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  blockedCount,
  criticalDeadlinesCount,
  unpaidChallansCount,
  isScarcityMode,
}) => {
  const navItems: {
    id: NavView;
    label: string;
    icon: React.ReactNode;
    badge?: React.ReactNode;
    section?: string;
  }[] = [
    { section: 'ORCHESTRATION', id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'vehicles', label: 'My Vehicles', icon: <Car className="w-4 h-4" /> },
    {
      id: 'licences',
      label: 'Driving Licences',
      icon: <CreditCard className="w-4 h-4" />,
      badge: criticalDeadlinesCount > 0 ? (
        <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full">
          Expiring
        </span>
      ) : null,
    },
    { id: 'planner', label: 'Service Planner', icon: <Compass className="w-4 h-4" /> },
    {
      id: 'graph',
      label: 'Dependency Graph',
      icon: <GitBranch className="w-4 h-4" />,
      badge: blockedCount > 0 ? (
        <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full">
          {blockedCount} Blocked
        </span>
      ) : null,
    },
    { id: 'applications', label: 'Applications', icon: <FileCheck className="w-4 h-4" /> },
    {
      id: 'challans',
      label: 'Challans',
      icon: <AlertOctagon className="w-4 h-4" />,
      badge: unpaidChallansCount > 0 ? (
        <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
          {unpaidChallansCount} Unpaid
        </span>
      ) : null,
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: <Calendar className="w-4 h-4" />,
      badge: isScarcityMode ? (
        <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full animate-pulse">
          Scarce
        </span>
      ) : null,
    },

    { section: 'GOVERNANCE & TRUST', id: 'rules', label: 'Documents & Rules', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'integrations', label: 'Integration Status', icon: <Network className="w-4 h-4" /> },
    { id: 'household', label: 'Household (Privacy)', icon: <Users className="w-4 h-4" /> },
    { id: 'audit', label: 'Activity & Audit Log', icon: <History className="w-4 h-4" /> },

    {
      section: 'HACKATHON LAB',
      id: 'demo',
      label: 'Demo Lab',
      icon: <FlaskConical className="w-4 h-4 text-purple-600" />,
      badge: (
        <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 text-[10px] font-bold rounded-full">
          Judge Mode
        </span>
      ),
    },
    { id: 'benchmark', label: 'Benchmark & Metrics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'help', label: 'Help & Official Portals', icon: <ExternalLink className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {navItems.map((item, idx) => (
          <React.Fragment key={item.id}>
            {item.section && (
              <div className={`px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 ${idx > 0 ? 'pt-4' : 'pt-1'}`}>
                {item.section}
              </div>
            )}
            <button
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                currentView === item.id
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200/60 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={currentView === item.id ? 'text-blue-600' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge}
            </button>
          </React.Fragment>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
          <div className="flex items-center justify-between font-semibold text-slate-900">
            <span>Jurisdiction</span>
            <span className="text-blue-600">Karnataka (KA)</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>Rule Pack</span>
            <span className="font-mono">v2.4.0 Verified</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>Appointment Lead</span>
            <span className={isScarcityMode ? 'text-rose-600 font-bold' : 'text-slate-700'}>
              {isScarcityMode ? '21 Days (Scarce)' : '3 Days (Normal)'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
