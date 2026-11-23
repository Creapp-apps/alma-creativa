import crypto from "node:crypto";
import { META_APP_SECRET } from "./config";

// Verifica la firma del webhook de Meta.
// Header: X-Hub-Signature-256: sha256=<hmac del body crudo con el App Secret>.
// Se compara con timingSafeEqual para evitar timing attacks.
export function verifySignature(raw: string, header: string | null): boolean {
  if (!META_APP_SECRET || !header) return false;
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", META_APP_SECRET).update(raw).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(header);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
