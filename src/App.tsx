import { useState, useEffect, useRef, useCallback } from 'react';
import type { GeocodingResult, ForecastResponse } from './types';
import { searchCities, getForecast, reverseGeocode } from './api';
import {
  getWeatherInfo,
  getWeatherCategory,
  type WeatherCategory,
} from './weatherCodes';
import { useLang, LANG_META, LANG_ORDER } from './i18n';
import { Flag } from './Flag';
import './index.css';
import './weather.css';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getBackgroundClass(category: WeatherCategory, isDay: boolean): string {
  if (!isDay) {
    switch (category) {
      case 'clear':
        return 'weather-bg-night-clear';
      case 'partly_cloudy':
        return 'weather-bg-night-cloudy';
      default:
        return 'weather-bg-night';
    }
  }
  switch (category) {
    case 'clear':
      return 'weather-bg-clear';
    case 'partly_cloudy':
      return 'weather-bg-partly-cloudy';
    case 'cloudy':
      return 'weather-bg-cloudy';
    case 'fog':
      return 'weather-bg-fog';
    case 'drizzle':
      return 'weather-bg-drizzle';
    case 'rain':
    case 'freezing_rain':
    case 'showers':
      return 'weather-bg-rain';
    case 'snow':
      return 'weather-bg-snow';
    case 'storm':
      return 'weather-bg-storm';
    default:
      return 'weather-bg-clear';
  }
}

/* ------------------------------------------------------------------ */
/*  Types (local)                                                      */
/* ------------------------------------------------------------------ */

export type Unit = 'c' | 'f';

export type TempFormatter = (celsius: number) => number;

/* ------------------------------------------------------------------ */
/*  Current Weather                                                    */
/* ------------------------------------------------------------------ */

interface CurrentWeatherProps {
  temp: number;
  humidity: number;
  wind: number;
  code: number;
  isDay: boolean;
  cityName: string;
  geoNote?: string | null;
  fmtTemp: TempFormatter;
}

