import { getCurrentUser } from '@/lib/auth/session';
import { assertPermission } from '@/lib/permissions/guard';
import { getTasksForDashboard, getActiveStaffProfiles } from '@/features/tasks/queries';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskFormModal } from '@/components/tasks/TaskFormModal';
import { StatCard } from '@/components/dashboard/StatCard';
import { CheckSquare, Clock, CheckCircle, AlertTriangle, Layers } from 'lucide-react';

export default async function TasksPage() {
  const user = await getCurrentUser();
  const { tasks, canManageAll } = await getTasksForDashboard();
  const staffList = canManageAll ? await getActiveStaffProfiles() : [];

  const totalTasks = tasks.length;
  const todoCount = tasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F0F5] text-[#547F9F]">
              <CheckSquare className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#385A75]">
              Tugas & Operasional
            </h1>
          </div>
          <p className="text-xs text-[#252D35]/70 mt-1">
            {canManageAll
              ? 'Manajemen penugasan operasional kerja seluruh pengurus dan relawan yayasan.'
              : 'Daftar tugas kerja dan tanggung jawab operasional yang ditugaskan kepada Anda.'}
          </p>
        </div>

        {canManageAll && <TaskFormModal staffList={staffList} />}
      </div>

      {/* Grid Statistik Tugas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tugas"
          value={totalTasks}
          subtitle="Tugas terdata"
          icon={Layers}
          variant="primary"
        />
        <StatCard
          title="Menunggu (Todo)"
          value={todoCount}
          subtitle="Belum dimulai"
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Sedang Dikerjakan"
          value={inProgressCount}
          subtitle="Dalam proses eksekusi"
          icon={AlertTriangle}
          variant="info"
        />
        <StatCard
          title="Tuntas (Selesai)"
          value={completedCount}
          subtitle="Berhasil diselesaikan"
          icon={CheckCircle}
          variant="success"
        />
      </div>

      {/* List Tugas Operasional */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-[#E8F0F5] pb-2">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-[#547F9F]" />
            <h3 className="text-sm font-bold text-[#385A75]">Daftar Tugas Kerja</h3>
          </div>
          <span className="text-xs text-[#252D35]/60 font-medium">
            Total {tasks.length} Tugas
          </span>
        </div>

        <TaskList tasks={tasks} canManageAll={canManageAll} />
      </div>
    </div>
  );
}

