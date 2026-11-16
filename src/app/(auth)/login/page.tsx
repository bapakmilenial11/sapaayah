'use client';

import { Suspense, useActionState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { loginAction, AuthActionResult } from '@/features/auth/actions';

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/portal';

  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    loginAction,
    null
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-[#385A75]">
          Masuk ke Akun
        </h2>
        <p className="mt-1 text-sm text-[#252D35]/70">
          Akses Portal Peserta atau Dashboard Manajemen
        </p>
      </div>

      {state?.message && !state.success && (
        <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />

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
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-[#385A75]">
              Kata Sandi
            </label>
            <Link
              href="/lupa-password"
              className="text-xs font-medium text-[#547F9F] hover:text-[#385A75]"
            >
              Lupa kata sandi?
            </Link>
          </div>
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

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-[#547F9F] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#385A75] transition disabled:opacity-50"
        >
          {isPending ? 'Memproses...' : 'Masuk Sekarang'}
        </button>
      </form>

      <div className="text-center text-xs text-[#252D35]/70">
        Belum memiliki akun?{' '}
        <Link
          href="/register"
          className="font-semibold text-[#547F9F] hover:text-[#385A75]"
        >
          Daftar di sini
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center text-xs text-[#252D35]/50 py-8">Memuat form...</div>}>
      <LoginForm />
    </Suspense>
  );
}
