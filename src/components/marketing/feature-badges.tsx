import { ShoppingCart, Wallet, BarChart3, Building2 } from "lucide-react";

const FEATURES = [
  { icon: ShoppingCart, label: "PDV" },
  { icon: Wallet, label: "CAIXA" },
  { icon: BarChart3, label: "BI" },
  { icon: Building2, label: "MULTIEMPRESA" },
];

export function FeatureBadges() {
  return (
    <div className="flex flex-wrap gap-6">
      {FEATURES.map(({ icon: Icon, label }) => (
        <div key={label} className="flex flex-col items-center gap-2">
          <div className="glass-panel flex h-14 w-14 items-center justify-center rounded-2xl text-sky-300">
            <Icon size={22} />
          </div>
          <span className="text-[11px] font-semibold tracking-wider text-slate-300">{label}</span>
        </div>
      ))}
    </div>
  );
}
