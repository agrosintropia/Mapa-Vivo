'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { ProjectData, TreeData } from '@/lib/types';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-areia h-[500px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-verde-medio border-t-transparent mx-auto mb-4" />
        <p className="text-verde-cerrado font-medium">Carregando mapa...</p>
      </div>
    </div>
  ),
});

const SPECIES_COLORS = [
  '#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4',
  '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990',
  '#dcbeff', '#9A6324', '#800000', '#aaffc3',
];

const DEMO_PROJECT: ProjectData = {
  id: 'demo',
  name: 'Residencial Mata Viva',
  slug: 'mata-viva',
  boundary: null,
  biome: 'cerrado',
  city: 'Goiânia',
  state: 'GO',
  area_hectares: 2.5,
};

const DEMO_SPECIES = [
  { id: 's1', common_name: 'Ipê-amarelo', scientific_name: 'Handroanthus albus', family: 'Bignoniaceae', strata: 'alto', subclasses: ['nativa', 'ornamental'], ecological_function: 'Atrai polinizadores' },
  { id: 's2', common_name: 'Jatobá', scientific_name: 'Hymenaea courbaril', family: 'Fabaceae', strata: 'emergente', subclasses: ['nativa', 'frutífera'], ecological_function: 'Alimento para fauna' },
  { id: 's3', common_name: 'Pequi', scientific_name: 'Caryocar brasiliense', family: 'Caryocaraceae', strata: 'alto', subclasses: ['nativa', 'frutífera', 'medicinal'], ecological_function: 'Espécie-chave do cerrado' },
  { id: 's4', common_name: 'Mangaba', scientific_name: 'Hancornia speciosa', family: 'Apocynaceae', strata: 'medio', subclasses: ['nativa', 'frutífera'], ecological_function: 'Frutos para fauna e alimentação humana' },
  { id: 's5', common_name: 'Aroeira', scientific_name: 'Myracrodruon urundeuva', family: 'Anacardiaceae', strata: 'alto', subclasses: ['nativa', 'medicinal'], ecological_function: 'Madeira nobre, sombra densa' },
  { id: 's6', common_name: 'Buriti', scientific_name: 'Mauritia flexuosa', family: 'Arecaceae', strata: 'emergente', subclasses: ['nativa', 'frutífera'], ecological_function: 'Indicadora de água, alimento para fauna' },
  { id: 's7', common_name: 'Pau-terra', scientific_name: 'Qualea grandiflora', family: 'Vochysiaceae', strata: 'alto', subclasses: ['nativa'], ecological_function: 'Espécie típica do cerrado' },
  { id: 's8', common_name: 'Cajuzinho-do-cerrado', scientific_name: 'Anacardium humile', family: 'Anacardiaceae', strata: 'arbustivo', subclasses: ['nativa', 'frutífera'], ecological_function: 'Frutos comestíveis' },
];

function makeTrees(): TreeData[] {
  const baseLat = -16.686;
  const baseLng = -49.264;
  const trees: TreeData[] = [];
  for (let i = 0; i < 40; i++) {
    const sp = DEMO_SPECIES[i % DEMO_SPECIES.length];
    trees.push({
      id: `t${i}`,
      lat: baseLat + (Math.sin(i * 1.3) * 0.003) + (i * 0.00005),
      lng: baseLng + (Math.cos(i * 0.9) * 0.004) + (i * 0.00003),
      status: 'viva',
      reliability: 'validado_tecnico',
      qr_slug: `demo-tree-${i}`,
      dbh_cm: 15 + (i % 30),
      height_m: 4 + (i % 12),
      species: sp,
    });
  }
  return trees;
}

const DEMO_TREES = makeTrees();

export default function DemoMap() {
  const speciesColorMap = useMemo(() => {
    const map = new Map<string, string>();
    DEMO_SPECIES.forEach((sp, i) => map.set(sp.id, SPECIES_COLORS[i % SPECIES_COLORS.length]));
    return map;
  }, []);

  return (
    <div className="relative h-[500px] md:h-[600px] rounded-xl overflow-hidden border border-gray-200 shadow-lg">
      <LeafletMap
        project={DEMO_PROJECT}
        allTrees={DEMO_TREES}
        filteredTrees={DEMO_TREES}
        speciesColorMap={speciesColorMap}
        readOnly
      />
      <div className="absolute top-3 left-3 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
        <p className="text-xs font-bold text-verde-cerrado">Residencial Mata Viva</p>
        <p className="text-[10px] text-gray-500">{DEMO_TREES.length} árvores · {DEMO_SPECIES.length} espécies</p>
      </div>
    </div>
  );
}
