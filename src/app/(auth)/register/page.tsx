'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { registerAction, AuthActionResult } from '@/features/auth/actions';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    registerAction,
    null
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-[#385A75]">
          Pendaftaran Akun
        </h2>
        <p className="mt-1 text-sm text-[#252D35]/70">
          Bergabung bersama Yayasan Sahabat Pembelajar Ayah
        </p>
      </div>

      {state?.message && (
        <div
          className={`rounded-lg p-3 text-xs font-medium border ${
            state.success
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {state.message}
        </div>
      )}

      {!state?.success && (
        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#385A75] mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              name="fullName"
              required
              className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2.5 text-sm text-[#252D35] focus:border-[#547F9F] focus:outline-none"
              placeholder="Contoh: Budi Santoso"
            />
            {state?.errors?.fullName && (
              <p className="mt-1 text-xs text-red-600">{state.errors.fullName[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#385A75] mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2.5 text-sm text-[#252D35] focus:border-[#547F9F] focus:outline-none"
              placeholder="nama@email.com"
            />
            {state?.errors?.email && (
              <p className="mt-1 text-xs text-red-600">{state.errors.email[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#385A75] mb-1">
              Nomor WhatsApp
            </label>
            <input
              type="tel"
              name="phone"
              required
              className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2.5 text-sm text-[#252D35] focus:border-[#547F9F] focus:outline-none"
              placeholder="081234567890"
            />
            {state?.errors?.phone && (
              <p className="mt-1 text-xs text-red-600">{state.errors.phone[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#385A75] mb-1">
              Kata Sandi (Minimal 8 Karakter)
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2.5 text-sm text-[#252D35] focus:border-[#547F9F] focus:outline-none"
              placeholder="••••••••"
            />
            {state?.errors?.password && (
              <p className="mt-1 text-xs text-red-600">{state.errors.password[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#385A75] mb-1">
              Konfirmasi Kata Sandi
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2.5 text-sm text-[#252D35] focus:border-[#547F9F] focus:outline-none"
              placeholder="••••••••"
            />
            {state?.errors?.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                {state.errors.confirmPassword[0]}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-[#547F9F] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#385A75] transition disabled:opacity-50"
          >
            {isPending ? 'Mendaftarkan...' : 'Daftar Sekarang'}
          </button>
        </form>
      )}

      <div className="text-center text-xs text-[#252D35]/70">
        Sudah memiliki akun?{' '}
        <Link
          href="/login"
          className="font-semibold text-[#547F9F] hover:text-[#385A75]"
        >
          Masuk di sini
        </Link>
      </div>
    </div>
  );
}
