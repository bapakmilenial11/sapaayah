# RBAC Permission Catalog & Alignment Specification
## SAPA Ayah Digital Platform
**Date:** November 2026  
**Document Version:** 1.0  
**Status:** Unified Permission Standard  

---

## 1. Katalog Kode Permission Standar Sistem

Format kode izin sistem menggunakan konvensi `<module>.<action>` yang konsisten antara dokumentasi, database seed, dan pengecekan kode TypeScript:

### 1.1 Modul Sistem & Pengaturan
- `system.manage`: Mengelola konfigurasi teknis tingkat sistem.
- `settings.view`: Melihat pengaturan operasional yayasan.
- `settings.manage`: Mengubah konfigurasi operasional (kontak resmi, rekening, dll.).

### 1.2 Modul Pengguna & Kontrol Akses
- `users.view`: Melihat daftar profil pengguna terdaftar.
- `users.manage`: Memperbarui status akun pengguna (aktivasi/suspend).
- `roles.assign`: Menetapkan atau mencabut role pengguna.

### 1.3 Modul Organisasi & Personel
- `organization.view`: Melihat struktur unit, posisi, dan jobdesk.
- `organization.manage`: Menambah/mengubah unit organisasi dan struktur.
- `positions.manage`: Mengelola master posisi struktural yayasan.
- `personnel.assign`: Menetapkan personel pada posisi struktural organisasi.

### 1.4 Modul Program & Batch
- `programs.view`: Melihat katalog program yayasan.
- `programs.manage`: Membuat, mengedit, atau mengarsipkan master program.
- `batches.view`: Melihat daftar angkatan/batch pelaksanaan.
- `batches.manage`: Mengonfigurasi batch (kuota, harga, tanggal buka/tutup).

### 1.5 Modul Kegiatan & Penugasan Pelaksana
- `activities.view`: Melihat agenda dan daftar kegiatan.
- `activities.manage`: Membuat atau mengedit rincian kegiatan batch.
- `activities.assign`: Menetapkan tim pelaksana kegiatan (PIC, Moderator, dll.).

### 1.6 Modul Peserta & Pendaftaran
- `participants.view_all`: Melihat seluruh basis data peserta program.
- `participants.view_assigned`: Melihat peserta pada batch/kegiatan yang ditugaskan.
- `participants.manage`: Mengedit atau menggabungkan (merge) data peserta.
- `registrations.create_admin`: Mendaftarkan peserta secara manual oleh admin.
- `registrations.view_all`: Melihat seluruh rekap pendaftaran.
- `registrations.view_assigned`: Melihat pendaftaran pada batch yang ditugaskan.
- `registrations.manage`: Mengubah status pendaftaran (`accepted`, `waitlisted`, dll.).

### 1.7 Modul Pembayaran Transfer Manual
- `payments.view_all`: Melihat seluruh tagihan dan status pembayaran.
- `payments.verify`: Memverifikasi atau menolak bukti transfer bank peserta.
- `payments.manage_accounts`: Mengelola data rekening tujuan transfer yayasan.

### 1.8 Modul Tugas, Target & Laporan Jumat
- `tasks.manage_all`: Membuat dan mengelola seluruh tugas operasional yayasan.
- `tasks.update_assigned`: Memperbarui progres dan catatan pada tugas yang diemban.
- `targets.view_all`: Melihat kompilasi target kinerja pengurus.
- `targets.manage`: Menetapkan KPI target bulanan dan periode evaluasi.
- `targets.update_assigned`: Memperbarui nilai pencapaian target bulanan pribadi.
- `weekly_reports.submit`: Mengisi dan mengirimkan formulir Laporan Jumat 3 baris.
- `weekly_reports.view_all`: Melihat seluruh laporan mingguan pengurus.
- `weekly_reports.recap`: Mengompilasi dan menyusun ringkasan mingguan Humas.

### 1.9 Modul Pembelajaran (LMS)
- `sessions.manage_assigned`: Mengatur jadwal dan tautan pertemuan sesi yang diampu.
- `attendance.record_assigned`: Mencatat kehadiran peserta pada sesi yang ditugaskan.
- `materials.manage_assigned`: Mengunggah materi belajar pada batch/sesi terkait.
- `materials.view_enrolled`: Mengunduh materi belajar pada batch yang diikuti.
- `certificates.issue`: Menerbitkan sertifikat kelulusan bagi peserta yang berhak.
- `certificates.download_own`: Mengunduh file sertifikat milik pribadi.

### 1.10 Modul Keuangan Yayasan
- `finance.view`: Melihat laporan mutasi kas dan ringkasan keuangan.
- `finance.manage`: Mencatat transaksi pemasukan/pengeluaran yayasan.

### 1.11 Modul Konten & Media
- `content.view`: Melihat kalender produksi dan arsip konten.
- `content.manage`: Mengelola rencana produksi video, poster, dan artikel.

### 1.12 Modul Komunitas Alumni
- `community.view`: Mengakses direktori dan agenda komunitas alumni.
- `community.manage`: Mengelola pengumuman dan forum jejaring alumni.

### 1.13 Modul Audit Logs
- `audit_logs.view`: Memeriksa jejak audit aktivitas sistem.

---

## 2. Penyelarasan dengan File Implementasi Proyek

Untuk menjamin tidak ada inkonsistensi saat masuk ke tahap implementasi kode, file konstanta [src/lib/permissions/constants.ts](file:///d:/Bapak Milenial/Ngoding/sapa-ayah-platform/src/lib/permissions/constants.ts) telah diselaraskan dengan seluruh daftar permission di atas.

