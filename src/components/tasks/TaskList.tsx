'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { TaskItem } from '@/features/tasks/queries';
import { updateTaskStatusAction } from '@/features/tasks/actions';
import { TaskStatus } from '@/features/tasks/schemas';
import { formatDateTimeIndonesia } from '@/lib/utils';
import { CheckSquare, Clock, User, AlertCircle, ArrowUpRight, CheckCircle2, RotateCw } from 'lucide-react';

interface TaskListProps {
  tasks: TaskItem[];
  canManageAll: boolean;
}

export function TaskList({ tasks, canManageAll }: TaskListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [newStatus, setNewStatus] = useState<TaskStatus>('in_progress');
  const [progressNotes, setProgressNotes] = useState('');
  const [updateMsg, setUpdateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const getPriorityBadge = (priority: TaskItem['priority']) => {
    switch (priority) {
      case 'urgent':
        return <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800 uppercase">Urgent</span>;
      case 'high':
        return <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase">High</span>;
      case 'medium':
        return <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800 uppercase">Medium</span>;
      default:
        return <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700 uppercase">Low</span>;
    }
  };

  const getStatusBadge = (status: TaskItem['status']) => {
    switch (status) {
      case 'completed':
        return <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">Selesai</span>;
      case 'in_progress':
        return <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800 animate-pulse">Dikerjakan</span>;
      case 'cancelled':
        return <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-800">Dibatalkan</span>;
      default:
        return <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">Menunggu (Todo)</span>;
    }
  };

  const handleOpenUpdateModal = (task: TaskItem) => {
    setSelectedTask(task);
    setNewStatus(task.status === 'todo' ? 'in_progress' : task.status);
    setProgressNotes('');
    setUpdateMsg(null);
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    if (progressNotes.trim().length < 3) {
      setUpdateMsg({ type: 'error', text: 'Catatan pembaruan tugas wajib diisi minimal 3 karakter.' });
      return;
    }

    startTransition(async () => {
      const res = await updateTaskStatusAction({
        task_id: selectedTask.id,
        status: newStatus,
        notes: progressNotes.trim(),
      });

      if (res.success) {
        setUpdateMsg({ type: 'success', text: res.message || 'Status tugas diperbarui.' });
        setTimeout(() => {
          setSelectedTask(null);
          router.refresh();
        }, 800);
      } else {
        setUpdateMsg({ type: 'error', text: res.message || 'Gagal memperbarui tugas.' });
      }
    });
  };

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#E8F0F5] bg-white p-8 text-center text-xs text-[#252D35]/60">
        Belum ada tugas operasional yang terdaftar.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="rounded-xl border border-[#E8F0F5] bg-white p-5 shadow-sm space-y-3 hover:border-[#547F9F]/40 transition"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8F0F5] pb-2.5">
            <div className="flex flex-wrap items-center gap-2">
              {getPriorityBadge(task.priority)}
              <h4 className="text-sm font-bold text-[#385A75]">{task.title}</h4>
              {getStatusBadge(task.status)}
            </div>

            <button
              type="button"
              onClick={() => handleOpenUpdateModal(task)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3 py-1.5 text-xs font-semibold text-[#385A75] hover:bg-[#E8F0F5] hover:text-[#547F9F] transition self-start sm:self-auto"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Update Status</span>
            </button>
          </div>

          {task.description && (
            <p className="text-xs text-[#252D35]/80 whitespace-pre-line leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-[11px] text-[#252D35]/65">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-[#547F9F]" />
              <span>
                PIC Penugasan:{' '}
                <strong className="text-[#385A75]">
                  {task.assignees.length > 0
                    ? task.assignees.map((a) => a.full_name).join(', ')
                    : 'Belum ditugaskan'}
                </strong>
              </span>
            </div>

            {task.due_at && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                <span>Tenggat: <strong className="text-amber-800">{formatDateTimeIndonesia(task.due_at)}</strong></span>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Modal Dialog Update Status */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8F0F5] pb-3">
              <h3 className="text-sm font-bold text-[#385A75]">Update Status Tugas</h3>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="text-xs text-[#252D35]/50 hover:text-[#252D35]"
              >
                Tutup
              </button>
            </div>

            <div className="text-xs text-[#252D35]">
              <div className="font-semibold text-[#385A75]">{selectedTask.title}</div>
            </div>

            {updateMsg && (
              <div
                className={`p-2.5 rounded-lg text-xs font-medium border ${
                  updateMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {updateMsg.text}
              </div>
            )}

            <form onSubmit={handleSaveStatus} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#385A75] mb-1">
                  Status Baru *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
                  className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3 py-2 text-xs text-[#252D35] focus:outline-none"
                >
                  <option value="todo">Menunggu (Todo)</option>
                  <option value="in_progress">Sedang Dikerjakan (In Progress)</option>
                  <option value="completed">Selesai (Completed)</option>
                  <option value="cancelled">Dibatalkan (Cancelled)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#385A75] mb-1">
                  Catatan Pembaruan & Progres *
                </label>
                <textarea
                  required
                  rows={3}
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  placeholder="Ceritakan progres kerja atau catatan penuntasan tugas..."
                  className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3 py-2 text-xs text-[#252D35] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-[#252D35]/70 hover:bg-[#F5F7F8]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-[#547F9F] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#385A75] transition disabled:opacity-50"
                >
                  {isPending ? 'Menyimpan...' : 'Simpan Pembaruan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

