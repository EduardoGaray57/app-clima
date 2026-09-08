import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { FlagCode } from './Flag';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type Lang = 'en' | 'es' | 'pt' | 'fr' | 'de' | 'it' | 'ja';

export const LANG_ORDER: Lang[] = ['en', 'es', 'pt', 'fr', 'de', 'it', 'ja'];

export const LANG_META: Record<Lang, { label: string; code: FlagCode }> = {
  en: { label: 'English', code: 'gb' },
  es: { label: 'Español', code: 'es' },
  pt: { label: 'Português', code: 'br' },
  fr: { label: 'Français', code: 'fr' },
  de: { label: 'Deutsch', code: 'de' },
  it: { label: 'Italiano', code: 'it' },
  ja: { label: '日本語', code: 'jp' },
};

export type UIKey = keyof typeof ui.en;

/* ------------------------------------------------------------------ */
/*  UI strings                                                         */
/* ------------------------------------------------------------------ */

const ui = {
  en: {
    title: 'Weather',
    searchPlaceholder: 'Search city...',
    geoTitle: 'Use current location',
    geoLabel: 'Current Location',
    geoNote: 'Approximate location (±{acc} km)',
    loading: 'Loading forecast…',
    errorFetch: 'Failed to fetch forecast. Please try again.',
    errorGeo: 'Geolocation is not supported by your browser.',
    errorGeoPerm:
      'Unable to retrieve your location. Please allow location access.',
    errorSearch: 'Search failed. Please try again.',
    hourly: 'Hourly Forecast',
    daily: '7-Day Forecast',
    wind: 'Wind',
    humidity: 'Humidity',
    code: 'Code',
    welcome:
      'Search for a city or use your current location to see the weather.',
    themeDark: 'Dark theme',
    themeLight: 'Light theme',
  },
  es: {
    title: 'Clima',
    searchPlaceholder: 'Buscar ciudad...',
    geoTitle: 'Usar ubicación actual',
    geoLabel: 'Ubicación actual',
    geoNote: 'Ubicación aproximada (±{acc} km)',
    loading: 'Cargando pronóstico…',
    errorFetch: 'No se pudo cargar el pronóstico. Intentá de nuevo.',
    errorGeo: 'Tu navegador no soporta geolocalización.',
    errorGeoPerm:
      'No se pudo obtener tu ubicación. Permití el acceso a la ubicación.',
    errorSearch: 'No se pudo buscar. Intentá de nuevo.',
    hourly: 'Pronóstico por hora',
    daily: 'Pronóstico a 7 días',
    wind: 'Viento',
    humidity: 'Humedad',
    code: 'Código',
    welcome: 'Buscá una ciudad o usá tu ubicación actual para ver el clima.',
    themeDark: 'Modo oscuro',
    themeLight: 'Modo claro',
  },
  pt: {
    title: 'Clima',
    searchPlaceholder: 'Buscar cidade...',
    geoTitle: 'Usar localização atual',
    geoLabel: 'Localização atual',
    geoNote: 'Localização aproximada (±{acc} km)',
    loading: 'Carregando previsão…',
    errorFetch: 'Não foi possível carregar a previsão. Tente novamente.',
    errorGeo: 'Seu navegador não suporta geolocalização.',
    errorGeoPerm:
      'Não foi possível obter sua localização. Permita o acesso à localização.',
    errorSearch: 'Não foi possível buscar. Tente novamente.',
    hourly: 'Previsão por hora',
    daily: 'Previsão de 7 dias',
    wind: 'Vento',
    humidity: 'Umidade',
    code: 'Código',
    welcome:
      'Busque uma cidade ou use sua localização atual para ver o clima.',
    themeDark: 'Modo escuro',
    themeLight: 'Modo claro',
  },
  fr: {
    title: 'Météo',
    searchPlaceholder: 'Rechercher une ville...',
    geoTitle: 'Utiliser ma position',
    geoLabel: 'Position actuelle',
    geoNote: 'Localisation approximative (±{acc} km)',
    loading: 'Chargement des prévisions…',
    errorFetch: 'Impossible de charger les prévisions. Réessayez.',
    errorGeo: 'Votre navigateur ne prend pas en charge la géolocalisation.',
    errorGeoPerm:
      "Impossible d'obtenir votre position. Autorisez l'accès à la localisation.",
    errorSearch: 'Recherche impossible. Réessayez.',
    hourly: 'Prévisions horaires',
    daily: 'Prévisions sur 7 jours',
    wind: 'Vent',
    humidity: 'Humidité',
    code: 'Code',
    welcome:
      'Recherchez une ville ou utilisez votre position pour voir la météo.',
    themeDark: 'Mode sombre',
    themeLight: 'Mode clair',
  },
  de: {
    title: 'Wetter',
    searchPlaceholder: 'Stadt suchen...',
    geoTitle: 'Aktuellen Standort verwenden',
    geoLabel: 'Aktueller Standort',
    geoNote: 'Ungefährer Standort (±{acc} km)',
    loading: 'Vorhersage wird geladen…',
    errorFetch:
      'Vorhersage konnte nicht geladen werden. Bitte erneut versuchen.',
    errorGeo: 'Ihr Browser unterstützt keine Geolokalisierung.',
    errorGeoPerm:
      'Standort konnte nicht ermittelt werden. Bitte Standortzugriff erlauben.',
    errorSearch: 'Suche fehlgeschlagen. Bitte erneut versuchen.',
    hourly: 'Stündliche Vorhersage',
    daily: '7-Tage-Vorhersage',
    wind: 'Wind',
    humidity: 'Luftfeuchtigkeit',
    code: 'Code',
    welcome:
      'Suchen Sie eine Stadt oder verwenden Sie Ihren Standort, um das Wetter zu sehen.',
    themeDark: 'Dunkelmodus',
    themeLight: 'Helles Design',
  },
  it: {
    title: 'Meteo',
    searchPlaceholder: 'Cerca città...',
    geoTitle: 'Usa la posizione attuale',
    geoLabel: 'Posizione attuale',
    geoNote: 'Posizione approssimativa (±{acc} km)',
    loading: 'Caricamento previsioni…',
    errorFetch: 'Impossibile caricare le previsioni. Riprova.',
    errorGeo: 'Il tuo browser non supporta la geolocalizzazione.',
    errorGeoPerm:
      'Impossibile ottenere la tua posizione. Consenti l\'accesso alla posizione.',
    errorSearch: 'Ricerca non riuscita. Riprova.',
    hourly: 'Previsioni orarie',
    daily: 'Previsioni a 7 giorni',
    wind: 'Vento',
    humidity: 'Umidità',
    code: 'Codice',
    welcome:
      'Cerca una città o usa la tua posizione per vedere il meteo.',
    themeDark: 'Tema scuro',
    themeLight: 'Tema chiaro',
  },
  ja: {
    title: '天気',
    searchPlaceholder: '都市を検索...',
    geoTitle: '現在地を使用',
    geoLabel: '現在地',
    geoNote: 'おおよその位置（±{acc} km）',
    loading: '予報を読み込み中…',
    errorFetch: '予報を取得できませんでした。もう一度お試しください。',
    errorGeo: 'お使いのブラウザは位置情報に対応していません。',
    errorGeoPerm:
      '位置情報を取得できませんでした。位置情報へのアクセスを許可してください。',
    errorSearch: '検索できませんでした。もう一度お試しください。',
    hourly: '時間ごとの予報',
    daily: '7日間の予報',
    wind: '風',
    humidity: '湿度',
    code: 'コード',
    welcome: '都市を検索するか、現在地を利用して天気を確認してください。',
    themeDark: 'ダークテーマ',
    themeLight: 'ライトテーマ',
  },
} as const;

