SAPA AYAH

MASTER TECHNICALBLUEPRINT

Dokumen Induk Perencanaan Sistem Informasi Manajemen,Pembelajaran, dan Komunitas

“Menyapa untuk Tumbuh, Tumbuh untuk Menyapa”


| IDENTITAS DOKUMEN | KETERANGAN |
| --- | --- |
| Organisasi | Yayasan Sahabat Pembelajar Ayah (SAPA) Ayah |
| Versi | 1.0 — Draft blueprint untuk ditinjau dan disetujui |
| Tanggal penyusunan | 13 November 2026 |
| Platform yang direncanakan | Next.js App Router + TypeScript + Supabase + Vercel |
| Status | Perencanaan; belum menjadi persetujuan untuk mulai coding |


Dokumen ini menggabungkan kebutuhan yang didukung oleh dua dokumen sumber dan keputusan tambahan yang disampaikan pemilik proyek. Rekomendasi teknis ditandai sebagai usulan untuk disetujui.

KONTROL DOKUMEN DAN CARA MEMBACA

Dokumen ini merupakan satu dokumen induk untuk menyatukan kebutuhan bisnis, proses operasional, rancangan akses, rancangan data, arsitektur teknis, desain, pengujian, dan roadmap. Dokumen ini belum merupakan spesifikasi implementasi final sampai pemilik proyek menyetujui keputusan yang masih terbuka.


| Label | Makna |
| --- | --- |
| SUMBER | Informasi yang tertulis dalam Profil Yayasan SAPA Ayah atau SAPA Program, Struktur Organisasi & Jobdesk. |
| KEPUTUSAN PROYEK | Ketentuan yang sudah diberikan pemilik proyek dalam Addendum Master Prompt dan jawaban konfirmasi. |
| REKOMENDASI | Usulan desain/teknis dari penyusun; perlu persetujuan jika berdampak pada kebijakan yayasan. |
| BELUM DIPUTUSKAN | Informasi yang tidak tersedia pada sumber dan harus dikonfirmasi sebelum implementasi terkait. |



# Daftar isi

1. Ringkasan eksekutif dan landasan organisasi

2. Ruang lingkup, tujuan, prinsip, dan batasan

3. Pemangku kepentingan dan jenis pengguna

4. Struktur produk dan arsitektur informasi

5. Kebutuhan fungsional (SRS)

6. Pemetaan proses bisnis dan workflow

7. Matriks role-based access control (RBAC)

8. Rancangan data dan ERD

9. Supabase schema, keamanan, dan RLS

10. Arsitektur aplikasi Next.js dan struktur folder

11. Design system dan wireframe tekstual

12. Integrasi, notifikasi, dan kebutuhan nonfungsional

13. Roadmap implementasi dan strategi deployment

14. Rencana pengujian, penerimaan, dan risiko

15. Keputusan terbuka, asumsi, dan persetujuan

16. Lampiran: kamus data ringkas dan checklist

1. RINGKASAN EKSEKUTIF

SAPA Ayah direncanakan memiliki satu platform digital terintegrasi yang menggabungkan website publik, dashboard manajemen internal, dan portal peserta. Platform mendukung pengelolaan organisasi, program, kegiatan, pendaftaran, pembayaran transfer manual, pembelajaran, tugas pengurus, target, laporan, konten, dan komunitas alumni.

Arah ini lebih luas daripada website profil. Namun, pengembangan harus bertahap: versi awal memprioritaskan fondasi organisasi dan operasional, pendaftaran serta pembayaran, dan portal peserta dasar. Fitur pembelajaran lanjutan, alumni, komunitas, dan analitik dapat dikembangkan setelah MVP stabil.


## 1.1 Identitas dan landasan organisasi


| Elemen | Isi yang didukung dokumen sumber |
| --- | --- |
| Nama resmi | Sahabat Pembelajar Ayah (SAPA) Ayah |
| Tagline | “Menyapa untuk Tumbuh, Tumbuh untuk Menyapa” atau “Menyapa Ayah, Ayah yang Menyapa” |
| Visi | Mewujudkan ayah Indonesia yang pembelajar, tangguh, dan bermakna dalam membangun keluarga kokoh dan berperadaban. |
| Misi | Menjadi ruang belajar/refleksi/dukungan; menyelenggarakan program edukatif berbasis nilai Islami, psikologi keluarga, dan pengalaman nyata; mendorong keterlibatan ayah; menumbuhkan jejaring; mengembangkan kolaborasi. |
| Nilai inti | Sahabat Tumbuh; Belajar adalah Kekuatan; Kehadiran Lebih dari Hadiah; Ayah Manusia Biasa, Tapi Luar Biasa; Maskulinitas Rahmah. |



## 1.2 Program unggulan dalam profil yayasan

SAPA Journey — perjalanan keayahaan bertahap.

SAPA Start — calon ayah; pembekalan kesiapan menjadi suami-ayah.

SAPA Grow — ayah muda; parenting Islami, bonding, dan manajemen rumah tangga.

SAPA Lead — ayah aktif; kepemimpinan keluarga dan pengasuhan berbasis nilai.

SAPA Mentor — ayah pembina; fasilitasi dan mentoring.

SAPA Class — kelas daring/luring tematik.

SAPA Camp — kegiatan ayah-anak berbasis alam terbuka.

SAPA Stories — kisah, testimoni, dan refleksi perjalanan ayah.

SAPA Talk — podcast dan sesi bincang.

SAPA Bond — kegiatan ayah-anak untuk membangun kedekatan.

SAPA Hobby — hobi pria dipadukan dengan refleksi peran ayah.

SAPA Recovery — support group, konseling, dan healing session.

Catatan: daftar di atas adalah portofolio program unggulan dalam profil yayasan. Daftar ini tidak otomatis berarti seluruh program sudah aktif atau harus masuk MVP.


## 1.3 Program operasional dalam dokumen Program, Struktur & Jobdesk


| Program | Tujuan/biaya | Waktu pada dokumen |
| --- | --- | --- |
| Podcast YouTube (konsep baru) | Membangun kepercayaan dan menarik audiens; gratis | Bulan 1 |
| Webinar “Ayah, Arahnya ke Mana?” | Peluncuran dan mengumpulkan data ayah muda; gratis | Bulan 1–2 |
| Kelas Menjadi Ayah | Mendampingi ayah baru di tahun-tahun awal; berbayar | Bulan 3 |
| Webinar Pranikah | Menjangkau calon ayah; gratis | Bulan 4–5 |
| Kelas Pranikah | Membekali calon ayah sebelum menikah; berbayar | Bulan 6 |
| Grup Alumni | Komunitas ayah yang saling menguatkan; gratis | Setelah kelas 1 |


Dokumen sumber menyebut tiga hal yang masih perlu diputuskan: bulan mulai program (Bulan 1), jumlah pertemuan setiap kelas, dan harga Kelas Menjadi Ayah serta Kelas Pranikah. Sistem harus mengakomodasi ketiganya sebagai konfigurasi, bukan mengisi angka atau tanggal secara asumtif.

2. TUJUAN, RUANG LINGKUP, DAN PRINSIP


## 2.1 Tujuan sistem

Menyediakan kanal informasi resmi SAPA Ayah kepada publik.

Merapikan data organisasi, pengurus, anggota, relawan, dan pembagian peran.

Mengelola program, batch/angkatan, kegiatan, tugas, target, dan evaluasi.

Mendukung pendaftaran peserta secara mandiri maupun input oleh admin.

Mendukung transfer manual dengan bukti pembayaran dan verifikasi petugas.

Memberikan portal peserta untuk melihat program, jadwal, materi, absensi, dan sertifikat sesuai tahap implementasi.

Menyediakan dasar pengelolaan alumni dan komunitas.

Menyediakan data dan laporan yang dapat membantu pengambilan keputusan.


## 2.2 Ruang lingkup produk


