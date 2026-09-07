export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  timezone?: string;
}

export interface GeocodingResponse {
  results?: GeocodingResult[];
}

export interface CurrentWeather {
  temperature_2m: number;
  relative_humidity_2m: number;
  weather_code: number;
  wind_speed_10m: number;
  is_day: number;
}

export interface HourlyData {
  time: string[];
  temperature_2m: number[];
  weather_code: number[];
  relative_humidity_2m: number[];
  precipitation_probability: number[];
}

export interface DailyData {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
}

export interface ForecastResponse {
  current: CurrentWeather;
  hourly: HourlyData;
  daily: DailyData;
}
