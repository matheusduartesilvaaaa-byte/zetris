"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  ShoppingCart,
  Wallet,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Users2,
  Truck,
  Factory,
  Bot,
  Store,
  Headset,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/stores/ui.store";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Clientes", icon: Users },
  { href: "/products", label: "Produtos", icon: Package },
  { href: "/inventory", label: "Estoque", icon: Boxes },
  { href: "/sales", label: "Vendas", icon: ShoppingCart },
  { href: "/financial", label: "Financeiro", icon: Wallet },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/reports", label: "Relatórios", icon: FileBarChart },
  { href: "/settings", label: "Configurações", icon: Settings },
];

// Módulos previstos na arquitetura para expansão futura (não implementados)
const FUTURE_MODULES = [
  { label: "CRM", icon: Users2 },
  { label: "RH", icon: Users2 },
  { label: "Logística", icon: Truck },
  { label: "Produção", icon: Factory },
  { label: "IA", icon: Bot },
  { label: "Marketplace", icon: Store },
  { label: "Help Desk", icon: Headset },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        "glass-panel relative z-10 flex h-screen flex-col border-r-0 transition-all duration-200",
        sidebarCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {!sidebarCollapsed && (
          <span className="text-lg font-semibold tracking-tight text-white">
            Zetris
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="ml-auto rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sky-500/10 text-sky-300 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.25)]"
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {!sidebarCollapsed && (
          <p className="px-3 pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">
            Em breve
          </p>
        )}
        {FUTURE_MODULES.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/30"
              title={`${item.label} — módulo futuro`}
            >
              <Icon size={18} className="shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
