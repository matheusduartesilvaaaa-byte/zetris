/**
 * Arco de brilho usado no fundo das telas de autenticação.
 * Puramente decorativo (aria-hidden), não interfere em layout ou interação.
 */
export function GlowHorizon() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Glow difuso atrás do arco */}
      <div
        className="absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(56,189,248,0.55), rgba(37,99,235,0.25) 55%, transparent 75%)",
        }}
      />
      {/* Traço do horizonte */}
      <svg
        viewBox="0 0 800 400"
        className="absolute left-1/2 top-0 h-[300px] w-[900px] -translate-x-1/2 -translate-y-1/2"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="horizon-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0" />
            <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="65%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M 0 400 A 400 400 0 0 1 800 400"
          fill="none"
          stroke="url(#horizon-line)"
          strokeWidth="2.5"
          className="animate-horizon-breathe"
        />
      </svg>
    </div>
  );
}
