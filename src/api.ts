import type { GeocodingResponse, ForecastResponse } from './types';

const GEOCODING_BASE = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_BASE = 'https://api.open-meteo.com/v1/forecast';

/* ------------------------------------------------------------------ */
/*  Geocoding cache (client-side quota backstop)                        */
/* ------------------------------------------------------------------ */

const GEOCODING_TTL_MS = 10 * 60 * 1000; // ~10 minutes
const geocodingCache = new Map<
  string,
  { value: Promise<GeocodingResponse>; ts: number }
>();

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

export interface SearchOptions {
  signal?: AbortSignal;
}

/**
 * Clear the in-memory geocoding cache. Exposed primarily for tests so cached
 * state doesn't leak between test cases.
 */
export function clearGeocodingCache(): void {
  geocodingCache.clear();
}

export function searchCities(
  query: string,
  options: SearchOptions = {},
): Promise<GeocodingResponse> {
  const key = normalizeQuery(query);

  // Reuse an in-flight promise OR a still-fresh cached promise for the same
  // query instead of hitting the network again.
  const cached = geocodingCache.get(key);
  if (cached && Date.now() - cached.ts < GEOCODING_TTL_MS) {
    return cached.value;
  }

  const url = `${GEOCODING_BASE}?name=${encodeURIComponent(query)}&count=5&language=es&format=json`;

  const promise = (async () => {
    // Abort before the fetch starts if the signal is already aborted.
    if (options.signal?.aborted) {
      throw new DOMException('The operation was aborted.', 'AbortError');
    }
    const res = await fetch(url, { signal: options.signal });
    if (!res.ok) throw new Error(`Geocoding request failed: ${res.status}`);
    return res.json() as Promise<GeocodingResponse>;
  })();

  geocodingCache.set(key, { value: promise, ts: Date.now() });

  // Never cache errors — drop the entry if this request fails so callers
  // don't hit a stale rejection on the cache route. The catch chain handles
  // the rejection so it never counts as unhandled.
  promise.catch(() => {
    geocodingCache.delete(key);
  });

  return promise;
}

export interface ReversePlace {
  name: string;
  admin1?: string;
  country: string;
}

/**
 * Reverse geocoding: resolve coordinates to a nearby place name.
 * Open-Meteo Geocoding has NO reverse endpoint (its `name` param is required),
 * so we use BigDataCloud's free reverse-geocode-client (no API key, CORS enabled).
 */
export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<ReversePlace | null> {
  const url = `https://api-bdc.io/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=es`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Reverse geocoding request failed: ${res.status}`);
  const data: {
    city?: string;
    locality?: string;
    principalSubdivision?: string;
    countryName?: string;
  } = await res.json();
  const name = data.locality || data.city;
  if (!name || !data.countryName) return null;
  return {
    name,
    admin1: data.principalSubdivision,
    country: data.countryName,
  };
}

/* ------------------------------------------------------------------ */
/*  Forecast validation                                                */
/* ------------------------------------------------------------------ */

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function isNumberArray(v: unknown): v is number[] {
  return Array.isArray(v) && v.length > 0 && v.every(isFiniteNumber);
}

function isStringArray(v: unknown): v is string[] {
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    v.every((item) => typeof item === 'string')
  );
}

function hasSameLength(...arrays: unknown[][]): boolean {
  if (arrays.length === 0) return true;
  const len = (arrays[0] as unknown[]).length;
  return arrays.every((a) => Array.isArray(a) && a.length === len);
}

export function isValidForecast(data: unknown): data is ForecastResponse {
  if (data == null || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;

  // current
  if (obj.current == null || typeof obj.current !== 'object') return false;
  const cur = obj.current as Record<string, unknown>;
  if (!isFiniteNumber(cur.temperature_2m)) return false;
  if (!isFiniteNumber(cur.relative_humidity_2m)) return false;
  if (!isFiniteNumber(cur.weather_code)) return false;
  if (!isFiniteNumber(cur.wind_speed_10m)) return false;
  if (!isFiniteNumber(cur.is_day)) return false;

  // hourly
  if (obj.hourly == null || typeof obj.hourly !== 'object') return false;
  const h = obj.hourly as Record<string, unknown>;
  if (!isStringArray(h.time)) return false;
  if (!isNumberArray(h.temperature_2m)) return false;
  if (!isNumberArray(h.weather_code)) return false;
  if (!isNumberArray(h.relative_humidity_2m)) return false;
  if (!isNumberArray(h.precipitation_probability)) return false;
  if (
    !hasSameLength(
      h.time,
      h.temperature_2m,
      h.weather_code,
      h.relative_humidity_2m,
      h.precipitation_probability,
    )
  )
    return false;

  // daily
  if (obj.daily == null || typeof obj.daily !== 'object') return false;
  const d = obj.daily as Record<string, unknown>;
  if (!isStringArray(d.time)) return false;
  if (!isNumberArray(d.weather_code)) return false;
  if (!isNumberArray(d.temperature_2m_max)) return false;
  if (!isNumberArray(d.temperature_2m_min)) return false;
  if (
    !hasSameLength(d.time, d.weather_code, d.temperature_2m_max, d.temperature_2m_min)
  )
    return false;

  return true;
}

export async function getForecast(lat: number, lon: number): Promise<ForecastResponse> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day',
    hourly: 'temperature_2m,weather_code,relative_humidity_2m,precipitation_probability',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
    forecast_days: '7',
  });
  const res = await fetch(`${FORECAST_BASE}?${params}`);
  if (!res.ok) throw new Error(`Forecast request failed: ${res.status}`);
  const data: unknown = await res.json();
  if (!isValidForecast(data)) {
    throw new Error('Malformed forecast response');
  }
  return data;
}
