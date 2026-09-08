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

## Security Notes

- `index.html` ships a Content-Security-Policy `<meta>` tag and a `no-referrer` referrer policy to keep the SPA sandboxed and prevent referrer leakage (coordinates travel in query strings to third-party APIs).
- The CSP permits only the three read-only weather APIs (Open-Meteo forecast + geocoding, BigDataCloud reverse geocoding) plus `ws:/wss: localhost` for Vite HMR in dev.
- `frame-ancestors` cannot be expressed in a `<meta>` tag — it only works as an HTTP response header. For production, serve the full CSP (including `frame-ancestors`) via response headers on the deploy host.
- Client-side geocoding rate is bounded with an in-memory TTL cache and request cancellation. A future proxy with an API key would be the durable fix for shared-quota anonymous APIs.