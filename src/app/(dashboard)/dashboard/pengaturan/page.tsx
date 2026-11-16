import { getCurrentUser } from '@/lib/auth/session';
import { assertPermission } from '@/lib/permissions/guard';
import { Settings, ShieldCheck, Database, KeyRound, Globe, Server } from 'lucide-react';

export default async function SettingsPage() {
  await assertPermission('settings.view');
  const user = await getCurrentUser();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-[#385A75]">Pengaturan Sistem Yayasan</h1>
        <p className="text-xs text-[#252D35]/70 mt-1">
          Konfigurasi umum platform, preferensi keamanan, dan parameter integrasi cloud.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Identitas Organisasi */}
        <div className="rounded-2xl border border-[#E8F0F5] bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#385A75] border-b border-gray-100 pb-2">
            <Globe className="w-4 h-4 text-[#547F9F]" />
            <span>Identitas Platform</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-gray-400 block text-[10px]">Nama Yayasan:</span>
              <span className="font-semibold text-gray-800">Yayasan Sahabat Pembelajar Ayah</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Brand Digital:</span>
              <span className="font-semibold text-gray-800">SAPA Ayah Digital Platform</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Status Operasional:</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                Aktif (Production Ready)
              </span>
            </div>
          </div>
        </div>

        {/* Infrastruktur Backend */}
        <div className="rounded-2xl border border-[#E8F0F5] bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#385A75] border-b border-gray-100 pb-2">
            <Server className="w-4 h-4 text-[#547F9F]" />
            <span>Infrastruktur Cloud</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-gray-400 block text-[10px]">Hosting Frontend:</span>
              <span className="font-semibold text-gray-800">Vercel Serverless Edge (Next.js 15)</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Database & Auth:</span>
              <span className="font-semibold text-gray-800">Supabase PostgreSQL 15+ (Singapore ap-southeast-1)</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Penyimpanan Privat:</span>
              <span className="font-semibold text-gray-800">Supabase Encrypted Storage (Time-Limited Signed URLs)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

