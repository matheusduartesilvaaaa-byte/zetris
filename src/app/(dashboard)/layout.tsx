import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { ZiaWidget } from "@/modules/zia/components/zia-widget";
import { GlowFlowLine } from "@/components/effects/glow-flow-line";
import { hasFeature } from "@/lib/feature-flags/has-feature";
import { Feature } from "@/lib/feature-flags/features";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const company = session.user.activeCompanyId
    ? await prisma.company.findUnique({ where: { id: session.user.activeCompanyId } })
    : null;

  const ziaEnabled = session.user.activeCompanyId
    ? await hasFeature(session.user.activeCompanyId, Feature.ZIA_ASSISTANT)
    : false;

  return (
    <div className="relative flex h-screen overflow-hidden">
      <GlowFlowLine />
      <Sidebar />
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <Topbar userName={session.user.name} companyName={company?.name} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
      {ziaEnabled && <ZiaWidget />}
    </div>
  );
}
