"use client";
import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

const STAGES = [
  "Finding your route",
  "Checking traffic",
  "Checking weather",
  "Assessing road conditions",
  "Calculating route risk",
];

export function LoadingSteps() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    // Advance in a plausible cadence but never claim finished until parent unmounts us.
    [900, 1800, 2600, 3400].forEach((ms, i) => {
      timers.push(setTimeout(() => setActive(i + 1), ms));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl border border-[var(--line)] bg-white shadow-card p-5 sm:p-6">
        <p className="text-sm text-[color:var(--muted)] mb-4">Checking your route…</p>
        <ul className="space-y-3">
          {STAGES.map((label, idx) => {
            const done = idx < Math.min(active, STAGES.length - 1);
            const current = idx === Math.min(active, STAGES.length - 1);
            return (
              <li key={label} className="flex items-center gap-3">
                <span
                  aria-hidden
                  className={`grid place-items-center w-6 h-6 rounded-full border ${
                    done ? "bg-ink text-white border-ink" : current ? "border-ink" : "border-[var(--line)]"
                  }`}
                >
                  {done ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : current ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : null}
                </span>
                <span
                  className={`text-sm ${
                    done ? "text-ink" : current ? "text-ink font-medium" : "text-[color:var(--muted)]"
                  }`}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
