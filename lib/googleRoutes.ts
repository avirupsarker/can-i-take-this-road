import type { LatLng, RouteData } from "./types";
import { decodePolyline, samplePoints } from "./polyline";

const ROUTES_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";

function requireKey(): string {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error("GOOGLE_MAPS_API_KEY is not configured on the server.");
  return key;
}

function ensureBengaluruContext(q: string): string {
  const lower = q.toLowerCase();
  if (
    lower.includes("bengaluru") ||
    lower.includes("bangalore") ||
    lower.includes("karnataka") ||
    lower.includes(", india")
  ) {
    return q;
  }
  return `${q}, Bengaluru, Karnataka, India`;
}

interface RoutesResponse {
  routes?: Array<{
    duration?: string;
    staticDuration?: string;
    distanceMeters?: number;
    polyline?: { encodedPolyline?: string };
    description?: string;
    legs?: Array<{
      startLocation?: { latLng?: { latitude?: number; longitude?: number } };
      endLocation?: { latLng?: { latitude?: number; longitude?: number } };
    }>;
  }>;
  error?: { code?: number; message?: string; status?: string };
}

function parseDurationSeconds(s: string | undefined): number {
  if (!s) return NaN;
  const m = /^(\d+(?:\.\d+)?)s$/.exec(s);
  if (!m) return NaN;
  return Number(m[1]);
}

function firstLatLng(leg?: RoutesResponse["routes"] extends Array<infer L> ? L : never): LatLng | null {
  const raw = leg?.legs?.[0]?.startLocation?.latLng;
  if (raw && typeof raw.latitude === "number" && typeof raw.longitude === "number") {
    return { lat: raw.latitude, lng: raw.longitude };
  }
  return null;
}

function lastLatLng(route?: RoutesResponse["routes"] extends Array<infer L> ? L : never): LatLng | null {
  const legs = route?.legs || [];
  const last = legs[legs.length - 1];
  const raw = last?.endLocation?.latLng;
  if (raw && typeof raw.latitude === "number" && typeof raw.longitude === "number") {
    return { lat: raw.latitude, lng: raw.longitude };
  }
  return null;
}

export async function computeRoute(originQuery: string, destinationQuery: string): Promise<RouteData> {
  const key = requireKey();
  const originText = ensureBengaluruContext(originQuery);
  const destText = ensureBengaluruContext(destinationQuery);

  const body = {
    origin: { address: originText },
    destination: { address: destText },
    travelMode: "DRIVE",
    routingPreference: "TRAFFIC_AWARE",
    computeAlternativeRoutes: false,
    languageCode: "en-IN",
    units: "METRIC",
    regionCode: "IN",
  };

  const res = await fetch(ROUTES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask":
        "routes.duration,routes.staticDuration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.description,routes.legs.startLocation,routes.legs.endLocation",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const json = (await res.json()) as RoutesResponse;
  if (!res.ok) {
    const raw = json.error?.message || `Google Routes error (${res.status})`;
    const friendly = /geocod|address|not found|invalid|unknown|resolve/i.test(raw)
      ? `Couldn't find a driving route for "${originQuery}" → "${destinationQuery}". Try a more specific place (e.g. area name + landmark).`
      : raw;
    throw new Error(friendly);
  }
  if (!json.routes || json.routes.length === 0) {
    throw new Error(`Couldn't find a driving route for "${originQuery}" → "${destinationQuery}".`);
  }
  const r = json.routes[0];
  const currentDurationSec = parseDurationSeconds(r.duration);
  const staticDurationSec = parseDurationSeconds(r.staticDuration);
  const encoded = r.polyline?.encodedPolyline || "";
  const decoded = decodePolyline(encoded);

  const startLL = firstLatLng(r) || decoded[0] || null;
  const endLL = lastLatLng(r) || decoded[decoded.length - 1] || null;
  if (!startLL || !endLL) {
    throw new Error("Google Routes returned no usable coordinates for this route.");
  }
  const representative = samplePoints(decoded.length ? decoded : [startLL, endLL], 7);

  const trafficDelaySec =
    Number.isFinite(currentDurationSec) && Number.isFinite(staticDurationSec)
      ? Math.max(0, currentDurationSec - staticDurationSec)
      : 0;
  const trafficDelayPct =
    Number.isFinite(staticDurationSec) && staticDurationSec > 0
      ? ((currentDurationSec - staticDurationSec) / staticDurationSec) * 100
      : 0;

  return {
    distanceMeters: r.distanceMeters ?? 0,
    currentDurationSec: Number.isFinite(currentDurationSec) ? currentDurationSec : 0,
    staticDurationSec: Number.isFinite(staticDurationSec) ? staticDurationSec : 0,
    trafficDelaySec,
    trafficDelayPct,
    polyline: encoded,
    routeDescription: r.description || "",
    origin: startLL,
    destination: endLL,
    representativePoints: representative,
    originLabel: originQuery,
    destinationLabel: destinationQuery,
  };
}

export const __test = { parseDurationSeconds };
