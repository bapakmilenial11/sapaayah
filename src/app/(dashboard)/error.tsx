'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-md w-full text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Terjadi Kendala Memuat Data</h2>
        <p className="text-xs text-gray-600 leading-relaxed">
          Sistem mendeteksi kendala saat mengambil metrik dashboard:
          <br />
          <span className="font-mono text-[11px] text-red-600 bg-red-50 px-2 py-0.5 rounded mt-1 inline-block">
            {error.message || 'Server Exception'}
          </span>
        </p>

        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#547F9F] text-white hover:bg-[#385A75] transition shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Coba Lagi</span>
          </button>
          <Link
            href="/portal"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Ke Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