/* ------------------------------------------------------------------ */
/*  Weather-condition translations  (key = canonical English label)    */
/* ------------------------------------------------------------------ */

const conditions: Record<Lang, Record<string, string>> = {
  en: {
    'Clear sky': 'Clear sky',
    'Mainly clear': 'Mainly clear',
    'Partly cloudy': 'Partly cloudy',
    Overcast: 'Overcast',
    Fog: 'Fog',
    'Rime fog': 'Rime fog',
    'Light drizzle': 'Light drizzle',
    'Moderate drizzle': 'Moderate drizzle',
    'Dense drizzle': 'Dense drizzle',
    'Light freezing drizzle': 'Light freezing drizzle',
    'Dense freezing drizzle': 'Dense freezing drizzle',
    'Slight rain': 'Slight rain',
    'Moderate rain': 'Moderate rain',
    'Heavy rain': 'Heavy rain',
    'Light freezing rain': 'Light freezing rain',
    'Heavy freezing rain': 'Heavy freezing rain',
    'Slight snow': 'Slight snow',
    'Moderate snow': 'Moderate snow',
    'Heavy snow': 'Heavy snow',
    'Snow grains': 'Snow grains',
    'Slight rain showers': 'Slight rain showers',
    'Moderate rain showers': 'Moderate rain showers',
    'Violent rain showers': 'Violent rain showers',
    'Slight snow showers': 'Slight snow showers',
    'Heavy snow showers': 'Heavy snow showers',
    Thunderstorm: 'Thunderstorm',
    'Thunderstorm with hail': 'Thunderstorm with hail',
    'Severe thunderstorm with hail': 'Severe thunderstorm with hail',
  },
  es: {
    'Clear sky': 'Cielo despejado',
    'Mainly clear': 'Mayormente despejado',
    'Partly cloudy': 'Parcialmente nublado',
    Overcast: 'Nublado',
    Fog: 'Niebla',
    'Rime fog': 'Niebla engelante',
    'Light drizzle': 'Llovizna ligera',
    'Moderate drizzle': 'Llovizna moderada',
    'Dense drizzle': 'Llovizna intensa',
    'Light freezing drizzle': 'Llovizna helada ligera',
    'Dense freezing drizzle': 'Llovizna helada intensa',
    'Slight rain': 'Lluvia ligera',
    'Moderate rain': 'Lluvia moderada',
    'Heavy rain': 'Lluvia intensa',
    'Light freezing rain': 'Lluvia helada ligera',
    'Heavy freezing rain': 'Lluvia helada intensa',
    'Slight snow': 'Nevada ligera',
    'Moderate snow': 'Nevada moderada',
    'Heavy snow': 'Nevada intensa',
    'Snow grains': 'Granizo pequeño',
    'Slight rain showers': 'Chubascos ligeros',
    'Moderate rain showers': 'Chubascos moderados',
    'Violent rain showers': 'Chubascos violentos',
    'Slight snow showers': 'Chubascos de nieve ligeros',
    'Heavy snow showers': 'Chubascos de nieve intensos',
    Thunderstorm: 'Tormenta',
    'Thunderstorm with hail': 'Tormenta con granizo',
    'Severe thunderstorm with hail': 'Tormenta severa con granizo',
  },
  pt: {
    'Clear sky': 'Céu limpo',
    'Mainly clear': 'Principalmente limpo',
    'Partly cloudy': 'Parcialmente nublado',
    Overcast: 'Encoberto',
    Fog: 'Nevoeiro',
    'Rime fog': 'Nevoeiro congelante',
    'Light drizzle': 'Garoa leve',
    'Moderate drizzle': 'Garoa moderada',
    'Dense drizzle': 'Garoa intensa',
    'Light freezing drizzle': 'Garoa congelante leve',
    'Dense freezing drizzle': 'Garoa congelante intensa',
    'Slight rain': 'Chuva leve',
    'Moderate rain': 'Chuva moderada',
    'Heavy rain': 'Chuva forte',
    'Light freezing rain': 'Chuva congelante leve',
    'Heavy freezing rain': 'Chuva congelante forte',
    'Slight snow': 'Neve leve',
    'Moderate snow': 'Neve moderada',
    'Heavy snow': 'Neve forte',
    'Snow grains': 'Grãos de neve',
    'Slight rain showers': 'Pancadas leves de chuva',
    'Moderate rain showers': 'Pancadas moderadas de chuva',
    'Violent rain showers': 'Pancadas violentas de chuva',
    'Slight snow showers': 'Pancadas leves de neve',
    'Heavy snow showers': 'Pancadas fortes de neve',
    Thunderstorm: 'Tempestade',
    'Thunderstorm with hail': 'Tempestade com granizo',
    'Severe thunderstorm with hail': 'Tempestade severa com granizo',
  },
  fr: {
    'Clear sky': 'Ciel dégagé',
    'Mainly clear': 'Plutôt dégagé',
    'Partly cloudy': 'Partiellement nuageux',
    Overcast: 'Couvert',
    Fog: 'Brouillard',
    'Rime fog': 'Brouillard givrant',
    'Light drizzle': 'Bruine légère',
    'Moderate drizzle': 'Bruine modérée',
    'Dense drizzle': 'Bruine dense',
    'Light freezing drizzle': 'Bruine verglaçante légère',
    'Dense freezing drizzle': 'Bruine verglaçante dense',
    'Slight rain': 'Pluie légère',
    'Moderate rain': 'Pluie modérée',
    'Heavy rain': 'Fortes pluies',
    'Light freezing rain': 'Pluie verglaçante légère',
    'Heavy freezing rain': 'Pluie verglaçante forte',
    'Slight snow': 'Neige légère',
    'Moderate snow': 'Neige modérée',
    'Heavy snow': 'Fortes chutes de neige',
    'Snow grains': 'Grains de neige',
    'Slight rain showers': 'Averses légères',
    'Moderate rain showers': 'Averses modérées',
    'Violent rain showers': 'Averses violentes',
    'Slight snow showers': 'Averses de neige légères',
    'Heavy snow showers': 'Fortes averses de neige',
    Thunderstorm: 'Orage',
    'Thunderstorm with hail': 'Orage avec grêle',
    'Severe thunderstorm with hail': 'Orage violent avec grêle',
  },
  de: {
    'Clear sky': 'Klarer Himmel',
    'Mainly clear': 'Überwiegend klar',
    'Partly cloudy': 'Teilweise bewölkt',
    Overcast: 'Bedeckt',
    Fog: 'Nebel',
    'Rime fog': 'Raueisnebel',
    'Light drizzle': 'Leichter Nieselregen',
    'Moderate drizzle': 'Mäßiger Nieselregen',
    'Dense drizzle': 'Dichter Nieselregen',
    'Light freezing drizzle': 'Leichter gefrierender Nieselregen',
    'Dense freezing drizzle': 'Dichter gefrierender Nieselregen',
    'Slight rain': 'Leichter Regen',
    'Moderate rain': 'Mäßiger Regen',
    'Heavy rain': 'Starker Regen',
    'Light freezing rain': 'Leichter gefrierender Regen',
    'Heavy freezing rain': 'Starker gefrierender Regen',
    'Slight snow': 'Leichter Schneefall',
    'Moderate snow': 'Mäßiger Schneefall',
    'Heavy snow': 'Starker Schneefall',
    'Snow grains': 'Schneegriesel',
    'Slight rain showers': 'Leichte Regenschauer',
    'Moderate rain showers': 'Mäßige Regenschauer',
    'Violent rain showers': 'Heftige Regenschauer',
    'Slight snow showers': 'Leichte Schneeschauer',
    'Heavy snow showers': 'Starke Schneeschauer',
    Thunderstorm: 'Gewitter',
    'Thunderstorm with hail': 'Gewitter mit Hagel',
    'Severe thunderstorm with hail': 'Schweres Gewitter mit Hagel',
  },
  it: {
    'Clear sky': 'Cielo sereno',
    'Mainly clear': 'Prevalentemente sereno',
    'Partly cloudy': 'Parzialmente nuvoloso',
    Overcast: 'Coperto',
    Fog: 'Nebbia',
    'Rime fog': 'Nebbia ghiacciata',
    'Light drizzle': 'Pioviggine leggera',
    'Moderate drizzle': 'Pioviggine moderata',
    'Dense drizzle': 'Pioviggine intensa',
    'Light freezing drizzle': 'Pioviggine congelante leggera',
    'Dense freezing drizzle': 'Pioviggine congelante intensa',
    'Slight rain': 'Pioggia debole',
    'Moderate rain': 'Pioggia moderata',
    'Heavy rain': 'Pioggia forte',
    'Light freezing rain': 'Pioggia congelante leggera',
    'Heavy freezing rain': 'Pioggia congelante forte',
    'Slight snow': 'Neve debole',
    'Moderate snow': 'Neve moderata',
    'Heavy snow': 'Neve forte',
    'Snow grains': 'Granelli di neve',
    'Slight rain showers': 'Rovesci deboli',
    'Moderate rain showers': 'Rovesci moderati',
    'Violent rain showers': 'Rovesci violenti',
    'Slight snow showers': 'Rovesci di neve deboli',
    'Heavy snow showers': 'Rovesci di neve forti',
    Thunderstorm: 'Temporale',
    'Thunderstorm with hail': 'Temporale con grandine',
    'Severe thunderstorm with hail': 'Temporale severo con grandine',
  },
  ja: {
    'Clear sky': '晴れ',
    'Mainly clear': 'ほぼ晴れ',
    'Partly cloudy': '一部曇り',
    Overcast: '曇り',
    Fog: '霧',
    'Rime fog': '着氷霧',
    'Light drizzle': '弱い霧雨',
    'Moderate drizzle': '霧雨',
    'Dense drizzle': '濃い霧雨',
    'Light freezing drizzle': '弱い着氷性の霧雨',
    'Dense freezing drizzle': '濃い着氷性の霧雨',
    'Slight rain': '弱い雨',
    'Moderate rain': '雨',
    'Heavy rain': '大雨',
    'Light freezing rain': '弱い着氷性の雨',
    'Heavy freezing rain': '強い着氷性の雨',
    'Slight snow': '弱い雪',
    'Moderate snow': '雪',
    'Heavy snow': '大雪',
    'Snow grains': '雪あられ',
    'Slight rain showers': '弱いにわか雨',
    'Moderate rain showers': 'にわか雨',
    'Violent rain showers': '激しいにわか雨',
    'Slight snow showers': '弱いにわか雪',
    'Heavy snow showers': '強いにわか雪',
    Thunderstorm: '雷雨',
    'Thunderstorm with hail': 'ひょうを伴う雷雨',
    'Severe thunderstorm with hail': '激しいひょうを伴う雷雨',
  },
};

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

interface LangCtx {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: UIKey) => string;
  translateCondition: (enDesc: string) => string;
  /** Locale string for toLocaleTimeString / toLocaleDateString */
  locale: string;
}

const LangContext = createContext<LangCtx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem('weather-lang');
    return LANG_ORDER.includes(saved as Lang) ? (saved as Lang) : 'en';
  });

  useEffect(() => {
    localStorage.setItem('weather-lang', lang);
  }, [lang]);

  const toggleLang = () => {
    const idx = LANG_ORDER.indexOf(lang);
    setLang(LANG_ORDER[(idx + 1) % LANG_ORDER.length]);
  };

  const t = (key: UIKey) => ui[lang][key];

  const translateCondition = (enDesc: string) =>
    conditions[lang][enDesc] ?? enDesc;

  const locale = lang;

  return (
    <LangContext.Provider
      value={{ lang, setLang, toggleLang, t, translateCondition, locale }}
    >
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): LangCtx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}