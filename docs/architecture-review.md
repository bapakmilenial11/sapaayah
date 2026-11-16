# Architecture Review & Alignment Report
## SAPA Ayah Digital Platform
**Date:** November 2026  
**Document Review Version:** 1.0  
**Authors:** Senior Software Architect, Database Architect, Application Security Architect  

---

## 1. Temuan Masalah & Area Ketidakselarasan Sebelumnya

Dalam tinjauan awal terhadap arsitektur, database, dan RBAC, ditemukan beberapa titik ketidakselarasan terhadap *Master Technical Blueprint*:

1. **Ambiguitas Sesi Server Components:**  
   Dokumen awal belum menegaskan secara eksplisit bahwa Server Components harus menggunakan Supabase Server Client berbasis sesi pengguna aktif (`auth.uid()`), bukan client statis tanpa RLS.
2. **Ketergantungan Berlebih pada Middleware:**  
   Pemeriksaan otorisasi berisiko hanya diposisikan di Middleware Next.js, yang secara arsitektural tidak aman untuk API mutasi (Server Actions) dan rawan kebocoran bila middleware dilewati (*misconfiguration*).
3. **Ketiadaan Entitas LMS & Penugasan Kegiatan di ERD & Kamus Data:**  
   Entitas `activity_assignments`, `class_sessions`, `attendance_records`, `learning_materials`, `certificates`, dan `progress_updates` belum terdefinisi secara detail dengan field, foreign key, dan tipe datanya.
4. **Peran Ganda Tanpa Pemisahan Jelas:**  
   Konsep peserta program vs anggota yayasan vs alumni berisiko tercampur baur jika tidak dipisahkan ke dalam entitas terpisah.
5. **Histori Pembayaran Belum Mengakomodasi Penolakan & Pengajuan Ulang:**  
   Struktur awal mengasumsikan satu record pembayaran hanya memiliki satu file bukti transfer. Jika bukti transfer ditolak oleh bendahara karena tidak jelas/salah nominal, peserta tidak memiliki jejak histori pengajuan bukti perbaikan tanpa menimpa data lama.
6. **Matriks RBAC Belum Mencakup Seluruh 10 Role Resmi:**  
   Role `relawan`, `kreator_konten`, `alumni`, dan `fasilitator` belum terpetakan secara granular di seluruh modul operasional.

---

## 2. Rincian Perubahan yang Telah Diterapkan

### A. Perubahan pada `docs/architecture.md`
- Menegaskan prinsip bahwa Server Components membaca data langsung via Supabase Server Client dengan konteks sesi pengguna sehingga PostgreSQL RLS **tetap aktif dan berlaku**.
- Menetapkan aturan ketat bahwa `SUPABASE_SERVICE_ROLE_KEY` hanya digunakan pada server-side untuk kasus khusus yang diotorisasi (misal penulisan immutable audit log atau maintenance periodik).
- Memformalkan **Pipa 4 Tahap Mutasi** untuk Server Actions dan Route Handlers: (1) Validasi Zod, (2) Autentikasi Pengguna, (3) Otorisasi Kode Permission, (4) Verifikasi Cakupan Konteks/Data (Ownership / Assignment Scope).
- Menguraikan diagram sekuens untuk alur autentikasi, otorisasi ganda, dan alur perolehan *Signed URL* (berumur 5 menit) untuk berkas privat.
- Memastikan placeholder aman pada template `.env.example`.

### B. Perubahan pada `docs/database-design.md`
- Melengkapi kamus data dan Mermaid ERD untuk 6 entitas kunci: `activity_assignments`, `class_sessions`, `attendance_records`, `learning_materials`, `certificates`, dan `progress_updates`.
- Menegaskan pemisahan tegas antara `auth.users`, `profiles`, `participants`, `memberships`, `alumni_profiles`, `positions`, `personnel_assignments`, dan `activity_assignments`.
- Merancang mekanisme deteksi duplikasi pendaftaran mandiri dan manual admin via normalisasi nomor WhatsApp (E.164) dan Email.
- Menambahkan entitas `payment_proof_submissions` untuk menampung riwayat pengajuan ulang bukti transfer pasca-penolakan, serta constraint `ck_prevent_self_verification` untuk mencegah verifikasi oleh diri sendiri.
- Menambahkan spesifikasi kebutuhan indeks, constraint unik, status check constraint, dan audit trail universal.

### C. Perubahan pada `docs/rbac-matrix.md`
- Menyusun matriks perizinan komprehensif untuk seluruh **10 Role Resmi**: `super_admin`, `ketua`, `pengurus`, `admin_peserta`, `bendahara`, `kreator_konten`, `fasilitator`, `relawan`, `peserta`, dan `alumni`.
- Menyelaraskan seluruh kode permission berformat `<module>.<action>` agar 100% konsisten dengan `constants.ts` dan dokumen arsitektur.
- Merumuskan aturan otorisasi berbasis konteks (*scope-based access*) untuk fasilitator (kelas tugas), relawan (kegiatan tugas), pengurus (area kerja), dan peserta (data mandiri).

