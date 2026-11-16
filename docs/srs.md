# Software Requirements Specification (SRS)
## SAPA Ayah Digital Platform
**Organization:** Yayasan Sahabat Pembelajar Ayah (SAPA) Ayah  
**Document Version:** 1.0  
**Status:** Baseline Specification (Berdasarkan Master Technical Blueprint v1.0)  
**Date:** November 2026  

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen
Dokumen Software Requirements Specification (SRS) ini mendefinisikan kebutuhan fungsional dan nonfungsional untuk platform digital terintegrasi Yayasan Sahabat Pembelajar Ayah (SAPA) Ayah. Dokumen ini menjadi acuan mutlak bagi tim pengembang, arsitek sistem, dan pemangku kepentingan.

### 1.2 Identitas Organisasi
- **Nama Resmi:** Sahabat Pembelajar Ayah (SAPA) Ayah
- **Tagline:** *"Menyapa untuk Tumbuh, Tumbuh untuk Menyapa"* / *"Menyapa Ayah, Ayah yang Menyapa"*
- **Visi:** Mewujudkan ayah Indonesia yang pembelajar, tangguh, dan bermakna dalam membangun keluarga kokoh dan berperadaban.
- **Misi:**
  1. Menjadi ruang belajar, refleksi, dan saling menguatkan bagi para ayah dan calon ayah.
  2. Menyelenggarakan program edukatif berbasis nilai-nilai Islami, psikologi keluarga, dan pengalaman nyata keayahaan.
  3. Mendorong keterlibatan aktif ayah dalam pengasuhan dan ketahanan keluarga.
  4. Menumbuhkan jejaring dan komunitas ayah yang saling mendukung dalam kebaikan.
  5. Mengembangkan kolaborasi multipihak untuk menggaungkan pentingnya peran ayah di Indonesia.
- **Nilai-Nilai Inti (Core Values):**
  - **Sahabat Tumbuh:** Pendampingan yang hangat, setara, dan tidak menghakimi.
  - **Belajar adalah Kekuatan:** Keinginan untuk terus belajar sebagai bekal terbaik seorang ayah.
  - **Kehadiran Lebih dari Sekadar Hadiah:** Waktu, perhatian, dan keterlibatan emosional adalah yang paling utama.
  - **Ayah Manusia Biasa, Tapi Luar Biasa:** Menerima ketidaksempurnaan sambil terus berikhtiar menjadi lebih baik.
  - **Maskulinitas Rahmah:** Kekuatan yang dilandasi kasih sayang, kelembutan, dan tanggung jawab.

---

## 2. Ruang Lingkup Sistem

### 2.1 Tiga Lingkungan Pengguna (Three User Environments)
SAPA Ayah Digital Platform dibangun sebagai satu aplikasi monolitik modern (Next.js App Router) yang melayani tiga antarmuka terpisah dengan tata kelola izin ketat:
1. **Public Website (`/(public)`):** Portal informasi resmi untuk masyarakat umum, calon peserta, dan calon mitra.
2. **Management Dashboard (`/(dashboard)`):** Panel operasional internal untuk pengurus yayasan, administrator, bendahara, fasilitator, dan PIC kegiatan.
3. **Participant Portal (`/(portal)`):** Ruang privat peserta untuk mengelola pendaftaran, status verifikasi pembayaran transfer manual, jadwal, materi kelas, dan sertifikat.

### 2.2 Batasan di Luar Ruang Lingkup MVP (Out-of-Scope MVP)
Sesuai ketetapan Master Technical Blueprint:
- **Payment Gateway Otomatis:** Tidak diimplementasikan pada MVP. Pembayaran menggunakan transfer rekening bank manual dengan verifikasi manual oleh petugas.
- **Video Conference Native:** Tidak membangun sistem video call mandiri; admin menautkan URL Google Meet / Zoom eksternal.
- **Chat Realtime Internal:** Ditunda hingga tata kelola moderasi disepakati.
- **Data Konseling & Rekam Psikologis (SAPA Recovery):** Dilarang keras dimasukkan ke database operasional umum tanpa kajian privasi dan pemisahan arsitektur khusus.
- **Mobile Native Application:** MVP berfokus pada Responsive Web Design (Mobile-First) dengan dukungan PWA standar.
- **Otomasi API Media Sosial / WhatsApp API Berbayar:** Tidak ada bot WhatsApp resmi otomatis pada MVP; kontak WhatsApp disajikan berupa link statis/tautan langsung (`https://wa.me/...`).

