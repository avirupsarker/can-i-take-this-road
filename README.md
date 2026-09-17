# Can I Take This Road?

**Google Maps tells you how to get there. We tell you whether you should go right now.**

A Bengaluru route reality-check. Enter an origin and a destination, and the app returns a **GO / WAIT / AVOID** recommendation based on live Google traffic, current weather along the route (Open-Meteo), and a local Bengaluru road-condition dataset.

## Buildathon context

Built as a time-boxed hackathon MVP for a practical Bengaluru problem: a route can be inconvenient or risky because of traffic, rain, waterlogging, and road conditions at the same time. Rather than replacing navigation, this project adds a simple decision layer that answers: **“Should I take this route right now?”**

The focus is a credible, demo-ready prototype: live traffic and weather signals are combined with clearly labelled local reference data for road conditions. It does not claim to be a scientific safety prediction or a live civic-road-data service.

## Tech stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS + Lucide icons
- Google Routes API v2 (`computeRoutes`) — server-side, TRAFFIC_AWARE
- Open-Meteo forecast API — no key required
- Local Bengaluru road-risk dataset (`data/roads.ts`)

## Local setup

```bash
npm install
```

Create `.env.local`:

```
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

Enable **Routes API** and **Geocoding API** for the key in Google Cloud Console. Do **not** commit `.env.local` — it is in `.gitignore`.

## Run

```bash
npm run dev
```

App runs at http://localhost:3000.

Production build:

```bash
npm run build
npm run start
```

Risk-engine tests:

```bash
npm test
```

## How the risk score works

Three deterministic sub-scores (0-100 each):

1. **Traffic risk** — from `(current duration - static duration) / static duration`, binned into 10 / 30 / 60 / 90.
2. **Weather risk** — from Open-Meteo precipitation, probability, and weather code, binned into 10 / 30 / 50 / 75 / 90.
3. **Road-condition risk** — matched Bengaluru areas' pothole / waterlogging / disruption values, blended (waterlogging weighted higher when it is raining, so it is emphasized but not double-counted).

Final score:

```
score = traffic × 0.40 + weather × 0.35 + road × 0.25
```

If a factor is unavailable, its weight is dropped and the remaining weights are renormalized (missing data never silently becomes zero risk).

Recommendation mapping:

| Score | Recommendation |
|-------|----------------|
| 0-39  | GO             |
| 40-69 | WAIT           |
| 70-100| AVOID          |

Weights and thresholds are product rules for this prototype, not scientific or industry-standard thresholds. They live centrally in `lib/risk.ts` and are easy to tune.

## Data sources

| Signal | Source | Nature |
|--------|--------|--------|
| Route + traffic | Google Routes v2 (`TRAFFIC_AWARE`) | Live |
| Weather along route | Open-Meteo (3 sample points) | Current model forecast |
| Road / waterlogging risk | `data/roads.ts` | Local prototype dataset, human-curated |

The road dataset is **not** a live civic feed. It reflects commonly reported Bengaluru pain-points and is clearly labelled inside the app under "How this was calculated".

## Prototype limitations

- Weather sampling uses only 3 representative points along the route.
- The road dataset covers ~12 areas; a route that avoids all of them defaults to a low baseline road risk.
- The recommendation is a decision aid, not a scientifically validated prediction.

## Security

- The Google API key is server-side only. Client code never sees it.
- All external API calls happen inside `/api/route-check`.
- `.env.local` is `.gitignore`d.
