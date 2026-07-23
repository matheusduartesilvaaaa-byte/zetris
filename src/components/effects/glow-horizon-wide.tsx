export function GlowHorizonWide() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute left-[45%] top-[52%] h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(56,189,248,0.6), rgba(37,99,235,0.28) 55%, transparent 75%)",
        }}
      />
      <svg
        viewBox="0 0 1600 500"
        className="absolute left-0 top-1/2 h-[420px] w-full -translate-y-1/2"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wide-horizon" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0" />
            <stop offset="30%" stopColor="#38bdf8" stopOpacity="0.85" />
            <stop offset="47%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="64%" stopColor="#38bdf8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M -100 420 A 900 900 0 0 1 1700 420"
          fill="none"
          stroke="url(#wide-horizon)"
          strokeWidth="2"
          className="animate-horizon-breathe"
        />
      </svg>
    </div>
  );
}
