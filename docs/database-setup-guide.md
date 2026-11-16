# Database Setup & Configuration Guide
## SAPA Ayah Digital Platform
**Document Version:** 1.0  
**Scope:** Manual & Automated Supabase Database Provisioning  
**Date:** November 2026  

---

## 1. Opsi Penyiapan Database

Terdapat dua jalur resmi untuk menerapkan skema basis data SAPA Ayah ke Supabase:
- **Opsi A (Direkomendasikan via CLI):** Memerlukan Docker Desktop lokal.
- **Opsi B (Manual via Supabase Web Dashboard):** Tidak memerlukan Docker; dilakukan langsung melalui SQL Editor pada proyek Supabase Cloud (Development / Staging).

---

## 2. Panduan Setup Manual (Opsi B: Supabase Dashboard SQL Editor)

Jika Docker belum terpasang di komputer lokal, jalankan berkas SQL secara berurutan pada Supabase Web Dashboard:

### Langkah 1: Buat Proyek Supabase
1. Masuk ke [Supabase Dashboard](https://supabase.com/dashboard).
2. Buat proyek baru dengan nama `sapa-ayah-platform-dev`.
3. Simpan Database Password di tempat yang aman.
4. Salin **Project URL** dan **Anon Key** ke file `.env.local` lokal Anda.

### Langkah 2: Jalankan Berkas Migrasi Secara Berurutan
Buka menu **SQL Editor** pada dashboard Supabase, lalu salin dan jalankan (*Run*) berkas-berkas berikut secara bertahap:

1. Salin seluruh isi [supabase/migrations/00001_core_schema.sql](file:///d:/Bapak Milenial/Ngoding/sapa-ayah-platform/supabase/migrations/00001_core_schema.sql) $\rightarrow$ Klik **Run**.
2. Salin seluruh isi [supabase/migrations/00002_programs_and_activities.sql](file:///d:/Bapak Milenial/Ngoding/sapa-ayah-platform/supabase/migrations/00002_programs_and_activities.sql) $\rightarrow$ Klik **Run**.
3. Salin seluruh isi [supabase/migrations/00003_participants_and_registrations.sql](file:///d:/Bapak Milenial/Ngoding/sapa-ayah-platform/supabase/migrations/00003_participants_and_registrations.sql) $\rightarrow$ Klik **Run**.
4. Salin seluruh isi [supabase/migrations/00004_payments_and_verification.sql](file:///d:/Bapak Milenial/Ngoding/sapa-ayah-platform/supabase/migrations/00004_payments_and_verification.sql) $\rightarrow$ Klik **Run**.
5. Salin seluruh isi [supabase/migrations/00005_lms_and_tasks.sql](file:///d:/Bapak Milenial/Ngoding/sapa-ayah-platform/supabase/migrations/00005_lms_and_tasks.sql) $\rightarrow$ Klik **Run**.
6. Salin seluruh isi [supabase/migrations/00006_rls_and_security_policies.sql](file:///d:/Bapak Milenial/Ngoding/sapa-ayah-platform/supabase/migrations/00006_rls_and_security_policies.sql) $\rightarrow$ Klik **Run**.

### Langkah 3: Jalankan Seed Master Data
Buka kembali tab SQL Editor baru, salin isi berkas:
- [supabase/seeds/00001_roles_and_permissions.sql](file:///d:/Bapak Milenial/Ngoding/sapa-ayah-platform/supabase/seeds/00001_roles_and_permissions.sql) $\rightarrow$ Klik **Run**.

Ini akan otomatis memasukkan 10 Role resmi, 36 Master Permission, pemetaan hak akses, dan rekening resmi BSI yayasan.

---

## 3. Verifikasi Keberhasilan Setup

Setelah seluruh berkas dijalankan, verifikasi pada menu **Table Editor** dan **Storage**:
1. **Table Editor:** Pastikan seluruh 35 tabel berstatus *RLS Enabled* (ikon gembok aktif).
2. **Storage:** Buka menu Storage dan pastikan terdapat 3 bucket privat:
   - `private-payment-proofs` (Private, max 2MB)
   - `private-learning-materials` (Private, max 50MB)
   - `private-documents` (Private, max 20MB)
3. **Roles & Permissions:** Jalankan query verifikasi:
   ```sql
   SELECT r.code AS role_code, count(rp.permission_id) AS total_permissions
   FROM public.roles r
   LEFT JOIN public.role_permissions rp ON r.id = rp.role_id
   GROUP BY r.code
   ORDER BY total_permissions DESC;
   ```
   *Ekspektasi:* `super_admin` memiliki 36 permissions, `ketua` memiliki 30 permissions, `pengurus` memiliki 12 permissions, dst.

