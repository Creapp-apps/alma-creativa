import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

// Cliente admin: saltea RLS con service_role.
// SOLO server-side (Route Handlers, Server Actions, Edge Functions).
// NUNCA importar desde el cliente.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
