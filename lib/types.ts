export interface SpeciesData {
  id: string;
  common_name: string;
  scientific_name: string;
  family: string;
  strata: string;
  subclasses: string[];
  ecological_function: string | null;
}

export interface TreeData {
  id: string;
  lat: number;
  lng: number;
  status: string;
  reliability: string;
  qr_slug: string;
  dbh_cm: number | null;
  height_m: number | null;
  species: SpeciesData;
}

export interface ProjectData {
  id: string;
  name: string;
  slug: string;
  boundary: unknown;
  biome: string;
  city: string;
  state: string;
  area_hectares: number | null;
}
