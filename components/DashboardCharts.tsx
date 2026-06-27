'use client';

import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import type { DashboardStats } from '@/app/[projectSlug]/dashboard/page';

const STRATA_COLORS = ['#2D5016', '#4A7C2F', '#6B9E4A', '#D4A017', '#C4622D'];
const STATUS_COLORS: Record<string, string> = {
  Viva: '#4A7C2F',
  Doente: '#D4A017',
  'Em tratamento': '#C4622D',
  Morta: '#8B5E3C',
  Removida: '#9CA3AF',
};
const BAR_COLOR = '#4A7C2F';

interface Props {
  stats: DashboardStats;
}

export default function DashboardCharts({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Strata distribution */}
      <div className="card">
        <h3 className="font-display text-lg font-bold text-verde-cerrado mb-4">
          Por estrato
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={stats.byStrata}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={(props: PieLabelRenderProps) =>
                `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`
              }
            >
              {stats.byStrata.map((_, i) => (
                <Cell key={i} fill={STRATA_COLORS[i % STRATA_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Status distribution */}
      <div className="card">
        <h3 className="font-display text-lg font-bold text-verde-cerrado mb-4">
          Por estado
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={stats.byStatus}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={100}
              label={(props: PieLabelRenderProps) =>
                `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`
              }
            >
              {stats.byStatus.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={STATUS_COLORS[entry.name] || '#9CA3AF'}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Subclass distribution - full width */}
      <div className="card lg:col-span-2">
        <h3 className="font-display text-lg font-bold text-verde-cerrado mb-4">
          Por subclasse
        </h3>
        <ResponsiveContainer width="100%" height={Math.max(200, stats.bySubclass.length * 40)}>
          <BarChart
            data={stats.bySubclass}
            layout="vertical"
            margin={{ left: 20, right: 20, top: 5, bottom: 5 }}
          >
            <XAxis type="number" />
            <YAxis dataKey="label" type="category" width={130} tick={{ fontSize: 13 }} />
            <Tooltip />
            <Bar dataKey="count" fill={BAR_COLOR} radius={[0, 4, 4, 0]} name="Árvores" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
