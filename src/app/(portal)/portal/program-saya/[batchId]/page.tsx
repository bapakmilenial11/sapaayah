import { getCurrentUser } from '@/lib/auth/session';
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getMyAttendanceHistory } from '@/features/sessions/queries';
import { getMaterialsForBatch } from '@/features/materials/queries';
import { getParticipantCertificate } from '@/features/certificates/queries';
import { ParticipantAttendanceCard } from '@/components/portal/ParticipantAttendanceCard';
import { ParticipantSessionList } from '@/components/portal/ParticipantSessionList';
import { MaterialListCard } from '@/components/materials/MaterialListCard';
import { CertificateBadgeCard } from '@/components/certificates/CertificateBadgeCard';
import { formatDateIndonesia, formatRupiah } from '@/lib/utils';
import { ArrowLeft, BookOpen, Layers, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default async function ParticipantBatchDetailPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const supabase = await createClient();

  // 1. Ambil data registrasi pengguna pada batch ini (untuk otorisasi kepemilikan)
  const { data: registration, error: regErr } = await supabase
    .from('registrations')
    .select(
      `
      id,
      status,
      submitted_at,
      notes,
      batch:program_batches!inner(
        id,
        name,
        batch_number,
        price,
        start_at,
        end_at,
        program:programs!inner(
          id,
          name,
          program_type,
          tagline
        )
      )
    `
    )
    .eq('batch_id', batchId)
    .eq('participant.profile_id', user.id)
    .maybeSingle();

  if (regErr || !registration) {
    notFound();
  }

  const batch = (registration as any).batch;
  const isAccepted = registration.status === 'accepted';

  // 2. Ambil riwayat presensi & jadwal sesi pribadi via getMyAttendanceHistory
  const [attendanceHistory, materials, certificate] = await Promise.all([
    getMyAttendanceHistory(batchId),
    isAccepted ? getMaterialsForBatch(batchId).catch(() => []) : Promise.resolve([]),
    isAccepted ? getParticipantCertificate(batchId).catch(() => null) : Promise.resolve(null),
  ]);

  const getStatusBanner = () => {
    switch (registration.status) {
      case 'accepted':
        return (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              Pendaftaran Anda berstatus <strong>Diterima (Accepted)</strong>. Anda memiliki akses penuh ke ruang kelas
              virtual dan modul materi pembelajaran.
            </span>
          </div>
        );
      case 'submitted':
      case 'under_review':
        return (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Pendaftaran Dalam Proses Verifikasi</span>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Status saat ini: <strong>{registration.status}</strong>. Tautan ruang kelas virtual akan terbuka
                secara otomatis setelah konfirmasi pembayaran diverifikasi oleh Bendahara yayasan.
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs font-medium text-gray-700">
            <AlertTriangle className="h-4 w-4 text-gray-500 shrink-0" />
            <span>
              Status pendaftaran Anda saat ini: <strong>{registration.status}</strong>.
            </span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#252D35]/60">
        <Link
          href="/portal/program-saya"
          className="hover:text-[#547F9F] flex items-center gap-1 transition"
        >
          <ArrowLeft className="h-3 w-3" />
          Program & Kelas Saya
        </Link>
        <span>/</span>
        <span className="text-[#385A75] font-semibold">{batch.name}</span>
      </div>

      {/* Header Info Angkatan & Program */}
      <div className="rounded-2xl border border-[#E8F0F5] bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-[#547F9F] px-2.5 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wider">
                {batch.program.program_type}
              </span>
              <span className="rounded bg-[#E8F0F5] px-2.5 py-0.5 text-[10px] font-semibold text-[#547F9F]">
                Batch #{batch.batch_number}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#385A75]">{batch.program.name}</h1>
            <p className="text-xs text-[#252D35]/70 font-medium">{batch.name}</p>
          </div>

          <div className="self-start sm:self-auto">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                isAccepted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {registration.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#E8F0F5] text-xs text-[#252D35]/70">
          <div>
            <span className="text-[#252D35]/50 block text-[11px]">Pelaksanaan:</span>
            <span className="font-semibold text-[#385A75]">
              {formatDateIndonesia(batch.start_at)} - {formatDateIndonesia(batch.end_at)}
            </span>
          </div>
          <div>
            <span className="text-[#252D35]/50 block text-[11px]">Investasi:</span>
            <span className="font-semibold text-[#385A75]">
              {batch.price === 0 ? 'Gratis' : formatRupiah(batch.price)}
            </span>
          </div>
          <div>
            <span className="text-[#252D35]/50 block text-[11px]">Terdaftar Pada:</span>
            <span className="font-semibold text-[#385A75]">
              {formatDateIndonesia(registration.submitted_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Banner Status Registrasi */}
      {getStatusBanner()}

      {/* Sertifikat Kelulusan Resmi Digital (Jika sudah diterbitkan) */}
      {isAccepted && certificate && (
        <CertificateBadgeCard certificate={certificate} />
      )}

      {/* Kartu Statistik Kehadiran (Khusus Peserta yang sudah Accepted) */}
      {isAccepted && attendanceHistory && (
        <ParticipantAttendanceCard stats={attendanceHistory.stats} />
      )}

      {/* Materi Pembelajaran Batch (Khusus Peserta Accepted) */}
      {isAccepted && (
        <MaterialListCard
          materials={materials}
          title={`Materi Pembelajaran: ${batch.name}`}
          emptyMessage="Belum ada materi pembelajaran yang dirilis untuk angkatan kelas ini."
        />
      )}

      {/* Daftar Sesi Pertemuan Kelas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#547F9F]" />
            <h3 className="text-sm font-bold text-[#385A75]">Agenda Pertemuan Kelas</h3>
          </div>
          <span className="text-xs text-[#252D35]/60">
            Total {attendanceHistory?.records?.length || 0} Sesi
          </span>
        </div>

        <ParticipantSessionList
          sessions={attendanceHistory?.records || []}
          isRegistrationAccepted={isAccepted}
        />
      </div>
    </div>
  );
}

