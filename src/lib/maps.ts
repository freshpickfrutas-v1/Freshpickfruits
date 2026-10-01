// Google Maps helpers for delivery addresses (Places API (New), called directly from the browser).
//
// Needs VITE_GOOGLE_MAPS_API_KEY (a browser key restricted to the site's domains, with "Places API (New)" enabled).
// Without the key the address is typed by hand and can still be checked on Google Maps.

/** Deliveries are only made inside Bogotá, so the city is fixed everywhere. */
export const BOGOTA = 'Bogotá D.C.';

const KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim();
export const mapsEnabled = Boolean(KEY);

/** Rough rectangle around urban Bogotá, used to keep suggestions inside the city. */
const BOGOTA_BOX = {
  low: { latitude: 4.46, longitude: -74.24 },
  high: { latitude: 4.84, longitude: -73.99 },
};

export interface PlacePick {
  /** Street address without the city/country suffix. */
  address: string;
  lat: number;
  lng: number;
  placeId: string;
}

export interface Suggestion {
  placeId: string;
  main: string;
  secondary: string;
}

export function newSessionToken(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `s-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export async function suggestPlaces(input: string, sessionToken: string, signal?: AbortSignal): Promise<Suggestion[]> {
  if (!KEY) return [];
  const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': KEY },
    body: JSON.stringify({
      input,
      sessionToken,
      languageCode: 'es',
      regionCode: 'co',
      includedRegionCodes: ['co'],
      locationRestriction: { rectangle: BOGOTA_BOX },
    }),
  });
  if (!res.ok) throw new Error(`Google Maps respondió ${res.status}`);
  const data = await res.json();
  return (data.suggestions ?? [])
    .map((s: { placePrediction?: { placeId: string; structuredFormat?: { mainText?: { text: string }; secondaryText?: { text: string } }; text?: { text: string } } }) => s.placePrediction)
    .filter(Boolean)
    .map((p: { placeId: string; structuredFormat?: { mainText?: { text: string }; secondaryText?: { text: string } }; text?: { text: string } }) => ({
      placeId: p.placeId,
      main: p.structuredFormat?.mainText?.text ?? p.text?.text ?? '',
      secondary: p.structuredFormat?.secondaryText?.text ?? '',
    }));
}

export async function placeDetails(placeId: string, sessionToken: string): Promise<PlacePick> {
  if (!KEY) throw new Error('Google Maps no está configurado.');
  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?sessionToken=${encodeURIComponent(sessionToken)}&languageCode=es`, {
    headers: { 'X-Goog-Api-Key': KEY, 'X-Goog-FieldMask': 'formattedAddress,location' },
  });
  if (!res.ok) throw new Error(`Google Maps respondió ${res.status}`);
  const d = await res.json();
  const full: string = d.formattedAddress ?? '';
  return {
    address: full.replace(/,\s*Bogot[aá].*$/i, '').trim() || full,
    lat: d.location?.latitude,
    lng: d.location?.longitude,
    placeId,
  };
}

/** Link the delivery person can open: the exact pin when known, otherwise a search of the typed address. */
export function mapsLink(a: { lat?: number; lng?: number; placeId?: string; address?: string; complement?: string }): string {
  if (typeof a.lat === 'number' && typeof a.lng === 'number') {
    return `https://www.google.com/maps/search/?api=1&query=${a.lat},${a.lng}${a.placeId ? `&query_place_id=${encodeURIComponent(a.placeId)}` : ''}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${a.address ?? ''}, ${BOGOTA}, Colombia`)}`;
}
