// src/components/layout/TopBar.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Car,
  Bell,
  RotateCcw,
  Search,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  MapPin,
  X,
  CreditCard,
  AlertOctagon,
  GitBranch,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Vehicle, DrivingLicence, Challan, WorkflowTask } from '../../types';
import { NavView } from './Sidebar';

interface TopBarProps {
  onOpenVoice: () => void;
  onOpenAssistant?: () => void;
  onOpenTutorial: () => void;
  onResetDemo: () => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  isScarcityMode: boolean;
  blockedCount: number;
  criticalDeadlinesCount: number;
  selectedJurisdiction: string;
  onSelectJurisdiction: (code: string) => void;
  // Live dataset for comprehensive search
  vehicles?: Vehicle[];
  licences?: DrivingLicence[];
  challans?: Challan[];
  tasks?: WorkflowTask[];
  onNavigate?: (view: NavView) => void;
  onSelectTask?: (taskId: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenVoice,
  onOpenTutorial,
  onResetDemo,
  onSearchChange,
  searchQuery,
  isScarcityMode,
  blockedCount,
  criticalDeadlinesCount,
  selectedJurisdiction,
  onSelectJurisdiction,
  vehicles = [],
  licences = [],
  challans = [],
  tasks = [],
  onNavigate,
  onSelectTask,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        setMobileSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const query = searchQuery.trim().toLowerCase();

  const matchedVehicles = useMemo(() => {
    if (!query) return [];
    return vehicles.filter(
      (v) =>
        v.registrationNumber.toLowerCase().includes(query) ||
        v.maskedNumber.toLowerCase().includes(query) ||
        v.makeModel.toLowerCase().includes(query) ||
        v.ownerName.toLowerCase().includes(query) ||
        v.rtoOffice.toLowerCase().includes(query)
    );
  }, [vehicles, query]);

  const matchedLicences = useMemo(() => {
    if (!query) return [];
    return licences.filter(
      (l) =>
        l.licenceNumber.toLowerCase().includes(query) ||
        l.maskedNumber.toLowerCase().includes(query) ||
        l.holderName.toLowerCase().includes(query) ||
        l.issuingRto.toLowerCase().includes(query)
    );
  }, [licences, query]);

  const matchedChallans = useMemo(() => {
    if (!query) return [];
    return challans.filter(
      (c) =>
        c.challanNumber.toLowerCase().includes(query) ||
        c.offense.toLowerCase().includes(query) ||
        c.vehicleNumber.toLowerCase().includes(query) ||
        c.amount.toString().includes(query)
    );
  }, [challans, query]);

  const matchedTasks = useMemo(() => {
    if (!query) return [];
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        (t.entityLabel && t.entityLabel.toLowerCase().includes(query)) ||
        (t.blockerExplanation && t.blockerExplanation.toLowerCase().includes(query))
    );
  }, [tasks, query]);

