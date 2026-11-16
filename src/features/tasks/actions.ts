'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/session';
import { createTaskSchema, updateTaskStatusSchema } from './schemas';
import { revalidatePath } from 'next/cache';

export interface TaskActionResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: any;
}

/**
 * 1. Server Action: Membuat Tugas Operasional Baru
 * - Wewenang: tasks.manage_all, super_admin, ketua
 */
export async function createTaskAction(
  prevState: TaskActionResult | null,
  formData: FormData
): Promise<TaskActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Sesi Anda telah berakhir. Silakan login kembali.' };
    }

    const canCreate =
      user.roles.includes('super_admin') ||
      user.roles.includes('ketua') ||
      user.permissions.includes('tasks.manage_all');

    if (!canCreate) {
      return {
        success: false,
        message: 'Akses Ditolak: Anda tidak memiliki wewenang untuk membuat tugas operasional.',
      };
    }

    const assigneeRaw = formData.getAll('assignee_ids');
    const rawData = {
      title: formData.get('title'),
      description: formData.get('description'),
      priority: formData.get('priority'),
      due_at: formData.get('due_at') ? new Date(formData.get('due_at') as string).toISOString() : null,
      assignee_ids: assigneeRaw.filter(Boolean),
    };

    const parsed = createTaskSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: 'Validasi form pembuatan tugas gagal.',
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { title, description, priority, due_at, assignee_ids } = parsed.data;
    const supabase = await createClient();

    // 1. Insert task
    const { data: newTask, error: taskErr } = await supabase
      .from('tasks')
      .insert({
        title,
        description: description || null,
        priority,
        status: 'todo',
        due_at: due_at || null,
        created_by: user.id,
      })
      .select('id, title')
      .single();

    if (taskErr || !newTask) {
      return { success: false, message: `Gagal membuat tugas: ${taskErr?.message}` };
    }

    // 2. Insert assignments jika ada
    if (assignee_ids && assignee_ids.length > 0) {
      const assignments = assignee_ids.map((aid) => ({
        task_id: newTask.id,
        assignee_id: aid,
        assigned_by: user.id,
      }));

      await supabase.from('task_assignments').insert(assignments);
    }

    revalidatePath('/dashboard/tugas');
    return {
      success: true,
      message: `Tugas "${newTask.title}" berhasil dibuat.`,
      data: newTask,
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Terjadi kesalahan sistem saat membuat tugas.' };
  }
}

/**
 * 2. Server Action: Memperbarui Status Tugas & Menambahkan Catatan Progres
 * - Wewenang: Pengguna yang di-assign ATAU admin (tasks.manage_all)
 */
export async function updateTaskStatusAction(input: {
  task_id: string;
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  progress_percent?: number;
  notes: string;
}): Promise<TaskActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Sesi Anda telah berakhir. Silakan login kembali.' };
    }

    const parsed = updateTaskStatusSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: 'Validasi pembaruan tugas gagal.',
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { task_id, status, progress_percent, notes } = parsed.data;
    const supabase = await createClient();

    // Verifikasi apakah pengguna berwenang (admin atau assignee)
    const isAdmin =
      user.roles.includes('super_admin') ||
      user.roles.includes('ketua') ||
      user.permissions.includes('tasks.manage_all');

    if (!isAdmin) {
      const { data: assignment } = await supabase
        .from('task_assignments')
        .select('task_id')
        .eq('task_id', task_id)
        .eq('assignee_id', user.id)
        .maybeSingle();

      if (!assignment) {
        return {
          success: false,
          message: 'Akses Ditolak: Anda bukan personel yang ditugaskan untuk tugas ini.',
        };
      }
    }

    // 1. Update status pada tabel tasks
    const { error: updateErr } = await supabase
      .from('tasks')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', task_id);

    if (updateErr) {
      return { success: false, message: `Gagal memperbarui status tugas: ${updateErr.message}` };
    }

    // 2. Insert ke task_updates sebagai riwayat progres
    await supabase.from('task_updates').insert({
      task_id,
      logged_by: user.id,
      progress_percent: progress_percent ?? (status === 'completed' ? 100 : 50),
      notes,
    });

    revalidatePath('/dashboard/tugas');
    return {
      success: true,
      message: 'Status dan progres tugas berhasil diperbarui.',
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Terjadi kesalahan sistem saat memperbarui tugas.' };
  }
}

