import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mapa Vivo — Agrosintropia',
  description: 'Plataforma de gestão de áreas verdes em condomínios e parques urbanos. Inventário arbóreo digital, mapa interativo e relatórios ambientais.',
  keywords: ['árvores', 'inventário arbóreo', 'condomínio', 'área verde', 'cerrado', 'sustentabilidade'],
  authors: [{ name: 'Agrosintropia' }],
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
    <html lang="pt-BR">
      <body className="font-sans antialiased bg-areia text-verde-cerrado min-h-screen">
        {children}
      </body>
    </html>
  );
}
