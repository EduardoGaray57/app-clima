import { searchCities, reverseGeocode, getForecast } from '../api';

const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('searchCities', () => {
  it('builds correct Open-Meteo geocoding URL with encoded query and params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ results: [] }),
    });

    await searchCities('New York');

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('geocoding-api.open-meteo.com/v1/search');
    expect(calledUrl).toContain('name=New%20York');
    expect(calledUrl).toContain('count=5');
    expect(calledUrl).toContain('language=es');
    expect(calledUrl).toContain('format=json');
  });

  it('returns parsed geocoding response on success', async () => {
    const mockData = {
      results: [
        {
          id: 1,
          name: 'Buenos Aires',
          latitude: -34.6,
          longitude: -58.4,
          country: 'Argentina',
        },
      ],
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await searchCities('Buenos Aires');
    expect(result).toEqual(mockData);
  });

  it('treats response without results field as empty result set', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const result = await searchCities('xyz');
    expect(result.results).toBeUndefined();
  });

  it('throws on HTTP error with status code', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    await expect(searchCities('test')).rejects.toThrow(
      'Geocoding request failed: 500',
    );
  });

  it('propagates network error when fetch rejects', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network fail'));

    await expect(searchCities('test')).rejects.toThrow('Network fail');
  });
});

describe('reverseGeocode', () => {
  it('builds correct BigDataCloud URL with lat/lon and localityLanguage=es', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ city: 'Córdoba', countryName: 'Argentina' }),
    });

    await reverseGeocode(-31.4, -64.2);

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('api-bdc.io/data/reverse-geocode-client');
    expect(calledUrl).toContain('latitude=-31.4');
    expect(calledUrl).toContain('longitude=-64.2');
    expect(calledUrl).toContain('localityLanguage=es');
  });

  it('returns formatted ReversePlace with city, admin1, and country', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          city: 'Buenos Aires',
          principalSubdivision: 'Buenos Aires',
          countryName: 'Argentina',
        }),
    });

    const result = await reverseGeocode(-34.6, -58.4);
    expect(result).toEqual({
      name: 'Buenos Aires',
      admin1: 'Buenos Aires',
      country: 'Argentina',
    });
  });

  it('falls back to locality when city is missing', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          locality: 'Villa General Belgrano',
          countryName: 'Argentina',
        }),
    });

    const result = await reverseGeocode(-31.9, -64.5);
    expect(result).toEqual({
      name: 'Villa General Belgrano',
      country: 'Argentina',
    });
  });

  it('omits admin1 when principalSubdivision is missing', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ city: 'Montevideo', countryName: 'Uruguay' }),
    });

    const result = await reverseGeocode(-34.9, -56.2);
    expect(result).toEqual({ name: 'Montevideo', country: 'Uruguay' });
  });

  it('returns null when both city and locality are missing', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ countryName: 'Argentina' }),
    });

    const result = await reverseGeocode(0, 0);
    expect(result).toBeNull();
  });

  it('returns null when countryName is missing', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ city: 'Buenos Aires' }),
    });

    const result = await reverseGeocode(0, 0);
    expect(result).toBeNull();
  });

  it('throws on HTTP error with status code', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 403 });

    await expect(reverseGeocode(0, 0)).rejects.toThrow(
      'Reverse geocoding request failed: 403',
    );
  });

  it('propagates network error when fetch rejects', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network fail'));

    await expect(reverseGeocode(0, 0)).rejects.toThrow('Network fail');
  });
});

describe('getForecast', () => {
  it('builds correct forecast URL with lat/lon and expected parameters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ current: {}, hourly: {}, daily: {} }),
    });

    await getForecast(-34.6, -58.4);

    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('api.open-meteo.com/v1/forecast');
    expect(calledUrl).toContain('latitude=-34.6');
    expect(calledUrl).toContain('longitude=-58.4');
    expect(calledUrl).toContain('current=temperature_2m');
    expect(calledUrl).toContain('hourly=temperature_2m');
    expect(calledUrl).toContain('daily=weather_code');
    expect(calledUrl).toContain('timezone=auto');
    expect(calledUrl).toContain('forecast_days=7');
  });

  it('returns parsed forecast response on success', async () => {
    const mockData = {
      current: { temperature_2m: 25, weather_code: 0 },
      hourly: { time: [], temperature_2m: [] },
      daily: { time: [], weather_code: [] },
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await getForecast(0, 0);
    expect(result).toEqual(mockData);
  });

  it('throws on HTTP error with status code', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 429 });

    await expect(getForecast(0, 0)).rejects.toThrow(
      'Forecast request failed: 429',
    );
  });

  it('propagates network error when fetch rejects', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network fail'));

    await expect(getForecast(0, 0)).rejects.toThrow('Network fail');
  });
});