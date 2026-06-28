'use client';

import { useMemo, useState, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, Marker, useMap } from 'react-leaflet';
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
  allTrees: TreeData[];
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

const userIcon = L.divIcon({
  html: '<div style="width:14px;height:14px;background:#4285F4;border:3px solid #fff;border-radius:50%;box-shadow:0 0 6px rgba(66,133,244,0.6)"></div>',
  className: '',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function FitBounds({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  useMemo(() => {
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 18 });
  }, [map, bounds]);
  return null;
}

interface LeafletMapProps extends Props {
  onObserve?: (tree: TreeData) => void;
}

export default function LeafletMap({ project, allTrees, filteredTrees, speciesColorMap, onObserve }: LeafletMapProps) {
  const center = useMemo(
    () => computeCenter(project, allTrees),
    [project, allTrees]
  );

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [navigatingTo, setNavigatingTo] = useState<TreeData | null>(null);
  const [locating, setLocating] = useState(false);

  const startNavigation = useCallback((tree: TreeData) => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setNavigatingTo(tree);
        setLocating(false);
      },
      () => {
        alert('Não foi possível obter sua localização. Verifique as permissões do navegador.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const stopNavigation = useCallback(() => {
    setNavigatingTo(null);
    setUserLocation(null);
  }, []);

  const navDistance = useMemo(() => {
    if (!userLocation || !navigatingTo) return null;
    return haversineDistance(userLocation[0], userLocation[1], navigatingTo.lat, navigatingTo.lng);
  }, [userLocation, navigatingTo]);

  const navBounds = useMemo(() => {
    if (!userLocation || !navigatingTo) return null;
    return L.latLngBounds(
      L.latLng(userLocation[0], userLocation[1]),
      L.latLng(navigatingTo.lat, navigatingTo.lng)
    );
  }, [userLocation, navigatingTo]);

  return (
    <>
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
        {navBounds && <FitBounds bounds={navBounds} />}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup><span className="text-sm font-medium">Você está aqui</span></Popup>
          </Marker>
        )}
        {navigatingTo && userLocation && (
          <Polyline
            positions={[userLocation, [navigatingTo.lat, navigatingTo.lng]]}
            pathOptions={{ color: '#4285F4', weight: 3, dashArray: '8 8' }}
          />
        )}
        {filteredTrees.map((tree) => {
          const color = speciesColorMap.get(tree.species.id) || '#888';
          const isTarget = navigatingTo?.id === tree.id;
          return (
            <CircleMarker
              key={tree.id}
              center={[tree.lat, tree.lng]}
              radius={isTarget ? 12 : 8}
              pathOptions={{
                fillColor: isTarget ? '#4285F4' : color,
                color: isTarget ? '#F4B400' : '#fff',
                weight: isTarget ? 3 : 2,
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
                  <div className="flex flex-col gap-1 mt-2">
                    <a
                      href={`/arvore/${tree.qr_slug}`}
                      className="text-verde-medio font-semibold text-sm hover:underline"
                    >
                      Ver ficha →
                    </a>
                    <button
                      onClick={() => startNavigation(tree)}
                      disabled={locating}
                      className="text-left text-blue-600 font-medium text-sm hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {locating ? 'Localizando...' : '📍 Como chegar'}
                    </button>
                    {onObserve && (
                      <button
                        onClick={() => onObserve(tree)}
                        className="text-left text-terracota font-medium text-sm hover:underline cursor-pointer"
                      >
                        📝 Relatar observação
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Navigation overlay */}
      {navigatingTo && navDistance !== null && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-white rounded-xl shadow-lg border border-areia p-4 flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-verde-cerrado truncate">{navigatingTo.species.common_name}</p>
            <p className="text-sm text-gray-500">
              {navDistance < 1000
                ? `${Math.round(navDistance)} m de distância`
                : `${(navDistance / 1000).toFixed(1)} km de distância`}
            </p>
          </div>
          <button
            onClick={stopNavigation}
            className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}
    </>
  );
}
