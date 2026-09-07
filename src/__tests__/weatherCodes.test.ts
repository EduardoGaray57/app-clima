import { getWeatherInfo, getWeatherCategory } from '../weatherCodes';

describe('getWeatherInfo', () => {
  it('returns clear sky info for code 0 (day)', () => {
    const info = getWeatherInfo(0, true);
    expect(info.description).toBe('Clear sky');
    expect(info.icon).toBe('☀️');
    expect(info.category).toBe('clear');
  });

  it('returns night icon when isDay is false', () => {
    const info = getWeatherInfo(0, false);
    expect(info.icon).toBe('🌙');
    expect(info.description).toBe('Clear sky');
  });

  it('defaults to day icon when isDay is omitted', () => {
    const info = getWeatherInfo(2);
    expect(info.icon).toBe('⛅');
    expect(info.description).toBe('Partly cloudy');
  });

  it('returns rain info for code 63', () => {
    const info = getWeatherInfo(63);
    expect(info.description).toBe('Moderate rain');
    expect(info.icon).toBe('🌧️');
    expect(info.category).toBe('rain');
  });

  it('returns snow info for code 71', () => {
    const info = getWeatherInfo(71);
    expect(info.description).toBe('Slight snow');
    expect(info.icon).toBe('❄️');
    expect(info.category).toBe('snow');
  });

  it('returns thunderstorm info for code 95', () => {
    const info = getWeatherInfo(95);
    expect(info.description).toBe('Thunderstorm');
    expect(info.icon).toBe('⛈️');
    expect(info.category).toBe('storm');
  });

  it('falls back to clear sky for unknown code', () => {
    const info = getWeatherInfo(999);
    expect(info.description).toBe('Clear sky');
    expect(info.icon).toBe('☀️');
    expect(info.category).toBe('clear');
  });

  it('falls back to clear sky for negative code', () => {
    const info = getWeatherInfo(-5);
    expect(info.description).toBe('Clear sky');
    expect(info.category).toBe('clear');
  });
});

describe('getWeatherCategory', () => {
  it('maps sunny codes to clear', () => {
    expect(getWeatherCategory(0)).toBe('clear');
    expect(getWeatherCategory(1)).toBe('clear');
  });

  it('maps cloud codes to partly_cloudy and cloudy', () => {
    expect(getWeatherCategory(2)).toBe('partly_cloudy');
    expect(getWeatherCategory(3)).toBe('cloudy');
  });

  it('maps fog codes to fog', () => {
    expect(getWeatherCategory(45)).toBe('fog');
    expect(getWeatherCategory(48)).toBe('fog');
  });

  it('maps drizzle codes to drizzle', () => {
    expect(getWeatherCategory(51)).toBe('drizzle');
    expect(getWeatherCategory(55)).toBe('drizzle');
  });

  it('maps rain codes to rain and freezing rain', () => {
    expect(getWeatherCategory(63)).toBe('rain');
    expect(getWeatherCategory(65)).toBe('rain');
    expect(getWeatherCategory(66)).toBe('freezing_rain');
  });

  it('maps snow codes to snow', () => {
    expect(getWeatherCategory(71)).toBe('snow');
    expect(getWeatherCategory(75)).toBe('snow');
    expect(getWeatherCategory(77)).toBe('snow');
  });

  it('maps storm codes to storm', () => {
    expect(getWeatherCategory(95)).toBe('storm');
    expect(getWeatherCategory(99)).toBe('storm');
  });

  it('falls back to clear for unknown code', () => {
    expect(getWeatherCategory(123)).toBe('clear');
  });
});