/**
 * Next.js chama `register()` uma única vez quando o servidor inicia
 * (https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation).
 * É aqui que registramos os listeners de eventos de domínio da plataforma.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerEventListeners } = await import("@/lib/events/bootstrap");
    registerEventListeners();
  }
}
