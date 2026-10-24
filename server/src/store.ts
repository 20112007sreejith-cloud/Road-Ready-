// server/src/store.ts
// In-Memory & Structured File-Backed State Store for RTO One

import fs from 'fs';
import path from 'path';
import {
  WorkflowTask,
  Vehicle,
  DrivingLicence,
  Challan,
  AppointmentSlot,
  HouseholdMember,
  IntegrationCapability,
  AuditLogItem,
  PaymentRecord,
  PrivacyConsentEvent,
} from '../../src/types';
import {
  INITIAL_TASKS,
  INITIAL_VEHICLES,
  INITIAL_LICENCES,
  INITIAL_CHALLANS,
  INITIAL_PAYMENTS,
  INITIAL_APPOINTMENT_SLOTS,
  INITIAL_INTEGRATIONS,
  INITIAL_HOUSEHOLD_MEMBERS,
  INITIAL_AUDIT_LOG,
} from '../../src/data/synthetic-seed';
import { DependencyEngine } from '../../src/shared/dependency-engine';
import { DeadlineEngine } from '../../src/shared/deadline-engine';
import { ApplicationStateMachine } from '../../src/shared/state-machine';

export interface AppState {
  tasks: WorkflowTask[];
  vehicles: Vehicle[];
  licences: DrivingLicence[];
  challans: Challan[];
  payments: PaymentRecord[];
  appointmentSlots: AppointmentSlot[];
  integrations: IntegrationCapability[];
  household: HouseholdMember[];
  auditLogs: AuditLogItem[];
  privacyConsentEvents: PrivacyConsentEvent[];
  appointmentLeadDays: number; // 3 or 21
  isScarcityMode: boolean;
  selectedJurisdiction: string;
}

export class AppDataStore {
  private static instance: AppDataStore;
  private state!: AppState;
  private dependencyEngine!: DependencyEngine;
  private readonly dataFilePath: string;

  private constructor() {
    if (typeof window === 'undefined' && typeof process !== 'undefined' && process.cwd) {
      this.dataFilePath = path.resolve(process.cwd(), 'server', 'data', 'store.json');
    } else {
      this.dataFilePath = '';
    }
    this.resetToInitial(false);
  }

  public static getInstance(): AppDataStore {
    if (!AppDataStore.instance) {
      AppDataStore.instance = new AppDataStore();
    }
    return AppDataStore.instance;
  }

  public resetToInitial(saveToFile = true) {
    this.state = {
      tasks: JSON.parse(JSON.stringify(INITIAL_TASKS)),
      vehicles: JSON.parse(JSON.stringify(INITIAL_VEHICLES)),
      licences: JSON.parse(JSON.stringify(INITIAL_LICENCES)),
      challans: JSON.parse(JSON.stringify(INITIAL_CHALLANS)),
      payments: JSON.parse(JSON.stringify(INITIAL_PAYMENTS)),
      appointmentSlots: JSON.parse(JSON.stringify(INITIAL_APPOINTMENT_SLOTS)),
      integrations: JSON.parse(JSON.stringify(INITIAL_INTEGRATIONS)),
      household: JSON.parse(JSON.stringify(INITIAL_HOUSEHOLD_MEMBERS)),
      auditLogs: JSON.parse(JSON.stringify(INITIAL_AUDIT_LOG)),
      privacyConsentEvents: [],
      appointmentLeadDays: 3,
      isScarcityMode: false,
      selectedJurisdiction: 'KA',
    };

    this.dependencyEngine = new DependencyEngine(this.state.tasks);
    this.state.tasks = this.dependencyEngine.recomputeTaskEligibility();
    this.recomputeAllDeadlines();

    this.addAuditLog(
      'DEMO_TRIGGER',
      'system',
      'Original Scenario Restored',
      'Restored initial synthetic baseline data, dependency state, and 3-day appointment lead-time.',
      'DRAFT',
      'READY'
    );

    if (saveToFile) {
      this.persist();
    }
  }

  private persist() {
    if (typeof window !== 'undefined' || !this.dataFilePath || typeof fs?.writeFileSync !== 'function') {
      return;
    }
    try {
      const dir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dataFilePath, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist store:', err);
    }
  }

