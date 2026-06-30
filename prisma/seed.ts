import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { v4 as uuidv4 } from 'uuid';
import { speciesData } from '../lib/speciesData';

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

// ─── Helpers ────────────────────────────────────────────────────────────────

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickWeighted<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * totalWeight;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// ─── Project boundary ───────────────────────────────────────────────────────
// Roughly 400m x 300m rectangle around lat -16.686, lng -49.264
// 0.003 degrees lat ≈ 333m; 0.004 degrees lng ≈ 375m at this latitude

const CENTER_LAT = -16.686;
const CENTER_LNG = -49.264;
const LAT_SPREAD = 0.0015; // half-spread ~167m each side
const LNG_SPREAD = 0.002;  // half-spread ~187m each side

const boundaryPolygon = {
  type: 'Polygon',
  coordinates: [
    [
      [CENTER_LNG - LNG_SPREAD, CENTER_LAT - LAT_SPREAD],
      [CENTER_LNG + LNG_SPREAD, CENTER_LAT - LAT_SPREAD],
      [CENTER_LNG + LNG_SPREAD, CENTER_LAT + LAT_SPREAD],
      [CENTER_LNG - LNG_SPREAD, CENTER_LAT + LAT_SPREAD],
      [CENTER_LNG - LNG_SPREAD, CENTER_LAT - LAT_SPREAD],
    ],
  ],
};

// ─── Species data (imported from speciesData.ts — 250 species) ─────────────

// ─── Tree generation config ─────────────────────────────────────────────────

const speciesWeights = speciesData.map(s => {
  const isNativeCerrado = s.biome.includes('Cerrado') && s.subclasses.includes('nativa');
  return isNativeCerrado ? 5 : 2;
});

// DBH and height ranges per strata
const strataRanges: Record<string, { dbhMin: number; dbhMax: number; heightMin: number; heightMax: number }> = {
  emergente: { dbhMin: 40, dbhMax: 80, heightMin: 12, heightMax: 25 },
  alto: { dbhMin: 30, dbhMax: 80, heightMin: 8, heightMax: 20 },
  medio: { dbhMin: 15, dbhMax: 40, heightMin: 4, heightMax: 12 },
  baixo: { dbhMin: 10, dbhMax: 25, heightMin: 3, heightMax: 8 },
  arbustivo: { dbhMin: 8, dbhMax: 20, heightMin: 2, heightMax: 6 },
};

// Status distribution: viva(75%), doente(10%), em_tratamento(5%), morta(5%), removida(5%)
const statusOptions = ['viva', 'viva', 'viva', 'viva', 'viva', 'viva', 'viva', 'viva', 'doente', 'doente', 'em_tratamento', 'morta', 'removida'];

const reliabilityOptions = [
  'validado_tecnico', 'validado_tecnico', 'validado_tecnico', 'validado_tecnico', 'validado_tecnico', 'validado_tecnico',
  'pendente', 'pendente', 'pendente',
  'declarado_gestor',
];

