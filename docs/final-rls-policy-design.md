# Final Row Level Security (RLS) Policy Design
## SAPA Ayah Digital Platform
**Organization:** Yayasan Sahabat Pembelajar Ayah (SAPA) Ayah  
**Document Version:** 2.0 (Security Hardened RLS Specification)  
**Database:** PostgreSQL 15+ (Supabase)  
**Date:** November 2026  

---

## 1. Fondasi Keamanan Database Supabase RLS

1. **Default Deny:** Seluruh tabel di skema `public` wajib menjalankan perintah `ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;`. Tidak ada operasi SELECT, INSERT, UPDATE, atau DELETE yang diizinkan tanpa policy yang cocok.
2. **Fungsi Otorisasi Aman (`public.has_permission`):**  
   Untuk menghentikan *RLS infinite recursion* dan mempercepat evaluasi query, fungsi helper diatur sebagai `SECURITY DEFINER` dengan skema terisolasi:

```sql
CREATE OR REPLACE FUNCTION public.has_permission(
  _user_id UUID,
  _permission_code VARCHAR
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = _user_id
      AND p.code = _permission_code
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
$$;
```

---

## 2. Kebijakan RLS Komprehensif per Domain

### 2.1 Domain Profil & Otorisasi
- **`profiles`**:
  - `SELECT`: `auth.uid() = id OR public.has_permission(auth.uid(), 'users.view')`
  - `UPDATE`: `auth.uid() = id` (Hanya field nama, telepon, avatar; status akun dikunci via trigger)
  - `INSERT`: Di-trigger otomatis oleh Supabase Auth saat pendaftaran akun.
- **`user_roles`**:
  - `SELECT`: `auth.uid() = user_id OR public.has_permission(auth.uid(), 'users.view')`
  - `ALL`: `public.has_permission(auth.uid(), 'roles.assign')`

### 2.2 Domain Organisasi & Penugasan
- **`organizational_units` & `positions` & `job_descriptions`**:
  - `SELECT`: Terbuka untuk seluruh pengguna terotentikasi (`authenticated`).
  - `ALL`: `public.has_permission(auth.uid(), 'organization.manage')`
- **`personnel_assignments`**:
  - `SELECT`: Terbuka untuk seluruh pengguna terotentikasi.
  - `ALL`: `public.has_permission(auth.uid(), 'personnel.assign')`
- **`memberships` & `membership_status_history`**:
  - `SELECT`: `profile_id = auth.uid() OR public.has_permission(auth.uid(), 'organization.manage')`
  - `ALL`: `public.has_permission(auth.uid(), 'organization.manage')`

### 2.3 Domain Program, Batch, Kegiatan & Penugasan Pelaksana
- **`programs`**:
  - `SELECT`: `visibility = 'published' OR public.has_permission(auth.uid(), 'programs.view')`
  - `ALL`: `public.has_permission(auth.uid(), 'programs.manage')`
- **`program_batches`**:
  - `SELECT`: `status IN ('open', 'in_progress', 'completed') OR public.has_permission(auth.uid(), 'batches.view')`
  - `ALL`: `public.has_permission(auth.uid(), 'batches.manage')`
- **`activities`**:
  - `SELECT`: Terbuka untuk pengguna terotentikasi atau publik jika batch terbuka.
  - `ALL`: `public.has_permission(auth.uid(), 'activities.manage')`
- **`activity_assignments`**:
  - `SELECT`: `profile_id = auth.uid() OR public.has_permission(auth.uid(), 'activities.view')`
  - `ALL`: `public.has_permission(auth.uid(), 'activities.assign')`

### 2.4 Domain Peserta & Pendaftaran
- **`participants`**:
  - `SELECT`: `profile_id = auth.uid() OR public.has_permission(auth.uid(), 'participants.view_all') OR (public.has_permission(auth.uid(), 'participants.view_assigned') AND id IN (SELECT r.participant_id FROM registrations r JOIN activity_assignments aa ON aa.activity_id IN (SELECT id FROM activities WHERE batch_id = r.batch_id) WHERE aa.profile_id = auth.uid()))`
  - `INSERT`: Diizinkan untuk `authenticated` (pendaftaran mandiri) atau `public.has_permission(auth.uid(), 'participants.manage')`.
  - `UPDATE`: `profile_id = auth.uid() OR public.has_permission(auth.uid(), 'participants.manage')`
- **`registrations`**:
  - `SELECT`: `participant_id IN (SELECT id FROM participants WHERE profile_id = auth.uid()) OR public.has_permission(auth.uid(), 'registrations.view_all') OR (public.has_permission(auth.uid(), 'registrations.view_assigned') AND batch_id IN (SELECT a.batch_id FROM activities a JOIN activity_assignments aa ON aa.activity_id = a.id WHERE aa.profile_id = auth.uid()))`
  - `INSERT`: `participant_id IN (SELECT id FROM participants WHERE profile_id = auth.uid()) OR public.has_permission(auth.uid(), 'registrations.create_admin')`
  - `UPDATE`: `public.has_permission(auth.uid(), 'registrations.manage')`

### 2.5 Domain Pembayaran Transfer Manual & Riwayat Verifikasi
- **`payment_instructions`**:
  - `SELECT`: `is_active = true OR public.has_permission(auth.uid(), 'payments.manage_accounts')`
  - `ALL`: `public.has_permission(auth.uid(), 'payments.manage_accounts')`
- **`payments`**:
  - `SELECT`: `registration_id IN (SELECT id FROM registrations WHERE participant_id IN (SELECT id FROM participants WHERE profile_id = auth.uid())) OR public.has_permission(auth.uid(), 'payments.view_all')`
  - `INSERT`: Di-trigger sistem saat pendaftaran batch berbayar.
  - `UPDATE`: `public.has_permission(auth.uid(), 'payments.verify')` (Pengguna dilarang mengubah status pembayaran langsung).
