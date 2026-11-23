import { createAdminClient } from "@/lib/supabase/admin";
import type { Channel } from "./types";

type InboundMessage = {
  channel: Channel;
  externalId: string; // id del contacto en el canal
  contactName?: string | null;
  contactHandle?: string | null;
  messageExternalId?: string | null; // id del mensaje (idempotencia)
  text?: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
  at?: Date;
};

// Guarda un mensaje entrante: upsert de la conversación + insert del mensaje.
// Idempotente por messages.external_id. Usa service_role (lo llama el webhook).
export async function recordInbound(msg: InboundMessage): Promise<void> {
  const admin = createAdminClient();
  const at = msg.at ?? new Date();
  const preview = msg.text ?? (msg.mediaType ? `[${msg.mediaType}]` : "");

  const { data: conv, error: convErr } = await admin
    .from("conversations")
    .upsert(
      {
        channel: msg.channel,
        external_id: msg.externalId,
        contact_name: msg.contactName ?? null,
        contact_handle: msg.contactHandle ?? null,
        last_message_at: at.toISOString(),
        last_message_preview: preview.slice(0, 200),
        last_inbound_at: at.toISOString(),
      },
      { onConflict: "channel,external_id" },
    )
    .select("id, unread")
    .single();

  if (convErr || !conv) {
    throw new Error(`conversations upsert: ${convErr?.message ?? "sin data"}`);
  }

  const { error: msgErr } = await admin.from("messages").upsert(
    {
      conversation_id: conv.id,
      direction: "in",
      external_id: msg.messageExternalId ?? null,
      text: msg.text ?? null,
      media_url: msg.mediaUrl ?? null,
      media_type: msg.mediaType ?? null,
      created_at: at.toISOString(),
    },
    { onConflict: "external_id", ignoreDuplicates: true },
  );
  if (msgErr) throw new Error(`messages insert: ${msgErr.message}`);

  // unread +1 (no hay RPC; update directo sobre el valor leído arriba).
  await admin
    .from("conversations")
    .update({ unread: (conv.unread ?? 0) + 1 })
    .eq("id", conv.id);
}

// Registra un mensaje saliente ya enviado (lo usa el envío desde el panel).
export async function recordOutbound(params: {
  conversationId: string;
  text?: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
  messageExternalId?: string | null;
  status?: string;
}): Promise<void> {
  const admin = createAdminClient();
  const at = new Date().toISOString();
  await admin.from("messages").insert({
    conversation_id: params.conversationId,
    direction: "out",
    external_id: params.messageExternalId ?? null,
    text: params.text ?? null,
    media_url: params.mediaUrl ?? null,
    media_type: params.mediaType ?? null,
    status: params.status ?? "sent",
    created_at: at,
  });
  await admin
    .from("conversations")
    .update({
      last_message_at: at,
      last_message_preview: (params.text ?? "").slice(0, 200),
    })
    .eq("id", params.conversationId);
}
