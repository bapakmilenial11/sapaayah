# Architectural Decision Records (ADR) & Technical Decisions
## SAPA Ayah Digital Platform
**Organization:** Yayasan Sahabat Pembelajar Ayah (SAPA) Ayah  
**Document Version:** 1.0  
**Date:** November 2026  

---

## Daftar Rekam Keputusan Arsitektur (ADR)

| ADR ID | Judul Keputusan | Status | Dampak Utama |
| :--- | :--- | :--- | :--- |
| **ADR-001** | Satu Aplikasi Next.js Terintegrasi dengan Route Groups | Disetujui | Penggabungan Public Web, Dashboard, dan Portal dalam satu basis kode. |
| **ADR-002** | Penggunaan Supabase sebagai Fondasi Backend (PostgreSQL, Auth, Storage, RLS) | Disetujui | Penyederhanaan infrastruktur, RLS native, dan keamanan berstandar tinggi. |
| **ADR-003** | Server Components by Default & Server Actions untuk Seluruh Mutasi | Disetujui | Pengurangan bundle client, keamanan server-side auth, performa optimal. |
| **ADR-004** | Pembayaran Transfer Bank Manual dengan Verifikasi Manual Petugas (Tanpa Payment Gateway) | Disetujui | Efisiensi biaya transaksi yayasan, simplifikasi regulasi rekening awal. |
| **ADR-005** | Pemisahan Identitas Akun, Profil, Jabatan Organisasi, Role Sistem, dan Penugasan | Disetujui | Fleksibilitas rotasi peran pengurus tanpa duplikasi akun atau hardcode logic. |
| **ADR-006** | Otorisasi Berbasis Permission Granular Menggunakan Helper `has_permission` | Disetujui | Menghindari infinite recursion pada RLS dan mendukung multi-role dinamis. |
| **ADR-007** | Proteksi Bukti Pembayaran Menggunakan Private Bucket & Time-Limited Signed URL | Disetujui | Mencegah kebocoran data rekening bank dan bukti transaksi peserta. |
| **ADR-008** | Isolasi Ketat & Penundaan Digitalisasi Modul Konseling (SAPA Recovery) | Disetujui | Kepatuhan mutlak terhadap privasi data psikologis keluarga (UU PDP). |
| **ADR-009** | Penetapan Token Warna Resmi SAPA Ayah pada Tailwind CSS | Disetujui | Konsistensi identitas visual: Primary `#547F9F`, Deep Blue `#385A75`, Soft Blue `#E8F0F5`. |

---

## Rincian Rekam Keputusan (Detailed Records)

### ADR-001: Satu Aplikasi Next.js Terintegrasi dengan Route Groups
- **Konteks:** Sistem membutuhkan 3 lingkungan antarmuka berbeda: Website Publik, Management Dashboard, dan Portal Peserta.
- **Alternatif yang Dipertimbangkan:**
  1. Multi-repository atau sub-domain terpisah (e.g. `sapaayah.id`, `admin.sapaayah.id`, `app.sapaayah.id`).
  2. Satu aplikasi monolitik Next.js App Router dengan *Route Groups*.
- **Keputusan:** Mengadopsi alternatif 2 (Route Groups: `(public)`, `(dashboard)`, `(portal)`).
- **Alasan & Konsekuensi:** Mempermudah *code sharing* komponen UI, skema validasi Zod, tipe TypeScript, dan pengelolaan sesi Supabase tanpa kerumitan *cross-domain cookie* atau deployment terpisah.

---

### ADR-002: Penggunaan Supabase sebagai Fondasi Backend
- **Konteks:** Membutuhkan database relasional yang andal, autentikasi terintegrasi, penyimpanan file aman, dan proteksi baris data tanpa perlu membangun backend REST API terpisah dari awal.
- **Keputusan:** Menggunakan Supabase Cloud (PostgreSQL 15+, Supabase Auth SSR, Supabase Storage, Supabase RLS).
- **Alasan & Konsekuensi:** Supabase menyediakan fitur PostgreSQL kelas industri yang mendukung relasi kompleks, indexing performa tinggi, dan RLS untuk penegakan keamanan tingkat database.

---

