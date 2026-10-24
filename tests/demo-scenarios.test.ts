// tests/demo-scenarios.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { AppDataStore } from '../server/src/store';

describe('Demo Scenarios End-to-End Integration Tests', () => {
  let store: AppDataStore;

  beforeEach(() => {
    store = AppDataStore.getInstance();
    store.resetToInitial(false);
  });

  it('Scenario 1: Completing traffic penalty resolves prerequisite and unlocks RC address update', () => {
    // Initial state: TASK-RC-ADDR is BLOCKED
    const initialTasks = store.getTasks();
    const rcAddrInit = initialTasks.find((t) => t.id === 'TASK-RC-ADDR');
    expect(rcAddrInit?.status).toBe('BLOCKED');
    expect(rcAddrInit?.directBlockers).toContain('TASK-CHALLAN');

    // Action: Complete TASK-CHALLAN
    const updatedTasks = store.completeTask('TASK-CHALLAN');
    const rcAddrUpdated = updatedTasks.find((t) => t.id === 'TASK-RC-ADDR');

    // After state: TASK-RC-ADDR is READY!
    expect(rcAddrUpdated?.status).toBe('READY');
    expect(rcAddrUpdated?.directBlockers?.length).toBe(0);

    // Verify Audit log recorded the event
    const logs = store.getState().auditLogs;
    expect(logs[0].triggeringAction).toContain('Marked Complete');
    expect(logs[0].category).toBe('TASK_UPDATE');
  });

  it('Scenario 2: Triggering appointment scarcity shifts lead-time from 3 to 21 days and recalculates deadlines', () => {
    expect(store.getState().appointmentLeadDays).toBe(3);
    expect(store.getState().isScarcityMode).toBe(false);

    // Initial DL renewal deadline with 3 days lead time
    const initialDl = store.getTasks().find((t) => t.id === 'TASK-DL-RENEW');
    const initialDays = initialDl?.deadlineInfo?.daysRemaining ?? 32;

    // Trigger Scarcity
    store.setAppointmentScarcity(true);

    expect(store.getState().appointmentLeadDays).toBe(21);
    expect(store.getState().isScarcityMode).toBe(true);

    // Deadlines must be recalculated
    const updatedDl = store.getTasks().find((t) => t.id === 'TASK-DL-RENEW');
    expect(updatedDl?.deadlineInfo?.appointmentLeadDays).toBe(21);
    // With 21 days lead time, recommended start date moves 18 days earlier!
    expect(updatedDl?.deadlineInfo?.daysRemaining).toBeLessThan(initialDays);

    // Slots at KA-01 Bangalore Central drop to 0
    const slotKa01 = store.getState().appointmentSlots.find((s) => s.rtoCode === 'KA-01');
    expect(slotKa01?.availableSlots).toBe(0);

    // Alternative RTO slots remain available
    const slotAlt = store.getState().appointmentSlots.find((s) => s.rtoCode === 'KA-03');
    expect(slotAlt?.availableSlots).toBeGreaterThan(0);
  });

  it('Scenario 3: Rejecting an application sets REJECTED status, records rejection reason, and keeps dependent tasks blocked', () => {
    const task = store.updateTaskStatus(
      'TASK-RC-ADDR',
      'REJECTED',
      'Address proof mismatch between Aadhaar card and electricity bill.'
    );

    expect(task.status).toBe('REJECTED');
    expect(task.rejectionReason).toContain('Address proof mismatch');

    // Downstream DL address update remains BLOCKED
    const dlAddr = store.getTasks().find((t) => t.id === 'TASK-DL-ADDR');
    expect(dlAddr?.status).toBe('BLOCKED');
  });

  it('Scenario 4: Payment timeout transitions to UNKNOWN without assuming failure or success, requiring reconciliation', () => {
    const payment = store.handlePaymentAction('pay-challan-1', 'TIMEOUT');
    expect(payment.status).toBe('UNKNOWN');

    // Safe reconciliation
    const reconciled = store.handlePaymentAction('pay-challan-1', 'RECONCILE');
    expect(reconciled.status).toBe('SUCCESS');
    expect(reconciled.reconciledAt).toBeDefined();

    // Challenge task auto-completed!
    const challanTask = store.getTasks().find((t) => t.id === 'TASK-CHALLAN');
    expect(challanTask?.status).toBe('COMPLETED');
  });

  it('Scenario 5: Privacy consent records event with synthetic ID and purpose, never raw unmasked identifier', () => {
    const consent = store.recordPrivacyConsent('veh-1', 'VEHICLE', 'Challan Dispute Evidence Check');
    expect(consent.entityId).toBe('veh-1');
    expect(consent.purpose).toBe('Challan Dispute Evidence Check');

    // Verify audit log has no raw plate number
    const log = store.getState().auditLogs[0];
    expect(log.explanation).not.toContain('KA-01-MJ-5021');
    expect(log.triggeringAction).toContain('Consent Granted');
    expect(log.explanation).toContain('User consented to unmask');
  });

  it('Scenario 6: Reset restores original baseline cleanly', () => {
    // Dirty the state
    store.completeTask('TASK-CHALLAN');
    store.setAppointmentScarcity(true);
    store.updateTaskStatus('TASK-RC-ADDR', 'REJECTED', 'test');

    // Reset
    store.resetToInitial(false);

    expect(store.getState().appointmentLeadDays).toBe(3);
    expect(store.getState().isScarcityMode).toBe(false);
    const challan = store.getTasks().find((t) => t.id === 'TASK-CHALLAN');
    expect(challan?.status).toBe('READY');
    const rcAddr = store.getTasks().find((t) => t.id === 'TASK-RC-ADDR');
    expect(rcAddr?.status).toBe('BLOCKED');
  });
});