| Lingkungan | Pengguna utama | Tujuan |
| --- | --- | --- |
| Public Website | Masyarakat, calon peserta, mitra | Profil, program, agenda, artikel, konten, kontak, pendaftaran. |
| Management Dashboard | Super Admin, Ketua, pengurus, anggota, relawan, admin, bendahara, fasilitator | Operasional organisasi dan program sesuai hak akses. |
| Participant Portal | Peserta dan alumni | Layanan personal peserta, pembelajaran, pembayaran, dan riwayat. |



## 2.3 Di luar ruang lingkup MVP

Payment gateway dan pembayaran otomatis — tidak dibangun sebelum ada keputusan baru.

Video conference buatan sendiri — gunakan tautan platform eksternal yang dimasukkan admin.

Chat real-time internal — dapat dipertimbangkan setelah kebutuhan dan moderasi disepakati.

Catatan konseling atau rekam dukungan psikologis — tidak dimasukkan ke database operasional standar; perlu kajian privasi, persetujuan, akses khusus, dan tata kelola terpisah.

Aplikasi mobile native — MVP berupa web responsif/PWA opsional.

Integrasi otomatis ke WhatsApp, Instagram, YouTube, atau Spotify — tautan dan embed publik dapat dipertimbangkan; automasi memerlukan kajian API dan persetujuan.


## 2.4 Prinsip desain sistem

Source of truth: dokumen yayasan menjadi sumber untuk identitas, program, struktur, jobdesk, dan target yang sudah ditetapkan.

Configurable: jabatan, pengurus, program, harga, jadwal, dan peran pelaksana dapat dikelola tanpa mengubah kode.

Least privilege: setiap akun hanya mendapat akses minimum yang diperlukan.

Privacy by design: data pribadi, pembayaran, dokumen, dan data sensitif diproteksi sejak desain.

Auditability: perubahan penting memiliki jejak siapa, kapan, dan apa yang diubah.

Mobile-first: formulir peserta dan tugas pengurus harus nyaman digunakan dari ponsel.

Progressive delivery: MVP dahulu, kemudian perluasan berbasis penggunaan nyata.

3. PEMANGKU KEPENTINGAN DAN JENIS PENGGUNA


## 3.1 Struktur organisasi awal dari sumber


| Nama pada dokumen | Posisi | Tugas utama yang disebut |
| --- | --- | --- |
| Dr. Fahrurroji Firman, M.Pd.I | Ketua | Keputusan penting, kurikulum, narasumber utama. |
| Rizqi | Public Relations/Humas | Jejaring, media, moderator, pantau progres. |
| Yusuf | Admin & Editor | Surat, data peserta, DM media sosial, editing video. |
| Yopi | Kreator Konten | Podcast, klip pendek, desain, posting. |
| Ganjar | Bendahara | Keuangan, pendamping peserta, mitra, logistik. |


Sumber menyatakan pengurus tetap, sedangkan peran pelaksana kegiatan dapat bergilir. Alumni dan relawan nantinya dapat ikut mengisi peran kegiatan. Nama dan jabatan disimpan sebagai data yang dapat diubah, bukan ditanam permanen dalam kode.


## 3.2 Jenis akun dan konsep pemisahan


| Konsep | Definisi | Contoh |
| --- | --- | --- |
| User account | Identitas login dan autentikasi | Email dan kredensial Supabase Auth. |
| Profile | Informasi profil dasar akun | Nama tampilan, foto, kontak. |
| Organizational position | Posisi struktural dalam organisasi | Ketua, Humas, Bendahara. |
| Membership | Status hubungan dengan yayasan | Calon anggota, aktif, alumni, nonanggota. |
| Participant profile | Identitas sebagai peserta program | Data peserta kelas dan riwayat kelas. |
| System role | Peran akses dalam aplikasi | Admin Peserta, Finance Reviewer. |
| Program assignment | Penugasan pada program/kegiatan tertentu | PIC, moderator, fasilitator. |


Satu orang dapat memiliki akun, profil peserta, status anggota, jabatan organisasi, dan lebih dari satu system role secara bersamaan. Status peserta tidak otomatis menjadikannya anggota yayasan.


## 3.3 Role yang direkomendasikan


| Role sistem | Tujuan |
| --- | --- |
| Super Admin | Konfigurasi sistem, pengelolaan akses, dan pemeliharaan master data. |
| Ketua | Monitoring lintas program dan persetujuan sesuai kebijakan. |
| Pengurus | Pengelolaan area kerja sesuai posisi dan penugasan. |
| Anggota | Akses fitur yang diberikan sesuai keanggotaan/penugasan. |
| Relawan | Akses terbatas pada kegiatan atau tugas yang ditugaskan. |
| Admin Peserta | Pendaftaran, data peserta, batch, komunikasi administratif. |
| Bendahara / Finance Reviewer | Instruksi rekening, verifikasi pembayaran, transaksi dan laporan keuangan. |
| Kreator Konten | Konten, media, kalender publikasi. |
| Fasilitator | Sesi kelas, daftar peserta yang ditugaskan, dan absensi. |
| Peserta | Akun pribadi dan layanan program yang diikuti. |
| Alumni | Akses fitur alumni/komunitas yang diaktifkan. |


Rekomendasi: role di atas dapat diberikan secara bersamaan. Perlu ditentukan siapa yang boleh menetapkan role, menyetujui pembayaran, dan menyetujui akses sensitif. Super Admin sebaiknya tidak digunakan untuk aktivitas rutin.

4. STRUKTUR PRODUK DAN ARSITEKTUR INFORMASI


## 4.1 Public Website — struktur menu


| Menu | Halaman/fitur | Prioritas |
| --- | --- | --- |
| Beranda | Hero, ringkasan visi, program unggulan, agenda terdekat, cerita, CTA daftar/kontak | MVP |
| Tentang SAPA Ayah | Profil, visi, misi, nilai inti | MVP |
| Program | Daftar program unggulan dan detail program | MVP |
| Agenda/Kegiatan | Agenda publik, detail acara, pendaftaran jika dibuka | MVP |
| Artikel/Cerita | SAPA Stories, artikel edukasi, testimoni dengan persetujuan | V2 |
| Podcast/Media | Tautan YouTube, Instagram, TikTok, Spotify; episode terpilih | V2 |
| Struktur Organisasi | Struktur yang telah disetujui untuk dipublikasikan | V2 |
| Mitra | Mitra yang telah mendapat izin publikasi | V2 |
| Kontak | Kanal kontak dan formulir pertanyaan | MVP |
| Daftar | Pendaftaran program/batch yang sedang dibuka | MVP |



## 4.2 Management Dashboard — struktur menu


| Kelompok menu | Submenu/kemampuan | Prioritas |
| --- | --- | --- |
| Dashboard | Ringkasan tugas, program aktif, peserta, pembayaran menunggu, target | MVP |
| Organisasi | Pengurus, unit, jabatan, job description, anggota, relawan | MVP |
| Program & Kegiatan | Program, batch, kegiatan, PIC, narasumber, moderator, evaluasi | MVP |
| Peserta | Data peserta, pendaftaran, status, import/input admin | MVP |
| Pembayaran | Instruksi transfer, bukti, verifikasi, riwayat | MVP |
| Tugas | Daftar tugas, penugasan, tenggat, status, bukti hasil | MVP |
| Target & Laporan | Target bulanan, progres, laporan Jumat, rekap | MVP |
| Materi & Kelas | Sesi, materi, absensi, sertifikat | V2 |
| Keuangan | Kategori, pemasukan/pengeluaran, laporan | V2; batasan MVP sesuai pembayaran |
| Konten | Ide, kalender, produksi, persetujuan, arsip, tautan publikasi | V2 |
| Mitra | Database mitra dan aktivitas kolaborasi | V2 |
| Alumni & Komunitas | Alumni, keanggotaan komunitas, kegiatan alumni | V2 |
| Dokumen | Arsip, kategori, versi, akses | V2 |
| Laporan | Laporan program, peserta, keuangan, kinerja | V2 |
| Pengaturan | Pengguna, role, permission, rekening, konfigurasi | MVP terbatas |



