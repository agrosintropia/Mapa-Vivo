import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { SUBCLASSES } from '@/lib/subclasses';
import type { TreeDetailData, TreeEventData } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { qr_slug: string };
}

/* ---------- metadata ---------- */

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { qr_slug } = params;
  let title = 'Mapa Vivo';
  let description = 'Ficha de uma árvore cadastrada no Mapa Vivo.';

  try {
    const tree = await prisma.tree.findUnique({
      where: { qr_slug },
      select: {
        species: { select: { common_name: true, scientific_name: true } },
        project: { select: { name: true } },
      },
    });
    if (tree) {
      title = `${tree.species.common_name} (${tree.species.scientific_name}) — ${tree.project.name} | Mapa Vivo`;
      description = `Conheça a ${tree.species.common_name} no projeto ${tree.project.name}. Perfil completo, histórico e localização.`;
    }
  } catch {
    // DB unavailable — use defaults
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'pt_BR',
    },
  };
}

/* ---------- data fetching ---------- */

type FetchResult =
  | { status: 'ok'; tree: TreeDetailData }
  | { status: 'not_found' }
  | { status: 'db_error' };

async function getTreeData(qr_slug: string): Promise<FetchResult> {
  try {
    const tree = await prisma.tree.findUnique({
      where: { qr_slug },
      select: {
        id: true,
        lat: true,
        lng: true,
        status: true,
        reliability: true,
        qr_slug: true,
        dbh_cm: true,
        height_m: true,
        photo_url: true,
        photo_url_2: true,
        photo_url_3: true,
        tag_installed: true,
        planted_date: true,
        created_at: true,
        species: {
          select: {
            id: true,
            common_name: true,
            scientific_name: true,
            family: true,
            strata: true,
            subclasses: true,
            ecological_function: true,
            description: true,
            fruiting_season: true,
            fauna_attracted: true,
          },
        },
        project: {
          select: {
            name: true,
            slug: true,
            city: true,
            state: true,
            biome: true,
          },
        },
        events: {
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            type: true,
            description: true,
            photo_url: true,
            author_role: true,
            created_at: true,
          },
        },
      },
    });

    if (!tree) return { status: 'not_found' };

    const serialized: TreeDetailData = {
      ...tree,
      photo_url_2: tree.photo_url_2 ?? null,
      photo_url_3: tree.photo_url_3 ?? null,
      tag_installed: tree.tag_installed,
      planted_date: tree.planted_date?.toISOString() ?? null,
      created_at: tree.created_at.toISOString(),
      events: tree.events.map((e) => ({
        ...e,
        created_at: e.created_at.toISOString(),
      })),
    };

    return { status: 'ok', tree: serialized };
  } catch (error) {
    console.error('Erro ao buscar árvore:', error);
    return { status: 'db_error' };
  }
}

/* ---------- constants ---------- */

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  viva: { label: 'Viva', color: 'text-green-800', bg: 'bg-green-100' },
  doente: { label: 'Doente', color: 'text-amber-800', bg: 'bg-amber-100' },
  em_tratamento: { label: 'Em tratamento', color: 'text-blue-800', bg: 'bg-blue-100' },
  morta: { label: 'Morta', color: 'text-gray-700', bg: 'bg-gray-200' },
  removida: { label: 'Removida', color: 'text-red-800', bg: 'bg-red-100' },
};

const STRATA_CONFIG: Record<string, { label: string; icon: string }> = {
  emergente: { label: 'Emergente', icon: '🌲' },
  alto: { label: 'Alto', icon: '🌳' },
  medio: { label: 'Médio', icon: '🌴' },
  baixo: { label: 'Baixo', icon: '🌿' },
  arbustivo: { label: 'Arbustivo', icon: '🪴' },
};

const RELIABILITY_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  validado_tecnico: { label: 'Validado por técnico', color: 'text-green-800', bg: 'bg-green-50 border-green-200', icon: '✓' },
  pendente: { label: 'Pendente de validação', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: '◷' },
  declarado_gestor: { label: 'Declarado pelo gestor', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: 'ⓘ' },
};

const EVENT_CONFIG: Record<string, { label: string; color: string; iconBg: string }> = {
  plantio: { label: 'Plantio', color: 'border-green-400', iconBg: 'bg-green-500' },
  atualizacao_estado: { label: 'Atualização de estado', color: 'border-amber-400', iconBg: 'bg-amber-500' },
  poda: { label: 'Poda', color: 'border-blue-400', iconBg: 'bg-blue-500' },
  validacao: { label: 'Validação', color: 'border-emerald-400', iconBg: 'bg-emerald-500' },
  observacao: { label: 'Observação', color: 'border-gray-400', iconBg: 'bg-gray-500' },
};

const AUTHOR_LABELS: Record<string, string> = {
  gestor: 'Gestor',
  tecnico: 'Técnico',
};

