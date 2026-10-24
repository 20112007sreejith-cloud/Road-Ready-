// tests/state-machine.test.ts
import { describe, it, expect } from 'vitest';
import { ApplicationStateMachine } from '../src/shared/state-machine';

describe('ApplicationStateMachine (Task Transitions & Payment Safety)', () => {
  it('allows valid task state transitions', () => {
    expect(ApplicationStateMachine.canTransition('DRAFT', 'READY')).toBe(true);
    expect(ApplicationStateMachine.canTransition('READY', 'IN_PROGRESS')).toBe(true);
    expect(ApplicationStateMachine.canTransition('IN_PROGRESS', 'PENDING')).toBe(true);
    expect(ApplicationStateMachine.canTransition('PENDING', 'COMPLETED')).toBe(true);
    expect(ApplicationStateMachine.canTransition('PENDING', 'REJECTED')).toBe(true);
    expect(ApplicationStateMachine.canTransition('REJECTED', 'DRAFT')).toBe(true);
  });

  it('rejects invalid or unsafe task state transitions', () => {
    // Cannot jump from DRAFT straight to COMPLETED without processing!
    expect(ApplicationStateMachine.canTransition('DRAFT', 'COMPLETED')).toBe(false);
    expect(() =>
      ApplicationStateMachine.validateTransition('DRAFT', 'COMPLETED')
    ).toThrowError(/Invalid application state transition/);

    // Terminal COMPLETED cannot transition to BLOCKED
    expect(ApplicationStateMachine.canTransition('COMPLETED', 'BLOCKED')).toBe(false);
  });

  it('allows valid payment state transitions', () => {
    expect(ApplicationStateMachine.canTransitionPayment('NOT_STARTED', 'INITIATED')).toBe(true);
    expect(ApplicationStateMachine.canTransitionPayment('INITIATED', 'SUCCESS')).toBe(true);
    expect(ApplicationStateMachine.canTransitionPayment('INITIATED', 'UNKNOWN')).toBe(true);
    expect(ApplicationStateMachine.canTransitionPayment('UNKNOWN', 'RECONCILIATION_REQUIRED')).toBe(true);
    expect(ApplicationStateMachine.canTransitionPayment('RECONCILIATION_REQUIRED', 'SUCCESS')).toBe(true);
  });

  it('handles payment gateway timeout safely: never assumes success or failure, triggers reconciliation', () => {
    const res = ApplicationStateMachine.handlePaymentTimeout('INITIATED');
    expect(res.nextStatus).toBe('UNKNOWN');
    expect(res.actionRequired).toBe('RECONCILIATION_REQUIRED');
    expect(res.warningMessage).toContain('Payment status is being verified');
    expect(res.warningMessage).toContain('Do not pay again');
  });

  it('does not re-trigger timeout on already confirmed successful payment', () => {
    const res = ApplicationStateMachine.handlePaymentTimeout('SUCCESS');
    expect(res.nextStatus).toBe('SUCCESS');
    expect(res.actionRequired).toBe('NONE');
  });
});
