import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUser } from '@/lib/auth/session';
import { assertPermission, hasPermission } from '@/lib/permissions/guard';

export interface PaymentInvoiceDetail {
  id: string;
  registration_id: string;
  amount_due: number;
  unique_code: number;
  status: string;
  created_at: string;
  instruction: {
    id: string;
    bank_name: string;
    account_number: string;
    account_holder: string;
    instructions: string | null;
  };
  registration: {
    id: string;
    status: string;
    batch: {
      id: string;
      name: string;
      batch_number: number;
      program: {
        id: string;
        name: string;
      };
    };
  };
  submissions?: ProofSubmissionDetail[];
}

export interface ProofSubmissionDetail {
  id: string;
  payment_id: string;
  submission_number: number;
  proof_storage_path: string;
  amount_transferred: number;
  sender_bank_name: string | null;
  sender_account_name: string | null;
  status: string;
  submitted_at: string;
  verifications?: {
    id: string;
    decision: string;
    notes: string;
    decided_at: string;
    reviewer?: {
      full_name: string;
    };
  }[];
}

export interface VerificationQueueItem {
  submission_id: string;
  payment_id: string;
  submission_number: number;
  proof_storage_path: string;
  amount_transferred: number;
  sender_bank_name: string | null;
  sender_account_name: string | null;
  submitted_at: string;
  submission_status: string;
  amount_due: number;
  unique_code: number;
  participant_name: string;
  participant_phone: string;
  participant_email: string;
  program_name: string;
  batch_name: string;
  latest_verification?: {
    id: string;
    decision: string;
    notes: string;
    decided_at: string;
    reviewer_name?: string;
  } | null;
}

/**
 * 1. Query instruksi rekening resmi yayasan yang sedang aktif (BSI)
 */
export async function getActivePaymentInstruction() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('payment_instructions')
    .select('id, bank_name, account_number, account_holder, instructions')
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Gagal memuat instruksi pembayaran: ${error.message}`);
  }

  return data;
}

/**
 * 2. Query seluruh tagihan & riwayat submission milik peserta aktif (Portal)
 */
export async function getMyPaymentInvoices(): Promise<PaymentInvoiceDetail[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();

  // Dapatkan participant_id
  const { data: participant } = await supabase
    .from('participants')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle();

  if (!participant) return [];

  // Ambil invoice melalui RLS payments
  const { data: payments, error } = await supabase
    .from('payments')
    .select(
      `
      id,
      registration_id,
      amount_due,
      unique_code,
      status,
      created_at,
      instruction:payment_instructions!inner(
        id,
        bank_name,
        account_number,
        account_holder,
        instructions
      ),
      registration:registrations!inner(
        id,
        status,
        participant_id,
        batch:program_batches!inner(
          id,
          name,
          batch_number,
          program:programs!inner(
            id,
            name
          )
        )
      ),
      submissions:payment_proof_submissions(
        id,
        payment_id,
        submission_number,
        proof_storage_path,
        amount_transferred,
        sender_bank_name,
        sender_account_name,
        status,
        submitted_at,
        verifications:payment_verifications(
          id,
          decision,
          notes,
          decided_at
        )
      )
    `
    )
    .eq('registration.participant_id', participant.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Gagal memuat tagihan pembayaran Anda: ${error.message}`);
  }

  return (payments as any) || [];
}

/**
 * 3. Query satu invoice spesifik milik peserta (untuk halaman upload)
 */
export async function getPaymentInvoiceById(paymentId: string): Promise<PaymentInvoiceDetail | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('payments')
    .select(
      `
      id,
      registration_id,
      amount_due,
      unique_code,
      status,
      created_at,
      instruction:payment_instructions!inner(
        id,
        bank_name,
        account_number,
        account_holder,
        instructions
      ),
      registration:registrations!inner(
        id,
        status,
        participant_id,
        batch:program_batches!inner(
          id,
          name,
          batch_number,
          program:programs!inner(
            id,
            name
          )
        )
      ),
      submissions:payment_proof_submissions(
        id,
        payment_id,
        submission_number,
        proof_storage_path,
        amount_transferred,
        sender_bank_name,
        sender_account_name,
        status,
        submitted_at,
        verifications:payment_verifications(
          id,
          decision,
          notes,
          decided_at
        )
      )
    `
    )
    .eq('id', paymentId)
    .maybeSingle();

  if (error || !data) return null;

  return data as any;
}

