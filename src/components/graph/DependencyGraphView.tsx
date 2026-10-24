// src/components/graph/DependencyGraphView.tsx
import React, { useState, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { WorkflowTask, DependencyGraphData } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  List,
  GitGraph,
  ArrowRight,
  Zap,
  Layers,
  Sparkles,
  Check,
  AlertOctagon,
  Car,
  CreditCard,
  Lock,
  Unlock,
  Info,
} from 'lucide-react';

interface DependencyGraphViewProps {
  graphData: DependencyGraphData;
  tasks: WorkflowTask[];
  onCompleteTask: (taskId: string) => void;
  onSelectTask?: (task: WorkflowTask) => void;
}

type ViewMode = 'pipeline' | 'diagram' | 'step_list';
type FilterStatus = 'ALL' | 'BLOCKED' | 'READY' | 'COMPLETED';

export const DependencyGraphView: React.FC<DependencyGraphViewProps> = ({
  graphData,
  tasks,
  onCompleteTask,
  onSelectTask,
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>('TASK-DL-RENEW');
  const [viewMode, setViewMode] = useState<ViewMode>('pipeline');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) || tasks[0],
    [tasks, selectedTaskId]
  );

  // Group tasks into ordered stages based on parallelTaskGroups or dependency depth
  const pipelineStages = useMemo(() => {
    const rawGroups = graphData.parallelTaskGroups && graphData.parallelTaskGroups.length > 0
      ? graphData.parallelTaskGroups
      : [
          ['TASK-CHALLAN'],
          ['TASK-RC-ADDR', 'TASK-RC-NOC'],
          ['TASK-DL-ADDR', 'TASK-OWNERSHIP', 'TASK-DL-RENEW'],
        ];

    const stageMeta = [
      {
        step: 1,
        title: 'Stage 1: Prerequisites & Penalties',
        subtitle: 'Must be resolved first. Clears enforcement blocks across portals.',
        badge: 'Prerequisites',
        color: 'from-amber-500/10 to-rose-500/10',
        borderColor: 'border-amber-200',
      },
      {
        step: 2,
        title: 'Stage 2: Core Transport Foundation',
        subtitle: 'Vehicle registration updates and clearance endorsements.',
        badge: 'Foundation',
        color: 'from-blue-500/10 to-indigo-500/10',
        borderColor: 'border-blue-200',
      },
      {
        step: 3,
        title: 'Stage 3: Licensing & Transfers',
        subtitle: 'Driver licence renewal and title transfer applications.',
        badge: 'Final Services',
        color: 'from-purple-500/10 to-emerald-500/10',
        borderColor: 'border-purple-200',
      },
    ];

    return rawGroups.map((group, idx) => {
      const meta = stageMeta[idx] || {
        step: idx + 1,
        title: `Stage ${idx + 1}: Transport Services`,
        subtitle: 'Sequential workflow group',
        badge: `Level ${idx + 1}`,
        color: 'from-slate-50 to-slate-100',
        borderColor: 'border-slate-200',
      };

      const stageTasks = group
        .map((id) => tasks.find((t) => t.id === id))
        .filter((t): t is WorkflowTask => !!t);

      return {
        ...meta,
        tasks: stageTasks,
      };
    });
  }, [graphData.parallelTaskGroups, tasks]);

  // Filtered tasks for step-by-step list
  const filteredTasks = useMemo(() => {
    if (filterStatus === 'ALL') return tasks;
    return tasks.filter((t) => t.status === filterStatus);
  }, [tasks, filterStatus]);

  // Overall workflow metrics
  const totalFee = useMemo(() => tasks.reduce((sum, t) => sum + t.estimatedFee, 0), [tasks]);
  const totalDays = useMemo(() => tasks.reduce((sum, t) => sum + t.processingDays, 0), [tasks]);
  const blockedCount = tasks.filter((t) => t.status === 'BLOCKED').length;
  const readyCount = tasks.filter((t) => t.status === 'READY').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  // React Flow Diagram nodes and edges
  const { nodes, edges } = useMemo(() => {
    const nodeList: Node[] = [];
    const edgeList: Edge[] = [];
    const levelGroups = graphData.parallelTaskGroups || [];

    levelGroups.forEach((group, levelIndex) => {
      group.forEach((taskId, taskIndex) => {
        const task = tasks.find((t) => t.id === taskId);
        if (!task) return;

        const isBlocked = task.status === 'BLOCKED';
        const isCompleted = task.status === 'COMPLETED';
        const isSelected = task.id === selectedTaskId;

        nodeList.push({
          id: task.id,
          position: {
            x: levelIndex * 330 + 30,
            y: taskIndex * 190 + 50,
          },
          data: {
            label: (
              <div className="text-left select-none">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">
                    {task.category}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : isBlocked
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900 mt-1 line-clamp-1">
                  {task.title}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Fee: ₹{task.estimatedFee} • {task.processingDays} Days
                </div>
                <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-mono">{task.id.replace('TASK-', '')}</span>
                  {isBlocked ? (
                    <span className="text-rose-600 font-semibold flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" /> Blocked
                    </span>
                  ) : isCompleted ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" /> Done
                    </span>
                  ) : (
                    <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                      <Unlock className="w-2.5 h-2.5" /> Ready
                    </span>
                  )}
                </div>
              </div>
            ),
          },
          style: {
            background: isCompleted ? '#f0fdf4' : isBlocked ? '#fff1f2' : '#f8fafc',
            border: isSelected
              ? '2px solid #2563eb'
              : isBlocked
              ? '1px solid #fecdd3'
              : isCompleted
              ? '1px solid #bbf7d0'
              : '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '12px',
            width: 260,
            boxShadow: isSelected
              ? '0 10px 20px -3px rgba(37, 99, 235, 0.25)'
              : '0 1px 3px rgba(0, 0, 0, 0.05)',
            cursor: 'pointer',
          },
        });
      });
    });

    graphData.edges.forEach((e, idx) => {
      const fromTask = tasks.find((t) => t.id === e.from);
      const isSatisfied = fromTask?.status === 'COMPLETED';

      edgeList.push({
        id: `edge-${e.from}-${e.to}-${idx}`,
        source: e.from,
        target: e.to,
        animated: !isSatisfied,
        style: {
          stroke: isSatisfied ? '#16a34a' : '#f43f5e',
          strokeWidth: isSatisfied ? 2 : 2.5,
          strokeDasharray: isSatisfied ? undefined : '5,5',
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isSatisfied ? '#16a34a' : '#f43f5e',
          width: 16,
          height: 16,
        },
        label: isSatisfied ? '✓ Unlocked' : 'Prereq',
        labelStyle: { fill: isSatisfied ? '#16a34a' : '#e11d48', fontSize: 10, fontWeight: 700 },
        labelBgStyle: { fill: '#ffffff', fillOpacity: 0.95 },
      });
    });

    return { nodes: nodeList, edges: edgeList };
  }, [graphData, tasks, selectedTaskId]);

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    const task = tasks.find((t) => t.id === taskId);
    if (task && onSelectTask) {
      onSelectTask(task);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Reliability Guarantee Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <GitGraph className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Service Dependency Pipeline & DAG Engine
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Zero Deadlocks (Cycle-Free)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Visual roadmap showing how clearing upstream prerequisites (like fines) unlocks downstream vehicle and licence applications.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-center shrink-0">
            <button
              onClick={() => setViewMode('pipeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'pipeline'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Simple 3-stage visual pipeline layout"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Visual Pipeline (Simple)</span>
            </button>
            <button
              onClick={() => setViewMode('diagram')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'diagram'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Interactive node connection diagram"
            >
              <GitGraph className="w-3.5 h-3.5 text-purple-600" />
              <span>Interactive Diagram</span>
            </button>
            <button
              onClick={() => setViewMode('step_list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'step_list'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Linear Kahn's topological order checklist"
            >
              <List className="w-3.5 h-3.5 text-slate-600" />
              <span>Step-by-Step List</span>
            </button>
          </div>
        </div>

        {/* Live Metrics & Kahn's Topological Order Breadcrumb */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Quick Stats */}
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="font-semibold text-slate-900">{tasks.length}</span> Total Steps
            </span>
            <span className="flex items-center gap-1.5 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              {blockedCount} Blocked
            </span>
            <span className="flex items-center gap-1.5 text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {readyCount} Ready
            </span>
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <Check className="w-3 h-3 text-emerald-600" />
              {completedCount} Done
            </span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="hidden sm:flex items-center gap-1 text-slate-500">
              Total Fee: <strong className="text-slate-900">₹{totalFee}</strong>
            </span>
          </div>

          {/* Sequential Order Ribbon */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700 shrink-0">Execution Order:</span>
            {graphData.topologicalOrder.map((id, idx) => {
              const t = tasks.find((x) => x.id === id);
              const isSelected = id === selectedTaskId;
              const isDone = t?.status === 'COMPLETED';
              return (
                <React.Fragment key={id}>
                  <button
                    onClick={() => handleTaskClick(id)}
                    className={`px-2 py-0.5 rounded font-mono text-[10px] transition-colors cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-2xs'
                        : isDone
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}. {id.replace('TASK-', '')}
                  </button>
                  {idx < graphData.topologicalOrder.length - 1 && (
                    <span className="text-slate-300">→</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Layout: Views (2 cols) + Detail Drawer (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {/* MODE 1: VISUAL PIPELINE (Simple & Reliable Default) */}
          {viewMode === 'pipeline' && (
            <div className="space-y-4">
              {pipelineStages.map((stage, stageIdx) => {
                const allStageCompleted = stage.tasks.every((t) => t.status === 'COMPLETED');
                const hasBlockedInStage = stage.tasks.some((t) => t.status === 'BLOCKED');

                return (
                  <div
                    key={stage.step}
                    className={`bg-white rounded-xl border p-4.5 shadow-xs transition-all ${
                      allStageCompleted
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : hasBlockedInStage
                        ? 'border-slate-200'
                        : 'border-blue-200'
                    }`}
                  >
                    {/* Stage Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            allStageCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-900 text-white'
                          }`}
                        >
                          {allStageCompleted ? '✓' : stage.step}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                            <span>{stage.title}</span>
                            <span className="text-[10px] px-2 py-0.2 bg-slate-100 text-slate-600 rounded font-semibold uppercase">
                              {stage.tasks.length} {stage.tasks.length === 1 ? 'Task' : 'Tasks'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{stage.subtitle}</p>
                        </div>
                      </div>

                      {allStageCompleted ? (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1 self-start sm:self-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Stage Cleared
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 flex items-center gap-1 self-start sm:self-center">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> Active Stage
                        </span>
                      )}
                    </div>

                    {/* Stage Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {stage.tasks.map((task) => {
                        const isSelected = task.id === selectedTaskId;
                        const isCompleted = task.status === 'COMPLETED';
                        const isBlocked = task.status === 'BLOCKED';
                        const isReady = task.status === 'READY';

                        return (
                          <div
                            key={task.id}
                            onClick={() => handleTaskClick(task.id)}
                            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/30 shadow-sm'
                                : isCompleted
                                ? 'border-emerald-200 bg-emerald-50/30 hover:border-emerald-300'
                                : isBlocked
                                ? 'border-rose-200 bg-white hover:border-rose-300'
                                : 'border-slate-200 bg-white hover:border-blue-300'
                            }`}
                          >
                            <div>
                              {/* Top Bar of Card */}
                              <div className="flex items-center justify-between gap-1 mb-2">
                                <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
                                  {task.id.replace('TASK-', '')} • {task.jurisdiction}
                                </span>
                                <Badge status={task.status} />
                              </div>

                              {/* Title */}
                              <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                                {task.title}
                              </h4>

                              {task.entityLabel && (
                                <div className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-1">
                                  <span className="px-1.5 py-0.2 bg-slate-100 rounded border border-slate-200">
                                    {task.entityLabel}
                                  </span>
                                </div>
                              )}

                              {/* Blocker Alert Callout inside card */}
                              {isBlocked && (
                                <div className="mt-2.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-900 space-y-1">
                                  <div className="font-semibold flex items-center gap-1">
                                    <Lock className="w-3 h-3 text-rose-600 shrink-0" />
                                    <span>Blocked by Prerequisite:</span>
                                  </div>
                                  <p className="text-[10px] text-rose-700 leading-relaxed line-clamp-2">
                                    {task.blockerExplanation}
                                  </p>
                                </div>
                              )}

                              {isReady && (
                                <div className="mt-2.5 p-2 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-900 space-y-1">
                                  <div className="font-semibold flex items-center gap-1">
                                    <Unlock className="w-3 h-3 text-blue-600 shrink-0" />
                                    <span>Prerequisites Clear: Ready to start!</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Bottom Card Actions & Meta */}
                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                              <div className="text-slate-500">
                                <span className="font-semibold text-slate-800">₹{task.estimatedFee}</span>
                                <span className="text-slate-400"> • {task.processingDays}d</span>
                              </div>

                              {isBlocked ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (task.directBlockers && task.directBlockers.length > 0) {
                                      onCompleteTask(task.directBlockers[0]);
                                    }
                                  }}
                                  className="text-[10px] py-0.5 px-2 text-rose-700 border-rose-300 hover:bg-rose-50 font-semibold"
                                >
                                  <Zap className="w-3 h-3 mr-1" />
                                  Unblock
                                </Button>
                              ) : isReady ? (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onCompleteTask(task.id);
                                  }}
                                  className="text-[10px] py-0.5 px-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Complete
                                </Button>
                              ) : (
                                <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Resolved
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Stage Transition Arrow */}
                    {stageIdx < pipelineStages.length - 1 && (
                      <div className="mt-4 pt-2 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
                        <div className="h-px bg-slate-200 flex-1" />
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                          <span>Unlocks {pipelineStages[stageIdx + 1]?.title}</span>
                          <ArrowRight className="w-3 h-3 text-blue-600" />
                        </span>
                        <div className="h-px bg-slate-200 flex-1" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* MODE 2: INTERACTIVE DIAGRAM CANVAS */}
          {viewMode === 'diagram' && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 h-[640px] relative overflow-hidden shadow-inner">
              {/* Top Diagram Banner */}
              <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-xs shadow-xs flex items-center gap-2">
                <span className="font-bold text-slate-800">Visual Directed Acyclic Graph</span>
                <span className="text-slate-400">•</span>
                <span className="text-[11px] text-slate-500">Click any node to inspect prerequisites</span>
              </div>

              {/* Canvas Legend */}
              <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-xs p-2.5 rounded-lg border border-slate-200 text-[11px] shadow-xs space-y-1">
                <div className="font-bold text-slate-800">Legend:</div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Resolved
                  </span>
                  <span className="flex items-center gap-1 text-rose-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Blocked
                  </span>
                  <span className="flex items-center gap-1 text-blue-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Selected
                  </span>
                </div>
              </div>

              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodeClick={(_, node) => handleTaskClick(node.id)}
                fitView
                minZoom={0.5}
                maxZoom={1.5}
              >
                <Background color="#cbd5e1" gap={20} size={1} />
                <Controls />
                <MiniMap
                  nodeColor={(n: any) => {
                    const task = tasks.find((t) => t.id === n.id);
                    if (task?.status === 'COMPLETED') return '#10b981';
                    if (task?.status === 'BLOCKED') return '#f43f5e';
                    return '#3b82f6';
                  }}
                />
              </ReactFlow>
            </div>
          )}

          {/* MODE 3: STEP-BY-STEP CHECKLIST (Topological Sort) */}
          {viewMode === 'step_list' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Sequential Execution Plan (Kahn's Topological Sort)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Guaranteed mathematical order to complete all tasks without encountering circular blocks.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                  {(['ALL', 'BLOCKED', 'READY', 'COMPLETED'] as FilterStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-all cursor-pointer ${
                        filterStatus === st
                          ? 'bg-white text-slate-900 shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {graphData.topologicalOrder
                  .map((id) => tasks.find((t) => t.id === id))
                  .filter((t): t is WorkflowTask => !!t && (filterStatus === 'ALL' || t.status === filterStatus))
                  .map((task, stepIdx) => {
                    const isSelected = task.id === selectedTaskId;
                    const isCompleted = task.status === 'COMPLETED';
                    const isBlocked = task.status === 'BLOCKED';

                    return (
                      <div
                        key={task.id}
                        onClick={() => handleTaskClick(task.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20'
                            : isCompleted
                            ? 'bg-emerald-50/30 border-emerald-200'
                            : isBlocked
                            ? 'bg-rose-50/20 border-rose-200'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                              {stepIdx + 1}
                            </span>
                            <h4 className="font-semibold text-xs sm:text-sm text-slate-900">
                              {task.title}
                            </h4>
                            <Badge status={task.status} />
                          </div>
                          <p className="text-xs text-slate-600 pl-7">{task.blockerExplanation}</p>
                          <div className="text-[11px] text-slate-400 pl-7 flex flex-wrap items-center gap-3">
                            <span>Fee: ₹{task.estimatedFee}</span>
                            <span>Duration: {task.processingDays} days</span>
                            <span>
                              Prerequisites: {task.dependencyIds.length > 0 ? task.dependencyIds.join(', ') : 'None'}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 pl-7 sm:pl-0">
                          {isBlocked ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (task.directBlockers && task.directBlockers.length > 0) {
                                  onCompleteTask(task.directBlockers[0]);
                                }
                              }}
                              className="text-xs text-rose-700 border-rose-300 hover:bg-rose-50"
                            >
                              <Zap className="w-3.5 h-3.5 mr-1" />
                              Unblock Prereq
                            </Button>
                          ) : isCompleted ? (
                            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Finished
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                onCompleteTask(task.id);
                              }}
                              className="text-xs"
                            >
                              Complete Step
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: INSPECTOR DRAWER */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between shadow-xs sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto">
          {selectedTask ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                    {selectedTask.id} • {selectedTask.jurisdiction}
                  </span>
                  <Badge status={selectedTask.status} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedTask.title}
                </h3>
                {selectedTask.entityLabel && (
                  <span className="inline-block mt-1 text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                    Target: {selectedTask.entityLabel}
                  </span>
                )}
              </div>

              {/* Blocker Explanation Card */}
              <div
                className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                  selectedTask.status === 'BLOCKED'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : selectedTask.status === 'COMPLETED'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-blue-50 border-blue-200 text-blue-900'
                }`}
              >
                <div className="flex items-start gap-2">
                  {selectedTask.status === 'BLOCKED' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  ) : selectedTask.status === 'COMPLETED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <Zap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold mb-1">
                      {selectedTask.status === 'BLOCKED'
                        ? 'Why is this step blocked?'
                        : selectedTask.status === 'COMPLETED'
                        ? 'Step Finished & Verified'
                        : 'Ready to Process'}
                    </div>
                    <p>{selectedTask.blockerExplanation}</p>
                  </div>
                </div>
              </div>

              {/* Direct & Transitive Blockers Section */}
              <div className="space-y-2 text-xs">
                <div className="font-semibold text-slate-800 flex items-center justify-between">
                  <span>Prerequisites ({selectedTask.dependencyIds.length}):</span>
                  {selectedTask.dependencyIds.length > 0 && (
                    <span className="text-[10px] text-slate-400">Click to inspect</span>
                  )}
                </div>
                {selectedTask.dependencyIds.length === 0 ? (
                  <div className="text-slate-500 italic p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px]">
                    ✓ No prerequisites. Can start immediately.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {selectedTask.dependencyIds.map((depId) => {
                      const dep = tasks.find((t) => t.id === depId);
                      const isDepComplete = dep?.status === 'COMPLETED';
                      return (
                        <div
                          key={depId}
                          onClick={() => handleTaskClick(depId)}
                          className="flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {isDepComplete ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                            )}
                            <span className="font-medium text-slate-800 line-clamp-1">
                              {dep?.title || depId}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                              isDepComplete
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isDepComplete ? 'Resolved' : 'Pending'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Fee & Processing Metadata */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">
                    Government Fee
                  </span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    ₹{selectedTask.estimatedFee}
                  </div>
                  <Badge provenance={selectedTask.ruleProvenance} className="mt-1" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">
                    Processing Time
                  </span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {selectedTask.processingDays} Calendar Days
                  </div>
                  <span className="text-[10px] text-slate-400">RTO SLA standard</span>
                </div>
              </div>

              {/* Document Checklist Preview */}
              <div className="space-y-1.5 text-xs">
                <span className="font-semibold text-slate-800">Required Documents:</span>
                {selectedTask.requiredDocuments.length === 0 ? (
                  <p className="text-slate-500 italic text-[11px]">
                    No physical or attested documents required.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {selectedTask.requiredDocuments.map((doc) => (
                      <li key={doc.name} className="flex items-center gap-2 text-[11px] text-slate-700">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{doc.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Select any step to inspect prerequisites and documents.</p>
          )}

          {/* Bottom Contextual Action */}
          {selectedTask && (
            <div className="pt-4 border-t border-slate-100 mt-4">
              {selectedTask.status === 'BLOCKED' ? (
                <div>
                  {selectedTask.directBlockers && selectedTask.directBlockers.length > 0 && (
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full text-xs shadow-xs"
                      onClick={() => {
                        const firstBlocker = selectedTask.directBlockers![0];
                        onCompleteTask(firstBlocker);
                      }}
                    >
                      <Zap className="w-3.5 h-3.5 mr-1.5" />
                      One-Click Resolve "{selectedTask.directBlockers[0].replace('TASK-', '')}"
                    </Button>
                  )}
                  <p className="text-[10px] text-slate-400 text-center mt-1.5">
                    Resolving prerequisite updates the DAG and cascades unblocks in real-time.
                  </p>
                </div>
              ) : selectedTask.status === 'COMPLETED' ? (
                <div className="text-center text-xs font-semibold text-emerald-700 bg-emerald-50 py-2.5 rounded-lg border border-emerald-200 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Prerequisite Satisfied & Recorded
                </div>
              ) : (
                <Button
                  variant="success"
                  size="md"
                  className="w-full text-xs shadow-xs"
                  onClick={() => onCompleteTask(selectedTask.id)}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Complete This Step ({selectedTask.title})
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DependencyGraphView;
