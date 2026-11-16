# Database Security Audit Report
## SAPA Ayah Digital Platform
**Date:** November 2026  
**Auditor:** Senior Backend Engineer, PostgreSQL Database Architect, Supabase Security Specialist  
**Status:** Audit Completed — Remediation Planned  

---

## 1. Executive Summary

Audit keamanan menyeluruh telah dilakukan terhadap berkas migrasi database Supabase `00001_core_schema.sql` hingga `00006_rls_and_security_policies.sql`, skrip pengujian, dan integrasi aplikasi.

Ditemukan **8 area kerentanan & risiko signifikan** yang dapat mengancam integritas data, privasi peserta, dan ketersediaan sistem:
1. **RLS Mutual Recursion / Complex Subquery Overhead (High):** Kebijakan RLS pada `participants` memanggil `registrations`, sementara kebijakan `registrations` memanggil `participants`. Begitu pula relasi antara `tasks` dan `task_assignments`.
2. **RBAC Information Disclosure & User Enumeration (Medium):** Fungsi `public.has_permission(_user_id, _permission_code)` menerima parameter sembarang UUID user sehingga pengguna terautentikasi dapat mengecek permission milik akun lain.
3. **Storage Authorization Disconnected from Database Metadata (Critical):** Kebijakan storage pada bucket `private-learning-materials` hanya memeriksa apakah user memiliki hak izin umum `materials.view_enrolled`, tanpa memvalidasi apakah file yang diunduh benar-benar milik batch di mana peserta tersebut terdaftar secara sah (`status = 'accepted'`).
4. **Mass Assignment & Sensitive Field Mutation on Profiles (Critical):** Kebijakan `profiles_update_own` hanya menggunakan filter `WITH CHECK (id = auth.uid())` tanpa membatasi kolom. Pengguna dapat mengubah `account_status`, `is_archived`, atau field sensitif lainnya secara langsung.
5. **Payment Verification Race Condition & Client Impersonation (Critical):** Verifikasi pembayaran belum menggunakan penguncian baris (`FOR UPDATE`), memungkinkan *race condition* jika dua reviewer memproses bersamaan. Selain itu, parameter reviewer dapat dipalsukan jika Server Action tidak menegakkan `auth.uid()`.
6. **Audit Logs Privilege Escalation & TRUNCATE Vulnerability (High):** Tabel `audit_logs` belum dilindungi dari operasi `TRUNCATE` dan dapat di-insert langsung oleh pengguna jika RLS tidak membatasi INSERT.
7. **Weekly Reports Overly Permissive Policy & Day-of-Week Validation (Medium):** Kebijakan `weekly_reports_insert_update` menggunakan `FOR ALL`, yang secara tidak sengaja mengizinkan operasi `DELETE`.
8. **Phone Normalization Edge Cases (Medium):** Fungsi `normalize_phone()` belum memvalidasi panjang nomor minimum/maksimum Indonesia, serta karakter invalid setelah prefix internasional.

---

## 2. Temuan Keamanan Rinci (Vulnerability Findings)

### SEC-01: Potensi RLS Recursion & Subquery Overhead pada Participants dan Registrations
- **Severity:** High
- **Lokasi:** `supabase/migrations/00006_rls_and_security_policies.sql` (baris 133-195)
- **Root Cause:**
  - Policy `participants_select`:
    ```sql
    USING (
      profile_id = auth.uid()
      OR public.has_permission(auth.uid(), 'participants.view_all')
      OR (public.has_permission(auth.uid(), 'participants.view_assigned') AND id IN (
        SELECT r.participant_id FROM public.registrations r ...
      ))
    )
    ```
  - Policy `registrations_select`:
    ```sql
    USING (
      participant_id IN (SELECT id FROM public.participants WHERE profile_id = auth.uid())
      OR public.has_permission(auth.uid(), 'registrations.view_all') ...
    )
    ```
  Ketika seorang pengguna melakukan query `SELECT * FROM registrations`, RLS mengevaluasi subquery ke `participants`. Evaluasi pada `participants` kembali mengevaluasi RLS `participants_select` yang melakukan subquery ke `registrations`.
- **Dampak:** Memperlambat query secara signifikan, meningkatkan konsumsi CPU PostgreSQL, dan pada kondisi join kompleks dapat memicu error rekursi batas evaluasi RLS.
- **Remediasi:** Buat fungsi helper `SECURITY DEFINER` yang membaca ID peserta atau ID batch pengguna langsung tanpa memicu RLS publik:
  - `public.get_my_participant_ids()`
  - `public.is_assigned_to_activity(_activity_id)`
  - `public.is_assigned_to_batch(_batch_id)`

