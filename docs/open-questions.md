# Open Questions & Pending Business Decisions
## SAPA Ayah Digital Platform
**Date:** November 2026  
**Document Version:** 1.0  
**Status:** Awaiting Project Owner Confirmation  

---

Dokumen ini mencatat seluruh pertanyaan bisnis dan keputusan kebijakan yayasan yang belum tersedia pada dokumen sumber (*Profil Yayasan* dan *Program, Struktur & Jobdesk*). Sesuai aturan arsitektur, tim pengembang tidak boleh mengarang jawaban atau menanam nilai asumtif (*hardcoded*) ke dalam kode.

---

## 1. Jadwal & Kalender Operasional Program

| No | Pertanyaan Bisnis | Dampak Arsitektur / Sistem | Rekomendasi Teknis Sementara |
| :-: | :--- | :--- | :--- |
| **Q-01** | Kapan tanggal kalender pasti untuk **Bulan 1** sebagai awal peluncuran roadmap program? | Penentuan tanggal `registration_open_at` dan `start_at` pada batch awal. | Sistem menyediakan kolom konfigurasi tanggal dinamis di tabel `program_batches`. Pengurus dapat memasukkan tanggal saat jadwal definitif disahkan. |

---

## 2. Parameter & Kebijakan Kelas Berbayar

| No | Pertanyaan Bisnis | Dampak Arsitektur / Sistem | Rekomendasi Teknis Sementara |
| :-: | :--- | :--- | :--- |
| **Q-02** | Berapa jumlah pertemuan definitif untuk **Kelas Menjadi Ayah** (Bulan 3)? | Pembuatan record otomatis di tabel `class_sessions` dan penentuan syarat minimal absensi kelulusan. | Sistem mendukung jumlah sesi dinamis (1..N) per batch tanpa batasan kaku. |
| **Q-03** | Berapa harga tiket pendaftaran definitif untuk **Kelas Menjadi Ayah**? | Nilai awal pada kolom `price` di `program_batches` dan `amount_due` di `payments`. | Disimpan sebagai nilai konfigurasi numerik (`DECIMAL(12, 2)`), nilai default `0.00` hingga diisi oleh admin/bendahara. |
| **Q-04** | Berapa jumlah pertemuan definitif untuk **Kelas Pranikah** (Bulan 6)? | Pembuatan sesi kelas pranikah di `class_sessions`. | Sama dengan Q-02 (dibuat dinamis per batch). |
| **Q-05** | Berapa harga tiket pendaftaran definitif untuk **Kelas Pranikah**? | Nilai `price` pada batch kelas pranikah. | Sama dengan Q-03 (dikonfigurasi dinamis). |
| **Q-06** | Apakah ada kebijakan **pengembalian dana (refund)** atau **cicilan (pembayaran parsial)** bagi peserta yang membatalkan keikutsertaan? | Logika mutasi status pada `payments` dan integrasi pembukuan kas `financial_transactions`. | **Rekomendasi:** Pada MVP, seluruh pendaftaran berbayar harus lunas penuh (*full payment*). Refund atau cicilan dinonaktifkan hingga SOP tertulis yayasan diterbitkan. |

---

## 3. Klarifikasi KPI & Ritme Kerja Pengurus

| No | Pertanyaan Bisnis | Dampak Arsitektur / Sistem | Rekomendasi Teknis Sementara |
| :-: | :--- | :--- | :--- |
| **Q-07** | Apa maksud definitif dari redaksi target bulanan ketiga Ketua: *"2 episode podcast dihadiri"*? Apakah sebagai narasumber/host, atau menghadiri proses rekaman? | Deskripsi KPI dan jenis bukti progres pada `performance_targets` & `progress_updates`. | Dicatat sesuai redaksi sumber dalam database tanpa tafsiran sepihak; dapat diperbarui setelah klarifikasi Ketua. |
| **Q-08** | Siapa yang memegang hak persetujuan akhir (*approval gate*) untuk penambahan/perubahan role pengurus dan bendahara? | Konfigurasi otorisasi `roles.assign` pada alur UI dan Server Actions. | **Rekomendasi:** Super Admin teknis dan Ketua Yayasan memegang izin otorisasi penugasan role. |
| **Q-09** | Apakah ada batasan nominal transaksi keuangan yayasan yang mewajibkan persetujuan digital dari Ketua sebelum dieksekusi Bendahara? | Alur otorisasi pengeluaran kas pada modul keuangan (`finance.manage`). | Pada tahap MVP, pencatatan kas difokuskan pada rekonsiliasi transfer masuk pendaftaran oleh Bendahara. Alur persetujuan bertingkat disiapkan untuk V2. |

---

## 4. Keanggotaan, Sertifikasi & Komunitas Alumni

| No | Pertanyaan Bisnis | Dampak Arsitektur / Sistem | Rekomendasi Teknis Sementara |
| :-: | :--- | :--- | :--- |
| **Q-10** | Apa syarat penerbitan sertifikat kelulusan peserta? (Misal: persentase minimal kehadiran 80%, atau penyelesaian tugas akhir). | Logika validasi pada Server Action `issueCertificateAction`. | Konfigurasi syarat disimpan sebagai rule per batch; default awal adalah verifikasi kelulusan manual oleh Admin Peserta / Fasilitator. |
| **Q-11** | Siapa yang berhak menandatangani sertifikat secara digital (Ketua saja, atau bersama Fasilitator/Narasumber)? | Kolom penandatangan pada `certificates` (`signed_by_profile_id`). | Sistem mendukung tanda tangan Ketua sebagai default, dengan opsi menambahkan nama Fasilitator. |
| **Q-12** | Kapan seorang peserta resmi dimasukkan ke dalam basis data alumni komunitas? | Trigger pembuatan record `alumni_profiles`. | Secara otomatis dibuat saat status pendaftaran berubah menjadi `completed` dan sertifikat diterbitkan. |

