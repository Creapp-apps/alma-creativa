import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

// Cliente público (anon, sin cookies) para lecturas cacheables del catálogo.
// No maneja sesión → se puede usar dentro de funciones con "use cache".
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
