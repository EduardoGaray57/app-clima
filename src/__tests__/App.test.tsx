import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { GeocodingResponse, ForecastResponse } from '../types';
import App from '../App';
import { LangProvider } from '../i18n';

/* ------------------------------------------------------------------ */
/*  Test data                                                          */
/* ------------------------------------------------------------------ */

const mockGeocodingResponse: GeocodingResponse = {
  results: [
    {
      id: 3433955,
      name: 'Buenos Aires',
      latitude: -34.6037,
      longitude: -58.3816,
      country: 'Argentina',
      admin1: 'Buenos Aires',
    },
  ],
};

function createMockForecast(): ForecastResponse {
  const now = new Date();
  const hourlyTimes = Array.from({ length: 48 }, (_, i) => {
    const d = new Date(now);
    d.setHours(d.getHours() + i, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const dailyTimes = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  return {
    current: {
      temperature_2m: 25,
      relative_humidity_2m: 60,
      weather_code: 0,
      wind_speed_10m: 10,
      is_day: 1,
    },
    hourly: {
      time: hourlyTimes,
      temperature_2m: Array(48).fill(25),
      weather_code: Array(48).fill(0),
      relative_humidity_2m: Array(48).fill(60),
      precipitation_probability: Array(48).fill(0),
    },
    daily: {
      time: dailyTimes,
      weather_code: Array(7).fill(0),
      temperature_2m_max: Array(7).fill(30),
      temperature_2m_min: Array(7).fill(18),
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const mockFetch = vi.fn();

const ok = (data: object) => ({
  ok: true,
  json: () => Promise.resolve(data),
});

const errorRes = (status: number) => ({ ok: false, status });

function stubFetchByUrl(config: {
  geocoding?: () => Promise<object>;
  forecast?: () => Promise<object>;
}) {
  mockFetch.mockImplementation((url: string) => {
    if (url.includes('geocoding-api.open-meteo.com')) {
      return (config.geocoding ?? (() => Promise.resolve(ok({ results: [] }))))();
    }
    if (url.includes('api.open-meteo.com/v1/forecast')) {
      return (
        config.forecast ??
        (() => Promise.resolve(ok({ current: {}, hourly: {}, daily: {} })))
      )();
    }
    return Promise.resolve(ok({}));
  });
}

function renderApp() {
  return render(
    <LangProvider>
      <App />
    </LangProvider>,
  );
}

const typeSearch = async (text: string) => {
  const input = screen.getByPlaceholderText(/search/i);
  await userEvent.type(input, text, { delay: null });
  // Flush the debounce timer and pending microtasks (async fetch is mocked)
  await act(async () => {
    vi.advanceTimersByTime(500);
  });
};

const currentTemp = () => document.querySelector('.temperature-large');

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders the empty state with a search box', () => {
    stubFetchByUrl({});
    renderApp();

    expect(
      screen.getByRole('heading', { name: /weather|clima/i }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    expect(screen.getByText(/search for a city/i)).toBeInTheDocument();
  });

  it('shows dropdown suggestions after a debounced search and renders the forecast on selection', async () => {
    stubFetchByUrl({
      geocoding: () => Promise.resolve(ok(mockGeocodingResponse)),
      forecast: () => Promise.resolve(ok(createMockForecast())),
    });
    renderApp();

    await typeSearch('Buenos');

    // Debounced geocoding fired and the suggestion is rendered
    await waitFor(() => {
      expect(
        screen.getByText('Buenos Aires, Buenos Aires, Argentina'),
      ).toBeInTheDocument();
    });

    // Select the city -> forecast fetch + render
    await userEvent.click(
      screen.getByText('Buenos Aires, Buenos Aires, Argentina'),
    );

    await waitFor(() => {
      expect(currentTemp()).toHaveTextContent('25°');
    });
    expect(screen.getByText('10 km/h')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(document.querySelector('.condition-text')).toHaveTextContent(
      'Clear sky',
    );
    expect(screen.queryByText(/search for a city/i)).not.toBeInTheDocument();
  });

  it('does not show suggestions when geocoding returns no results', async () => {
    stubFetchByUrl({
      geocoding: () => Promise.resolve(ok({ results: [] })),
    });
    renderApp();

    await typeSearch('Nonexistent');

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
    expect(screen.queryByText(/Buenos Aires/)).not.toBeInTheDocument();
    expect(screen.getByText(/search for a city/i)).toBeInTheDocument();
  });

  it('clears suggestions and stays in empty state when geocoding rejects', async () => {
    stubFetchByUrl({
      geocoding: () => Promise.reject(new Error('Network error')),
    });
    renderApp();

    await typeSearch('Buenos');

    // The catch block swallows the error and clears suggestions
    expect(
      screen.queryByText('Buenos Aires, Buenos Aires, Argentina'),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/search for a city/i)).toBeInTheDocument();
  });

  it('shows an error message when the forecast fetch fails', async () => {
    stubFetchByUrl({
      geocoding: () => Promise.resolve(ok(mockGeocodingResponse)),
      forecast: () => Promise.resolve(errorRes(500)),
    });
    renderApp();

    await typeSearch('Buenos');

    await waitFor(() => {
      expect(
        screen.getByText('Buenos Aires, Buenos Aires, Argentina'),
      ).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByText('Buenos Aires, Buenos Aires, Argentina'),
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Failed to fetch forecast. Please try again./i),
      ).toBeInTheDocument();
    });
  });

  it('toggles between Celsius and Fahrenheit', async () => {
    stubFetchByUrl({});
    renderApp();

    const celsiusBtn = screen.getByText('°C');
    const fahrenheitBtn = screen.getByText('°F');

    // Defaults to Celsius
    expect(celsiusBtn).toHaveClass('active');
    expect(fahrenheitBtn).not.toHaveClass('active');
    expect(localStorage.getItem('weather-unit')).toBe('c');

    await userEvent.click(fahrenheitBtn);

    expect(fahrenheitBtn).toHaveClass('active');
    expect(celsiusBtn).not.toHaveClass('active');
    expect(localStorage.getItem('weather-unit')).toBe('f');

    await userEvent.click(celsiusBtn);

    expect(celsiusBtn).toHaveClass('active');
    expect(fahrenheitBtn).not.toHaveClass('active');
  });

  it('converts the displayed temperature when the unit changes', async () => {
    stubFetchByUrl({
      geocoding: () => Promise.resolve(ok(mockGeocodingResponse)),
      forecast: () => Promise.resolve(ok(createMockForecast())),
    });
    renderApp();

    await typeSearch('Buenos');
    await waitFor(() => {
      expect(
        screen.getByText('Buenos Aires, Buenos Aires, Argentina'),
      ).toBeInTheDocument();
    });
    await userEvent.click(
      screen.getByText('Buenos Aires, Buenos Aires, Argentina'),
    );

    // Celsius: 25
    await waitFor(() => {
      expect(currentTemp()).toHaveTextContent('25°');
    });

    // Fahrenheit: round(25 * 9/5 + 32) = 77
    await userEvent.click(screen.getByText('°F'));

    await waitFor(() => {
      expect(currentTemp()).toHaveTextContent('77°');
    });
  });

  it('toggles between light and dark theme', async () => {
    stubFetchByUrl({});
    renderApp();

    const themeBtn = screen.getByTitle(/Dark theme|Light theme/);

    // Defaults to light
    const appDiv = document.querySelector('.app');
    expect(appDiv).not.toHaveClass('dark-mode');
    expect(themeBtn).toHaveTextContent('🌙');
    expect(localStorage.getItem('weather-theme')).toBe('light');

    // Switch to dark
    await userEvent.click(themeBtn);

    expect(appDiv).toHaveClass('dark-mode');
    expect(themeBtn).toHaveTextContent('☀️');
    expect(localStorage.getItem('weather-theme')).toBe('dark');

    // Switch back to light
    await userEvent.click(themeBtn);

    expect(appDiv).not.toHaveClass('dark-mode');
    expect(themeBtn).toHaveTextContent('🌙');
  });
});