import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { FileCheck, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { MaterialListCard } from '@/components/materials/MaterialListCard';

export default async function ParticipantMaterialsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const supabase = await createClient();

  // Ambil participant_id
  const { data: participant } = await supabase
    .from('participants')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle();

  let materials: any[] = [];

  if (participant) {
    const { data: regs } = await supabase
      .from('registrations')
      .select('batch_id')
      .eq('participant_id', participant.id)
      .eq('status', 'accepted');

    const batchIds = (regs || []).map((r) => r.batch_id);

    if (batchIds.length > 0) {
      const { data: matData } = await supabase
        .from('learning_materials')
        .select('*')
        .in('batch_id', batchIds)
        .order('created_at', { ascending: false });

      materials = matData || [];
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-[#385A75]">Materi & Modul Pembelajaran</h1>
        <p className="text-xs text-[#252D35]/70 mt-1">
          Unduh modul pegangan ayah, slide presentasi, dan materi ajar dari seluruh kelas yang Anda ikuti.
        </p>
      </div>

      {materials.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center space-y-3">
          <FileCheck className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-sm font-bold text-gray-700">Belum Ada Materi Pembelajaran</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Materi ajar akan dibagikan oleh fasilitator seiring berjalannya sesi kelas.
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
        <MaterialListCard
          materials={materials}
          title="Semua Berkas Materi Pembelajaran"
          emptyMessage="Belum ada berkas materi yang dirilis."
        />
      )}
    </div>
  );
}

