# Database Security Test Report
## SAPA Ayah Digital Platform
**Date:** November 2026  
**Auditor:** Senior Database Engineer & Application Security Specialist  
**Test Suite:** [supabase/migrations/00012_database_security_tests.sql](file:///d:/Bapak Milenial/Ngoding/sapa-ayah-platform/supabase/migrations/00012_database_security_tests.sql)  

---

## 1. Status Lingkungan Pengujian (Environment Reality Check)

- **Node.js:** `v22.17.0` (Tersedia)
- **Supabase CLI:** `supabase@3.1.0` (Tersedia via npx)
- **Docker Engine / Daemon:** **TIDAK TERPASANG / TIDAK BERJALAN PADA HOST WINDOWS** (`docker : The term 'docker' is not recognized`)
- **PostgreSQL Client CLI (`psql`):** **TIDAK TERPASANG PADA SYSTEM PATH**

### Pernyataan Batasan Uji:
Sesuai instruksi baku: *"Jika Docker atau database lokal tidak tersedia, jangan mengklaim runtime testing berhasil. Tetap lakukan validasi statis dan dokumentasikan keterbatasannya."*

- **Validasi Statis & Sintaks SQL:** Seluruh 6 berkas migrasi perbaikan (`00007` s/d `00012`) telah divalidasi struktur DDL, blok PL/pgSQL, dan konsistensi dependensinya.
- **Kompilasi Aplikasi Next.js & TypeScript:** `npm run build` berhasil 100% (Exit Code 0).
- **Runtime Test PostgreSQL:** Disusun dalam berkas pengujian transaksional atomik `00012_database_security_tests.sql` yang siap dieksekusi begitu kontainer Docker atau koneksi Supabase Cloud aktif.

---

## 2. Matriks Rincian Skenario Uji Keamanan

| ID Uji | Nama Skenario Uji | Tujuan Pengujian | Expected Behavior | Status Uji (Environment Saat Ini) |
| :---: | :--- | :--- | :--- | :---: |
| **SEC-TEST-01** | Anti-Enumeration on `has_permission()` | Memastikan peserta reguler tidak dapat memeriksa permission milik akun pengguna lain. | Fungsi mengembalikan `false` tanpa error dan tanpa membocorkan hak akses user target. | **VALIDATED STATICALLY (READY FOR DB RUN)** |
| **SEC-TEST-02** | Profile Mass-Assignment Protection | Memastikan peserta tidak dapat memanipulasi `account_status` atau `is_archived`. | Trigger `trg_protect_profile_columns` melempar exception: *Security Violation*. | **VALIDATED STATICALLY (READY FOR DB RUN)** |
| **SEC-TEST-03** | Self-Role Assignment Prevention | Memastikan pengguna tidak dapat memberikan role `super_admin` kepada dirinya sendiri. | RLS policy `user_roles_manage_authorized` menolak insert (`user_id != auth.uid()`). | **VALIDATED STATICALLY (READY FOR DB RUN)** |
| **SEC-TEST-04** | Payment Self-Verification Block | Memastikan peserta yang membayar tidak dapat menjadi reviewer untuk memverifikasi buktinya sendiri. | Trigger `trg_validate_payment_verification_before` melempar exception *Segregation of Duties Violation*. | **VALIDATED STATICALLY (READY FOR DB RUN)** |
| **SEC-TEST-05** | Authorized Payment Verification Sync | Memastikan verifikator sah dapat menyetujui transaksi dan status disinkronkan secara atomik. | Status pembayaran berubah menjadi `verified` dan registrasi menjadi `accepted`. | **VALIDATED STATICALLY (READY FOR DB RUN)** |
| **SEC-TEST-06** | Cross-Batch Material Isolation | Memastikan peserta di Batch 1 tidak dapat mengakses materi milik Batch 2. | Fungsi `can_access_learning_material_file()` mengembalikan `false`. | **VALIDATED STATICALLY (READY FOR DB RUN)** |
| **SEC-TEST-07** | Audit Logs Immutability & Anti-Truncate | Memastikan audit logs tidak dapat diubah (UPDATE), dihapus (DELETE), atau dikosongkan (TRUNCATE). | Trigger `trg_audit_logs_immutable` dan `trg_audit_logs_no_truncate` memblokir seluruh operasi. | **VALIDATED STATICALLY (READY FOR DB RUN)** |
| **SEC-TEST-08** | Robust Indonesian Phone Normalization | Memastikan nomor lokal `0812...` dikonversi ke `+62812...` dan nomor sampah `< 10 digit` ditolak. | Format valid berhasil dinormalisasi; format invalid melempar exception. | **VALIDATED STATICALLY (READY FOR DB RUN)** |
| **SEC-TEST-09** | Weekly Reports Deletion Block | Memastikan tidak ada hak DELETE pada laporan mingguan Jumat. | Operasi DELETE ditolak oleh RLS. | **VALIDATED STATICALLY (READY FOR DB RUN)** |

