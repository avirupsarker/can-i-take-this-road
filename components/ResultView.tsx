"use client";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Car,
  CheckCircle2,
  ChevronDown,
  CloudRain,
  Construction,
  Droplets,
  Info,
  RotateCcw,
  XCircle,
} from "lucide-react";
import type { CheckRouteResponse, Recommendation } from "@/lib/types";
import { weatherDescription } from "@/lib/weather";
import { riskLabel } from "@/lib/risk";

interface Props {
  data: CheckRouteResponse;
  onReset: () => void;
}

const RECOMMENDATION_META: Record<
  Recommendation,
  { title: string; sub: string; icon: React.ReactNode; bg: string; ring: string; text: string; badge: string }
> = {
  GO: {
    title: "GO",
    sub: "Right now looks fine.",
    icon: <CheckCircle2 className="w-6 h-6" aria-hidden />,
    bg: "bg-go",
    ring: "ring-go/30",
    text: "text-white",
    badge: "bg-white/20 text-white",
  },
  WAIT: {
    title: "WAIT",
    sub: "Not great — hold off if you can.",
    icon: <AlertTriangle className="w-6 h-6" aria-hidden />,
    bg: "bg-wait",
    ring: "ring-wait/30",
    text: "text-ink",
    badge: "bg-ink/10 text-ink",
  },
  AVOID: {
    title: "AVOID",
    sub: "This route is rough right now.",
    icon: <XCircle className="w-6 h-6" aria-hidden />,
    bg: "bg-avoid",
    ring: "ring-avoid/30",
    text: "text-white",
    badge: "bg-white/20 text-white",
  },
};

function formatDuration(sec: number): string {
  if (!Number.isFinite(sec) || sec <= 0) return "—";
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem === 0 ? `${h} hr` : `${h}h ${rem}m`;
}

function formatKm(m: number): string {
  if (!Number.isFinite(m) || m <= 0) return "—";
  return `${(m / 1000).toFixed(1)} km`;
}

