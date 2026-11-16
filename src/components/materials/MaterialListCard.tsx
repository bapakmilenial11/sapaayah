'use client';

import { useState } from 'react';
import { FileText, Download, Loader2, AlertCircle, FileCheck } from 'lucide-react';
import type { LearningMaterialItem } from '@/features/materials/queries';
import { getMaterialDownloadUrlAction } from '@/features/materials/actions';

interface MaterialListCardProps {
  materials: LearningMaterialItem[];
  title?: string;
  emptyMessage?: string;
}

export function MaterialListCard({
  materials,
  title = 'Materi Pembelajaran',
  emptyMessage = 'Belum ada materi pembelajaran yang diunggah.',
}: MaterialListCardProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Tidak diketahui';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = async (material: LearningMaterialItem) => {
    try {
      setDownloadingId(material.id);
      setErrorMap((prev) => ({ ...prev, [material.id]: '' }));

      const res = await getMaterialDownloadUrlAction(material.id);
      if (!res.success || !res.url) {
        setErrorMap((prev) => ({
          ...prev,
          [material.id]: res.message || 'Gagal mengunduh: Akses berkas tidak diizinkan atau telah kedaluwarsa.',
        }));
        return;
      }

      // Buka URL unduhan yang aman di tab baru
      window.open(res.url, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      setErrorMap((prev) => ({
        ...prev,
        [material.id]: err.message || 'Terjadi kesalahan saat memproses unduhan berkas.',
      }));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-[#547F9F]" />
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <span className="text-xs bg-[#E8F0F5] text-[#385A75] font-medium px-2.5 py-0.5 rounded-full">
          {materials.length} Berkas
        </span>
      </div>

      {materials.length === 0 ? (
        <div className="text-center py-6 text-gray-500 text-sm">
          <FileCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {materials.map((item) => {
            const isDownloading = downloadingId === item.id;
            const err = errorMap[item.id];

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border border-gray-100 hover:border-blue-100 hover:bg-[#F5F7F8] transition-colors gap-3"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-[#547F9F] mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-900">{item.title}</h4>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-400">
                      <span>Ukuran: {formatFileSize(item.file_size_bytes)}</span>
                      {item.file_type && (
                        <>
                          <span>•</span>
                          <span className="uppercase">{item.file_type}</span>
                        </>
                      )}
                    </div>
                    {err && (
                      <div className="flex items-center space-x-1 text-xs text-red-600 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{err}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownload(item)}
                  disabled={isDownloading}
                  className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#E8F0F5] hover:bg-[#d8e5ee] text-[#385A75] border border-blue-200 transition-colors disabled:opacity-50 self-end sm:self-center"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyiapkan link...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh (15m URL)</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
