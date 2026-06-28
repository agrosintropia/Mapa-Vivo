'use client';

import { useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  boundary: unknown;
  subAreas: { name: string; boundary: unknown }[];
}

const SUB_AREA_COLORS = ['#E67E22', '#8E44AD', '#2980B9', '#27AE60', '#C0392B', '#F39C12'];

function FitToData({ boundary }: { boundary: unknown }) {
  const map = useMap();
  useMemo(() => {
    try {
      const layer = L.geoJSON(boundary as GeoJSON.GeoJsonObject);
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    } catch { /* ignore */ }
  }, [map, boundary]);
  return null;
}

export default function ProjectMapPreview({ boundary, subAreas }: Props) {
  const center = useMemo((): [number, number] => {
    try {
      const layer = L.geoJSON(boundary as GeoJSON.GeoJsonObject);
      const c = layer.getBounds().getCenter();
      return [c.lat, c.lng];
    } catch {
      return [-16.686, -49.264];
    }
  }, [boundary]);

  return (
    <MapContainer center={center} zoom={15} className="h-full w-full" scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToData boundary={boundary} />
      <GeoJSON
        data={boundary as GeoJSON.GeoJsonObject}
        style={{ color: '#2D5F2B', weight: 3, fillColor: '#4A7C4B', fillOpacity: 0.15 }}
      />
      {subAreas.map((sa, i) => (
        <GeoJSON
          key={`${sa.name}-${i}`}
          data={sa.boundary as GeoJSON.GeoJsonObject}
          style={{
            color: SUB_AREA_COLORS[i % SUB_AREA_COLORS.length],
            weight: 2,
            fillColor: SUB_AREA_COLORS[i % SUB_AREA_COLORS.length],
            fillOpacity: 0.2,
            dashArray: '5 5',
          }}
        />
      ))}
    </MapContainer>
  );
}
