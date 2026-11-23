"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { mergeContent, type SiteContent } from "@/lib/site-content";

export async function saveSiteContent(content: SiteContent): Promise<void> {
  const supabase = await createClient();

  // Normaliza con los defaults por si falta algún campo.
  const normalized = mergeContent(content);

  const { error } = await supabase.from("site_content").upsert(
    {
      id: "default",
      content: normalized,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error(`No se pudo guardar el contenido: ${error.message}`);
  }

  // El sitio público usa cacheTag("site").
  revalidateTag("site", "max");
  revalidatePath("/admin/sitio");
}

// Guarda la foto de portada + el foco (object-position) de una categoría.
export async function saveCategoryCover(
  slug: string,
  imageUrl: string | null,
  focal: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ image_url: imageUrl, focal })
    .eq("slug", slug);
  if (error) throw new Error(`No se pudo guardar la portada: ${error.message}`);

  revalidateTag("catalog", "max");
  revalidatePath("/admin/sitio");
}

// Guarda la foto de portada + el foco de un producto.
export async function saveProductCover(
  slug: string,
  imageUrl: string | null,
  focal: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ image_url: imageUrl, focal })
    .eq("slug", slug);
  if (error) throw new Error(`No se pudo guardar la portada: ${error.message}`);

  revalidateTag("catalog", "max");
  revalidatePath("/admin/sitio");
}

// Guarda la foto de portada + el foco de un evento.
export async function saveEventCover(
  slug: string,
  imageUrl: string | null,
  focal: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .update({ image_url: imageUrl, focal })
    .eq("slug", slug);
  if (error) throw new Error(`No se pudo guardar la portada: ${error.message}`);

  revalidateTag("catalog", "max");
  revalidatePath("/admin/sitio");
}
