# Security Policy & Row Level Security (RLS) Architecture
## SAPA Ayah Digital Platform
**Organization:** Yayasan Sahabat Pembelajar Ayah (SAPA) Ayah  
**Document Version:** 1.0  
**Security Level:** Enterprise Grade / Strict Compliance  
**Date:** November 2026  

---

## 1. Prinsip Keamanan Sistem (Guiding Security Principles)

1. **Prinsip Hak Akses Terkecil (Least Privilege):** Setiap akun pengguna hanya diberikan hak akses minimum absolut yang diperlukan untuk menjalankan fungsinya.
2. **Pertahanan Berlapis (Defense in Depth):**
   - **Layer 1 (Perimeter / Network):** Enkripsi TLS 1.3 menyeluruh, proteksi DDoS via Vercel Edge.
   - **Layer 2 (Application / Server Actions):** Validasi input Zod, otorisasi server-side session, dan penegakan izin fungsi.
   - **Layer 3 (Database / RLS):** Supabase PostgreSQL Row Level Security aktif di seluruh tabel aplikasi.
   - **Layer 4 (Storage Protection):** Bucket privat dengan akses hanya via presigned URL berbatas waktu.
3. **Pemberitahuan & Kerahasiaan Kredensial:**
   - Variabel `SUPABASE_SERVICE_ROLE_KEY` haram disisipkan ke bundle client atau diawali dengan prefix `NEXT_PUBLIC_`.
   - Browser client hanya menggunakan `NEXT_PUBLIC_SUPABASE_ANON_KEY` dengan session JWT.
4. **Audit Trail Tak Terhapuskan (Immutable Audit Logs):** Seluruh aksi administratif krusial dicatat secara otomatis dan tidak dapat dihapus oleh pengguna biasa.

---

## 2. Arsitektur Row Level Security (RLS) Supabase

Seluruh tabel di skema `public` wajib memiliki RLS aktif: `ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;`.

### 2.1 Fungsi Helper Otorisasi Aman (`has_permission`)
Untuk mencegah *RLS infinite recursion* dan penurunan performa, pemeriksaan izin menggunakan fungsi helper dengan kualifikasi `SECURITY DEFINER`:

```sql
-- Skema Helper Otorisasi PostgreSQL
CREATE OR REPLACE FUNCTION public.has_permission(
  user_id UUID,
  required_permission VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = user_id
      AND p.code = required_permission
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
END;
$$;
```

### 2.2 Aturan Kebijakan Akses (RLS Policies Baseline)

| Tabel | Operasi | Role Target | Ekspresi Evaluasi (USING / WITH CHECK) |
| :--- | :--- | :--- | :--- |
| **`profiles`** | SELECT | Authenticated | `auth.uid() = id OR public.has_permission(auth.uid(), 'users.view')` |
| **`profiles`** | UPDATE | Authenticated | `auth.uid() = id` (Hanya field pribadi non-role) |
| **`user_roles`** | SELECT | Authenticated | `auth.uid() = user_id OR public.has_permission(auth.uid(), 'roles.assign')` |
| **`user_roles`** | ALL | Role Manager | `public.has_permission(auth.uid(), 'roles.assign')` |
| **`programs`** | SELECT | Public / Anon | `visibility = 'published'` |
| **`programs`** | ALL | Admin Program | `public.has_permission(auth.uid(), 'programs.manage')` |
| **`program_batches`**| SELECT | Public / Anon | `status IN ('open', 'in_progress', 'completed')` |
| **`program_batches`**| ALL | Admin Program | `public.has_permission(auth.uid(), 'batches.manage')` |
| **`participants`**| SELECT | Authenticated | `profile_id = auth.uid() OR public.has_permission(auth.uid(), 'participants.view_all')` |
| **`registrations`** | SELECT | Authenticated | `participant_id IN (SELECT id FROM participants WHERE profile_id = auth.uid()) OR public.has_permission(auth.uid(), 'registrations.view_all')` |
| **`registrations`** | INSERT | Authenticated | `participant_id IN (SELECT id FROM participants WHERE profile_id = auth.uid()) OR public.has_permission(auth.uid(), 'registrations.create_admin')` |
| **`payments`** | SELECT | Authenticated | Pemilik pendaftaran OR `public.has_permission(auth.uid(), 'payments.view_all')` |
| **`payments`** | INSERT/UPDATE | Authenticated | Pemilik pendaftaran (hanya saat status `pending`/`rejected`) |
| **`payment_verifications`** | SELECT | Authenticated | Terkait pembayaran milik sendiri OR `public.has_permission(auth.uid(), 'payments.verify')` |
| **`payment_verifications`** | INSERT | Finance | `public.has_permission(auth.uid(), 'payments.verify')` (User bukan pembayar) |
| **`tasks`** | SELECT | Authenticated | Pembuat task OR Assignee OR `public.has_permission(auth.uid(), 'tasks.manage_all')` |
| **`weekly_reports`** | SELECT | Authenticated | `profile_id = auth.uid() OR public.has_permission(auth.uid(), 'weekly_reports.view_all')` |
| **`weekly_reports`** | INSERT/UPDATE | Pengurus | `profile_id = auth.uid() AND public.has_permission(auth.uid(), 'weekly_reports.submit')` |
| **`audit_logs`** | SELECT | Super Admin | `public.has_permission(auth.uid(), 'audit_logs.view')` |
| **`audit_logs`** | INSERT | System/Trigger| Tidak ada insert langsung dari API client |