// ─── Main seed function ──────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  await prisma.$transaction(async (tx) => {
    await tx.submission.deleteMany();
    await tx.treeEvent.deleteMany();
    await tx.tree.deleteMany();
    await tx.species.deleteMany();
    await tx.project.deleteMany();
    await tx.profile.deleteMany();
    await tx.session.deleteMany();
    await tx.account.deleteMany();
    await tx.user.deleteMany();
  });

  console.log('🗑️  Dados anteriores removidos');

  // ── 1. Create Project ────────────────────────────────────────────────────
  const projectId = uuidv4();

  const project = await prisma.project.create({
    data: {
      id: projectId,
      name: 'Residencial Mata Viva',
      slug: 'mata-viva',
      type: 'condominio',
      city: 'Goiânia',
      state: 'GO',
      biome: 'Cerrado',
      area_hectares: 2.4,
      boundary: boundaryPolygon,
    },
  });

  console.log(`✅ Projeto criado: ${project.name}`);

  // ── 2. Create Species ────────────────────────────────────────────────────
  const speciesIds = speciesData.map(() => uuidv4());

  await prisma.species.createMany({
    data: speciesData.map((s, i) => ({
      id: speciesIds[i],
      common_name: s.common_name,
      scientific_name: s.scientific_name,
      family: s.family,
      biome: s.biome,
      strata: s.strata,
      description: s.description,
      ecological_function: s.ecological_function,
      fruiting_season: s.fruiting_season,
      fauna_attracted: s.fauna_attracted,
      subclasses: s.subclasses,
      default_carbon_factor: s.default_carbon_factor,
    })),
  });

  console.log(`✅ ${speciesData.length} espécies criadas`);

  // ── 3. Create Trees ──────────────────────────────────────────────────────
  const NUM_TREES = 125;
  const treeIds: string[] = [];
  const treeStatuses: string[] = [];
  const treesToCreate: Array<{
    id: string;
    project_id: string;
    species_id: string;
    lat: number;
    lng: number;
    dbh_cm: number;
    height_m: number;
    planted_date: Date | null;
    status: string;
    reliability: string;
    qr_slug: string;
  }> = [];

  const plantedDateStart = new Date('2015-01-01');
  const plantedDateEnd = new Date('2023-12-31');
  const speciesIndices = Array.from({ length: speciesData.length }, (_, k) => k);

  for (let i = 0; i < NUM_TREES; i++) {
    const idx = pickWeighted(speciesIndices, speciesWeights);

    const species = speciesData[idx];
    const speciesId = speciesIds[idx];
    const ranges = strataRanges[species.strata] || strataRanges.medio;

    const status = pick(statusOptions);
    const reliability = pick(reliabilityOptions);
    const hasPlantedDate = Math.random() < 0.20;

    // Scatter trees within the boundary with slight clustering
    const clusterOffset = Math.random() < 0.4 ? rand(-0.0005, 0.0005) : 0;
    const lat = CENTER_LAT + rand(-LAT_SPREAD, LAT_SPREAD) + clusterOffset;
    const lng = CENTER_LNG + rand(-LNG_SPREAD, LNG_SPREAD) + clusterOffset;

    const treeId = uuidv4();
    const qrSlug = `mv-${String(i + 1).padStart(3, '0')}`;

    treeIds.push(treeId);
    treeStatuses.push(status);

    treesToCreate.push({
      id: treeId,
      project_id: projectId,
      species_id: speciesId,
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6)),
      dbh_cm: parseFloat(rand(ranges.dbhMin, ranges.dbhMax).toFixed(1)),
      height_m: parseFloat(rand(ranges.heightMin, ranges.heightMax).toFixed(1)),
      planted_date: hasPlantedDate ? randomDate(plantedDateStart, plantedDateEnd) : null,
      status,
      reliability,
      qr_slug: qrSlug,
    });
  }

  // Use createMany for efficiency (no relations to resolve)
  await prisma.tree.createMany({ data: treesToCreate });

  console.log(`✅ ${NUM_TREES} árvores criadas`);

  // ── 4. Create Tree Events ────────────────────────────────────────────────
  const eventsToCreate: Array<{
    id: string;
    tree_id: string;
    type: string;
    description: string;
    author_role: string;
    created_at: Date;
  }> = [];

  const eventDescriptions: Record<string, string[]> = {
    plantio: [
      'Árvore plantada durante mutirão de arborização do condomínio.',
      'Mudas recebidas via programa de doação da Prefeitura de Goiânia.',
      'Plantio realizado em comemoração ao Dia da Árvore.',
      'Muda adquirida em viveiro credenciado, plantio conforme laudo técnico.',
    ],
    atualizacao_estado: [
      'Estado atualizado após vistoria técnica mensal.',
      'Árvore apresenta sinais de estresse hídrico — monitoramento reforçado.',
      'Danos causados por vandalismo registrados e comunicados à administração.',
      'Rebrota identificada após período de seca prolongado.',
      'Tratamento preventivo aplicado contra fungo foliar.',
    ],
    poda: [
      'Poda de formação realizada conforme norma ABNT 9935.',
      'Poda de limpeza — remoção de galhos secos e doentes.',
      'Poda de emergência após galho danificado em ventania.',
      'Poda corretiva para afastamento da rede elétrica.',
    ],
    validacao: [
      'Árvore validada por técnico habilitado — dados conferem com levantamento anterior.',
      'Dados de CAP medidos e validados com trena a 1,30m do solo.',
      'Validação realizada durante inventário semestral.',
      'Identificação botânica confirmada por especialista.',
    ],
    observacao: [
      'Ninhos de aves identificados na copa — período de nidificação.',
      'Frutificação abundante observada este mês.',
      'Presença de epífitas (bromélias) na bifurcação do tronco.',
      'Solo ao redor compactado — recomendar aeração.',
      'Ataque de cupins de solo identificado na base do tronco.',
      'Cancro bacteriano observado em galho principal.',
    ],
  };

  const eventSeedDate = new Date('2020-01-01');
  const eventEndDate = new Date('2024-12-31');

  for (let i = 0; i < NUM_TREES; i++) {
    const treeId = treeIds[i];
    const status = treeStatuses[i];
    const numEvents = randInt(2, 4);
    const authorRoles = ['gestor', 'tecnico'];

    // Always add an initial event (plantio or validacao)
    const initialType = Math.random() < 0.5 ? 'plantio' : 'validacao';
    eventsToCreate.push({
      id: uuidv4(),
      tree_id: treeId,
      type: initialType,
      description: pick(eventDescriptions[initialType]),
      author_role: pick(authorRoles),
      created_at: randomDate(eventSeedDate, new Date('2022-12-31')),
    });

    // For problematic trees, add status update events
    if (status === 'doente' || status === 'morta' || status === 'removida' || status === 'em_tratamento') {
      eventsToCreate.push({
        id: uuidv4(),
        tree_id: treeId,
        type: 'atualizacao_estado',
        description: pick(eventDescriptions.atualizacao_estado),
        author_role: pick(authorRoles),
        created_at: randomDate(new Date('2023-01-01'), eventEndDate),
      });
    }

    // Add remaining events
    for (let j = 1; j < numEvents; j++) {
      const eventType = pick(['poda', 'observacao', 'validacao', 'atualizacao_estado']);
      eventsToCreate.push({
        id: uuidv4(),
        tree_id: treeId,
        type: eventType,
        description: pick(eventDescriptions[eventType]),
        author_role: j % 2 === 0 ? 'gestor' : 'tecnico',
        created_at: randomDate(new Date('2022-01-01'), eventEndDate),
      });
    }
  }

  // Use createMany for efficiency
  await prisma.treeEvent.createMany({ data: eventsToCreate });

  console.log(`✅ ${eventsToCreate.length} eventos de árvore criados`);

  // ── 5. Create Submissions ────────────────────────────────────────────────
  const submissionsData = [
    {
      id: uuidv4(),
      project_id: projectId,
      submitted_by: 'José da Silva',
      lat: CENTER_LAT + rand(-LAT_SPREAD * 0.8, LAT_SPREAD * 0.8),
      lng: CENTER_LNG + rand(-LNG_SPREAD * 0.8, LNG_SPREAD * 0.8),
      notes: 'Vi essa árvore perto do estacionamento, acho que é um ipê mas não tenho certeza. Parece estar com a casca descascando em alguns pontos.',
      status: 'pendente',
      created_at: new Date('2024-09-15T14:32:00Z'),
    },
    {
      id: uuidv4(),
      project_id: projectId,
      submitted_by: 'Maria Oliveira',
      lat: CENTER_LAT + rand(-LAT_SPREAD * 0.8, LAT_SPREAD * 0.8),
      lng: CENTER_LNG + rand(-LNG_SPREAD * 0.8, LNG_SPREAD * 0.8),
      notes: 'Encontrei uma árvore bonita perto da área de lazer. Ela frutificou bastante este mês e os pássaros estão adorando. Seria interessante identificá-la.',
      status: 'pendente',
      created_at: new Date('2024-10-03T09:17:00Z'),
    },
    {
      id: uuidv4(),
      project_id: projectId,
      submitted_by: 'Carlos Eduardo Ferreira',
      lat: CENTER_LAT + rand(-LAT_SPREAD * 0.8, LAT_SPREAD * 0.8),
      lng: CENTER_LNG + rand(-LNG_SPREAD * 0.8, LNG_SPREAD * 0.8),
      notes: 'Árvore com galho grande inclinando para o corredor de pedestres. Possível risco de queda. Solicito vistoria urgente.',
      status: 'pendente',
      created_at: new Date('2024-10-20T16:45:00Z'),
    },
    {
      id: uuidv4(),
      project_id: projectId,
      submitted_by: 'Ana Paula Souza',
      lat: CENTER_LAT + rand(-LAT_SPREAD * 0.8, LAT_SPREAD * 0.8),
      lng: CENTER_LNG + rand(-LNG_SPREAD * 0.8, LNG_SPREAD * 0.8),
      notes: 'Pequi jovem nascendo espontaneamente na área de preservação. Provavelmente dispersão por fauna. Vale cadastrar!',
      status: 'pendente',
      created_at: new Date('2024-11-05T11:20:00Z'),
    },
  ];

  await prisma.submission.createMany({ data: submissionsData });

  console.log(`✅ ${submissionsData.length} submissões pendentes criadas`);

  // ── 6. Create Users + Profiles ─────────────────────────────────────────────
  const usersWithProfiles = [
    { name: 'Admin Mata Viva', role: 'gestor', project_id: projectId },
    { name: 'Dr. Paulo Botânico', role: 'tecnico', project_id: projectId },
    { name: 'Moradora Bloco A', role: 'morador', project_id: projectId },
  ];

  for (const u of usersWithProfiles) {
    const id = uuidv4();
    await prisma.user.create({
      data: {
        id,
        name: u.name,
        profile: { create: { name: u.name, role: u.role, project_id: u.project_id } },
      },
    });
  }

  const profiles = usersWithProfiles;

  console.log(`✅ ${profiles.length} perfis criados`);

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('\n🌳 Seed concluído com sucesso!');
  console.log('─────────────────────────────────────────');
  console.log(`  Projeto: ${project.name}`);
  console.log(`  Espécies: ${speciesData.length}`);
  console.log(`  Árvores: ${NUM_TREES}`);
  console.log(`  Eventos: ${eventsToCreate.length}`);
  console.log(`  Submissões pendentes: ${submissionsData.length}`);
  console.log(`  Perfis: ${profiles.length}`);
  console.log('─────────────────────────────────────────');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
