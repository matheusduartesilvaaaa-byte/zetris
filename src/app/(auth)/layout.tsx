import { GlowHorizon } from "@/components/effects/glow-horizon";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4">
      <GlowHorizon />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-10 text-center">
          <span className="text-2xl font-semibold tracking-tight text-white">Zetris</span>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-sky-300/60">
            Gestão empresarial inteligente
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
