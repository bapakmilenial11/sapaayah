'use client';

import { Award, ShieldCheck, Download, ExternalLink, Hash, Calendar } from 'lucide-react';
import type { CertificateItem } from '@/features/certificates/queries';
import { formatDateIndonesia } from '@/lib/utils';

interface CertificateBadgeCardProps {
  certificate: CertificateItem;
}

export function CertificateBadgeCard({ certificate }: CertificateBadgeCardProps) {
  return (
    <div className="bg-gradient-to-br from-[#F5F7F8] via-[#E8F0F5] to-white rounded-2xl border-2 border-[#547F9F]/30 p-6 shadow-sm relative overflow-hidden">
      {/* Background Decorative Accent */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#547F9F]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
        <div className="flex items-start space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-[#547F9F] flex items-center justify-center text-white shadow-md flex-shrink-0">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Terverifikasi Resmi</span>
              </span>
              <span className="text-xs text-gray-500">
                {certificate.batch?.program?.name || 'Program SAPA Ayah'}
              </span>
            </div>

            <h3 className="text-lg font-bold text-[#252D35] mt-1.5">
              Sertifikat Kelulusan & Partisipasi
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-gray-600">
              <div className="flex items-center space-x-1.5">
                <Hash className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-mono font-medium text-gray-800">
                  {certificate.certificate_number}
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>Diterbitkan: {formatDateIndonesia(certificate.issued_at)}</span>
              </div>
            </div>

            <div className="mt-2.5 flex items-center space-x-2 text-[11px] text-gray-500 bg-white/70 backdrop-blur-sm p-1.5 px-2.5 rounded-lg border border-gray-200/60 inline-flex max-w-full truncate">
              <span className="font-semibold text-gray-700">Kode Hash:</span>
              <span className="font-mono text-gray-500 truncate" title={certificate.verification_hash}>
                {certificate.verification_hash.substring(0, 24)}...
              </span>
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-200">
          <div className="text-right hidden sm:block mb-2">
            <span className="text-[11px] text-gray-500 block">Status Kelulusan</span>
            <span className="text-xs font-semibold text-emerald-600">Lulus Penuh</span>
          </div>

          {certificate.pdf_storage_path ? (
            <a
              href={`/api/certificates/download/${certificate.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[#547F9F] hover:bg-[#385A75] text-white shadow transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Sertifikat</span>
            </a>
          ) : (
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-4 h-4" />
              <span>Tercatat Digital</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

