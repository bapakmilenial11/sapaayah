import { createClient } from '@/lib/supabase/server';
import { UserProfile } from '@/types';
import { RoleCode, PermissionCode } from '@/lib/permissions/constants';
import { cache } from 'react';

/**
 * Mendapatkan data pengguna yang sedang login beserta profil, peran (roles),
 * dan daftar izin (permissions) yang diotorisasi.
 * Dibungkus dengan React.cache() untuk memoization per request,
 * dan menggunakan Promise.all() agar query dieksekusi secara paralel.
 */
export const getCurrentUser = cache(async (): Promise<UserProfile | null> => {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  // Eksekusi paralel: Ambil profil dan relasi roles/permissions dalam satu roundtrip
  const [profileResult, userRolesResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, display_name, phone, avatar_path, account_status')
      .eq('id', user.id)
      .single(),
    supabase
      .from('user_roles')
      .select('role_id, roles(code, role_permissions(permissions(code)))')
      .eq('user_id', user.id),
  ]);

  const profile = profileResult.data;
  if (!profile) {
    return null;
  }

  const rawUserRoles = userRolesResult.data || [];
  const roles: RoleCode[] = [];
  const permissionSet = new Set<PermissionCode>();

  for (const ur of rawUserRoles as any[]) {
    if (ur.roles?.code) {
      roles.push(ur.roles.code as RoleCode);
    }
    const perms = ur.roles?.role_permissions || [];
    for (const rp of perms) {
      if (rp.permissions?.code) {
        permissionSet.add(rp.permissions.code as PermissionCode);
      }
    }
  }

  return {
    id: profile.id,
    fullName: profile.full_name,
    displayName: profile.display_name,
    phone: profile.phone,
    avatarPath: profile.avatar_path,
    accountStatus: profile.account_status,
    roles,
    permissions: Array.from(permissionSet),
  };
});
