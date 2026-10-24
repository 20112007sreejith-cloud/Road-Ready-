// src/shared/deadline-engine.ts
// Mathematical Deadline & Risk Engine for RTO One
// Formula: Latest Safe Start = Expiry Date + Grace Period - Processing Duration - Appointment Lead Time - Safety Buffer

import { RiskLevel } from '../types';

export interface DeadlineCalculationInput {
  expiryDateStr: string; // ISO format YYYY-MM-DD
  gracePeriodDays?: number; // Configured grace period in calendar days
  processingDays: number; // Estimated RTO processing duration
  appointmentLeadDays: number; // Appointment lead time (e.g. 3 default, 21 scarcity)
  safetyBufferDays: number; // Safety buffer for citizen buffer (e.g. 7 days)
  referenceDateStr?: string; // Reference date (defaults to current date)
}

export interface DeadlineCalculationResult {
  expiryDate: string;
  recommendedStartDate: string;
  daysRemainingToStart: number;
  daysRemainingToExpiry: number;
  riskLevel: RiskLevel;
  isExpired: boolean;
  isPastRecommendedStart: boolean;
  breakdown: {
    baseExpiry: string;
    graceAdditionDays: number;
    processingSubtractionDays: number;
    appointmentSubtractionDays: number;
    safetySubtractionDays: number;
    netOffsetDays: number;
  };
  explanation: string;
}

export class DeadlineEngine {
  /**
   * Safe calendar date arithmetic using UTC timestamps to prevent daylight/timezone jitter
   */
  public static addCalendarDays(date: Date, days: number): Date {
    const result = new Date(date.getTime());
    result.setUTCDate(result.getUTCDate() + days);
    return result;
  }

  public static parseISODate(dateStr: string): Date | null {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

    const date = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    // Verify valid calendar day
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month ||
      date.getUTCDate() !== day
    ) {
      return null;
    }
    return date;
  }

  public static formatISODate(date: Date): string {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Difference in calendar days (dateA - dateB)
   */
  public static diffCalendarDays(dateA: Date, dateB: Date): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    const utcA = Date.UTC(dateA.getUTCFullYear(), dateA.getUTCMonth(), dateA.getUTCDate());
    const utcB = Date.UTC(dateB.getUTCFullYear(), dateB.getUTCMonth(), dateB.getUTCDate());
    return Math.round((utcA - utcB) / msPerDay);
  }

  /**
   * Core Deadline & Risk Calculator
   */
  public static calculate(input: DeadlineCalculationInput): DeadlineCalculationResult {
    const expiry = this.parseISODate(input.expiryDateStr);
    if (!expiry) {
      throw new Error(`Invalid expiry date format: "${input.expiryDateStr}". Expected YYYY-MM-DD.`);
    }

    const refDate = input.referenceDateStr
      ? this.parseISODate(input.referenceDateStr) || new Date()
      : new Date();

    const graceDays = input.gracePeriodDays ?? 0;
    const procDays = Math.max(0, input.processingDays);
    const leadDays = Math.max(0, input.appointmentLeadDays);
    const bufferDays = Math.max(0, input.safetyBufferDays);

    // netOffset = +grace - processing - lead - buffer
    const netOffset = graceDays - procDays - leadDays - bufferDays;
    const recommendedStartDateObj = this.addCalendarDays(expiry, netOffset);
    const recommendedStartDate = this.formatISODate(recommendedStartDateObj);

    // Days remaining from reference date to recommended start date
    const daysRemainingToStart = this.diffCalendarDays(recommendedStartDateObj, refDate);
    // Days remaining to actual expiry
    const daysRemainingToExpiry = this.diffCalendarDays(expiry, refDate);

    // Risk Classification:
    // SAFE: > 7 days remain before recommended start date
    // ATTENTION: between 1 and 7 days remain (1 <= days <= 7)
    // CRITICAL: <= 0 days remain (less than 24 hours or past deadline)
    let riskLevel: RiskLevel = 'SAFE';
    if (daysRemainingToStart <= 0) {
      riskLevel = 'CRITICAL';
    } else if (daysRemainingToStart <= 7) {
      riskLevel = 'ATTENTION';
    } else {
      riskLevel = 'SAFE';
    }

    const isExpired = daysRemainingToExpiry < 0;
    const isPastRecommendedStart = daysRemainingToStart < 0;

    let explanation = '';
    if (riskLevel === 'CRITICAL') {
      explanation = isPastRecommendedStart
        ? `CRITICAL RISK: You are ${Math.abs(daysRemainingToStart)} days past the recommended start date (${recommendedStartDate}). Immediate action required to prevent service disruption or late penalty.`
        : `CRITICAL RISK: Less than 24 hours remain before the recommended start date (${recommendedStartDate}). Proceed today.`;
    } else if (riskLevel === 'ATTENTION') {
      explanation = `ATTENTION: Only ${daysRemainingToStart} days remain before the recommended start date (${recommendedStartDate}). Prepare documents and schedule appointment.`;
    } else {
      explanation = `SAFE: ${daysRemainingToStart} days remain before the recommended start date (${recommendedStartDate}). Workflow is on track.`;
    }

    if (input.appointmentLeadDays > 7) {
      explanation += ` (Note: Appointment scarcity is active with a ${input.appointmentLeadDays}-day slot delay).`;
    }

    return {
      expiryDate: input.expiryDateStr,
      recommendedStartDate,
      daysRemainingToStart,
      daysRemainingToExpiry,
      riskLevel,
      isExpired,
      isPastRecommendedStart,
      breakdown: {
        baseExpiry: input.expiryDateStr,
        graceAdditionDays: graceDays,
        processingSubtractionDays: procDays,
        appointmentSubtractionDays: leadDays,
        safetySubtractionDays: bufferDays,
        netOffsetDays: netOffset,
      },
      explanation,
    };
  }
}
