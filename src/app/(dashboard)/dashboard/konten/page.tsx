import { getCurrentUser } from '@/lib/auth/session';
import { assertPermission } from '@/lib/permissions/guard';
import { Sparkles, Calendar, Video, FileText, ExternalLink } from 'lucide-react';

export default async function ContentPage() {
  await assertPermission('content.view');
  const user = await getCurrentUser();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-[#385A75]">Manajemen Konten & Media Edukasi</h1>
        <p className="text-xs text-[#252D35]/70 mt-1">
          Perencanaan kalender publikasi, arsip materi media sosial, dan dokumentasi podcast / webinar SAPA Ayah.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kanal Resmi Yayasan */}
        <div className="rounded-2xl border border-[#E8F0F5] bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#385A75] border-b border-gray-100 pb-2">
            <Sparkles className="w-4 h-4 text-[#547F9F]" />
            <span>Kanal Distribusi Resmi</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
              <span className="font-semibold text-gray-800">Instagram Official</span>
              <span className="text-gray-500 font-mono">@sapaayah</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
              <span className="font-semibold text-gray-800">YouTube Channel</span>
              <span className="text-gray-500 font-mono">SAPA Ayah Channel</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
              <span className="font-semibold text-gray-800">Grup Komunitas WhatsApp</span>
              <span className="text-gray-500 font-mono">Sahabat Pembelajar Ayah</span>
            </div>
          </div>
        </div>

        {/* Kalender Produksi Konten */}
        <div className="rounded-2xl border border-[#E8F0F5] bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#385A75] border-b border-gray-100 pb-2">
            <Calendar className="w-4 h-4 text-[#547F9F]" />
            <span>Ritme Publikasi Konten</span>
          </div>
          <div className="space-y-2 text-xs text-gray-600">
            <p>• <strong>Senin & Rabu:</strong> Infografis parenting fitrah ayah & tips pengasuhan harian.</p>
            <p>• <strong>Jumat:</strong> Publikasi agenda kajian rutin & rilis pendaftaran angkatan baru.</p>
            <p>• <strong>Akhir Pekan:</strong> Dokumentasi kegiatan offline dan testimoni alumni program.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