/**
 * 4. Query antrean verifikasi & riwayat pembayaran untuk Bendahara & Super Admin
 * Mendukung filter status opsional: 'all', 'queue' (default: submitted & under_review), atau status spesifik
 */
export async function getAllPaymentVerifications(statusFilter?: string): Promise<VerificationQueueItem[]> {
  await assertPermission('payments.view_all');

  const supabase = await createClient();

  let query = supabase
    .from('payment_proof_submissions')
    .select(
      `
      id,
      payment_id,
      submission_number,
      proof_storage_path,
      amount_transferred,
      sender_bank_name,
      sender_account_name,
      submitted_at,
      status,
      payment:payments!inner(
        id,
        amount_due,
        unique_code,
        status,
        registration:registrations!inner(
          id,
          participant:participants!inner(
            id,
            full_name,
            phone,
            email
          ),
          batch:program_batches!inner(
            id,
            name,
            program:programs!inner(
              id,
              name
            )
          )
        )
      ),
      verifications:payment_verifications(
        id,
        decision,
        notes,
        decided_at,
        reviewer_id
      )
    `
    )
    .order('submitted_at', { ascending: false });

  if (!statusFilter || statusFilter === 'queue') {
    // Default prioritas: submitted & under_review
    query = query.in('status', ['submitted', 'under_review']);
  } else if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Gagal memuat antrean verifikasi: ${error.message}`);
  }

  return (data || []).map((row: any) => {
    const latestVerif = Array.isArray(row.verifications) && row.verifications.length > 0
      ? row.verifications[row.verifications.length - 1]
      : null;

    return {
      submission_id: row.id,
      payment_id: row.payment_id,
      submission_number: row.submission_number,
      proof_storage_path: row.proof_storage_path,
      amount_transferred: row.amount_transferred,
      sender_bank_name: row.sender_bank_name,
      sender_account_name: row.sender_account_name,
      submitted_at: row.submitted_at,
      submission_status: row.status,
      amount_due: row.payment.amount_due,
      unique_code: row.payment.unique_code,
      participant_name: row.payment.registration.participant.full_name,
      participant_phone: row.payment.registration.participant.phone,
      participant_email: row.payment.registration.participant.email,
      program_name: row.payment.registration.batch.program.name,
      batch_name: row.payment.registration.batch.name,
      latest_verification: latestVerif,
    };
  });
}

/**
 * Legacy wrapper untuk kompatibilitas
 */
export async function getPendingPaymentVerifications(): Promise<VerificationQueueItem[]> {
  return getAllPaymentVerifications('queue');
}

/**
 * 5. Generator Signed URL untuk berkas bukti transfer privat
 * Memvalidasi otorisasi: hanya pemilik berkas atau reviewer berizin yang dapat membuat signed URL
 */
export async function getPaymentProofSignedUrl(storagePath: string): Promise<string> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHENTICATED: Anda harus login untuk mengakses bukti transfer.');
  }

  // Path format: <profile_id>/<filename>
  const pathParts = storagePath.split('/');
  const fileOwnerProfileId = pathParts[0];

  const isOwner = fileOwnerProfileId === user.id;
  const isReviewer =
    user.roles.includes('super_admin') ||
    user.permissions.includes('payments.verify') ||
    user.permissions.includes('payments.view_all');

  if (!isOwner && !isReviewer) {
    throw new Error('FORBIDDEN: Anda tidak memiliki izin untuk melihat bukti transfer ini.');
  }

  const supabase = await createClient();

  // Buat signed URL dengan masa berlaku 15 menit (900 detik)
  const { data, error } = await supabase.storage
    .from('private-payment-proofs')
    .createSignedUrl(storagePath, 900);

  if (error || !data?.signedUrl) {
    throw new Error(`Gagal membuat tautan akses berkas: ${error?.message || 'File not found'}`);
  }

  return data.signedUrl;
}

