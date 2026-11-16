# Final RBAC Specification & Permission Hierarchy
## SAPA Ayah Digital Platform
**Organization:** Yayasan Sahabat Pembelajar Ayah (SAPA) Ayah  
**Document Version:** 2.0 (Unified & Canonical RBAC Specification)  
**Date:** November 2026  

---

## 1. Prinsip Otorisasi Arsitektur

1. **Default Deny:** Semua akses tertutup kecuali diberikan secara eksplisit melalui relasi `roles` $\rightarrow$ `role_permissions`.
2. **Multi-Role Aggregation:** Pengguna dapat memiliki lebih dari satu role secara bersamaan (misal: Pengurus merangkap PIC kegiatan dan Peserta). Izin efektif adalah gabungan (*union*) dari seluruh permission tanpa saling meniadakan.
3. **Anti-Privilege Escalation:** Pengguna dilarang mengubah rolenya sendiri. Pemberian role dikontrol oleh Server Action yang memvalidasi permission `roles.assign`.
4. **Validasi Ganda (Server Action + PostgreSQL RLS):** Pengecekan otorisasi di sisi aplikasi didukung penegakan mutlak pada lapisan basis data melalui fungsi helper SQL `public.has_permission(auth.uid(), code)`.
5. **No Permission Deletion:** Permission yang baru aktif pada V2 (seperti `certificates.issue` atau `community.manage`) tetap dipertahankan dalam skema untuk menjaga kontinuitas desain.

---

## 2. Definisi 10 Role Resmi Sistem

| No | Kode Role | Nama Tampilan | Deskripsi Tanggung Jawab & Batasan Akses |
| :-: | :--- | :--- | :--- |
| 1 | `super_admin` | Super Admin | Manajemen konfigurasi teknis, pemeliharaan master data, dan audit sistem. Tidak digunakan untuk operasional rutin. |
| 2 | `ketua` | Ketua Yayasan | Monitoring eksekutif lintas divisi, persetujuan program strategis, rekapitulasi progres mingguan pengurus. |
| 3 | `pengurus` | Pengurus Yayasan | Akses operasional internal: manajemen tugas, pengisian formulir Laporan Jumat, pembaruan target kinerja. |
| 4 | `admin_peserta` | Admin Peserta | Pendaftaran mandiri/manual, deduplikasi kontak, manajemen kuota batch, penerbitan sertifikat peserta. |
| 5 | `bendahara` | Bendahara / Keuangan | Verifikasi bukti transfer manual, data rekening yayasan, pencatatan transaksi kas masuk/keluar. Dilarang memverifikasi transfer sendiri. |
| 6 | `kreator_konten` | Kreator Konten | Pengelolaan kalender produksi podcast, video pendek, artikel cerita, dan aset media promosi. |
| 7 | `fasilitator` | Fasilitator Sesi | Akses ke kelas yang diampu, absensi kehadiran peserta, dan pengunggahan materi sesi terkait. |
| 8 | `relawan` | Relawan | Akses terbatas hanya pada tugas atau kegiatan spesifik yang didelegasikan melalui `activity_assignments`. |
| 9 | `peserta` | Peserta Program | Layanan mandiri: pendaftaran kelas, unggah bukti bayar transfer, akses jadwal, materi terdaftar, dan sertifikat pribadi. |
| 10 | `alumni` | Alumni Program | Akses ke direktori komunitas alumni, agenda silaturahmi, dan ruang bertumbuh pasca-kelulusan. |

---

## 3. Matriks Otorisasi Kanonikal (10 Role vs Seluruh Modul)

Keterangan:
- **Full:** Hak penuh (Create, Read, Update, Delete, Manage)
- **Scope:** Hak terbatas hanya pada data/konteks penugasan aktif atau kepemilikan pribadi
- **Read:** Hanya membaca data tanpa hak mutasi
- **Deny:** Akses ditolak secara mutlak

| Modul Operasional | Super Admin | Ketua | Pengurus | Admin Peserta | Bendahara | Kreator Konten | Fasilitator | Relawan | Peserta | Alumni |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Sistem & Pengaturan** | **Full** | Read | Deny | Deny | Deny | Deny | Deny | Deny | Deny | Deny |
| **Pengguna & Role (`roles.assign`)** | **Full** | Read | Deny | Deny | Deny | Deny | Deny | Deny | Deny | Deny |
| **Struktur Organisasi & Jobdesk** | **Full** | **Full** | Read | Deny | Deny | Deny | Deny | Deny | Deny | Deny |
| **Katalog Program & Batch** | **Full** | **Full** | **Scope** | Read | Read | Read | **Scope** | Deny | Read | Read |
| **Kegiatan & Kru Pelaksana** | **Full** | **Full** | **Scope** | Read | **Scope** | **Scope** | **Scope** | **Scope** | Read | Read |
| **Data Master Peserta** | Scope | Read | Scope | **Full** | Scope | Deny | **Scope** | Deny | **Scope** | Deny |
| **Pendaftaran Batch** | Scope | Read | Scope | **Full** | Scope | Deny | **Scope** | Deny | **Scope** | Deny |
| **Instruksi Rekening Transfer** | **Full** | Read | Deny | Read | **Full** | Deny | Deny | Deny | Read | Deny |
| **Verifikasi Pembayaran Manual** | Deny | Read | Deny | Read | **Full** | Deny | Deny | Deny | **Scope** | Deny |
| **Tugas Operasional (`tasks`)** | **Full** | **Full** | **Scope** | **Scope** | **Scope** | **Scope** | **Scope** | **Scope** | Deny | Deny |
| **Target Kinerja Bulanan & KPI** | **Full** | **Full** | **Scope** | Deny | **Scope** | **Scope** | Deny | Deny | Deny | Deny |
| **Formulir Laporan Jumat 3 Baris** | Deny | Read | **Scope** | **Scope** | **Scope** | **Scope** | **Scope** | Deny | Deny | Deny |
| **Rekap Mingguan Humas** | Read | **Full** | **Scope** | Deny | Deny | Deny | Deny | Deny | Deny | Deny |
| **Sesi Kelas & Pertemuan Zoom** | **Full** | Read | Scope | Read | Deny | Deny | **Scope** | Deny | **Scope** | Deny |
| **Materi Pembelajaran (LMS)** | **Full** | Read | Scope | Scope | Deny | Deny | **Scope** | Deny | **Scope** | Deny |
| **Absensi Kehadiran Peserta** | **Full** | Read | Deny | Read | Deny | Deny | **Scope** | Deny | **Scope** | Deny |
| **Penerbitan Sertifikat Kelulusan**| **Full** | Read | Deny | **Full** | Deny | Deny | Scope | Deny | **Scope** | Deny |
| **Kalender & Aset Konten** | **Full** | **Full** | Scope | Scope | Deny | **Full** | Deny | Deny | Read | Read |
| **Pencatatan Keuangan Yayasan** | Scope | **Full** | Deny | Deny | **Full** | Deny | Deny | Deny | Deny | Deny |
| **Komunitas & Direktori Alumni** | **Full** | Read | Read | Read | Deny | Deny | Deny | Deny | Deny | **Full** |
| **Audit Logs Sistem** | **Full** | Read | Deny | Deny | Deny | Deny | Deny | Deny | Deny | Deny |

---

## 4. Master Katalog Permission (36 Izin Standar Sistem)

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

