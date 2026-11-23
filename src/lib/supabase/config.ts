// Helpers para saber si Supabase está configurado.
// Mientras no haya credenciales, el sitio sigue andando con mock / stub.

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Hay URL + anon key (lectura pública / cliente). */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/** Hay URL + service_role (escritura server-side, p. ej. guardar leads). */
export function isSupabaseAdminConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseServiceKey);
}
