# Weather App

A frontend-only weather forecast app built with React, TypeScript and Vite. No backend, no API keys.

## Features

- Search any city with autocomplete
- Use your current location (with precision hint when the browser location is approximate)
- Hourly forecast (next 48 hours) and 7-day forecast
- Toggle between °C and °F
- Dark / light theme
- 7 languages: English, Español, Português, Français, Deutsch, Italiano, 日本語

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Flag SVG icons (no flag-icons CSS dependency)

## Data Sources

- [Open-Meteo](https://open-meteo.com/) — forecast and city geocoding (no API key)
- [BigDataCloud](https://www.bigdatacloud.com/) — reverse geocoding for the current-location button (no API key)

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The production bundle is emitted to `dist/`.