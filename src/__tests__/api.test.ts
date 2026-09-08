import {
  searchCities,
  reverseGeocode,
  getForecast,
  isValidForecast,
  clearGeocodingCache,
} from '../api';

const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockReset();
  clearGeocodingCache();
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

/* ------------------------------------------------------------------ */
/*  Valid forecast fixture (passes isValidForecast)                    */
/* ------------------------------------------------------------------ */

const validForecastData = {
  current: {
    temperature_2m: 25,
    relative_humidity_2m: 60,
    weather_code: 0,
    wind_speed_10m: 10,
    is_day: 1,
  },
  hourly: {
    time: ['2024-01-01T00:00'],
    temperature_2m: [25],
    weather_code: [0],
    relative_humidity_2m: [60],
    precipitation_probability: [0],
  },
  daily: {
    time: ['2024-01-01'],
    weather_code: [0],
    temperature_2m_max: [30],
    temperature_2m_min: [18],
  },
};

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

describe('searchCities geocoding cache', () => {
  it('calls fetch only once for repeated identical queries and returns the same promise', async () => {
    const mockData = { results: [] };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const first = searchCities('buenos aires');
    const second = searchCities('Buenos Aires'); // normalized same key, case differs

    // The identical query reuses the same underlying in-flight promise.
    expect(first).toBe(second);

    const [r1, r2] = await Promise.all([first, second]);
    expect(r1).toEqual(mockData);
    expect(r2).toEqual(mockData);
    // Both calls reused a single network request.
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('reuses the cached promise across two separate awaits after a success', async () => {
    const mockData = { results: [{ id: 1, name: 'Madrid' }] };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const first = await searchCities(' madrid '); // trailing spaces normalized
    const second = await searchCities('madrid');

    expect(first).toEqual(mockData);
    expect(second).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('does not cache errors, so a retry hits the network again', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network fail'));
    await expect(searchCities('berlin')).rejects.toThrow('Network fail');

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ results: [] }),
    });
    await expect(searchCities('berlin')).resolves.toEqual({ results: [] });

    expect(mockFetch).toHaveBeenCalledTimes(2);
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

  it('prefers locality over city when both are present', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          city: 'Córdoba',
          locality: 'Villa General Belgrano',
          principalSubdivision: 'Córdoba',
          countryName: 'Argentina',
        }),
    });

    const result = await reverseGeocode(-31.9, -64.5);
    expect(result).toEqual({
      name: 'Villa General Belgrano',
      admin1: 'Córdoba',
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
      json: () => Promise.resolve(validForecastData),
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
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(validForecastData),
    });

    const result = await getForecast(0, 0);
    expect(result).toEqual(validForecastData);
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

  it('rejects when fetch resolves ok with malformed JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await expect(getForecast(0, 0)).rejects.toThrow(
      'Malformed forecast response',
    );
  });
});

describe('isValidForecast', () => {
  it('returns true for a valid ForecastResponse', () => {
    expect(isValidForecast(validForecastData)).toBe(true);
  });

  it('returns false for null / non-object', () => {
    expect(isValidForecast(null)).toBe(false);
    expect(isValidForecast(undefined)).toBe(false);
    expect(isValidForecast(42)).toBe(false);
    expect(isValidForecast('string')).toBe(false);
    expect(isValidForecast(true)).toBe(false);
  });

  it('returns false when current is missing a required field', () => {
    const data = {
      current: { temperature_2m: 25, weather_code: 0 },
      hourly: {
        time: ['2024-01-01T00:00'],
        temperature_2m: [25],
        weather_code: [0],
        relative_humidity_2m: [60],
        precipitation_probability: [0],
      },
      daily: {
        time: ['2024-01-01'],
        weather_code: [0],
        temperature_2m_max: [30],
        temperature_2m_min: [18],
      },
    };
    expect(isValidForecast(data)).toBe(false);
  });

  it('returns false when hourly.time is missing or not an array', () => {
    const noTime = {
      current: validForecastData.current,
      hourly: {
        temperature_2m: [25],
        weather_code: [0],
        relative_humidity_2m: [60],
        precipitation_probability: [0],
      },
      daily: validForecastData.daily,
    };
    expect(isValidForecast(noTime)).toBe(false);

    const stringTime = {
      current: validForecastData.current,
      hourly: {
        time: 'not-an-array',
        temperature_2m: [25],
        weather_code: [0],
        relative_humidity_2m: [60],
        precipitation_probability: [0],
      },
      daily: validForecastData.daily,
    };
    expect(isValidForecast(stringTime)).toBe(false);
  });

  it('returns false when hourly arrays have mismatched lengths', () => {
    const data = {
      current: validForecastData.current,
      hourly: {
        time: ['2024-01-01T00:00', '2024-01-01T01:00'],
        temperature_2m: [25],
        weather_code: [0],
        relative_humidity_2m: [60],
        precipitation_probability: [0],
      },
      daily: validForecastData.daily,
    };
    expect(isValidForecast(data)).toBe(false);
  });

  it('returns false when a daily array is empty', () => {
    const data = {
      current: validForecastData.current,
      hourly: validForecastData.hourly,
      daily: {
        time: [],
        weather_code: [],
        temperature_2m_max: [],
        temperature_2m_min: [],
      },
    };
    expect(isValidForecast(data)).toBe(false);
  });
});