## 4.3 Participant Portal — struktur menu


| Menu | Fungsi | Prioritas |
| --- | --- | --- |
| Dashboard | Ringkasan kelas, status pembayaran, jadwal dan pengumuman | MVP |
| Profil Saya | Data akun dan profil peserta | MVP |
| Program Saya | Pendaftaran dan program/batch yang diikuti | MVP |
| Pembayaran | Instruksi transfer, upload bukti, status dan riwayat | MVP |
| Jadwal | Jadwal sesi dan tautan pertemuan | V2 |
| Materi | Materi pembelajaran yang diberikan | V2 |
| Absensi | Riwayat kehadiran | V2 |
| Sertifikat | Sertifikat yang sudah diterbitkan | V2 |
| Komunitas/Alumni | Informasi komunitas dan aktivitas alumni | V2 |



## 4.4 Peta URL yang disarankan

/├── /tentang├── /program│   └── /program/[slug]├── /kegiatan│   └── /kegiatan/[slug]├── /artikel│   └── /artikel/[slug]├── /kontak├── /daftar/[batchSlug]├── /login├── /register├── /lupa-password├── /dashboard│   ├── /organisasi│   ├── /program│   ├── /kegiatan│   ├── /peserta│   ├── /pembayaran│   ├── /tugas│   ├── /target│   ├── /laporan│   └── /pengaturan└── /portal    ├── /profil    ├── /program-saya    ├── /pembayaran    ├── /jadwal    ├── /materi    ├── /absensi    └── /sertifikat

Catatan: path adalah usulan. Nama slug proyek Vercel harus diperiksa ketersediaannya. Gunakan satu aplikasi Next.js dengan route groups/layout terpisah untuk public, dashboard, dan portal.

5. SOFTWARE REQUIREMENTS SPECIFICATION (SRS)


## 5.1 Kebutuhan fungsional — Public Website


| ID | Kebutuhan | Kriteria penerimaan ringkas | Prioritas |
| --- | --- | --- | --- |
| PUB-01 | Menampilkan profil yayasan | Visi, misi, nilai, profil dapat dibaca tanpa login. | MVP |
| PUB-02 | Menampilkan program | Admin dapat mengelola deskripsi program; publik hanya melihat program berstatus publish. | MVP |
| PUB-03 | Menampilkan agenda | Agenda publik hanya muncul jika dipublikasikan. | MVP |
| PUB-04 | CTA pendaftaran | Pengunjung dapat menuju form pendaftaran batch yang dibuka. | MVP |
| PUB-05 | Kontak | Kontak resmi/tautan sosial dapat dikelola admin. | MVP |
| PUB-06 | Artikel dan media | Admin dapat membuat dan mempublikasikan artikel/media. | V2 |
| PUB-07 | SEO dasar | Title, description, slug, metadata dan sitemap tersedia. | MVP |



## 5.2 Kebutuhan fungsional — autentikasi dan akun


| ID | Kebutuhan | Kriteria penerimaan ringkas | Prioritas |
| --- | --- | --- | --- |
| AUTH-01 | Registrasi peserta | Email dan data wajib divalidasi; verifikasi email sesuai konfigurasi. | MVP |
| AUTH-02 | Login/logout | Sesi dikelola aman melalui Supabase Auth. | MVP |
| AUTH-03 | Reset password | Pengguna dapat meminta tautan reset yang valid. | MVP |
| AUTH-04 | Profil | Pengguna dapat melihat/memperbarui field yang diizinkan. | MVP |
| AUTH-05 | Role multi-peran | Satu akun dapat memiliki beberapa role aktif. | MVP |
| AUTH-06 | Aktivasi/penonaktifan | Admin berwenang dapat menonaktifkan akses tanpa menghapus histori transaksi. | MVP |



## 5.3 Kebutuhan fungsional — organisasi


| ID | Kebutuhan | Kriteria penerimaan ringkas | Prioritas |
| --- | --- | --- | --- |
| ORG-01 | Kelola struktur organisasi | Unit, jabatan, atasan, periode jabatan dapat dikelola. | MVP |
| ORG-02 | Kelola personel | Personel dapat ditambah, diperbarui, diarsipkan. | MVP |
| ORG-03 | Job description | Tugas dan tanggung jawab dapat dikaitkan ke jabatan/personel. | MVP |
| ORG-04 | Penugasan kegiatan | Peran PIC, narasumber, moderator, admin peserta, konten, logistik dapat diberikan per kegiatan. | MVP |
| ORG-05 | Anggota dan relawan | Status dan data anggota/relawan dikelola terpisah dari akun login. | V2 |



## 5.4 Kebutuhan fungsional — program dan kegiatan


| ID | Kebutuhan | Kriteria penerimaan ringkas | Prioritas |
| --- | --- | --- | --- |
| PRG-01 | Katalog program | Program unggulan dan program operasional dapat dicatat tanpa harus semuanya aktif. | MVP |
| PRG-02 | Batch/angkatan | Satu program dapat memiliki beberapa batch dengan tanggal, harga, kapasitas dan status berbeda. | MVP |
| PRG-03 | Kegiatan dan sesi | Batch dapat memiliki beberapa kegiatan/sesi. | MVP dasar; sesi V2 |
| PRG-04 | PIC dan tim kegiatan | Setiap kegiatan memiliki penugasan yang dapat berganti. | MVP |
| PRG-05 | Evaluasi kegiatan | Catatan hasil, kendala, dan tindak lanjut dapat disimpan. | V2 |



## 5.5 Kebutuhan fungsional — pendaftaran dan peserta


| ID | Kebutuhan | Kriteria penerimaan ringkas | Prioritas |
| --- | --- | --- | --- |
| REG-01 | Pendaftaran mandiri | Pengunjung dapat mendaftar ke batch yang dibuka. | MVP |
| REG-02 | Input admin | Admin dapat membuat pendaftaran dari sumber offline/WhatsApp. | MVP |
| REG-03 | Pemeriksaan duplikasi | Sistem memberi peringatan kemungkinan peserta sama berdasarkan email/nomor kontak; admin memutuskan penggabungan. | MVP |
| REG-04 | Status pendaftaran | Status draft/submitted/under_review/accepted/waitlisted/cancelled dapat ditelusuri. | MVP |
| REG-05 | Kapasitas batch | Sistem menolak atau memberi status daftar tunggu saat kuota penuh sesuai konfigurasi. | MVP |
| REG-06 | Riwayat peserta | Peserta dan admin dapat melihat riwayat sesuai hak akses. | MVP |



## 5.6 Kebutuhan fungsional — pembayaran


| ID | Kebutuhan | Kriteria penerimaan ringkas | Prioritas |
| --- | --- | --- | --- |
| PAY-01 | Instruksi transfer | Nominal, rekening, batas waktu dan instruksi tampil untuk pendaftaran terkait. | MVP |
| PAY-02 | Upload bukti | Peserta dapat mengunggah bukti dengan tipe/ukuran file yang dibatasi. | MVP |
| PAY-03 | Verifikasi manual | Petugas berwenang menyetujui/menolak dengan catatan. | MVP |
| PAY-04 | Riwayat status | Setiap perubahan status dan pelaku tercatat. | MVP |
| PAY-05 | Pembayaran parsial/refund | Belum menjadi fitur sampai kebijakan disetujui. | Belum diputuskan |



## 5.7 Kebutuhan fungsional — tugas, target, dan laporan


