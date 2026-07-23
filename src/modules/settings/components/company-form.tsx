"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { companySchema, type CompanyInput } from "@/modules/settings/schemas/settings.schema";
import { useCompany, useUpdateCompany } from "@/modules/settings/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function CompanyForm() {
  const { data: company } = useCompany();
  const updateMutation = useUpdateCompany();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CompanyInput>({ resolver: zodResolver(companySchema) });

  useEffect(() => {
    if (company) {
      reset({
        name: company.name,
        cnpj: company.cnpj ?? "",
        logoUrl: company.logoUrl ?? "",
        address: company.address ?? "",
        city: company.city ?? "",
        state: company.state ?? "",
        zipCode: company.zipCode ?? "",
        phone: company.phone ?? "",
        email: company.email ?? "",
      });
    }
  }, [company, reset]);

  async function onSubmit(data: CompanyInput) {
    const result = await updateMutation.mutateAsync(data);
    if (result.success) toast.success("Dados da empresa atualizados");
    else toast.error(result.message ?? "Erro ao atualizar empresa");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados da empresa</CardTitle>
        <CardDescription>Informações exibidas na topbar e em documentos gerados</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Nome da empresa *</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" {...register("cnpj")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUrl">URL do logo</Label>
              <Input id="logoUrl" placeholder="https://..." {...register("logoUrl")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" {...register("phone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...register("email")} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" {...register("address")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" {...register("city")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input id="state" {...register("state")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">CEP</Label>
              <Input id="zipCode" {...register("zipCode")} />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar alterações"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
