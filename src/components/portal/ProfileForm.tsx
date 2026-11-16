'use client';

import { useActionState } from 'react';
import { updateProfileAction } from '@/features/profile/actions';
import { User, Phone, MapPin, Mail, Shield, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ProfileFormProps {
  initialData: {
    fullName: string;
    email: string;
    phone: string;
    city?: string | null;
    roles: string[];
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.message && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center space-x-2 ${
            state.success
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {state.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span>{state.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nama Lengkap */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#547F9F]" />
            <span>Nama Lengkap</span>
          </label>
          <input
            type="text"
            name="fullName"
            defaultValue={initialData.fullName}
            required
            className="w-full text-xs rounded-xl border border-gray-300 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#547F9F]"
          />
          {state?.errors?.fullName && (
            <p className="text-[11px] text-red-600">{state.errors.fullName[0]}</p>
          )}
        </div>

        {/* Email (Read Only) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-gray-400" />
            <span>Alamat Email (Akun Utama)</span>
          </label>
          <input
            type="email"
            value={initialData.email}
            disabled
            className="w-full text-xs rounded-xl border border-gray-200 p-2.5 bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="text-[10px] text-gray-400">Alamat email terikat pada akun autentikasi Anda.</p>
        </div>

        {/* Nomor WhatsApp */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-[#547F9F]" />
            <span>Nomor WhatsApp Aktif</span>
          </label>
          <input
            type="tel"
            name="phone"
            defaultValue={initialData.phone}
            required
            placeholder="Contoh: 081234567890"
            className="w-full text-xs rounded-xl border border-gray-300 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#547F9F]"
          />
          {state?.errors?.phone && (
            <p className="text-[11px] text-red-600">{state.errors.phone[0]}</p>
          )}
        </div>

        {/* Kota Domisili */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#547F9F]" />
            <span>Kota Domisili</span>
          </label>
          <input
            type="text"
            name="city"
            defaultValue={initialData.city || ''}
            placeholder="Contoh: Bandung, Jawa Barat"
            className="w-full text-xs rounded-xl border border-gray-300 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#547F9F]"
          />
        </div>
      </div>

      {/* Peran / Hak Akses */}
      <div className="bg-[#F5F7F8] p-4 rounded-xl border border-[#E8F0F5]">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-[#547F9F]" />
          <h4 className="text-xs font-bold text-[#385A75]">Hak Akses & Peran Sistem</h4>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {initialData.roles.map((r, i) => (
            <span
              key={i}
              className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#E8F0F5] text-[#385A75] border border-blue-200"
            >
              {r}
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#547F9F] hover:bg-[#385A75] text-white shadow-sm transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menyimpan Perubahan...</span>
            </>
          ) : (
            <span>Simpan Perubahan Profil</span>
          )}
        </button>
      </div>
    </form>
  );
}