function CurrentWeather({
  temp,
  humidity,
  wind,
  code,
  isDay,
  cityName,
  geoNote,
  fmtTemp,
}: CurrentWeatherProps) {
  const { t, locale, translateCondition } = useLang();
  const info = getWeatherInfo(code, isDay);
  const todayLabel = new Date().toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return (
    <section className="current-weather">
      <div className="current-header">
        <div className="current-heading">
          <h2 className="city-name">{cityName}</h2>
          {geoNote && <span className="geo-note">{geoNote}</span>}
          <span className="current-date">{todayLabel}</span>
        </div>
        <span className="weather-icon-large">{info.icon}</span>
      </div>
      <div className="current-main">
        <span className="temperature-large">{fmtTemp(temp)}°</span>
        <span className="condition-text">
          {translateCondition(info.description)}
        </span>
      </div>
      <div className="current-details">
        <div className="detail-item">
          <span className="detail-label">{t('wind')}</span>
          <span className="detail-value">{Math.round(wind)} km/h</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">{t('humidity')}</span>
          <span className="detail-value">{humidity}%</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">{t('code')}</span>
          <span className="detail-value">{code}</span>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Hourly Forecast                                                    */
/* ------------------------------------------------------------------ */

interface HourlyForecastProps {
  times: string[];
  temps: number[];
  codes: number[];
  precipProb: number[];
  fmtTemp: TempFormatter;
}

function HourlyForecast({
  times,
  temps,
  codes,
  precipProb,
  fmtTemp,
}: HourlyForecastProps) {
  const { t, locale } = useLang();
  return (
    <section className="hourly-forecast">
      <h3 className="section-title">{t('hourly')}</h3>
      <div className="hourly-scroll">
        {times.map((time, i) => {
          const date = new Date(time);
          const hour = date.toLocaleTimeString(locale, {
            hour: '2-digit',
            minute: '2-digit',
          });
          const info = getWeatherInfo(codes[i]);
          const precip = precipProb[i] ?? 0;
          return (
            <div key={time} className="hourly-item">
              <span className="hourly-time">{hour}</span>
              <span className="hourly-icon">{info.icon}</span>
              <span className="hourly-temp">{fmtTemp(temps[i])}°</span>
              {precip > 0 && (
                <span className="hourly-precip">{precip}%</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Daily Forecast                                                     */
/* ------------------------------------------------------------------ */

interface DailyForecastProps {
  daily: ForecastResponse['daily'];
  fmtTemp: TempFormatter;
}

function DailyForecast({ daily, fmtTemp }: DailyForecastProps) {
  const { t, locale, translateCondition } = useLang();
  return (
    <section className="daily-forecast">
      <h3 className="section-title">{t('daily')}</h3>
      {daily.time.map((date, i) => {
        const d = new Date(`${date}T12:00:00`);
        const dayName = d.toLocaleDateString(locale, { weekday: 'short' });
        const dayDate = d.toLocaleDateString(locale, {
          day: 'numeric',
          month: 'short',
        });
        const info = getWeatherInfo(daily.weather_code[i]);
        return (
          <div key={date} className="daily-item">
            <span className="daily-day">
              <span className="daily-dayname">{dayName}</span>
              <span className="daily-date">{dayDate}</span>
            </span>
            <span className="daily-icon">{info.icon}</span>
            <span className="daily-condition">
              {translateCondition(info.description)}
            </span>
            <span className="daily-temps">
              <span className="daily-max">
                {fmtTemp(daily.temperature_2m_max[i])}°
              </span>
              <span className="daily-min">
                {fmtTemp(daily.temperature_2m_min[i])}°
              </span>
            </span>
          </div>
        );
      })}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  App                                                                */
/* ------------------------------------------------------------------ */

export default function App() {
  const { t, lang, setLang } = useLang();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cityName, setCityName] = useState('');
  const [geoAccuracy, setGeoAccuracy] = useState<number | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [darkTheme, setDarkTheme] = useState<boolean>(
    () => localStorage.getItem('weather-theme') === 'dark',
  );
  const [unit, setUnit] = useState<Unit>(() =>
    localStorage.getItem('weather-unit') === 'f' ? 'f' : 'c',
  );

  const searchRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // --- Persist theme choice ---
  useEffect(() => {
    localStorage.setItem('weather-theme', darkTheme ? 'dark' : 'light');
  }, [darkTheme]);

  // --- Persist unit choice ---
  useEffect(() => {
    localStorage.setItem('weather-unit', unit);
  }, [unit]);

  // --- Temperature formatter ---
  const fmtTemp: TempFormatter = (celsius) =>
    unit === 'c' ? Math.round(celsius) : Math.round((celsius * 9) / 5 + 32);

  // --- Debounced geocoding search ---
  useEffect(() => {
    if (debounceRef.current !== undefined) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchCities(query);
        setSuggestions(data.results ?? []);
        setShowDropdown(true);
        setError(null);
      } catch {
        setSuggestions([]);
        setShowDropdown(false);
        setError(t('errorSearch'));
      }
    }, 400);

    return () => {
      if (debounceRef.current !== undefined) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // --- Click outside to close dropdown ---
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Click outside to close language menu ---
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        langMenuRef.current &&
        !langMenuRef.current.contains(e.target as Node)
      ) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Fetch forecast ---
  const fetchForecast = useCallback(
    async (lat: number, lon: number, name: string) => {
      setLoading(true);
      setError(null);
      setShowDropdown(false);
      try {
        const data = await getForecast(lat, lon);
        setForecast(data);
        setCityName(name);
      } catch {
        setError(t('errorFetch'));
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  // --- Select a city from autocomplete ---
  const handleSelectCity = (city: GeocodingResult) => {
    const label = city.admin1
      ? `${city.name}, ${city.admin1}, ${city.country}`
      : `${city.name}, ${city.country}`;
    setQuery(city.name);
    setGeoAccuracy(null);
    setShowDropdown(false);
    fetchForecast(city.latitude, city.longitude, label);
  };

  // --- Geolocation button ---
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setError(t('errorGeo'));
      return;
    }
    setGeoLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setGeoAccuracy(pos.coords.accuracy);
        try {
          const place = await reverseGeocode(
            pos.coords.latitude,
            pos.coords.longitude,
          );
          const label = place
            ? place.admin1
              ? `${place.name}, ${place.admin1}, ${place.country}`
              : `${place.name}, ${place.country}`
            : t('geoLabel');
          await fetchForecast(pos.coords.latitude, pos.coords.longitude, label);
        } catch {
          await fetchForecast(pos.coords.latitude, pos.coords.longitude, t('geoLabel'));
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        setGeoLoading(false);
        setGeoAccuracy(null);
        setError(t('errorGeoPerm'));
      },
    );
  };

  // --- Derived state ---
  const now = forecast ? new Date() : null;
  const startIdx =
    forecast && now
      ? Math.max(
          0,
          forecast.hourly.time.findIndex((t) => new Date(t) >= now),
        )
      : 0;
  const hourlyEnd = Math.min(startIdx + 48, forecast?.hourly.time.length ?? 0);

  const weatherCategory = forecast
    ? getWeatherCategory(forecast.current.weather_code)
    : null;
  const isDay = forecast ? forecast.current.is_day === 1 : true;

  const geoAccuracyKm =
    geoAccuracy != null && geoAccuracy > 1500
      ? Math.round(geoAccuracy / 1000)
      : null;
  const geoNote =
    geoAccuracyKm != null
      ? t('geoNote').replace('{acc}', String(geoAccuracyKm))
      : null;

  const bgClassName = weatherCategory
    ? `app ${getBackgroundClass(weatherCategory, isDay)}${darkTheme ? ' dark-mode' : ''}`
    : `app weather-bg-default${darkTheme ? ' dark-mode' : ''}`;

  return (
    <div className={bgClassName}>
      <div className="container">
        {/* Header + Search */}
        <header className="header">
          <div className="header-top">
            <h1 className="app-title">{t('title')}</h1>
            <div className="header-actions">
              {/* Language menu */}
              <div className="lang-select" ref={langMenuRef}>
                <button
                  className="lang-btn"
                  onClick={() => setLangMenuOpen((o) => !o)}
                  title={LANG_META[lang].label}
                >
                  <Flag code={LANG_META[lang].code} shape="round" />
                </button>
                {langMenuOpen && (
                  <ul className="lang-dropdown">
                    {LANG_ORDER.map((l) => (
                      <li
                        key={l}
                        className={`lang-option${l === lang ? ' active' : ''}`}
                        onClick={() => {
                          setLang(l);
                          setLangMenuOpen(false);
                        }}
                      >
                        <span className="lang-flag">
                          <Flag code={LANG_META[l].code} shape="rect" />
                        </span>
                        <span className="lang-name">{LANG_META[l].label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Unit toggle */}
              <div className="unit-toggle" role="group" aria-label="Unit">
                <button
                  className={`unit-opt${unit === 'c' ? ' active' : ''}`}
                  onClick={() => setUnit('c')}
                >
                  °C
                </button>
                <button
                  className={`unit-opt${unit === 'f' ? ' active' : ''}`}
                  onClick={() => setUnit('f')}
                >
                  °F
                </button>
              </div>

              {/* Theme toggle */}
              <button
                className="theme-btn"
                onClick={() => setDarkTheme((d) => !d)}
                title={darkTheme ? t('themeLight') : t('themeDark')}
              >
                {darkTheme ? '☀️' : '🌙'}
              </button>

              {/* Geolocation */}
              <button
                className="geo-btn"
                onClick={handleGeolocation}
                disabled={geoLoading}
                title={t('geoTitle')}
              >
                {geoLoading ? '…' : '📍'}
              </button>
            </div>
          </div>

          <div className="search-container" ref={searchRef}>
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                onFocus={() => {
                  if (suggestions.length > 0) setShowDropdown(true);
                }}
              />
            </div>
            {showDropdown && suggestions.length > 0 && (
              <ul className="suggestions-dropdown">
                {suggestions.map((city) => (
                  <li
                    key={city.id}
                    className="suggestion-item"
                    onClick={() => handleSelectCity(city)}
                  >
                    {city.name}
                    {city.admin1 ? `, ${city.admin1}` : ''}, {city.country}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </header>

        {/* Loading */}
        {loading && (
          <div className="loading">
            <div className="spinner" />
            <p>{t('loading')}</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {/* Forecast content */}
        {forecast && !loading && (
          <main>
            <CurrentWeather
              temp={forecast.current.temperature_2m}
              humidity={forecast.current.relative_humidity_2m}
              wind={forecast.current.wind_speed_10m}
              code={forecast.current.weather_code}
              isDay={isDay}
              cityName={cityName}
              geoNote={geoNote}
              fmtTemp={fmtTemp}
            />
            <HourlyForecast
              times={forecast.hourly.time.slice(startIdx, hourlyEnd)}
              temps={forecast.hourly.temperature_2m.slice(startIdx, hourlyEnd)}
              codes={forecast.hourly.weather_code.slice(startIdx, hourlyEnd)}
              precipProb={forecast.hourly.precipitation_probability.slice(
                startIdx,
                hourlyEnd,
              )}
              fmtTemp={fmtTemp}
            />
            <DailyForecast daily={forecast.daily} fmtTemp={fmtTemp} />
          </main>
        )}

        {/* Welcome / empty state */}
        {!forecast && !loading && !error && (
          <div className="welcome">
            <span className="welcome-icon">🌍</span>
            <p>{t('welcome')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
