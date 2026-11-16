import Link from 'next/link';
import Image from 'next/image';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Public Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#E8F0F5] bg-white/95 backdrop-blur">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logos/Logo.png"
              alt="Logo SAPA Ayah"
              width={42}
              height={42}
              className="h-10 w-auto object-contain"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-[#385A75]">
                SAPA AYAH
              </span>
              <span className="text-xs text-[#547F9F]">
                Sahabat Pembelajar Ayah
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#252D35]">
            <Link href="/" className="transition hover:text-[#547F9F]">
              Beranda
            </Link>
            <Link href="/tentang" className="transition hover:text-[#547F9F]">
              Tentang
            </Link>
            <Link href="/program" className="transition hover:text-[#547F9F]">
              Program
            </Link>
            <Link href="/kegiatan" className="transition hover:text-[#547F9F]">
              Agenda
            </Link>
            <Link href="/kontak" className="transition hover:text-[#547F9F]">
              Kontak
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#385A75] hover:bg-[#E8F0F5] transition"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-[#547F9F] px-4 py-2 text-sm font-medium text-white hover:bg-[#385A75] transition shadow-sm"
            >
              Daftar Akun
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Public Footer */}
      <footer className="border-t border-[#E8F0F5] bg-white py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-3">
                <Image
                  src="/logos/Logo.png"
                  alt="Logo SAPA Ayah"
                  width={36}
                  height={36}
                  className="h-9 w-auto"
                />
                <span className="text-lg font-bold text-[#385A75]">
                  Yayasan SAPA Ayah
                </span>
              </div>
              <p className="text-sm text-[#252D35]/80 max-w-md leading-relaxed">
                Sahabat Pembelajar Ayah — Ruang belajar, bertumbuh, dan saling menguatkan
                bagi para ayah dan calon ayah demi mewujudkan keluarga kokoh dan berperadaban.
              </p>
              <p className="text-xs text-[#547F9F] italic font-medium">
                “Menyapa untuk Tumbuh, Tumbuh untuk Menyapa”
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#385A75] mb-3">Tautan Cepat</h4>
              <ul className="space-y-2 text-sm text-[#252D35]/80">
                <li><Link href="/tentang" className="hover:text-[#547F9F]">Visi & Misi</Link></li>
                <li><Link href="/program" className="hover:text-[#547F9F]">Program Unggulan</Link></li>
                <li><Link href="/kegiatan" className="hover:text-[#547F9F]">Agenda Publik</Link></li>
                <li><Link href="/kontak" className="hover:text-[#547F9F]">Hubungi Kami</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#385A75] mb-3">Akses Sistem</h4>
              <ul className="space-y-2 text-sm text-[#252D35]/80">
                <li><Link href="/portal" className="hover:text-[#547F9F]">Portal Peserta</Link></li>
                <li><Link href="/dashboard" className="hover:text-[#547F9F]">Dashboard Pengurus</Link></li>
                <li><Link href="/login" className="hover:text-[#547F9F]">Masuk ke Akun</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-[#E8F0F5] text-center text-xs text-[#252D35]/60">
            © {new Date().getFullYear()} Yayasan Sahabat Pembelajar Ayah (SAPA) Ayah. Seluruh hak cipta dilindungi.
          </div>
        </div>
      </footer>
    </div>
  );
}

