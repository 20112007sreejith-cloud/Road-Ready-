// src/shared/dependency-engine.ts
// Genuine Directed Acyclic Graph (DAG) Engine for RTO One

import { WorkflowTask, DependencyGraphData, TaskStatus } from '../types';

export class DependencyEngine {
  private tasks: Map<string, WorkflowTask> = new Map();
  private adjacencyList: Map<string, string[]> = new Map(); // from prerequisite -> downstream tasks
  private reverseAdjacencyList: Map<string, string[]> = new Map(); // from task -> prerequisites

  constructor(tasks: WorkflowTask[]) {
    this.init(tasks);
  }

  public init(tasks: WorkflowTask[]) {
    this.tasks = new Map(tasks.map((t) => [t.id, { ...t }]));
    this.buildGraph();
  }

  private buildGraph() {
    this.adjacencyList.clear();
    this.reverseAdjacencyList.clear();

    for (const task of this.tasks.values()) {
      if (!this.adjacencyList.has(task.id)) {
        this.adjacencyList.set(task.id, []);
      }
      if (!this.reverseAdjacencyList.has(task.id)) {
        this.reverseAdjacencyList.set(task.id, []);
      }
    }

    for (const task of this.tasks.values()) {
      for (const depId of task.dependencyIds) {
        // Validate dependency reference
        if (this.tasks.has(depId)) {
          // depId is a prerequisite for task.id
          this.adjacencyList.get(depId)?.push(task.id);
          this.reverseAdjacencyList.get(task.id)?.push(depId);
        }
      }
    }
  }

  /**
   * Cycle Detection using DFS 3-Coloring (0=White, 1=Gray, 2=Black)
   */
  public detectCycles(): { hasCycle: boolean; cycleNodes: string[] } {
    const visited = new Map<string, number>();
    const parentMap = new Map<string, string>();
    const cycleNodes: string[] = [];

    for (const taskId of this.tasks.keys()) {
      visited.set(taskId, 0); // 0 = unvisited
    }

    const dfs = (node: string): boolean => {
      visited.set(node, 1); // 1 = visiting (in recursion stack)

      const neighbors = this.adjacencyList.get(node) || [];
      for (const neighbor of neighbors) {
        if (visited.get(neighbor) === 1) {
          // Back-edge found -> cycle!
          cycleNodes.push(neighbor);
          let curr = node;
          while (curr && curr !== neighbor) {
            cycleNodes.push(curr);
            curr = parentMap.get(curr) || '';
          }
          cycleNodes.push(neighbor);
          return true;
        }

        if (visited.get(neighbor) === 0) {
          parentMap.set(neighbor, node);
          if (dfs(neighbor)) return true;
        }
      }

      visited.set(node, 2); // 2 = completely visited
      return false;
    };

    for (const taskId of this.tasks.keys()) {
      if (visited.get(taskId) === 0) {
        if (dfs(taskId)) {
          return { hasCycle: true, cycleNodes: cycleNodes.reverse() };
        }
      }
    }

    return { hasCycle: false, cycleNodes: [] };
  }

  /**
   * Compute Topological Ordering using Kahn's Algorithm
   */
  public getTopologicalOrder(): string[] {
    const { hasCycle } = this.detectCycles();
    if (hasCycle) {
      throw new Error('Cannot compute topological order: Cycle detected in task dependency graph.');
    }

    const inDegree = new Map<string, number>();
    for (const taskId of this.tasks.keys()) {
      inDegree.set(taskId, (this.reverseAdjacencyList.get(taskId) || []).length);
    }

    const queue: string[] = [];
    for (const [taskId, deg] of inDegree.entries()) {
      if (deg === 0) {
        queue.push(taskId);
      }
    }

    const order: string[] = [];
    while (queue.length > 0) {
      const u = queue.shift()!;
      order.push(u);

      const neighbors = this.adjacencyList.get(u) || [];
      for (const v of neighbors) {
        const newDeg = (inDegree.get(v) || 0) - 1;
        inDegree.set(v, newDeg);
        if (newDeg === 0) {
          queue.push(v);
        }
      }
    }

    return order;
  }

  /**
   * Identify Direct Blockers for a task
   */
  public getDirectBlockers(taskId: string): string[] {
    const task = this.tasks.get(taskId);
    if (!task) return [];

    const directPrereqs = this.reverseAdjacencyList.get(taskId) || [];
    return directPrereqs.filter((prereqId) => {
      const prereq = this.tasks.get(prereqId);
      return prereq && prereq.status !== 'COMPLETED';
    });
  }

  /**
   * Identify Transitive Blockers (all upstream uncompleted prerequisites)
   */
  public getTransitiveBlockers(taskId: string): string[] {
    const direct = this.getDirectBlockers(taskId);
    const visited = new Set<string>(direct);
    const queue = [...direct];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const upstream = this.reverseAdjacencyList.get(curr) || [];
      for (const upId of upstream) {
        const upTask = this.tasks.get(upId);
        if (upTask && upTask.status !== 'COMPLETED' && !visited.has(upId)) {
          visited.add(upId);
          queue.push(upId);
        }
      }
    }

