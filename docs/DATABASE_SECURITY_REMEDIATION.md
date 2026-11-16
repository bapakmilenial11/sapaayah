# Database Security Remediation Specification
## SAPA Ayah Digital Platform
**Date:** November 2026  
**Auditor:** Senior Backend Engineer & Supabase Security Specialist  
**Status:** Remediated & Documented  

---

## 1. Ikhtisar Remediasi Keamanan

Berdasarkan hasil audit [docs/DATABASE_SECURITY_AUDIT.md](file:///d:/Bapak Milenial/Ngoding/sapa-ayah-platform/docs/DATABASE_SECURITY_AUDIT.md), sebanyak 6 berkas migrasi remediator dan pengujian telah dibuat pada rentang `00007` s/d `00012` tanpa mengubah atau merusak migrasi dasar sebelumnya:

| Migration File | Fokus Keamanan | Masalah yang Dituntaskan |
| :--- | :--- | :--- |
| [00007_fix_rls_recursion.sql](file:///d:/Bapak Milenial/Ngoding/sapa-ayah-platform/supabase/migrations/00007_fix_rls_recursion.sql) | Pemutusan rekursi RLS antara tabel `participants` $\leftrightarrow$ `registrations` dan `tasks` $\leftrightarrow$ `task_assignments`. | SEC-01 (High) |
| [00008_harden_rbac_and_profiles.sql](file:///d:/Bapak Milenial/Ngoding/sapa-ayah-platform/supabase/migrations/00008_harden_rbac_and_profiles.sql) | Pengamanan fungsi `has_permission()` dari *privilege enumeration*, pencegahan mass-assignment pada tabel `profiles`, dan anti self-role assignment pada `user_roles`. | SEC-02 (Medium), SEC-04 (Critical) |
| [00009_fix_storage_security.sql](file:///d:/Bapak Milenial/Ngoding/sapa-ayah-platform/supabase/migrations/00009_fix_storage_security.sql) | Menghubungkan kebijakan storage objek dengan database metadata tabel `learning_materials` dan validasi folder bukti bayar. | SEC-03 (Critical) |
| [00010_payment_integrity.sql](file:///d:/Bapak Milenial/Ngoding/sapa-ayah-platform/supabase/migrations/00010_payment_integrity.sql) | Penguncian baris eksplisit (`FOR UPDATE`), validasi reviewer berbasis `auth.uid()`, sinkronisasi atomik, dan audit log finansial. | SEC-05 (Critical) |
| [00011_audit_and_reports_hardening.sql](file:///d:/Bapak Milenial/Ngoding/sapa-ayah-platform/supabase/migrations/00011_audit_and_reports_hardening.sql) | Pemblokiran operasi `TRUNCATE` pada `audit_logs`, pencegahan penghapusan tidak sengaja pada `weekly_reports`, dan validasi format nomor ponsel Indonesia. | SEC-06 (High), SEC-07 (Medium), SEC-08 (Medium) |
| [00012_database_security_tests.sql](file:///d:/Bapak Milenial/Ngoding/sapa-ayah-platform/supabase/migrations/00012_database_security_tests.sql) | Suite pengujian otomatis mencakup 7 pengujian skenario penyerangan dan regresi fungsional. | Validasi Komprehensif |

---

## 2. Rincian Teknis Perbaikan

### A. Pemutusan Rekursi RLS (SEC-01)
- **Root Cause:** Policy `participants_select` memanggil subquery ke tabel `registrations`. Di sisi lain, policy `registrations_select` memanggil subquery ke `participants`. Evaluasi silang ini memicu subquery berulang (*cross-table RLS loop*).
- **Solusi:** Dibuat 6 fungsi helper `SECURITY DEFINER` yang membaca data relasi dengan skema terisolasi (`SET search_path = public`) dan mengembalikan hasil boolean/set of UUID tanpa memicu evaluasi RLS tabel pemanggil:
  - `public.get_my_participant_ids()`
  - `public.is_user_assigned_to_activity(_activity_id)`
  - `public.is_user_assigned_to_batch(_batch_id)`
  - `public.is_participant_in_my_assigned_batches(_participant_id)`
  - `public.is_task_assignee(_task_id)`
  - `public.is_task_creator(_task_id)`

### B. Pengerasan Otorisasi RBAC & Profil Pengguna (SEC-02 & SEC-04)
- **Root Cause:**
  1. `has_permission(_user_id, _permission_code)` mengizinkan siapa saja memeriksa permission user lain.
  2. Policy `profiles_update_own` hanya memvalidasi `id = auth.uid()`, memungkinkan pengguna mengubah `account_status` miliknya dari 'suspended' menjadi 'active'.
- **Solusi:**
  1. `has_permission()` diperbarui: Pengguna biasa **hanya dapat memeriksa permission miliknya sendiri**. Jika mencoba memeriksa user lain, fungsi mengembalikan `false` (hanya super_admin atau service_role yang memiliki hak inspeksi lintas akun).
  2. Trigger `trg_protect_profile_columns` dipasang pada tabel `profiles` sebelum UPDATE. Trigger ini menolak perubahan pada kolom `id`, `account_status`, `is_archived`, `archived_at`, dan `archived_by` jika aktor bukan super_admin atau service_role.

### C. Isolasi Penyimpanan Materi Kelas (SEC-03)
- **Root Cause:** Policy storage lama hanya memeriksa apakah pengguna memiliki permission `materials.view_enrolled`. Pengguna di Batch A dapat menebak path file Batch B dan mengunduhnya.
- **Solusi:** Fungsi `public.can_access_learning_material_file(_storage_path)` dibuat untuk memvalidasi secara langsung ke metadata database bahwa:
  1. File tersebut terdaftar di tabel `public.learning_materials`.
  2. Pengguna tercatat sebagai peserta di batch tersebut dengan status `accepted`.

### D. Integritas Verifikasi Pembayaran & Anti Race Condition (SEC-05)
- **Root Cause:** Reviewer dapat memverifikasi pembayaran miliknya sendiri atau dua reviewer menyetujui transaksi yang sama bersamaan.
- **Solusi:**
  1. Trigger `trg_validate_payment_verification_before` mengunci baris `payments` dan `payment_proof_submissions` dengan `FOR UPDATE`.
  2. Reviewer dipaksa menggunakan `auth.uid()`.
  3. Pendaftar dilarang keras menjadi reviewer untuk pembayarannya sendiri (*Segregation of Duties*).
  4. Perubahan status disinkronkan secara atomik dan dicatat langsung ke `audit_logs`.

### E. Perlindungan Audit Log & Normalisasi Telepon (SEC-06, SEC-07, SEC-08)
- **Solusi:**
  1. Trigger `trg_audit_logs_no_truncate` dipasang untuk menggagalkan operasi `TRUNCATE TABLE audit_logs`.
  2. Policy `weekly_reports_insert_update` dipecah menjadi `FOR INSERT` dan `FOR UPDATE` mandiri (tidak ada policy DELETE).
  3. Fungsi `public.normalize_phone()` diperkuat untuk memvalidasi nomor seluler Indonesia (awalan 628/08, panjang 10-15 digit), serta menolak input karakter tidak valid.

