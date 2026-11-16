import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Award, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { CertificateBadgeCard } from '@/components/certificates/CertificateBadgeCard';

export default async function ParticipantCertificatesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const supabase = await createClient();

  // Ambil participant_id
  const { data: participant } = await supabase
    .from('participants')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle();

  let certificates: any[] = [];

  if (participant) {
    const { data: certData } = await supabase
      .from('certificates')
      .select(
        `
        id,
        certificate_number,
        batch_id,
        participant_id,
        issued_at,
        pdf_storage_path,
        signed_by_profile_id,
        verification_hash,
        created_at,
        batch:program_batches(
          id,
          name,
          program:programs(id, name)
        )
      `
      )
      .eq('participant_id', participant.id)
      .order('issued_at', { ascending: false });

    certificates = certData || [];
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-[#385A75]">Sertifikat Kelulusan Digital</h1>
        <p className="text-xs text-[#252D35]/70 mt-1">
          Daftar seluruh sertifikat resmi kelulusan program pembelajaran SAPA Ayah yang terverifikasi secara kriptografis (SHA-256).
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center space-y-3">
          <Award className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-sm font-bold text-gray-700">Belum Ada Sertifikat Kelulusan</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Sertifikat kelulusan diterbitkan oleh pengurus yayasan setelah Anda menyelesaikan seluruh rangkaian sesi kelas dan presensi.
          </p>
          <Link
            href="/portal/program-saya"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#547F9F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#385A75] transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Lihat Progres Kelas Saya</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {certificates.map((cert) => (
            <CertificateBadgeCard key={cert.id} certificate={cert} />
          ))}
        </div>
      )}
    </div>
  );
}