---

## 3. Kebijakan Keamanan Supabase Storage

### 3.1 Klasifikasi Bucket Storage
1. **`public-assets` (Public Read):**
   - Penggunaan: Logo yayasan, poster promosi publik, foto profil publik, banner program.
   - Hak Akses: `SELECT` diizinkan publik; `INSERT/UPDATE/DELETE` memerlukan permission `content.manage`.
2. **`private-payment-proofs` (Private Read & Write):**
   - Penggunaan: Bukti transfer pembayaran bank.
   - Hak Akses: Hanya peserta pemilik dan verifikator keuangan yang berhak membaca bukti via *Signed URL* berumur 5 menit (`createSignedUrl(path, 300)`).
   - Dilarang keras membuat bucket ini menjadi public.
3. **`private-learning-materials` (Protected LMS Read):**
   - Penggunaan: Slide PDF materi kelas, rekaman eksklusif, worksheet.
   - Hak Akses: Hanya peserta yang pendaftarannya berstatus `accepted` pada batch tersebut.
4. **`private-documents` (Internal Archives):**
   - Penggunaan: Surat keputusan yayasan, laporan keuangan berkas mentah.

### 3.2 Pembatasan Upload File (File Sanitization)
- **Ukuran Maksimum:** Bukti bayar maks. 2MB; Dokumen materi maks. 10MB.
- **Tipe MIME Diizinkan (Whitelist):** `image/jpeg`, `image/png`, `application/pdf`.
- **Sanitasi Nama File:** Nama file diacak menggunakan format UUIDv4: `<uuid>.<ext>` untuk mencegah *path traversal attacks*.

---

## 4. Perlindungan Data Pribadi (UU No. 27/2022)

1. **Minimisasi Data:** Sistem hanya mengumpulkan data yang relevan untuk verifikasi kehadiran, komunikasi kelas (WhatsApp), dan pelaporan program.
2. **Isolasi Program Konseling / SAPA Recovery:**
   - Data catatan konseling, riwayat permasalahan keluarga, atau curahan hati pribadi **TIDAK BOLEH** disimpan pada tabel profil atau tabel pendaftaran umum.
   - Modul SAPA Recovery membutuhkan enkripsi client-to-server end-to-end terpisah dan persetujuan khusus (informed consent).
3. **Retensi & Hak Hapus Data:** Pengguna berhak meminta penonaktifan akun pribadi. Data keuangan dipertahankan sesuai regulasi akuntansi yayasan tanpa menampilkan data pribadi publik.

