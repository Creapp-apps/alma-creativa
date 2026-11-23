// Config de la integración nativa con Meta (Instagram / Messenger / WhatsApp).
// Un solo endpoint de webhook recibe los 3; se envía por el Graph API.

export const GRAPH_VERSION = "v21.0";
export const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

// App Secret: para verificar la firma X-Hub-Signature-256 de los webhooks.
export const META_APP_SECRET = process.env.META_APP_SECRET;

// Verify token: lo elegimos nosotros y lo cargamos igual en el panel de Meta.
export const META_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;

// Token permanente de un System User (Business Settings). No expira.
export const META_GRAPH_TOKEN = process.env.META_GRAPH_TOKEN;

// IDs por canal (para construir las URLs de envío).
export const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
export const IG_USER_ID = process.env.IG_USER_ID;
export const PAGE_ID = process.env.PAGE_ID;

/** Hay secret + token: se puede verificar webhooks y enviar. */
export function isMetaConfigured(): boolean {
  return Boolean(META_APP_SECRET && META_GRAPH_TOKEN);
}
