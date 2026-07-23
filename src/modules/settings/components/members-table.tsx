"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import {
  inviteMemberSchema,
  type InviteMemberInput,
} from "@/modules/settings/schemas/settings.schema";
import { useMembers, useInviteMember, useRemoveMember } from "@/modules/settings/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  MANAGER: "Gerente",
  STAFF: "Colaborador",
};

export function MembersTable() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: members, isLoading } = useMembers();
  const inviteMutation = useInviteMember();
  const removeMutation = useRemoveMember();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { role: "STAFF" },
  });

  async function onSubmit(data: InviteMemberInput) {
    const result = await inviteMutation.mutateAsync(data);
    if (result.success) {
      toast.success("Usuário adicionado à empresa");
      reset();
      setDialogOpen(false);
    } else {
      toast.error(result.message ?? "Erro ao convidar usuário");
    }
  }

  async function handleRemove(id: string) {
    if (!confirm("Remover este usuário da empresa?")) return;
    const result = await removeMutation.mutateAsync(id);
    if (result.success) toast.success("Usuário removido");
    else toast.error(result.message ?? "Erro ao remover usuário");
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Usuários da empresa</CardTitle>
          <CardDescription>Gerencie quem tem acesso e quais permissões cada um possui</CardDescription>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar usuário
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Papel</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                    Carregando...
                  </td>
                </tr>
              )}
              {members?.map((member) => (
                <tr key={member.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{member.user.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{member.user.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                      {ROLE_LABELS[member.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {member.role !== "OWNER" && (
                      <Button variant="ghost" size="icon" onClick={() => handleRemove(member.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar usuário</DialogTitle>
            <DialogDescription>
              O usuário precisa já ter uma conta cadastrada na Zetris com este e-mail.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Papel</Label>
              <select
                id="role"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                {...register("role")}
              >
                <option value="ADMIN">Administrador</option>
                <option value="MANAGER">Gerente</option>
                <option value="STAFF">Colaborador</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={inviteMutation.isPending}>
                {inviteMutation.isPending ? "Adicionando..." : "Adicionar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
