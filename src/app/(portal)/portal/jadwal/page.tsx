import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Calendar, Clock, Video, BookOpen, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDateTimeIndonesia } from '@/lib/utils';

export default async function ParticipantSchedulePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const supabase = await createClient();

  // Ambil participant_id
  const { data: participant } = await supabase
    .from('participants')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle();

  let sessions: any[] = [];

  if (participant) {
    // Ambil semua sesi dari batch yang diikuti peserta berstatus 'accepted'
    const { data: regs } = await supabase
      .from('registrations')
      .select('batch_id')
      .eq('participant_id', participant.id)
      .eq('status', 'accepted');

    const batchIds = (regs || []).map((r) => r.batch_id);

    if (batchIds.length > 0) {
      const { data: sessData } = await supabase
        .from('class_sessions')
        .select(
          `
          id,
          batch_id,
          session_number,
          title,
          description,
          starts_at,
          ends_at,
          meeting_url,
          status,
          batch:program_batches(
            id,
            name,
            program:programs(name)
          )
        `
        )
        .in('batch_id', batchIds)
        .order('starts_at', { ascending: true });

      sessions = sessData || [];
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-[#385A75]">Jadwal Sesi Pertemuan Kelas</h1>
        <p className="text-xs text-[#252D35]/70 mt-1">
          Daftar seluruh agenda tatap muka dan kelas virtual dari program pembelajaran yang Anda ikuti.
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center space-y-3">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-sm font-bold text-gray-700">Belum Ada Jadwal Sesi Aktif</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Jadwal pertemuan akan muncul otomatis setelah pendaftaran program Anda disetujui (Accepted) oleh panitia yayasan.
          </p>
          <Link
            href="/portal/program-saya"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#547F9F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#385A75] transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Lihat Program Saya</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className="rounded-2xl border border-[#E8F0F5] bg-white p-5 shadow-sm space-y-3 hover:border-blue-200 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[11px] font-bold text-[#547F9F] uppercase tracking-wider">
                    {sess.batch?.program?.name} • {sess.batch?.name}
                  </span>
                  <h3 className="text-base font-bold text-[#385A75] mt-0.5">
                    Sesi #{sess.session_number}: {sess.title}
                  </h3>
                </div>
                <span
                  className={`self-start sm:self-auto rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    sess.status === 'scheduled'
                      ? 'bg-amber-100 text-amber-800'
                      : sess.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {sess.status === 'scheduled' ? 'Terjadwal' : sess.status === 'completed' ? 'Selesai' : sess.status}
                </span>
              </div>

              {sess.description && (
                <p className="text-xs text-gray-600 line-clamp-2">{sess.description}</p>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#547F9F]" />
                  <span>{formatDateTimeIndonesia(sess.starts_at)}</span>
                </div>

                {sess.meeting_url ? (
                  <a
                    href={sess.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 border border-blue-200 text-xs self-start sm:self-auto"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Buka Ruang Kelas Virtual</span>
                  </a>
                ) : (
                  <span className="text-[11px] text-gray-400 italic">Tautan pertemuan belum dirilis</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

