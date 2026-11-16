# Migration Execution Guide & Deployment SOP
## SAPA Ayah Digital Platform
**Document Version:** 1.0  
**Scope:** Supabase Database Migrations & Seed Scripts  
**Date:** November 2026  

---

## 1. Ikhtisar Berkas Migrasi

Seluruh skema database telah dipecah ke dalam 6 berkas migrasi SQL berurutan dan 1 berkas seed data master:

| Urutan | Nama Berkas Migrasi | Cakupan Domain | Tabel yang Dihasilkan |
| :-: | :--- | :--- | :--- |
| **01** | `00001_core_schema.sql` | Ekstensi, fungsi trigger updated_at, profil, RBAC, struktur organisasi, dan keanggotaan yayasan. | `profiles`, `roles`, `permissions`, `role_permissions`, `user_roles`, `organizational_units`, `positions`, `personnel_assignments`, `job_descriptions`, `memberships`, `membership_status_history` (11 tabel) |
| **02** | `00002_programs_and_activities.sql` | Katalog program, batch angkatan, agenda kegiatan, dan tim pelaksana kegiatan bergilir (*activity assignments*). | `programs`, `program_batches`, `activities`, `activity_assignments` (4 tabel) |
| **03** | `00003_participants_and_registrations.sql` | Deduplikasi peserta (fungsi normalisasi telepon E.164 dan lowercase email), basis data peserta, dan pendaftaran batch. | `participants`, `registrations` (2 tabel) |
| **04** | `00004_payments_and_verification.sql` | Rekening tujuan transfer, tagihan pembayaran, pengajuan multi-bukti transfer, verifikasi reviewer, dan trigger anti verifikasi diri sendiri. | `payment_instructions`, `payments`, `payment_proof_submissions`, `payment_verifications` (4 tabel) |
| **05** | `00005_lms_and_tasks.sql` | Sesi kelas, absensi, materi, sertifikat, periode target KPI, penambahan progres, tugas, laporan Jumat 3 baris, alumni, grup komunitas, dan audit logs tak terhapuskan. | `class_sessions`, `attendance_records`, `learning_materials`, `certificates`, `target_periods`, `performance_targets`, `progress_updates`, `tasks`, `task_assignments`, `task_updates`, `weekly_reports`, `alumni_profiles`, `community_memberships`, `audit_logs` (14 tabel) |
| **06** | `00006_rls_and_security_policies.sql` | Fungsi otorisasi `public.has_permission()`, pengaktifan RLS pada 35 tabel publik, RLS policies, dan Supabase Storage bucket/policies. | Mengamankan seluruh 35 tabel skema public + 3 bucket privat storage. |
| **Seed**| `seeds/00001_roles_and_permissions.sql` | Seed idempotent 10 Role resmi, 36 Master Permission, pemetaan role-permission, dan rekening transfer awal BSI. | Master data awal. |

---

## 2. Prosedur Eksekusi Migrasi Lokal (Supabase CLI)

> **Catatan Penting:**  
> Lingkungan lokal membutuhkan Docker Desktop aktif jika menggunakan `supabase start`. Jika Docker belum terpasang di mesin pengembang, gunakan panduan eksekusi manual via Supabase Dashboard SQL Editor pada [docs/database-setup-guide.md](file:///d:/Bapak Milenial/Ngoding/sapa-ayah-platform/docs/database-setup-guide.md).

### Langkah-langkah via Supabase CLI:
1. Pastikan Docker Desktop berjalan.
2. Inisialisasi dan jalankan kontainer lokal Supabase:
   ```bash
   npx supabase start
   ```
3. Terapkan seluruh berkas migrasi secara berurutan:
   ```bash
   npx supabase db push
   ```
4. Jalankan berkas seed data:
   ```bash
   npx supabase db reset --seed
   ```
   *(Atau jalankan `psql -f supabase/seeds/00001_roles_and_permissions.sql`)*
5. Jalankan suite pengujian constraint:
   ```bash
   npx supabase test db
   ```

---

## 3. Prosedur Eksekusi ke Supabase Cloud (Production/Staging)

> [!CAUTION]
> **DILARANG MENJALANKAN MIGRASI KE CLOUD TANPA PERSETUJUAN RESMI PROJECT OWNER.**

Setelah persetujuan diperoleh:
1. Tautkan proyek Supabase CLI ke Project ID Cloud:
   ```bash
   npx supabase link --project-ref <your-project-ref>
   ```
2. Periksa perbedaan skema (*dry-run*):
   ```bash
   npx supabase db diff
   ```
3. Terapkan migrasi ke database cloud:
   ```bash
   npx supabase db push
   ```
4. Jalankan seed master permission:
   Buka Supabase Dashboard $\rightarrow$ SQL Editor $\rightarrow$ Paste isi berkas [supabase/seeds/00001_roles_and_permissions.sql](file:///d:/Bapak Milenial/Ngoding/sapa-ayah-platform/supabase/seeds/00001_roles_and_permissions.sql) $\rightarrow$ Klik Run.

