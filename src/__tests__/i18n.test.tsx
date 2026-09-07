import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LangProvider, useLang, LANG_ORDER } from '../i18n';

function TestConsumer() {
  const { lang, setLang, t, translateCondition } = useLang();
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="title">{t('title')}</span>
      <span data-testid="geoNote">{t('geoNote')}</span>
      <span data-testid="welcome">{t('welcome')}</span>
      <span data-testid="hourly">{t('hourly')}</span>
      <span data-testid="clear">{translateCondition('Clear sky')}</span>
      <span data-testid="rain">{translateCondition('Moderate rain')}</span>
      <span data-testid="storm">{translateCondition('Thunderstorm')}</span>
      <span data-testid="snow">{translateCondition('Slight snow')}</span>
      <button data-testid="switch-es" onClick={() => setLang('es')}>
        ES
      </button>
      <button data-testid="switch-en" onClick={() => setLang('en')}>
        EN
      </button>
    </div>
  );
}

function renderConsumer() {
  return render(
    <LangProvider>
      <TestConsumer />
    </LangProvider>,
  );
}

describe('i18n', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to English when nothing is saved', () => {
    renderConsumer();
    expect(screen.getByTestId('lang')).toHaveTextContent('en');
    expect(screen.getByTestId('title')).toHaveTextContent('Weather');
  });

  it('t() returns English translations for representative keys', () => {
    renderConsumer();
    expect(screen.getByTestId('title')).toHaveTextContent('Weather');
    expect(screen.getByTestId('welcome')).toHaveTextContent(
      'Search for a city or use your current location to see the weather.',
    );
    expect(screen.getByTestId('hourly')).toHaveTextContent('Hourly Forecast');
  });

  it('geoNote keeps the {acc} placeholder for interpolation', () => {
    renderConsumer();
    expect(screen.getByTestId('geoNote')).toHaveTextContent(
      'Approximate location (±{acc} km)',
    );
  });

  it('geoNote interpolates the {acc} placeholder', () => {
    renderConsumer();
    const interpolated = (screen.getByTestId('geoNote').textContent as string)
      .replace('{acc}', '15');
    expect(interpolated).toBe('Approximate location (±15 km)');
  });

  it('switches language and updates translations', async () => {
    renderConsumer();
    expect(screen.getByTestId('title')).toHaveTextContent('Weather');

    await userEvent.click(screen.getByTestId('switch-es'));

    expect(screen.getByTestId('lang')).toHaveTextContent('es');
    expect(screen.getByTestId('title')).toHaveTextContent('Clima');
    expect(screen.getByTestId('welcome')).toHaveTextContent(
      'Buscá una ciudad o usá tu ubicación actual para ver el clima.',
    );
  });

  it('switches back to English from Spanish', async () => {
    localStorage.setItem('weather-lang', 'es');
    renderConsumer();
    expect(screen.getByTestId('title')).toHaveTextContent('Clima');

    await userEvent.click(screen.getByTestId('switch-en'));

    expect(screen.getByTestId('title')).toHaveTextContent('Weather');
  });

  it('provides all 7 language translations for a representative key', () => {
    const expectedTitles: Record<string, string> = {
      en: 'Weather',
      es: 'Clima',
      pt: 'Clima',
      fr: 'Météo',
      de: 'Wetter',
      it: 'Meteo',
      ja: '天気',
    };

    for (const lang of LANG_ORDER) {
      localStorage.setItem('weather-lang', lang);
      const { unmount } = renderConsumer();
      try {
        expect(screen.getByTestId('title').textContent).toBe(
          expectedTitles[lang],
        );
      } finally {
        unmount();
      }
    }
  });

  it('translateCondition returns translated condition per language', async () => {
    renderConsumer();
    expect(screen.getByTestId('clear')).toHaveTextContent('Clear sky');
    expect(screen.getByTestId('rain')).toHaveTextContent('Moderate rain');
    expect(screen.getByTestId('storm')).toHaveTextContent('Thunderstorm');
    expect(screen.getByTestId('snow')).toHaveTextContent('Slight snow');

    await userEvent.click(screen.getByTestId('switch-es'));

    expect(screen.getByTestId('clear')).toHaveTextContent('Cielo despejado');
    expect(screen.getByTestId('rain')).toHaveTextContent('Lluvia moderada');
    expect(screen.getByTestId('storm')).toHaveTextContent('Tormenta');
    expect(screen.getByTestId('snow')).toHaveTextContent('Nevada ligera');
  });

  it('persists selected language to localStorage', async () => {
    renderConsumer();
    await userEvent.click(screen.getByTestId('switch-es'));
    expect(localStorage.getItem('weather-lang')).toBe('es');
  });
});