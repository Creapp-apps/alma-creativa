"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/leads-status";
import { isProductionStage } from "@/lib/production-stages";

// Revalida todas las vistas que listan leads/pedidos.
function revalidateLeads() {
  revalidatePath("/admin");
  revalidatePath("/admin/leads");
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/tablero");
}

export async function signIn(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Completá email y contraseña." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Email o contraseña incorrectos." };

  redirect("/admin");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function updateLeadStatus(
  id: string,
  status: string,
): Promise<void> {
  if (!LEAD_STATUSES.includes(status as LeadStatus)) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("leads").update({ status }).eq("id", id);
  revalidateLeads();
}

export async function saveLeadNotes(id: string, notes: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("leads").update({ notes }).eq("id", id);
  revalidateLeads();
}

// --- Producción (kanban) ---

export async function updateProductionStage(
  id: string,
  stage: string,
): Promise<void> {
  if (!isProductionStage(stage)) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("leads").update({ production_stage: stage }).eq("id", id);
  revalidateLeads();
}

export async function startProduction(id: string): Promise<void> {
  return updateProductionStage(id, "en_produccion");
}

export async function deleteLead(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  // Delete necesita service_role (no hay policy de delete para authenticated);
  // lead_items cae por cascada.
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  await admin.from("leads").delete().eq("id", id);
  revalidateLeads();
}

const leadEditSchema = z.object({
  name: z.string().min(1).max(80),
  phone: z.string().min(1).max(30),
  email: z.string().max(120).nullable().optional(),
  event_slug: z.string().max(80).nullable().optional(),
  event_date: z.string().max(40).nullable().optional(),
  guests: z.number().int().min(0).max(100000).nullable().optional(),
  comments: z.string().max(2000).nullable().optional(),
  items: z
    .array(
      z.object({
        slug: z.string().nullable().optional(),
        name: z.string().min(1).max(200),
        qty: z.number().int().min(1).max(100000),
      }),
    )
    .max(100),
});

export type LeadEditInput = z.infer<typeof leadEditSchema>;

export async function updateLead(
  id: string,
  input: LeadEditInput,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = leadEditSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado." };

  // service_role: reemplazar lead_items no tiene policy para authenticated.
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();

  const d = parsed.data;
  const { error: upErr } = await admin
    .from("leads")
    .update({
      name: d.name,
      phone: d.phone,
      email: d.email || null,
      event_slug: d.event_slug || null,
      event_date: d.event_date || null,
      guests: d.guests ?? null,
      comments: d.comments || null,
    })
    .eq("id", id);
  if (upErr) return { ok: false, error: upErr.message };

  await admin.from("lead_items").delete().eq("lead_id", id);
  if (d.items.length > 0) {
    const { error: itErr } = await admin.from("lead_items").insert(
      d.items.map((it) => ({
        lead_id: id,
        product_slug: it.slug || null,
        product_name: it.name,
        qty: it.qty,
      })),
    );
    if (itErr) return { ok: false, error: itErr.message };
  }

  revalidateLeads();
  return { ok: true };
}

// --- Bandeja omnicanal (conversaciones) ---

export type InboxMessage = {
  id: string;
  direction: string;
  text: string | null;
  media_url: string | null;
  media_type: string | null;
  status: string | null;
  created_at: string;
};

export async function getConversationMessages(
  conversationId: string,
): Promise<InboxMessage[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("messages")
    .select("id,direction,text,media_url,media_type,status,created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  return (data ?? []) as InboxMessage[];
}

export async function markConversationRead(
  conversationId: string,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("conversations")
    .update({ unread: 0 })
    .eq("id", conversationId);
  revalidatePath("/admin");
  revalidatePath("/admin/leads");
}

const WHATSAPP_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function sendReply(
  conversationId: string,
  text: string,
): Promise<{ ok: boolean; error?: string; simulated?: boolean }> {
  const body = text.trim();
  if (!body) return { ok: false, error: "Mensaje vacío." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado." };

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  const { data: conv } = await admin
    .from("conversations")
    .select("id, channel, external_id, last_inbound_at")
    .eq("id", conversationId)
    .single();
  if (!conv) return { ok: false, error: "Conversación inexistente." };

  // Ventana de 24h de WhatsApp: fuera de ella, texto libre se rechaza.
  if (conv.channel === "whatsapp") {
    const last = conv.last_inbound_at
      ? new Date(conv.last_inbound_at).getTime()
      : 0;
    if (Date.now() - last > WHATSAPP_WINDOW_MS) {
      return {
        ok: false,
        error:
          "Fuera de la ventana de 24h de WhatsApp. Requiere una plantilla aprobada.",
      };
    }
  }

  const { isMetaConfigured } = await import("@/lib/meta/config");
  const { recordOutbound } = await import("@/lib/meta/inbox");

  let messageExternalId: string | null = null;
  let simulated = false;

  if (isMetaConfigured()) {
    const { sendText } = await import("@/lib/meta/send");
    const res = await sendText(
      conv.channel as "instagram" | "messenger" | "whatsapp",
      conv.external_id,
      body,
    );
    if (!res.ok) return { ok: false, error: res.error ?? "No se pudo enviar." };
    messageExternalId = res.messageId ?? null;
  } else {
    // Sin tokens de Meta todavía: se guarda local para testear la UI.
    simulated = true;
  }

  await recordOutbound({
    conversationId,
    text: body,
    messageExternalId,
    status: simulated ? "sent" : "sent",
  });
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return { ok: true, simulated };
}
