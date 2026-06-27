import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mapa Vivo — Gestão de Áreas Verdes | Agrosintropia',
  description:
    'Plataforma SaaS de inventário arbóreo digital para condomínios, parques e incorporadoras. Mapa interativo, QR codes, relatórios de carbono e dashboard ambiental.',
  keywords: [
    'inventário arbóreo',
    'gestão de áreas verdes',
    'árvores condomínio',
    'mapa interativo árvores',
    'carbono sequestrado',
    'cerrado',
    'sustentabilidade',
    'Agrosintropia',
  ],
  openGraph: {
    title: 'Mapa Vivo — Gestão de Áreas Verdes',
    description:
      'Inventário arbóreo digital. Mapa interativo, QR codes, relatórios de carbono.',
    type: 'website',
    locale: 'pt_BR',
  },
};

interface ProjectCard {
  name: string;
  slug: string;
  city: string;
  state: string;
  biome: string;
  treeCount: number;
}

async function getProjects(): Promise<ProjectCard[]> {
  try {
    const projects = await prisma.project.findMany({
      select: {
        name: true,
        slug: true,
        city: true,
        state: true,
        biome: true,
        _count: { select: { trees: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    return projects.map(p => ({
      name: p.name,
      slug: p.slug,
      city: p.city,
      state: p.state,
      biome: p.biome,
      treeCount: p._count.trees,
    }));
  } catch {
    return [];
  }
}

const FEATURES = [
  {
    icon: '🗺️',
    title: 'Mapa interativo',
    desc: 'Visualize cada árvore no mapa com filtros por espécie, estrato e subclasse.',
  },
  {
    icon: '📱',
    title: 'QR Code individual',
    desc: 'Cada árvore recebe um QR code com ficha completa acessível pelo celular.',
  },
  {
    icon: '📊',
    title: 'Dashboard ambiental',
    desc: 'Carbono estocado, distribuição de espécies e relatórios para assembleias.',
  },
  {
    icon: '🔍',
    title: 'Validação técnica',
    desc: 'Selo de confiabilidade com revisão de técnicos e fila de aprovação.',
  },
  {
    icon: '🌿',
    title: 'Biodiversidade',
    desc: 'Cataloga espécies nativas, ameaçadas, frutíferas, medicinais e melíferas.',
  },
  {
    icon: '📋',
    title: 'Gestão completa',
    desc: 'Painel do gestor com histórico de eventos, podas e ocorrências.',
  },
];

export default async function Home() {
  const projects = await getProjects();

  return (
    <main className="min-h-screen bg-areia flex flex-col">
      {/* Hero */}
      <section className="bg-verde-cerrado text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 md:py-24 text-center">
          <span className="text-6xl block mb-6">🌳</span>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Mapa Vivo
          </h1>
          <p className="text-lg md:text-xl text-ocre font-medium mb-2">
            por Agrosintropia
          </p>
          <p className="text-base md:text-lg opacity-80 max-w-2xl mx-auto mt-6 leading-relaxed">
            Inventário arbóreo digital para condomínios, parques e incorporadoras.
            Cada árvore ganha identidade — mapa interativo, QR code e relatórios
            ambientais em tempo real.
          </p>
          {projects.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-3 justify-center">
              <Link
                href={`/${projects[0].slug}/mapa`}
                className="btn-primary text-base"
              >
                Ver projeto demo
              </Link>
              <Link
                href={`/${projects[0].slug}/dashboard`}
                className="bg-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors text-base"
              >
                Dashboard ambiental
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16 md:py-20">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-verde-cerrado text-center mb-12">
          Tudo que sua área verde precisa
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(f => (
            <div key={f.title} className="card hover:shadow-md transition-shadow">
              <span className="text-3xl block mb-3">{f.icon}</span>
              <h3 className="font-display text-lg font-bold text-verde-cerrado mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      {projects.length > 0 && (
        <section className="bg-white border-y border-areia">
          <div className="max-w-5xl mx-auto px-4 py-16">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-verde-cerrado text-center mb-10">
              Projetos ativos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(p => (
                <Link
                  key={p.slug}
                  href={`/${p.slug}/mapa`}
                  className="card hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-display text-lg font-bold text-verde-cerrado group-hover:text-verde-medio transition-colors">
                      {p.name}
                    </h3>
                    <span className="text-xs bg-verde-medio/10 text-verde-medio px-2 py-0.5 rounded-full font-medium">
                      {p.treeCount} árvores
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {p.city}, {p.state}
                  </p>
                  <p className="text-xs text-ocre mt-1 capitalize">{p.biome}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="card max-w-2xl mx-auto border-l-4 border-l-verde-medio">
          <h2 className="font-display text-xl md:text-2xl font-bold text-verde-cerrado mb-3">
            Quer mapear as árvores do seu condomínio?
          </h2>
          <p className="text-gray-600 mb-6">
            Entre em contato para um inventário arbóreo profissional com
            tecnologia de ponta e relatórios ambientais completos.
          </p>
          <a
            href="mailto:agrosintropia@gmail.com"
            className="btn-primary inline-block text-base"
          >
            Falar com a Agrosintropia
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-verde-cerrado text-white py-8 px-4 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌳</span>
            <span className="font-display font-bold">Mapa Vivo</span>
            <span className="text-xs opacity-60 ml-1">por Agrosintropia</span>
          </div>
          <nav className="flex gap-6 text-sm opacity-80">
            {projects.length > 0 && (
              <>
                <Link href={`/${projects[0].slug}/mapa`} className="hover:underline">
                  Mapa
                </Link>
                <Link href={`/${projects[0].slug}/dashboard`} className="hover:underline">
                  Dashboard
                </Link>
              </>
            )}
            <Link href="/login" className="hover:underline">
              Entrar
            </Link>
          </nav>
          <p className="text-xs opacity-50">
            © {new Date().getFullYear()} Agrosintropia · Goiânia, GO
          </p>
        </div>
      </footer>
    </main>
  );
}
