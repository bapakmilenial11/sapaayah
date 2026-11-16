# Role-Based Access Control (RBAC) Matrix & Authorization Policy (Revised)
## SAPA Ayah Digital Platform
**Organization:** Yayasan Sahabat Pembelajar Ayah (SAPA) Ayah  
**Document Version:** 1.1 (Comprehensive 10-Role Matrix)  
**Date:** November 2026  

---

## 1. Prinsip Utama Otorisasi

1. **Default Deny:** Seluruh akses ke modul, antarmuka, dan baris data ditolak secara default kecuali ada izin eksplisit.
2. **Multi-Role Aggregation:** Pengguna dapat memiliki lebih dari satu role (misal: Pengurus merangkap PIC kegiatan dan Peserta). Izin efektif adalah gabungan (*union*) dari seluruh permission yang dimiliki.
3. **Pemisahan Konteks (Context-Based Access Control):**
   - **Fasilitator:** Hanya dapat mengelola sesi, materi, dan absensi pada kelas/batch yang secara eksplisit ditugaskan kepadanya.
   - **Relawan:** Hanya dapat mengakses data dan tugas kegiatan tertentu di mana ia tercatat pada `activity_assignments`.
   - **Pengurus:** Mengelola operasional dalam batas unit kerja dan penugasan aktif.
   - **Peserta:** Hanya dapat melihat dan mengelola pendaftaran, histori pembayaran, dan materi kelas miliknya sendiri.
   - **Alumni:** Akses dibatasi pada direktori komunitas dan kegiatan jejaring pasca-kelulusan.
   - **Bendahara:** Akses penuh verifikasi bukti transfer dan pembukuan kas, namun dilarang memverifikasi pembayarannya sendiri (*segregation of duties*).
4. **Anti-Escalation & Audit:**
   - Pengguna dilarang mengubah rolenya sendiri. Pemberian role dilakukan via Server Action yang memvalidasi hak `roles.assign`.
   - Setiap mutasi role dan penugasan dicatat di `audit_logs`.

---

## 2. Definisi 10 Role Resmi Sistem

| No | Kode Role | Nama Role | Deskripsi & Batasan Akses |
| :-: | :--- | :--- | :--- |
| 1 | `super_admin` | Super Admin | Konfigurasi sistem teknis, pemeliharaan master data, dan audit sistem. Tidak untuk operasional harian. |
| 2 | `ketua` | Ketua Yayasan | Monitoring eksekutif seluruh program, target bulanan, rekapitulasi pengurus, persetujuan strategis. |
| 3 | `pengurus` | Pengurus Yayasan | Akses operasional internal: manajemen tugas tim, pengisian laporan Jumat, pembaruan target KPI. |
| 4 | `admin_peserta` | Admin Peserta | Pendaftaran mandiri & manual, verifikasi kelengkapan berkas, kuota batch, komunikasi peserta. |
| 5 | `bendahara` | Bendahara / Keuangan | Verifikasi bukti transfer manual, instruksi rekening, pencatatan kas masuk/keluar yayasan. |
| 6 | `kreator_konten` | Kreator Konten | Pengelolaan kalender produksi podcast, video pendek, desain poster, dan artikel cerita. |
| 7 | `fasilitator` | Fasilitator Sesi | Akses ke kelas yang ditugaskan, pencatatan kehadiran absensi peserta, penyediaan materi kelas. |
| 8 | `relawan` | Relawan | Akses terbatas hanya pada tugas atau penugasan kegiatan spesifik yang ditugaskan padanya. |
| 9 | `peserta` | Peserta Program | Mengelola pendaftaran pribadi, unggah bukti bayar transfer, melihat jadwal, materi, & sertifikat. |
| 10 | `alumni` | Alumni Program | Akses ke direktori komunitas alumni, forum silaturahmi, dan agenda jejaring alumni. |

---

## 3. Matriks Hak Akses Komprehensif (10 Role vs Seluruh Modul)

Keterangan simbol:
- **Full:** Akses penuh (Create, Read, Update, Delete, Manage)
- **Scope:** Akses terbatas hanya pada data yang ditugaskan / konteks kepemilikan
- **Read:** Hanya membaca data (Read-Only)
- **Deny:** Tidak memiliki akses sama sekali