    // Exclude direct blockers to only return upstream transitive ones
    return Array.from(visited).filter((id) => !direct.includes(id));
  }

  /**
   * Identify Tasks that can proceed in parallel right now (eligible with 0 blockers)
   */
  public getParallelEligibleTasks(): string[] {
    const eligible: string[] = [];
    for (const task of this.tasks.values()) {
      if (task.status === 'READY' || task.status === 'IN_PROGRESS') {
        const directBlockers = this.getDirectBlockers(task.id);
        if (directBlockers.length === 0) {
          eligible.push(task.id);
        }
      }
    }
    return eligible;
  }

  /**
   * Generate Human-Readable Dependency Explanation
   */
  public explainTaskBlockers(taskId: string): string {
    const task = this.tasks.get(taskId);
    if (!task) return 'Task not found in dependency registry.';

    if (task.status === 'COMPLETED') {
      return 'This service workflow has already been successfully completed.';
    }

    if (task.status === 'REJECTED') {
      return `This application was rejected: ${task.rejectionReason || 'Document mismatch or compliance failure.'}`;
    }

    const directBlockers = this.getDirectBlockers(taskId);
    const transitiveBlockers = this.getTransitiveBlockers(taskId);

    if (directBlockers.length === 0) {
      return 'All prerequisites are satisfied. This service is ready for action.';
    }

    const directTitles = directBlockers
      .map((id) => `"${this.tasks.get(id)?.title || id}"`)
      .join(', ');

    let explanation = `Blocked by direct prerequisite: ${directTitles}.`;

    if (transitiveBlockers.length > 0) {
      const transTitles = transitiveBlockers
        .map((id) => `"${this.tasks.get(id)?.title || id}"`)
        .join(', ');
      explanation += ` Further upstream blockers: ${transTitles}.`;
    }

    return explanation;
  }

  /**
   * Recompute all task statuses based on state change
   */
  public recomputeTaskEligibility(): WorkflowTask[] {
    const { hasCycle } = this.detectCycles();
    if (hasCycle) {
      throw new Error('Cannot recompute task eligibility: Graph contains circular dependencies.');
    }

    const topologicalOrder = this.getTopologicalOrder();

    for (const taskId of topologicalOrder) {
      const task = this.tasks.get(taskId);
      if (!task) continue;

      // Do not alter terminal or explicit manual states
      if (
        task.status === 'COMPLETED' ||
        task.status === 'REJECTED' ||
        task.status === 'WITHDRAWN' ||
        task.status === 'FAILED' ||
        task.status === 'RULES_UNAVAILABLE'
      ) {
        task.directBlockers = [];
        task.transitiveBlockers = [];
        task.blockerExplanation = this.explainTaskBlockers(taskId);
        continue;
      }

      const direct = this.getDirectBlockers(taskId);
      const transitive = this.getTransitiveBlockers(taskId);

      task.directBlockers = direct;
      task.transitiveBlockers = transitive;
      task.blockerExplanation = this.explainTaskBlockers(taskId);

      if (direct.length > 0) {
        task.status = 'BLOCKED';
      } else {
        // No blockers! If it was BLOCKED, transition to READY
        if (task.status === 'BLOCKED') {
          task.status = 'READY';
        }
      }

      task.lastUpdated = new Date().toISOString();
      this.tasks.set(taskId, task);
    }

    return Array.from(this.tasks.values());
  }

  /**
   * Complete a task and propagate unlock to downstream dependencies
   */
  public completeTask(taskId: string): WorkflowTask[] {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found.`);

    task.status = 'COMPLETED';
    task.lastUpdated = new Date().toISOString();
    this.tasks.set(taskId, task);

    return this.recomputeTaskEligibility();
  }

  /**
   * Build complete graph visualization payload for React Flow
   */
  public getGraphData(): DependencyGraphData {
    const { hasCycle, cycleNodes } = this.detectCycles();
    const tasks = Array.from(this.tasks.values());

    const edges: { from: string; to: string; label?: string }[] = [];
    for (const [fromId, toList] of this.adjacencyList.entries()) {
      for (const toId of toList) {
        const fromTask = this.tasks.get(fromId);
        const isSatisfied = fromTask?.status === 'COMPLETED';
        edges.push({
          from: fromId,
          to: toId,
          label: isSatisfied ? 'Resolved' : 'Prerequisite',
        });
      }
    }

    let topologicalOrder: string[] = [];
    if (!hasCycle) {
      topologicalOrder = this.getTopologicalOrder();
    }

    // Partition into parallel execution levels
    const parallelTaskGroups: string[][] = [];
    const levelMap = new Map<string, number>();

    if (!hasCycle) {
      for (const taskId of topologicalOrder) {
        const prereqs = this.reverseAdjacencyList.get(taskId) || [];
        let maxPrereqLevel = -1;
        for (const p of prereqs) {
          maxPrereqLevel = Math.max(maxPrereqLevel, levelMap.get(p) ?? -1);
        }
        const myLevel = maxPrereqLevel + 1;
        levelMap.set(taskId, myLevel);

        if (!parallelTaskGroups[myLevel]) {
          parallelTaskGroups[myLevel] = [];
        }
        parallelTaskGroups[myLevel].push(taskId);
      }
    }

    return {
      tasks,
      edges,
      topologicalOrder,
      parallelTaskGroups,
      hasCycles: hasCycle,
      cycleNodes,
    };
  }

  public getTask(taskId: string): WorkflowTask | undefined {
    return this.tasks.get(taskId);
  }

  public getAllTasks(): WorkflowTask[] {
    return Array.from(this.tasks.values());
  }
}
