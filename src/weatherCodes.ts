export type WeatherCategory =
  | 'clear'
  | 'partly_cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'freezing_rain'
  | 'snow'
  | 'showers'
  | 'storm';

export interface WeatherInfo {
  description: string;
  icon: string;
  iconNight: string;
  category: WeatherCategory;
}

const wmoCodes: Record<number, WeatherInfo> = {
  0: { description: 'Clear sky', icon: '☀️', iconNight: '🌙', category: 'clear' },
  1: { description: 'Mainly clear', icon: '🌤️', iconNight: '🌙', category: 'clear' },
  2: { description: 'Partly cloudy', icon: '⛅', iconNight: '☁️', category: 'partly_cloudy' },
  3: { description: 'Overcast', icon: '☁️', iconNight: '☁️', category: 'cloudy' },
  45: { description: 'Fog', icon: '🌫️', iconNight: '🌫️', category: 'fog' },
  48: { description: 'Rime fog', icon: '🌫️', iconNight: '🌫️', category: 'fog' },
  51: { description: 'Light drizzle', icon: '🌦️', iconNight: '🌧️', category: 'drizzle' },
  53: { description: 'Moderate drizzle', icon: '🌦️', iconNight: '🌧️', category: 'drizzle' },
  55: { description: 'Dense drizzle', icon: '🌧️', iconNight: '🌧️', category: 'drizzle' },
  56: { description: 'Light freezing drizzle', icon: '🌧️', iconNight: '🌧️', category: 'freezing_rain' },
  57: { description: 'Dense freezing drizzle', icon: '🌧️', iconNight: '🌧️', category: 'freezing_rain' },
  61: { description: 'Slight rain', icon: '🌦️', iconNight: '🌧️', category: 'rain' },
  63: { description: 'Moderate rain', icon: '🌧️', iconNight: '🌧️', category: 'rain' },
  65: { description: 'Heavy rain', icon: '🌧️', iconNight: '🌧️', category: 'rain' },
  66: { description: 'Light freezing rain', icon: '🌧️', iconNight: '🌧️', category: 'freezing_rain' },
  67: { description: 'Heavy freezing rain', icon: '🌧️', iconNight: '🌧️', category: 'freezing_rain' },
  71: { description: 'Slight snow', icon: '❄️', iconNight: '❄️', category: 'snow' },
  73: { description: 'Moderate snow', icon: '❄️', iconNight: '❄️', category: 'snow' },
  75: { description: 'Heavy snow', icon: '🌨️', iconNight: '🌨️', category: 'snow' },
  77: { description: 'Snow grains', icon: '❄️', iconNight: '❄️', category: 'snow' },
  80: { description: 'Slight rain showers', icon: '🌦️', iconNight: '🌧️', category: 'showers' },
  81: { description: 'Moderate rain showers', icon: '🌧️', iconNight: '🌧️', category: 'showers' },
  82: { description: 'Violent rain showers', icon: '🌧️', iconNight: '🌧️', category: 'showers' },
  85: { description: 'Slight snow showers', icon: '🌨️', iconNight: '🌨️', category: 'snow' },
  86: { description: 'Heavy snow showers', icon: '🌨️', iconNight: '🌨️', category: 'snow' },
  95: { description: 'Thunderstorm', icon: '⛈️', iconNight: '⛈️', category: 'storm' },
  96: { description: 'Thunderstorm with hail', icon: '⛈️', iconNight: '⛈️', category: 'storm' },
  99: { description: 'Severe thunderstorm with hail', icon: '⛈️', iconNight: '⛈️', category: 'storm' },
};

export function getWeatherInfo(code: number, isDay: boolean = true): WeatherInfo {
  const info = wmoCodes[code] ?? wmoCodes[0];
  return {
    ...info,
    icon: isDay ? info.icon : info.iconNight,
  };
}

export function getWeatherCategory(code: number): WeatherCategory {
  return wmoCodes[code]?.category ?? 'clear';
}
