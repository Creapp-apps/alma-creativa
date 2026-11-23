import {
  GRAPH_BASE,
  META_GRAPH_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID,
  IG_USER_ID,
} from "./config";
import type { Channel } from "./types";

type SendResult = { ok: boolean; messageId?: string; error?: string };

async function graph(
  path: string,
  body: Record<string, unknown>,
): Promise<SendResult> {
  if (!META_GRAPH_TOKEN) return { ok: false, error: "Falta META_GRAPH_TOKEN" };
  const res = await fetch(`${GRAPH_BASE}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${META_GRAPH_TOKEN}`,
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as {
    messages?: { id: string }[];
    message_id?: string;
    error?: { message?: string };
  };
  if (!res.ok) {
    return { ok: false, error: json.error?.message ?? `HTTP ${res.status}` };
  }
  const messageId = json.messages?.[0]?.id ?? json.message_id;
  return { ok: true, messageId };
}

// Enviar texto por el canal correspondiente.
// OJO WhatsApp: fuera de la ventana de 24h, Meta rechaza el texto libre
// (hay que usar una plantilla aprobada). Eso se maneja en la capa de UI.
export async function sendText(
  channel: Channel,
  recipientExternalId: string,
  text: string,
): Promise<SendResult> {
  if (channel === "whatsapp") {
    if (!WHATSAPP_PHONE_NUMBER_ID) {
      return { ok: false, error: "Falta WHATSAPP_PHONE_NUMBER_ID" };
    }
    return graph(`${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      messaging_product: "whatsapp",
      to: recipientExternalId,
      type: "text",
      text: { body: text },
    });
  }

  if (channel === "instagram") {
    if (!IG_USER_ID) return { ok: false, error: "Falta IG_USER_ID" };
    return graph(`${IG_USER_ID}/messages`, {
      recipient: { id: recipientExternalId },
      message: { text },
    });
  }

  // messenger (Página FB)
  return graph(`me/messages`, {
    recipient: { id: recipientExternalId },
    messaging_type: "RESPONSE",
    message: { text },
  });
}
