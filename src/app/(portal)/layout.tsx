import Link from 'next/link';
import Image from 'next/image';
import {
  Home,
  BookOpen,
  CreditCard,
  Calendar,
  FileCheck,
  Award,
  User,
  LogOut,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/session';
import { logoutAction } from '@/features/auth/actions';

const portalNav = [
  { label: 'Ringkasan', href: '/portal', icon: Home },
  { label: 'Program Saya', href: '/portal/program-saya', icon: BookOpen },
  { label: 'Status Pembayaran', href: '/portal/pembayaran', icon: CreditCard },
  { label: 'Jadwal Sesi', href: '/portal/jadwal', icon: Calendar },
  { label: 'Materi Belajar', href: '/portal/materi', icon: FileCheck },
  { label: 'Sertifikat', href: '/portal/sertifikat', icon: Award },
  { label: 'Profil Saya', href: '/portal/profil', icon: User },
];

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen bg-[#F5F7F8]">
      {/* Sidebar Nav */}
      <aside className="hidden md:flex w-64 flex-col border-r border-[#E8F0F5] bg-white">
        <div className="flex h-16 items-center gap-3 border-b border-[#E8F0F5] px-6">
          <Image
            src="/logos/Logo.png"
            alt="Logo SAPA Ayah"
            width={34}
            height={34}
            className="h-8 w-auto object-contain"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[#385A75] leading-none">
              SAPA AYAH
            </span>
            <span className="text-[10px] text-[#547F9F] font-medium tracking-wide">
              Portal Peserta
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4 text-xs font-medium">
          {portalNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#252D35]/80 hover:bg-[#E8F0F5] hover:text-[#385A75] transition"
              >
                <Icon className="h-4 w-4 text-[#547F9F]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#E8F0F5] p-4">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main App Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-[#E8F0F5] bg-white px-6">
          <div className="text-xs font-semibold text-[#547F9F]">
            Ruang Belajar & Komunitas Peserta
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-[#385A75]">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E8F0F5] text-[#547F9F]">
              <User className="h-4 w-4" />
            </div>
            <span>{user?.fullName || 'Akun Peserta'}</span>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
