'use client';

import { Suspense, useActionState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  resetPasswordAction,
  updatePasswordAction,
  AuthActionResult,
} from '@/features/auth/actions';

function LupaPasswordContent() {
  const searchParams = useSearchParams();
  const isUpdateMode = searchParams.get('mode') === 'update';

  const [resetState, resetFormAction, isResetPending] = useActionState<
    AuthActionResult | null,
    FormData
  >(resetPasswordAction, null);

  const [updateState, updateFormAction, isUpdatePending] = useActionState<
    AuthActionResult | null,
    FormData
  >(updatePasswordAction, null);

  const state = isUpdateMode ? updateState : resetState;
  const isPending = isUpdateMode ? isUpdatePending : isResetPending;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-[#385A75]">
          {isUpdateMode ? 'Perbarui Kata Sandi' : 'Lupa Kata Sandi'}
        </h2>
        <p className="mt-1 text-sm text-[#252D35]/70">
          {isUpdateMode
            ? 'Masukkan kata sandi baru untuk akun Anda'
            : 'Masukkan email akun Anda untuk menerima tautan pemulihan'}
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

      {/* Mode Update Password */}
      {isUpdateMode ? (
        !state?.success && (
          <form action={updateFormAction} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#385A75] mb-1">
                Kata Sandi Baru (Minimal 8 Karakter)
              </label>
              <input
                type="password"
                name="password"
                required
                className="w-full rounded-lg border border-[#E8F0F5] bg-[#F5F7F8] px-3.5 py-2.5 text-sm text-[#252D35] focus:border-[#547F9F] focus:outline-none"
                placeholder="••••••••"
              />
              {state?.errors?.password && (
                <p className="mt-1 text-xs text-red-600">
                  {state.errors.password[0]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#385A75] mb-1">
                Konfirmasi Kata Sandi Baru
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
              {isPending ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
            </button>
          </form>
        )
      ) : (
        /* Mode Permintaan Reset Password */
        !state?.success && (
          <form action={resetFormAction} className="space-y-4">
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

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-[#547F9F] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#385A75] transition disabled:opacity-50"
            >
              {isPending ? 'Mengirim...' : 'Kirim Tautan Pemulihan'}
            </button>
          </form>
        )
      )}

      <div className="text-center text-xs text-[#252D35]/70">
        <Link
          href="/login"
          className="font-semibold text-[#547F9F] hover:text-[#385A75]"
        >
          Kembali ke halaman masuk
        </Link>
      </div>
    </div>
  );
}

export default function LupaPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center text-xs text-[#252D35]/50 py-8">
          Memuat form pemulihan...
        </div>
      }
    >
      <LupaPasswordContent />
    </Suspense>
  );
}
