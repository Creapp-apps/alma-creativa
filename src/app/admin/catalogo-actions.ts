"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];

const BUCKET = "product-photos";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

export async function upsertProduct(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const mode = String(formData.get("mode") ?? "edit");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const slug =
    mode === "create"
      ? slugify(String(formData.get("slug") || name))
      : String(formData.get("slug") ?? "");
  if (!slug) return;

  const details = String(formData.get("details") ?? "")
    .split("\n")
    .map((d) => d.trim())
    .filter(Boolean);

  const events = formData.getAll("events").map(String);

  // Foto (opcional)
  let imageUrl: string | null | undefined;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const ext = photo.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${slug}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, photo, { upsert: true, contentType: photo.type });
    if (!upErr) {
      imageUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    }
  }

  const row: ProductInsert = {
    slug,
    name,
    category_slug: String(formData.get("category") ?? ""),
    blurb: String(formData.get("blurb") ?? ""),
    details,
    price_note: String(formData.get("price_note") ?? "Presupuesto a medida"),
    price_from: Number(formData.get("price_from") ?? 0) || 0,
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
    ...(imageUrl !== undefined ? { image_url: imageUrl } : {}),
  };

  const { error } = await supabase.from("products").upsert(row, {
    onConflict: "slug",
  });
  if (error) throw new Error(`No se pudo guardar el producto: ${error.message}`);

  // Reemplazar relación producto-evento
  await supabase.from("product_events").delete().eq("product_slug", slug);
  if (events.length > 0) {
    await supabase
      .from("product_events")
      .insert(events.map((e) => ({ product_slug: slug, event_slug: e })));
  }

  revalidateTag("catalog", "max");
  revalidatePath("/admin/catalogo");
  redirect("/admin/catalogo");
}

export async function reorderProducts(slugs: string[]): Promise<void> {
  const supabase = await createClient();
  await Promise.all(
    slugs.map((slug, i) =>
      supabase.from("products").update({ sort_order: i }).eq("slug", slug),
    ),
  );
  revalidateTag("catalog", "max");
  revalidatePath("/admin/catalogo");
}

export async function deleteProduct(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;
  const supabase = await createClient();
  await supabase.from("products").delete().eq("slug", slug);
  revalidateTag("catalog", "max");
  revalidatePath("/admin/catalogo");
  redirect("/admin/catalogo");
}
