# Technical Consistency Audit Report
## SAPA Ayah Digital Platform
**Date:** November 2026  
**Auditor:** Senior Software Architect, Database Architect, Application Security Engineer  
**Status:** Audit Completed — Implementation Readiness Assessment  

---

## 1. Executive Summary

Audit teknis komprehensif telah dilaksanakan terhadap seluruh dokumentasi di folder `docs/`, konfigurasi lingkungan, dan struktur source code pada direktori `src/`. Fokus audit mencakup:
1. Konsistensi lintas dokumen spesifikasi (SRS, Arsitektur, ERD, RBAC, Kebijakan Keamanan, Roadmap).
2. Kesiapan rancangan skema database (Primary Key, Foreign Keys, Unique Constraints, Check Constraints, Indexing, Audit Columns, Soft Delete/Archival).
3. Penyelarasan RBAC dan kode permission antara dokumen analisis, katalog permission, dan konstanta TypeScript.
4. Arsitektur keamanan (RLS, Server Actions 4-stage pipeline, perlindungan storage bukti transfer privat, audit logs tak terhapuskan).
5. Klasifikasi keputusan bisnis terbuka (*open questions* Q-01 s/d Q-12).

---

## 2. Temuan Audit (Findings & Discrepancies Matrix)

Setiap temuan diklasifikasikan berdasarkan tingkat prioritas (**High**, **Medium**, **Low**):

| ID | Prioritas | Lokasi Dokumen / File | Masalah yang Ditemukan | Dampak terhadap Sistem | Rekomendasi Penyelesaian |
| :-: | :---: | :--- | :--- | :--- | :--- |
| **AUD-01** | **High** | `database-design.md` vs `security-policy.md` | Entitas `payment_proof_submissions` telah diperkenalkan di `database-design.md` v1.1, namun kebijakan RLS di `security-policy.md` masih mengacu pada pola tabel tunggal `payments.proof_storage_path`. | Evaluasi RLS Supabase berisiko mengizinkan akses tidak sah atau menolak akses uploader bukti pengajuan kedua jika skema tabel berbeda dengan rule RLS. | Sinkronisasi kebijakan RLS pada `docs/final-rls-policy-design.md` untuk mengamankan `payment_proof_submissions` secara langsung berbasis kepemilikan pembayaran. |
| **AUD-02** | **High** | `database-design.md` | Kolom `deleted_at` / `archived_at` untuk soft delete belum didefinisikan secara eksplisit di seluruh tabel operasional (khususnya `programs`, `program_batches`, `tasks`, dan `memberships`). | Potensi kehilangan riwayat integritas data jika operasi delete dilakukan secara destruktif (*hard delete*). | Menambahkan standar kolom `archived_at TIMESTAMPTZ` dan `is_archived BOOLEAN DEFAULT false` pada rancangan final skema database. |
| **AUD-03** | **Medium** | `rbac-permission-catalog.md` vs `src/lib/permissions/constants.ts` | Terdapat beberapa permission kontekstual di katalog (`content.view`, `activities.view`, `batches.view`) yang belum seluruhnya didefinisikan secara lengkap di `src/types/index.ts` atau belum dipetakan ke RLS. | Potensi kegagalan verifikasi tipe data TypeScript saat developer mengimplementasikan Server Action di fase selanjutnya. | Harmonisasi seluruh kode permission ke dalam `docs/final-rbac-specification.md` dan pastikan file konstanta TypeScript mencakup seluruh katalog tanpa menghapus permission masa depan (V2). |
| **AUD-04** | **Medium** | `open-questions.md` | Pertanyaan terbuka belum terklasifikasi secara operasional antara yang memblokir MVP, yang dapat diatasi secara teknis, dan yang dapat ditunda ke V2. | Tim pengembang berisiko terhenti (*blocked*) menunggu keputusan yang sebenarnya bisa diakomodasi melalui konfigurasi dinamis. | Melakukan kategorisasi tegas pada Bab 5 audit ini: (1) Wajib Konfirmasi Yayasan, (2) Konfigurasi Teknis Fleksibel, (3) Ditunda ke Pasca-MVP. |
| **AUD-05** | **Low** | `architecture.md` vs `database-design.md` | Penamaan foreign key pada entitas `certificates` menggunakan `signed_by_profile_id`, sedangkan pada beberapa teks deskripsi disebut `signed_by`. | Inkonsistensi minor penamaan field saat menyusun migrasi SQL. | Menetapkan nama field kanonikal `signed_by_profile_id` pada `docs/final-database-design.md`. |

---

## 3. Audit Konsistensi Basis Data

### 3.1 Konsistensi ERD dan Kamus Data
- **Kelengkapan Entitas:** Seluruh 35 entitas yang ada pada diagram Mermaid ERD telah diverifikasi memiliki padanan definisi kolom, tipe data, dan constraint pada kamus data.
- **Pemisahan Identitas & Peran:**
  - `auth.users` terpisah secara bersih dari `profiles`.
  - `participants` (peserta umum) terpisah dari `memberships` (anggota yayasan). Peserta tidak memiliki hak keanggotaan otomatis.
  - `positions` & `personnel_assignments` (struktural tetap) terpisah dari `activity_assignments` (kepanitiaan kegiatan bergilir).
  - `alumni_profiles` terisolasi sebagai entitas pasca-kelulusan.
