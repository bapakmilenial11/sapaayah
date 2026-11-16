import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SAPA Ayah — Sahabat Pembelajar Ayah',
  description:
    'Platform Digital Terintegrasi Yayasan Sahabat Pembelajar Ayah. Menyapa untuk Tumbuh, Tumbuh untuk Menyapa.',
  keywords: ['SAPA Ayah', 'Parenting Islami', 'Komunitas Ayah', 'Kelas Ayah', 'Pendidikan Keluarga'],
  authors: [{ name: 'Yayasan Sahabat Pembelajar Ayah' }],
  icons: {
    icon: '/logos/Logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="min-h-screen bg-[#F5F7F8] text-[#252D35] flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}

