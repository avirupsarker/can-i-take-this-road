import { NextResponse } from "next/server";
import { computeRoute } from "@/lib/googleRoutes";
import { fetchWeatherForPoints } from "@/lib/weather";
import { computeRoadRisk } from "@/lib/roadRisk";
import { calculateRisk } from "@/lib/risk";
import { buildExplanation } from "@/lib/explanation";
import type { CheckRouteResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  let payload: { origin?: unknown; destination?: unknown };
  try {
    payload = await req.json();
  } catch {
    return badRequest("Invalid request body.");
  }
  const origin = typeof payload.origin === "string" ? payload.origin.trim() : "";
  const destination = typeof payload.destination === "string" ? payload.destination.trim() : "";
  if (!origin) return badRequest("Please enter a starting location.");
  if (!destination) return badRequest("Please enter a destination.");
  if (origin.toLowerCase() === destination.toLowerCase()) {
    return badRequest("Origin and destination are the same.");
  }

  if (!process.env.GOOGLE_MAPS_API_KEY) {
    return NextResponse.json(
      { error: "The Google Maps API key isn't configured on the server yet." },
      { status: 503 }
    );
  }

  let route;
  try {
    route = await computeRoute(origin, destination);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Couldn't compute this route right now.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const weatherPromise = fetchWeatherForPoints(route.representativePoints).catch(() => null);
  const road = computeRoadRisk(route.representativePoints);
  const weather = await weatherPromise;

  const risk = calculateRisk(route, weather, road);
  risk.explanation = buildExplanation(route, weather, road, risk);

  const body: CheckRouteResponse = {
    route,
    weather,
    road,
    risk,
    generatedAt: new Date().toISOString(),
  };
  return NextResponse.json(body);
}
