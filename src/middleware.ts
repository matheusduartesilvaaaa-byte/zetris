import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit/rate-limit";

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isLoggedIn = !!req.auth;

  // Rate limit básico por IP nas rotas de autenticação e APIs — protege
  // contra força bruta de login e abuso de endpoints públicos/webhooks.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const isSensitiveRoute =
    pathname.startsWith("/api/auth") || pathname.startsWith("/api/v1") || pathname.startsWith("/api/reports");

  if (isSensitiveRoute) {
    const { allowed } = rateLimit(`route:${ip}:${pathname}`, 30, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "Muitas requisições. Tente novamente em instantes." }, { status: 429 });
    }
  }

  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
