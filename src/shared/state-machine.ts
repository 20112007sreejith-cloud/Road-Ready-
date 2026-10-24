// src/shared/state-machine.ts
// Centralized Application & Payment State Machine for RTO One

import { TaskStatus, PaymentStatus } from '../types';

export class ApplicationStateMachine {
  // Permitted State Transitions for Service Tasks & Applications
  private static readonly VALID_TASK_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
    DRAFT: ['READY', 'WITHDRAWN', 'RULES_UNAVAILABLE'],
    READY: ['IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'REJECTED', 'WITHDRAWN'],
    IN_PROGRESS: ['PENDING', 'COMPLETED', 'FAILED', 'REJECTED', 'BLOCKED', 'WITHDRAWN'],
    PENDING: ['COMPLETED', 'REJECTED', 'FAILED', 'WITHDRAWN', 'IN_PROGRESS'],
    BLOCKED: ['READY', 'IN_PROGRESS', 'REJECTED', 'WITHDRAWN'],
    COMPLETED: [], // Terminal successful state
    REJECTED: ['DRAFT', 'WITHDRAWN'], // Allowed to resubmit / appeal via draft
    FAILED: ['DRAFT', 'WITHDRAWN'], // Allowed to retry via draft
    WITHDRAWN: ['DRAFT'], // Allowed to start fresh draft
    RULES_UNAVAILABLE: ['DRAFT'], // Allowed to retry once rules configured
  };

  public static canTransition(current: TaskStatus, target: TaskStatus): boolean {
    if (current === target) return true;
    const allowed = this.VALID_TASK_TRANSITIONS[current] || [];
    return allowed.includes(target);
  }

  public static validateTransition(
    current: TaskStatus,
    target: TaskStatus,
    contextInfo?: string
  ): void {
    if (!this.canTransition(current, target)) {
      throw new Error(
        `Invalid application state transition: Cannot change from "${current}" to "${target}". ${
          contextInfo ? `Context: ${contextInfo}` : ''
        }`
      );
    }
  }

  // Permitted Payment Transitions
  private static readonly VALID_PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
    NOT_STARTED: ['INITIATED'],
    INITIATED: ['PENDING', 'SUCCESS', 'FAILED', 'UNKNOWN'],
    PENDING: ['SUCCESS', 'FAILED', 'UNKNOWN', 'RECONCILIATION_REQUIRED'],
    UNKNOWN: ['RECONCILIATION_REQUIRED', 'SUCCESS', 'FAILED'],
    RECONCILIATION_REQUIRED: ['SUCCESS', 'FAILED'],
    FAILED: ['INITIATED'], // Allowed to initiate a new clean retry
    SUCCESS: [], // Terminal successful state
  };

  public static canTransitionPayment(current: PaymentStatus, target: PaymentStatus): boolean {
    if (current === target) return true;
    const allowed = this.VALID_PAYMENT_TRANSITIONS[current] || [];
    return allowed.includes(target);
  }

  public static validatePaymentTransition(
    current: PaymentStatus,
    target: PaymentStatus,
    contextInfo?: string
  ): void {
    if (!this.canTransitionPayment(current, target)) {
      throw new Error(
        `Invalid payment state transition: Cannot change from "${current}" to "${target}". ${
          contextInfo ? `Context: ${contextInfo}` : ''
        }`
      );
    }
  }

  /**
   * Safe handling of unknown payment timeout:
   * Rule: Never treat unknown as failed or successful. Require reconciliation.
   */
  public static handlePaymentTimeout(currentPaymentStatus: PaymentStatus): {
    nextStatus: PaymentStatus;
    actionRequired: string;
    warningMessage: string;
  } {
    if (currentPaymentStatus === 'SUCCESS') {
      return {
        nextStatus: 'SUCCESS',
        actionRequired: 'NONE',
        warningMessage: 'Payment is already confirmed successful.',
      };
    }

    return {
      nextStatus: 'UNKNOWN',
      actionRequired: 'RECONCILIATION_REQUIRED',
      warningMessage:
        'Payment status is being verified. Do not pay again until the transaction is checked to avoid duplicate debits.',
    };
  }
}
