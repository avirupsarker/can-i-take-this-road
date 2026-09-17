import type { LatLng, WeatherData, WeatherSample } from "./types";

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  current?: {
    precipitation?: number;
    rain?: number;
    weather_code?: number;
  };
  hourly?: {
    time: string[];
    precipitation?: number[];
    rain?: number[];
    precipitation_probability?: number[];
    weather_code?: number[];
  };
  error?: boolean;
  reason?: string;
}

function nearestHourIndex(times: string[], now: Date): number {
  if (!times.length) return -1;
  const nowMs = now.getTime();
  let best = 0;
  let bestDelta = Infinity;
  for (let i = 0; i < times.length; i++) {
    const t = new Date(times[i]).getTime();
    const d = Math.abs(t - nowMs);
    if (d < bestDelta) {
      bestDelta = d;
      best = i;
    }
  }
  return best;
}

async function fetchOne(point: LatLng): Promise<WeatherSample> {
  const url = new URL(OPEN_METEO_URL);
  url.searchParams.set("latitude", point.lat.toFixed(4));
  url.searchParams.set("longitude", point.lng.toFixed(4));
  url.searchParams.set("current", "precipitation,rain,weather_code");
  url.searchParams.set("hourly", "precipitation,rain,precipitation_probability,weather_code");
  url.searchParams.set("timezone", "Asia/Kolkata");
  url.searchParams.set("forecast_days", "1");
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Weather request failed (${res.status})`);
  const body = (await res.json()) as OpenMeteoResponse;
  if (body.error) throw new Error(body.reason || "Weather service error");

  const hourly = body.hourly;
  let probability = 0;
  let hourlyPrecip = 0;
  let hourlyRain = 0;
  let hourlyCode = body.current?.weather_code ?? 0;
  if (hourly && hourly.time?.length) {
    const idx = nearestHourIndex(hourly.time, new Date());
    if (idx >= 0) {
      probability = hourly.precipitation_probability?.[idx] ?? 0;
      hourlyPrecip = hourly.precipitation?.[idx] ?? 0;
      hourlyRain = hourly.rain?.[idx] ?? 0;
      hourlyCode = hourly.weather_code?.[idx] ?? hourlyCode;
    }
  }

  return {
    point,
    precipitationMm: Math.max(body.current?.precipitation ?? 0, hourlyPrecip),
    rainMm: Math.max(body.current?.rain ?? 0, hourlyRain),
    precipitationProbability: probability,
    weatherCode: Math.max(body.current?.weather_code ?? 0, hourlyCode),
  };
}

export async function fetchWeatherForPoints(points: LatLng[]): Promise<WeatherData> {
  if (points.length === 0) {
    return {
      samples: [],
      maxPrecipitationMm: 0,
      maxPrecipitationProbability: 0,
      worstWeatherCode: 0,
    };
  }
  const uniquePoints: LatLng[] = [];
  const seen = new Set<string>();
  for (const p of points) {
    const key = `${p.lat.toFixed(3)},${p.lng.toFixed(3)}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniquePoints.push(p);
    }
  }
  const chosen = uniquePoints.slice(0, 3);
  const samples = await Promise.all(chosen.map(fetchOne));
  const maxPrecipitationMm = Math.max(...samples.map((s) => s.precipitationMm), 0);
  const maxPrecipitationProbability = Math.max(...samples.map((s) => s.precipitationProbability), 0);
  const worstWeatherCode = Math.max(...samples.map((s) => s.weatherCode), 0);
  return { samples, maxPrecipitationMm, maxPrecipitationProbability, worstWeatherCode };
}

export function weatherDescription(code: number): string {
  if (code >= 95) return "Thunderstorm";
  if (code >= 82) return "Very heavy rain showers";
  if (code >= 80) return "Rain showers";
  if (code >= 71) return "Snow";
  if (code >= 65) return "Heavy rain";
  if (code >= 61) return "Rain";
  if (code >= 51) return "Drizzle";
  if (code >= 45) return "Fog";
  if (code >= 3) return "Overcast";
  if (code >= 1) return "Mostly clear";
  return "Clear";
}
