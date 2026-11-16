'use client';

import { useState, useTransition } from 'react';
import { Award, Plus, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { issueCertificateAction } from '@/features/certificates/actions';

interface EligibleParticipant {
  participant_id: string;
  full_name: string;
  email: string;
}

interface CertificateIssueModalProps {
  batchId: string;
  batchName: string;
  eligibleParticipants: EligibleParticipant[];
  onSuccess?: () => void;
}

export function CertificateIssueModal({
  batchId,
  batchName,
  eligibleParticipants,
  onSuccess,
}: CertificateIssueModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const [selectedParticipant, setSelectedParticipant] = useState('');
  const [customCertNumber, setCustomCertNumber] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    formData.set('batch_id', batchId);

    startTransition(async () => {
      const res = await issueCertificateAction(null, formData);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.message || 'Sertifikat berhasil diterbitkan secara resmi!',
        });
        setTimeout(() => {
          setIsOpen(false);
          setFeedback(null);
          setSelectedParticipant('');
          setCustomCertNumber('');
          onSuccess?.();
        }, 1500);
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Gagal menerbitkan sertifikat.',
        });
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#547F9F] hover:bg-[#385A75] text-white shadow-sm transition-colors"
      >
        <Award className="w-4 h-4" />
        <span>Terbitkan Sertifikat</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 relative">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#547F9F] flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Penerbitan Sertifikat Digital</h3>
                <p className="text-xs text-gray-500">Batch: {batchName}</p>
              </div>
            </div>

            {feedback && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center space-x-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Pilih Peserta Lulus <span className="text-red-500">*</span>
                </label>
                <select
                  name="participant_id"
                  required
                  value={selectedParticipant}
                  onChange={(e) => setSelectedParticipant(e.target.value)}
                  className="w-full text-xs rounded-xl border border-gray-300 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#547F9F]"
                >
                  <option value="">-- Pilih Peserta --</option>
                  {eligibleParticipants.map((p) => (
                    <option key={p.participant_id} value={p.participant_id}>
                      {p.full_name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nomor Sertifikat (Opsional)
                </label>
                <input
                  type="text"
                  name="certificate_number"
                  placeholder="Contoh: CERT-SA-2026-001 (Biarkan kosong untuk auto-generate)"
                  value={customCertNumber}
                  onChange={(e) => setCustomCertNumber(e.target.value)}
                  className="w-full text-xs rounded-xl border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-[#547F9F]"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Jika dikosongkan, sistem akan otomatis menghasilkan nomor sertifikat standar SAPA Ayah.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending || !selectedParticipant}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#547F9F] hover:bg-[#385A75] text-white shadow-sm transition-colors disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menerbitkan...</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-3.5 h-3.5" />
                      <span>Terbitkan Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

