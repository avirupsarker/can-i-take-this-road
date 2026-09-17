import type { LatLng, RoadArea, RoadRisk } from "./types";
import { BENGALURU_ROAD_AREAS } from "@/data/roads";
import { haversineKm } from "./polyline";

const MATCH_PAD_KM = 0.4;

export function matchAreasToRoute(routePoints: LatLng[]): RoadArea[] {
  if (routePoints.length === 0) return [];
  const matched = new Set<string>();
  const out: RoadArea[] = [];
  for (const area of BENGALURU_ROAD_AREAS) {
    const threshold = area.radiusKm + MATCH_PAD_KM;
    for (const p of routePoints) {
      if (haversineKm(p, area.center) <= threshold) {
        if (!matched.has(area.id)) {
          matched.add(area.id);
          out.push(area);
        }
        break;
      }
    }
  }
  return out;
}

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

function aggregate(values: number[]): number {
  if (values.length === 0) return 0;
  const max = Math.max(...values);
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  // Blend max (a single bad spot matters) with average (distribution).
  return clamp(Math.round(max * 0.7 + avg * 0.3));
}

export function computeRoadRisk(routePoints: LatLng[]): RoadRisk {
  const matched = matchAreasToRoute(routePoints);
  if (matched.length === 0) {
    return {
      matchedAreas: [],
      potholeRisk: 15,
      waterloggingRisk: 15,
      disruptionRisk: 15,
      overallRisk: 15,
    };
  }
  const pothole = aggregate(matched.map((a) => a.potholeRisk));
  const water = aggregate(matched.map((a) => a.waterloggingRisk));
  const disruption = aggregate(matched.map((a) => a.disruptionRisk));
  const overall = clamp(Math.round(pothole * 0.3 + water * 0.4 + disruption * 0.3));
  return {
    matchedAreas: matched,
    potholeRisk: pothole,
    waterloggingRisk: water,
    disruptionRisk: disruption,
    overallRisk: overall,
  };
}
