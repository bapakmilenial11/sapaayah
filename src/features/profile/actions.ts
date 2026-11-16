'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter').max(100, 'Nama terlalu panjang'),
  phone: z.string().min(8, 'Nomor WhatsApp minimal 8 digit').max(20, 'Nomor terlalu panjang'),
  city: z.string().max(100, 'Nama kota terlalu panjang').optional().nullable(),
});

export interface UpdateProfileResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export async function updateProfileAction(
  prevState: UpdateProfileResult | null,
  formData: FormData
): Promise<UpdateProfileResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Sesi Anda telah berakhir. Silakan login kembali.' };
    }

    const rawData = {
      fullName: formData.get('fullName') as string,
      phone: formData.get('phone') as string,
      city: (formData.get('city') as string) || null,
    };

    const parsed = updateProfileSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: 'Mohon periksa data input Anda.',
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const supabase = await createClient();

    // 1. Update profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (profileError) {
      return { success: false, message: `Gagal memperbarui profil: ${profileError.message}` };
    }

    // 2. Update participants table jika ada
    await supabase
      .from('participants')
      .update({
        full_name: parsed.data.fullName,
        normalized_name: parsed.data.fullName.toLowerCase().trim(),
        phone: parsed.data.phone,
        city: parsed.data.city,
        updated_at: new Date().toISOString(),
      })
      .eq('profile_id', user.id);

    revalidatePath('/portal/profil');
    revalidatePath('/portal');

    return { success: true, message: 'Profil Anda berhasil diperbarui.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Terjadi kesalahan sistem.' };
  }
}

