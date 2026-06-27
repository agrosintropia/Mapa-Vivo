import type { Metadata } from 'next';
import { Source_Sans_3, Fraunces } from 'next/font/google';
import './globals.css';

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Mapa Vivo — Agrosintropia',
  description:
    'Plataforma de gestão de áreas verdes em condomínios e parques urbanos. Inventário arbóreo digital, mapa interativo e relatórios ambientais.',
  keywords: [
    'árvores', 'inventário arbóreo', 'condomínio', 'área verde',
    'cerrado', 'sustentabilidade', 'carbono', 'Agrosintropia',
  ],
  authors: [{ name: 'Agrosintropia' }],
  manifest: '/manifest.json',
  themeColor: '#2D5016',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Mapa Vivo',
  },
  openGraph: {
    title: 'Mapa Vivo — Agrosintropia',
    description: 'Gestão de áreas verdes em condomínios e parques urbanos',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${sourceSans.variable} ${fraunces.variable}`}>
      <body className="font-sans antialiased bg-areia text-verde-cerrado min-h-screen">
        {children}
      </body>
    </html>
  );
}
