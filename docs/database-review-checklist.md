# Database Design Review Checklist
## SAPA Ayah Digital Platform
**Date:** November 2026  
**Auditor:** Database Architect & Technical Lead  

---

## 1. Verifikasi Konsistensi ERD & Kamus Data

| Nama Entitas / Tabel | Ada di Mermaid ERD? | Ada di Kamus Data? | Primary Key UUID? | Kolom Audit Terpenuhi? | Keterangan Relasi |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `profiles` | Ya | Ya | Ya | Ya | 1:1 ke `auth.users` |
| `roles` | Ya | Ya | Ya | Ya | Master role sistem |
| `permissions` | Ya | Ya | Ya | Ya | Master kode izin granular |
| `role_permissions` | Ya | Ya | Composite | Ya | M:N roles ke permissions |
| `user_roles` | Ya | Ya | Ya | Ya | M:N profiles ke roles |
| `organizational_units` | Ya | Ya | Ya | Ya | Unit struktur yayasan |
| `positions` | Ya | Ya | Ya | Ya | Jabatan organisasi (hierarkis) |
| `personnel_assignments` | Ya | Ya | Ya | Ya | Histori masa jabatan pengurus |
| `job_descriptions` | Ya | Ya | Ya | Ya | Rincian tugas per jabatan |
| `memberships` | Ya | Ya | Ya | Ya | Status keanggotaan yayasan |
| `membership_status_history`| Ya | Ya | Ya | Ya | Histori mutasi anggota |
| `programs` | Ya | Ya | Ya | Ya | Master katalog program |
| `program_batches` | Ya | Ya | Ya | Ya | Angkatan/batch operasional |
| `activities` | Ya | Ya | Ya | Ya | Agenda & kegiatan batch |
| `activity_assignments` | Ya | Ya | Ya | Ya | Tim pelaksana kegiatan bergilir |
| `participants` | Ya | Ya | Ya | Ya | Master peserta program |
| `registrations` | Ya | Ya | Ya | Ya | Pendaftaran peserta ke batch |
| `payment_instructions` | Ya | Ya | Ya | Ya | Master rekening bank transfer |
| `payments` | Ya | Ya | Ya | Ya | Tagihan & status transaksi |
| `payment_proof_submissions`| Ya | Ya | Ya | Ya | Riwayat upload bukti bayar |
| `payment_verifications` | Ya | Ya | Ya | Ya | Riwayat keputusan reviewer |
| `class_sessions` | Ya | Ya | Ya | Ya | Sesi pertemuan & link Zoom |
| `attendance_records` | Ya | Ya | Ya | Ya | Absensi sesi per peserta |
| `learning_materials` | Ya | Ya | Ya | Ya | Berkas materi & slide terproteksi |
| `certificates` | Ya | Ya | Ya | Ya | Sertifikat kelulusan digital |
| `target_periods` | Ya | Ya | Ya | Ya | Periode target (Q1, 6 Bulan) |
| `performance_targets` | Ya | Ya | Ya | Ya | Target bulanan & KPI |
| `progress_updates` | Ya | Ya | Ya | Ya | Log penambahan progres target |
| `tasks` | Ya | Ya | Ya | Ya | Tugas operasional tim |
| `task_assignments` | Ya | Ya | Composite | Ya | Penugasan PIC tugas |
| `task_updates` | Ya | Ya | Ya | Ya | Histori pembaruan progres tugas |
| `weekly_reports` | Ya | Ya | Ya | Ya | Laporan Jumat 3 baris |
| `alumni_profiles` | Ya | Ya | Ya | Ya | Direktori lulusan program |
| `community_memberships` | Ya | Ya | Ya | Ya | Keanggotaan grup alumni |
| `audit_logs` | Ya | Ya | Ya | Ya | Jejak audit tak terhapuskan |

---

## 2. Checklist Integritas, Indeks & Keamanan Data

- [x] **Primary Key UUID Universal:** Semua tabel menggunakan UUID (`gen_random_uuid()`) untuk mencegah kebocoran enumerasi ID.
- [x] **Pemisahan Akun & Profil:** Relasi 1:1 `auth.users` ke `profiles` dengan cascade delete saat akun dihapus secara legal.
- [x] **Pemisahan Peserta vs Anggota Yayasan:** Peserta disimpan di `participants` dan tidak otomatis memiliki record di `memberships`.
- [x] **Deduplikasi Peserta:** Field `email` dan `phone` memiliki constraint UNIQUE pada tabel `participants`.
- [x] **Histori Pembayaran Multi-Submission:** Entitas `payment_proof_submissions` menampung bukti pengajuan berulang jika bukti sebelumnya ditolak.
- [x] **Pencegahan Verifikasi Diri Sendiri:** Check constraint `ck_prevent_self_verification` memastikan reviewer bukan peserta yang membayar.
- [x] **Fleksibilitas Penugasan Kegiatan:** `activity_assignments` mengikat penugasan per kegiatan tanpa ketergantungan pada jabatan struktural.
- [x] **Rencana Indeks Pencarian Cepat:** Indeks telah ditentukan untuk foreign keys, nomor WhatsApp, email, status pendaftaran, status pembayaran, dan tanggal laporan Jumat.
- [x] **Zero Migration Execution:** Tidak ada berkas migrasi SQL yang dijalankan ke database pada tahap revisi dokumen ini.

