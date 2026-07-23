"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Bell, LogOut, User } from "lucide-react";
import { signOutAction } from "@/modules/auth/actions/session.actions";
import { Button } from "@/components/ui/button";

export function Topbar({ userName, companyName }: { userName?: string | null; companyName?: string | null }) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="glass-panel relative z-10 flex h-16 items-center justify-between border-t-0 px-6">
      <div>
        <p className="text-sm font-medium text-white">{companyName ?? "Minha Empresa"}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Alternar tema"
        >
          <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <Button variant="ghost" size="icon" aria-label="Notificações">
          <Bell className="h-[18px] w-[18px]" />
        </Button>

        <div className="mx-2 flex items-center gap-2 border-l border-white/10 pl-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/10 text-sky-300 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.25)]">
            <User size={16} />
          </div>
          <span className="text-sm font-medium text-white">{userName ?? "Usuário"}</span>
        </div>

        <form action={signOutAction}>
          <Button variant="ghost" size="icon" type="submit" aria-label="Sair">
            <LogOut className="h-[18px] w-[18px]" />
          </Button>
        </form>
      </div>
    </header>
  );
}
