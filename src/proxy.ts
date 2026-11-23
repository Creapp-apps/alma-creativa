import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session";

// Next.js 16: el antiguo middleware.ts ahora es proxy.ts (export `proxy`).
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Solo corre en /admin: refresca sesión y protege el back-office.
  // Así el catálogo público sigue siendo estático/cacheable.
  matcher: ["/admin", "/admin/:path*"],
};
