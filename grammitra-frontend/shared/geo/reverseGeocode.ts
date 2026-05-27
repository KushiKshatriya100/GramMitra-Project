// Reverse geocoding via OpenStreetMap Nominatim — free, no API key required.
// Usage policy notes:
//   - Max 1 request/second (we rate-limit internally below).
//   - Identifying User-Agent recommended; browsers add one automatically.
//   - Results are cached in sessionStorage to minimize repeat traffic.

const CACHE_PREFIX = "gm-rev-geo:";
const ENDPOINT = "https://nominatim.openstreetmap.org/reverse";

/**
 * Detects strings that are really just a lat,lng pair stored in a free-text
 * location field. Matches things like:
 *   "22.6869, 75.8683"
 *   "22.6869,75.8683"
 *   "lat: 22.6869 lng: 75.8683"
 *   "(22.6869, 75.8683)"
 * Returns parsed coordinates or null if the string is a real place name.
 */
export const parseCoords = (
  input: string | null | undefined
): { lat: number; lng: number } | null => {
  if (!input) return null;
  const cleaned = input
    .toLowerCase()
    .replace(/[()]/g, " ")
    .replace(/lat[:\s]+|lng[:\s]+|lon[:\s]+|long[:\s]+/g, " ");
  const m = cleaned.match(
    /(-?\d{1,3}(?:\.\d+)?)\s*[,\s]\s*(-?\d{1,3}(?:\.\d+)?)/
  );
  if (!m) return null;
  const lat = parseFloat(m[1]);
  const lng = parseFloat(m[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  // Sanity-check ranges so we don't treat "100, 200" (e.g. wage,age) as coords.
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  // Refuse 0,0 (almost always a missing-value sentinel, not the Gulf of Guinea).
  if (lat === 0 && lng === 0) return null;
  return { lat, lng };
};

export interface GeocodedAddress {
  /** Best short label for a worker card ("Sector 5, Indore" / "Near MG Road") */
  label: string;
  /** Detail line shown under the label, when available */
  detail?: string;
  /** Display name from Nominatim — used as fallback */
  raw: string;
}

const cacheKey = (lat: number, lng: number) =>
  `${CACHE_PREFIX}${lat.toFixed(4)},${lng.toFixed(4)}`;

const readCache = (key: string): GeocodedAddress | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as GeocodedAddress) : null;
  } catch {
    return null;
  }
};

const writeCache = (key: string, value: GeocodedAddress) => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // sessionStorage full or unavailable — non-fatal
  }
};

// Naive throttle: ensure ~1.1s between outgoing Nominatim requests across the
// app so we don't trip their rate limit when the page mounts multiple
// resolvers at once.
let nextSlot = 0;
const throttle = async () => {
  const now = Date.now();
  const wait = Math.max(0, nextSlot - now);
  nextSlot = Math.max(now, nextSlot) + 1100;
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
};

const buildLabel = (
  addr: Record<string, string> | undefined,
  fallback: string,
  lang: string
): GeocodedAddress => {
  if (!addr) return { label: fallback, raw: fallback };

  // Prefer the smallest meaningful place name + a broader anchor.
  const place =
    addr.suburb ||
    addr.neighbourhood ||
    addr.village ||
    addr.town ||
    addr.city_district ||
    addr.locality;

  const city =
    addr.city ||
    addr.town ||
    addr.county ||
    addr.state_district ||
    addr.state;

  const country = addr.country;

  // If we have a granular place + a broader anchor, use both.
  if (place && city && place !== city) {
    return { label: `${place}, ${city}`, detail: country, raw: fallback };
  }
  if (place) return { label: place, detail: city || country, raw: fallback };
  if (city) return { label: city, detail: country, raw: fallback };

  return { label: fallback, raw: fallback };
};

export interface ReverseGeocodeOptions {
  signal?: AbortSignal;
  lang?: string;
}

export async function reverseGeocode(
  lat: number,
  lng: number,
  opts: ReverseGeocodeOptions = {}
): Promise<GeocodedAddress | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat === 0 && lng === 0) return null;

  const key = cacheKey(lat, lng);
  const cached = readCache(key);
  if (cached) return cached;

  await throttle();
  if (opts.signal?.aborted) return null;

  const url = new URL(ENDPOINT);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", lat.toString());
  url.searchParams.set("lon", lng.toString());
  url.searchParams.set("zoom", "14");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", opts.lang === "hi" ? "hi" : "en");

  try {
    const res = await fetch(url.toString(), { signal: opts.signal });
    if (!res.ok) return null;
    const data = await res.json();
    const display = (data?.display_name as string) || "";
    const result = buildLabel(data?.address, display, opts.lang || "en");
    writeCache(key, result);
    return result;
  } catch (err) {
    // Aborts/network errors are non-fatal — the UI falls back gracefully.
    return null;
  }
}
