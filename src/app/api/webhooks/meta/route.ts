import { NextResponse } from "next/server";
import { META_VERIFY_TOKEN } from "@/lib/meta/config";
import { verifySignature } from "@/lib/meta/verify";
import { handleEvent } from "@/lib/meta/receive";

// Verificación del webhook (Meta hace un GET al configurarlo).
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && token === META_VERIFY_TOKEN) {
    return new Response(challenge ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

// Recepción de eventos. Verifica firma y persiste. Siempre responde 200 (salvo
// firma inválida) para que Meta no entre en loop de reintentos.
export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!verifySignature(raw, signature)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  try {
    await handleEvent(payload);
  } catch (err) {
    // No devolvemos error a Meta: logueamos y seguimos.
    // eslint-disable-next-line no-console
    console.error("[meta webhook]", err);
  }

  return NextResponse.json({ received: true });
}
