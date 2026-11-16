'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X, User } from 'lucide-react';
import { DashboardMenuItem } from '@/lib/navigation/menu';
import { logoutAction } from '@/features/auth/actions';

interface DashboardNavProps {
  menuItems: DashboardMenuItem[];
  userFullName: string;
  userRoleName: string;
}

export function DashboardNav({
  menuItems,
  userFullName,
  userRoleName,
}: DashboardNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Topbar */}
      <div className="flex h-16 items-center justify-between border-b border-[#E8F0F5] bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <Image
            src="/logos/Logo.png"
            alt="Logo SAPA Ayah"
            width={28}
            height={28}
            className="h-7 w-auto object-contain"
          />
          <span className="text-sm font-bold text-[#385A75]">SAPA AYAH</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-[#252D35]/70 hover:bg-[#E8F0F5]"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-[#E8F0F5] bg-white">
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
              Management Portal
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 text-xs font-medium">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition ${
                  isActive
                    ? 'bg-[#547F9F] text-white font-semibold'
                    : 'text-[#252D35]/80 hover:bg-[#E8F0F5] hover:text-[#385A75]'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-[#547F9F]'}`} />
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
              <span>Keluar Sesi</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex w-64 flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-[#E8F0F5] px-6">
              <span className="text-sm font-bold text-[#385A75]">Menu Manajemen</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1 text-[#252D35]/60 hover:bg-[#E8F0F5]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 text-xs font-medium">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition ${
                      isActive
                        ? 'bg-[#547F9F] text-white font-semibold'
                        : 'text-[#252D35]/80 hover:bg-[#E8F0F5] hover:text-[#385A75]'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-[#547F9F]'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-[#E8F0F5] p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E8F0F5] text-[#547F9F]">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-[#385A75]">{userFullName}</div>
                  <div className="text-[10px] text-[#252D35]/60">{userRoleName}</div>
                </div>
              </div>

              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Keluar Sesi</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

