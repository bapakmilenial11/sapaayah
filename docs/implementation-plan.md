# Detailed Technical Implementation Plan
## SAPA Ayah Digital Platform
**Organization:** Yayasan Sahabat Pembelajar Ayah (SAPA) Ayah  
**Document Version:** 1.0  
**Status:** Ready for Review & Approval  
**Date:** November 2026  

---

## 1. Ikhtisar Strategi Eksekusi

Pengembangan sistem dibagi menjadi fase-fase kecil yang mandiri (*modular & incremental*). Setiap fase memiliki pintu gerbang pengujian (*testing gate*) yang harus terpenuhi sebelum melangkah ke fase berikutnya.

---

## 2. Rincian Rencana Per Fase

### Fase 0: Project Setup & Technical Foundation
- **Tujuan:** Menyiapkan struktur repositori, konfigurasi tooling TypeScript/Next.js, Tailwind CSS dengan token SAPA Ayah, shadcn/ui foundation, dan seluruh dokumen arsitektur acuan.
- **Ruang Lingkup:**
  - Setup konfigurasi project (`package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`).
  - Pembuatan skeleton folder App Router (`(public)`, `(auth)`, `(dashboard)`, `(portal)`).
  - Setup dokumen teknis di `docs/`.
  - Definisi utility client/server Supabase dan formatting helper.
