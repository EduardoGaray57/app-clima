import type { GeocodingResponse, ForecastResponse } from './types';

const GEOCODING_BASE = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_BASE = 'https://api.open-meteo.com/v1/forecast';

export async function searchCities(query: string): Promise<GeocodingResponse> {
  const url = `${GEOCODING_BASE}?name=${encodeURIComponent(query)}&count=5&language=es&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding request failed: ${res.status}`);
  return res.json();
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
  const name = data.city || data.locality;
  if (!name || !data.countryName) return null;
  return {
    name,
    admin1: data.principalSubdivision,
    country: data.countryName,
  };
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
  return res.json();
}