| Modul Sistem | Super Admin | Ketua | Pengurus | Admin Peserta | Bendahara | Kreator Konten | Fasilitator | Relawan | Peserta | Alumni |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Pengaturan Sistem & Konfigurasi** | **Full** | Read | Deny | Deny | Deny | Deny | Deny | Deny | Deny | Deny |
| **Pengguna & Role (`roles.assign`)** | **Full** | Read | Deny | Deny | Deny | Deny | Deny | Deny | Deny | Deny |
| **Struktur Organisasi & Jobdesk** | **Full** | **Full** | Read | Deny | Deny | Deny | Deny | Deny | Deny | Deny |
| **Katalog Program & Batch** | **Full** | **Full** | **Scope** | Read | Read | Read | **Scope** | Deny | Read | Read |
| **Kegiatan & Tim Pelaksana** | **Full** | **Full** | **Scope** | Read | **Scope** | **Scope** | **Scope** | **Scope** | Read | Read |
| **Data Master Peserta** | Scope | Read | Scope | **Full** | Scope | Deny | **Scope** | Deny | **Scope** | Deny |
| **Pendaftaran (`registrations`)** | Scope | Read | Scope | **Full** | Scope | Deny | **Scope** | Deny | **Scope** | Deny |
| **Instruksi Rekening Bayar** | **Full** | Read | Deny | Read | **Full** | Deny | Deny | Deny | Read | Deny |
| **Verifikasi Bukti Transfer** | Deny | Read | Deny | Read | **Full** | Deny | Deny | Deny | **Scope** | Deny |
| **Tugas Operasional (`tasks`)** | **Full** | **Full** | **Scope** | **Scope** | **Scope** | **Scope** | **Scope** | **Scope** | Deny | Deny |
| **Target Bulanan & KPI** | **Full** | **Full** | **Scope** | Deny | **Scope** | **Scope** | Deny | Deny | Deny | Deny |
| **Form Laporan Jumat** | Deny | Read | **Scope** | **Scope** | **Scope** | **Scope** | **Scope** | Deny | Deny | Deny |
| **Rekap Laporan Mingguan** | Read | **Full** | **Scope** | Deny | Deny | Deny | Deny | Deny | Deny | Deny |
| **Sesi Kelas & Pertemuan** | **Full** | Read | Scope | Read | Deny | Deny | **Scope** | Deny | **Scope** | Deny |
| **Materi Pembelajaran (LMS)** | **Full** | Read | Scope | Scope | Deny | Deny | **Scope** | Deny | **Scope** | Deny |
| **Absensi Kehadiran Peserta** | **Full** | Read | Deny | Read | Deny | Deny | **Scope** | Deny | **Scope** | Deny |
| **Penerbitan Sertifikat Digital** | **Full** | Read | Deny | **Full** | Deny | Deny | Scope | Deny | **Scope** | Deny |
| **Konten Publik & Media** | **Full** | **Full** | Scope | Scope | Deny | **Full** | Deny | Deny | Read | Read |
| **Laporan & Transaksi Keuangan** | Scope | **Full** | Deny | Deny | **Full** | Deny | Deny | Deny | Deny | Deny |
| **Komunitas & Direktori Alumni** | **Full** | Read | Read | Read | Deny | Deny | Deny | Deny | Deny | **Full** |
| **Audit Logs Sistem** | **Full** | Read | Deny | Deny | Deny | Deny | Deny | Deny | Deny | Deny |

---

## 4. Penyelarasan Kode Permission Sistem

Daftar kode permission di bawah ini telah diselaraskan 100% dengan `src/lib/permissions/constants.ts`, rancangan skema database, dan dokumen arsitektur:

```typescript
export const PERMISSIONS = {
  // System & Settings
  SYSTEM_MANAGE: 'system.manage',
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_MANAGE: 'settings.manage',

  // Users & Access Control
  USERS_VIEW: 'users.view',
  USERS_MANAGE: 'users.manage',
  ROLES_ASSIGN: 'roles.assign',

  // Organization & Personnel
  ORGANIZATION_VIEW: 'organization.view',
  ORGANIZATION_MANAGE: 'organization.manage',
  POSITIONS_MANAGE: 'positions.manage',
  PERSONNEL_ASSIGN: 'personnel.assign',

  // Programs & Batches
  PROGRAMS_VIEW: 'programs.view',
  PROGRAMS_MANAGE: 'programs.manage',
  BATCHES_VIEW: 'batches.view',
  BATCHES_MANAGE: 'batches.manage',

  // Activities & Crew Assignments
  ACTIVITIES_VIEW: 'activities.view',
  ACTIVITIES_MANAGE: 'activities.manage',
  ACTIVITIES_ASSIGN: 'activities.assign',

  // Participants & Registrations
  PARTICIPANTS_VIEW_ALL: 'participants.view_all',
  PARTICIPANTS_VIEW_ASSIGNED: 'participants.view_assigned',
  PARTICIPANTS_MANAGE: 'participants.manage',
  REGISTRATIONS_CREATE_ADMIN: 'registrations.create_admin',
  REGISTRATIONS_VIEW_ALL: 'registrations.view_all',
  REGISTRATIONS_VIEW_ASSIGNED: 'registrations.view_assigned',
  REGISTRATIONS_MANAGE: 'registrations.manage',

  // Payments & Manual Verification
  PAYMENTS_VIEW_ALL: 'payments.view_all',
  PAYMENTS_VERIFY: 'payments.verify',
  PAYMENTS_MANAGE_ACCOUNTS: 'payments.manage_accounts',

  // Tasks, Targets & Weekly Reports
  TASKS_MANAGE_ALL: 'tasks.manage_all',
  TASKS_UPDATE_ASSIGNED: 'tasks.update_assigned',
  TARGETS_VIEW_ALL: 'targets.view_all',
  TARGETS_MANAGE: 'targets.manage',
  TARGETS_UPDATE_ASSIGNED: 'targets.update_assigned',
  WEEKLY_REPORTS_SUBMIT: 'weekly_reports.submit',
  WEEKLY_REPORTS_VIEW_ALL: 'weekly_reports.view_all',
  WEEKLY_REPORTS_RECAP: 'weekly_reports.recap',

  // Learning Management System (LMS)
  SESSIONS_MANAGE_ASSIGNED: 'sessions.manage_assigned',
  ATTENDANCE_RECORD_ASSIGNED: 'attendance.record_assigned',
  MATERIALS_MANAGE_ASSIGNED: 'materials.manage_assigned',
  MATERIALS_VIEW_ENROLLED: 'materials.view_enrolled',
  CERTIFICATES_ISSUE: 'certificates.issue',
  CERTIFICATES_DOWNLOAD_OWN: 'certificates.download_own',

  // Treasury & Finance
  FINANCE_VIEW: 'finance.view',
  FINANCE_MANAGE: 'finance.manage',

  // Media & Content
  CONTENT_VIEW: 'content.view',
  CONTENT_MANAGE: 'content.manage',

  // Community & Alumni
  COMMUNITY_VIEW: 'community.view',
  COMMUNITY_MANAGE: 'community.manage',

  // Audit Logs
  AUDIT_LOGS_VIEW: 'audit_logs.view',
} as const;
```

---

## 5. Implementasi Aturan Kontekstual & Pencegahan Konflik

1. **Aturan Fasilitator (Class-Scoped Access):**  
   Fasilitator hanya diizinkan mencatat kehadiran dan mengunggah materi jika `class_sessions.facilitator_id = auth.uid()` atau tercatat dalam `activity_assignments` untuk batch tersebut.
2. **Aturan Relawan (Activity-Scoped Access):**  
   Relawan hanya dapat melihat ringkasan tugas dan peserta jika terdapat baris pada `activity_assignments` dengan `profile_id = auth.uid()`.
3. **Pencegahan Verifikasi Sendiri (*Segregation of Duties*):**  
   Bendahara atau reviewer dilarang memverifikasi bukti bayar pendaftaran miliknya sendiri. Hal ini divalidasi pada Server Action dan trigger database:  
   `reviewer_id != registration.participant.profile_id`.
