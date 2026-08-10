// Approximate coordinates for the fourteen towns PBB serves, used by the donor search to
// compute distance and honour a search radius (the Blood Chain-style "nearest donors" flow).
// Design phase: the origin is either a typed town or the browser's geolocation, and each
// donor's distance is measured from their town. When the web is wired to the API, donors
// carry their own precise coordinates and this table is only the fallback for typed towns.

export interface LatLng {
  lat: number;
  lng: number;
}

// [lat, lng] for each town in lib/nav TOWNS. Rounded to ~town-centre precision.
export const TOWN_COORDS: Record<string, LatLng> = {
  Quetta: { lat: 30.1798, lng: 66.975 },
  Pishin: { lat: 30.5837, lng: 66.9961 },
  Zhob: { lat: 31.3417, lng: 69.4497 },
  Loralai: { lat: 30.3705, lng: 68.5975 },
  Chaman: { lat: 30.921, lng: 66.4597 },
  'Muslim Bagh': { lat: 30.85, lng: 67.8 },
  'Killa Saifullah': { lat: 30.705, lng: 68.36 },
  Dukki: { lat: 30.155, lng: 68.575 },
  Musakhel: { lat: 30.87, lng: 69.82 },
  Sherani: { lat: 31.75, lng: 69.8 },
  Harnai: { lat: 30.1, lng: 67.938 },
  Ziarat: { lat: 30.382, lng: 67.726 },
  'Qila Abdullah': { lat: 30.706, lng: 66.652 },
  Sibi: { lat: 29.543, lng: 67.877 },
};

const EARTH_RADIUS_KM = 6371;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance between two points, in kilometres (haversine). */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Resolve a free-text "city / area" to a search origin by matching it against the known
 * towns (case-insensitive, substring either way). Returns null when nothing matches — the
 * caller then falls back to the browser's geolocation, or shows every match without distance.
 */
export function resolveTownOrigin(cityText: string): { town: string; at: LatLng } | null {
  const q = cityText.trim().toLowerCase();
  if (!q) return null;
  for (const [town, at] of Object.entries(TOWN_COORDS)) {
    const t = town.toLowerCase();
    if (t === q || t.includes(q) || q.includes(t)) return { town, at };
  }
  return null;
}