| ID | Kebutuhan | Kriteria penerimaan ringkas | Prioritas |
| --- | --- | --- | --- |
| TASK-01 | Buat dan tugaskan tugas | Tugas memiliki penanggung jawab, deskripsi, prioritas, tenggat, status. | MVP |
| TASK-02 | Pembaruan progres | Pengguna yang ditugaskan dapat mengirim progres dan bukti. | MVP |
| TASK-03 | Target bulanan | Target dapat dikaitkan ke jabatan/personel dan periode. | MVP |
| TASK-04 | Laporan Jumat | Pengurus dapat mengisi sudah dilakukan, rencana berikutnya, kendala. | MVP |
| TASK-05 | Rekap Humas | Humas dapat melihat status laporan mingguan dan membuat rangkuman. | MVP |
| TASK-06 | Evaluasi tiga bulanan | Sistem menyediakan rekap target dan catatan evaluasi. | MVP dasar |



## 5.8 Kebutuhan fungsional — portal belajar


| ID | Kebutuhan | Kriteria penerimaan ringkas | Prioritas |
| --- | --- | --- | --- |
| LMS-01 | Jadwal kelas | Peserta melihat jadwal batch yang diikutinya. | V2 |
| LMS-02 | Materi | Fasilitator/admin mengunggah materi; akses dibatasi pada peserta yang berhak. | V2 |
| LMS-03 | Absensi | Fasilitator mencatat kehadiran per sesi. | V2 |
| LMS-04 | Sertifikat | Admin menerbitkan sertifikat setelah syarat yang disepakati terpenuhi. | V2 |
| LMS-05 | Komunitas alumni | Alumni yang memenuhi aturan dapat melihat aktivitas komunitas. | V2 |



## 5.9 Kebutuhan fungsional — keuangan, konten, mitra, arsip

Keuangan: pencatatan pemasukan/pengeluaran, kategori, periode, lampiran, dan laporan; hak akses khusus bendahara/pihak yang disetujui.

Konten: ide, jenis konten, PIC, status produksi, jadwal, aset, caption, dan URL publikasi.

Mitra: data organisasi/kontak, jenis hubungan, catatan komunikasi, aktivitas kolaborasi; batasi data pribadi.

Arsip: kategori, metadata dokumen, file privat/publik, pemilik, tingkat akses, dan histori perubahan.

Notifikasi: pemberitahuan status pendaftaran/pembayaran/tugas/jadwal; kanal email dalam MVP jika dikonfigurasi, kanal lain menunggu persetujuan.

6. BUSINESS PROCESS MAPPING DAN WORKFLOW


## 6.1 Pendaftaran online

Pengunjung → pilih program/batch → isi formulir → buat/masuk akun→ sistem validasi → pendaftaran tercatat → tampil instruksi transfer→ peserta upload bukti → petugas verifikasi   ├─ disetujui → status pembayaran terverifikasi → akses program aktif   └─ ditolak → alasan/catatan → peserta mengirim bukti baru→ peserta mengikuti program → absensi/materi → penyelesaian → sertifikat (bila berlaku)


## 6.2 Pendaftaran oleh admin

Admin mencari peserta berdasarkan email/nomor kontak untuk menghindari duplikasi.

Jika sudah ada, admin memilih profil yang benar; jika belum, admin membuat data peserta.

Admin membuat pendaftaran ke batch yang sesuai dan mencatat sumber pendaftaran.

Jika peserta belum memiliki akun, sistem mengirim undangan aktivasi atau admin menandai bahwa aktivasi masih diperlukan.

Proses pembayaran mengikuti mekanisme transfer manual yang sama.

Seluruh perubahan tercatat dalam audit log.


## 6.3 Verifikasi pembayaran

PENDING → bukti diunggah (SUBMITTED) → UNDER_REVIEW   ├─ valid → VERIFIED   └─ tidak valid → REJECTED + catatanREJECTED → peserta unggah ulang → SUBMITTEDSemua transisi menyimpan aktor, waktu, nilai lama/baru, dan catatan.

Status pembayaran tidak boleh berubah menjadi VERIFIED hanya karena file bukti diunggah. Keputusan verifikasi dilakukan petugas yang diberi izin.


## 6.4 Siklus tugas dan target

Target periode dibuat → tugas diturunkan/ditautkan ke target→ penugasan PIC → progres dan bukti diperbarui→ tenggat/pengingat → review pengurus/ketua→ rekap mingguan → evaluasi tiga bulanan → target/peran disesuaikan


## 6.5 Ritme kerja dari dokumen sumber


| Ritme | Praktik yang tercantum | Dukungan sistem yang disarankan |
| --- | --- | --- |
| Setiap Jumat | Setiap pengurus menulis tiga baris: sudah apa, akan apa, kendalanya. | Form laporan mingguan dengan tiga field wajib dan histori. |
| Rekap mingguan | Humas merangkum laporan dan mengingatkan yang belum mengisi. | Dashboard status pengisian dan fitur rangkuman. |
| Dua mingguan | Rapat online 30 menit dipimpin Ketua untuk keputusan dan kendala. | Agenda rapat, catatan keputusan, dan tindak lanjut (opsional). |
| Tiga bulanan | Meninjau target dan beban kerja; siapa pun boleh bertukar peran. | Rekap target dan catatan evaluasi; histori perubahan penugasan. |



## 6.6 Target bulanan dari dokumen sumber


| Posisi | Target yang tertulis dalam dokumen |
| --- | --- |
| Ketua | 1 modul materi selesai; 2 rapat terlaksana; target ketiga tertulis “2 episode podcast dihadiri” (redaksi sumber perlu dikonfirmasi). |
| Humas | 1 narasumber atau mitra baru; 1 publikasi lewat media atau influencer; 4× rangkuman progres, tiap Jumat. |
| Admin & Editor | 2 video YouTube selesai diedit; membalas DM maksimal 24 jam; sertifikat terkirim H+3 setiap acara. |
| Kreator Konten | 2 episode YouTube direkam; 10 konten pendek terposting; poster setiap acara terbit H−14. |
| Bendahara | 1 laporan keuangan akhir bulan; 2 kunjungan calon mitra; pengingat sebelum setiap sesi kelas pada H−1. |


Penting: redaksi target Ketua pada dokumen sumber perlu diklarifikasi. Jangan mengubah “2 episode podcast dihadiri” menjadi target lain sebelum dikonfirmasi. Target numerik disimpan sebagai konfigurasi dan dapat ditinjau tiap tiga bulan.

7. MATRIKS RBAC — RANCANGAN AWAL

RBAC final harus disetujui organisasi. Matriks berikut adalah usulan hak minimum untuk memulai pembahasan. Hak akses rinci perlu diimplementasikan sebagai permission granular, bukan hanya pengecekan nama role.


| Modul/aksi | Super Admin | Ketua | Pengurus terkait | Admin Peserta | Bendahara | Fasilitator | Peserta/Alumni |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Pengaturan sistem | Kelola | Lihat terbatas | Tidak | Tidak | Tidak | Tidak | Tidak |
| Pengguna & role | Kelola | Lihat/ajukan* | Tidak | Tidak | Tidak | Tidak | Tidak |
| Struktur & jobdesk | Kelola | Kelola/Setujui | Kelola area* | Tidak | Tidak | Tidak | Tidak |
| Program & batch | Kelola | Setujui/kelola | Kelola jika ditugaskan | Lihat/kelola peserta | Lihat biaya | Lihat batch tugas | Lihat yang diikuti |
| Kegiatan & PIC | Kelola | Kelola | Kelola sesuai penugasan | Kelola peserta | Kelola logistik* | Kelola sesi tugas | Lihat jadwal |
| Data peserta | Akses terbatas | Lihat agregat/izin | Sesuai tugas | Kelola | Data minimum pembayaran | Peserta kelas tugas | Data sendiri |
| Verifikasi pembayaran | Tidak rutin | Lihat laporan | Tidak | Lihat status* | Verifikasi | Tidak | Kirim bukti sendiri |
| Keuangan | Kelola teknis terbatas | Lihat laporan/otorisasi* | Tidak | Tidak | Kelola | Tidak | Tidak |
| Tugas & target | Kelola | Monitoring | Kelola tugas sendiri/tim | Tugas terkait | Tugas terkait | Tugas sesi | Tidak |
| Materi & absensi | Kelola | Lihat agregat | Jika ditugaskan | Administrasi | Tidak | Kelola kelas tugas | Lihat milik sendiri |
| Sertifikat | Kelola | Lihat | Jika ditugaskan | Terbitkan sesuai izin | Tidak | Ajukan/konfirmasi | Unduh sendiri |
| Konten publik | Kelola | Setujui opsional | Buat sesuai tugas | Edit jika ditugaskan | Tidak | Tidak | Lihat publik |
| Dokumen privat | Atur akses | Sesuai izin | Sesuai tugas | Dokumen peserta terbatas | Dokumen keuangan | Materi kelas | Dokumen sendiri |


