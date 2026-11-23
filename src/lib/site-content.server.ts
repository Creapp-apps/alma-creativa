import "server-only";
import { cacheTag } from "next/cache";
import {
  defaultContent,
  mergeContent,
  type SiteContent,
} from "@/lib/site-content";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/public";

// Lee el contenido del sitio (Supabase) mergeado con los defaults.
// Cacheable: se invalida con revalidateTag("site") al guardar en el back-office.
export async function getSiteContent(): Promise<SiteContent> {
  "use cache";
  cacheTag("site");

  if (!isSupabaseConfigured()) return defaultContent;

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("content")
    .eq("id", "default")
    .maybeSingle();

  if (error || !data) return defaultContent;
  return mergeContent(data.content as Partial<SiteContent>);
}
