import type {
  RiskBreakdown,
  RiskResult,
  Recommendation,
  DataCompleteness,
  RouteData,
  WeatherData,
  RoadRisk,
} from "./types";

export const RISK_WEIGHTS = {
  traffic: 0.4,
  weather: 0.35,
  road: 0.25,
} as const;

export const RECOMMENDATION_THRESHOLDS = {
  goMax: 39,
  waitMax: 69,
} as const;

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

export function trafficRiskFromDelayPct(delayPct: number): number {
  if (!Number.isFinite(delayPct)) return 0;
  const d = Math.max(0, delayPct);
  if (d < 10) return 10;
  if (d < 25) return 30;
  if (d < 50) return 60;
  return 90;
}

export function weatherRiskFromSample(input: {
  maxPrecipitationMm: number;
  maxPrecipitationProbability: number;
  worstWeatherCode: number;
}): number {
  const { maxPrecipitationMm, maxPrecipitationProbability, worstWeatherCode } = input;
  let score = 10;
  if (maxPrecipitationMm >= 10 || worstWeatherCode >= 82) score = 90;
  else if (maxPrecipitationMm >= 4 || worstWeatherCode >= 65) score = 75;
  else if (maxPrecipitationMm >= 1 || maxPrecipitationProbability >= 60) score = 50;
  else if (maxPrecipitationMm > 0.1 || maxPrecipitationProbability >= 30) score = 30;
  else score = 10;

  if (maxPrecipitationProbability >= 80 && score < 50) score = 50;
  return clamp(score);
}

export function roadRiskFromComponents(components: {
  potholeRisk: number;
  waterloggingRisk: number;
  disruptionRisk: number;
  hasRain?: boolean;
}): number {
  const { potholeRisk, waterloggingRisk, disruptionRisk, hasRain } = components;
  const waterWeight = hasRain ? 0.5 : 0.35;
  const remainder = 1 - waterWeight;
  const potholeWeight = remainder * 0.55;
  const disruptionWeight = remainder * 0.45;
  const score =
    waterloggingRisk * waterWeight +
    potholeRisk * potholeWeight +
    disruptionRisk * disruptionWeight;
  return clamp(Math.round(score));
}

export function recommendationFromScore(score: number): Recommendation {
  if (score <= RECOMMENDATION_THRESHOLDS.goMax) return "GO";
  if (score <= RECOMMENDATION_THRESHOLDS.waitMax) return "WAIT";
  return "AVOID";
}

export function calculateRisk(
  route: RouteData | null,
  weather: WeatherData | null,
  road: RoadRisk | null
): RiskResult {
  const missing: string[] = [];
  const trafficAvailable = !!route && Number.isFinite(route.trafficDelayPct);
  const weatherAvailable = !!weather && weather.samples.length > 0;
  const roadAvailable = !!road;

  if (!trafficAvailable) missing.push("traffic");
  if (!weatherAvailable) missing.push("weather");
  if (!roadAvailable) missing.push("road");

  const trafficRisk = trafficAvailable ? trafficRiskFromDelayPct(route!.trafficDelayPct) : 0;
  const weatherRisk = weatherAvailable
    ? weatherRiskFromSample({
        maxPrecipitationMm: weather!.maxPrecipitationMm,
        maxPrecipitationProbability: weather!.maxPrecipitationProbability,
        worstWeatherCode: weather!.worstWeatherCode,
      })
    : 0;
  const hasRain = weatherAvailable && (weather!.maxPrecipitationMm > 0.5 || weather!.maxPrecipitationProbability >= 50);
  const roadRisk = roadAvailable
    ? roadRiskFromComponents({
        potholeRisk: road!.potholeRisk,
        waterloggingRisk: road!.waterloggingRisk,
        disruptionRisk: road!.disruptionRisk,
        hasRain,
      })
    : 0;

  const rawWeights = {
    traffic: trafficAvailable ? RISK_WEIGHTS.traffic : 0,
    weather: weatherAvailable ? RISK_WEIGHTS.weather : 0,
    road: roadAvailable ? RISK_WEIGHTS.road : 0,
  };
  const weightSum = rawWeights.traffic + rawWeights.weather + rawWeights.road;
  const weightsUsed =
    weightSum > 0
      ? {
          traffic: rawWeights.traffic / weightSum,
          weather: rawWeights.weather / weightSum,
          road: rawWeights.road / weightSum,
        }
      : { traffic: 0, weather: 0, road: 0 };

  const finalScore = clamp(
    Math.round(
      trafficRisk * weightsUsed.traffic +
        weatherRisk * weightsUsed.weather +
        roadRisk * weightsUsed.road
    )
  );

  const breakdown: RiskBreakdown = {
    trafficRisk,
    weatherRisk,
    roadRisk,
    waterloggingRisk: roadAvailable ? road!.waterloggingRisk : 0,
  };

  const dataCompleteness: DataCompleteness = {
    traffic: trafficAvailable,
    weather: weatherAvailable,
    road: roadAvailable,
    missing,
  };

  const recommendation = recommendationFromScore(finalScore);

  return {
    finalScore,
    recommendation,
    breakdown,
    weightsUsed,
    explanation: [],
    dataCompleteness,
  };
}

export function riskLabel(score: number): "Low" | "Moderate" | "High" | "Severe" {
  if (score < 25) return "Low";
  if (score < 50) return "Moderate";
  if (score < 75) return "High";
  return "Severe";
}
