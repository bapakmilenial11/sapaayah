import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#F5F7F8]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-3">
          <Image
            src="/logos/Logo.png"
            alt="Logo SAPA Ayah"
            width={48}
            height={48}
            className="h-12 w-auto object-contain"
          />
          <div className="text-left">
            <div className="text-xl font-bold tracking-tight text-[#385A75]">
              SAPA AYAH
            </div>
            <div className="text-xs text-[#547F9F]">
              Sahabat Pembelajar Ayah
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-2xl bg-white px-6 py-8 sm:px-10 shadow-lg border border-[#E8F0F5]">
          {children}
        </div>
      </div>
    </div>
  );
}