---

## 3. Kebutuhan Fungsional (Functional Requirements)

### 3.1 Public Website (PUB)
| ID | Kebutuhan | Kriteria Penerimaan | Prioritas |
| :--- | :--- | :--- | :--- |
| **PUB-01** | Profil Yayasan | Menampilkan profil, visi, misi, dan nilai inti yayasan secara publik tanpa autentikasi. | MVP |
| **PUB-02** | Katalog Program Unggulan | Menampilkan daftar program unggulan dan detail deskripsinya. Publik hanya melihat program berstatus `published`. | MVP |
| **PUB-03** | Agenda & Kegiatan | Menampilkan jadwal agenda publik mendatang yang berstatus `published`. | MVP |
| **PUB-04** | Call to Action (CTA) Pendaftaran | Tombol interaktif yang mengarahkan pengunjung ke form pendaftaran batch yang sedang aktif/buka. | MVP |
| **PUB-05** | Halaman Kontak & Sosial Media | Menampilkan kanal kontak resmi (WhatsApp, email, media sosial) yang dikelola admin via konfigurasi. | MVP |
| **PUB-06** | Artikel & Kisah (SAPA Stories) | Publikasi artikel edukasi, refleksi, dan kisah keayahaan. Membutuhkan persetujuan sebelum tampil. | V2 |
| **PUB-07** | SEO Dasar & Metadata | Metadata OpenGraph, Twitter Cards, Semantic HTML, Title dinamis, dan `sitemap.xml` otomatis. | MVP |

### 3.2 Autentikasi dan Manajemen Akun (AUTH)
| ID | Kebutuhan | Kriteria Penerimaan | Prioritas |
| :--- | :--- | :--- | :--- |
| **AUTH-01** | Registrasi Akun Peserta | Calon peserta dapat mendaftar dengan email dan password. Data tervalidasi via Zod. | MVP |
| **AUTH-02** | Login / Logout Terproteksi | Menggunakan Supabase Auth (JWT berbasis cookie HttpOnly via SSR). | MVP |
| **AUTH-03** | Reset Password | Alur lupa password mengirimkan email token reset yang aman dan memiliki batas kadaluarsa. | MVP |
| **AUTH-04** | Manajemen Profil Pengguna | Pengguna dapat memperbarui nama, nomor kontak (WhatsApp), dan avatar pribadi. | MVP |
| **AUTH-05** | Multi-Role Authorization | Satu akun dapat memiliki lebih dari satu role (misal: Pengurus merangkap PIC dan Peserta). | MVP |
| **AUTH-06** | Deaktivasi Akun Terkontrol | Admin berwenang dapat menonaktifkan akun tanpa menghapus integritas histori transaksi dan audit log. | MVP |

### 3.3 Struktur Organisasi & Personel (ORG)
| ID | Kebutuhan | Kriteria Penerimaan | Prioritas |
| :--- | :--- | :--- | :--- |
| **ORG-01** | Struktur Unit & Jabatan | Pengelolaan hierarki jabatan (Ketua, Humas, Admin & Editor, Kreator Konten, Bendahara, Fasilitator). | MVP |
| **ORG-02** | Manajemen Personel | Menautkan akun pengguna dengan jabatan struktural dan periode masa tugas (`personnel_assignments`). | MVP |
| **ORG-03** | Deskripsi Pekerjaan (Jobdesk) | Menyimpan rincian tanggung jawab dan tugas pokok per posisi/personel. | MVP |
| **ORG-04** | Penugasan Kegiatan Bergilir | Admin/Ketua dapat menetapkan PIC, Moderator, Narasumber, dan Admin Peserta per kegiatan. | MVP |
| **ORG-05** | Manajemen Anggota & Relawan | Pengelolaan data anggota resmi dan relawan terpisah dari data master peserta. | V2 |

