import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from '@/components/portal/ProfileForm';
import { User, ShieldCheck } from 'lucide-react';

export default async function ParticipantProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  // Query detail profil & data peserta
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('id', user.id)
    .single();

  const { data: participant } = await supabase
    .from('participants')
    .select('city')
    .eq('profile_id', user.id)
    .maybeSingle();

  const userEmail = authUser?.email || '';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="rounded-2xl border border-[#E8F0F5] bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-[#547F9F] flex items-center justify-center text-white shadow-md text-xl font-bold">
              {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#385A75] border border-blue-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#547F9F]" />
                  <span>Akun Aktif</span>
                </span>
              </div>
              <h1 className="text-xl font-bold text-[#385A75] mt-1">{user.fullName}</h1>
              <p className="text-xs text-[#252D35]/60 font-mono">{userEmail}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Pengaturan Profil */}
      <div className="rounded-2xl border border-[#E8F0F5] bg-white p-6 shadow-sm space-y-4">
        <div className="border-b border-[#E8F0F5] pb-3">
          <h2 className="text-sm font-bold text-[#385A75]">Informasi Data Diri</h2>
          <p className="text-xs text-[#252D35]/60">
            Perbarui data diri dan kontak WhatsApp Anda untuk keperluan verifikasi pendaftaran program.
          </p>
        </div>

        <ProfileForm
          initialData={{
            fullName: profile?.full_name || user.fullName || '',
            email: userEmail,
            phone: profile?.phone || '',
            city: participant?.city || '',
            roles: user.roles && user.roles.length > 0 ? user.roles : ['Peserta'],
          }}
        />
      </div>
    </div>
  );
}

