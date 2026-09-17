"use client";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { RouteForm } from "@/components/RouteForm";
import { ResultView } from "@/components/ResultView";
import { LoadingSteps } from "@/components/LoadingSteps";
import { AlertTriangle, RotateCcw } from "lucide-react";
import type { CheckRouteResponse } from "@/lib/types";

type Status =
  | { kind: "idle" }
  | { kind: "loading"; origin: string; destination: string }
  | { kind: "result"; data: CheckRouteResponse }
  | { kind: "error"; message: string; origin: string; destination: string };

export default function Page() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function runCheck(origin: string, destination: string) {
    setStatus({ kind: "loading", origin, destination });
    try {
      const res = await fetch("/api/route-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({
          kind: "error",
          message: body?.error || "Couldn't check this route right now. Please try again.",
          origin,
          destination,
        });
        return;
      }
      setStatus({ kind: "result", data: body as CheckRouteResponse });
    } catch {
      setStatus({
        kind: "error",
        message: "Network error. Please check your connection and try again.",
        origin,
        destination,
      });
    }
  }

  const reset = () => setStatus({ kind: "idle" });
  const retry = () => {
    if (status.kind === "error") runCheck(status.origin, status.destination);
  };

  return (
    <main className="min-h-[100dvh] grid-bg">
      <header className="max-w-5xl mx-auto px-5 pt-6 flex items-center justify-between">
        <Logo />
        <span className="text-[11px] text-[color:var(--muted)] hidden sm:inline">Bengaluru edition · prototype</span>
      </header>

      <section className="max-w-5xl mx-auto px-5 pt-10 sm:pt-16 pb-14">
        {status.kind === "idle" && (
          <div className="w-full">
            <div className="max-w-2xl mx-auto text-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 py-1 text-[11px] uppercase tracking-widest text-[color:var(--muted)] mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand" aria-hidden />
                Bengaluru route reality check
              </div>
              <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-ink">
                Can I take this road?
              </h1>
              <p className="mt-4 text-[15px] sm:text-lg text-[color:var(--muted)] max-w-lg mx-auto">
                Google Maps tells you how to get there. <span className="text-ink font-medium">We tell you whether you should go right now.</span>
              </p>
            </div>
            <RouteForm onSubmit={runCheck} />
            <p className="mt-8 text-center text-[12px] text-[color:var(--muted)] max-w-md mx-auto">
              We blend live Google traffic, an Open-Meteo weather check along the route, and a Bengaluru road-condition dataset into one honest GO / WAIT / AVOID answer.
            </p>
          </div>
        )}

        {status.kind === "loading" && (
          <div className="w-full">
            <p className="text-center text-[12px] text-[color:var(--muted)] mb-4">
              {status.origin} → {status.destination}
            </p>
            <LoadingSteps />
          </div>
        )}

        {status.kind === "error" && (
          <div className="w-full max-w-md mx-auto">
            <div className="rounded-2xl bg-white border border-[var(--line)] p-5 shadow-card">
              <div className="flex items-center gap-2 text-avoid">
                <AlertTriangle className="w-5 h-5" aria-hidden />
                <h2 className="font-display font-semibold">Couldn't check this route</h2>
              </div>
              <p className="mt-2 text-sm text-ink">{status.message}</p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={retry}
                  className="flex-1 rounded-xl bg-ink text-white py-3 font-display font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden />
                  Try again
                </button>
                <button
                  onClick={reset}
                  className="flex-1 rounded-xl bg-white border border-[var(--line)] py-3 font-display font-semibold text-sm text-ink hover:border-ink"
                >
                  Start over
                </button>
              </div>
            </div>
          </div>
        )}

        {status.kind === "result" && <ResultView data={status.data} onReset={reset} />}
      </section>

      <footer className="max-w-5xl mx-auto px-5 pb-10 text-center text-[11px] text-[color:var(--muted)]">
        Prototype for Bengaluru. Traffic is live via Google Routes; weather is Open-Meteo model data;
        road conditions are a local reference dataset. Not a real-time civic feed.
      </footer>
    </main>
  );
}
