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
} from 'lucide-react';

interface DependencyGraphViewProps {
  graphData: DependencyGraphData;
  tasks: WorkflowTask[];
  onCompleteTask: (taskId: string) => void;
  onSelectTask?: (task: WorkflowTask) => void;
}

export const DependencyGraphView: React.FC<DependencyGraphViewProps> = ({
  graphData,
  tasks,
  onCompleteTask,
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>('TASK-DL-RENEW');
  const [viewMode, setViewMode] = useState<'graph' | 'accessible_list'>('graph');

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) || tasks[0],
    [tasks, selectedTaskId]
  );

  // Layout nodes by topological / parallel execution levels
  const { nodes, edges } = useMemo(() => {
    const nodeList: Node[] = [];
    const edgeList: Edge[] = [];

    const levelGroups = graphData.parallelTaskGroups || [];

    // Horizontal spacing: 320px per level; Vertical spacing: 180px per task
    levelGroups.forEach((group, levelIndex) => {
      group.forEach((taskId, taskIndex) => {
        const task = tasks.find((t) => t.id === taskId);
        if (!task) return;

        const isBlocked = task.status === 'BLOCKED';
        const isCompleted = task.status === 'COMPLETED';
        const isReady = task.status === 'READY';

        nodeList.push({
          id: task.id,
          position: {
            x: levelIndex * 340 + 40,
            y: taskIndex * 190 + 50,
          },
          data: {
            task,
            isSelected: task.id === selectedTaskId,
          },
          style: {
            background: isCompleted ? '#f0fdf4' : isBlocked ? '#fff1f2' : isReady ? '#eff6ff' : '#ffffff',
            border: task.id === selectedTaskId ? '2px solid #2563eb' : isBlocked ? '1px solid #fecdd3' : isCompleted ? '1px solid #bbf7d0' : '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '14px',
            width: 270,
            boxShadow: task.id === selectedTaskId ? '0 10px 15px -3px rgba(37, 99, 235, 0.2)' : '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
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
          width: 18,
          height: 18,
        },
        label: isSatisfied ? '✓ Satisfied' : 'Blocks',
        labelStyle: { fill: isSatisfied ? '#16a34a' : '#e11d48', fontSize: 10, fontWeight: 600 },
        labelBgStyle: { fill: '#ffffff', fillOpacity: 0.95 },
      });
    });

    return { nodes: nodeList, edges: edgeList };
  }, [graphData, tasks, selectedTaskId]);

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <GitGraph className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Transport Workflow Dependency Graph (DAG)
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              Interactive Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visualizes hard cross-service prerequisites across Vahan (RC), Sarathi (DL), e-Challan, and state transport departments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle for Accessibility */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              onClick={() => setViewMode('graph')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'graph' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitGraph className="w-3.5 h-3.5 text-blue-600" />
              Interactive Graph
            </button>
            <button
              onClick={() => setViewMode('accessible_list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'accessible_list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5 text-slate-600" />
              Accessible List
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'graph' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* React Flow Canvas (Takes 2 cols on lg) */}
          <div className="lg:col-span-2 bg-slate-900/5 rounded-xl border border-slate-200 h-[620px] relative overflow-hidden bg-slate-50">
            {/* Top Canvas Banner */}
            <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-xs shadow-xs flex items-center gap-3">
              <span className="font-semibold text-slate-700">Topological Ordering:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-600">
                {graphData.topologicalOrder.map((id, idx) => (
                  <React.Fragment key={id}>
                    <span
                      onClick={() => setSelectedTaskId(id)}
                      className={`cursor-pointer px-1.5 py-0.5 rounded font-mono hover:bg-blue-50 ${
                        id === selectedTaskId ? 'bg-blue-100 text-blue-800 font-bold' : ''
                      }`}
                    >
                      {id.replace('TASK-', '')}
                    </span>
                    {idx < graphData.topologicalOrder.length - 1 && <span className="text-slate-400">→</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Canvas Legend */}
            <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-xs p-2.5 rounded-lg border border-slate-200 text-[11px] shadow-xs space-y-1">
              <div className="font-bold text-slate-800">Legend:</div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Resolved / Ready
                </span>
                <span className="flex items-center gap-1 text-rose-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Blocked Prereq
                </span>
                <span className="flex items-center gap-1 text-blue-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Selected Task
                </span>
              </div>
            </div>

            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodeClick={(_, node) => setSelectedTaskId(node.id)}
              fitView
              minZoom={0.5}
              maxZoom={1.5}
            >
              <Background color="#cbd5e1" gap={20} size={1} />
              <Controls />
              <MiniMap
                nodeColor={(n: any) =>
                  n.data?.task?.status === 'COMPLETED'
                    ? '#10b981'
                    : n.data?.task?.status === 'BLOCKED'
                    ? '#f43f5e'
                    : '#3b82f6'
                }
              />
            </ReactFlow>
          </div>

          {/* Right Details Drawer */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between h-[620px] overflow-y-auto shadow-xs">
            {selectedTask ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      {selectedTask.id} • {selectedTask.jurisdiction}
                    </span>
                    <Badge status={selectedTask.status} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {selectedTask.title}
                  </h3>
                  {selectedTask.entityLabel && (
                    <span className="inline-block mt-1 text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                      Entity: {selectedTask.entityLabel}
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
                          ? 'Why is this task blocked?'
                          : selectedTask.status === 'COMPLETED'
                          ? 'Task Finished'
                          : 'Ready for Processing'}
                      </div>
                      <p>{selectedTask.blockerExplanation}</p>
                    </div>
                  </div>
                </div>

                {/* Direct & Transitive Blockers Section */}
                <div className="space-y-2 text-xs">
                  <div className="font-semibold text-slate-800">Prerequisite Dependencies:</div>
                  {selectedTask.dependencyIds.length === 0 ? (
                    <div className="text-slate-500 italic p-2 bg-slate-50 rounded border border-slate-200">
                      Zero prerequisites. Can start immediately.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedTask.dependencyIds.map((depId) => {
                        const dep = tasks.find((t) => t.id === depId);
                        const isDepComplete = dep?.status === 'COMPLETED';
                        return (
                          <div
                            key={depId}
                            onClick={() => setSelectedTaskId(depId)}
                            className="flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {isDepComplete ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-rose-500" />
                              )}
                              <span className="font-medium text-slate-800">
                                {dep?.title || depId}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
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
                      Estimated Fee
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
                    <span className="text-[10px] text-slate-400">RTO estimate</span>
                  </div>
                </div>

                {/* Document Checklist Preview */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-semibold text-slate-800">Required Documents:</span>
                  {selectedTask.requiredDocuments.length === 0 ? (
                    <p className="text-slate-500 italic text-[11px]">No physical documents required.</p>
                  ) : (
                    <ul className="space-y-1">
                      {selectedTask.requiredDocuments.map((doc) => (
                        <li key={doc.name} className="flex items-center gap-2 text-[11px] text-slate-700">
                          <FileText className="w-3 h-3 text-slate-400" />
                          <span className="truncate">{doc.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Select any node on the graph to inspect prerequisites.</p>
            )}

            {/* Bottom Contextual Action */}
            {selectedTask && (
              <div className="pt-4 border-t border-slate-100">
                {selectedTask.status === 'BLOCKED' ? (
                  <div>
                    {selectedTask.directBlockers && selectedTask.directBlockers.length > 0 && (
                      <Button
                        variant="primary"
                        size="md"
                        className="w-full text-xs"
                        onClick={() => {
                          const firstBlocker = selectedTask.directBlockers![0];
                          onCompleteTask(firstBlocker);
                        }}
                      >
                        <Zap className="w-3.5 h-3.5 mr-1.5" />
                        One-Click Resolve Prerequisite ("{selectedTask.directBlockers[0].replace('TASK-', '')}")
                      </Button>
                    )}
                    <p className="text-[10px] text-slate-400 text-center mt-1.5">
                      Resolving prerequisite updates the graph and unlocks dependent tasks live.
                    </p>
                  </div>
                ) : selectedTask.status === 'COMPLETED' ? (
                  <div className="text-center text-xs font-semibold text-emerald-700 bg-emerald-50 py-2 rounded-lg border border-emerald-200">
                    ✓ Prerequisite Satisfied
                  </div>
                ) : (
                  <Button
                    variant="success"
                    size="md"
                    className="w-full text-xs"
                    onClick={() => onCompleteTask(selectedTask.id)}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    Complete This Task ({selectedTask.title})
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Accessible Linear List View for Screen Readers & Mobile */
        <div className="space-y-3 bg-white p-5 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-600 mb-2">
            Sequential task order computed by Topological Sort (Kahn's algorithm). Complete upstream tasks to unlock downstream services.
          </div>
          <div className="space-y-3">
            {graphData.topologicalOrder.map((taskId, stepIdx) => {
              const task = tasks.find((t) => t.id === taskId);
              if (!task) return null;
              return (
                <div
                  key={taskId}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    task.status === 'COMPLETED'
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : task.status === 'BLOCKED'
                      ? 'bg-rose-50/50 border-rose-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                        {stepIdx + 1}
                      </span>
                      <h4 className="font-semibold text-sm text-slate-900">{task.title}</h4>
                      <Badge status={task.status} />
                    </div>
                    <p className="text-xs text-slate-600 pl-7">{task.blockerExplanation}</p>
                    <div className="text-[11px] text-slate-400 pl-7 flex items-center gap-3">
                      <span>Fee: ₹{task.estimatedFee}</span>
                      <span>Processing: {task.processingDays} days</span>
                      <span>Prerequisites: {task.dependencyIds.length > 0 ? task.dependencyIds.join(', ') : 'None'}</span>
                    </div>
                  </div>

                  <div className="shrink-0 pl-7 sm:pl-0">
                    {task.status === 'READY' && (
                      <Button size="sm" variant="primary" onClick={() => onCompleteTask(task.id)}>
                        Complete Step
                      </Button>
                    )}
                    {task.status === 'COMPLETED' && (
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Finished
                      </span>
                    )}
                    {task.status === 'BLOCKED' && (
                      <span className="text-xs text-rose-700 font-medium">Waiting for prerequisites</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
