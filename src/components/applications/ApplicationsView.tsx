// src/components/applications/ApplicationsView.tsx
import React, { useState } from 'react';
import {
  FileCheck,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  ArrowRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { WorkflowTask } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface ApplicationsViewProps {
  tasks: WorkflowTask[];
  onCompleteTask: (taskId: string) => void;
  onUpdateStatus: (taskId: string, status: any, reason?: string) => void;
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  tasks,
  onCompleteTask,
  onUpdateStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'EXCEPTION'>('ALL');
  const [resolvingTask, setResolvingTask] = useState<WorkflowTask | null>(null);
  const [withdrawingTask, setWithdrawingTask] = useState<WorkflowTask | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'ACTIVE') return t.status === 'READY' || t.status === 'IN_PROGRESS' || t.status === 'PENDING' || t.status === 'BLOCKED';
    if (activeTab === 'COMPLETED') return t.status === 'COMPLETED';
    if (activeTab === 'EXCEPTION') return t.status === 'REJECTED' || t.status === 'FAILED' || t.status === 'WITHDRAWN';
    return true;
  });

  const handleRefresh = (taskId: string) => {
    setIsRefreshing(taskId);
    setTimeout(() => {
      setIsRefreshing(null);
    }, 600);
  };

  const handleConfirmWithdraw = () => {
    if (withdrawingTask) {
      onUpdateStatus(withdrawingTask.id, 'WITHDRAWN', 'Citizen requested application withdrawal.');
      setWithdrawingTask(null);
    }
  };

  const handleConfirmResolve = () => {
    if (resolvingTask) {
      onUpdateStatus(
        resolvingTask.id,
        'READY',
        resolutionNote || 'Uploaded corrected document proof via citizen resolution modal.'
      );
      setResolvingTask(null);
      setResolutionNote('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Application State Tracker</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              State Machine Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracks real-time status across Parivahan (Vahan & Sarathi) services. Handles rejections, missing documents, and withdrawals safely.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200 text-xs">
          {(['ALL', 'ACTIVE', 'COMPLETED', 'EXCEPTION'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === tab
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'ALL'
                ? `All (${tasks.length})`
                : tab === 'ACTIVE'
                ? 'In Progress'
                : tab === 'COMPLETED'
                ? 'Completed'
                : 'Exceptions'}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => {
          const isPending = task.status === 'PENDING';
          const isBlocked = task.status === 'BLOCKED';
          const isRejected = task.status === 'REJECTED';
          const isCompleted = task.status === 'COMPLETED';

          return (
            <div
              key={task.id}
              className={`bg-white rounded-xl border p-5 shadow-xs transition-all ${
                isRejected
                  ? 'border-rose-300 bg-rose-50/20'
                  : isBlocked
                  ? 'border-slate-200'
                  : isCompleted
                  ? 'border-emerald-200 bg-emerald-50/10'
                  : 'border-blue-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400 font-semibold">
                      {task.id}
                    </span>
                    <h3 className="font-bold text-base text-slate-900">{task.title}</h3>
                    <Badge status={task.status} />
                  </div>

                  {/* Blocker explanation or rejection reason */}
                  {isRejected ? (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">Application Rejection Reason:</div>
                        <p>{task.rejectionReason || 'Document mismatch or compliance failure.'}</p>
                      </div>
                    </div>
                  ) : isBlocked ? (
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Prerequisite Required:</span>{' '}
                        {task.blockerExplanation}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {task.blockerExplanation}
                    </p>
                  )}

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>
                      Jurisdiction: <strong>{task.jurisdiction}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Est Fee: <strong>₹{task.estimatedFee}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Processing: <strong>{task.processingDays} days</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Last checked:{' '}
                      <strong className="text-slate-700">
                        {new Date(task.lastUpdated).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="shrink-0 flex sm:flex-col items-end gap-2">
                  {/* Status Refresh Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs text-slate-600 hover:text-slate-900"
                    onClick={() => handleRefresh(task.id)}
                    isLoading={isRefreshing === task.id}
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    Refresh Status
                  </Button>

                  {/* Resolve Button for Blocked or Rejected */}
                  {(isBlocked || isRejected) && (
                    <Button
                      size="sm"
                      variant="primary"
                      className="text-xs"
                      onClick={() => setResolvingTask(task)}
                    >
                      <Zap className="w-3.5 h-3.5 mr-1" />
                      Resolve Blocker
                    </Button>
                  )}

                  {/* Complete Button for Ready tasks */}
                  {task.status === 'READY' && (
                    <Button
                      size="sm"
                      variant="success"
                      className="text-xs"
                      onClick={() => onCompleteTask(task.id)}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Mark Complete
                    </Button>
                  )}

                  {/* Withdraw Button */}
                  {!isCompleted && task.status !== 'WITHDRAWN' && (
                    <button
                      onClick={() => setWithdrawingTask(task)}
                      className="text-xs text-slate-400 hover:text-rose-600 transition-colors underline pt-1 cursor-pointer"
                    >
                      Withdraw Request
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resolution Modal */}
      {resolvingTask && (
        <Modal
          isOpen={!!resolvingTask}
          onClose={() => setResolvingTask(null)}
          title={`Resolve Blocker: ${resolvingTask.title}`}
          description="Address compliance mismatches or re-upload corrected identity/address documents to transition application back to READY state."
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setResolvingTask(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleConfirmResolve}>
                Submit Resolution & Re-Evaluate
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
              <strong>Current Issue:</strong> {resolvingTask.rejectionReason || resolvingTask.blockerExplanation}
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Resolution Statement / Corrected Document Note:
              </label>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="e.g. Uploaded gazetted name change notification and updated electricity bill matching Aadhaar address..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-700 block mb-1">Mock Document Upload:</span>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center text-slate-500 hover:border-blue-400 cursor-pointer bg-white">
                <FileText className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <span className="font-medium text-slate-800">Click to upload corrected document PDF</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Simulated safe upload (Max 2MB, PDF/JPEG)</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Withdraw Confirmation Modal */}
      {withdrawingTask && (
        <Modal
          isOpen={!!withdrawingTask}
          onClose={() => setWithdrawingTask(null)}
          title="Confirm Application Withdrawal"
          description={`Are you sure you wish to withdraw "${withdrawingTask.title}"?`}
          maxWidth="md"
          footer={
            <div className="flex items-center justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setWithdrawingTask(null)}>
                Keep Application
              </Button>
              <Button size="sm" variant="danger" onClick={handleConfirmWithdraw}>
                Yes, Withdraw Application
              </Button>
            </div>
          }
        >
          <div className="space-y-3 text-xs text-slate-700">
            <p>
              Withdrawing will transition the task to <strong>WITHDRAWN</strong> status and update the dependency graph. Any downstream services depending on this task will become blocked.
            </p>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-500">
              Note: This action records an audit log event. You can initiate a clean draft in the future.
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