*Hak yang bertanda bintang harus diputuskan dan dibatasi lebih lanjut. Akses Super Admin ke isi data sensitif sebaiknya tidak otomatis berarti kebutuhan operasional sehari-hari.


## 7.1 Aturan otorisasi wajib

Default deny: tidak ada akses kecuali diberikan secara eksplisit.

Pisahkan izin read, create, update, delete/archive, approve, export, dan manage.

Verifikasi pembayaran harus memerlukan permission khusus; uploader tidak boleh menyetujui bukti miliknya sendiri jika kebijakan pemisahan tugas diberlakukan.

Role tidak boleh diberikan melalui input bebas dari browser. Pemberian role dilakukan melalui server-side action yang memeriksa izin.

Pengguna dapat memiliki banyak role; izin efektif merupakan gabungan permission yang diizinkan, dengan pengecualian untuk data sensitif.

Semua akses baris data peserta, pembayaran, dokumen, dan keuangan juga ditegakkan oleh RLS.

8. RANCANGAN DATA DAN ERD


## 8.1 Prinsip model data

Gunakan UUID sebagai primary key.

Semua tabel operasional memiliki created_at dan updated_at; tabel penting juga created_by/updated_by.

Gunakan foreign key dan constraint; hindari relasi hanya berdasarkan teks nama.

Gunakan tabel referensi/status atau enum yang terkelola; hindari hard-code status di banyak tempat.

Arsipkan data operasional yang memiliki histori, jangan menghapus transaksi/absensi secara permanen.

Pisahkan program unggulan (program catalog) dari batch/angkatan operasional.

Pisahkan pendaftaran, pembayaran, verifikasi pembayaran, sesi, absensi, dan sertifikat.


## 8.2 Entitas dan tabel yang direkomendasikan


| Domain | Tabel | Fungsi ringkas |
| --- | --- | --- |
| Akun | profiles | Profil dasar yang terhubung ke auth.users. |
| Akses | roles, permissions, role_permissions, user_roles | RBAC dan penetapan multi-role. |
| Organisasi | organizational_units, positions, personnel_assignments, job_descriptions | Unit, jabatan, masa jabatan, personel dan jobdesk. |
| Keanggotaan | memberships, membership_status_history | Status anggota terpisah dari peserta. |
| Program | programs, program_batches, activities | Katalog program, batch, dan kegiatan. |
| Penugasan | activity_assignments | PIC, narasumber, moderator, admin, logistik, konten. |
| Peserta | participants, registrations | Profil peserta dan pendaftaran ke batch. |
| Pembayaran | payment_instructions, payments, payment_verifications | Instruksi transfer, transaksi, verifikasi. |
| Pembelajaran | class_sessions, learning_materials, attendance_records, certificates | Sesi, materi, kehadiran, sertifikat. |
| Operasional | tasks, task_assignments, task_updates | Tugas, PIC, progres, bukti. |
| Kinerja | performance_targets, target_periods, progress_updates | Target per periode dan progres. |
| Pelaporan | weekly_reports, meeting_records, evaluation_reports | Laporan Jumat, rapat, evaluasi. |
| Keuangan | financial_categories, financial_transactions | Catatan pemasukan/pengeluaran. |
| Konten | content_items, content_assets, publication_channels | Kalender, produksi, aset, publikasi. |
| Mitra | partners, partnership_activities | Mitra dan aktivitas kolaborasi. |
| Alumni | alumni_profiles, community_memberships | Data alumni dan komunitas. |
| Dokumen | documents, document_categories | Metadata dan akses arsip. |
| Sistem | notifications, audit_logs, system_settings | Notifikasi, audit, konfigurasi. |



## 8.3 ERD konseptual

AUTH USERS 1──1 PROFILESPROFILES 1──N USER_ROLES N──1 ROLES N──N PERMISSIONSPROFILES 1──N PERSONNEL_ASSIGNMENTS N──1 POSITIONSPROFILES 1──0..1 PARTICIPANTSPROFILES 1──N MEMBERSHIPSPROGRAMS 1──N PROGRAM_BATCHES 1──N ACTIVITIESPROGRAM_BATCHES 1──N REGISTRATIONS N──1 PARTICIPANTSREGISTRATIONS 1──N PAYMENTS 1──N PAYMENT_VERIFICATIONSPROGRAM_BATCHES 1──N CLASS_SESSIONSCLASS_SESSIONS 1──N ATTENDANCE_RECORDS N──1 PARTICIPANTSPROGRAM_BATCHES 1──N LEARNING_MATERIALSPARTICIPANTS 1──N CERTIFICATESTASKS 1──N TASK_ASSIGNMENTSTASK_ASSIGNMENTS 1──N TASK_UPDATESPERFORMANCE_TARGETS 1──N PROGRESS_UPDATESPROFILES 1──N WEEKLY_REPORTSPARTNERS 1──N PARTNERSHIP_ACTIVITIES

ERD di atas bersifat konseptual dan menunjukkan relasi utama, bukan seluruh constraint final. Kardinalitas, unique key, dan aturan penghapusan harus ditentukan saat migrasi database disusun.


## 8.4 Field penting per tabel


| Tabel | Field inti yang disarankan |
| --- | --- |
| profiles | id (FK auth.users), full_name, display_name, phone, avatar_path, account_status. |
| roles | id, code, name, description, is_system_role. |
| permissions | id, code, module, action, description. |
| user_roles | user_id, role_id, assigned_by, assigned_at, expires_at. |
| positions | id, unit_id, title, parent_position_id, is_active. |
| personnel_assignments | profile_id, position_id, start_date, end_date, assignment_status. |
| programs | id, name, slug, description, program_type, visibility, status. |
| program_batches | id, program_id, name, registration_open_at, registration_close_at, start_at, end_at, price, capacity, status. |
| registrations | id, participant_id, batch_id, registration_source, status, submitted_at, reviewed_by. |
| payments | id, registration_id, amount_due, amount_paid, status, proof_storage_path, submitted_at. |
| payment_verifications | id, payment_id, reviewer_id, decision, notes, decided_at. |
| class_sessions | id, batch_id, title, starts_at, ends_at, meeting_url, facilitator_id. |
| attendance_records | id, session_id, participant_id, attendance_status, recorded_by, recorded_at. |
| tasks | id, title, description, priority, status, due_at, created_by, related_target_id. |
| task_assignments | task_id, assignee_id, assigned_by, assigned_at. |
| weekly_reports | id, profile_id, week_start, completed, next_plan, blockers, submitted_at. |
| performance_targets | id, profile_id/position_id, title, metric, target_value, period_start, period_end. |
| audit_logs | id, actor_id, action, entity_type, entity_id, before_data, after_data, created_at. |


9. DATABASE SCHEMA SUPABASE DAN RLS


## 9.1 Rekomendasi schema

Untuk MVP, gunakan schema public untuk tabel aplikasi yang memang perlu diakses melalui Supabase API dan lindungi dengan RLS. Fungsi internal/administratif yang tidak boleh dipanggil langsung dapat ditempatkan dalam schema privat yang sesuai. Jangan membuat semua tabel dapat dibaca publik.


