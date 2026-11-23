"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { mergeBusiness, type BusinessSettings } from "@/lib/business";

export async function saveBusinessSettings(
  data: BusinessSettings,
): Promise<void> {
  const supabase = await createClient();

  // Normaliza con los defaults por si falta algún campo.
  const normalized = mergeBusiness(data);

  const { error } = await supabase.from("business_settings").upsert(
    {
      id: "default",
      data: normalized,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error(`No se pudo guardar los datos del negocio: ${error.message}`);
  }

  revalidatePath("/admin/configuracion");
}
