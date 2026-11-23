import { recordInbound } from "./inbox";
import type { Channel } from "./types";

// Parsers de los payloads de webhook de Meta.
// NOTA: las formas exactas conviene confirmarlas contra la doc de Meta al
// integrar (Meta cambia nombres/campos). Esto cubre el caso de texto + media.

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function handleEvent(payload: any): Promise<void> {
  const object = payload?.object;
  if (object === "whatsapp_business_account") return handleWhatsApp(payload);
  if (object === "instagram") return handleMessaging(payload, "instagram");
  if (object === "page") return handleMessaging(payload, "messenger");
  // otros objects (p. ej. suscripciones de campos no-mensajería) se ignoran.
}

// Instagram + Messenger comparten el array entry[].messaging[].
async function handleMessaging(payload: any, channel: Channel): Promise<void> {
  for (const entry of payload.entry ?? []) {
    for (const ev of entry.messaging ?? []) {
      const m = ev.message;
      if (!m || m.is_echo) continue; // ignorar nuestros propios ecos
      const senderId = ev.sender?.id;
      if (!senderId) continue;

      const att = m.attachments?.[0];
      const at = ev.timestamp ? new Date(Number(ev.timestamp)) : new Date();

      await recordInbound({
        channel,
        externalId: String(senderId),
        messageExternalId: m.mid ?? null,
        text: m.text ?? null,
        mediaUrl: att?.payload?.url ?? null,
        mediaType: att?.type ?? null,
        at,
      });
    }
  }
}

async function handleWhatsApp(payload: any): Promise<void> {
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue;
      const value = change.value ?? {};
      // Mapa wa_id -> nombre de perfil.
      const names: Record<string, string> = {};
      for (const c of value.contacts ?? []) {
        if (c.wa_id) names[c.wa_id] = c.profile?.name ?? "";
      }
      // Solo mensajes entrantes; los statuses (delivered/read) se ignoran acá.
      for (const msg of value.messages ?? []) {
        const from = msg.from;
        if (!from) continue;
        const at = msg.timestamp
          ? new Date(Number(msg.timestamp) * 1000)
          : new Date();

        let text: string | null = null;
        let mediaType: string | null = null;
        if (msg.type === "text") text = msg.text?.body ?? null;
        else mediaType = msg.type ?? null; // image/audio/document/...

        await recordInbound({
          channel: "whatsapp",
          externalId: String(from),
          contactName: names[from] || null,
          contactHandle: String(from),
          messageExternalId: msg.id ?? null,
          text,
          mediaType,
          at,
        });
      }
    }
  }
}
