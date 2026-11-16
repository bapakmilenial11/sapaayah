import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';

export default function KontakPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold text-[#385A75]">Hubungi Pengurus SAPA Ayah</h1>
        <p className="text-base text-[#252D35]/80">
          Punya pertanyaan seputar program, kemitraan, atau ingin berkolaborasi? Kami siap menyapa Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-xl border border-[#E8F0F5] bg-white p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-[#385A75]">Kanal Komunikasi Resmi</h2>
          <div className="space-y-4 text-sm text-[#252D35]/80">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#E8F0F5] p-2.5 text-[#547F9F]">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-[#385A75]">WhatsApp Official</div>
                <div className="text-xs text-[#252D35]/60">Respon dalam 24 Jam Kerja</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#E8F0F5] p-2.5 text-[#547F9F]">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-[#385A75]">Email Yayasan</div>
                <div className="text-xs text-[#252D35]/60">info@sapaayah.id (Konfirmasi domain resmi)</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#E8F0F5] p-2.5 text-[#547F9F]">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-[#385A75]">Sekretariat</div>
                <div className="text-xs text-[#252D35]/60">Yayasan Sahabat Pembelajar Ayah, Indonesia</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#E8F0F5] bg-white p-8 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-[#385A75]">Kirim Pesan / Pertanyaan</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#385A75] mb-1">Nama Lengkap</label>
              <input
                type="text"
                className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2 text-sm focus:border-[#547F9F] focus:outline-none"
                placeholder="Nama Anda"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#385A75] mb-1">Email / WhatsApp</label>
              <input
                type="text"
                className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2 text-sm focus:border-[#547F9F] focus:outline-none"
                placeholder="email@example.com / 0812xxx"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#385A75] mb-1">Pesan</label>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2 text-sm focus:border-[#547F9F] focus:outline-none"
                placeholder="Tuliskan pertanyaan atau rencana kolaborasi..."
              ></textarea>
            </div>
            <button
              type="button"
              className="w-full rounded-lg bg-[#547F9F] py-2.5 text-sm font-semibold text-white hover:bg-[#385A75] transition"
            >
              Kirim Pesan
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

