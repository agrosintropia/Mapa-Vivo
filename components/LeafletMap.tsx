'use client';

import { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { ProjectData, TreeData } from '@/lib/types';

// Fix Leaflet default marker icon issue with webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Props {
  project: ProjectData;
  filteredTrees: TreeData[];
  speciesColorMap: Map<string, string>;
}

function computeCenter(
  project: ProjectData,
  trees: TreeData[]
): [number, number] {
  // Try to get center from boundary GeoJSON
  if (project.boundary && typeof project.boundary === 'object') {
    try {
      const boundary = project.boundary as { coordinates?: number[][][] };
      if (boundary.coordinates && boundary.coordinates[0]) {
        const coords = boundary.coordinates[0];
        const lat = coords.reduce((s, c) => s + c[1], 0) / coords.length;
        const lng = coords.reduce((s, c) => s + c[0], 0) / coords.length;
        if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
      }
    } catch {
      // fall through
    }
  }

  // Compute from trees
  if (trees.length > 0) {
    const lat = trees.reduce((s, t) => s + t.lat, 0) / trees.length;
    const lng = trees.reduce((s, t) => s + t.lng, 0) / trees.length;
    return [lat, lng];
  }

  // Default: Goiania
  return [-16.686, -49.264];
}

const STATUS_LABELS: Record<string, string> = {
  viva: 'Viva',
  doente: 'Doente',
  em_tratamento: 'Em tratamento',
  morta: 'Morta',
  removida: 'Removida',
};

export default function LeafletMap({ project, filteredTrees, speciesColorMap }: Props) {
  const center = useMemo(
    () => computeCenter(project, filteredTrees),
    [project, filteredTrees]
  );

  return (
    <MapContainer
      center={center}
      zoom={17}
      className="h-full w-full z-0"
      style={{ minHeight: '400px' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {filteredTrees.map((tree) => {
        const color = speciesColorMap.get(tree.species.id) || '#888';
        return (
          <CircleMarker
            key={tree.id}
            center={[tree.lat, tree.lng]}
            radius={8}
            pathOptions={{
              fillColor: color,
              color: '#fff',
              weight: 2,
              fillOpacity: 0.85,
            }}
          >
            <Popup>
              <div className="font-sans text-sm min-w-[180px]">
                <p className="font-bold text-verde-cerrado text-base mb-0.5">
                  {tree.species.common_name}
                </p>
                <p className="italic text-gray-500 text-xs mb-2">
                  {tree.species.scientific_name}
                </p>
                <p className="text-gray-700 mb-1">
                  <span className="font-medium">Status:</span>{' '}
                  {STATUS_LABELS[tree.status] || tree.status}
                </p>
                {tree.dbh_cm && (
                  <p className="text-gray-700 mb-1 text-xs">
                    DAP: {tree.dbh_cm} cm
                  </p>
                )}
                {tree.height_m && (
                  <p className="text-gray-700 mb-1 text-xs">
                    Altura: {tree.height_m} m
                  </p>
                )}
                <a
                  href={`/arvore/${tree.qr_slug}`}
                  className="inline-block mt-2 text-verde-medio font-semibold text-sm hover:underline"
                >
                  Ver ficha →
                </a>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
