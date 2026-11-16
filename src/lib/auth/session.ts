import { createClient } from '@/lib/supabase/server';
import { UserProfile } from '@/types';
import { RoleCode, PermissionCode } from '@/lib/permissions/constants';

/**
 * Mendapatkan data pengguna yang sedang login beserta profil, peran (roles),
 * dan daftar izin (permissions) yang diotorisasi.
 * Menggunakan session pengguna (bukan Service Role Key).
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  // 1. Ambil data profil
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, display_name, phone, avatar_path, account_status')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  // 2. Ambil peran (roles) pengguna
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('roles(code)')
    .eq('user_id', user.id);

  const roles: RoleCode[] = (userRoles || [])
    .map((ur: any) => ur.roles?.code)
    .filter(Boolean);

  // 3. Ambil daftar permissions pengguna melalui role_permissions
  // Menggunakan query berelasi
  const { data: rolePermissions } = await supabase
    .from('user_roles')
    .select('role_id, roles(code), roles!inner(role_permissions(permissions(code)))')
    .eq('user_id', user.id);

  const permissionSet = new Set<PermissionCode>();

  if (rolePermissions) {
    for (const ur of rolePermissions as any[]) {
      const perms = ur.roles?.role_permissions || [];
      for (const rp of perms) {
        if (rp.permissions?.code) {
          permissionSet.add(rp.permissions.code as PermissionCode);
        }
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
}

