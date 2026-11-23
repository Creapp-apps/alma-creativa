import type { LeadInput } from "@/lib/schemas";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";

export type Lead = LeadInput & {
  id: string;
  createdAt: string;
  source: string;
};

// Persistencia de leads.
//
// - Si Supabase está configurado (hay SUPABASE_SERVICE_ROLE_KEY) → inserta el
//   lead y sus ítems en las tablas `leads` / `lead_items` (saltea RLS vía
//   service_role; la API ya validó con Zod).
// - Si NO hay credenciales → stub: loguea y devuelve un id simulado, así el
//   formulario sigue andando end-to-end sin base de datos.
export async function saveLead(input: LeadInput): Promise<Lead> {
  if (isSupabaseAdminConfigured()) {
    return saveLeadToSupabase(input);
  }
  return saveLeadStub(input);
}

async function saveLeadToSupabase(input: LeadInput): Promise<Lead> {
  // Import dinámico: solo se carga el SDK admin cuando hace falta.
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      name: input.name,
      phone: input.phone,
      email: input.email || null,
      event_slug: input.event ?? null,
      event_date: input.date || null,
      guests: input.guests ?? null,
      comments: input.comments || null,
      source: "web",
    })
    .select("id, created_at")
    .single();

  if (error || !lead) {
    throw new Error(`No se pudo guardar el lead: ${error?.message ?? "unknown"}`);
  }

  const items = input.items.map((it) => ({
    lead_id: lead.id,
    product_slug: it.slug,
    product_name: it.name ?? it.slug,
    qty: it.qty,
  }));

  const { error: itemsError } = await supabase.from("lead_items").insert(items);
  if (itemsError) {
    throw new Error(`No se pudieron guardar los ítems: ${itemsError.message}`);
  }

  return {
    ...input,
    id: lead.id,
    createdAt: lead.created_at,
    source: "web",
  };
}

async function saveLeadStub(input: LeadInput): Promise<Lead> {
  const lead: Lead = {
    ...input,
    id: globalThis.crypto?.randomUUID?.() ?? `lead_${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    source: "web",
  };

  // eslint-disable-next-line no-console
  console.info("[lead] (stub, sin Supabase) nuevo pedido", JSON.stringify(lead));

  return lead;
}
