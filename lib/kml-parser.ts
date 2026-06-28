import { kml } from '@tmcw/togeojson';
import JSZip from 'jszip';

export interface ParsedGeoResult {
  geojson: GeoJSON.FeatureCollection;
  boundary: GeoJSON.Geometry | null;
  area_hectares: number | null;
}

function extractBoundary(fc: GeoJSON.FeatureCollection): GeoJSON.Geometry | null {
  for (const feature of fc.features) {
    const gt = feature.geometry?.type;
    if (gt === 'Polygon' || gt === 'MultiPolygon') {
      return feature.geometry;
    }
  }
  return null;
}

function estimateAreaHectares(geometry: GeoJSON.Geometry): number | null {
  if (geometry.type !== 'Polygon') return null;
  const coords = (geometry as GeoJSON.Polygon).coordinates[0];
  if (!coords || coords.length < 3) return null;

  // Shoelace formula on projected coordinates (rough estimate)
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371000;
  const refLat = coords[0][1];
  const cosLat = Math.cos(toRad(refLat));

  const points = coords.map(c => ({
    x: toRad(c[0]) * R * cosLat,
    y: toRad(c[1]) * R,
  }));

  let area = 0;
  for (let i = 0; i < points.length - 1; i++) {
    area += points[i].x * points[i + 1].y - points[i + 1].x * points[i].y;
  }
  area = Math.abs(area) / 2;
  return Math.round((area / 10000) * 100) / 100;
}

export async function parseKmlString(kmlString: string): Promise<ParsedGeoResult> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(kmlString, 'text/xml');
  const geojson = kml(doc) as GeoJSON.FeatureCollection;
  const boundary = extractBoundary(geojson);
  const area_hectares = boundary ? estimateAreaHectares(boundary) : null;
  return { geojson, boundary, area_hectares };
}

export async function parseKmzBuffer(buffer: ArrayBuffer): Promise<ParsedGeoResult> {
  const zip = await JSZip.loadAsync(buffer);
  let kmlContent: string | null = null;

  for (const filename of Object.keys(zip.files)) {
    if (filename.toLowerCase().endsWith('.kml')) {
      kmlContent = await zip.files[filename].async('string');
      break;
    }
  }

  if (!kmlContent) {
    throw new Error('Nenhum arquivo KML encontrado dentro do KMZ');
  }

  return parseKmlString(kmlContent);
}