  public addAuditLog(
    category: AuditLogItem['category'],
    syntheticEntityId: string,
    triggeringAction: string,
    explanation: string,
    previousStatus?: string,
    newStatus?: string
  ) {
    const item: AuditLogItem = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      category,
      syntheticEntityId,
      triggeringAction,
      explanation,
      previousStatus,
      newStatus,
    };
    this.state.auditLogs.unshift(item);
    // Keep max 150 items
    if (this.state.auditLogs.length > 150) {
      this.state.auditLogs = this.state.auditLogs.slice(0, 150);
    }
  }

  public getDashboard() {
    const tasks = this.state.tasks;
    const blockedTasks = tasks.filter((t) => t.status === 'BLOCKED');
    const pendingTasks = tasks.filter((t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS');
    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');
    const readyTasks = tasks.filter((t) => t.status === 'READY');
    const unpaidChallans = this.state.challans.filter((c) => c.status === 'PENDING');

    // Deadlines
    const criticalDeadlines = tasks.filter((t) => t.deadlineInfo?.riskLevel === 'CRITICAL');
    const attentionDeadlines = tasks.filter((t) => t.deadlineInfo?.riskLevel === 'ATTENTION');

    return {
      vehiclesCount: this.state.vehicles.length,
      licencesCount: this.state.licences.length,
      pendingApplicationsCount: pendingTasks.length,
      blockedTasksCount: blockedTasks.length,
      readyTasksCount: readyTasks.length,
      completedTasksCount: completedTasks.length,
      unpaidChallansCount: unpaidChallans.length,
      unpaidChallansTotalAmount: unpaidChallans.reduce((sum, c) => sum + c.amount, 0),
      criticalDeadlinesCount: criticalDeadlines.length,
      attentionDeadlinesCount: attentionDeadlines.length,
      isScarcityMode: this.state.isScarcityMode,
      appointmentLeadDays: this.state.appointmentLeadDays,
      selectedJurisdiction: this.state.selectedJurisdiction,
      recentLogs: this.state.auditLogs.slice(0, 6),
      criticalTasks: [...criticalDeadlines, ...blockedTasks.slice(0, 3)],
    };
  }

  public getTasks(): WorkflowTask[] {
    return this.dependencyEngine.getAllTasks();
  }

  public getGraphData() {
    return this.dependencyEngine.getGraphData();
  }

  public completeTask(taskId: string): WorkflowTask[] {
    const task = this.state.tasks.find((t) => t.id === taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    const prevStatus = task.status;
    ApplicationStateMachine.validateTransition(prevStatus, 'COMPLETED', `Completing task ${taskId}`);

    // If resolving challan
    if (taskId === 'TASK-CHALLAN') {
      const challan = this.state.challans[0];
      if (challan) {
        challan.status = 'PAID';
      }
      const veh = this.state.vehicles.find((v) => v.id === 'veh-1');
      if (veh) {
        veh.unpaidChallansCount = 0;
      }
    }

    const updatedTasks = this.dependencyEngine.completeTask(taskId);
    this.state.tasks = updatedTasks;
    this.recomputeAllDeadlines();

    this.addAuditLog(
      'TASK_UPDATE',
      taskId,
      `Task "${task.title}" Marked Complete`,
      `Completed task. Dependency engine recomputed DAG: unlocked eligible downstream tasks.`,
      prevStatus,
      'COMPLETED'
    );

    this.persist();
    return updatedTasks;
  }

  public updateTaskStatus(taskId: string, newStatus: WorkflowTask['status'], reason?: string): WorkflowTask {
    const task = this.state.tasks.find((t) => t.id === taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    const prevStatus = task.status;
    ApplicationStateMachine.validateTransition(prevStatus, newStatus, `Update status for ${taskId}`);

    task.status = newStatus;
    if (reason) {
      task.rejectionReason = reason;
    }
    task.lastUpdated = new Date().toISOString();

    this.dependencyEngine.init(this.state.tasks);
    this.state.tasks = this.dependencyEngine.recomputeTaskEligibility();
    this.recomputeAllDeadlines();

    this.addAuditLog(
      'TASK_UPDATE',
      taskId,
      `Status changed for "${task.title}"`,
      reason ? `Reason: ${reason}` : `State transitioned from ${prevStatus} to ${newStatus}.`,
      prevStatus,
      newStatus
    );

    this.persist();
    return task;
  }

  public recomputeAllDeadlines() {
    for (const task of this.state.tasks) {
      if (task.deadlineInfo) {
        const result = DeadlineEngine.calculate({
          expiryDateStr: task.deadlineInfo.expiryDate,
          gracePeriodDays: task.deadlineInfo.gracePeriodDays,
          processingDays: task.processingDays,
          appointmentLeadDays: this.state.appointmentLeadDays,
          safetyBufferDays: task.deadlineInfo.safetyBufferDays,
          referenceDateStr: '2026-10-24', // Demo Reference Baseline Date
        });

        task.deadlineInfo.appointmentLeadDays = this.state.appointmentLeadDays;
        task.deadlineInfo.recommendedStartDate = result.recommendedStartDate;
        task.deadlineInfo.daysRemaining = result.daysRemainingToStart;
        task.deadlineInfo.riskLevel = result.riskLevel;
      }
    }
  }

  public setAppointmentScarcity(activate: boolean) {
    this.state.isScarcityMode = activate;
    this.state.appointmentLeadDays = activate ? 21 : 3;

    // Update appointment slots availability
    for (const slot of this.state.appointmentSlots) {
      if (slot.rtoCode === 'KA-01') {
        slot.isScarcityMode = activate;
        slot.availableSlots = activate ? 0 : 8; // Drop Koramangala slots to 0 during scarcity!
      }
    }

    this.recomputeAllDeadlines();
    this.state.tasks = this.dependencyEngine.getAllTasks();

    this.addAuditLog(
      'APPOINTMENT_EVENT',
      'rto-KA-01',
      activate ? 'Triggered Appointment Scarcity' : 'Reset Appointment Lead Time',
      activate
        ? 'Lead time inflated from 3 to 21 days across Bangalore Central. Deadlines recalculated to CRITICAL; alternative RTO slots revealed.'
        : 'Appointment lead time restored to normal 3 days.',
      activate ? '3_DAYS' : '21_DAYS',
      activate ? '21_DAYS' : '3_DAYS'
    );

    this.persist();
  }

  public bookAppointment(slotId: string) {
    const slot = this.state.appointmentSlots.find((s) => s.id === slotId);
    if (!slot) throw new Error('Slot not found');
    if (slot.availableSlots <= 0) {
      throw new Error('This appointment slot has no remaining capacity.');
    }
    if (slot.isBookedByCurrentUser) {
      throw new Error('You have already reserved this slot.');
    }

    slot.availableSlots -= 1;
    slot.isBookedByCurrentUser = true;

    this.addAuditLog(
      'APPOINTMENT_EVENT',
      slot.rtoCode,
      `Booked Appointment at ${slot.rtoLocation}`,
      `Reserved slot on ${slot.date} (${slot.timeSlot}) for ${slot.serviceTitle}.`,
      'AVAILABLE',
      'BOOKED'
    );

    this.persist();
    return slot;
  }

  public cancelAppointment(slotId: string) {
    const slot = this.state.appointmentSlots.find((s) => s.id === slotId);
    if (!slot) throw new Error('Slot not found');
    if (!slot.isBookedByCurrentUser) {
      throw new Error('You do not hold a booking for this slot.');
    }

    slot.availableSlots += 1;
    slot.isBookedByCurrentUser = false;

    this.addAuditLog(
      'APPOINTMENT_EVENT',
      slot.rtoCode,
      `Cancelled Appointment at ${slot.rtoLocation}`,
      `Released booking for ${slot.date} (${slot.timeSlot}).`,
      'BOOKED',
      'AVAILABLE'
    );

    this.persist();
    return slot;
  }

  public handlePaymentAction(paymentId: string, action: 'INITIATE' | 'SUCCESS' | 'FAILED' | 'TIMEOUT' | 'RECONCILE') {
    let payment = this.state.payments.find((p) => p.id === paymentId);
    if (!payment) {
      // Create if needed
      payment = {
        id: paymentId,
        applicationId: 'TASK-CHALLAN',
        taskTitle: 'Traffic Violation Penalty #CH-KA-2026-881920',
        amount: 1000,
        currency: 'INR',
        status: 'NOT_STARTED',
        idempotencyKey: `IDEMP-${Date.now()}`,
        initiatedAt: new Date().toISOString(),
        statusHistory: [],
      };
      this.state.payments.push(payment);
    }

    const prev = payment.status;

    if (action === 'INITIATE') {
      ApplicationStateMachine.validatePaymentTransition(prev, 'INITIATED', 'Initiate payment');
      payment.status = 'INITIATED';
      payment.statusHistory.push({
        status: 'INITIATED',
        timestamp: new Date().toISOString(),
        note: 'Payment session created at Treasury Gateway.',
      });
    } else if (action === 'SUCCESS') {
      ApplicationStateMachine.validatePaymentTransition(prev, 'SUCCESS', 'Payment success');
      payment.status = 'SUCCESS';
      payment.completedAt = new Date().toISOString();
      payment.statusHistory.push({
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
        note: 'Payment authorized and receipt #RCPT-KA-991823 issued.',
      });
      // Complete challan task
      this.completeTask('TASK-CHALLAN');
    } else if (action === 'FAILED') {
      ApplicationStateMachine.validatePaymentTransition(prev, 'FAILED', 'Payment failed');
      payment.status = 'FAILED';
      payment.failureReason = 'Bank gateway rejected debit: Simulated insufficient balance or user cancelled.';
      payment.statusHistory.push({
        status: 'FAILED',
        timestamp: new Date().toISOString(),
        note: 'Payment failed at issuing bank.',
      });
    } else if (action === 'TIMEOUT') {
      const result = ApplicationStateMachine.handlePaymentTimeout(prev);
      payment.status = result.nextStatus;
      payment.statusHistory.push({
        status: 'UNKNOWN',
        timestamp: new Date().toISOString(),
        note: result.warningMessage,
      });
      this.addAuditLog(
        'PAYMENT_EVENT',
        payment.id,
        'Payment Gateway Timeout / Unknown State',
        result.warningMessage,
        prev,
        'UNKNOWN'
      );
    } else if (action === 'RECONCILE') {
      ApplicationStateMachine.validatePaymentTransition(prev, 'SUCCESS', 'Payment reconciliation');
      payment.status = 'SUCCESS';
      payment.reconciledAt = new Date().toISOString();
      payment.statusHistory.push({
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
        note: 'Reconciled with Treasury settlement ledger: Transaction verified.',
      });
      this.completeTask('TASK-CHALLAN');
    }

    this.persist();
    return payment;
  }

  public recordPrivacyConsent(entityId: string, entityType: 'VEHICLE' | 'LICENCE', purpose: string) {
    const event: PrivacyConsentEvent = {
      id: `consent-${Date.now()}`,
      entityId,
      entityType,
      purpose,
      revealedAt: new Date().toISOString(),
      userFictionalId: 'user-rajesh',
    };
    this.state.privacyConsentEvents.push(event);

    this.addAuditLog(
      'PRIVACY_EVENT',
      entityId,
      `Consent Granted: Identifier Revealed for ${purpose}`,
      `User consented to unmask synthetic ${entityType} for purpose: "${purpose}". Masking will automatically restore on close. (Zero raw PII logged)`,
      'MASKED',
      'REVEALED_WITH_CONSENT'
    );

    this.persist();
    return event;
  }

  public setSelectedJurisdiction(code: string) {
    const prev = this.state.selectedJurisdiction;
    this.state.selectedJurisdiction = code;
    this.addAuditLog(
      'RULE_CHANGE',
      `jur-${code}`,
      `Jurisdiction Switched to ${code}`,
      `Active rule pack switched to ${code}. Schema validation and state fee tiers re-applied.`,
      prev,
      code
    );
    this.persist();
  }

  public getState(): AppState {
    return this.state;
  }
}