const BADGE_COLORS = [
  'bg-verde-medio/15 text-verde-cerrado',
  'bg-terracota/15 text-terracota',
  'bg-ocre/15 text-amber-800',
  'bg-emerald-100 text-emerald-800',
  'bg-sky-100 text-sky-800',
  'bg-purple-100 text-purple-800',
  'bg-pink-100 text-pink-800',
  'bg-indigo-100 text-indigo-800',
  'bg-teal-100 text-teal-800',
  'bg-rose-100 text-rose-800',
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/* ---------- sub-components ---------- */

function TreePlaceholder() {
  return (
    <div className="w-full aspect-[4/3] bg-gradient-to-br from-verde-cerrado/20 via-verde-medio/10 to-areia flex items-center justify-center relative overflow-hidden">
      {/* Decorative SVG tree silhouette */}
      <svg viewBox="0 0 200 260" className="w-32 h-40 opacity-30 text-verde-cerrado" fill="currentColor">
        <ellipse cx="100" cy="80" rx="70" ry="75" />
        <ellipse cx="60" cy="110" rx="50" ry="55" />
        <ellipse cx="140" cy="110" rx="50" ry="55" />
        <ellipse cx="100" cy="130" rx="60" ry="50" />
        <rect x="90" y="165" width="20" height="80" rx="4" />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/80 to-transparent" />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'text-gray-700', bg: 'bg-gray-100' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${cfg.bg} ${cfg.color}`}>
      <span className="w-2 h-2 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}

function StrataBadge({ strata }: { strata: string }) {
  const cfg = STRATA_CONFIG[strata] ?? { label: strata, icon: '🌱' };
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-verde-cerrado/10 text-verde-cerrado">
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

function ReliabilityBadge({ reliability }: { reliability: string }) {
  const cfg = RELIABILITY_CONFIG[reliability] ?? { label: reliability, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', icon: '?' };
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${cfg.bg} ${cfg.color}`}>
      <span className="text-base font-bold">{cfg.icon}</span>
      <span className="font-medium">{cfg.label}</span>
    </div>
  );
}

function SubclassBadges({ subclasses }: { subclasses: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {subclasses.map((key, i) => {
        const label = SUBCLASSES.find((sc) => sc.key === key)?.label ?? key;
        const colorClass = BADGE_COLORS[i % BADGE_COLORS.length];
        return (
          <span key={key} className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
            {label}
          </span>
        );
      })}
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-areia last:border-0">
      {icon && <span className="text-lg mt-0.5 flex-shrink-0">{icon}</span>}
      <div className="min-w-0">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">{value}</p>
      </div>
    </div>
  );
}

function TimelineEvent({ event }: { event: TreeEventData }) {
  const cfg = EVENT_CONFIG[event.type] ?? { label: event.type, color: 'border-gray-400', iconBg: 'bg-gray-500' };
  return (
    <div className="relative flex gap-4 pb-8 last:pb-0">
      {/* Vertical line */}
      <div className="flex flex-col items-center">
        <div className={`w-3.5 h-3.5 rounded-full ${cfg.iconBg} ring-4 ring-white flex-shrink-0 z-10`} />
        <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
      </div>
      {/* Content */}
      <div className={`flex-1 bg-white rounded-lg border-l-4 ${cfg.color} p-4 shadow-sm -mt-1`}>
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-sm font-semibold text-verde-cerrado">{cfg.label}</span>
          <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(event.created_at)}</span>
        </div>
        {event.description && (
          <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-2">
          Por: {AUTHOR_LABELS[event.author_role] ?? event.author_role}
        </p>
      </div>
    </div>
  );
}

/* ---------- main page ---------- */

export default async function TreeProfilePage({ params }: PageProps) {
  const { qr_slug } = params;
  const result = await getTreeData(qr_slug);

  if (result.status === 'not_found') notFound();

  if (result.status === 'db_error') {
    return (
      <main className="min-h-screen bg-areia flex flex-col">
        <header className="bg-verde-cerrado text-white px-4 py-4 flex items-center gap-3">
          <a href="/" className="text-2xl">🌳</a>
          <h1 className="font-display text-xl font-bold">Mapa Vivo</h1>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="card max-w-md text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-verde-cerrado mb-2">
              Conexão indisponível
            </h2>
            <p className="text-gray-600">
              Não foi possível conectar ao banco de dados. Tente novamente em alguns instantes.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const { tree } = result;
  const { species, project, events } = tree;

  return (
    <main className="min-h-screen bg-areia">
      {/* ───── Hero photos ───── */}
      <div className="relative">
        {(() => {
          const photos = [tree.photo_url, tree.photo_url_2, tree.photo_url_3].filter(Boolean) as string[];
          if (photos.length > 0) {
            return (
              <div className={photos.length === 1 ? '' : 'flex overflow-x-auto snap-x snap-mandatory'}>
                {photos.map((url, i) => (
                  <div key={i} className={`w-full flex-shrink-0 snap-center aspect-[4/3] relative overflow-hidden`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`${species.common_name} - foto ${i + 1}`} className="w-full h-full object-cover" />
                    {i === photos.length - 1 && <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/90 to-transparent" />}
                  </div>
                ))}
              </div>
            );
          }
          return <TreePlaceholder />;
        })()}

        {/* Back / project nav */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <a
            href={`/${project.slug}/mapa`}
            className="bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm font-medium text-verde-cerrado shadow-md hover:bg-white transition-colors"
          >
            ← Voltar ao mapa
          </a>
          <div className="bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs text-gray-500 shadow-md">
            {project.name}
          </div>
        </div>
      </div>

      {/* ───── Main content ───── */}
      <div className="max-w-lg mx-auto px-4 -mt-4 relative z-10 pb-12">

        {/* ── Name card ── */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
          <h1 className="font-display text-3xl font-bold text-verde-cerrado leading-tight">
            {species.common_name}
          </h1>
          <p className="text-lg italic text-gray-500 mt-1">{species.scientific_name}</p>
          <p className="text-sm text-gray-400 mt-0.5">{species.family}</p>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <StatusBadge status={tree.status} />
            <StrataBadge strata={species.strata} />
          </div>

          {species.subclasses.length > 0 && (
            <div className="mt-4">
              <SubclassBadges subclasses={species.subclasses} />
            </div>
          )}
        </div>

        {/* ── Reliability seal ── */}
        <div className="mb-4 space-y-2">
          <ReliabilityBadge reliability={tree.reliability} />
          {tree.tag_installed && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-800 text-sm">
              <span className="text-base">🏷️</span>
              <span className="font-medium">Identificação física instalada</span>
            </div>
          )}
        </div>

        {/* ── Ecology info ── */}
        {(species.ecological_function || species.fruiting_season || species.fauna_attracted || species.description) && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
            <h2 className="font-display text-lg font-bold text-verde-cerrado mb-3">
              Sobre esta espécie
            </h2>
            {species.description && (
              <InfoRow label="Descrição" value={species.description} icon="📖" />
            )}
            {species.ecological_function && (
              <InfoRow label="Função ecológica" value={species.ecological_function} icon="🌎" />
            )}
            {species.fruiting_season && (
              <InfoRow label="Época de frutificação" value={species.fruiting_season} icon="🍎" />
            )}
            {species.fauna_attracted && (
              <InfoRow label="Fauna atraída" value={species.fauna_attracted} icon="🦜" />
            )}
          </div>
        )}

        {/* ── Measurements ── */}
        {(tree.dbh_cm != null || tree.height_m != null || tree.planted_date != null) && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
            <h2 className="font-display text-lg font-bold text-verde-cerrado mb-3">
              Medições
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {tree.dbh_cm != null && (
                <div className="bg-areia rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-verde-cerrado">{tree.dbh_cm}</p>
                  <p className="text-xs text-gray-500 mt-1">DAP (cm)</p>
                </div>
              )}
              {tree.height_m != null && (
                <div className="bg-areia rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-verde-cerrado">{tree.height_m}</p>
                  <p className="text-xs text-gray-500 mt-1">Altura (m)</p>
                </div>
              )}
              {tree.planted_date && (
                <div className="bg-areia rounded-xl p-4 text-center col-span-2">
                  <p className="text-lg font-bold text-verde-cerrado">{formatDate(tree.planted_date)}</p>
                  <p className="text-xs text-gray-500 mt-1">Data de plantio</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Event timeline ── */}
        {events.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
            <h2 className="font-display text-lg font-bold text-verde-cerrado mb-5">
              Histórico
            </h2>
            <div>
              {events.map((event) => (
                <TimelineEvent key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* ── CTA: ver no mapa ── */}
        <a
          href={`/${project.slug}/mapa`}
          className="btn-secondary w-full block text-center rounded-2xl text-lg"
        >
          Ver no mapa
        </a>

        {/* ── Tree ID ── */}
        <div className="text-center mt-6 mb-4">
          <p className="text-xs text-gray-400">
            Identificador: <span className="font-mono font-medium">{tree.qr_slug}</span>
          </p>
          <p className="text-xs text-gray-400">
            {project.name} &middot; {project.city}, {project.state}
          </p>
        </div>

        {/* ── Mapa Vivo footer ── */}
        <div className="bg-verde-cerrado rounded-2xl p-6 text-white text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">🌳</span>
            <span className="font-display text-xl font-bold">Mapa Vivo</span>
          </div>
          <p className="text-sm opacity-80 leading-relaxed">
            Inventário arbóreo digital para condomínios, parques e agroflorestas.
            Cada árvore ganha identidade — mapa interativo, QR code e relatórios ambientais.
          </p>
          <div className="flex flex-col items-center gap-2 pt-2">
            <a
              href="/"
              className="bg-white/20 hover:bg-white/30 transition-colors px-5 py-2 rounded-lg text-sm font-semibold"
            >
              Conheça a plataforma
            </a>
          </div>
          <div className="border-t border-white/20 pt-3 mt-3 space-y-1">
            <p className="text-xs font-semibold opacity-90">Agrosintropia</p>
            <p className="text-xs opacity-70">Consultoria em meio ambiente e agroflorestas</p>
            <div className="flex items-center justify-center gap-3 text-xs opacity-70">
              <a href="mailto:agrosintropia@gmail.com" className="hover:opacity-100 hover:underline">
                agrosintropia@gmail.com
              </a>
            </div>
            <p className="text-xs opacity-50 pt-1">
              Goiânia, GO &middot; Brasil
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