---

### SEC-02: RBAC Information Disclosure via `has_permission()`
- **Severity:** Medium
- **Lokasi:** `supabase/migrations/00006_rls_and_security_policies.sql` (baris 8-28)
- **Root Cause:**
  Fungsi `has_permission(_user_id UUID, _permission_code VARCHAR)` menerima `_user_id` bebas. Jika user terautentikasi memanggil `SELECT public.has_permission('target-user-uuid', 'finance.manage')`, fungsi akan mengembalikan `true/false`, membuka celah eksplorasi hak akses pengguna lain (*user role enumeration*).
- **Dampak:** Membocorkan struktur hak istimewa dan personel yayasan kepada pihak yang tidak berhak.
- **Remediasi:** Tambahkan validasi di dalam fungsi:
  ```sql
  IF _user_id != auth.uid() AND NOT public.is_admin_or_service(auth.uid()) THEN
    RAISE EXCEPTION 'Access Denied: You cannot inspect permissions of other users.';
  END IF;
  ```
  Dan sediakan fungsi overload `public.has_my_permission(_permission_code)` yang secara default mengevaluasi `auth.uid()`.

---

### SEC-03: Storage Authorization Disconnected from Database Metadata
- **Severity:** Critical
- **Lokasi:** `supabase/migrations/00006_rls_and_security_policies.sql` (baris 357-375)
- **Root Cause:**
  Kebijakan `storage_materials_read_enrolled` mengizinkan akses SELECT jika pengguna memiliki permission `materials.view_enrolled`. Ini berarti peserta yang terdaftar di Batch 1 dapat menebak path file materi milik Batch 2 (misal: `/batch-2/rahasia.pdf`) dan Supabase Storage akan meloloskan pengunduhan karena user memiliki permission global `materials.view_enrolled`.
- **Dampak:** Kebocoran materi intelektual antar-batch berbayar, peserta kelas gratis dapat mengunduh materi kelas berbayar.
- **Remediasi:** Hubungkan pemeriksaan storage langsung dengan metadata tabel `public.learning_materials`:
  ```sql
  CREATE POLICY "storage_materials_read_enrolled" ON storage.objects
    FOR SELECT TO authenticated
    USING (
      bucket_id = 'private-learning-materials'
      AND (
        public.has_permission(auth.uid(), 'materials.manage_assigned')
        OR EXISTS (
          SELECT 1 FROM public.learning_materials lm
          JOIN public.registrations r ON r.batch_id = lm.batch_id
          JOIN public.participants p ON r.participant_id = p.id
          WHERE lm.file_storage_path = name
            AND p.profile_id = auth.uid()
            AND r.status = 'accepted'
        )
      )
    );
  ```

---

### SEC-04: Mass Assignment pada `profiles`
- **Severity:** Critical
- **Lokasi:** `supabase/migrations/00006_rls_and_security_policies.sql` (baris 61-64)
- **Root Cause:**
  Policy `profiles_update_own`:
  `USING (id = auth.uid()) WITH CHECK (id = auth.uid())`.
  Pengguna dapat mengirimkan mutasi UPDATE untuk kolom `account_status = 'active'`, `is_archived = true`, atau memanipulasi kolom audit.
- **Dampak:** Pengguna yang di-suspend oleh admin dapat mengaktifkan kembali akunnya sendiri, atau memanipulasi status akun.
- **Remediasi:** Tambahkan trigger pengaman `BEFORE UPDATE` pada `profiles` yang menolak perubahan pada kolom proteksi (`account_status`, `is_archived`, `archived_at`, `archived_by`) jika aktor bukan super_admin atau service_role.

---

### SEC-05: Payment Verification Race Condition & Integrity
- **Severity:** Critical
- **Lokasi:** `supabase/migrations/00004_payments_and_verification.sql` (baris 52-95)
- **Root Cause:**
  1. Trigger `trg_after_payment_verification` berjalan setelah INSERT pada `payment_verifications`, tetapi tidak mengunci baris `payments` dengan `FOR UPDATE`. Dua reviewer dapat memverifikasi bukti yang sama secara simultan.
  2. Identitas `reviewer_id` pada tabel `payment_verifications` dikirim oleh client pada query INSERT dan diperiksa di RLS dengan `reviewer_id = auth.uid()`. Namun jika verifikasi dilakukan via server action tanpa validasi ketat, integritas bergantung pada konsistensi client.
  3. Ketika bukti pembayaran ditolak (`rejected`), jika registrasi sebelumnya tidak sengaja sudah `accepted`, status tidak disinkronkan kembali menjadi `under_review` atau `submitted`.
