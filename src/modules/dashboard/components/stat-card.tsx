import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "default" | "warning" | "danger";
}

export function StatCard({ label, value, icon: Icon, tone = "default" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            tone === "default" && "bg-primary/10 text-primary",
            tone === "warning" && "bg-amber-500/10 text-amber-500",
            tone === "danger" && "bg-destructive/10 text-destructive"
          )}
        >
          <Icon size={20} />
        </div>
      </CardContent>
    </Card>
  );
}
