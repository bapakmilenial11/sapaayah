import Link from 'next/link';
import { ArrowRight, Calendar, Users, Award } from 'lucide-react';

const programsList = [
  {
    title: 'SAPA Start: Webinar & Kelas Pranikah',
    category: 'Calon Ayah',
    desc: 'Membekali calon suami dan calon ayah seputar kesiapan mental, visi keluarga, dan komunikasi pasangan sebelum memasuki gerbang pernikahan.',
    type: 'Gratis & Berbayar',
    duration: 'Bulan 4–6',
    status: 'Segera Dibuka',
  },
  {
    title: 'SAPA Grow: Kelas Menjadi Ayah',
    category: 'Ayah Baru (0–5 Tahun)',
    desc: 'Pendampingan aplikatif tahun-tahun awal keayahaan: bonding dengan anak, pengasuhan kolaboratif bersama istri, dan manajemen emosi.',
    type: 'Program Berbayar',
    duration: 'Bulan 3',
    status: 'Segera Dibuka',
  },
  {
    title: 'SAPA Talk & Podcast YouTube',
    category: 'Edukasi Terbuka',
    desc: 'Bincang inspiratif seputar dinamika keayahaan bersama narasumber ahli, psikolog keluarga, dan praktisi parenting.',
    type: 'Gratis (Publik)',
    duration: 'Bulan 1 (Rutin)',
    status: 'Aktif',
  },
  {
    title: 'Webinar Publik: “Ayah, Arahnya ke Mana?”',
    category: 'Peluncuran & Refleksi',
    desc: 'Sesi webinar pembuka untuk mengajak para ayah berefleksi mengenai visi keayahaan di tengah tantangan zaman modern.',
    type: 'Gratis (Pendaftaran Terbuka)',
    duration: 'Bulan 1–2',
    status: 'Aktif',
  },
];

export default function ProgramPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold text-[#385A75]">Katalog Program SAPA Ayah</h1>
        <p className="text-base text-[#252D35]/80">
          Program berjenjang yang dirancang sesuai tahapan perjalanan peran seorang ayah.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {programsList.map((prog, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-[#E8F0F5] bg-white p-8 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#E8F0F5] px-3 py-1 text-xs font-semibold text-[#385A75]">
                  {prog.category}
                </span>
                <span className="text-xs font-semibold text-[#547F9F]">
                  {prog.type}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#385A75]">{prog.title}</h3>
              <p className="text-sm text-[#252D35]/75 leading-relaxed">{prog.desc}</p>
            </div>

            <div className="mt-8 pt-6 border-t border-[#E8F0F5] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-[#252D35]/70">
                <Calendar className="h-4 w-4 text-[#547F9F]" />
                <span>{prog.duration}</span>
              </div>
              <span className="rounded bg-[#F5F7F8] px-2.5 py-1 text-xs font-medium text-[#385A75]">
                {prog.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