### 3.4 Program & Batch Operasional (PRG)
| ID | Kebutuhan | Kriteria Penerimaan | Prioritas |
| :--- | :--- | :--- | :--- |
| **PRG-01** | Katalog Master Program | Menyimpan portofolio program (SAPA Journey, SAPA Class, Webinar, Podcast, dll.) dengan status aktif/arsip. | MVP |
| **PRG-02** | Pengelolaan Batch / Angkatan | Membuat angkatan dengan konfigurasi: rentang pendaftaran, rentang pelaksanaan, harga (Rp), kuota, dan status. | MVP |
| **PRG-03** | Kegiatan & Sesi Pertemuan | Mendukung pembuatan agenda kegiatan dan sesi kelas (tanggal, jam, tautan Zoom/Meet). | MVP |
| **PRG-04** | Penugasan Tim Pelaksana | Setiap batch/kegiatan memiliki tim pelaksana yang dapat berganti-ganti (fleksibilitas peran). | MVP |
| **PRG-05** | Evaluasi Kegiatan | Pencatatan notula, capaian, kendala, dan rekomendasi pasca-kegiatan. | V2 |

### 3.5 Pendaftaran & Manajemen Peserta (REG)
| ID | Kebutuhan | Kriteria Penerimaan | Prioritas |
| :--- | :--- | :--- | :--- |
| **REG-01** | Pendaftaran Mandiri Peserta | Calon peserta memilih batch, mengisi data diri, dan mengajukan formulir secara mandiri. | MVP |
| **REG-02** | Pendaftaran Input Manual Admin | Admin dapat memasukkan data peserta offline (WhatsApp/tunai) dengan penanda `registration_source`. | MVP |
| **REG-03** | Pemeriksaan Duplikasi Peserta | Peringatan otomatis jika email atau nomor WhatsApp sudah terdaftar; opsi *link to existing participant*. | MVP |
| **REG-04** | Penelusuran Siklus Status | Status: `draft` -> `submitted` -> `under_review` -> `accepted` / `waitlisted` / `cancelled`. | MVP |
| **REG-05** | Batas Kuota & Waiting List | Sistem membatasi pendaftaran saat kuota penuh; otomatis mengalihkan status ke daftar tunggu jika disetujui. | MVP |
| **REG-06** | Riwayat Kepesertaan | Peserta dan admin dapat melihat seluruh riwayat kelas yang pernah diikuti. | MVP |

### 3.6 Pembayaran & Verifikasi Transfer Manual (PAY)
| ID | Kebutuhan | Kriteria Penerimaan | Prioritas |
| :--- | :--- | :--- | :--- |
| **PAY-01** | Instruksi Pembayaran Transfer | Sistem menerbitkan instruksi transfer rekening bank yayasan, kode bayar, nominal, dan batas waktu. | MVP |
| **PAY-02** | Unggah Bukti Transfer | Peserta mengunggah file bukti pembayaran (JPG, PNG, PDF; maks. 2MB) ke private storage Supabase. | MVP |
| **PAY-03** | Verifikasi Manual oleh Reviewer | Bendahara / Reviewer Keuangan menyetujui (`VERIFIED`) atau menolak (`REJECTED`) dengan catatan wajib. | MVP |
| **PAY-04** | Audit Trail Transaksi | Setiap pergantian status pembayaran mencatat reviewer ID, waktu, status lama, status baru, dan alasan. | MVP |
| **PAY-05** | Kebijakan Pembayaran Parsial / Refund | Tidak aktif secara default. Menunggu ketetapan tertulis yayasan. | Belum Diputuskan |

