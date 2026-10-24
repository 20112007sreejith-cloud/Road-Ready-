// tests/deadline-engine.test.ts
import { describe, it, expect } from 'vitest';
import { DeadlineEngine } from '../src/shared/deadline-engine';

describe('DeadlineEngine (Latest Safe Date & Scarcity Calculations)', () => {
  it('calculates the mathematically correct recommended start date', () => {
    // Expiry: 2026-11-12
    // Grace: 30 days -> 2026-12-12
    // Processing: 7 days -> 2026-12-05
    // Lead time: 3 days -> 2026-12-02
    // Buffer: 7 days -> 2026-11-25
    const res = DeadlineEngine.calculate({
      expiryDateStr: '2026-11-12',
      gracePeriodDays: 30,
      processingDays: 7,
      appointmentLeadDays: 3,
      safetyBufferDays: 7,
      referenceDateStr: '2026-10-24',
    });

    expect(res.recommendedStartDate).toBe('2026-11-25');
    expect(res.daysRemainingToStart).toBe(32); // 2026-10-24 to 2026-11-25
    expect(res.riskLevel).toBe('SAFE');
  });

  it('correctly shifts recommended start date and inflates risk when appointment scarcity is triggered (3 -> 21 days)', () => {
    // Normal lead time: 3 days
    const normal = DeadlineEngine.calculate({
      expiryDateStr: '2026-11-05',
      gracePeriodDays: 0,
      processingDays: 5,
      appointmentLeadDays: 3,
      safetyBufferDays: 2,
      referenceDateStr: '2026-10-24',
    });

    // Net offset = 0 - 5 - 3 - 2 = -10 days from 2026-11-05 => 2026-10-26 (2 days to start -> ATTENTION)
    expect(normal.recommendedStartDate).toBe('2026-10-26');
    expect(normal.daysRemainingToStart).toBe(2);
    expect(normal.riskLevel).toBe('ATTENTION');

    // Scarcity lead time: 21 days!
    const scarcity = DeadlineEngine.calculate({
      expiryDateStr: '2026-11-05',
      gracePeriodDays: 0,
      processingDays: 5,
      appointmentLeadDays: 21,
      safetyBufferDays: 2,
      referenceDateStr: '2026-10-24',
    });

    // Net offset = 0 - 5 - 21 - 2 = -28 days from 2026-11-05 => 2026-10-08 (Already 16 days past start date!)
    expect(scarcity.recommendedStartDate).toBe('2026-10-08');
    expect(scarcity.daysRemainingToStart).toBe(-16);
    expect(scarcity.riskLevel).toBe('CRITICAL');
    expect(scarcity.isPastRecommendedStart).toBe(true);
  });

  it('correctly enforces boundary conditions for SAFE, ATTENTION, and CRITICAL thresholds', () => {
    // Boundary 1: exactly 8 days remaining -> SAFE
    const safeRes = DeadlineEngine.calculate({
      expiryDateStr: '2026-11-01',
      gracePeriodDays: 0,
      processingDays: 0,
      appointmentLeadDays: 0,
      safetyBufferDays: 0,
      referenceDateStr: '2026-10-24',
    });
    expect(safeRes.daysRemainingToStart).toBe(8);
    expect(safeRes.riskLevel).toBe('SAFE');

    // Boundary 2: exactly 7 days remaining -> ATTENTION
    const attentionRes = DeadlineEngine.calculate({
      expiryDateStr: '2026-10-31',
      gracePeriodDays: 0,
      processingDays: 0,
      appointmentLeadDays: 0,
      safetyBufferDays: 0,
      referenceDateStr: '2026-10-24',
    });
    expect(attentionRes.daysRemainingToStart).toBe(7);
    expect(attentionRes.riskLevel).toBe('ATTENTION');

    // Boundary 3: exactly 0 days remaining -> CRITICAL
    const criticalRes = DeadlineEngine.calculate({
      expiryDateStr: '2026-10-24',
      gracePeriodDays: 0,
      processingDays: 0,
      appointmentLeadDays: 0,
      safetyBufferDays: 0,
      referenceDateStr: '2026-10-24',
    });
    expect(criticalRes.daysRemainingToStart).toBe(0);
    expect(criticalRes.riskLevel).toBe('CRITICAL');
  });

  it('gracefully handles missing grace period by defaulting to 0 without inventing statutory terms', () => {
    const res = DeadlineEngine.calculate({
      expiryDateStr: '2026-11-10',
      processingDays: 4,
      appointmentLeadDays: 2,
      safetyBufferDays: 1,
      referenceDateStr: '2026-10-24',
    });
    expect(res.breakdown.graceAdditionDays).toBe(0);
    expect(res.recommendedStartDate).toBe('2026-11-03');
  });

  it('rejects invalid date strings with actionable error', () => {
    expect(() =>
      DeadlineEngine.calculate({
        expiryDateStr: 'invalid-date',
        processingDays: 5,
        appointmentLeadDays: 3,
        safetyBufferDays: 2,
      })
    ).toThrowError(/Invalid expiry date/);
  });
});
