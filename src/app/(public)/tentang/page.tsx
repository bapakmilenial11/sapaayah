import Image from 'next/image';
import Link from 'next/link';
import { HeartHandshake, CheckCircle2, ArrowRight } from 'lucide-react';

export default function TentangPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F0F5] px-4 py-1.5 text-xs font-semibold text-[#385A75]">
          <HeartHandshake className="h-4 w-4 text-[#547F9F]" />
          <span>Profil Yayasan</span>
        </div>
        <h1 className="text-4xl font-extrabold text-[#385A75]">
          Tentang Yayasan Sahabat Pembelajar Ayah
        </h1>
        <p className="text-lg text-[#252D35]/80 max-w-2xl mx-auto italic">
          “Menyapa untuk Tumbuh, Tumbuh untuk Menyapa”
        </p>
      </div>

      {/* Profil Singkat */}
      <div className="rounded-2xl border border-[#E8F0F5] bg-white p-8 sm:p-12 shadow-sm space-y-6 leading-relaxed">
        <h2 className="text-2xl font-bold text-[#385A75]">Siapa Kami</h2>
        <p className="text-[#252D35]/85">
          Yayasan Sahabat Pembelajar Ayah (SAPA) Ayah lahir dari kesadaran mendalam akan pentingnya
          peran ayah dalam ketahanan keluarga dan peradaban bangsa. Kami percaya bahwa setiap ayah
          ingin menjadi yang terbaik bagi keluarganya, namun seringkali menghadapi keterbatasan ruang
          belajar, minimnya referensi praktis, dan keengganan untuk berbagi beban.
        </p>
        <p className="text-[#252D35]/85">
          SAPA Ayah hadir sebagai sahabat yang menyapa tanpa menghakimi, merangkul para ayah dan calon
          ayah untuk saling menguatkan, belajar bersama, dan bertransformasi menjadi sosok pemimpin
          keluarga yang hadir secara utuh—baik fisik, pikiran, maupun emosional.
        </p>
      </div>

      {/* Visi & Misi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-xl border border-[#E8F0F5] bg-white p-8 shadow-sm space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#547F9F]">Visi Kami</div>
          <h3 className="text-xl font-bold text-[#385A75]">Ayah Indonesia yang Bermakna</h3>
          <p className="text-sm text-[#252D35]/80 leading-relaxed">
            Mewujudkan ayah Indonesia yang pembelajar, tangguh, dan bermakna dalam membangun keluarga kokoh dan berperadaban.
          </p>
        </div>

        <div className="rounded-xl border border-[#E8F0F5] bg-white p-8 shadow-sm space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#547F9F]">Misi Kami</div>
          <ul className="space-y-3 text-sm text-[#252D35]/80">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#547F9F] mt-0.5 shrink-0" />
              <span>Menjadi ruang belajar, refleksi, dan saling menguatkan bagi ayah dan calon ayah.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#547F9F] mt-0.5 shrink-0" />
              <span>Menyelenggarakan program edukatif berbasis nilai Islami, psikologi keluarga, dan pengalaman nyata.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#547F9F] mt-0.5 shrink-0" />
              <span>Mendorong keterlibatan aktif ayah dalam pengasuhan anak dan ketahanan keluarga.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#547F9F] mt-0.5 shrink-0" />
              <span>Menumbuhkan jejaring komunitas ayah yang saling mendukung dalam kebaikan.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* CTA Kontak */}
      <div className="text-center pt-8">
        <Link
          href="/program"
          className="inline-flex items-center gap-2 rounded-lg bg-[#547F9F] px-8 py-3 text-white font-semibold hover:bg-[#385A75] transition"
        >
          Lihat Program Kami
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

