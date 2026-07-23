import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { GlowFlowLine } from "@/components/effects/glow-flow-line";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!session.user.isPlatformAdmin) redirect("/dashboard");

  return (
    <div className="relative min-h-screen">
      <GlowFlowLine />
      <header className="glass-panel relative z-10 flex h-16 items-center border-t-0 px-6">
        <span className="text-lg font-semibold tracking-tight text-white">Zetris — Painel Interno</span>
      </header>
      <main className="relative z-10 p-6">{children}</main>
    </div>
  );
}
