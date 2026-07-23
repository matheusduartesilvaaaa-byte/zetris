import { Suspense } from "react";
import { Lock } from "lucide-react";
import { GlowHorizonWide } from "@/components/effects/glow-horizon-wide";
import { ZetrisLogo } from "@/components/marketing/zetris-logo";
import { FeatureBadges } from "@/components/marketing/feature-badges";
import { TrustStats } from "@/components/marketing/trust-stats";
import { LoginForm } from "@/modules/auth/components/login-form";

export default function LoginPage() {
  const googleEnabled = !!process.env.GOOGLE_CLIENT_ID;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-black">
      <GlowHorizonWide />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-16 px-6 py-16 lg:grid-cols-2 lg:px-12">
        {/* Coluna de marketing */}
        <div className="order-2 space-y-10 lg:order-1">
          <ZetrisLogo />

          <div>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
              Sua empresa,
              <br />
              <span className="bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">
                no controle.
              </span>
            </h1>
            <p className="mt-4 max-w-md text-slate-400">
              Plataforma completa para gestão financeira, vendas, estoque e inteligência empresarial.
            </p>
          </div>

          <FeatureBadges />
          <TrustStats />
        </div>

        {/* Card de acesso */}
        <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
          <Suspense>
            <LoginForm googleEnabled={googleEnabled} />
          </Suspense>
        </div>
      </div>

      <footer className="relative z-10 pb-8 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Zetris. Todos os direitos reservados.</p>
        <p className="mt-1 flex items-center justify-center gap-1.5">
          <Lock size={12} /> Seus dados estão seguros conosco.
        </p>
      </footer>
    </div>
  );
}
