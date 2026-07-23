import { SettingsTabs } from "@/modules/settings/components/settings-tabs";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Perfil, empresa, usuários e preferências do sistema
        </p>
      </div>
      <SettingsTabs />
    </div>
  );
}
