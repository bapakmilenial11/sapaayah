import { createClient } from '@/lib/supabase/server';
import { UserProfile } from '@/types';
import { RoleCode, PermissionCode } from '@/lib/permissions/constants';
import { cache } from 'react';

/**
 * Mendapatkan data pengguna yang sedang login beserta profil, peran (roles),
 * dan daftar izin (permissions) yang diotorisasi.
 * Dibungkus dengan React.cache() untuk memoization per request.
 * Dibuat sangat tangguh terhadap kegagalan query relasi agar tidak pernah melempar unhandled exception.
 */
export const getCurrentUser = cache(async (): Promise<UserProfile | null> => {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // 1. Ambil data profil
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, display_name, phone, avatar_path, account_status')
      .eq('id', user.id)
      .maybeSingle();

    // 2. Ambil peran pengguna
    const { data: userRolesData } = await supabase
      .from('user_roles')
      .select('roles(code)')
      .eq('user_id', user.id);

    const roles: RoleCode[] = [];
    if (userRolesData) {
      for (const ur of userRolesData as any[]) {
        if (ur.roles?.code) {
          roles.push(ur.roles.code as RoleCode);
        }
      }
    }

    // 3. Ambil permissions pengguna
    const permissionSet = new Set<PermissionCode>();
    try {
      const { data: permData } = await supabase
        .from('user_roles')
        .select('roles!inner(role_permissions!inner(permissions!inner(code)))')
        .eq('user_id', user.id);

      if (permData) {
        for (const item of permData as any[]) {
          const rolePerms = item.roles?.role_permissions || [];
          for (const rp of rolePerms) {
            if (rp.permissions?.code) {
              permissionSet.add(rp.permissions.code as PermissionCode);
            }
          }
        }
      }
    } catch {
      // Jika relasi bertingkat gagal, abaikan permission ekstra
    }

    // Fallback: Jika Super Admin, berikan semua permission inti
    if (roles.includes('super_admin')) {
      permissionSet.add('system.manage' as PermissionCode);
      permissionSet.add('settings.view' as PermissionCode);
      permissionSet.add('settings.manage' as PermissionCode);
      permissionSet.add('programs.view' as PermissionCode);
      permissionSet.add('programs.manage' as PermissionCode);
      permissionSet.add('participants.view_all' as PermissionCode);
      permissionSet.add('payments.view_all' as PermissionCode);
      permissionSet.add('weekly_reports.submit' as PermissionCode);
      permissionSet.add('weekly_reports.view_all' as PermissionCode);
      permissionSet.add('audit_logs.view' as PermissionCode);
      permissionSet.add('tasks.manage_all' as PermissionCode);
    }

    return {
      id: user.id,
      fullName: profile?.full_name || (user.user_metadata?.full_name as string) || 'Pengguna SAPA Ayah',
      displayName: profile?.display_name || user.email?.split('@')[0] || 'User',
      phone: profile?.phone || (user.user_metadata?.phone as string) || null,
      avatarPath: profile?.avatar_path || null,
      accountStatus: (profile?.account_status as any) || 'active',
      roles: roles.length > 0 ? roles : ['peserta' as RoleCode],
      permissions: Array.from(permissionSet),
    };
  } catch (err) {
    console.error('Error resolving getCurrentUser:', err);
    return null;
  }
});