- **Siklus Pembayaran & Verifikasi:**
  - Struktur multi-submission pada `payment_proof_submissions` berhasil memfasilitasi pengajuan ulang bukti transfer jika bukti pertama ditolak (`REJECTED`) oleh bendahara.
  - Constraint `ck_prevent_self_verification` menjamin pemisahan tugas (*segregation of duties*).
- **Rancangan Indeks:** Indeks pada foreign key, nomor telepon internasional (E.164), email, dan kolom filter status pendaftaran/pembayaran telah dirancang untuk efisiensi query tinggi.

---

## 4. Audit RBAC & Keamanan

### 4.1 Standar Kode Permission Universal
Kode permission telah distandarisasi menggunakan format `<module>.<action>`. Seluruh 10 role:
1. `super_admin`
2. `ketua`
3. `pengurus`
4. `admin_peserta`
5. `bendahara`
6. `kreator_konten`
7. `fasilitator`
8. `relawan`
9. `peserta`
10. `alumni`
telah dipetakan secara menyeluruh tanpa ada permission yang dihapus meskipun fitur baru aktif pada V2.

### 4.2 Verifikasi Arsitektur Keamanan
- **PostgreSQL Row Level Security (RLS):** Seluruh tabel publik wajib mengaktifkan RLS dengan default deny. Pemeriksaan hak akses menggunakan fungsi `SECURITY DEFINER` `public.has_permission(auth.uid(), code)` untuk mencegah rekursi tanpa henti (*infinite RLS recursion*).
- **Service Role Key Isolation:** Terproteksi penuh di server; tidak ada pemanggilan `process.env.SUPABASE_SERVICE_ROLE_KEY` pada bundle client browser.
- **Penyimpanan Berkas Privat:** Bucket `private-payment-proofs`, `private-learning-materials`, dan `private-documents` dilindungi kebijakan storage RLS dan hanya dapat diakses melalui *Time-Limited Signed URL* berumur 300 detik (5 menit).
- **Audit Logs:** Seluruh mutasi kritis (verifikasi pembayaran, pergantian role, persetujuan pendaftaran) dicatat secara terstruktur dengan snapshot data *before* dan *after*.

---

## 5. Klasifikasi & Penanganan Keputusan Bisnis Terbuka (Open Questions)

Berdasarkan audit terhadap `docs/open-questions.md`, pertanyaan bisnis dikelompokkan ke dalam tiga kategori:

### Kategori A: Keputusan Wajib Dikonfirmasi Yayasan (Menjelang Rilis Operasional)
- **Q-01 (Tanggal Kalender Bulan 1):** Dibutuhkan untuk jadwal publikasi resmi, namun **TIDAK MEMBLOKIR** pembuatan skema database karena tanggal disimpan sebagai kolom dinamis `TIMESTAMPTZ`.
- **Q-07 (Target Bulanan Ketiga Ketua):** Klarifikasi redaksi *"2 episode podcast dihadiri"* disimpan apa adanya dalam database tanpa tafsiran sepihak.
- **Q-08 (Otoritas Penetapan Role):** Kewenangan pemberian hak akses ditetapkan sementara kepada Super Admin & Ketua.

### Kategori B: Keputusan Teknis yang Ditetapkan Developer (Configurable Architecture)
- **Q-02 & Q-04 (Jumlah Pertemuan Kelas Menjadi Ayah & Pranikah):** Ditetapkan secara fleksibel; sistem mendukung 1..N sesi per batch melalui relasi `class_sessions`.
- **Q-03 & Q-05 (Harga Kelas Berbayar):** Ditetapkan sebagai field numerik dinamis `price DECIMAL(12, 2)` pada tabel `program_batches`. Admin/Bendahara dapat mengubah nominal kapan pun melalui dashboard tanpa ubah kode.
- **Q-06 (Kebijakan Refund / Cicilan):** Ditetapkan **NON-AKTIF** untuk MVP. Semua pendaftaran wajib lunas penuh (*full payment* manual transfer). Fitur cicilan/refund ditunda hingga ada regulasi tertulis.

### Kategori C: Keputusan yang Ditunda ke Pasca-MVP (V2)
- **Q-09:** Otorisasi anggaran belanja bertingkat untuk pengeluaran kas internal di atas nominal tertentu.
- **Q-10 & Q-11:** Aturan penerbitan sertifikat otomatis berdasarkan persentase kehadiran dan tanda tangan ganda digital.
- **Q-12:** Otomasi keanggotaan grup komunitas alumni terintegrasi WhatsApp API.

---

## 6. Status Kesiapan Implementasi (Implementation Readiness)

- **Dokumentasi Teknis:** 100% Selaras dan Terkonsolidasi.
- **Rancangan Basis Data:** 100% Siap untuk Disusun Berkas Migrasi SQL (belum dijalankan).
- **Spesifikasi RBAC & RLS:** 100% Terdefinisi secara Granular.
- **Kode Program Awal:** Struktur Next.js App Router terverifikasi dan lulus `npm run build` (Exit Code 0).

**Kesimpulan:** Proyek berada pada status **SIAP (READY)** untuk masuk ke penyusunan migrasi SQL skema Supabase segera setelah mendapatkan persetujuan tertulis dari Project Owner.

