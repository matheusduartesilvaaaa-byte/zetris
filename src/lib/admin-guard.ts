import { auth } from "@/lib/auth";

/**
 * Garante que quem está acessando é um administrador da PLATAFORMA Zetris
 * (equipe interna), não apenas um usuário de alguma empresa cliente.
 * Usado exclusivamente pelas rotas em `/admin`.
 */
export async function requirePlatformAdmin() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Não autenticado.");
  }

  if (!session.user.isPlatformAdmin) {
    throw new Error("Acesso restrito à equipe Zetris.");
  }

  return { userId: session.user.id };
}