## 9.2 Kebijakan RLS minimum


| Data | Aturan akses minimum |
| --- | --- |
| profiles | Pengguna dapat membaca/mengubah field profilnya sendiri; akses admin dibatasi permission. |
| user_roles | Pengguna tidak dapat menambah role untuk dirinya sendiri. Hanya role manager yang berwenang. |
| participants | Peserta melihat profil peserta yang terhubung ke akunnya; petugas melihat sesuai tugas. |
| registrations | Peserta melihat pendaftarannya sendiri; admin peserta mengelola; publik tidak dapat membaca. |
| payments | Peserta membaca pembayaran sendiri dan mengunggah bukti; reviewer berizin dapat memeriksa. |
| payment_verifications | Hanya reviewer berizin dapat membuat keputusan; peserta hanya membaca hasil yang relevan. |
| learning_materials | Hanya peserta yang terdaftar/berhak pada batch terkait yang dapat membaca materi privat. |
| attendance_records | Peserta membaca kehadiran sendiri; fasilitator hanya mengelola sesi yang ditugaskan. |
| financial_transactions | Bendahara/role keuangan yang berizin; peserta dan relawan tidak memiliki akses. |
| documents | Akses berdasarkan klasifikasi dokumen dan hubungan pengguna dengan dokumen. |
| audit_logs | Tidak dapat diubah oleh pengguna biasa; hanya role audit/administrasi terbatas yang dapat membaca. |



## 9.3 Ketentuan keamanan Supabase

Aktifkan RLS pada seluruh tabel yang dapat diakses melalui API.

Jangan pernah menaruh SUPABASE_SERVICE_ROLE_KEY pada client bundle, browser, atau variabel NEXT_PUBLIC.

Gunakan anon/publishable key pada frontend dengan RLS aktif.

Operasi administratif memakai server-side code dan memeriksa authorization sebelum melakukan perubahan.

Storage bucket dipisahkan: public-assets untuk aset publik; private-payment-proofs, private-documents, dan private-learning-materials untuk file terbatas.

Gunakan signed URL berumur pendek untuk file privat; jangan membuat bucket bukti transfer menjadi public.

Batasi MIME type dan ukuran upload; validasi juga di server.

Audit perubahan role, status pembayaran, transaksi, dan data penting.

Jangan menyimpan password, token, atau data autentikasi sensitif di tabel profil.

Gunakan backup dan uji pemulihan sesuai paket/kapabilitas Supabase yang dipilih.


## 9.4 Contoh pola kebijakan (ilustratif)

-- Contoh konseptual; nama tabel/fungsi harus disesuaikanALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;-- Peserta hanya dapat membaca pendaftaran miliknya.CREATE POLICY "participant reads own registrations"ON public.registrationsFOR SELECTTO authenticatedUSING (  participant_id IN (    SELECT p.id    FROM public.participants p    WHERE p.profile_id = (SELECT auth.uid())  ));-- Kebijakan admin harus memakai fungsi permission yang aman,-- misalnya public.has_permission('registrations.manage').-- Jangan mengandalkan role yang dikirim dari client.

Contoh tersebut bukan migration siap produksi. Fungsi has_permission harus dirancang aman dari recursive RLS, privilege escalation, dan manipulasi client; seluruh policy wajib diuji dengan akun dari setiap role.

10. ARSITEKTUR APLIKASI NEXT.JS


## 10.1 Stack yang direkomendasikan


| Lapisan | Teknologi | Alasan |
| --- | --- | --- |
| Framework | Next.js App Router | Satu aplikasi untuk public, dashboard, dan portal; routing dan rendering modern. |
| Bahasa | TypeScript | Tipe data yang kuat untuk domain organisasi dan transaksi. |
| UI | Tailwind CSS + shadcn/ui | Komponen konsisten dan mudah dikustomisasi. |
| Database | Supabase PostgreSQL | Relasional, constraint, transaksi, dan query laporan. |
| Auth | Supabase Auth | Autentikasi dan manajemen sesi. |
| Storage | Supabase Storage | Aset publik dan file privat dengan policy. |
| Validasi | Zod + React Hook Form | Validasi form client/server dan pengalaman input. |
| Chart | Recharts | Visualisasi progres dan ringkasan. |
| Deployment | Vercel | Deployment Next.js dan preview environment. |
| Version control | GitHub | Kolaborasi, pull request, dan CI. |



## 10.2 Prinsip arsitektur

Gunakan Server Components secara default; Client Components hanya untuk interaksi yang memerlukannya.

Gunakan Server Actions atau Route Handlers untuk mutasi yang perlu validasi dan pemeriksaan hak akses server-side.

Semua query data sensitif tetap harus dilindungi RLS; pemeriksaan server bukan pengganti RLS.

Pisahkan domain logic dari komponen UI agar aturan pembayaran, pendaftaran, dan akses dapat diuji.

Gunakan migration SQL yang tersimpan di repository; jangan hanya mengubah schema manual di dashboard.

Gunakan environment terpisah untuk local/development, preview/staging, dan production.


## 10.3 Struktur folder yang disarankan

src/├── app/│   ├── (public)/│   │   ├── page.tsx│   │   ├── tentang/│   │   ├── program/│   │   ├── kegiatan/│   │   └── daftar/[batchSlug]/│   ├── (auth)/│   │   ├── login/│   │   ├── register/│   │   └── lupa-password/│   ├── (dashboard)/│   │   └── dashboard/│   │       ├── organisasi/│   │       ├── program/│   │       ├── peserta/│   │       ├── pembayaran/│   │       ├── tugas/│   │       └── target/│   ├── (portal)/│   │   └── portal/│   │       ├── profil/│   │       ├── program-saya/│   │       ├── pembayaran/│   │       └── materi/│   └── api/├── components/│   ├── ui/│   ├── public/│   ├── dashboard/│   └── portal/├── features/│   ├── auth/│   ├── organization/│   ├── programs/│   ├── registrations/│   ├── payments/│   ├── tasks/│   └── learning/├── lib/│   ├── supabase/│   ├── auth/│   ├── permissions/│   ├── validations/│   └── utils/├── types/└── styles/supabase/├── migrations/├── seed.sql└── tests/


## 10.4 Environment variables

NEXT_PUBLIC_SUPABASE_URL=NEXT_PUBLIC_SUPABASE_ANON_KEY=SUPABASE_SERVICE_ROLE_KEY=   # server only; never NEXT_PUBLICNEXT_PUBLIC_SITE_URL=

Nama key Supabase dapat berubah mengikuti format project/SDK yang dipilih. Simpan secrets di Vercel Environment Variables dan local .env.local yang tidak dikomit ke Git.

11. DESIGN SYSTEM SAPA AYAH DAN WIREFRAME


## 11.1 Palet warna


| Token | Hex | Penggunaan |
| --- | --- | --- |
| Primary Blue | #547F9F | Tombol utama, link, elemen identitas. |
| Deep Blue | #385A75 | Heading, sidebar aktif, teks kontras. |
| Soft Blue | #E8F0F5 | Panel lembut, hover, highlight. |
| Background | #F5F7F8 | Latar halaman. |
| Dark Text | #252D35 | Teks utama. |
| White | #FFFFFF | Kartu dan permukaan. |
| Success (status) | Pilih token aksesibel | Status berhasil; bukan warna branding utama. |
| Warning/Danger | Pilih token aksesibel | Peringatan dan kegagalan. |


Primary #547F9F adalah estimasi warna dominan dari logo yang diberikan dan dipakai sebagai token awal; verifikasi ulang dari file logo resolusi asli sebelum finalisasi brand guideline. Pastikan kontras teks memenuhi aksesibilitas.


## 11.2 Tipografi dan gaya

Font: Plus Jakarta Sans atau Inter; pilih satu setelah uji keterbacaan.

