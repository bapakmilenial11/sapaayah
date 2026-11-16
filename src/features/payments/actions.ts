'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUser } from '@/lib/auth/session';
import { assertPermission } from '@/lib/permissions/guard';
import {
  submitPaymentProofSchema,
  verifyPaymentSchema,
} from './schemas';
import { revalidatePath } from 'next/cache';

export interface PaymentActionResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: any;
}

/**
 * Validasi Magic Bytes / File Signatures:
 * Memeriksa beberapa byte awal file untuk mendeteksi tipe file sesungguhnya,
 * bukan hanya mengandalkan ekstensi atau MIME type yang dikirimkan oleh browser.
 */
function validateFileSignature(buffer: Uint8Array): { valid: boolean; detectedMime?: string; ext?: string } {
  if (buffer.length < 4) {
    return { valid: false };
  }

  // 1. JPEG signature: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedMime: 'image/jpeg', ext: 'jpg' };
  }

  // 2. PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, detectedMime: 'image/png', ext: 'png' };
  }

  // 3. PDF signature: 25 50 44 46 (%PDF)
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return { valid: true, detectedMime: 'application/pdf', ext: 'pdf' };
  }

  return { valid: false };
}

/**
 * 1. Server Action: Membuat Invoice Pembayaran untuk Registrasi
 * Nominal diambil langsung dari database (program_batches.price), TIDAK dipercaya dari client.
 */
export async function createPaymentInvoiceAction(
  registrationId: string
): Promise<PaymentActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Silakan masuk ke akun Anda.' };
    }

    const supabase = await createClient();

    // 1. Ambil data registrasi dan harga batch terkait
    const { data: reg, error: regErr } = await supabase
      .from('registrations')
      .select('id, participant_id, batch_id, status, program_batches(price, name)')
      .eq('id', registrationId)
      .single();

    if (regErr || !reg) {
      return { success: false, message: 'Data pendaftaran tidak ditemukan.' };
    }

    // 2. Cegah invoice ganda untuk satu pendaftaran
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id, amount_due, status')
      .eq('registration_id', registrationId)
      .maybeSingle();

    if (existingPayment) {
      return {
        success: true,
        message: 'Invoice pembayaran sudah tersedia.',
        data: existingPayment,
      };
    }

    // 3. Ambil rekening aktif resmi (BSI)
    const { data: instruction } = await supabase
      .from('payment_instructions')
      .select('id')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (!instruction) {
      return {
        success: false,
        message: 'Rekening pembayaran resmi yayasan belum dikonfigurasi.',
      };
    }

    const batchPrice = Number((reg as any).program_batches?.price || 0);

    // Jika program gratis (Rp 0), status pembayaran langsung verified
    const isFree = batchPrice === 0;
    const uniqueCode = isFree ? 0 : Math.floor(100 + Math.random() * 900); // 3 digit kode unik
    const totalAmount = batchPrice + (isFree ? 0 : uniqueCode);

    const { data: payment, error: payErr } = await supabase
      .from('payments')
      .insert({
        registration_id: registrationId,
        instruction_id: instruction.id,
        amount_due: totalAmount,
        unique_code: uniqueCode,
        status: isFree ? 'verified' : 'pending',
      })
      .select('id, amount_due, status')
      .single();

    if (payErr || !payment) {
      return { success: false, message: `Gagal membuat tagihan: ${payErr?.message}` };
    }

    // Jika gratis, langsung set status registrasi accepted
    if (isFree) {
      await supabase
        .from('registrations')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', registrationId);
    }

    revalidatePath('/portal');
    return {
      success: true,
      message: isFree ? 'Pendaftaran gratis telah dikonfirmasi.' : 'Tagihan pembayaran berhasil dibuat.',
      data: payment,
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Terjadi kesalahan sistem.' };
  }
}

