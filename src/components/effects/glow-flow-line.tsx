/**
 * Linha de néon que percorre o contorno da tela, com um pulso de luz
 * viajando continuamente pelo traçado — a assinatura visual do app.
 * Fixa, atrás do conteúdo, e puramente decorativa.
 */
export function GlowFlowLine() {
  return (
    <svg
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-90"
      viewBox="0 0 1600 900"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="flow-base" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="flow-pulse" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </linearGradient>
        <filter id="flow-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Traçado base, sempre visível, bem sutil */}
      <path
        d="M -50 40 C 300 40, 420 40, 520 140 S 700 380, 900 380 S 1250 160, 1650 160"
        fill="none"
        stroke="url(#flow-base)"
        strokeWidth="2"
        filter="url(#flow-glow)"
      />

      {/* Pulso de luz viajando pelo mesmo traçado, em loop contínuo */}
      <path
        d="M -50 40 C 300 40, 420 40, 520 140 S 700 380, 900 380 S 1250 160, 1650 160"
        fill="none"
        stroke="url(#flow-pulse)"
        strokeWidth="3"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="0.12 1"
        filter="url(#flow-glow)"
        className="animate-flow-travel"
      />
    </svg>
  );
}
