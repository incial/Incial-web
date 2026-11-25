"use client";

/** A thin horizontal bar showing `value` out of `max`. */
export function ProgressBar({ value, max, tone = "accent" }: { value: number; max: number; tone?: "accent" | "success" | "warning" }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const color = tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : "bg-accent";
  return (
    <div role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} className="h-2 w-full overflow-hidden rounded-full bg-default">
      <div className={`h-full rounded-full transition-[width] duration-700 ${color}`} style={{ width: `${percent}%` }} />
    </div>
  );
}

/** A ring with a percentage in the middle. */
export function ProgressRing({ percent, size = 112, label }: { percent: number; size?: number; label?: string }) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-default" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          className="stroke-accent transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold leading-none text-foreground">{Math.round(clamped)}%</span>
        {label && <span className="mt-1 text-[10px] uppercase tracking-wider text-muted">{label}</span>}
      </div>
    </div>
  );
}
