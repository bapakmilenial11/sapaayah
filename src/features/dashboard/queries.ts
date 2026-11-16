import { createClient } from '@/lib/supabase/server';
import { UserProfile } from '@/types';

export interface DashboardMetrics {
  totalPrograms: number;
  totalBatches: number;
  totalParticipants: number;
  pendingPayments: number;
  activeTasks: number;
  totalAuditLogs: number;
}

export async function getDashboardMetrics(user: UserProfile): Promise<DashboardMetrics> {
  const supabase = await createClient();

  const metrics: DashboardMetrics = {
    totalPrograms: 0,
    totalBatches: 0,
    totalParticipants: 0,
    pendingPayments: 0,
    activeTasks: 0,
    totalAuditLogs: 0,
  };

  try {
    // 1. Programs count
    const { count: progCount } = await supabase
      .from('programs')
      .select('id', { count: 'exact', head: true });
    metrics.totalPrograms = progCount || 0;

    // 2. Batches count
    const { count: batchCount } = await supabase
      .from('program_batches')
      .select('id', { count: 'exact', head: true });
    metrics.totalBatches = batchCount || 0;

    // 3. Participants count (jika berwenang)
    if (user.roles.includes('super_admin') || user.permissions.includes('participants.view_all')) {
      const { count: partCount } = await supabase
        .from('participants')
        .select('id', { count: 'exact', head: true });
      metrics.totalParticipants = partCount || 0;
    }

    // 4. Pending payments count (jika berwenang)
    if (user.roles.includes('super_admin') || user.permissions.includes('payments.view_all')) {
      const { count: payCount } = await supabase
        .from('payments')
        .select('id', { count: 'exact', head: true })
        .in('status', ['submitted', 'under_review']);
      metrics.pendingPayments = payCount || 0;
    }

    // 5. Active tasks count
    if (user.roles.includes('super_admin') || user.permissions.includes('tasks.manage_all')) {
      const { count: taskCount } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .in('status', ['todo', 'in_progress']);
      metrics.activeTasks = taskCount || 0;
    }

    // 6. Audit logs count (khusus super_admin/ketua)
    if (user.roles.includes('super_admin') || user.permissions.includes('audit_logs.view')) {
      const { count: auditCount } = await supabase
        .from('audit_logs')
        .select('id', { count: 'exact', head: true });
      metrics.totalAuditLogs = auditCount || 0;
    }
  } catch {
    // Fallback gracefully on query error
  }

  return metrics;
}

