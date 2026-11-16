import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { getAuthorizedMenuItems } from '@/lib/navigation/menu';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { Bell, User } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch (e) {
    console.error('Failed to get user in DashboardLayout:', e);
  }

  if (!user) {
    redirect('/login');
  }

  const internalRoles = [
    'super_admin',
    'ketua',
    'pengurus',
    'admin_peserta',
    'bendahara',
    'kreator_konten',
    'fasilitator',
    'relawan',
  ];

  const userRoles = Array.isArray(user.roles) ? user.roles : [];
  const userPermissions = Array.isArray(user.permissions) ? user.permissions : [];
  const hasInternalAccess = userRoles.some((r) => internalRoles.includes(r));

  if (!hasInternalAccess) {
    redirect('/portal');
  }

  const menuItems = getAuthorizedMenuItems(userRoles, userPermissions);
  const primaryRole = userRoles[0]?.replace('_', ' ') || 'Staff';
  const fullName = user.fullName || 'Pengurus SAPA Ayah';

  return (
    <div className="flex min-h-screen bg-[#F5F7F8]">
      {/* Navigasi Responsif (Desktop Sidebar + Mobile Drawer) */}
      <DashboardNav
        menuItems={menuItems}
        userFullName={fullName}
        userRoleName={primaryRole}
      />

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="hidden lg:flex h-16 items-center justify-between border-b border-[#E8F0F5] bg-white px-6">
          <div className="text-xs font-semibold text-[#547F9F] uppercase tracking-wider">
            Yayasan Sahabat Pembelajar Ayah
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="rounded-lg p-2 text-[#252D35]/60 hover:bg-[#E8F0F5] hover:text-[#385A75] transition"
            >
              <Bell className="h-4 w-4" />
            </button>
            <div className="h-4 w-px bg-[#E8F0F5]" />
            <div className="flex items-center gap-2 text-xs font-medium text-[#385A75]">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E8F0F5] text-[#547F9F]">
                <User className="h-4 w-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-semibold">{fullName}</span>
                <span className="text-[10px] text-[#252D35]/60 capitalize">
                  {primaryRole}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
