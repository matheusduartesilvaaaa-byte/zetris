import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/modules/auth/schemas/login.schema";
import { eventBus } from "@/lib/events/event-bus";
import { DomainEvent, type AuthEventPayload } from "@/lib/events/domain-events";
import { billingService } from "@/modules/billing/services/billing.service";
import { logger } from "@/lib/logger";

const hasGoogleCredentials = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  events: {
    async signIn({ user }) {
      if (!user.id) return;
      const membership = await prisma.companyMember.findFirst({ where: { userId: user.id } });
      eventBus.emit<AuthEventPayload>(DomainEvent.AUTH_LOGIN, {
        companyId: membership?.companyId,
        userId: user.id,
        entityType: "User",
        entityId: user.id,
      });
    },
    async signOut(message) {
      const userId = "token" in message ? (message.token?.id as string | undefined) : undefined;
      if (!userId) return;
      const membership = await prisma.companyMember.findFirst({ where: { userId } });
      eventBus.emit<AuthEventPayload>(DomainEvent.AUTH_LOGOUT, {
        companyId: membership?.companyId,
        userId,
        entityType: "User",
        entityId: userId,
      });
    },
    /**
     * Disparado pelo PrismaAdapter apenas quando um usuário NOVO é criado
     * via OAuth (Google). Cadastro por credenciais já cria empresa+trial em
     * `authService.register` — este hook cobre o caminho que não passa por lá.
     */
    async createUser({ user }) {
      if (!user.id || !user.email) return;

      const company = await prisma.company.create({
        data: {
          name: `Empresa de ${user.name ?? user.email.split("@")[0]}`,
          ownerId: user.id,
          settings: { create: {} },
        },
      });

      await prisma.companyMember.create({
        data: { companyId: company.id, userId: user.id, role: "OWNER" },
      });

      try {
        await billingService.startTrialForCompany(company.id);
      } catch (error) {
        logger.error({ err: error, companyId: company.id }, "Falha ao iniciar trial (cadastro via Google)");
      }
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null; // conta só existe via Google, sem senha local

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
    ...(hasGoogleCredentials
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;

        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: { isPlatformAdmin: true },
        });
        token.isPlatformAdmin = dbUser?.isPlatformAdmin ?? false;

        // Carrega a empresa ativa (primeira empresa do usuário por padrão)
        const membership = await prisma.companyMember.findFirst({
          where: { userId: user.id as string },
          orderBy: { createdAt: "asc" },
        });

        if (membership) {
          token.activeCompanyId = membership.companyId;
          token.role = membership.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.activeCompanyId = token.activeCompanyId as string | undefined;
        session.user.role = token.role as string | undefined;
        session.user.isPlatformAdmin = token.isPlatformAdmin as boolean;
      }
      return session;
    },
  },
});
