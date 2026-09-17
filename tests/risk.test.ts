import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculateRisk,
  recommendationFromScore,
  trafficRiskFromDelayPct,
  weatherRiskFromSample,
  roadRiskFromComponents,
} from "../lib/risk.ts";
import type { RouteData, WeatherData, RoadRisk } from "../lib/types.ts";

function route(delayPct: number): RouteData {
  return {
    distanceMeters: 12000,
    currentDurationSec: 1800,
    staticDurationSec: 1200,
    trafficDelaySec: 600,
    trafficDelayPct: delayPct,
    polyline: "",
    routeDescription: "test",
    origin: { lat: 12.97, lng: 77.59 },
    destination: { lat: 12.93, lng: 77.62 },
    representativePoints: [{ lat: 12.95, lng: 77.6 }],
    originLabel: "A",
    destinationLabel: "B",
  };
}

function weather(precip: number, prob: number, code: number): WeatherData {
  return {
    samples: [{ point: { lat: 12.97, lng: 77.59 }, precipitationMm: precip, rainMm: precip, precipitationProbability: prob, weatherCode: code }],
    maxPrecipitationMm: precip,
    maxPrecipitationProbability: prob,
    worstWeatherCode: code,
  };
}

function road(pothole: number, water: number, disruption: number): RoadRisk {
  return {
    matchedAreas: [],
    potholeRisk: pothole,
    waterloggingRisk: water,
    disruptionRisk: disruption,
    overallRisk: Math.round((pothole + water + disruption) / 3),
  };
}

test("recommendation thresholds", () => {
  assert.equal(recommendationFromScore(0), "GO");
  assert.equal(recommendationFromScore(39), "GO");
  assert.equal(recommendationFromScore(40), "WAIT");
  assert.equal(recommendationFromScore(69), "WAIT");
  assert.equal(recommendationFromScore(70), "AVOID");
  assert.equal(recommendationFromScore(100), "AVOID");
});

test("traffic risk bins", () => {
  assert.equal(trafficRiskFromDelayPct(-5), 10);
  assert.equal(trafficRiskFromDelayPct(5), 10);
  assert.equal(trafficRiskFromDelayPct(20), 30);
  assert.equal(trafficRiskFromDelayPct(40), 60);
  assert.equal(trafficRiskFromDelayPct(80), 90);
});

test("weather risk scales with precipitation and probability", () => {
  assert.equal(weatherRiskFromSample({ maxPrecipitationMm: 0, maxPrecipitationProbability: 5, worstWeatherCode: 1 }), 10);
  assert.ok(weatherRiskFromSample({ maxPrecipitationMm: 0, maxPrecipitationProbability: 40, worstWeatherCode: 51 }) >= 30);
  assert.ok(weatherRiskFromSample({ maxPrecipitationMm: 5, maxPrecipitationProbability: 90, worstWeatherCode: 65 }) >= 75);
  assert.equal(weatherRiskFromSample({ maxPrecipitationMm: 15, maxPrecipitationProbability: 100, worstWeatherCode: 82 }), 90);
});

test("all low → GO", () => {
  const r = calculateRisk(route(2), weather(0, 5, 1), road(10, 10, 10));
  assert.equal(r.recommendation, "GO");
  assert.ok(r.finalScore < 40, `score ${r.finalScore} should be < 40`);
});

test("combined moderate → WAIT", () => {
  const r = calculateRisk(route(30), weather(2, 70, 61), road(50, 45, 55));
  assert.equal(r.recommendation, "WAIT");
});

test("combined severe → AVOID", () => {
  const r = calculateRisk(route(80), weather(12, 100, 95), road(80, 85, 80));
  assert.equal(r.recommendation, "AVOID");
  assert.ok(r.finalScore >= 70);
});

test("waterlogging weight increases with rain but does not create double-count", () => {
  const dry = roadRiskFromComponents({ potholeRisk: 40, waterloggingRisk: 80, disruptionRisk: 40, hasRain: false });
  const wet = roadRiskFromComponents({ potholeRisk: 40, waterloggingRisk: 80, disruptionRisk: 40, hasRain: true });
  assert.ok(wet > dry, "waterlogging should count more when raining");
  // Sanity: score never exceeds max of components
  assert.ok(wet <= 100);
  assert.ok(dry <= 100);
});

test("missing weather does not become zero risk (renormalizes)", () => {
  const r = calculateRisk(route(80), null, road(80, 80, 80));
  assert.ok(r.dataCompleteness.missing.includes("weather"));
  assert.ok(r.finalScore >= 70, `score ${r.finalScore} should still trigger AVOID`);
  assert.equal(r.recommendation, "AVOID");
  assert.equal(r.weightsUsed.weather, 0);
  assert.ok(Math.abs(r.weightsUsed.traffic + r.weightsUsed.road - 1) < 1e-9);
});

test("all-null input yields zero-weight result and GO by default", () => {
  const r = calculateRisk(null, null, null);
  assert.equal(r.finalScore, 0);
  assert.equal(r.recommendation, "GO");
  assert.deepEqual(r.dataCompleteness.missing.sort(), ["road", "traffic", "weather"]);
});

test("score is always 0-100", () => {
  for (let i = 0; i < 100; i++) {
    const r = calculateRisk(route(Math.random() * 200), weather(Math.random() * 20, Math.random() * 100, 82), road(100, 100, 100));
    assert.ok(r.finalScore >= 0 && r.finalScore <= 100);
  }
});