- **`payment_proof_submissions`**:
  - `SELECT`: `payment_id IN (SELECT p.id FROM payments p JOIN registrations r ON p.registration_id = r.id JOIN participants pt ON r.participant_id = pt.id WHERE pt.profile_id = auth.uid()) OR public.has_permission(auth.uid(), 'payments.view_all')`
  - `INSERT`: `payment_id IN (SELECT p.id FROM payments p JOIN registrations r ON p.registration_id = r.id JOIN participants pt ON r.participant_id = pt.id WHERE pt.profile_id = auth.uid() AND p.status IN ('pending', 'rejected'))`
- **`payment_verifications`**:
  - `SELECT`: Terkait dengan bukti pembayaran milik peserta sendiri atau reviewer berizin `payments.view_all`.
  - `INSERT`: `public.has_permission(auth.uid(), 'payments.verify') AND reviewer_id = auth.uid() AND reviewer_id != (SELECT pt.profile_id FROM participants pt JOIN registrations r ON r.participant_id = pt.id JOIN payments py ON py.registration_id = r.id JOIN payment_proof_submissions pps ON pps.payment_id = py.id WHERE pps.id = submission_id)`

### 2.6 Domain Pembelajaran (LMS)
- **`class_sessions`**:
  - `SELECT`: Terbuka untuk peserta yang terdaftar aktif pada batch tersebut, atau fasilitator yang ditugaskan (`facilitator_id = auth.uid()`), atau pengurus berizin `programs.view`.
  - `ALL`: `public.has_permission(auth.uid(), 'programs.manage') OR (public.has_permission(auth.uid(), 'sessions.manage_assigned') AND facilitator_id = auth.uid())`
- **`attendance_records`**:
  - `SELECT`: `participant_id IN (SELECT id FROM participants WHERE profile_id = auth.uid()) OR public.has_permission(auth.uid(), 'attendance.record_assigned')`
  - `INSERT/UPDATE`: `public.has_permission(auth.uid(), 'attendance.record_assigned') AND session_id IN (SELECT id FROM class_sessions WHERE facilitator_id = auth.uid() OR public.has_permission(auth.uid(), 'programs.manage'))`
- **`learning_materials`**:
  - `SELECT`: `batch_id IN (SELECT batch_id FROM registrations WHERE participant_id IN (SELECT id FROM participants WHERE profile_id = auth.uid()) AND status = 'accepted') OR public.has_permission(auth.uid(), 'materials.manage_assigned')`
  - `ALL`: `public.has_permission(auth.uid(), 'materials.manage_assigned')`
- **`certificates`**:
  - `SELECT`: `participant_id IN (SELECT id FROM participants WHERE profile_id = auth.uid()) OR public.has_permission(auth.uid(), 'certificates.issue')`
  - `ALL`: `public.has_permission(auth.uid(), 'certificates.issue')`

### 2.7 Domain Tugas, Target, Progres & Laporan Jumat
- **`tasks` & `task_assignments`**:
  - `SELECT`: `created_by = auth.uid() OR id IN (SELECT task_id FROM task_assignments WHERE assignee_id = auth.uid()) OR public.has_permission(auth.uid(), 'tasks.manage_all')`
  - `ALL`: `public.has_permission(auth.uid(), 'tasks.manage_all')`
- **`task_updates`**:
  - `SELECT`: Sama dengan relasi `tasks`.
  - `INSERT`: `logged_by = auth.uid() AND task_id IN (SELECT task_id FROM task_assignments WHERE assignee_id = auth.uid())`
- **`performance_targets` & `progress_updates`**:
  - `SELECT`: Terbuka untuk pengurus yayasan.
  - `UPDATE`: `profile_id = auth.uid() OR public.has_permission(auth.uid(), 'targets.manage')`
- **`weekly_reports`** (Laporan Jumat 3 Baris):
  - `SELECT`: `profile_id = auth.uid() OR public.has_permission(auth.uid(), 'weekly_reports.view_all')`
  - `INSERT/UPDATE`: `profile_id = auth.uid() AND public.has_permission(auth.uid(), 'weekly_reports.submit')`

### 2.8 Domain Audit Trail
- **`audit_logs`**:
  - `SELECT`: `public.has_permission(auth.uid(), 'audit_logs.view')`
  - `INSERT`: Hanya dapat di-insert melalui trigger PostgreSQL internal atau Service Role aman. Dilarang di-insert langsung dari client API.
  - `UPDATE/DELETE`: Ditolak secara mutlak untuk seluruh pengguna (**Immutable Audit Logs**).

---

## 3. Kebijakan Keamanan Supabase Storage (Storage RLS)

| Nama Bucket | Sifat Akses | Kebijakan Pembacaan (SELECT) | Kebijakan Penulisan (INSERT/UPDATE) |
| :--- | :---: | :--- | :--- |
| `public-assets` | **Public** | Terbuka untuk umum (logo, banner web, foto publik) | `public.has_permission(auth.uid(), 'content.manage')` |
| `private-payment-proofs` | **Private** | Hanya via *Signed URL* (5 menit) untuk peserta pemilik atau akun berizin `payments.verify` | Peserta pemilik pendaftaran dengan status pembayaran `pending` atau `rejected` (maks 2MB, MIME whitelist) |
| `private-learning-materials` | **Private** | Hanya via *Signed URL* untuk peserta terdaftar aktif (`status = 'accepted'`) pada batch terkait | Akun berizin `materials.manage_assigned` |
| `private-documents` | **Private** | Hanya via *Signed URL* untuk pengurus berizin sesuai klasifikasi dokumen | Akun berizin `organization.manage` atau `finance.manage` |