### 3.7 Tugas, Target Kinerja, dan Laporan (TASK)
| ID | Kebutuhan | Kriteria Penerimaan | Prioritas |
| :--- | :--- | :--- | :--- |
| **TASK-01** | Manajemen Tugas (Task Assignment) | Membuat tugas dengan PIC, prioritas, tenggat waktu, dan relasi ke target bulanan. | MVP |
| **TASK-02** | Pembaruan Progres & Bukti | Pengurus memperbarui progres kerja (persentase) beserta catatan atau lampiran bukti. | MVP |
| **TASK-03** | Konfigurasi Target Bulanan | Target KPI disimpan sebagai data dinamis per jabatan/personel (misal: 4x rekap, 1 modul materi). | MVP |
| **TASK-04** | Laporan Mingguan Hari Jumat | Pengurus wajib mengisi 3 field setiap Jumat: (1) Sudah apa, (2) Akan apa, (3) Kendalanya apa. | MVP |
| **TASK-05** | Rekap Progres Mingguan Humas | Humas memiliki panel monitoring status laporan pengurus dan tombol penyusunan rekap mingguan. | MVP |
| **TASK-06** | Rekap Target & Evaluasi 3 Bulanan | Sistem menyediakan kompilasi pencapaian target triwulanan sebagai dasar rotasi peran pengurus. | MVP |

### 3.8 Portal Belajar / Learning Management System Dasar (LMS - V2)
| ID | Kebutuhan | Kriteria Penerimaan | Prioritas |
| :--- | :--- | :--- | :--- |
| **LMS-01** | Kalender & Jadwal Kelas | Peserta melihat jadwal sesi pertemuan batch yang telah terverifikasi lunas. | V2 |
| **LMS-02** | Akses Materi Terproteksi | Materi unduhan/presentasi hanya dapat diakses oleh peserta aktif batch terkait via signed URL. | V2 |
| **LMS-03** | Absensi Pertemuan | Fasilitator mencatat daftar hadir peserta pada setiap sesi kelas. | V2 |
| **LMS-04** | Penerbitan Sertifikat | Admin menerbitkan sertifikat digital jika peserta memenuhi syarat kelulusan/kehadiran. | V2 |
| **LMS-05** | Portal Komunitas Alumni | Direktori alumni terverifikasi untuk jejaring saling mendukung pasca-program. | V2 |

---

## 4. Kebutuhan Nonfungsional (Non-Functional Requirements / NFR)

### 4.1 Keamanan (Security)
- Seluruh endpoint mutasi dilindungi validasi authorization server-side.
- Supabase Row Level Security (RLS) wajib aktif di 100% tabel public schema.
- Kunci `SUPABASE_SERVICE_ROLE_KEY` haram diekspos ke client bundle atau variabel `NEXT_PUBLIC_*`.
- File upload bukti transfer disimpan dalam private bucket dan hanya diakses melalui time-limited Signed URL.

### 4.2 Privasi Data (Data Privacy & Compliance)
- Kepatuhan terhadap UU Perlindungan Data Pribadi (UU No. 27/2022).
- Prinsip minimisasi data: hanya meminta data yang esensial untuk penyelenggaraan program keayahaan.
- Data sensitif program konseling/pemulihan (SAPA Recovery) dilarang disimpan di tabel pendaftaran publik.

### 4.3 Kinerja & Skalabilitas (Performance)
- Server Components digunakan secara default untuk meminimalkan beban komputasi di sisi client.
- Database indexing pada foreign keys, slug, status, dan kolom pencarian utama (email, nomor kontak).
- Waktu respon rata-rata halaman publik < 1.5 detik pada koneksi 4G mobile standar.

### 4.4 Ketersediaan & Keandalan (Availability & Reliability)
- Arsitektur serverless di Vercel Edge/Serverless Functions menjamin ketersediaan tinggi (99.9% SLA).
- Pencadangan berkala database PostgreSQL di Supabase.

### 4.5 Aksesibilitas & Responsivitas (UI/UX)
- Pendekatan Mobile-First: form pendaftaran, portal peserta, dan laporan Jumat harus dioptimalkan untuk layar ponsel.
- Kontras warna teks memenuhi standar WCAG 2.1 AA (rasio kontras minimum 4.5:1 untuk teks biasa).
- Standar bahasa antarmuka utama adalah Bahasa Indonesia baku yang bersahabat dan humanis.