### ADR-003: Server Components by Default & Server Actions untuk Mutasi
- **Konteks:** Menjaga performa aplikasi di perangkat seluler dengan bandwidth terbatas, serta memastikan keamanan otorisasi tidak bergantung pada browser pengguna.
- **Keputusan:**
  - Seluruh halaman dan komponen bersifat React Server Components (RSC) secara default.
  - Client components (`'use client'`) hanya digunakan pada elemen interaktif (form input, dialog, dropdown).
  - Seluruh operasi mutasi database dieksekusi melalui Server Actions (`'use server'`) dengan validasi hak akses ganda.

---

### ADR-004: Pembayaran Transfer Bank Manual dengan Verifikasi Petugas
- **Konteks:** Yayasan membutuhkan mekanisme penerimaan biaya pendaftaran kelas berbayar.
- **Keputusan:** Pada tahap MVP, sistem **TIDAK MENGGUNAKAN** Payment Gateway otomatis (seperti Midtrans/Xendit). Pembayaran diselesaikan via transfer rekening bank yayasan yang diverifikasi manual oleh Bendahara.
- **Alasan:** Menghindari biaya administrasi pihak ketiga dan mematuhi keputusan Master Technical Blueprint. Konfigurasi harga dan rekening dibuat dinamis di database.

---

### ADR-005: Pemisahan Akun, Profil, Jabatan Organisasi, dan Role
- **Konteks:** Di SAPA Ayah, pengurus inti dapat merangkap sebagai peserta kelas, fasilitator, atau berganti peran kepanitiaan setiap 3 bulan.
- **Keputusan:** Memisahkan data ke dalam tabel terpisah: `auth.users` (kredensial), `profiles` (data diri), `positions` (jabatan yayasan), `roles` (hak akses sistem), `activity_assignments` (penugasan per kegiatan).
- **Alasan:** Menjamin integritas data jangka panjang dan fleksibilitas organisasi tanpa perlu memodifikasi kode saat ada rotasi kepengurusan.

---

### ADR-006: Otorisasi Berbasis Permission Granular (`has_permission`)
- **Konteks:** Mengandalkan pengecekan teks nama role (e.g. `role === 'admin'`) rentan terhadap kerentanan eskalasi hak istimewa dan memicu rekursi tanpa henti (*infinite recursion*) pada RLS policy PostgreSQL.
- **Keputusan:** Membangun relasi *role-permission* banyak-ke-banyak (M:N) dan mengevaluasi akses menggunakan fungsi SQL `public.has_permission(auth.uid(), 'module.action')` berstatus `SECURITY DEFINER`.

---

### ADR-007: Bukti Pembayaran Menggunakan Private Storage Bucket
- **Konteks:** Bukti transfer memuat data sensitif peserta (nama rekening, nomor rekening bank, waktu transaksi, nominal saldo).
- **Keputusan:** Bucket `private-payment-proofs` dikonfigurasi sebagai bucket privat (*non-public*). Akses melihat file hanya diberikan via *Signed URL* berbatas waktu 5 menit yang di-generate di server untuk peserta terkait atau petugas berizin.

---

### ADR-008: Isolasi & Penundaan Digitalisasi Modul Konseling (SAPA Recovery)
- **Konteks:** Program SAPA Recovery menyentuh aspek emosional, kesehatan mental keluarga, dan konseling privat yang berisiko privasi sangat tinggi.
- **Keputusan:** Modul konseling tidak dimasukkan ke dalam basis data operasional umum MVP. Digitalisasi layanan ini ditunda hingga adanya kerangka hukum perlindungan data, informed consent eksplisit, dan arsitektur enkripsi end-to-end terpisah.

---

### ADR-009: Penetapan Token Warna Resmi SAPA Ayah
- **Konteks:** Identitas visual yayasan harus tercermin secara konsisten di seluruh antarmuka.
- **Keputusan:** Mendaftarkan palet resmi ke dalam tema Tailwind CSS:
  - Primary Blue: `#547F9F`
  - Deep Blue: `#385A75`
  - Soft Blue: `#E8F0F5`
  - Background: `#F5F7F8`
  - Dark Text: `#252D35`
  - Card White: `#FFFFFF`

