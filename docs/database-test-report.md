# Database Test Report & Integrity Verification
## SAPA Ayah Digital Platform
**Date:** November 2026  
**Auditor:** Senior Database Engineer & Application Security Engineer  
**Test Suite:** [supabase/tests/00001_database_constraints_test.sql](file:///d:/Bapak Milenial/Ngoding/sapa-ayah-platform/supabase/tests/00001_database_constraints_test.sql)  

---

## 1. Status Lingkungan Pengujian Lokal (Environment Status)

Pemeriksaan ketersediaan perkakas pada mesin lokal pengembang menghasilkan temuan faktual berikut:
- **Node.js / npm / npx:** Tersedia (`v22.17.0`, npm `10.9.2`).
- **Supabase CLI:** Berhasil dipasang via npx (`supabase@3.1.0`).
- **Docker Daemon:** **TIDAK TERPASANG / TIDAK TERSEDIA** pada host Windows saat ini (`docker : The term 'docker' is not recognized`).
- **PostgreSQL Client (`psql`):** **TIDAK TERPASANG DALAM PATH SISTEM** (`psql : The term 'psql' is not recognized`).

### Konsekuensi Faktual:
Sesuai batasan instruksi kerja (*"Jika Supabase CLI atau Docker belum tersedia, laporkan secara jelas dan jangan mengklaim pengujian berhasil"*):
> **Pengujian migrasi secara otomatis via kontainer Docker lokal TIDAK DAPAT DIJALANKAN SECARA LANGSUNG pada mesin ini tanpa instalasi Docker Desktop.**  
> Seluruh skrip SQL telah divalidasi integritas sintaksnya secara statis dan disusun dalam suite uji transaksional mandiri (`BEGIN ... ROLLBACK`) yang siap dieksekusi saat Docker atau koneksi instance PostgreSQL/Supabase tersedia.

---

## 2. Cakupan Skenario Uji SQL yang Disusun

Berkas uji [supabase/tests/00001_database_constraints_test.sql](file:///d:/Bapak Milenial/Ngoding/sapa-ayah-platform/supabase/tests/00001_database_constraints_test.sql) mencakup 5 domain pengujian integritas kritis:

| Kode Uji | Domain Uji | Skenario yang Diuji | Hasil yang Diharapkan | Mekanisme Pertahanan |
| :-: | :--- | :--- | :--- | :--- |
| **TEST-01** | Normalisasi Data | Input nomor telepon `0812-3456-7890` dan email kapital `AYAH.BUDI@EXAMPLE.COM`. | Sistem otomatis mengubah menjadi `+6281234567890` dan `ayah.budi@example.com`. | Trigger `trg_normalize_participant_insert_update` memanggil fungsi `public.normalize_phone()`. |
| **TEST-02** | Deduplikasi Peserta | Pendaftaran peserta kedua dengan email atau nomor telepon yang sama persis. | PostgreSQL melempar galat `unique_violation`. | Constraint `UNIQUE(email)` dan `UNIQUE(phone)` pada tabel `participants`. |
| **TEST-03** | Segregation of Duties | Pendaftar Budi mencoba bertindak sebagai reviewer untuk memverifikasi pembayaran miliknya sendiri. | Transaksi digagalkan dengan exception: `Segregation of Duties Violation: Reviewer cannot verify their own payment.` | Trigger `trg_after_payment_verification` memvalidasi relasi peserta terhadap reviewer. |
| **TEST-04** | Sinkronisasi Status Pembayaran | Reviewer sah Ganjar menyetujui (`verified`) bukti transfer pengajuan Budi. | Status pembayaran otomatis berubah menjadi `verified` dan status pendaftaran menjadi `accepted`. | Trigger `trg_after_payment_verification` mengeksekusi sinkronisasi atomik ke tabel `payments` dan `registrations`. |
| **TEST-05** | Ritme Laporan Jumat | Pengurus mencoba mengirim Laporan Jumat kedua pada tanggal pekan Jumat yang sama. | Database melempar galat `unique_violation`. | Constraint `UNIQUE(profile_id, week_date)` pada tabel `weekly_reports`. |
| **TEST-06** | Immutability Audit Logs | Percobaan eksekusi query `UPDATE` atau `DELETE` pada tabel `audit_logs`. | Database menggagalkan transaksi dengan pesan: `Audit logs are immutable. UPDATE and DELETE operations are forbidden.` | Trigger `trg_audit_logs_immutable` memblokir operasi DML modifikasi. |

---

## 3. Rekomendasi Langkah Pengujian Mandiri

Pengembang atau Project Owner dapat memvalidasi berkas uji ini secara langsung dengan salah satu cara berikut:
1. Memasang **Docker Desktop** pada Windows dan menjalankan `npx supabase test db`.
2. Menyalin isi berkas [supabase/tests/00001_database_constraints_test.sql](file:///d:/Bapak Milenial/Ngoding/sapa-ayah-platform/supabase/tests/00001_database_constraints_test.sql) ke **Supabase Dashboard SQL Editor** pada proyek staging/dev. Seluruh skrip dibungkus dalam blok `BEGIN ... ROLLBACK` sehingga tidak meninggalkan data sampah di database.

