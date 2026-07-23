import { cn } from "@/lib/utils";

export function ZetrisLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 via-blue-600 to-blue-800 shadow-[0_0_20px_rgba(56,189,248,0.5)]">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
          <path d="M5 5H19L9 19H19" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.9)]" />
      </div>
      <div className="leading-tight">
        <div className="text-xl font-bold tracking-[0.08em] text-white">ZETRIS</div>
        <div className="text-[10px] font-medium tracking-[0.25em] text-sky-300/70">
          BUSINESS INTELLIGENCE
        </div>
      </div>
    </div>
  );
}
