export type Recommendation = "GO" | "WAIT" | "AVOID";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteData {
  distanceMeters: number;
  currentDurationSec: number;
  staticDurationSec: number;
  trafficDelaySec: number;
  trafficDelayPct: number;
  polyline: string;
  routeDescription: string;
  origin: LatLng;
  destination: LatLng;
  representativePoints: LatLng[];
  originLabel: string;
  destinationLabel: string;
}

export interface WeatherSample {
  point: LatLng;
  precipitationMm: number;
  rainMm: number;
  precipitationProbability: number;
  weatherCode: number;
}

export interface WeatherData {
  samples: WeatherSample[];
  maxPrecipitationMm: number;
  maxPrecipitationProbability: number;
  worstWeatherCode: number;
}

export interface RoadArea {
  id: string;
  name: string;
  center: LatLng;
  radiusKm: number;
  potholeRisk: number;
  waterloggingRisk: number;
  disruptionRisk: number;
  note?: string;
  lastVerified: string;
}

export interface RoadRisk {
  matchedAreas: RoadArea[];
  potholeRisk: number;
  waterloggingRisk: number;
  disruptionRisk: number;
  overallRisk: number;
}

export interface RiskBreakdown {
  trafficRisk: number;
  weatherRisk: number;
  roadRisk: number;
  waterloggingRisk: number;
}

export interface DataCompleteness {
  traffic: boolean;
  weather: boolean;
  road: boolean;
  missing: string[];
}

export interface RiskResult {
  finalScore: number;
  recommendation: Recommendation;
  breakdown: RiskBreakdown;
  weightsUsed: { traffic: number; weather: number; road: number };
  explanation: string[];
  dataCompleteness: DataCompleteness;
}

export interface CheckRouteResponse {
  route: RouteData;
  weather: WeatherData | null;
  road: RoadRisk;
  risk: RiskResult;
  generatedAt: string;
}
