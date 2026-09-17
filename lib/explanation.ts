import type { RouteData, WeatherData, RoadRisk, RiskResult } from "./types";
import { weatherDescription } from "./weather";
import { riskLabel } from "./risk";

export function buildExplanation(
  route: RouteData,
  weather: WeatherData | null,
  road: RoadRisk,
  risk: RiskResult
): string[] {
  const lines: string[] = [];
  const { breakdown, dataCompleteness } = risk;

  const trafficMinutes = Math.round(route.trafficDelaySec / 60);
  if (breakdown.trafficRisk >= 60) {
    lines.push(
      `Traffic is currently the biggest risk on this route, adding roughly ${trafficMinutes} minute${trafficMinutes === 1 ? "" : "s"} vs. a normal run.`
    );
  } else if (breakdown.trafficRisk >= 30) {
    lines.push(
      `Traffic is heavier than usual — about ${trafficMinutes} extra minute${trafficMinutes === 1 ? "" : "s"} on this route.`
    );
  } else if (dataCompleteness.traffic) {
    lines.push("Traffic is flowing close to a typical run right now.");
  }

  if (weather && dataCompleteness.weather) {
    if (breakdown.weatherRisk >= 75) {
      lines.push(
        `Rain conditions are unfavorable — ${weatherDescription(weather.worstWeatherCode).toLowerCase()} along parts of the route (up to ${weather.maxPrecipitationMm.toFixed(1)} mm/hr).`
      );
    } else if (breakdown.weatherRisk >= 30) {
      lines.push(
        `Some rain is likely along the route (${weather.maxPrecipitationProbability}% chance, up to ${weather.maxPrecipitationMm.toFixed(1)} mm/hr).`
      );
    } else {
      lines.push("Weather is clear enough not to slow you down.");
    }
  }

  if (breakdown.roadRisk >= 60) {
    const names = road.matchedAreas.slice(0, 2).map((a) => a.name).join(" and ");
    lines.push(
      `Road-condition risk is elevated${names ? ` around ${names}` : ""}. Historic pothole and disruption trouble on this corridor.`
    );
  }

  if (breakdown.waterloggingRisk >= 60 && (!weather || breakdown.weatherRisk >= 30)) {
    const wet = road.matchedAreas
      .filter((a) => a.waterloggingRisk >= 60)
      .slice(0, 2)
      .map((a) => a.name)
      .join(" and ");
    lines.push(
      `Waterlogging risk is elevated${wet ? ` around ${wet}` : ""} — expect standing water if it has been raining.`
    );
  }

  if (
    breakdown.trafficRisk >= 60 &&
    breakdown.weatherRisk >= 50 &&
    breakdown.roadRisk >= 50
  ) {
    lines.push("Traffic, rain, and road-condition risks are all elevated at the same time.");
  }

  if (dataCompleteness.missing.length > 0) {
    lines.push(
      `Heads up: ${dataCompleteness.missing.join(", ")} data wasn't available, so this score is based on what we could actually check.`
    );
  }

  if (lines.length === 0) {
    lines.push(
      `Overall risk is ${riskLabel(risk.finalScore).toLowerCase()} across traffic, weather, and known road conditions.`
    );
  }

  return lines;
}