  const matchedPages = useMemo(() => {
    if (!query) return [];
    const pages: { id: NavView; name: string; desc: string; keywords: string[] }[] = [
      { id: 'overview', name: 'Overview Dashboard', desc: 'Summary of active tasks, deadlines, and recent activity', keywords: ['home', 'dashboard', 'status', 'overview'] },
      { id: 'vehicles', name: 'My Vehicles', desc: 'Registered vehicles, RC status, and PUCC dates', keywords: ['cars', 'swift', 'nexon', 'activa', 'rc', 'registration', 'vehicle'] },
      { id: 'licences', name: 'Driving Licences', desc: 'Licence validity, class of vehicles, renewal countdown', keywords: ['dl', 'driving', 'licence', 'license', 'renewal'] },
      { id: 'planner', name: 'Service Planner', desc: 'Plan new RTO workflows, simulate prerequisite checks', keywords: ['services', 'plan', 'workflow', 'checklist'] },
      { id: 'graph', name: 'Dependency Graph', desc: 'Interactive DAG showing cross-service blocking prerequisites', keywords: ['dag', 'graph', 'dependencies', 'blockers', 'pipeline'] },
      { id: 'applications', name: 'Applications Queue', desc: 'Track submitted applications and verify state transitions', keywords: ['applications', 'status', 'queue'] },
      { id: 'challans', name: 'Challan & Penalty Center', desc: 'Clear outstanding traffic fines and handle reconciliation', keywords: ['challan', 'fines', 'penalties', 'violations', 'traffic', 'payment'] },
      { id: 'appointments', name: 'Appointments Manager', desc: 'Book or reschedule RTO appointment slots', keywords: ['slot', 'booking', 'appointment', 'rto', 'scarcity'] },
      { id: 'rules', name: 'Documents & Rules', desc: 'Official KMVR & CMVR rule provenance and documents', keywords: ['rules', 'laws', 'cmvr', 'kmvr', 'acts', 'circulars'] },
      { id: 'integrations', name: 'Integration Status', desc: 'Status of Vahan, Sarathi, e-Challan, and DigiLocker APIs', keywords: ['apis', 'vahan', 'sarathi', 'echallan', 'digilocker'] },
      { id: 'household', name: 'Household & Privacy', desc: 'Family members and DPDP consent-gated unmasking', keywords: ['family', 'privacy', 'consent', 'members', 'dpdp'] },
      { id: 'audit', name: 'Activity & Audit Log', desc: 'Immutable timeline of citizen actions and state changes', keywords: ['history', 'logs', 'audit', 'timeline'] },
      { id: 'demo', name: 'Demo Lab (Judge Mode)', desc: 'Pre-configured test scenarios and edge-case simulations', keywords: ['judge', 'demo', 'scenarios', 'curveball', 'hackathon'] },
      { id: 'help', name: 'Help & Official Portals', desc: 'Direct links to official Parivahan and state transport portals', keywords: ['help', 'parivahan', 'official', 'government', 'support'] },
    ];
    return pages.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.desc.toLowerCase().includes(query) ||
        p.keywords.some((k) => k.includes(query))
    );
  }, [query]);

  const totalResults =
    matchedVehicles.length +
    matchedLicences.length +
    matchedChallans.length +
    matchedTasks.length +
    matchedPages.length;

  const handleSelectNav = (view: NavView, taskId?: string) => {
    setIsSearchFocused(false);
    setMobileSearchOpen(false);
    onSearchChange('');
    if (onNavigate) {
      onNavigate(view);
    }
    if (taskId && onSelectTask) {
      onSelectTask(taskId);
    }
  };

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
        <div
          onClick={() => onNavigate && onNavigate('overview')}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Go to Overview Dashboard"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-900 via-blue-700 to-indigo-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm group-hover:scale-105 transition-transform">
            R1
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 tracking-tight text-base group-hover:text-blue-600 transition-colors">
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

      {/* Center: Search with Live Autocomplete Popover */}
      <div ref={searchContainerRef} className="hidden md:flex items-center flex-1 max-w-md mx-6 relative">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search services, vehicles (KA-01), licences, challans..."
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setIsSearchFocused(true);
            }}
            className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                onSearchChange('');
                setIsSearchFocused(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {isSearchFocused && query.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 max-h-[460px] overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 p-2">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-700">
                Found {totalResults} {totalResults === 1 ? 'match' : 'matches'} for "{searchQuery}"
              </span>
              <span className="text-[10px]">Press Esc to close</span>
            </div>

            {totalResults === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 space-y-1">
                <Search className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                <div className="font-semibold text-slate-700">No matching items found</div>
                <p className="text-[11px] text-slate-400">
                  Try searching for a vehicle registration (e.g. KA-01, Swift), licence, challan #, or service name.
                </p>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                {/* 1. Vehicles */}
                {matchedVehicles.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Car className="w-3 h-3 text-blue-600" />
                      <span>Vehicles ({matchedVehicles.length})</span>
                    </div>
                    <div className="space-y-1">
                      {matchedVehicles.map((v) => (
                        <div
                          key={v.id}
                          onClick={() => handleSelectNav('vehicles')}
                          className="px-3 py-2 rounded-lg hover:bg-blue-50/70 cursor-pointer flex items-center justify-between transition-colors text-xs group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center font-mono text-[10px] font-bold">
                              RC
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 group-hover:text-blue-700">
                                {v.registrationNumber}{' '}
                                <span className="text-[11px] font-normal text-slate-500">
                                  ({v.makeModel})
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {v.ownerName} • {v.rtoOffice}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {v.rcStatus}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Licences */}
                {matchedLicences.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <CreditCard className="w-3 h-3 text-indigo-600" />
                      <span>Driving Licences ({matchedLicences.length})</span>
                    </div>
                    <div className="space-y-1">
                      {matchedLicences.map((l) => (
                        <div
                          key={l.id}
                          onClick={() => handleSelectNav('licences')}
                          className="px-3 py-2 rounded-lg hover:bg-blue-50/70 cursor-pointer flex items-center justify-between transition-colors text-xs group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-md bg-indigo-900 text-white flex items-center justify-center font-mono text-[10px] font-bold">
                              DL
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 group-hover:text-blue-700">
                                {l.licenceNumber}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {l.holderName} • Expires {l.validityUpto}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {l.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Challans */}
                {matchedChallans.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <AlertOctagon className="w-3 h-3 text-amber-600" />
                      <span>Challans & Penalties ({matchedChallans.length})</span>
                    </div>
                    <div className="space-y-1">
                      {matchedChallans.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => handleSelectNav('challans')}
                          className="px-3 py-2 rounded-lg hover:bg-amber-50/70 cursor-pointer flex items-center justify-between transition-colors text-xs group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-md bg-amber-600 text-white flex items-center justify-center font-mono text-[10px] font-bold">
                              ₹
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 group-hover:text-amber-800">
                                {c.challanNumber}{' '}
                                <span className="font-bold text-amber-700">₹{c.amount}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 line-clamp-1">
                                {c.offense} • {c.vehicleNumber}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                              c.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Workflow Tasks / DAG */}
                {matchedTasks.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <GitBranch className="w-3 h-3 text-purple-600" />
                      <span>Workflow Services & Tasks ({matchedTasks.length})</span>
                    </div>
                    <div className="space-y-1">
                      {matchedTasks.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => handleSelectNav('graph', t.id)}
                          className="px-3 py-2 rounded-lg hover:bg-purple-50/70 cursor-pointer flex items-center justify-between transition-colors text-xs group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-md bg-purple-700 text-white flex items-center justify-center font-mono text-[10px] font-bold">
                              DAG
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 group-hover:text-purple-800">
                                {t.title}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {t.id} • Fee: ₹{t.estimatedFee} • {t.processingDays} Days
                              </div>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                              t.status === 'COMPLETED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : t.status === 'BLOCKED'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Pages & Navigation */}
                {matchedPages.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span>App Pages ({matchedPages.length})</span>
                    </div>
                    <div className="space-y-1">
                      {matchedPages.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleSelectNav(p.id)}
                          className="px-3 py-2 rounded-lg hover:bg-slate-100 cursor-pointer flex items-center justify-between transition-colors text-xs group"
                        >
                          <div>
                            <div className="font-semibold text-slate-800 group-hover:text-blue-600">
                              {p.name}
                            </div>
                            <div className="text-[10px] text-slate-400">{p.desc}</div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Mobile Search Toggle */}
        <button
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

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

        {/* Vehicle Entry Button (Renamed from Voice Entry as requested) */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenVoice}
          className="text-xs bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 flex items-center gap-1.5"
          title="Vehicle registration number entry with voice assistance & smart format normalization"
        >
          <Car className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">Vehicle Entry</span>
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
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-from-top-2">
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

      {/* Mobile Search Overlay Bar */}
      {mobileSearchOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-slate-200 p-3 shadow-lg z-50">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search services, vehicles (KA-01), licences, challans..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {query.length > 0 && (
            <div className="mt-2 max-h-72 overflow-y-auto space-y-2 divide-y divide-slate-100">
              {totalResults === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500">
                  No matching items found for "{searchQuery}".
                </div>
              ) : (
                <>
                  {matchedVehicles.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => handleSelectNav('vehicles')}
                      className="p-2 text-xs flex justify-between items-center"
                    >
                      <div>
                        <span className="font-semibold">{v.registrationNumber}</span>
                        <div className="text-[10px] text-slate-400">{v.makeModel}</div>
                      </div>
                      <span className="text-[10px] text-blue-600">Vehicle →</span>
                    </div>
                  ))}
                  {matchedLicences.map((l) => (
                    <div
                      key={l.id}
                      onClick={() => handleSelectNav('licences')}
                      className="p-2 text-xs flex justify-between items-center"
                    >
                      <div>
                        <span className="font-semibold">{l.licenceNumber}</span>
                        <div className="text-[10px] text-slate-400">{l.holderName}</div>
                      </div>
                      <span className="text-[10px] text-indigo-600">Licence →</span>
                    </div>
                  ))}
                  {matchedChallans.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectNav('challans')}
                      className="p-2 text-xs flex justify-between items-center"
                    >
                      <div>
                        <span className="font-semibold">{c.challanNumber}</span>
                        <div className="text-[10px] text-amber-700">₹{c.amount} Pending</div>
                      </div>
                      <span className="text-[10px] text-amber-600">Challan →</span>
                    </div>
                  ))}
                  {matchedTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleSelectNav('graph', t.id)}
                      className="p-2 text-xs flex justify-between items-center"
                    >
                      <div>
                        <span className="font-semibold">{t.title}</span>
                        <div className="text-[10px] text-slate-400">{t.id}</div>
                      </div>
                      <span className="text-[10px] text-purple-600">Task →</span>
                    </div>
                  ))}
                  {matchedPages.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectNav(p.id)}
                      className="p-2 text-xs flex justify-between items-center"
                    >
                      <div>
                        <span className="font-semibold">{p.name}</span>
                        <div className="text-[10px] text-slate-400">{p.desc}</div>
                      </div>
                      <span className="text-[10px] text-slate-600">Page →</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default TopBar;