- **File yang Dibuat / Dikonfigurasi:**
  - `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
  - `components.json`, `.env.example`, `.gitignore`
  - `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`
  - `src/lib/utils.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`
  - `docs/*` (seluruh berkas spesifikasi teknis)
- **Ketergantungan:** Tidak ada.
- **Kriteria Keberhasilan:**
  - Project dapat di-*build* (`npm run build`) tanpa error TypeScript atau lint.
  - Halaman awal menampilkan token warna dan font resmi SAPA Ayah.
- **Rencana Pengujian:** Build test dan validasi konfigurasi Tailwind.
- **Risiko & Mitigasi:**
  - *Risiko:* Perbedaan versi React/Next.js.  
  - *Mitigasi:* Gunakan versi LTS stabil yang kompatibel dengan shadcn/ui dan Supabase SSR.

---

### Fase 1: Supabase Database Schema, Auth & Core RBAC
- **Tujuan:** Menginisialisasi basis data PostgreSQL di Supabase, mengonfigurasi skema akun, mengimplementasikan fungsi otorisasi `has_permission`, dan mengamankan rute autentikasi.
- **Ruang Lingkup:**
  - Migrasi skema: `profiles`, `roles`, `permissions`, `role_permissions`, `user_roles`, `audit_logs`.
  - Kebijakan RLS dasar untuk profil dan hak akses.
  - Implementasi alur autentikasi: Login, Register Peserta, Lupa Password, Logout.
  - Helper server-side session guard (`getCurrentUser()`, `assertPermission()`).
- **File yang Akan Dibuat:**
  - `supabase/migrations/00001_auth_rbac_schema.sql`
  - `supabase/seeds/00001_roles_permissions_seed.sql`
  - `src/lib/auth/session.ts`, `src/lib/permissions/guard.ts`, `src/lib/permissions/constants.ts`
  - `src/features/auth/actions/auth-actions.ts`
  - `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`, `src/app/(auth)/lupa-password/page.tsx`
- **Ketergantungan:** Fase 0 selesai dan disetujui.
- **Kriteria Keberhasilan:**
  - Pengguna dapat mendaftar akun baru dan otomatis memiliki profil dengan role default `peserta`.
  - Pengguna dapat login dan mendapatkan JWT session cookie yang valid.
  - RLS mencegah modifikasi role langsung dari client.
- **Rencana Pengujian:**
  - Unit test fungsi `has_permission`.
  - RLS policy tests via pgTAP / SQL script.
  - Auth flow integration test (register -> login -> profile update -> logout).
- **Risiko & Mitigasi:**
  - *Risiko:* Recursive RLS loop pada pengecekan permission.  
  - *Mitigasi:* Gunakan fungsi `SECURITY DEFINER` dengan skema terisolasi.

---

### Fase 2: Public Website & Manajemen Struktur Organisasi
- **Tujuan:** Menyediakan antarmuka publik yayasan dan modul dashboard untuk mengelola struktur pengurus, unit kerja, posisi, dan jobdesk.
- **Ruang Lingkup:**
  - Halaman publik: Beranda, Tentang Kami (Visi, Misi, Nilai Inti), Program Unggulan, Kontak.
  - Komponen publik: Header responsif, Footer dengan kontak resmi, Hero section, Kartu Program.
  - Dashboard organisasi: CRUD unit organisasi, posisi struktural, masa tugas personel, dan jobdesk.
- **File yang Akan Dibuat:**
  - `supabase/migrations/00002_organization_schema.sql`
  - `src/app/(public)/layout.tsx`, `src/app/(public)/page.tsx`, `src/app/(public)/tentang/page.tsx`, `src/app/(public)/kontak/page.tsx`
  - `src/components/public/navbar.tsx`, `src/components/public/footer.tsx`
  - `src/app/(dashboard)/dashboard/organisasi/page.tsx`
  - `src/features/organization/actions/org-actions.ts`
- **Ketergantungan:** Fase 1 selesai.
- **Kriteria Keberhasilan:**
  - Pengunjung dapat mengakses informasi yayasan tanpa kendala di perangkat mobile dan desktop.
  - Admin/Ketua dapat memperbarui susunan kepengurusan dan jobdesk secara dinamis.
- **Rencana Pengujian:**
  - Responsive visual regression test (mobile viewport 375px & desktop 1440px).
  - RBAC test: hanya role yang berwenang dapat mengubah struktur organisasi.
- **Risiko & Mitigasi:**
  - *Risiko:* Perubahan struktur organisasi merusak data penugasan lama.  
  - *Mitigasi:* Gunakan foreign key yang tepat dengan audit masa tugas (`start_date`, `end_date`).

---

### Fase 3: Operasional Program, Manajemen Tugas & Laporan Jumat
- **Tujuan:** Mendukung ritme kerja rutin pengurus yayasan, penugasan kegiatan, serta pelaporan mingguan dan evaluasi target bulanan.
- **Ruang Lingkup:**
  - Katalog program dan batch angkatan operasional.
  - Manajemen tugas operasional (Tasks) dengan PIC dan tenggat waktu.
  - Modul Laporan Jumat Tiga Baris ("Sudah apa", "Akan apa", "Kendala").
  - Panel Rekapitulasi Mingguan Humas.
  - Modul Target Bulanan (KPI) pengurus.
- **File yang Akan Dibuat:**
  - `supabase/migrations/00003_programs_tasks_schema.sql`
  - `src/app/(dashboard)/dashboard/program/page.tsx`
  - `src/app/(dashboard)/dashboard/tugas/page.tsx`
  - `src/app/(dashboard)/dashboard/laporan-jumat/page.tsx`
  - `src/app/(dashboard)/dashboard/target/page.tsx`
  - `src/features/programs/actions/program-actions.ts`
  - `src/features/tasks/actions/task-actions.ts`
  - `src/features/tasks/actions/weekly-report-actions.ts`
- **Ketergantungan:** Fase 2 selesai.
- **Kriteria Keberhasilan:**
  - Seluruh pengurus dapat mengisi Laporan Jumat tepat waktu melalui antarmuka mobile.
  - Humas dapat melihat status kepatuhan pengisian laporan dan membuat rekap mingguan.
- **Rencana Pengujian:**
  - Pengujian form Laporan Jumat dengan validasi field wajib.
  - Pengujian RBAC: Pengurus hanya mengedit laporannya sendiri; Humas/Ketua dapat melihat rekap seluruh tim.
- **Risiko & Mitigasi:**
  - *Risiko:* Duplikasi pengisian laporan dalam satu pekan yang sama.  
  - *Mitigasi:* Constraint unik basis data `UNIQUE(profile_id, week_date)`.

---

### Fase 4: Pendaftaran Peserta & Verifikasi Pembayaran Manual (MVP Peak)
- **Tujuan:** Menyelesaikan alur komersial/operasional pendaftaran peserta, instruksi transfer, unggah bukti pembayaran privat, verifikasi bendahara, dan portal peserta mandiri.
- **Ruang Lingkup:**
  - Halaman pendaftaran mandiri calon peserta (`/daftar/[batchSlug]`).
  - Input pendaftaran offline/manual oleh admin peserta (`/dashboard/peserta`).
  - Mekanisme deduplikasi peserta berdasarkan email dan WhatsApp.
  - Storage bucket privat `private-payment-proofs` dengan validasi MIME & batas 2MB.
  - Modul verifikasi pembayaran oleh bendahara (`VERIFIED` / `REJECTED` + catatan alasan).
  - Portal peserta: status pendaftaran, status pembayaran, instruksi rekening.
- **File yang Akan Dibuat:**
  - `supabase/migrations/00004_registrations_payments_schema.sql`
  - `src/app/(public)/daftar/[batchSlug]/page.tsx`
  - `src/app/(dashboard)/dashboard/peserta/page.tsx`
  - `src/app/(dashboard)/dashboard/pembayaran/page.tsx`
  - `src/app/(portal)/portal/page.tsx`
  - `src/app/(portal)/portal/pembayaran/page.tsx`
  - `src/features/registrations/actions/registration-actions.ts`
  - `src/features/payments/actions/payment-actions.ts`
- **Ketergantungan:** Fase 3 selesai.
- **Kriteria Keberhasilan:**
  - Pendaftaran mandiri berhasil menghasilkan record pendaftaran dan instruksi transfer.
  - Upload file bukti pembayaran tersimpan secara aman di bucket privat.
  - Bukti hanya dapat diakses melalui signed URL oleh pemilik dan bendahara.
  - Status pembayaran berhasil diverifikasi oleh bendahara dan memicu aktivasi akses portal peserta.
- **Rencana Pengujian:**
  - End-to-End Test: Registrasi -> Pendaftaran Batch -> Upload Bukti -> Review Bendahara -> Verifikasi.
  - Security Test: Verifikasi bahwa file bukti tidak dapat diakses secara publik tanpa token signed URL.
  - Permission Test: Peserta dilarang mengubah status pembayarannya sendiri.
- **Risiko & Mitigasi:**
  - *Risiko:* Akses tidak sah ke bukti transfer atau pemalsuan status pembayaran.  
  - *Mitigasi:* RLS ketat + server action validasi ganda + audit trail tak terhapuskan.

---

### Fase 5: LMS Dasar & Ekstensi Pasca-MVP (V2)
- **Tujuan:** Mendukung proses belajar (sesi, materi, absensi, sertifikat) dan tata kelola yayasan tingkat lanjut (keuangan, konten, mitra, alumni).
- **Ruang Lingkup:**
  - Sesi pertemuan (tautan Zoom/Meet) dan absensi kehadiran oleh fasilitator.
  - Unggah dan unduh materi kelas privat via signed URL.
  - Penerbitan sertifikat digital bagi peserta yang memenuhi kriteria kehadiran.
  - Modul pembukuan keuangan sederhana untuk bendahara.
  - Modul kalender publikasi konten dan manajemen aset media.
  - Direktori komunitas alumni.
- **File yang Akan Dibuat:**
  - `supabase/migrations/00005_lms_and_extensions_schema.sql`
  - `src/app/(portal)/portal/jadwal/page.tsx`, `src/app/(portal)/portal/materi/page.tsx`, `src/app/(portal)/portal/sertifikat/page.tsx`
  - `src/features/learning/actions/learning-actions.ts`
- **Ketergantungan:** Fase 4 selesai dan MVP stabil di produksi.
- **Kriteria Keberhasilan:** Peserta aktif dapat mengunduh materi dan melihat riwayat kehadiran mereka.
- **Rencana Pengujian:** Validasi hak akses materi terproteksi (hanya batch yang diikuti).
- **Risiko & Mitigasi:** Kebocoran file materi intelektual yayasan; gunakan signed URL berumur pendek (10-15 menit).

---

### Fase 6: Security Hardening, UAT & Peluncuran Produksi
- **Tujuan:** Pengujian keamanan menyeluruh, verifikasi penerimaan pengguna (UAT) bersama pengurus yayasan, optimasi performa, dan peluncuran resmi.
- **Ruang Lingkup:**
  - Uji penetrasi internal (privilege escalation, boundary injection, SQLi, CSRF).
  - Verifikasi seluruh 12 skenario UAT minimum dari Master Blueprint.
  - Uji kecepatan respon halaman dan Core Web Vitals.
  - Konfigurasi domain kustom, DNS, dan pencadangan database Supabase.
- **Ketergantungan:** Seluruh fitur MVP terimplementasi dan lulus uji integrasi.
- **Kriteria Keberhasilan:** Penandatanganan berita acara penerimaan (UAT Sign-off) oleh pimpinan yayasan.
- **Rencana Pengujian:** Skenario UAT 1 s/d 12 secara langsung bersama perwakilan pengurus dan calon peserta.
- **Risiko & Mitigasi:** Temuan bug kritis saat UAT; siapkan periode perbaikan (bug fixing sprint) selama 1-2 pekan sebelum hari peluncuran.

