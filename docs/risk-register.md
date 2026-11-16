# Technical & Operational Risk Register
## SAPA Ayah Digital Platform
**Organization:** Yayasan Sahabat Pembelajar Ayah (SAPA) Ayah  
**Document Version:** 1.0  
**Date:** November 2026  

---

## 1. Matriks Penilaian Risiko

Tingkat risiko dihitung berdasarkan formula:  
$$\text{Tingkat Risiko} = \text{Probabilitas (1-5)} \times \text{Dampak (1-5)}$$

- **1 – 6 (Low):** Dapat diterima dengan pemantauan rutin.
- **8 – 12 (Medium):** Memerlukan prosedur kontrol dan mitigasi aktif.
- **15 – 25 (High / Critical):** Wajib dimitigasi sebelum fase implementasi terkait dimulai.

---

## 2. Tabel Registrasi Risiko (Risk Register Log)

| ID | Kategori | Deskripsi Risiko | Prob | Damp | Skor | Strategi Mitigasi | Penanggung Jawab | Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :---: |
| **RSK-01** | Keamanan | **Kebocoran Service Role Key:** Kunci rahasia Supabase terekspos ke bundle JavaScript browser melalui variabel `NEXT_PUBLIC_*`. | 2 | 5 | 10 (Med) | Larangan keras di `AGENTS.md`; linter otomatis; hanya simpan di `.env.local` dan secret Vercel tanpa prefix public. | Tech Lead | Aktif / Terkontrol |
| **RSK-02** | Keamanan | **Bypass Otorisasi / Eskalasi Role:** Pengguna memanipulasi request untuk mendapatkan role admin atau menyetujui pembayaran sendiri. | 2 | 5 | 10 (Med) | Penegakan izin pada Server Actions via `assertPermission()` dan PostgreSQL RLS dengan default deny. | Security Eng | Terkontrol |
| **RSK-03** | Privasi | **Kebocoran Bukti Pembayaran Peserta:** File transfer bank diakses oleh pihak ketiga tanpa hak. | 3 | 4 | 12 (Med) | Bucket storage privat (`private-payment-proofs`); akses hanya via signed URL berbatas 5 menit. | Security Eng | Terkontrol |
| **RSK-04** | Privasi | **Data Sensitif Konseling (SAPA Recovery):** Data curahan hati atau psikologis tersimpan di tabel pendaftaran umum. | 2 | 5 | 10 (Med) | Isolasi mutlak: modul konseling tidak dimasukkan ke database operasional umum MVP. | Database Arch | Terkontrol |
| **RSK-05** | Operasional | **Duplikasi Data Peserta:** Peserta yang sama mendaftar via web mandiri dan diinput manual oleh admin offline. | 4 | 3 | 12 (Med) | Algoritma pencarian deduplikasi berdasarkan nomor WhatsApp (E.164) dan Email sebelum pembuatan record baru. | Tech Lead | Terkontrol |
| **RSK-06** | Operasional | **Bukti Transfer Palsu / Salah Rekening:** Peserta disetujui tanpa verifikasi keabsahan dana di rekening yayasan. | 3 | 4 | 12 (Med) | Wajib verifikasi manual oleh Bendahara; sistem tidak pernah mengubah status `VERIFIED` secara otomatis saat upload. | Bendahara | Terkontrol |
| **RSK-07** | Bisnis | **Keputusan Terbuka Belum Final:** Tanggal Bulan 1, harga kelas, dan kuota pertemuan belum ditetapkan oleh pimpinan. | 4 | 3 | 12 (Med) | Seluruh harga, tanggal, kuota, dan pertemuan dibuat dinamis (*configurable* di database), tanpa nilai hardcoded. | Project Manager | Terbuka |
| **RSK-08** | Operasional | **Kelelahan Pengisian Laporan Jumat:** Personel yayasan lupa atau enggan mengisi laporan mingguan tiga baris. | 4 | 2 | 8 (Med) | Form super ringkas (hanya 3 kolom pendek), mobile-friendly, dan panel monitoring kepatuhan bagi Humas. | PM / Humas | Terbuka |
| **RSK-09** | Infrastruktur | **Lonjakan Biaya / Kuota Supabase & Vercel:** Penggunaan bandwidth atau storage melebihi paket gratis/starter. | 2 | 3 | 6 (Low) | Pembatasan ukuran upload (maks. 2MB untuk gambar bukti), kompresi aset gambar publik, dan monitoring kuota. | Tech Lead | Terkontrol |
| **RSK-10** | Keberlanjutan | **Ketergantungan Personel Tunggal (Single Point of Failure):** Operasional sistem terhenti jika satu-satunya admin/pengembang berhalangan. | 3 | 3 | 9 (Med) | Dokumentasi teknis komprehensif, multi-admin role dengan audit trail, serta panduan SOP tertulis. | Project Manager | Terkontrol |