Gaya: modern, minimalis, hangat, humanis, edukatif, tidak terlalu korporat.

Gunakan ruang putih, hierarki heading jelas, kartu sederhana, dan ikon konsisten.

Public website menonjolkan cerita, nilai, program, dan ajakan bertindak.

Dashboard mengutamakan kepadatan informasi yang tetap terbaca dan navigasi konsisten.

Portal peserta mengutamakan kejelasan langkah berikutnya, jadwal, status, dan materi.


## 11.3 Wireframe tekstual — Beranda

[HEADER: Logo | Tentang | Program | Kegiatan | Cerita | Kontak | Login][HERO: headline sesuai pesan yayasan | deskripsi | CTA Jelajahi Program][SECTION: Tentang SAPA Ayah + visi ringkas][SECTION: Program unggulan / kartu program][SECTION: Agenda/kegiatan yang dibuka][SECTION: Cerita / artikel / podcast][SECTION: Mitra (hanya mitra yang disetujui untuk publikasi)][CTA: Bergabung / Daftar Program][FOOTER: identitas, kontak, kanal sosial, kebijakan privasi]


## 11.4 Wireframe tekstual — Dashboard internal

[SIDEBAR: Dashboard, Organisasi, Program, Peserta, Pembayaran,         Tugas, Target, Laporan, Pengaturan][TOPBAR: Breadcrumb | Search (opsional) | Notifikasi | Profil][WELCOME: nama pengguna + konteks role][KPI: tugas saya | tenggat dekat | program aktif | pembayaran menunggu][MAIN: daftar tugas saya | progres target | laporan mingguan][RIGHT/LOWER: agenda terdekat | aktivitas terbaru]


## 11.5 Wireframe tekstual — Portal peserta

[HEADER/SIDEBAR: Ringkasan | Program Saya | Pembayaran | Jadwal             | Materi | Absensi | Sertifikat | Profil][WELCOME: nama peserta][STATUS CARD: pendaftaran | pembayaran | kelas aktif][UPCOMING: jadwal sesi berikutnya][LEARNING: materi terbaru / progres (jika modul LMS aktif)][HELP: kontak admin / panduan]


## 11.6 Komponen UI reusable

AppShell, Sidebar, Topbar, Breadcrumbs, PageHeader.

DataTable dengan pencarian, filter, pagination, dan empty state.

StatusBadge dengan daftar status baku.

FormField, FileUpload, ConfirmDialog, Toast/Alert.

StatCard, ProgressCard, ActivityFeed, CalendarList.

PublicHeader, PublicFooter, ProgramCard, EventCard.

ParticipantStatusCard, PaymentTimeline, LearningResourceCard.

12. KEBUTUHAN NONFUNGSIONAL DAN INTEGRASI


## 12.1 Kebutuhan nonfungsional


| Area | Persyaratan |
| --- | --- |
| Keamanan | RLS, RBAC, validasi server, proteksi secrets, audit log, upload privat. |
| Privasi | Minimisasi data, tujuan pemrosesan jelas, pemberitahuan privasi, retensi dan penghapusan sesuai kebijakan. |
| Kinerja | Halaman publik ringan; pagination untuk tabel; optimasi gambar; query terindeks. |
| Ketersediaan | Gunakan layanan terkelola Vercel/Supabase; tetapkan prosedur backup dan pemulihan. |
| Aksesibilitas | Kontras memadai, label form, navigasi keyboard, pesan error jelas. |
| Responsif | Mobile-first; fungsi penting dapat dipakai di ponsel. |
| Maintainability | TypeScript, linting, test, migrations, dokumentasi dan code review. |
| Audit | Catat perubahan penting termasuk pembayaran, role, dan data keuangan. |
| Lokalisasi | Bahasa antarmuka awal Bahasa Indonesia; format tanggal dan mata uang Indonesia. |



## 12.2 Integrasi yang mungkin dibutuhkan


| Integrasi | Tahap | Catatan |
| --- | --- | --- |
| Email transaksional | MVP bila dibutuhkan | Untuk verifikasi akun, reset password, status pendaftaran/pembayaran; pilih provider dan domain pengirim. |
| WhatsApp | Belum diputuskan | Tahap awal cukup tampilkan kontak/tautan; API resmi memerlukan akun, template, biaya dan persetujuan. |
| YouTube/Instagram/TikTok/Spotify | V2 | Mulai dari tautan atau embed yang diizinkan; hindari scraping. |
| Zoom/Google Meet | MVP sederhana | Admin memasukkan URL per sesi; jangan simpan kredensial host. |
| Ekspor CSV/PDF | V2 | Batasi berdasarkan permission dan catat ekspor data sensitif. |



## 12.3 Privasi data khusus

Profil yayasan menyebut SAPA Recovery yang mencakup support group, konseling, dan healing session. Data terkait pengalaman pemulihan, kondisi psikologis, relasi keluarga, atau catatan konseling dapat sangat sensitif. Rekomendasi: jangan mengumpulkan atau menyimpan catatan konseling dalam modul peserta umum. Jika layanan digital untuk SAPA Recovery benar-benar diperlukan, lakukan kajian hukum/privasi, dasar pemrosesan, persetujuan eksplisit, akses profesional yang sah, retensi, prosedur insiden, dan pemisahan teknis sebelum membangun fitur.

13. ROADMAP IMPLEMENTASI


| Tahap | Cakupan | Hasil/gerbang |
| --- | --- | --- |
| 0. Finalisasi blueprint | Konfirmasi keputusan terbuka, SRS, ERD, RBAC, wireframe, desain, rencana keamanan. | Persetujuan tertulis blueprint. |
| 1. Fondasi | Repo, Next.js, Supabase, environment, Auth, profil, RBAC, layout. | Login dan role berjalan aman. |
| 2. Public + organisasi | Profil publik, program, struktur, personel, jobdesk. | Informasi yayasan dapat dikelola. |
| 3. Operasional | Program, batch, kegiatan, penugasan, tugas, target, laporan Jumat. | Alur kerja inti pengurus berjalan. |
| 4. Peserta + pembayaran | Registrasi online/admin, deteksi duplikasi, upload bukti, verifikasi manual, portal dasar. | Peserta dapat mendaftar dan melihat status. |
| 5. LMS dan perluasan | Sesi, materi, absensi, sertifikat, konten, keuangan, mitra, alumni. | Fitur lanjutan sesuai prioritas. |
| 6. Hardening & deployment | UAT, security test, performance, backup, deployment Vercel dan monitoring. | Persetujuan rilis produksi. |


Durasi tiap tahap belum ditetapkan karena kapasitas tim pengembang, ketersediaan konten, dan keputusan operasional belum diketahui. Estimasi waktu baru dibuat setelah ruang lingkup MVP dan sumber daya disepakati.


## 13.1 Definisi MVP selesai

Pengunjung dapat melihat profil dan program yang dipublikasikan.

Peserta dapat membuat akun dan mendaftar pada batch yang dibuka.

Admin dapat memasukkan pendaftaran manual.

Peserta dapat mengunggah bukti transfer.

Petugas berizin dapat memverifikasi atau menolak pembayaran dengan catatan.

Peserta dapat melihat status dan riwayat pendaftaran/pembayaran miliknya.

Pengurus dapat mengelola struktur, jobdesk, program, kegiatan, tugas, target, dan laporan mingguan sesuai permission.

RLS dan RBAC telah diuji dengan akun berbeda.

Deployment Vercel terhubung ke Supabase production dengan secrets aman.

14. PENGUJIAN, UAT, DAN RISIKO


## 14.1 Strategi pengujian


