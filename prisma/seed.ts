import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { v4 as uuidv4 } from 'uuid';

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

// ─── Species data ───────────────────────────────────────────────────────────

const speciesData = [
  {
    common_name: 'Ipê-amarelo',
    scientific_name: 'Handroanthus ochraceus',
    family: 'Bignoniaceae',
    biome: ['Cerrado', 'Mata Atlântica'],
    strata: 'alto',
    description: 'Árvore de médio a grande porte, símbolo do Brasil, reconhecida pela exuberante floração amarela.',
    ecological_function: 'Oferece néctar e pólen para abelhas e beija-flores durante a floração, enriquecendo a biodiversidade local. Suas flores atraem inúmeros polinizadores, sendo fundamental para a manutenção dos serviços ecossistêmicos.',
    fruiting_season: 'Setembro a novembro',
    fauna_attracted: 'Beija-flores, abelhas, borboletas',
    subclasses: ['nativa', 'nativa_com_flor', 'atrativa_de_fauna', 'melifera'],
    default_carbon_factor: 0.12,
  },
  {
    common_name: 'Ipê-roxo',
    scientific_name: 'Handroanthus impetiginosus',
    family: 'Bignoniaceae',
    biome: ['Cerrado', 'Mata Atlântica', 'Caatinga'],
    strata: 'alto',
    description: 'Árvore de grande porte com floração roxa vibrante antes da emissão das folhas.',
    ecological_function: 'Fornece recurso alimentar vital para polinizadores no período de seca, quando poucas espécies florescem. Sua casca é amplamente utilizada na medicina popular do cerrado.',
    fruiting_season: 'Outubro a dezembro',
    fauna_attracted: 'Beija-flores, morcegos, borboletas',
    subclasses: ['nativa', 'nativa_com_flor', 'medicinal', 'atrativa_de_fauna'],
    default_carbon_factor: 0.13,
  },
  {
    common_name: 'Pequi',
    scientific_name: 'Caryocar brasiliense',
    family: 'Caryocaraceae',
    biome: ['Cerrado'],
    strata: 'medio',
    description: 'Árvore símbolo do Cerrado, produz frutos de grande valor gastronômico e ecológico.',
    ecological_function: 'Fruto essencial para a fauna do cerrado, especialmente macacos, cutias e araras. Flor melífera que atrai grande diversidade de abelhas nativas, sendo pilar da cadeia alimentar local.',
    fruiting_season: 'Novembro a fevereiro',
    fauna_attracted: 'Macacos, cutias, araras, tucanos, abelhas',
    subclasses: ['nativa', 'frutifera', 'atrativa_de_fauna', 'melifera'],
    default_carbon_factor: 0.10,
  },
  {
    common_name: 'Baru',
    scientific_name: 'Dipteryx alata',
    family: 'Fabaceae',
    biome: ['Cerrado'],
    strata: 'alto',
    description: 'Árvore de grande porte típica do cerrado, produz sementes oleaginosas com alto valor nutritivo.',
    ecological_function: 'Frutos e sementes são recursos alimentares críticos para mamíferos de médio e grande porte, como pacas, catetos e lobos-guará. Contribui significativamente para o banco de carbono do cerrado.',
    fruiting_season: 'Setembro a novembro',
    fauna_attracted: 'Lobo-guará, pacas, catetos, aves frugívoras',
    subclasses: ['nativa', 'frutifera', 'atrativa_de_fauna'],
    default_carbon_factor: 0.15,
  },
  {
    common_name: 'Jatobá',
    scientific_name: 'Hymenaea stigonocarpa',
    family: 'Fabaceae',
    biome: ['Cerrado'],
    strata: 'alto',
    description: 'Árvore de grande porte e longevidade, com frutos em vagem lenhosa e resina medicinal.',
    ecological_function: 'A polpa dos frutos é consumida por diversas espécies da fauna, incluindo antas, queixadas e aves. Sua resina tem propriedades antimicrobianas e é utilizada na medicina tradicional.',
    fruiting_season: 'Julho a outubro',
    fauna_attracted: 'Antas, queixadas, cutias, aves',
    subclasses: ['nativa', 'frutifera', 'medicinal', 'madeireira_nobre'],
    default_carbon_factor: 0.16,
  },
  {
    common_name: 'Aroeira',
    scientific_name: 'Myracrodruon urundeuva',
    family: 'Anacardiaceae',
    biome: ['Cerrado', 'Caatinga'],
    strata: 'alto',
    description: 'Árvore de madeira durabilíssima, ameaçada de extinção por exploração predatória histórica.',
    ecological_function: 'Produz frutos carnosos que alimentam aves e mamíferos. Espécie de importância histórica e cultural, com propriedades medicinais reconhecidas cientificamente para uso anti-inflamatório.',
    fruiting_season: 'Setembro a novembro',
    fauna_attracted: 'Aves frugívoras, morcegos',
    subclasses: ['nativa', 'madeireira_nobre', 'ameacada_de_extincao', 'medicinal'],
    default_carbon_factor: 0.18,
  },
  {
    common_name: 'Pau-brasil',
    scientific_name: 'Paubrasilia echinata',
    family: 'Fabaceae',
    biome: ['Mata Atlântica'],
    strata: 'alto',
    description: 'Árvore símbolo do Brasil, historicamente explorada até quase extinção, hoje protegida por lei.',
    ecological_function: 'Espécie em recuperação com papel fundamental na restauração da Mata Atlântica. Seu plantio em áreas degradadas contribui para a reconstituição do dossel e recolonização de fauna.',
    fruiting_season: 'Outubro a dezembro',
    fauna_attracted: 'Aves insetívoras, morcegos',
    subclasses: ['nativa', 'madeireira_nobre', 'ameacada_de_extincao'],
    default_carbon_factor: 0.20,
  },
  {
    common_name: 'Cagaita',
    scientific_name: 'Eugenia dysenterica',
    family: 'Myrtaceae',
    biome: ['Cerrado'],
    strata: 'medio',
    description: 'Árvore frutífera nativa do cerrado com frutos amarelos levemente ácidos, muito apreciados.',
    ecological_function: 'Espécie frutífera de grande importância para a fauna silvestre e para as populações humanas do cerrado. Seus frutos suculentos atraem diversas espécies de aves e mamíferos em período de escassez.',
    fruiting_season: 'Setembro a outubro',
    fauna_attracted: 'Pombas, tucanos, jacus, morcegos frugívoros',
    subclasses: ['nativa', 'frutifera', 'atrativa_de_fauna'],
    default_carbon_factor: 0.09,
  },
  {
    common_name: 'Jacarandá-do-cerrado',
    scientific_name: 'Machaerium opacum',
    family: 'Fabaceae',
    biome: ['Cerrado'],
    strata: 'medio',
    description: 'Árvore de médio porte com bela floração lilás e madeira resistente.',
    ecological_function: 'Fornece recursos florais para abelhas e outros polinizadores. Sua madeira é resistente e utilizada artesanalmente. Espécie importante para a recomposição do cerrado sensu stricto.',
    fruiting_season: 'Outubro a dezembro',
    fauna_attracted: 'Abelhas, borboletas',
    subclasses: ['nativa', 'nativa_com_flor', 'madeireira_nobre'],
    default_carbon_factor: 0.11,
  },
  {
    common_name: 'Embaúba',
    scientific_name: 'Cecropia pachystachya',
    family: 'Urticaceae',
    biome: ['Cerrado', 'Mata Atlântica', 'Amazônia'],
    strata: 'medio',
    description: 'Árvore pioneira de crescimento rápido, essencial na regeneração natural de áreas perturbadas.',
    ecological_function: 'Espécie pioneira fundamental para a regeneração natural. Seus frutos são alimento essencial para pássaros, morcegos e primatas. Abriga formigas simbióticas que defendem a planta de herbívoros.',
    fruiting_season: 'Março a agosto',
    fauna_attracted: 'Pombas, papagaios, saguis, morcegos frugívoros, preguiças',
    subclasses: ['nativa', 'pioneira', 'atrativa_de_fauna'],
    default_carbon_factor: 0.07,
  },
  {
    common_name: 'Buriti',
    scientific_name: 'Mauritia flexuosa',
    family: 'Arecaceae',
    biome: ['Cerrado', 'Amazônia'],
    strata: 'emergente',
    description: 'Palmeira símbolo do cerrado, indicadora de veredas e cursos d\'água. Árvore da vida.',
    ecological_function: 'Considerada a "árvore da vida" pelos povos do cerrado, seus frutos alimentam dezenas de espécies. Indicadora de áreas de nascentes e preservação de recursos hídricos. Flores melíferas abundantes.',
    fruiting_season: 'Maio a setembro',
    fauna_attracted: 'Araras, tucanos, macacos, queixadas, capivara, lobo-guará',
    subclasses: ['nativa', 'frutifera', 'atrativa_de_fauna', 'melifera'],
    default_carbon_factor: 0.14,
  },
  {
    common_name: 'Candeia',
    scientific_name: 'Eremanthus erythropappus',
    family: 'Asteraceae',
    biome: ['Cerrado', 'Mata Atlântica'],
    strata: 'medio',
    description: 'Árvore de madeira resistente, utilizada para mourões e moirões, com potencial medicinal.',
    ecological_function: 'Espécie com propriedades inseticidas naturais (alfabisabolol). Pioneira em ambientes de campo rupestre. Sua madeira é extremamente resistente ao apodrecimento. // TODO: verificar subclasses',
    fruiting_season: 'Maio a agosto',
    fauna_attracted: 'Aves granívoras, insetos',
    subclasses: ['nativa', 'medicinal', 'madeireira_nobre'],
    default_carbon_factor: 0.10,
  },
  {
    common_name: 'Murici',
    scientific_name: 'Byrsonima crassifolia',
    family: 'Malpighiaceae',
    biome: ['Cerrado', 'Amazônia'],
    strata: 'medio',
    description: 'Arbusto ou árvore de pequeno a médio porte com floração amarela intensa e frutos saborosos.',
    ecological_function: 'Frutos apreciados por humanos e por grande diversidade de aves e mamíferos. Flores são fonte de óleos florais usados por abelhas-da-espécie Centris para construção de ninhos, sendo uma das mais importantes plantas melíferas do cerrado.',
    fruiting_season: 'Julho a setembro',
    fauna_attracted: 'Abelhas Centris, pombas, aves frugívoras, tatus',
    subclasses: ['nativa', 'frutifera', 'atrativa_de_fauna', 'melifera'],
    default_carbon_factor: 0.08,
  },
  {
    common_name: 'Sucupira-preta',
    scientific_name: 'Bowdichia virgilioides',
    family: 'Fabaceae',
    biome: ['Cerrado', 'Amazônia'],
    strata: 'alto',
    description: 'Árvore de grande porte com madeira de alta durabilidade e propriedades medicinais reconhecidas.',
    ecological_function: 'Madeira extremamente resistente, usada historicamente em construções. As sementes têm uso medicinal comprovado para problemas articulares. Importante fornecedora de habitat para aves e animais cavadores.',
    fruiting_season: 'Setembro a novembro',
    fauna_attracted: 'Aves granívoras, insetos',
    subclasses: ['nativa', 'madeireira_nobre', 'medicinal'],
    default_carbon_factor: 0.17,
  },
  {
    common_name: 'Lobeira',
    scientific_name: 'Solanum lycocarpum',
    family: 'Solanaceae',
    biome: ['Cerrado'],
    strata: 'arbustivo',
    description: 'Arbusto a árvore pequena, fruto essencial na dieta do lobo-guará, animal símbolo do cerrado.',
    ecological_function: 'Fruto principal na dieta do lobo-guará, que atua como dispersor de sementes, contribuindo para a regeneração da espécie. A espécie é fundamental para a conservação deste predador ameaçado.',
    fruiting_season: 'Outubro a março',
    fauna_attracted: 'Lobo-guará, gambás, aves',
    subclasses: ['nativa', 'frutifera', 'atrativa_de_fauna'],
    default_carbon_factor: 0.05,
  },
  {
    common_name: 'Copaíba',
    scientific_name: 'Copaifera langsdorffii',
    family: 'Fabaceae',
    biome: ['Cerrado', 'Mata Atlântica', 'Amazônia'],
    strata: 'alto',
    description: 'Árvore de grande porte produtora de óleo-resina de reconhecido valor medicinal.',
    ecological_function: 'Produz óleo-resina com propriedades anti-inflamatórias e cicatrizantes amplamente estudadas. Frutos com arilo vermelho são consumidos por aves, especialmente tucanos e araçaris. Importante componente do dossel das matas de galeria.',
    fruiting_season: 'Julho a outubro',
    fauna_attracted: 'Tucanos, araçaris, aves frugívoras',
    subclasses: ['nativa', 'medicinal', 'madeireira_nobre'],
    default_carbon_factor: 0.15,
  },
  {
    common_name: 'Angico-do-cerrado',
    scientific_name: 'Anadenanthera falcata',
    family: 'Fabaceae',
    biome: ['Cerrado'],
    strata: 'alto',
    description: 'Árvore de grande porte com vagens características e madeira de elevada durabilidade.',
    ecological_function: 'Importante fixadora de nitrogênio, melhorando a fertilidade do solo. Suas flores atraem diversas espécies de polinizadores. A madeira é muito densa e resistente ao apodrecimento, tendo sido muito utilizada em construções rurais.',
    fruiting_season: 'Setembro a novembro',
    fauna_attracted: 'Abelhas, borboletas, aves insetívoras',
    subclasses: ['nativa', 'madeireira_nobre', 'atrativa_de_fauna'],
    default_carbon_factor: 0.16,
  },
  {
    common_name: 'Ingá',
    scientific_name: 'Inga vera',
    family: 'Fabaceae',
    biome: ['Cerrado', 'Mata Atlântica'],
    strata: 'medio',
    description: 'Árvore de crescimento rápido, frequente em matas de galeria, com frutos de polpa branca e doce.',
    ecological_function: 'Excelente pioneira para restauração ecológica, crescimento rápido e fixação de nitrogênio. Frutos muito apreciados por crianças e adultos, além de ampla fauna. Proporciona sombra e melhoria do microclima.',
    fruiting_season: 'Outubro a janeiro',
    fauna_attracted: 'Tucanos, araçaris, saguis, macacos, morcegos',
    subclasses: ['nativa', 'frutifera', 'atrativa_de_fauna', 'pioneira'],
    default_carbon_factor: 0.09,
  },
  {
    common_name: 'Gonçalo-alves',
    scientific_name: 'Astronium fraxinifolium',
    family: 'Anacardiaceae',
    biome: ['Cerrado', 'Caatinga'],
    strata: 'alto',
    description: 'Árvore de madeira nobre ornamental com grã interlada e elevado valor comercial.',
    ecological_function: 'Fornece frutos alados que dispersam pelo vento, colonizando áreas abertas. A madeira é uma das mais valiosas do cerrado, utilizada em marcenaria de luxo e instrumentos musicais.',
    fruiting_season: 'Agosto a outubro',
    fauna_attracted: 'Aves, mamíferos de médio porte',
    subclasses: ['nativa', 'madeireira_nobre'],
    default_carbon_factor: 0.17,
  },
  {
    common_name: 'Caju-do-cerrado',
    scientific_name: 'Anacardium humile',
    family: 'Anacardiaceae',
    biome: ['Cerrado'],
    strata: 'arbustivo',
    description: 'Arbusto rasteiro nativo do cerrado, primo menor do cajueiro, com frutos saborosos.',
    ecological_function: 'Espécie adaptada às queimadas do cerrado com sistema radicular profundo. Seus frutos alimentam diversas espécies da fauna e são consumidos por populações locais. Flores melíferas atraem abelhas nativas sem ferrão.',
    fruiting_season: 'Outubro a dezembro',
    fauna_attracted: 'Abelhas nativas, pássaros, tatus, cotias',
    subclasses: ['nativa', 'frutifera', 'melifera', 'atrativa_de_fauna'],
    default_carbon_factor: 0.04,
  },
];