/**
 * 2. Server Action: Unggah Bukti Transfer oleh Peserta
 * - Memeriksa kepemilikan pembayaran melalui relasi RLS
 * - Validasi batas ukuran file 2 MB & tipe MIME yang diizinkan
 * - VALIDASI MAGIC BYTES (Signature File Nyata: JPEG, PNG, PDF)
 * - Simpan ke path privat: private-payment-proofs/<user.id>/<filename>
 * - Rollback berkas di storage jika operasi database gagal
 */
export async function submitPaymentProofAction(
  prevState: PaymentActionResult | null,
  formData: FormData
): Promise<PaymentActionResult> {
  let uploadedStoragePath: string | null = null;
  const supabase = await createClient();

  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Sesi Anda telah berakhir. Silakan login kembali.' };
    }

    // 1. Parse metadata teks
    const rawData = {
      payment_id: formData.get('payment_id'),
      amount_transferred: formData.get('amount_transferred'),
      sender_bank_name: formData.get('sender_bank_name'),
      sender_account_name: formData.get('sender_account_name'),
    };

    const parsed = submitPaymentProofSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: 'Validasi isian gagal. Periksa kembali form transfer Anda.',
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { payment_id, amount_transferred, sender_bank_name, sender_account_name } = parsed.data;

    // 2. Validasi File Bukti Transfer
    const file = formData.get('proof_file') as File | null;
    if (!file || file.size === 0) {
      return { success: false, message: 'Berkas bukti transfer wajib dilampirkan.' };
    }

    // Batas 2 MB (2 * 1024 * 1024 bytes)
    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, message: 'Ukuran berkas melebihi batas maksimal 2 MB.' };
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedMimeTypes.includes(file.type)) {
      return { success: false, message: 'Format berkas tidak didukung. Harap unggah format JPG, PNG, atau PDF.' };
    }

    // Ambil byte file untuk verifikasi magic bytes
    const fileBuffer = await file.arrayBuffer();
    const signatureCheck = validateFileSignature(new Uint8Array(fileBuffer));

    if (!signatureCheck.valid) {
      return {
        success: false,
        message: 'Keamanan Berkas: Berkas yang diunggah tidak memiliki signature JPEG, PNG, atau PDF yang sah.',
      };
    }

    // 3. Verifikasi Kepemilikan Pembayaran & Status yang Diizinkan
    const { data: payment, error: payErr } = await supabase
      .from('payments')
      .select('id, status, registration:registrations!inner(participant_id, participants!inner(profile_id))')
      .eq('id', payment_id)
      .single();

    if (payErr || !payment) {
      return { success: false, message: 'Data tagihan tidak ditemukan atau bukan milik Anda.' };
    }

    const ownerProfileId = (payment as any).registration?.participants?.profile_id;
    if (ownerProfileId !== user.id) {
      return { success: false, message: 'Akses ditolak: Anda bukan pemilik pembayaran ini.' };
    }

    if (!['pending', 'rejected'].includes(payment.status)) {
      return {
        success: false,
        message: `Bukti transfer tidak dapat dikirim karena pembayaran sedang berstatus [${payment.status}].`,
      };
    }

    // 4. Hitung nomor submission ke-berapa
    const { count: submissionCount } = await supabase
      .from('payment_proof_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('payment_id', payment_id);

    const nextSubmissionNumber = (submissionCount || 0) + 1;

    // 5. Upload Berkas ke Storage Privat menggunakan ekstensi terdeteksi dari signature
    const safeExt = signatureCheck.ext || 'jpg';
    const fileName = `proof_${payment_id}_sub${nextSubmissionNumber}_${Date.now()}.${safeExt}`;
    const storagePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('private-payment-proofs')
      .upload(storagePath, fileBuffer, {
        contentType: signatureCheck.detectedMime || file.type,
        upsert: false,
      });

    if (uploadError) {
      return { success: false, message: `Gagal mengunggah berkas ke storage: ${uploadError.message}` };
    }

    uploadedStoragePath = storagePath;

    // 6. Simpan baris ke payment_proof_submissions
    const { data: subData, error: subErr } = await supabase
      .from('payment_proof_submissions')
      .insert({
        payment_id,
        submission_number: nextSubmissionNumber,
        proof_storage_path: storagePath,
        amount_transferred,
        sender_bank_name,
        sender_account_name,
        status: 'submitted',
      })
      .select('id')
      .single();

    if (subErr || !subData) {
      // Rollback: Hapus berkas yatim jika insert database gagal
      await supabase.storage.from('private-payment-proofs').remove([storagePath]);
      return { success: false, message: `Gagal mencatat data bukti transfer: ${subErr?.message}` };
    }

    // 7. Update status pembayaran menjadi 'submitted'
    await supabase
      .from('payments')
      .update({ status: 'submitted', updated_at: new Date().toISOString() })
      .eq('id', payment_id);

    revalidatePath('/portal');
    revalidatePath('/dashboard/pembayaran');
    return {
      success: true,
      message: 'Bukti transfer berhasil diunggah! Pembayaran Anda akan segera diverifikasi oleh Bendahara.',
    };
  } catch (err: any) {
    if (uploadedStoragePath) {
      await supabase.storage.from('private-payment-proofs').remove([uploadedStoragePath]);
    }
    return { success: false, message: err.message || 'Terjadi kesalahan sistem.' };
  }
}

