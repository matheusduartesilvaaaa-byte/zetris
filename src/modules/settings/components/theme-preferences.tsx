"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const OPTIONS = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Automático", icon: Monitor },
];

export function ThemePreferences() {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aparência</CardTitle>
        <CardDescription>Escolha como a Zetris deve aparecer para você</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-3">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const active = theme === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={cn(
                "flex flex-1 flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors",
                active ? "border-primary bg-primary/5 text-primary" : "hover:bg-accent"
              )}
            >
              <Icon size={20} />
              {option.label}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
