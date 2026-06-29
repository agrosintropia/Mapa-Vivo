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

export interface TreeEventData {
  id: string;
  type: string;
  description: string | null;
  photo_url: string | null;
  author_role: string;
  created_at: string;
}

export interface TreeDetailData {
  id: string;
  lat: number;
  lng: number;
  status: string;
  reliability: string;
  qr_slug: string;
  dbh_cm: number | null;
  height_m: number | null;
  photo_url: string | null;
  photo_url_2: string | null;
  photo_url_3: string | null;
  planted_date: string | null;
  created_at: string;
  species: SpeciesData & {
    description: string | null;
    fruiting_season: string | null;
    fauna_attracted: string | null;
  };
  project: {
    name: string;
    slug: string;
    city: string;
    state: string;
    biome: string;
  };
  events: TreeEventData[];
}
