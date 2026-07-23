import { Users, TrendingUp, ShieldCheck } from "lucide-react";

const STATS = [
  { icon: Users, value: "+10K", label: "EMPRESAS" },
  { icon: TrendingUp, value: "+25M", label: "MOVIMENTADOS" },
  { icon: ShieldCheck, value: "99.9%", label: "UPTIME" },
];

export function TrustStats() {
  return (
    <div className="flex flex-wrap gap-10">
      {STATS.map(({ icon: Icon, value, label }) => (
        <div key={label}>
          <Icon size={18} className="mb-2 text-sky-300" />
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-[11px] font-medium tracking-wider text-slate-400">{label}</div>
        </div>
      ))}
    </div>
  );
}