- **Dampak:** Inkonsistensi status pembayaran dan pendaftaran, potensi manipulasi status pembayaran.
- **Remediasi:** Tulis ulang trigger verifikasi dengan *explicit row lock*, sinkronisasi status pendaftaran yang konsisten saat `rejected`, dan pastikan `reviewer_id` dipaksa bernilai `auth.uid()`.

---

### SEC-06: Audit Logs Truncation & Bypass
- **Severity:** High
- **Lokasi:** `supabase/migrations/00005_lms_and_tasks.sql` (baris 136-150)
- **Root Cause:**
  Trigger `trg_audit_logs_immutable` memblokir `BEFORE UPDATE OR DELETE`, namun tidak memblokir perintah `TRUNCATE TABLE audit_logs`. Selain itu, policy RLS pada `audit_logs` belum memiliki batasan `INSERT` eksplisit (hanya SELECT), sehingga pengguna authenticated berpotensi meng-insert audit log palsu.
- **Dampak:** Penghapusan massal riwayat jejak audit sistem atau pemalsuan rekaman audit.
- **Remediasi:**
  1. Tambahkan event trigger atau pembatasan `TRUNCATE` pada tabel `audit_logs`.
  2. Definisikan policy RLS `audit_logs_insert_system` yang menolak INSERT langsung dari role `authenticated` (hanya fungsi trigger internal atau `service_role` yang dapat meng-insert).

---

### SEC-07: Weekly Reports Overly Permissive Policy
- **Severity:** Medium
- **Lokasi:** `supabase/migrations/00006_rls_and_security_policies.sql` (baris 326-329)
- **Root Cause:**
  Policy `weekly_reports_insert_update`:
  `FOR ALL TO authenticated USING (profile_id = auth.uid() AND ...)`.
  Kata kunci `FOR ALL` mencakup `SELECT`, `INSERT`, `UPDATE`, dan `DELETE`. Hal ini memungkinkan pengurus menghapus Laporan Jumat lama mereka, menghilangkan jejak pelaporan historis.
- **Dampak:** Hilangnya rekaman progres mingguan historis yang menjadi dasar rapat evaluasi yayasan.
- **Remediasi:** Pisahkan policy menjadi `FOR INSERT` dan `FOR UPDATE`. Jangan buat policy `DELETE` untuk `weekly_reports`.

---

### SEC-08: Phone Normalization Edge Cases
- **Severity:** Medium
- **Lokasi:** `supabase/migrations/00003_participants_and_registrations.sql` (baris 8-31)
- **Root Cause:**
  Fungsi `normalize_phone` saat ini:
  - Mengizinkan string pendek seperti `081` yang tidak valid.
  - Tidak memvalidasi batas panjang standar nomor Indonesia (10–15 digit).
  - Jika dimasukkan `+6281234567890`, karakter `+` tidak dibersihkan dengan benar jika ada karakter aneh di tengahnya.
- **Dampak:** Nomor telepon sampah atau tidak valid dapat lolos ke database, menyebabkan kegagalan integrasi WhatsApp atau SMS.
- **Remediasi:** Perbaiki fungsi regex dan validasi batas panjang karakter (minimal 10 digit, maksimal 16 karakter).

---

## 3. Matriks Rencana Remediasi (Remediation Plan)

| Migration File | Fokus Remediasi | Kerentanan yang Diatasi |
| :--- | :--- | :--- |
| `00007_fix_rls_recursion.sql` | Pembuatan helper functions `SECURITY DEFINER` terisolasi dan redefinisi policy `participants`, `registrations`, `tasks`, dan `task_assignments`. | SEC-01 |
| `00008_harden_rbac_and_profiles.sql` | Penguatan fungsi `has_permission()`, pencegahan mass-assignment pada tabel `profiles`, dan pembatasan `user_roles`. | SEC-02, SEC-04 |
| `00009_fix_storage_security.sql` | Penyelarasan storage policy dengan database metadata untuk bucket `private-learning-materials` dan `private-payment-proofs`. | SEC-03 |
| `00010_payment_integrity.sql` | Penguncian baris (`FOR UPDATE`), sinkronisasi status atomik, validasi reviewer, dan pencegahan race condition. | SEC-05 |
| `00011_audit_and_reports_hardening.sql` | Pengamanan tabel `audit_logs` (cegah TRUNCATE/INSERT palsu), pemisahan policy `weekly_reports`, dan penyempurnaan `normalize_phone()`. | SEC-06, SEC-07, SEC-08 |
| `00012_database_security_tests.sql` | Suite pengujian SQL komprehensif untuk memverifikasi 12 poin keamanan. | Validasi & Regresi |

