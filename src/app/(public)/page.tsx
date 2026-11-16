import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Users, Compass, ShieldCheck, HeartHandshake, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#E8F0F5]/40 to-[#F5F7F8] py-20 lg:py-28">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F0F5] px-4 py-1.5 text-xs font-semibold text-[#385A75]">
                <HeartHandshake className="h-4 w-4 text-[#547F9F]" />
                <span>Sahabat Pembelajar Ayah (SAPA) Ayah</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#385A75] leading-tight">
                Menyapa untuk Tumbuh, <br />
                <span className="text-[#547F9F]">Tumbuh untuk Menyapa</span>
              </h1>
              <p className="text-lg text-[#252D35]/80 max-w-2xl leading-relaxed">
                Mewujudkan ayah Indonesia yang pembelajar, tangguh, dan bermakna dalam membangun keluarga yang kokoh dan berperadaban.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  href="/program"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#547F9F] px-6 py-3.5 text-base font-semibold text-white shadow-md hover:bg-[#385A75] transition"
                >
                  Jelajahi Program
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/tentang"
                  className="rounded-lg border border-[#547F9F]/30 bg-white px-6 py-3.5 text-base font-semibold text-[#385A75] hover:bg-[#E8F0F5] transition"
                >
                  Tentang Kami
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-[#E8F0F5] text-center space-y-6">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-[#E8F0F5]/60 p-4">
                  <Image
                    src="/logos/Logo.png"
                    alt="Logo SAPA Ayah"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-[#385A75]">Ruang Belajar & Refleksi Ayah</h3>
                  <p className="text-sm text-[#252D35]/70">
                    Program edukatif berbasis nilai Islami, psikologi keluarga, dan pengalaman nyata para ayah.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 text-left">
                  <div className="rounded-lg bg-[#F5F7F8] p-3 border border-[#E8F0F5]">
                    <div className="text-xs text-[#547F9F] font-semibold">Fokus Utama</div>
                    <div className="text-sm font-bold text-[#385A75]">Ketahanan Keluarga</div>
                  </div>
                  <div className="rounded-lg bg-[#F5F7F8] p-3 border border-[#E8F0F5]">
                    <div className="text-xs text-[#547F9F] font-semibold">Pendekatan</div>
                    <div className="text-sm font-bold text-[#385A75]">Maskulinitas Rahmah</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE VALUES SECTION */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#547F9F]">Nilai-Nilai Inti Yayasan</h2>
          <p className="text-3xl font-extrabold text-[#385A75]">Pilar Kebermaknaan SAPA Ayah</p>
          <p className="text-sm text-[#252D35]/70">
            Setiap inisiatif dirancang dengan landasan empati, kesetaraan, dan komitmen bertumbuh bersama.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-xl border border-[#E8F0F5] bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#E8F0F5] text-[#385A75] mb-4">
              <Users className="h-6 w-6 text-[#547F9F]" />
            </div>
            <h3 className="text-lg font-bold text-[#385A75] mb-2">Sahabat Tumbuh</h3>
            <p className="text-sm text-[#252D35]/70 leading-relaxed">
              Pendampingan yang hangat, setara, dan tidak menghakimi. Setiap ayah berhak memiliki ruang aman untuk refleksi.
            </p>
          </div>

          <div className="rounded-xl border border-[#E8F0F5] bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#E8F0F5] text-[#385A75] mb-4">
              <BookOpen className="h-6 w-6 text-[#547F9F]" />
            </div>
            <h3 className="text-lg font-bold text-[#385A75] mb-2">Belajar adalah Kekuatan</h3>
            <p className="text-sm text-[#252D35]/70 leading-relaxed">
              Keinginan untuk terus belajar adalah bekal terbaik seorang ayah dalam menghadapi dinamika zaman dan pengasuhan anak.
            </p>
          </div>

          <div className="rounded-xl border border-[#E8F0F5] bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#E8F0F5] text-[#385A75] mb-4">
              <Compass className="h-6 w-6 text-[#547F9F]" />
            </div>
            <h3 className="text-lg font-bold text-[#385A75] mb-2">Kehadiran Lebih dari Hadiah</h3>
            <p className="text-sm text-[#252D35]/70 leading-relaxed">
              Waktu, perhatian, dan keterlibatan emosional yang utuh adalah hadiah paling berharga yang bisa diberikan seorang ayah kepada keluarga.
            </p>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PROGRAMS SECTION */}
      <section className="bg-white py-16 border-y border-[#E8F0F5]">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#547F9F]">Program Pilihan</h2>
              <p className="text-3xl font-extrabold text-[#385A75]">Jalur Pembelajaran Berjenjang</p>
            </div>
            <Link
              href="/program"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#547F9F] hover:text-[#385A75]"
            >
              Lihat seluruh katalog program
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col justify-between rounded-xl border border-[#E8F0F5] bg-[#F5F7F8] p-6 hover:border-[#547F9F]/40 transition">
              <div className="space-y-3">
                <span className="inline-block rounded-full bg-[#E8F0F5] px-3 py-1 text-xs font-medium text-[#385A75]">
                  Fase Awal
                </span>
                <h3 className="text-xl font-bold text-[#385A75]">SAPA Start (Calon Ayah)</h3>
                <p className="text-sm text-[#252D35]/70 leading-relaxed">
                  Webinar dan Kelas Pranikah untuk membekali calon suami dan calon ayah dalam kesiapan mental, spiritual, dan peran kepala keluarga.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  href="/program"
                  className="text-sm font-semibold text-[#547F9F] hover:text-[#385A75] inline-flex items-center gap-1"
                >
                  Pelajari Rincian &rarr;
                </Link>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-xl border-2 border-[#547F9F] bg-white p-6 shadow-md relative">
              <span className="absolute -top-3 right-6 rounded-full bg-[#547F9F] px-3 py-0.5 text-xs font-semibold text-white">
                Unggulan
              </span>
              <div className="space-y-3">
                <span className="inline-block rounded-full bg-[#E8F0F5] px-3 py-1 text-xs font-medium text-[#385A75]">
                  Ayah Baru & Balita
                </span>
                <h3 className="text-xl font-bold text-[#385A75]">SAPA Grow: Kelas Menjadi Ayah</h3>
                <p className="text-sm text-[#252D35]/70 leading-relaxed">
                  Pendampingan intensif bagi ayah muda: bonding dengan bayi, kemitraan suami-istri pascamelahirkan, dan manajemen stres rumah tangga.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  href="/program"
                  className="text-sm font-semibold text-[#547F9F] hover:text-[#385A75] inline-flex items-center gap-1"
                >
                  Pelajari Rincian &rarr;
                </Link>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-[#E8F0F5] bg-[#F5F7F8] p-6 hover:border-[#547F9F]/40 transition">
              <div className="space-y-3">
                <span className="inline-block rounded-full bg-[#E8F0F5] px-3 py-1 text-xs font-medium text-[#385A75]">
                  Edukasi Publik
                </span>
                <h3 className="text-xl font-bold text-[#385A75]">SAPA Talk & Stories</h3>
                <p className="text-sm text-[#252D35]/70 leading-relaxed">
                  Podcast YouTube dan artikel reflektif mingguan yang mengangkat kisah nyata perjalanan ayah, tips praktis, dan dialog santai.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  href="/program"
                  className="text-sm font-semibold text-[#547F9F] hover:text-[#385A75] inline-flex items-center gap-1"
                >
                  Pelajari Rincian &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION SECTION */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-[#385A75] to-[#547F9F] p-8 sm:p-12 text-white shadow-xl text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Siap Bertumbuh Bersama Komunitas SAPA Ayah?
          </h2>
          <p className="text-base sm:text-lg text-[#E8F0F5] max-w-2xl mx-auto leading-relaxed">
            Daftarkan diri Anda hari ini untuk mendapatkan informasi pembukaan angkatan kelas terbaru, webinar edukasi gratis, dan komunitas sahabat ayah.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-white px-8 py-3.5 text-base font-bold text-[#385A75] hover:bg-[#E8F0F5] transition shadow-md"
            >
              Daftar Sekarang
            </Link>
            <Link
              href="/kontak"
              className="rounded-lg border border-white/40 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition"
            >
              Hubungi Pengurus
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

