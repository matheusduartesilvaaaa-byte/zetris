import { auth } from "@/lib/auth";

/**
 * Garante que existe uma sessão válida e uma empresa ativa.
 * Deve ser chamado no topo de todo service/action que acessa dados de negócio,
 * para que NENHUMA query rode sem escopo de companyId.
 */
export async function requireActiveCompany() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Não autenticado.");
  }

  if (!session.user.activeCompanyId) {
    throw new Error("Nenhuma empresa ativa selecionada.");
  }

  return {
    userId: session.user.id,
    companyId: session.user.activeCompanyId,
    role: session.user.role,
  };
}
