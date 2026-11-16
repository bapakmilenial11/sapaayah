import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/session';
import { TaskPriority, TaskStatus } from './schemas';

export interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  assignees: {
    id: string;
    full_name: string;
  }[];
  updates_count?: number;
}

/**
 * Mengambil daftar staf/pengurus aktif untuk pilihan assignee di form penugasan
 */
export async function getActiveStaffProfiles(): Promise<{ id: string; full_name: string }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('account_status', 'active')
    .eq('is_archived', false)
    .order('full_name', { ascending: true });

  return data || [];
}

/**
 * 1. Query: Mengambil daftar tugas berdasarkan hak akses pengguna
 * - Admin/Super Admin (tasks.manage_all): melihat seluruh tugas
 * - Pengurus/Staf: melihat tugas yang ditugaskan kepada dirinya ATAU tugas yang dia buat
 */
export async function getTasksForDashboard(): Promise<{
  tasks: TaskItem[];
  canManageAll: boolean;
}> {
  const user = await getCurrentUser();
  if (!user) {
    return { tasks: [], canManageAll: false };
  }

  const canManageAll =
    user.roles.includes('super_admin') ||
    user.roles.includes('ketua') ||
    user.permissions.includes('tasks.manage_all');

  const supabase = await createClient();

  // Query seluruh tasks dengan relasi assignees via task_assignments
  const { data, error } = await supabase
    .from('tasks')
    .select(
      `
      id,
      title,
      description,
      priority,
      status,
      due_at,
      created_by,
      created_at,
      updated_at,
      task_assignments(
        assignee:profiles!task_assignments_assignee_id_fkey(
          id,
          full_name
        )
      )
    `
    )
    .eq('is_archived', false)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Gagal memuat daftar tugas: ${error.message}`);
  }

  const formatted: TaskItem[] = (data || []).map((row: any) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    status: row.status,
    due_at: row.due_at,
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
    assignees: (row.task_assignments || [])
      .map((ta: any) => ta.assignee)
      .filter(Boolean),
  }));

  // Jika bukan admin, saring hanya tugas yang di-assign ke user atau dibuat oleh user
  const filtered = canManageAll
    ? formatted
    : formatted.filter(
        (t) =>
          t.created_by === user.id ||
          t.assignees.some((a) => a.id === user.id)
      );

  return {
    tasks: filtered,
    canManageAll,
  };
}

