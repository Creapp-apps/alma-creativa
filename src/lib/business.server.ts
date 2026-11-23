import "server-only";
import {
  defaultBusiness,
  mergeBusiness,
  type BusinessSettings,
} from "@/lib/business";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

// Lee los datos internos del negocio (Supabase) mergeados con los defaults.
// Datos internos → se leen con el cliente autenticado (back-office), sin cache.
export async function getBusinessSettings(): Promise<BusinessSettings> {
  if (!isSupabaseConfigured()) return defaultBusiness;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_settings")
    .select("data")
    .eq("id", "default")
    .maybeSingle();

  if (error || !data) return defaultBusiness;
  return mergeBusiness(data.data as Partial<BusinessSettings>);
}