/**
 * 3. Server Action: Keputusan Verifikasi Pembayaran oleh Bendahara
 * - Wajib memiliki izin 'payments.verify'
 * - Segregation of Duties & Row-Locking dieksekusi secara otomatis oleh trigger database 00010
 * - Trigger database otomatis menyinkronkan status payments, registrations, dan mencatat audit_logs
 */
export async function verifyPaymentAction(
  prevState: PaymentActionResult | null,
  formData: FormData
): Promise<PaymentActionResult> {
  try {
    const reviewer = await assertPermission('payments.verify');

    const rawData = {
      submission_id: formData.get('submission_id'),
      decision: formData.get('decision'),
      notes: formData.get('notes'),
    };

    const parsed = verifyPaymentSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: 'Validasi verifikasi gagal.',
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { submission_id, decision, notes } = parsed.data;
    const supabase = await createClient();

    // Masukkan keputusan verifikasi ke payment_verifications
    // Trigger trg_validate_payment_verification_before dan trg_after_payment_verification
    // akan mengecek hak akses, locking, anti-self-verification, dan sync database secara atomik.
    const { data: verif, error: verifErr } = await supabase
      .from('payment_verifications')
      .insert({
        submission_id,
        reviewer_id: reviewer.id,
        decision,
        notes,
      })
      .select('id')
      .single();

    if (verifErr) {
      const msg = verifErr.message.includes('Segregation of Duties')
        ? 'Pelanggaran Wewenang: Anda tidak diizinkan memverifikasi pembayaran atas pendaftaran akun Anda sendiri.'
        : verifErr.message.includes('Race Condition')
        ? 'Bukti transfer ini telah diverifikasi sebelumnya oleh reviewer lain.'
        : verifErr.message;

      return { success: false, message: msg };
    }

    revalidatePath('/dashboard/pembayaran');
    revalidatePath('/portal');
    return {
      success: true,
      message: `Keputusan verifikasi berhasil dicatat: [${decision.toUpperCase()}]. Status peserta telah diperbarui.`,
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Wewenang tidak cukup.' };
  }
}

/**
 * 4. Server Action: Generate Signed URL on demand untuk penampil bukti transfer
 * Otorisasi diperiksa di getPaymentProofSignedUrl (hanya pemilik atau reviewer dengan payments.verify/view_all).
 */
export async function getProofSignedUrlAction(storagePath: string): Promise<{ success: boolean; url?: string; message?: string }> {
  try {
    const { getPaymentProofSignedUrl } = await import('./queries');
    const url = await getPaymentProofSignedUrl(storagePath);
    return { success: true, url };
  } catch (err: any) {
    return { success: false, message: err.message || 'Gagal memuat URL bukti transfer.' };
  }
}