function FactorCard({
  icon,
  title,
  score,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  score: number;
  detail: string;
}) {
  const label = riskLabel(score);
  const color =
    label === "Low"
      ? "text-go border-go/40 bg-go/5"
      : label === "Moderate"
      ? "text-wait border-wait/40 bg-wait/5"
      : label === "High"
      ? "text-avoid border-avoid/40 bg-avoid/5"
      : "text-avoid border-avoid/60 bg-avoid/10";
  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-3.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[13px] font-medium text-ink">
          <span className="text-[color:var(--muted)]">{icon}</span>
          {title}
        </span>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${color}`}>{label}</span>
      </div>
      <p className="mt-2 text-[12px] leading-snug text-[color:var(--muted)]">{detail}</p>
    </div>
  );
}

export function ResultView({ data, onReset }: Props) {
  const [openDetails, setOpenDetails] = useState(false);
  const { route, weather, road, risk } = data;
  const meta = RECOMMENDATION_META[risk.recommendation];
  const trafficMinutes = Math.round(route.trafficDelaySec / 60);
  const rainDetail = weather && weather.samples.length
    ? `${weatherDescription(weather.worstWeatherCode)} · ${weather.maxPrecipitationProbability}% chance · up to ${weather.maxPrecipitationMm.toFixed(1)} mm/hr`
    : "Weather data unavailable";
  const roadDetail = road.matchedAreas.length
    ? `Along ${road.matchedAreas.slice(0, 2).map((a) => a.name).join(", ")}${road.matchedAreas.length > 2 ? ` +${road.matchedAreas.length - 2} more` : ""}`
    : "No high-risk areas matched on this route";
  const waterDetail = road.matchedAreas.length
    ? `${road.matchedAreas.filter((a) => a.waterloggingRisk >= 60).length} of ${road.matchedAreas.length} matched areas prone to waterlogging`
    : "No matched waterlogging hotspots";

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div className={`rounded-2xl ${meta.bg} ${meta.text} ring-8 ${meta.ring} p-5 sm:p-6 shadow-card`}>
        <div className="flex items-center justify-between gap-3">
          <span className={`text-[11px] uppercase tracking-widest ${meta.badge} px-2 py-1 rounded-full font-semibold`}>
            Recommendation
          </span>
          <span className={`text-[11px] uppercase tracking-widest ${meta.badge} px-2 py-1 rounded-full font-semibold`}>
            Route risk {risk.finalScore}/100
          </span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          {meta.icon}
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">{meta.title}</h1>
        </div>
        <p className="mt-1 text-[15px] opacity-90">{meta.sub}</p>

        <div className="mt-4 rounded-xl bg-white/15 backdrop-blur-sm p-3 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[10px] uppercase opacity-80">Now</div>
            <div className="font-display text-lg font-semibold">{formatDuration(route.currentDurationSec)}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase opacity-80">Normal</div>
            <div className="font-display text-lg font-semibold">{formatDuration(route.staticDurationSec)}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase opacity-80">Delay</div>
            <div className="font-display text-lg font-semibold">
              +{trafficMinutes} min
            </div>
          </div>
        </div>

        <p className="mt-3 text-[12px] opacity-85 truncate" title={`${route.originLabel} → ${route.destinationLabel}`}>
          {route.originLabel} → {route.destinationLabel}
        </p>
        <p className="text-[11px] opacity-70">{formatKm(route.distanceMeters)} · {route.routeDescription || "Best driving route"}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FactorCard
          icon={<Car className="w-4 h-4" aria-hidden />}
          title="Traffic"
          score={risk.breakdown.trafficRisk}
          detail={risk.dataCompleteness.traffic ? `+${trafficMinutes} min vs normal` : "Traffic data unavailable"}
        />
        <FactorCard
          icon={<CloudRain className="w-4 h-4" aria-hidden />}
          title="Weather"
          score={risk.breakdown.weatherRisk}
          detail={rainDetail}
        />
        <FactorCard
          icon={<Construction className="w-4 h-4" aria-hidden />}
          title="Road condition"
          score={risk.breakdown.roadRisk}
          detail={roadDetail}
        />
        <FactorCard
          icon={<Droplets className="w-4 h-4" aria-hidden />}
          title="Waterlogging"
          score={risk.breakdown.waterloggingRisk}
          detail={waterDetail}
        />
      </div>

      <div className="rounded-2xl bg-white border border-[var(--line)] p-4 sm:p-5 shadow-card">
        <h2 className="font-display font-semibold text-[15px] text-ink">Why?</h2>
        <ul className="mt-2 space-y-2">
          {risk.explanation.map((line, i) => (
            <li key={i} className="text-sm text-ink leading-relaxed flex gap-2">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-full bg-ink/60 shrink-0" />
              <span>{line}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setOpenDetails((v) => !v)}
          className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-[color:var(--muted)] hover:text-ink transition-colors"
        >
          <Info className="w-3.5 h-3.5" aria-hidden />
          How this was calculated
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDetails ? "rotate-180" : ""}`} aria-hidden />
        </button>

        {openDetails && (
          <div className="mt-3 rounded-xl bg-paper border border-[var(--line)] p-3 text-[12px] text-[color:var(--muted)] space-y-2">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <span>Traffic (Google Routes)</span>
              <span className="text-ink">Live</span>
              <span>Weather (Open-Meteo model)</span>
              <span className="text-ink">Current forecast</span>
              <span>Road conditions</span>
              <span className="text-ink">Prototype / local dataset</span>
            </div>
            <p>
              Final score = traffic × {(risk.weightsUsed.traffic * 100).toFixed(0)}% + weather × {(risk.weightsUsed.weather * 100).toFixed(0)}% + road × {(risk.weightsUsed.road * 100).toFixed(0)}%. Thresholds: 0-39 GO, 40-69 WAIT, 70-100 AVOID. These are product rules, not scientific thresholds.
            </p>
            {risk.dataCompleteness.missing.length > 0 && (
              <p className="text-avoid">
                Missing inputs: {risk.dataCompleteness.missing.join(", ")}. Weights renormalized across available signals.
              </p>
            )}
          </div>
        )}
      </div>

      <button
        onClick={onReset}
        className="w-full rounded-xl bg-white border border-[var(--line)] py-3 font-display font-semibold text-[15px] text-ink flex items-center justify-center gap-2 hover:border-ink transition-colors"
      >
        <RotateCcw className="w-4 h-4" aria-hidden />
        Check another route
        <ArrowRight className="w-4 h-4" aria-hidden />
      </button>
    </div>
  );
}
