"use client";
import { useState } from "react";
import { ArrowRight, MapPin, Navigation } from "lucide-react";

const PRESETS: Array<{ from: string; to: string; label: string }> = [
  { from: "Whitefield, Bengaluru", to: "Koramangala, Bengaluru", label: "Whitefield → Koramangala" },
  { from: "Marathahalli, Bengaluru", to: "Silk Board, Bengaluru", label: "Marathahalli → Silk Board" },
  { from: "HSR Layout, Bengaluru", to: "Indiranagar, Bengaluru", label: "HSR Layout → Indiranagar" },
];

interface Props {
  onSubmit: (origin: string, destination: string) => void;
  loading?: boolean;
  initialOrigin?: string;
  initialDestination?: string;
}

export function RouteForm({ onSubmit, loading, initialOrigin = "", initialDestination = "" }: Props) {
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) {
      setLocalError("Enter both a starting point and a destination.");
      return;
    }
    setLocalError(null);
    onSubmit(origin.trim(), destination.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="rounded-2xl bg-white border border-[var(--line)] shadow-card p-4 sm:p-5">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-[color:var(--muted)]">From</span>
          <div className="mt-1 flex items-center gap-2 rounded-xl border border-[var(--line)] focus-within:border-ink transition-colors bg-white px-3 py-3">
            <MapPin className="w-4 h-4 text-[color:var(--muted)]" aria-hidden />
            <input
              className="w-full bg-transparent outline-none text-[15px] placeholder:text-[color:var(--muted)]"
              placeholder="Enter starting location"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              autoComplete="off"
              disabled={loading}
              aria-label="Starting location"
            />
          </div>
        </label>

        <label className="block mt-3">
          <span className="text-xs font-medium uppercase tracking-wide text-[color:var(--muted)]">To</span>
          <div className="mt-1 flex items-center gap-2 rounded-xl border border-[var(--line)] focus-within:border-ink transition-colors bg-white px-3 py-3">
            <Navigation className="w-4 h-4 text-[color:var(--muted)]" aria-hidden />
            <input
              className="w-full bg-transparent outline-none text-[15px] placeholder:text-[color:var(--muted)]"
              placeholder="Enter destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              autoComplete="off"
              disabled={loading}
              aria-label="Destination"
            />
          </div>
        </label>

        {localError && (
          <p className="mt-3 text-sm text-avoid" role="alert">
            {localError}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-ink text-white py-3.5 font-display font-semibold text-[15px] tracking-wide flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-black transition-colors"
        >
          {loading ? "Checking route…" : "Check my route"}
          {!loading && <ArrowRight className="w-4 h-4" aria-hidden />}
        </button>

        <p className="mt-3 text-center text-[12px] text-[color:var(--muted)]">
          Traffic <span className="text-ink">·</span> weather <span className="text-ink">·</span> road conditions
        </p>
      </div>

      <div className="mt-4">
        <p className="text-[11px] uppercase tracking-wide text-[color:var(--muted)] mb-2 text-center">
          Try a Bengaluru demo route
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {PRESETS.map((p) => (
            <button
              type="button"
              key={p.label}
              disabled={loading}
              onClick={() => {
                setOrigin(p.from);
                setDestination(p.to);
                onSubmit(p.from, p.to);
              }}
              className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-xs text-ink hover:border-ink transition-colors disabled:opacity-60"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
