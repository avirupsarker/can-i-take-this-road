export function Logo({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        aria-hidden
        className="grid place-items-center rounded-lg bg-ink text-white font-display font-bold"
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        ?
      </div>
      <span className="font-display font-semibold text-ink text-[15px] tracking-tight">
        Can I take this road?
      </span>
    </div>
  );
}
