// src/components/overview/OverviewDashboard.tsx
import React, { useState } from 'react';
import {
  Car,
  CreditCard,
  AlertOctagon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Zap,
  HelpCircle,
  FileText,
  Activity,
  Flame,
  Sparkles,
  BookOpen,
  Info,
  Check,
} from 'lucide-react';
import { WorkflowTask, Vehicle, DrivingLicence, Challan, AuditLogItem } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface OverviewDashboardProps {
  tasks: WorkflowTask[];
  vehicles: Vehicle[];
  licences: DrivingLicence[];
  challans: Challan[];
  auditLogs: AuditLogItem[];
  isScarcityMode: boolean;
  appointmentLeadDays: number;
  onNavigate: (view: any) => void;
  onCompleteTask: (taskId: string) => void;
  onOpenVoice: () => void;
  onTriggerScarcity: (activate: boolean) => void;
  onOpenTutorial?: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  tasks,
  vehicles,
  licences,
  challans,
  auditLogs,
  isScarcityMode,
  appointmentLeadDays,
  onNavigate,
  onCompleteTask,
  onOpenVoice,
  onTriggerScarcity,
  onOpenTutorial,
}) => {
  // Simple view vs detailed engine view (defaults to simple for ease of understanding)
  const [isSimpleMode, setIsSimpleMode] = useState(true);
  const [showQuickGuide, setShowQuickGuide] = useState(true);

  const unpaidChallans = challans.filter((c) => c.status === 'PENDING');
  const blockedTasks = tasks.filter((t) => t.status === 'BLOCKED');
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');
  const readyTasks = tasks.filter((t) => t.status === 'READY');
  const criticalDeadlines = tasks.filter((t) => t.deadlineInfo?.riskLevel === 'CRITICAL');
  const attentionDeadlines = tasks.filter((t) => t.deadlineInfo?.riskLevel === 'ATTENTION');

  // Action Center: Ranked by Urgency, Blockers, and Citizen Impact
  const rankedActionTasks = [...tasks].sort((a, b) => {
    if (a.status === 'READY' && b.status !== 'READY') return -1;
    if (b.status === 'READY' && a.status !== 'READY') return 1;
    if (a.deadlineInfo?.riskLevel === 'CRITICAL' && b.deadlineInfo?.riskLevel !== 'CRITICAL') return -1;
    if (b.deadlineInfo?.riskLevel === 'CRITICAL' && a.deadlineInfo?.riskLevel !== 'CRITICAL') return 1;
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Beginner-Friendly Quick Start Guide Banner */}
      {showQuickGuide && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-blue-800/60 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-300" />
                  Quick Citizen Guide
                </span>
                <span className="text-xs text-blue-200">New to RTO One?</span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                How RTO One Works in 3 Simple Steps
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs text-blue-100">
                <div className="bg-white/10 rounded-xl p-2.5 border border-white/10 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                  <span><strong>Green is Ready:</strong> Prerequisite cleared. You can apply right away!</span>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5 border border-white/10 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                  <span><strong>Red is Blocked:</strong> Clear prerequisites (like fines) to unlock other steps.</span>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5 border border-white/10 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                  <span><strong>Smart Deadlines:</strong> Tells you exactly when to start to avoid late fines.</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {onOpenTutorial && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={onOpenTutorial}
                  className="text-xs bg-white text-slate-900 hover:bg-blue-50 font-bold border-none shadow-sm flex items-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Start 5-Step Tutorial</span>
                </Button>
              )}
              <button
                onClick={() => setShowQuickGuide(false)}
                className="text-xs text-blue-300 hover:text-white px-2 py-1 underline font-medium"
              >
                Dismiss Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner Alert if Scarcity is Active */}
      {isScarcityMode && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-rose-600 animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-sm text-rose-950 flex items-center gap-2">
                <span>Appointment Queue Scarcity Active</span>
                <span className="text-[10px] px-2 py-0.2 bg-rose-200 text-rose-800 rounded font-bold uppercase">
                  Wait Time: 21 Days
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-0.5">
                RTO appointment waiting queues inflated from 3 to 21 days. Driving Licence renewal safe start date is now in <strong>CRITICAL OVERDUE</strong> risk!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs bg-white text-rose-800 border-rose-300 hover:bg-rose-50"
              onClick={() => onTriggerScarcity(false)}
            >
              Reset to 3 Days
            </Button>
            <Button
              size="sm"
              variant="primary"
              className="text-xs bg-rose-600 hover:bg-rose-700"
              onClick={() => onNavigate('appointments')}
            >
              View Alternative RTOs
            </Button>
          </div>
        </div>
      )}

      {/* Primary Recommended Action Card ("What to do right now") */}
      {unpaidChallans.length > 0 ? (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white border border-blue-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3" /> Fix This First
              </span>
              <span className="text-xs text-blue-900 font-semibold">Priority Blocker</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Clear Unpaid Traffic Penalty (₹1,000) on Swift VXi
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Why this matters:</strong> An automated speed camera violation is currently holding up your <em>RC Address Change</em>, which in turn freezes your <em>Driving Licence Renewal</em>.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              size="sm"
              variant="primary"
              className="text-xs bg-blue-600 hover:bg-blue-700 shadow-sm font-bold flex items-center gap-1.5"
              onClick={() => onCompleteTask('TASK-CHALLAN')}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Pay ₹1,000 & Unlock Services</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs bg-white text-slate-700 hover:bg-slate-50"
              onClick={() => onNavigate('graph')}
            >
              <span>View Dependency Chain</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-900">All direct blockers cleared!</span>
              <p className="text-slate-600 mt-0.5">
                Your dependent vehicle and licence services are unlocked and ready to process.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-xs bg-white text-emerald-800 border-emerald-300"
            onClick={() => onNavigate('graph')}
          >
            Inspect Graph
          </Button>
        </div>
      )}

      {/* 6 Clean Top Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => onNavigate('vehicles')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Vehicles</span>
            <Car className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{vehicles.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">2 KA, 1 MH</div>
        </div>

        <div
          onClick={() => onNavigate('licences')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Licences</span>
            <CreditCard className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{licences.length}</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-0.5">1 Expiring in 19d</div>
        </div>

        <div
          onClick={() => onNavigate('challans')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Pending Challans</span>
            <AlertOctagon className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{unpaidChallans.length}</div>
          <div className="text-[11px] text-amber-700 font-semibold mt-0.5">
            {unpaidChallans.length > 0 ? '₹1,000 Unpaid' : 'All Clear'}
          </div>
        </div>

        <div
          onClick={() => onNavigate('graph')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-rose-300 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Blocked Tasks</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700">{blockedTasks.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Waiting for prereqs</div>
        </div>

        <div
          onClick={() => onNavigate('applications')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{completedTasks.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Of {tasks.length} total tasks</div>
        </div>

        <div
          onClick={() => onNavigate('appointments')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Appt Wait Time</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className={`text-2xl font-bold ${isScarcityMode ? 'text-rose-600' : 'text-slate-900'}`}>
            {appointmentLeadDays}d
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {isScarcityMode ? 'Scarcity Mode' : 'Normal queue'}
          </div>
        </div>
      </div>

      {/* Main Grid: Action Center (2/3) + Deadline Watch (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Action Center */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                Action Center (Your Recommended Next Steps)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tasks arranged in step-by-step order so you never waste a visit or get rejected.
              </p>
            </div>

            {/* Simple Mode vs Detailed Mode Toggle */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs self-start sm:self-auto">
              <button
                onClick={() => setIsSimpleMode(true)}
                className={`px-2.5 py-1 rounded font-semibold transition-all ${
                  isSimpleMode
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Simple View
              </button>
              <button
                onClick={() => setIsSimpleMode(false)}
                className={`px-2.5 py-1 rounded font-semibold transition-all ${
                  !isSimpleMode
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Detailed View
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {rankedActionTasks.map((task, idx) => {
              const isBlocked = task.status === 'BLOCKED';
              const isCompleted = task.status === 'COMPLETED';
              const isReady = task.status === 'READY';

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isReady
                      ? 'bg-blue-50/40 border-blue-200 shadow-2xs hover:border-blue-300'
                      : isBlocked
                      ? 'bg-white border-slate-200 opacity-90'
                      : isCompleted
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                            isReady
                              ? 'bg-blue-600 text-white'
                              : isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">{task.title}</h4>
                        <Badge status={task.status} />
                        {task.deadlineInfo && <Badge risk={task.deadlineInfo.riskLevel} />}
                      </div>

                      {/* Plain Language Blocker Explanation */}
                      <p className="text-xs text-slate-600 pl-7 leading-relaxed">
                        {isSimpleMode ? (
                          isBlocked ? (
                            <span className="text-slate-700">
                              🔒 <strong>Blocked:</strong> An earlier step must be cleared first ({task.directBlockers?.length ? 'traffic penalty or NOC' : 'prerequisite'}).
                            </span>
                          ) : isReady ? (
                            <span className="text-emerald-800 font-medium">
                              ✅ <strong>Ready:</strong> All prerequisites are clear. You can submit now!
                            </span>
                          ) : (
                            task.blockerExplanation
                          )
                        ) : (
                          task.blockerExplanation
                        )}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pl-7 text-[11px] text-slate-500 pt-1">
                        <span>Fee: ₹{task.estimatedFee} ({isSimpleMode ? 'Standard Fee' : task.feeLabel})</span>
                        <span>•</span>
                        <span>Estimated Duration: ~{task.processingDays} days</span>
                        {task.entityLabel && (
                          <>
                            <span>•</span>
                            <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                              {task.entityLabel}
                            </span>
                          </>
                        )}
                        {!isSimpleMode && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400">Jurisdiction: {task.jurisdiction}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 pl-7 sm:pl-0 flex items-center gap-2">
                      {isReady && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => onCompleteTask(task.id)}
                          className="text-xs bg-blue-600 hover:bg-blue-700 font-bold"
                        >
                          <Zap className="w-3.5 h-3.5 mr-1" />
                          Complete Now
                        </Button>
                      )}
                      {isBlocked && task.directBlockers && task.directBlockers.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onCompleteTask(task.directBlockers![0])}
                          className="text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
                        >
                          Unlock Blocker
                        </Button>
                      )}
                      {isCompleted && (
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Finished
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Deadline Watch & Quick Actions */}
        <div className="space-y-6">
          {/* Deadline Watch Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Deadline Watch</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {isSimpleMode ? 'Smart Calendar Buffer' : 'UTC Calendar Arithmetic'}
              </span>
            </div>

            {/* DL Renewal Deadline Card */}
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-2.5 ${
                isScarcityMode
                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                  : 'bg-amber-50/60 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">Driving Licence Renewal</span>
                <Badge risk={isScarcityMode ? 'CRITICAL' : 'ATTENTION'} />
              </div>
              <div className="text-[11px] text-slate-600">
                Holder: <strong>Rajesh Sharma</strong> (KA-0120150008432)
              </div>

              {/* Simple Mode vs Detailed Breakdown */}
              {isSimpleMode ? (
                <div className="p-3 bg-white/90 rounded-lg border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Expiry Date:</span>
                    <span className="font-bold text-slate-900">Nov 12, 2026</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Recommended Start:</span>
                    <span className={`font-bold ${isScarcityMode ? 'text-rose-700' : 'text-blue-700'}`}>
                      {isScarcityMode ? 'Oct 13, 2026 (OVERDUE)' : 'Oct 31, 2026'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                    💡 <em>Tip: Starting by this date ensures processing and slot wait-times won't cause late penalty fees.</em>
                  </p>
                </div>
              ) : (
                <div className="p-2.5 bg-white/80 rounded-lg border border-slate-200/80 space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span>Actual Expiry:</span>
                    <span className="font-bold text-slate-900">Nov 12, 2026</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Grace Period:</span>
                    <span className="text-emerald-700 font-bold">+30 Days</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>RTO Processing:</span>
                    <span className="text-rose-700 font-bold">-7 Days</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Appointment Lead:</span>
                    <span className={`font-bold ${isScarcityMode ? 'text-rose-700' : 'text-slate-800'}`}>
                      -{appointmentLeadDays} Days
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Safety Buffer:</span>
                    <span className="text-slate-700 font-bold">-7 Days</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200 flex justify-between font-sans font-bold text-xs">
                    <span>Latest Safe Start:</span>
                    <span className={isScarcityMode ? 'text-rose-700 font-extrabold' : 'text-blue-700'}>
                      {isScarcityMode ? 'Oct 13, 2026 (OVERDUE!)' : 'Oct 31, 2026'}
                    </span>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-700 italic">
                {isScarcityMode
                  ? 'CRITICAL RISK: Lead time inflation puts you past the recommended start date. Book slots at alternative RTOs now.'
                  : 'ATTENTION: Prepare Form 1-A medical fitness and resolve address update prerequisite before Oct 31.'}
              </p>
            </div>

            {/* Scarcity Curveball Simulation */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <span className="font-semibold text-slate-800">Simulate Appointment Queue:</span>
              <p className="text-[11px] text-slate-500">
                Test how sudden RTO queue delays change deadlines in real-time (3 days ↔ 21 days).
              </p>
              <Button
                variant={isScarcityMode ? 'outline' : 'danger'}
                size="sm"
                className="w-full text-xs"
                onClick={() => onTriggerScarcity(!isScarcityMode)}
              >
                {isScarcityMode ? 'Restore 3-Day Normal Lead Time' : 'Trigger 21-Day Appointment Queue'}
              </Button>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Quick Actions</h3>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => onNavigate('planner')}
                className="w-full p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-slate-50 flex items-center justify-between text-slate-700 text-left transition-colors cursor-pointer"
              >
                <span className="font-medium">Plan a New Transport Service</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => onNavigate('appointments')}
                className="w-full p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-slate-50 flex items-center justify-between text-slate-700 text-left transition-colors cursor-pointer"
              >
                <span className="font-medium">Find & Book RTO Slot</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => onNavigate('rules')}
                className="w-full p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-slate-50 flex items-center justify-between text-slate-700 text-left transition-colors cursor-pointer"
              >
                <span className="font-medium">Inspect State Rule Packs</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={onOpenVoice}
                className="w-full p-2.5 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-50 flex items-center justify-between text-blue-900 text-left transition-colors cursor-pointer"
              >
                <span className="font-medium">Voice Input Identifier (O/0 Ambiguity)</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
              </button>
            </div>
          </div>

          {/* Recent Activity Timeline Preview */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-slate-600" />
                Recent Activity
              </h3>
              <button
                onClick={() => onNavigate('audit')}
                className="text-xs text-blue-600 hover:underline"
              >
                View all
              </button>
            </div>
            <div className="space-y-2.5">
              {auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="text-xs border-l-2 border-blue-400 pl-2.5 py-0.5 space-y-0.5">
                  <div className="font-semibold text-slate-800">{log.triggeringAction}</div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">{log.explanation}</div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