// ─── Tree generation config ─────────────────────────────────────────────────

// Weights for species selection (sum not required to be 1 — will normalize)
// More common cerrado species get higher weight
const speciesWeights = [
  8, // Ipê-amarelo
  8, // Ipê-roxo
  7, // Pequi
  5, // Baru
  5, // Jatobá
  4, // Aroeira
  3, // Pau-brasil
  6, // Cagaita
  4, // Jacarandá-do-cerrado
  6, // Embaúba
  4, // Buriti
  3, // Candeia
  6, // Murici
  4, // Sucupira-preta
  7, // Lobeira
  4, // Copaíba
  4, // Angico-do-cerrado
  6, // Ingá
  3, // Gonçalo-alves
  7, // Caju-do-cerrado
];

// DBH and height ranges per strata
const strataRanges: Record<string, { dbhMin: number; dbhMax: number; heightMin: number; heightMax: number }> = {
  emergente: { dbhMin: 40, dbhMax: 80, heightMin: 12, heightMax: 25 },
  alto: { dbhMin: 30, dbhMax: 80, heightMin: 8, heightMax: 20 },
  medio: { dbhMin: 15, dbhMax: 40, heightMin: 4, heightMax: 12 },
  arbustivo: { dbhMin: 8, dbhMax: 20, heightMin: 2, heightMax: 6 },
};

// Status distribution: viva(75%), doente(10%), em_tratamento(5%), morta(5%), removida(5%)
const statusOptions = ['viva', 'viva', 'viva', 'viva', 'viva', 'viva', 'viva', 'viva', 'doente', 'doente', 'em_tratamento', 'morta', 'removida'];

// Reliability distribution: validado_tecnico(60%), pendente(30%), declarado_gestor(10%)
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

  // ── 6. Create Profiles ────────────────────────────────────────────────────
  const profiles = [
    { id: uuidv4(), name: 'Admin Mata Viva', role: 'gestor', project_id: projectId },
    { id: uuidv4(), name: 'Dr. Paulo Botânico', role: 'tecnico', project_id: projectId },
    { id: uuidv4(), name: 'Moradora Bloco A', role: 'morador', project_id: projectId },
  ];

  await prisma.profile.createMany({ data: profiles });

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
