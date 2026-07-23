"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfileForm } from "@/modules/settings/components/profile-form";
import { CompanyForm } from "@/modules/settings/components/company-form";
import { MembersTable } from "@/modules/settings/components/members-table";
import { ThemePreferences } from "@/modules/settings/components/theme-preferences";
import { BillingTab } from "@/modules/billing/components/billing-tab";

export function SettingsTabs() {
  return (
    <Tabs defaultValue="profile">
      <TabsList>
        <TabsTrigger value="profile">Perfil</TabsTrigger>
        <TabsTrigger value="company">Empresa</TabsTrigger>
        <TabsTrigger value="members">Usuários</TabsTrigger>
        <TabsTrigger value="billing">Assinatura</TabsTrigger>
        <TabsTrigger value="preferences">Preferências</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileForm />
      </TabsContent>
      <TabsContent value="company">
        <CompanyForm />
      </TabsContent>
      <TabsContent value="members">
        <MembersTable />
      </TabsContent>
      <TabsContent value="billing">
        <BillingTab />
      </TabsContent>
      <TabsContent value="preferences">
        <ThemePreferences />
      </TabsContent>
    </Tabs>
  );
}
