'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} from './schemas';

export interface AuthActionResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Validasi sanitasi URL redirect untuk mencegah Open Redirect vulnerability.
 * Hanya mengizinkan path relatif internal yang valid (dimulai dengan '/') dan bukan '//'.
 */
function sanitizeRedirectUrl(url: string | null | undefined, fallback: string = '/portal'): string {
  if (!url) return fallback;
  const trimmed = url.trim();

  // Larang URL absolut (misal: http://, https://, javascript:, data:)
  // Larang protocol-relative URL (misal: //evil.com)
  if (
    trimmed.startsWith('/') &&
    !trimmed.startsWith('//') &&
    !trimmed.includes('\\') &&
    !trimmed.includes('://')
  ) {
    return trimmed;
  }

  return fallback;
}

/**
 * Server Action: Login Pengguna
 */
export async function loginAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData: Record<string, any> = {};
  formData.forEach((value, key) => {
    rawData[key] = value;
  });

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validasi gagal. Periksa kembali isian Anda.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password, redirectTo: rawRedirect } = parsed.data;
  const supabase = await createClient();

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !authData.user) {
    return {
      success: false,
      message:
        error?.message === 'Invalid login credentials'
          ? 'Email atau kata sandi tidak sesuai.'
          : error?.message || 'Gagal masuk.',
    };
  }

  // 2. Validasi status akun sebelum memberikan akses
  const { data: profile } = await supabase
    .from('profiles')
    .select('account_status')
    .eq('id', authData.user.id)
    .single();

  if (profile && profile.account_status !== 'active') {
    // Putuskan sesi segera jika akun ditangguhkan atau tidak aktif
    await supabase.auth.signOut();
    return {
      success: false,
      message:
        profile.account_status === 'suspended'
          ? 'Akun Anda sedang ditangguhkan. Hubungi pengurus yayasan.'
          : 'Akun Anda tidak aktif.',
    };
  }

  const safeRedirect = sanitizeRedirectUrl(rawRedirect, '/portal');
  redirect(safeRedirect);
}

/**
 * Server Action: Pendaftaran Pengguna Baru (Peserta)
 */
export async function registerAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData: Record<string, any> = {};
  formData.forEach((value, key) => {
    rawData[key] = value;
  });

  const parsed = registerSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validasi pendaftaran gagal.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password, fullName, phone } = parsed.data;
  const supabase = await createClient();

  // Kirim pendaftaran ke Supabase Auth dengan metadata nama & telepon
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
      },
    },
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  // Otomatis assign peran default 'peserta' jika user berhasil dibuat
  if (data.user) {
    try {
      const adminClient = createAdminClient();
      const { data: pesertaRole } = await adminClient
        .from('roles')
        .select('id')
        .eq('code', 'peserta')
        .single();

      if (pesertaRole) {
        await adminClient.from('user_roles').insert({
          user_id: data.user.id,
          role_id: pesertaRole.id,
        });
      }
    } catch {
      // Non-blocking log if already handled by trigger/seed
    }
  }

  return {
    success: true,
    message:
      data.session
        ? 'Pendaftaran berhasil!'
        : 'Pendaftaran berhasil. Silakan periksa email Anda untuk verifikasi tautan akun.',
  };
}

/**
 * Server Action: Permintaan Reset Kata Sandi
 */
export async function resetPasswordAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData: Record<string, any> = {};
  formData.forEach((value, key) => {
    rawData[key] = value;
  });

  const parsed = resetPasswordSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Email tidak valid.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/lupa-password?mode=update`,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: true,
    message: 'Tautan pemulihan kata sandi telah dikirim ke email Anda.',
  };
}

/**
 * Server Action: Pembaruan Kata Sandi Baru
 */
export async function updatePasswordAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData: Record<string, any> = {};
  formData.forEach((value, key) => {
    rawData[key] = value;
  });

  const parsed = updatePasswordSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validasi kata sandi baru gagal.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { password } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: true,
    message: 'Kata sandi berhasil diperbarui. Silakan masuk menggunakan kata sandi baru Anda.',
  };
}

/**
 * Server Action: Keluar dari Sesi (Logout)
 */
export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
