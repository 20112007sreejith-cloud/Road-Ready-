// tests/dependency-engine.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { DependencyEngine } from '../src/shared/dependency-engine';
import { WorkflowTask } from '../src/types';

describe('DependencyEngine (DAG & Topological Algorithms)', () => {
  const baseTasks: WorkflowTask[] = [
    {
      id: 'TASK-CHALLAN',
      title: 'Pay Fine',
      category: 'CHALLAN',
      status: 'READY',
      dependencyIds: [],
      jurisdiction: 'KA',
      estimatedFee: 1000,
      feeLabel: 'VERIFIED_OFFICIAL',
      processingDays: 1,
      requiredDocuments: [],
      availableActions: [],
      ruleProvenance: 'VERIFIED_OFFICIAL',
      lastUpdated: '2026-10-24T00:00:00Z',
    },
    {
      id: 'TASK-RC-ADDR',
      title: 'RC Address Update',
      category: 'VEHICLE',
      status: 'BLOCKED',
      dependencyIds: ['TASK-CHALLAN'],
      jurisdiction: 'KA',
      estimatedFee: 300,
      feeLabel: 'VERIFIED_OFFICIAL',
      processingDays: 10,
      requiredDocuments: [],
      availableActions: [],
      ruleProvenance: 'VERIFIED_OFFICIAL',
      lastUpdated: '2026-10-24T00:00:00Z',
    },
    {
      id: 'TASK-DL-ADDR',
      title: 'DL Address Update',
      category: 'DRIVING_LICENCE',
      status: 'BLOCKED',
      dependencyIds: ['TASK-RC-ADDR'],
      jurisdiction: 'KA',
      estimatedFee: 200,
      feeLabel: 'VERIFIED_OFFICIAL',
      processingDays: 5,
      requiredDocuments: [],
      availableActions: [],
      ruleProvenance: 'VERIFIED_OFFICIAL',
      lastUpdated: '2026-10-24T00:00:00Z',
    },
    {
      id: 'TASK-DL-RENEW',
      title: 'DL Renewal',
      category: 'DRIVING_LICENCE',
      status: 'BLOCKED',
      dependencyIds: ['TASK-CHALLAN', 'TASK-DL-ADDR'],
      jurisdiction: 'KA',
      estimatedFee: 450,
      feeLabel: 'VERIFIED_OFFICIAL',
      processingDays: 7,
      requiredDocuments: [],
      availableActions: [],
      ruleProvenance: 'VERIFIED_OFFICIAL',
      lastUpdated: '2026-10-24T00:00:00Z',
    },
  ];

  let engine: DependencyEngine;

  beforeEach(() => {
    engine = new DependencyEngine(baseTasks);
  });

  it('correctly detects a valid DAG with zero cycles', () => {
    const { hasCycle } = engine.detectCycles();
    expect(hasCycle).toBe(false);
  });

  it('computes correct topological ordering where prerequisites precede dependents', () => {
    const order = engine.getTopologicalOrder();
    const challanIdx = order.indexOf('TASK-CHALLAN');
    const rcAddrIdx = order.indexOf('TASK-RC-ADDR');
    const dlAddrIdx = order.indexOf('TASK-DL-ADDR');
    const dlRenewIdx = order.indexOf('TASK-DL-RENEW');

    expect(challanIdx).toBeLessThan(rcAddrIdx);
    expect(rcAddrIdx).toBeLessThan(dlAddrIdx);
    expect(dlAddrIdx).toBeLessThan(dlRenewIdx);
    expect(challanIdx).toBeLessThan(dlRenewIdx);
  });

  it('identifies direct and transitive blockers accurately', () => {
    // DL-RENEW has direct blockers: TASK-CHALLAN and TASK-DL-ADDR
    const direct = engine.getDirectBlockers('TASK-DL-RENEW');
    expect(direct).toContain('TASK-CHALLAN');
    expect(direct).toContain('TASK-DL-ADDR');

    // DL-ADDR has direct blocker: TASK-RC-ADDR, and transitive blocker: TASK-CHALLAN
    const transForDlAddr = engine.getTransitiveBlockers('TASK-DL-ADDR');
    expect(transForDlAddr).toContain('TASK-CHALLAN');
    expect(transForDlAddr).not.toContain('TASK-RC-ADDR'); // direct excluded from transitive
  });

  it('detects cycles and refuses invalid circular configurations', () => {
    const cyclicTasks: WorkflowTask[] = [
      {
        id: 'A',
        title: 'Task A',
        category: 'GENERAL',
        status: 'READY',
        dependencyIds: ['C'], // C -> A -> B -> C cycle!
        jurisdiction: 'KA',
        estimatedFee: 100,
        feeLabel: 'SIMULATED',
        processingDays: 1,
        requiredDocuments: [],
        availableActions: [],
        ruleProvenance: 'SYNTHETIC_DEMO',
        lastUpdated: '2026-10-24T00:00:00Z',
      },
      {
        id: 'B',
        title: 'Task B',
        category: 'GENERAL',
        status: 'BLOCKED',
        dependencyIds: ['A'],
        jurisdiction: 'KA',
        estimatedFee: 100,
        feeLabel: 'SIMULATED',
        processingDays: 1,
        requiredDocuments: [],
        availableActions: [],
        ruleProvenance: 'SYNTHETIC_DEMO',
        lastUpdated: '2026-10-24T00:00:00Z',
      },
      {
        id: 'C',
        title: 'Task C',
        category: 'GENERAL',
        status: 'BLOCKED',
        dependencyIds: ['B'],
        jurisdiction: 'KA',
        estimatedFee: 100,
        feeLabel: 'SIMULATED',
        processingDays: 1,
        requiredDocuments: [],
        availableActions: [],
        ruleProvenance: 'SYNTHETIC_DEMO',
        lastUpdated: '2026-10-24T00:00:00Z',
      },
    ];

    const cyclicEngine = new DependencyEngine(cyclicTasks);
    const { hasCycle, cycleNodes } = cyclicEngine.detectCycles();
    expect(hasCycle).toBe(true);
    expect(cycleNodes.length).toBeGreaterThan(0);

    expect(() => cyclicEngine.getTopologicalOrder()).toThrowError(/Cycle detected/);
  });

  it('completing a prerequisite unlocks downstream tasks automatically', () => {
    // Initial: TASK-RC-ADDR is BLOCKED
    expect(engine.getTask('TASK-RC-ADDR')?.status).toBe('BLOCKED');

    // Complete TASK-CHALLAN
    const updated = engine.completeTask('TASK-CHALLAN');
    const rcAddr = updated.find((t) => t.id === 'TASK-RC-ADDR');

    // TASK-RC-ADDR should now be READY
    expect(rcAddr?.status).toBe('READY');
    expect(rcAddr?.directBlockers?.length).toBe(0);

    // But DL-ADDR is still BLOCKED by RC-ADDR!
    const dlAddr = updated.find((t) => t.id === 'TASK-DL-ADDR');
    expect(dlAddr?.status).toBe('BLOCKED');
    expect(dlAddr?.directBlockers).toContain('TASK-RC-ADDR');
  });

  it('generates rich human-readable blocker explanations', () => {
    const explanation = engine.explainTaskBlockers('TASK-DL-RENEW');
    expect(explanation).toContain('Blocked by direct prerequisite');
    expect(explanation).toContain('Pay Fine');
  });
});
