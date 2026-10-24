// src/App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, NavView } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { OverviewDashboard } from './components/overview/OverviewDashboard';
import { MyVehicles } from './components/vehicles/MyVehicles';
import { DrivingLicences } from './components/licences/DrivingLicences';
import { ServicePlanner } from './components/planner/ServicePlanner';
import { DependencyGraphView } from './components/graph/DependencyGraphView';
import { ApplicationsView } from './components/applications/ApplicationsView';
import { ChallanCenter } from './components/challans/ChallanCenter';
import { AppointmentManager } from './components/appointments/AppointmentManager';
import { DocumentsAndRules } from './components/rules/DocumentsAndRules';
import { IntegrationRegistryView } from './components/integrations/IntegrationRegistryView';
import { HouseholdView } from './components/household/HouseholdView';
import { ActivityAuditLog } from './components/activity/ActivityAuditLog';
import { DemoLabView } from './components/demo/DemoLabView';
import { EvaluationBenchmark } from './components/benchmark/EvaluationBenchmark';
import { HelpOfficialLinks } from './components/help/HelpOfficialLinks';
import { VoiceIdentifierModal } from './components/voice/VoiceIdentifierModal';
import { GuidedAssistantModal } from './components/assistant/GuidedAssistantModal';
import { ConsentModal } from './components/household/ConsentModal';
import { TutorialModal } from './components/tutorial/TutorialModal';
import { AppDataStore } from '../server/src/store';
import {
  WorkflowTask,
  Vehicle,
  DrivingLicence,
  Challan,
  PaymentRecord,
  AppointmentSlot,
  IntegrationCapability,
  HouseholdMember,
  AuditLogItem,
  DependencyGraphData,
} from './types';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const App: React.FC = () => {
  // Use in-memory data store for synchronous initial state and offline resilience
  const store = AppDataStore.getInstance();

  const [currentView, setCurrentView] = useState<NavView>('overview');
  const [tasks, setTasks] = useState<WorkflowTask[]>(() => store.getTasks());
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => store.getState().vehicles);
  const [licences, setLicences] = useState<DrivingLicence[]>(() => store.getState().licences);
  const [challans, setChallans] = useState<Challan[]>(() => store.getState().challans);
  const [payments, setPayments] = useState<PaymentRecord[]>(() => store.getState().payments);
  const [appointmentSlots, setAppointmentSlots] = useState<AppointmentSlot[]>(
    () => store.getState().appointmentSlots
  );
  const [integrations, setIntegrations] = useState<IntegrationCapability[]>(
    () => store.getState().integrations
  );
  const [household, setHousehold] = useState<HouseholdMember[]>(
    () => store.getState().household
  );
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(
    () => store.getState().auditLogs
  );
  const [graphData, setGraphData] = useState<DependencyGraphData>(() => store.getGraphData());
  const [appointmentLeadDays, setAppointmentLeadDays] = useState<number>(
    () => store.getState().appointmentLeadDays
  );
  const [isScarcityMode, setIsScarcityMode] = useState<boolean>(
    () => store.getState().isScarcityMode
  );

  // Privacy & Consent state
  const [revealedEntities, setRevealedEntities] = useState<Set<string>>(new Set());
  const [consentTarget, setConsentTarget] = useState<{
    entityId: string;
    entityType: 'VEHICLE' | 'LICENCE';
    label: string;
  } | null>(null);

  // Modals & Navigation state
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [voiceInitialTranscript, setVoiceInitialTranscript] = useState('');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantInitialQuestion, setAssistantInitialQuestion] = useState<string | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>(
    () => store.getState().selectedJurisdiction || 'KA'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  const handleOpenAssistant = (questionId?: string) => {
    setAssistantInitialQuestion(questionId || null);
    setIsAssistantOpen(true);
  };

  // Show tutorial on first session visit
  useEffect(() => {
    const hasSeen = sessionStorage.getItem('rto_one_tutorial_seen');
    if (!hasSeen) {
      setIsTutorialOpen(true);
      sessionStorage.setItem('rto_one_tutorial_seen', 'true');
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Sync state from internal store
  const syncFromStore = useCallback(() => {
    const s = store.getState();
    setTasks(store.getTasks());
    setVehicles([...s.vehicles]);
    setLicences([...s.licences]);
    setChallans([...s.challans]);
    setPayments([...s.payments]);
    setAppointmentSlots([...s.appointmentSlots]);
    setIntegrations([...s.integrations]);
    setHousehold([...s.household]);
    setAuditLogs([...s.auditLogs]);
    setGraphData(store.getGraphData());
    setAppointmentLeadDays(s.appointmentLeadDays);
    setIsScarcityMode(s.isScarcityMode);
  }, [store]);

  // Try fetching from backend API if available, fallback to internal store
  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('API not available');
      })
      .then(() => {
        // Backend live!
        syncFromStore();
      })
      .catch(() => {
        // Running in local/bundle mode with AppDataStore
        syncFromStore();
      });
  }, [syncFromStore]);

  // Handlers
  const handleCompleteTask = (taskId: string) => {
    try {
      store.completeTask(taskId);
      syncFromStore();
      showToast(`Task "${taskId.replace('TASK-', '')}" completed. DAG updated: downstream tasks unlocked!`, 'success');
    } catch (err: any) {
      showToast(err.message, 'warning');
    }
  };

  const handleUpdateStatus = (taskId: string, status: any, reason?: string) => {
    try {
      store.updateTaskStatus(taskId, status, reason);
      syncFromStore();
      showToast(`Status updated to ${status} for ${taskId}.`, 'info');
    } catch (err: any) {
      showToast(err.message, 'warning');
    }
  };

  const handlePaymentAction = (
    paymentId: string,
    action: 'INITIATE' | 'SUCCESS' | 'FAILED' | 'TIMEOUT' | 'RECONCILE'
  ) => {
    try {
      const p = store.handlePaymentAction(paymentId, action);
      syncFromStore();
      if (action === 'TIMEOUT') {
        showToast('Payment gateway timeout: Status set to UNKNOWN. Do NOT pay again!', 'warning');
      } else if (action === 'RECONCILE') {
        showToast('Reconciliation successful with Treasury Ledger! Penalty marked cleared.', 'success');
      } else if (action === 'SUCCESS') {
        showToast('Payment successful! Fine cleared & prerequisite unlocked.', 'success');
      } else {
        showToast(`Payment action: ${action} executed.`, 'info');
      }
    } catch (err: any) {
      showToast(err.message, 'warning');
    }
  };

  const handleToggleScarcity = (activate: boolean) => {
    store.setAppointmentScarcity(activate);
    syncFromStore();
    if (activate) {
      showToast('Appointment Scarcity Curveball Activated (21-Day Slot Delay)! Deadlines recalculated to CRITICAL.', 'warning');
    } else {
      showToast('Appointment lead-time restored to 3 calendar days.', 'info');
    }
  };

  const handleResetAll = () => {
    store.resetToInitial(true);
    setRevealedEntities(new Set());
    syncFromStore();
    showToast('Clean Baseline Restored: Tasks, DAG, 3-day appointment lead-time, and masked privacy data reset.', 'success');
  };

  const handleBookSlot = (slotId: string) => {
    try {
      store.bookAppointment(slotId);
      syncFromStore();
      showToast('Slot reserved successfully at RTO office.', 'success');
    } catch (err: any) {
      showToast(err.message, 'warning');
    }
  };

  const handleCancelSlot = (slotId: string) => {
    try {
      store.cancelAppointment(slotId);
      syncFromStore();
      showToast('Appointment booking cancelled.', 'info');
    } catch (err: any) {
      showToast(err.message, 'warning');
    }
  };

  const handleConsentRecord = (entityId: string, entityType: 'VEHICLE' | 'LICENCE', purpose: string) => {
    store.recordPrivacyConsent(entityId, entityType, purpose);
    syncFromStore();
    showToast(`Consent recorded for purpose: "${purpose}". Identifier temporarily unmasked.`, 'info');
  };

  const handleTriggerVoiceAmbiguity = (transcript: string) => {
    setVoiceInitialTranscript(transcript);
    setIsVoiceOpen(true);
  };

  // Counts for sidebar badges
  const blockedCount = tasks.filter((t) => t.status === 'BLOCKED').length;
  const criticalDeadlinesCount = tasks.filter((t) => t.deadlineInfo?.riskLevel === 'CRITICAL').length;
  const unpaidChallansCount = challans.filter((c) => c.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Bar */}
      <TopBar
        onOpenVoice={() => {
          setVoiceInitialTranscript('');
          setIsVoiceOpen(true);
        }}
        onOpenAssistant={() => handleOpenAssistant()}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onResetDemo={handleResetAll}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
        isScarcityMode={isScarcityMode}
        blockedCount={blockedCount}
        criticalDeadlinesCount={criticalDeadlinesCount}
        selectedJurisdiction={selectedJurisdiction}
        onSelectJurisdiction={(code) => {
          setSelectedJurisdiction(code);
          store.setSelectedJurisdiction(code);
          syncFromStore();
          if (code === 'OD') {
            showToast('Switched to Odisha (OD) - Rule pack deliberately unconfigured (safe fallback test).', 'warning');
          } else {
            showToast(`Switched active state jurisdiction to ${code}.`, 'info');
          }
        }}
        vehicles={vehicles}
        licences={licences}
        challans={challans}
        tasks={tasks}
        onNavigate={setCurrentView}
      />

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          blockedCount={blockedCount}
          criticalDeadlinesCount={criticalDeadlinesCount}
          unpaidChallansCount={unpaidChallansCount}
          isScarcityMode={isScarcityMode}
        />

        {/* View Content Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentView === 'overview' && (
            <OverviewDashboard
              tasks={tasks}
              vehicles={vehicles}
              licences={licences}
              challans={challans}
              auditLogs={auditLogs}
              isScarcityMode={isScarcityMode}
              appointmentLeadDays={appointmentLeadDays}
              onNavigate={setCurrentView}
              onCompleteTask={handleCompleteTask}
              onOpenVoice={() => setIsVoiceOpen(true)}
              onTriggerScarcity={handleToggleScarcity}
              onOpenTutorial={() => setIsTutorialOpen(true)}
              onOpenAssistant={handleOpenAssistant}
            />
          )}

          {currentView === 'vehicles' && (
            <MyVehicles
              vehicles={vehicles}
              onStartService={(code) => {
                showToast(`Initiating service workflow for ${code}`, 'info');
                setCurrentView('planner');
              }}
              onRequestConsent={(id, type, label) => setConsentTarget({ entityId: id, entityType: type, label })}
              revealedEntities={revealedEntities}
            />
          )}

          {currentView === 'licences' && (
            <DrivingLicences
              licences={licences}
              onStartRenewal={() => {
                setCurrentView('graph');
                showToast('Inspecting renewal prerequisites on DAG Graph', 'info');
              }}
              onRequestConsent={(id, type, label) => setConsentTarget({ entityId: id, entityType: type, label })}
              revealedEntities={revealedEntities}
              isScarcityMode={isScarcityMode}
            />
          )}

          {currentView === 'planner' && (
            <ServicePlanner
              onPlanService={(code) => {
                showToast(`Workflow prepared for ${code}. Inspecting dependency chain.`, 'success');
                setCurrentView('graph');
              }}
            />
          )}

          {currentView === 'graph' && (
            <DependencyGraphView
              graphData={graphData}
              tasks={tasks}
              onCompleteTask={handleCompleteTask}
            />
          )}

          {currentView === 'applications' && (
            <ApplicationsView
              tasks={tasks}
              onCompleteTask={handleCompleteTask}
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {currentView === 'challans' && (
            <ChallanCenter
              challans={challans}
              payments={payments}
              onCompleteChallanTask={() => handleCompleteTask('TASK-CHALLAN')}
              onPaymentAction={handlePaymentAction}
            />
          )}

          {currentView === 'appointments' && (
            <AppointmentManager
              slots={appointmentSlots}
              isScarcityMode={isScarcityMode}
              appointmentLeadDays={appointmentLeadDays}
              onBookSlot={handleBookSlot}
              onCancelSlot={handleCancelSlot}
              onToggleScarcity={handleToggleScarcity}
            />
          )}

          {currentView === 'rules' && <DocumentsAndRules />}

          {currentView === 'integrations' && (
            <IntegrationRegistryView integrations={integrations} />
          )}

          {currentView === 'household' && (
            <HouseholdView
              members={household}
              vehicles={vehicles}
              licences={licences}
              onConsentRecord={handleConsentRecord}
              revealedEntities={revealedEntities}
              setRevealedEntities={setRevealedEntities}
            />
          )}

          {currentView === 'audit' && <ActivityAuditLog logs={auditLogs} />}

          {currentView === 'demo' && (
            <DemoLabView
              tasks={tasks}
              isScarcityMode={isScarcityMode}
              appointmentLeadDays={appointmentLeadDays}
              onCompleteTask={handleCompleteTask}
              onUpdateStatus={handleUpdateStatus}
              onPaymentAction={handlePaymentAction}
              onToggleScarcity={handleToggleScarcity}
              onResetAll={handleResetAll}
              onOpenVoice={() => setIsVoiceOpen(true)}
              onNavigate={setCurrentView}
              onTriggerVoiceAmbiguity={handleTriggerVoiceAmbiguity}
            />
          )}

          {currentView === 'benchmark' && <EvaluationBenchmark />}

          {currentView === 'help' && <HelpOfficialLinks />}
        </main>
      </div>

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md animate-in slide-in-from-bottom-5">
          <div
            className={`p-4 rounded-xl shadow-xl border flex items-start gap-3 ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : toast.type === 'warning'
                ? 'bg-amber-900 text-white border-amber-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : toast.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs leading-relaxed">{toast.message}</div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Voice Identifier Modal */}
      {isVoiceOpen && (
        <VoiceIdentifierModal
          isOpen={isVoiceOpen}
          onClose={() => setIsVoiceOpen(false)}
          initialTranscript={voiceInitialTranscript}
          onConfirmIdentifier={(id) => {
            showToast(`Vehicle plate identifier "${id}" confirmed and normalized.`, 'success');
          }}
        />
      )}

      {/* Guided Assistant Modal */}
      {isAssistantOpen && (
        <GuidedAssistantModal
          isOpen={isAssistantOpen}
          onClose={() => {
            setIsAssistantOpen(false);
            setAssistantInitialQuestion(null);
          }}
          tasks={tasks}
          onNavigate={setCurrentView}
          onCompleteTask={handleCompleteTask}
          initialQuestionId={assistantInitialQuestion}
        />
      )}

      {/* Consent Gated Modal */}
      {consentTarget && (
        <ConsentModal
          isOpen={!!consentTarget}
          onClose={() => setConsentTarget(null)}
          entityId={consentTarget.entityId}
          entityType={consentTarget.entityType}
          entityLabel={consentTarget.label}
          onConfirmConsent={(purpose) => {
            handleConsentRecord(consentTarget.entityId, consentTarget.entityType, purpose);
            setRevealedEntities((prev) => new Set(prev).add(consentTarget.entityId));
          }}
        />
      )}

      {/* Interactive 5-Step Tutorial Modal */}
      {isTutorialOpen && (
        <TutorialModal
          isOpen={isTutorialOpen}
          onClose={() => setIsTutorialOpen(false)}
          onNavigate={setCurrentView}
        />
      )}
    </div>
  );
};

export default App;
