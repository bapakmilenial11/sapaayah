# Database Migration & Remediation Deployment Guide
## SAPA Ayah Digital Platform
**Document Version:** 2.0 (Post-Security Remediation Guide)  
**Date:** November 2026  

---

## 1. Urutan Lengkap Migrasi SQL (12 Migrasi Berurutan)

Repositori kini memiliki **12 berkas migrasi SQL berurutan** dan **1 berkas seed master**:

```
supabase/
├── migrations/
│   ├── 00001_core_schema.sql                  # Profil, RBAC, Organisasi, Anggota
│   ├── 00002_programs_and_activities.sql      # Program, Batch, Kegiatan, Penugasan Kru
│   ├── 00003_participants_and_registrations.sql # Peserta, Deduplikasi, Pendaftaran
│   ├── 00004_payments_and_verification.sql    # Rekening, Tagihan, Pengajuan Multi-Bukti
│   ├── 00005_lms_and_tasks.sql                # LMS, Tugas, Target, Laporan Jumat, Audit
│   ├── 00006_rls_and_security_policies.sql    # Base RLS & Storage Buckets
│   ├── 00007_fix_rls_recursion.sql            # Pemutusan Rekursi RLS (SEC-01)
│   ├── 00008_harden_rbac_and_profiles.sql     # Anti-Enumeration & Anti Mass-Assignment (SEC-02, SEC-04)
│   ├── 00009_fix_storage_security.sql         # Storage Policy Terikat Metadata DB (SEC-03)
│   ├── 00010_payment_integrity.sql            # Row Locks, Reviewer Guard, Status Sync (SEC-05)
│   ├── 00011_audit_and_reports_hardening.sql  # Anti-Truncate, No-Delete Laporan, Phone Validation (SEC-06, 07, 08)
│   └── 00012_database_security_tests.sql      # Suite Pengujian Keamanan Transaksional
└── seeds/
    └── 00001_roles_and_permissions.sql        # Master 10 Role & 36 Permissions
```

---

## 2. Cara Menjalankan Migrasi

### Metode A: Via Supabase CLI (Jika Docker Aktif)
1. Jalankan kontainer lokal:
   ```bash
   npx supabase start
   ```
2. Terapkan seluruh berkas migrasi (`00001` s/d `00011`):
   ```bash
   npx supabase db push
   ```
3. Terapkan data master seed:
   ```bash
   npx supabase db reset --seed
   ```
4. Jalankan suite pengujian keamanan:
   ```bash
   npx supabase test db
   ```

### Metode B: Via Supabase Web Dashboard (Jika Docker Tidak Ada)
1. Buka [Supabase Dashboard](https://supabase.com/dashboard) $\rightarrow$ Pilih Project $\rightarrow$ Menu **SQL Editor**.
2. Salin dan jalankan (*Run*) isi berkas `00001` hingga `00011` secara berurutan.
3. Jalankan berkas seed: `supabase/seeds/00001_roles_and_permissions.sql`.
4. Jalankan pengujian keamanan: Salin isi berkas `supabase/migrations/00012_database_security_tests.sql` lalu klik **Run**. Seluruh pengujian dibungkus blok `BEGIN ... ROLLBACK` sehingga tidak meninggalkan data sampah di database.

---

## 3. Strategi Rollback & Penanganan Masalah

Jika terjadi kegagalan saat migrasi perbaikan (`00007` s/d `00011`):
1. **Rollback 00007 (RLS Recursion):**
   ```sql
   DROP FUNCTION IF EXISTS public.get_my_participant_ids CASCADE;
   DROP FUNCTION IF EXISTS public.is_user_assigned_to_batch CASCADE;
   -- Re-apply policies from 00006
   ```
2. **Rollback 00008 (RBAC & Profiles):**
   ```sql
   DROP TRIGGER IF EXISTS trg_protect_profile_columns ON public.profiles;
   DROP FUNCTION IF EXISTS public.trg_fn_protect_profile_columns CASCADE;
   ```
3. **Rollback 00010 (Payment Integrity):**
   ```sql
   DROP TRIGGER IF EXISTS trg_validate_payment_verification_before ON public.payment_verifications;
   DROP FUNCTION IF EXISTS public.trg_fn_validate_payment_verification_before_insert CASCADE;
   ```

