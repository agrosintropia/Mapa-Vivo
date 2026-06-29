import { Metadata } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { LogoIconDark } from '@/components/Logo';

const DemoMap = dynamic(() => import('@/components/DemoMap'), { ssr: false });

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

const FEATURES = [
  { icon: '🗺️', title: 'Mapa interativo', desc: 'Visualize cada árvore no mapa com filtros por espécie, estrato e subclasse.' },
  { icon: '📱', title: 'QR Code individual', desc: 'Cada árvore recebe um QR code com ficha completa acessível pelo celular.' },
  { icon: '📊', title: 'Dashboard ambiental', desc: 'Carbono estocado, distribuição de espécies e relatórios para assembleias.' },
  { icon: '🔍', title: 'Validação técnica', desc: 'Selo de confiabilidade com revisão de técnicos e fila de aprovação.' },
  { icon: '🌿', title: 'Biodiversidade', desc: 'Cataloga espécies nativas, ameaçadas, frutíferas, medicinais e melíferas.' },
  { icon: '📋', title: 'Gestão completa', desc: 'Painel do gestor com histórico de eventos, podas e ocorrências.' },
];

const DEMO_STATS = [
  { label: 'Árvores catalogadas', value: '125+' },
  { label: 'Espécies identificadas', value: '20' },
  { label: 'Carbono estimado', value: '18 ton' },
  { label: 'Área mapeada', value: '2,5 ha' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-areia flex flex-col">
      <nav className="absolute top-0 right-0 p-4 z-50">
        <Link href="/login" className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
          Entrar
        </Link>
      </nav>

      {/* Hero */}
      <section className="bg-verde-cerrado text-white relative">
        <div className="max-w-5xl mx-auto px-4 py-16 md:py-24 text-center">
          <div className="w-20 h-20 mx-auto mb-6">
            <LogoIconDark />
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Mapa Vivo
          </h1>
          <p className="text-sm md:text-base text-verde-medio font-medium tracking-widest uppercase mb-2">
            Inteligência Urbana Verde
          </p>
          <p className="text-lg md:text-xl text-ocre font-medium">
            por Agrosintropia
          </p>
          <p className="text-base md:text-lg opacity-80 max-w-2xl mx-auto mt-6 leading-relaxed">
            Inventário arbóreo digital para condomínios, parques e incorporadoras.
            Cada árvore ganha identidade — mapa interativo, QR code e relatórios
            ambientais em tempo real.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            <a href="#mapa-demo" className="btn-primary text-base">
              Ver projeto demo
            </a>
            <a href="#dashboard-demo" className="bg-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors text-base">
              Dashboard ambiental
            </a>
          </div>
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

      {/* Demo Map */}
      <section id="mapa-demo" className="bg-white border-y border-areia scroll-mt-4">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-verde-cerrado text-center mb-4">
            Projeto Demo — Residencial Mata Viva
          </h2>
          <p className="text-gray-500 text-center mb-8 max-w-xl mx-auto">
            Explore o mapa interativo e clique nas árvores para ver a ficha de cada espécie.
          </p>
          <DemoMap />
        </div>
      </section>

      {/* Demo Dashboard */}
      <section id="dashboard-demo" className="max-w-5xl mx-auto px-4 py-16 scroll-mt-4">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-verde-cerrado text-center mb-10">
          Dashboard Ambiental
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {DEMO_STATS.map(s => (
            <div key={s.label} className="card text-center">
              <p className="text-3xl md:text-4xl font-bold text-verde-cerrado">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="font-bold text-verde-cerrado mb-3">Distribuição por estrato</h3>
            <div className="space-y-2 text-sm">
              {[['Emergente', 15], ['Alto', 40], ['Médio', 30], ['Baixo/Arbustivo', 15]].map(([label, pct]) => (
                <div key={label as string}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className="text-gray-600">{label}</span>
                    <span className="text-gray-400">{pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-verde-medio rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="font-bold text-verde-cerrado mb-3">Subclasses</h3>
            <div className="flex flex-wrap gap-2">
              {['Nativa', 'Frutífera', 'Medicinal', 'Melífera', 'Ornamental', 'Ameaçada'].map(s => (
                <span key={s} className="text-xs bg-verde-medio/10 text-verde-medio px-2 py-1 rounded-full">{s}</span>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">85% das espécies são nativas do Cerrado</p>
          </div>
          <div className="card">
            <h3 className="font-bold text-verde-cerrado mb-3">Carbono sequestrado</h3>
            <p className="text-4xl font-bold text-verde-cerrado">18 <span className="text-lg font-normal">ton CO₂</span></p>
            <p className="text-xs text-gray-400 mt-2">Estimativa baseada em DAP e altura das árvores catalogadas</p>
          </div>
        </div>
      </section>

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
          <a href="mailto:agrosintropia@gmail.com" className="btn-primary inline-block text-base">
            Falar com a Agrosintropia
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-verde-cerrado text-white py-8 px-4 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6"><LogoIconDark /></div>
            <span className="font-display font-bold">Mapa Vivo</span>
            <span className="text-[9px] opacity-50 ml-1 tracking-widest uppercase">Inteligência Urbana Verde</span>
          </div>
          <nav className="flex gap-6 text-sm opacity-80">
            <a href="#mapa-demo" className="hover:underline">Mapa Demo</a>
            <a href="#dashboard-demo" className="hover:underline">Dashboard</a>
            <Link href="/login" className="hover:underline">Entrar</Link>
          </nav>
          <p className="text-xs opacity-50">
            © {new Date().getFullYear()} Agrosintropia · Goiânia, GO
          </p>
        </div>
      </footer>
    </main>
  );
}
