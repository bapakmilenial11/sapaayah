# SAPA Ayah Digital Platform
> **"Menyapa untuk Tumbuh, Tumbuh untuk Menyapa"**  
> Platform Terintegrasi Manajemen Yayasan, Pembelajaran Keayahaan, dan Komunitas Sahabat Pembelajar Ayah (SAPA) Ayah.

---

## 1. Identitas Proyek & Organisasi
- **Organisasi:** Yayasan Sahabat Pembelajar Ayah (SAPA) Ayah
- **Visi:** Mewujudkan ayah Indonesia yang pembelajar, tangguh, dan bermakna dalam membangun keluarga kokoh dan berperadaban.
- **Misi:** Menyelenggarakan program edukatif berbasis nilai Islami, psikologi keluarga, dan pengalaman nyata keayahaan; mendorong keterlibatan aktif ayah; dan mengembangkan kolaborasi multipihak.
- **Nilai Inti:** Sahabat Tumbuh, Belajar adalah Kekuatan, Kehadiran Lebih dari Hadiah, Ayah Manusia Biasa Tapi Luar Biasa, Maskulinitas Rahmah.

---

## 2. Technology Stack

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | Single integrated monorepo with Route Groups |
| **Language** | TypeScript | Strict mode typing across all modules |
| **Styling** | Tailwind CSS + shadcn/ui | Design tokens based on SAPA Ayah brand guidelines |
| **Database** | Supabase PostgreSQL | Relational DB, foreign keys, transaction safety |
| **Authentication**| Supabase Auth | Secure session cookies via `@supabase/ssr` |
| **Authorization** | Supabase RLS + RBAC | PostgreSQL Row Level Security + Granular permissions |
| **Storage** | Supabase Storage | Public assets & private encrypted buckets with signed URLs |
| **Validation** | Zod + React Hook Form | Schema-driven client & server validation |
| **Deployment** | Vercel | Production & preview serverless hosting |
| **Version Control**| GitHub | Clean commit history & pull request reviews |

---

## 3. Brand Identity & Color Palette

- **Primary Blue:** `#547F9F` (Tombol utama, elemen branding, aksen interaktif)
- **Deep Blue:** `#385A75` (Heading, navigasi aktif, kontras tinggi)
- **Soft Blue:** `#E8F0F5` (Panel lembut, background kartu, highlight)
- **Background:** `#F5F7F8` (Latar belakang aplikasi)
- **Dark Text:** `#252D35` (Teks utama, kontras tinggi WCAG AA)
- **Card Surface:** `#FFFFFF` (Permukaan kartu, dialog, dan form)

---

## 4. Struktur Proyek Modular

```
sapa-ayah-platform/
├── AGENTS.md                  # Peraturan dan tata tertib agen AI
├── README.md                  # Dokumentasi umum sistem
├── package.json               # Konfigurasi dependensi project
├── tsconfig.json              # Konfigurasi TypeScript strict
├── tailwind.config.ts         # Konfigurasi tema & warna SAPA Ayah
├── next.config.ts             # Konfigurasi Next.js
├── docs/                      # Master technical documentation
│   ├── master-blueprint.md    # Dokumen induk blueprint teknis v1.0
│   ├── srs.md                 # Spesifikasi kebutuhan sistem (SRS)
│   ├── business-process.md    # Pemetaan alur bisnis & pendaftaran
│   ├── rbac-matrix.md         # Matriks hak akses & permission
│   ├── database-design.md     # Desain database PostgreSQL & ERD
│   ├── security-policy.md     # Kebijakan keamanan & RLS
│   ├── roadmap.md             # Roadmap implementasi fase 0 - 6
│   ├── architecture.md        # Arsitektur Next.js & boundary
│   ├── implementation-plan.md # Rencana kerja detail per fase
│   ├── technical-decisions.md # Rekam keputusan arsitektur (ADR)
│   ├── development-status.md  # Status pengembangan & milestone
│   └── risk-register.md       # Registrasi risiko & strategi mitigasi
├── public/                    # Aset statis & logo yayasan
│   └── logos/Logo.png
├── supabase/                  # Database migration & seed scripts
│   ├── migrations/
│   └── seeds/
└── src/                       # Source code Next.js App Router
    ├── app/
    │   ├── (public)/          # Website informasi publik
    │   ├── (auth)/            # Login, register, forgot-password
    │   ├── (dashboard)/       # Panel manajemen internal pengurus
    │   └── (portal)/          # Portal mandiri peserta
    ├── components/            # Komponen UI reusable (ui, public, dashboard, portal)
    ├── features/              # Logika domain per modul & Server Actions
    ├── lib/                   # Supabase clients, auth guards, utils
    └── types/                 # TypeScript type definitions
```

---

## 5. Panduan Menjalankan Proyek Lokal (Getting Started)

### Prasyarat
- Node.js 18+ / 20+ / 22+
- npm / yarn / pnpm
- Proyek Supabase aktif (Cloud / Local via Supabase CLI)

### Instalasi & Setup Lingkungan
1. Salin berkas lingkungan:
   ```bash
   cp .env.example .env.local
   ```
2. Isi variabel Supabase pada `.env.local`:
   ```bash
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-DO-NOT-EXPOSE
   ```
3. Install dependensi:
   ```bash
   npm install
   ```
4. Jalankan development server:
   ```bash
   npm run dev
   ```
5. Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 6. Indeks Dokumentasi Teknis

Sebelum melakukan modifikasi kode atau penambahan fitur, seluruh kontributor dan agen wajib membaca:
- [Master Technical Blueprint](docs/master-blueprint.md)
- [Software Requirements Specification (SRS)](docs/srs.md)
- [Business Process Mapping](docs/business-process.md)
- [RBAC Matrix & Permissions](docs/rbac-matrix.md)
- [Database Design & ERD](docs/database-design.md)
- [Security Policy & RLS](docs/security-policy.md)
- [Implementation Roadmap](docs/roadmap.md)
- [System Architecture](docs/architecture.md)
- [Implementation Plan](docs/implementation-plan.md)
- [Architectural Decision Records (ADR)](docs/technical-decisions.md)
- [Development Status](docs/development-status.md)
- [Risk Register](docs/risk-register.md)

