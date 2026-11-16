import Link from 'next/link';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';

export default function KegiatanPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold text-[#385A75]">Agenda & Kegiatan Mendatang</h1>
        <p className="text-base text-[#252D35]/80">
          Ikuti sesi kelas, webinar, dan bincang santai keluarga bersama narasumber terpercaya.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-[#E8F0F5] bg-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="inline-block rounded bg-[#E8F0F5] px-2.5 py-1 text-xs font-semibold text-[#385A75]">
              Webinar Publik
            </span>
            <h3 className="text-2xl font-bold text-[#385A75]">Ayah, Arahnya ke Mana?</h3>
            <p className="text-sm text-[#252D35]/75 max-w-xl">
              Sesi peluncuran resmi SAPA Ayah dan penguatan visi keayahaan di era modern bersama Dr. Fahrurroji Firman, M.Pd.I.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#252D35]/70 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-[#547F9F]" />
                Jadwal: Bulan 1–2
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#547F9F]" />
                Online (Zoom Meeting)
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-[#547F9F] px-6 py-3 text-sm font-semibold text-white hover:bg-[#385A75] transition"
            >
              Daftar Peserta
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

