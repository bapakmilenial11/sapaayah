import { getCurrentUser } from '@/lib/auth/session';
import { assertPermission } from '@/lib/permissions/guard';
import { createClient } from '@/lib/supabase/server';
import { GraduationCap, Users, Award, MapPin } from 'lucide-react';

export default async function AlumniPage() {
  await assertPermission('community.view');
  const user = await getCurrentUser();

  const supabase = await createClient();

  // Query peserta yang berstatus accepted atau memiliki sertifikat
  const { data: certs } = await supabase
    .from('certificates')
    .select(
      `
      id,
      certificate_number,
      issued_at,
      batch:program_batches(name),
      participant:participants(full_name, email, city)
    `
    )
    .order('issued_at', { ascending: false });

  const alumniList = certs || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-[#385A75]">Direktori Alumni & Komunitas Ayah</h1>
        <p className="text-xs text-[#252D35]/70 mt-1">
          Basis data jejaring alumni yang telah menuntaskan program pembelajaran dan memegang sertifikat resmi SAPA Ayah.
        </p>
      </div>

      <div className="rounded-2xl border border-[#E8F0F5] bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#547F9F]" />
            <h3 className="text-sm font-bold text-gray-900">Daftar Alumni Bersertifikat</h3>
          </div>
          <span className="text-xs bg-[#E8F0F5] text-[#385A75] font-semibold px-2.5 py-0.5 rounded-full">
            {alumniList.length} Alumni
          </span>
        </div>

        {alumniList.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p>Belum ada data alumni yang memegang sertifikat kelulusan.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {alumniList.map((alumni) => (
              <div key={alumni.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-gray-900">
                    {(alumni.participant as any)?.full_name || 'Alumni SAPA Ayah'}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {(alumni.batch as any)?.name} • No: {alumni.certificate_number}
                  </div>
                </div>
                {(alumni.participant as any)?.city && (
                  <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span>{(alumni.participant as any)?.city}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

