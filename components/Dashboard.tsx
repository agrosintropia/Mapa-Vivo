'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { DashboardStats } from '@/app/[projectSlug]/dashboard/page';

const DashboardCharts = dynamic(() => import('./DashboardCharts'), { ssr: false });

interface DashboardProps {
  stats: DashboardStats;
  projectName: string;
}

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.', ',') + ' t';
  return n.toFixed(1).replace('.', ',') + ' kg';
}

export default function Dashboard({ stats, projectName }: DashboardProps) {
  const [showMethodology, setShowMethodology] = useState(false);

  return (
    <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full space-y-8">
      {/* Summary Cards */}
      <section>
        <h2 className="font-display text-2xl font-bold text-verde-cerrado mb-4">
          Resumo do projeto
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            value={stats.totalTrees}
            label="Indivíduos"
            color="bg-verde-cerrado"
          />
          <SummaryCard
            value={stats.totalSpecies}
            label="Espécies"
            color="bg-verde-medio"
          />
          <SummaryCard
            value={`${stats.nativePercent}%`}
            label="Nativas"
            color="bg-ocre"
          />
          <SummaryCard
            value={stats.threatenedSpeciesCount}
            label="Espécies ameaçadas"
            color="bg-terracota"
          />
        </div>
      </section>

      {/* Carbon Section */}
      <section className="card">
        <div className="flex items-start justify-between mb-4">
          <h2 className="font-display text-2xl font-bold text-verde-cerrado">
            Carbono estocado
            <span className="ml-2 text-sm font-sans font-normal text-terracota bg-terracota/10 px-2 py-0.5 rounded">
              estimativa
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-verde-cerrado">
              {formatNumber(stats.carbon.totalCO2eqKg)}
            </p>
            <p className="text-sm text-gray-500 mt-1">CO₂ equivalente</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-verde-medio">
              {formatNumber(stats.carbon.totalBiomassKg)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Biomassa</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-verde-medio">
              {formatNumber(stats.carbon.totalCarbonKg)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Carbono</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-2">
          Calculado para {stats.carbon.treesIncluded} de {stats.carbon.treesIncluded + stats.carbon.treesExcluded} árvores
          (excluídas {stats.carbon.treesExcluded} sem dados de DAP ou altura).
        </p>

        <button
          onClick={() => setShowMethodology(!showMethodology)}
          className="text-sm text-verde-medio hover:underline cursor-pointer"
        >
          {showMethodology ? 'Ocultar metodologia' : 'Ver metodologia'}
        </button>

        {showMethodology && (
          <div className="mt-3 p-4 bg-areia rounded-lg text-sm text-gray-600 space-y-2">
            <p><strong>Equação alométrica simplificada:</strong></p>
            <p className="font-mono text-xs">
              biomassa (kg) = fator_carbono × DAP² × altura / 1000
            </p>
            <p className="font-mono text-xs">
              carbono (kg) = biomassa × 0,47
            </p>
            <p className="font-mono text-xs">
              CO₂eq (kg) = carbono × 3,67
            </p>
            <p className="mt-2">
              O fator de carbono utilizado é específico por espécie. Árvores sem DAP
              (diâmetro à altura do peito) ou altura registrada são excluídas do cálculo.
              Valores são estimativas e não substituem inventários florestais oficiais.
            </p>
          </div>
        )}
      </section>

      {/* Charts */}
      <section>
        <h2 className="font-display text-2xl font-bold text-verde-cerrado mb-4">
          Distribuições
        </h2>
        <DashboardCharts stats={stats} />
      </section>

      {/* Cerrado block */}
      <section className="card border-l-4 border-l-verde-medio">
        <h2 className="font-display text-xl font-bold text-verde-cerrado mb-3">
          Sobre o bioma Cerrado
        </h2>
        <div className="space-y-3 text-gray-600 text-sm leading-relaxed">
          <p>
            O Cerrado é o segundo maior bioma da América do Sul, cobrindo aproximadamente
            22% do território brasileiro — cerca de 2 milhões de km². É a savana
            tropical com maior biodiversidade do mundo.
          </p>
          <p>
            Abriga mais de 12.000 espécies de plantas nativas, das quais cerca de 4.400
            são endêmicas, ou seja, não existem em nenhum outro lugar do planeta.
            Sua flora inclui desde gramíneas e arbustos até árvores de casca grossa
            adaptadas ao fogo natural.
          </p>
          <p>
            É considerado a &ldquo;caixa d&rsquo;água&rdquo; do Brasil: em seu
            território nascem três das maiores bacias hidrográficas da América do Sul
            — Tocantins-Araguaia, São Francisco e Paraguai (Pantanal). Apesar de sua
            importância, mais de 50% de sua cobertura original já foi desmatada,
            tornando a conservação e o reflorestamento urgentes.
          </p>
        </div>
      </section>
    </div>
  );
}

const CARD_ICONS: Record<string, string> = {
  'Indivíduos': '🌳',
  'Espécies': '🌿',
  'Nativas': '🍃',
  'Espécies ameaçadas': '⚠️',
};

function SummaryCard({ value, label, color }: { value: number | string; label: string; color: string }) {
  return (
    <div className="card flex flex-col items-center justify-center py-6">
      <div className={`w-10 h-10 rounded-full ${color} mb-3 flex items-center justify-center`}>
        <span className="text-lg">{CARD_ICONS[label] ?? '📊'}</span>
      </div>
      <p className="text-3xl font-bold text-verde-cerrado">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}
