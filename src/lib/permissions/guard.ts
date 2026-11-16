import { getCurrentUser } from '@/lib/auth/session';
import { PermissionCode, RoleCode } from '@/lib/permissions/constants';
import { UserProfile } from '@/types';

/**
 * Memeriksa apakah pengguna aktif memiliki izin (permission) tertentu.
 * Mengembalikan boolean.
 */
export async function hasPermission(permission: PermissionCode): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user || user.accountStatus !== 'active') {
    return false;
  }

  // Super admin selalu memiliki seluruh hak akses
  if (user.roles.includes('super_admin')) {
    return true;
  }

  return user.permissions.includes(permission);
}

/**
 * Memeriksa apakah pengguna aktif memiliki salah satu dari peran (role) tertentu.
 */
export async function hasRole(role: RoleCode): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user || user.accountStatus !== 'active') {
    return false;
  }

  return user.roles.includes(role);
}

/**
 * Server-side authorization guard.
 * Melemparkan error (atau redirect) jika pengguna tidak memiliki izin.
 * Mengembalikan objek UserProfile jika berwenang.
 */
export async function assertPermission(permission: PermissionCode): Promise<UserProfile> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('UNAUTHENTICATED: Pengguna belum masuk ke sistem.');
  }

  if (user.accountStatus !== 'active') {
    throw new Error('FORBIDDEN: Akun Anda sedang dinonaktifkan atau ditangguhkan.');
  }

  if (user.roles.includes('super_admin')) {
    return user;
  }

  if (!user.permissions.includes(permission)) {
    throw new Error(`UNAUTHORIZED: Anda tidak memiliki izin [${permission}] untuk melakukan tindakan ini.`);
  }

  return user;
}