| Jenis uji | Contoh |
| --- | --- |
| Unit test | Validasi perhitungan status, aturan batch, dan helper permission. |
| Integration test | Pendaftaran membuat relasi peserta-batch; verifikasi pembayaran mencatat reviewer. |
| RLS test | Peserta A tidak dapat membaca peserta B; fasilitator tidak dapat melihat batch lain. |
| E2E test | Registrasi → pendaftaran → upload bukti → verifikasi → portal. |
| Security test | Privilege escalation, akses file privat, manipulasi request, validasi upload. |
| Responsive test | Form dan dashboard di ponsel, tablet, desktop. |
| UAT | Pengurus dan peserta perwakilan mencoba alur nyata dengan data uji. |



## 14.2 Skenario UAT minimum

Pengunjung dapat menemukan informasi program dan membuka pendaftaran.

Peserta baru mendaftar, memverifikasi email bila diaktifkan, dan masuk portal.

Peserta mengirim pendaftaran dan melihat instruksi transfer yang benar.

Peserta mengunggah file bukti yang valid; file yang tidak sesuai ditolak.

Admin peserta membuat pendaftaran manual tanpa membuat duplikasi yang tidak perlu.

Bendahara memverifikasi pembayaran dan sistem menyimpan catatan serta waktu.

Peserta tidak dapat mengubah status pembayaran sendiri.

Pengurus membuat tugas, menetapkan PIC, dan melihat progres.

Setiap pengurus mengirim laporan mingguan; Humas dapat merekap.

Pengguna tanpa izin tidak dapat membuka data keuangan, bukti transfer, atau dokumen privat.

Ketua melihat ringkasan sesuai hak akses yang disepakati.

Admin dapat menambah pengurus/relawan baru tanpa perubahan kode.


## 14.3 Risiko dan mitigasi


| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Role terlalu luas | Data peserta/keuangan bocor | Permission granular, default deny, RLS test. |
| Duplikasi peserta | Data dan laporan tidak akurat | Deteksi kandidat duplikat dan proses merge terkontrol. |
| Bukti transfer palsu/salah | Peserta dianggap lunas keliru | Verifikasi manual dan audit trail. |
| Kebijakan kelas belum final | Pendaftaran salah konfigurasi | Harga, jadwal, pertemuan, kuota dibuat configurable; jangan isi asumsi. |
| Data sensitif SAPA Recovery | Risiko privasi tinggi | Tidak masuk modul umum; kajian khusus sebelum pengembangan. |
| Ketergantungan satu admin | Operasional terhambat | Dokumentasi, role pengganti, audit dan prosedur handover. |
| Biaya layanan bertambah | Biaya operasional tidak terduga | Pantau kuota Vercel/Supabase dan pilih paket setelah estimasi penggunaan. |
| Backup tidak teruji | Kehilangan data | Kebijakan backup dan uji restore berkala. |


15. KEPUTUSAN TERBUKA DAN ASUMSI

Bagian ini wajib ditutup sebelum fitur terkait masuk produksi. Tidak boleh diisi oleh asumsi AI atau developer tanpa persetujuan pemilik proyek.


| No. | Keputusan yang dibutuhkan | Status / rekomendasi |
| --- | --- | --- |
| 1 | Tanggal kalender untuk Bulan 1 program | Belum diputuskan; dokumen hanya menggunakan Bulan 1–6. |
| 2 | Jumlah pertemuan Kelas Menjadi Ayah | Belum diputuskan. |
| 3 | Harga Kelas Menjadi Ayah | Belum diputuskan. |
| 4 | Jumlah pertemuan Kelas Pranikah | Belum diputuskan. |
| 5 | Harga Kelas Pranikah | Belum diputuskan. |
| 6 | Redaksi target ketiga Ketua: “2 episode podcast dihadiri” | Perlu klarifikasi agar indikator tidak salah ditafsirkan. |
| 7 | Siapa yang boleh menyetujui role pengguna | Perlu ditetapkan. |
| 8 | Apakah Ketua perlu menyetujui transaksi/anggaran tertentu | Perlu kebijakan otorisasi. |
| 9 | Apakah peserta wajib verifikasi email sebelum mendaftar | Rekomendasi: ya, atau aktivasi admin untuk pendaftaran manual. |
| 10 | Apakah peserta dapat mendaftar tanpa akun lebih dahulu | Rekomendasi: buat akun dalam alur pendaftaran agar portal tersedia. |
| 11 | Kebijakan refund, cicilan, dan pembayaran parsial | Belum diputuskan; jangan diaktifkan dulu. |
| 12 | Aturan penerbitan sertifikat dan syarat kehadiran | Belum diputuskan. |
| 13 | Kebijakan keanggotaan dan alumni | Perlu definisi status, syarat, dan siapa yang menyetujui. |
| 14 | Kanal notifikasi | Email/WhatsApp/push belum diputuskan. |
| 15 | Retensi dan penghapusan data | Perlu kebijakan tertulis. |
| 16 | Domain resmi di masa depan | Sementara Vercel subdomain; domain khusus dapat dipetakan kemudian. |
| 17 | Logo resolusi tinggi dan brand asset resmi | Perlu file sumber untuk verifikasi warna dan penggunaan. |
| 18 | Penanggung jawab operasional dan teknis setelah launch | Perlu ditetapkan. |



## 15.1 Asumsi sementara yang dipakai blueprint

Satu aplikasi Next.js melayani tiga lingkungan pengguna.

Bahasa antarmuka awal adalah Bahasa Indonesia.

Pembayaran transfer diverifikasi manusia; tidak ada payment gateway.

Supabase menjadi database, autentikasi, dan storage.

Vercel menjadi hosting/deployment awal.

Seluruh harga, jadwal, kapasitas, dan status program dikelola dinamis.

Public website hanya menampilkan informasi yang disetujui untuk publikasi.

16. KRITERIA PERSETUJUAN BLUEPRINT

Blueprint dianggap siap menjadi dasar implementasi setelah pemilik proyek menyetujui seluruh butir berikut.

☐ Ruang lingkup MVP dan fitur yang ditunda.

☐ Struktur menu public, dashboard, dan portal peserta.

☐ Role dan matriks permission.

☐ Alur pendaftaran online dan manual.

☐ Alur verifikasi transfer manual.

☐ ERD dan daftar tabel/relasi.

☐ Prinsip RLS dan klasifikasi file.

☐ Wireframe dan design system.

☐ Keputusan terbuka yang memengaruhi MVP.

☐ Roadmap, penanggung jawab, dan kriteria UAT.


# PENUTUP

Master Technical Blueprint ini dirancang agar pengembangan SAPA Ayah berjalan berdasarkan kebutuhan organisasi yang nyata, bukan sekadar kumpulan fitur. Prinsip utamanya adalah menjaga identitas dan nilai SAPA Ayah, membantu pengurus bekerja terukur, memudahkan peserta belajar, dan memungkinkan komunitas berkembang dengan tata kelola data yang aman.

Tahap berikutnya setelah dokumen ini ditinjau adalah memperbaiki bagian yang belum disepakati, membekukan versi blueprint, lalu menyusun migration database, policy RLS, desain final, dan backlog implementasi MVP. Coding belum dimulai sebelum persetujuan diberikan.


# SUMBER DAN DASAR PENYUSUNAN

Profil Yayasan SAPA Ayah.pdf — 3 halaman. Digunakan untuk nama, tagline, profil, visi, misi, nilai inti, program unggulan, segmentasi peserta, kanal distribusi, mitra, dan sumber daya yayasan.

SAPA Program, Struktur & Jobdesk.pdf — 13 halaman, November 2026. Digunakan untuk roadmap program enam bulan, struktur lima pengurus, peran pelaksana kegiatan, jobdesk, target bulanan, ritme kerja, dan keputusan program yang masih terbuka.

Keputusan pemilik proyek dalam percakapan — sistem terbuka untuk pengembangan anggota; pendaftaran online dan input admin; transfer manual dengan verifikasi; portal peserta; deployment awal di Vercel; Supabase sebagai database; Next.js App Router, TypeScript, Tailwind CSS, dan shadcn/ui; palet warna awal SAPA Ayah.
