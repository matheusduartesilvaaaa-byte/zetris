import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      activeCompanyId?: string;
      role?: string;
      isPlatformAdmin?: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    activeCompanyId?: string;
    role?: string;
    isPlatformAdmin?: boolean;
  }
}
