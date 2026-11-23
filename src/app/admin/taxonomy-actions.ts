"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

// ---------------- Categorías ----------------

export async function upsertCategory(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const mode = String(formData.get("mode") ?? "edit");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const slug =
    mode === "create"
      ? slugify(String(formData.get("slug") || name))
      : String(formData.get("slug") ?? "");
  if (!slug) return;

  const { error } = await supabase.from("categories").upsert(
    {
      slug,
      name,
      short: String(formData.get("short") ?? ""),
      icon: String(formData.get("icon") ?? "Gift"),
      tint: String(formData.get("tint") ?? "#efeae1"),
      sort_order: Number(formData.get("sort_order") ?? 0) || 0,
    },
    { onConflict: "slug" },
  );
  if (error) throw new Error(`No se pudo guardar la categoría: ${error.message}`);

  revalidateTag("catalog", "max");
  revalidatePath("/admin/categorias");
  redirect("/admin/categorias");
}

export async function reorderCategories(slugs: string[]): Promise<void> {
  const supabase = await createClient();
  await Promise.all(
    slugs.map((slug, i) =>
      supabase.from("categories").update({ sort_order: i }).eq("slug", slug),
    ),
  );
  revalidateTag("catalog", "max");
  revalidatePath("/admin/categorias");
}

export async function deleteCategory(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;
  const supabase = await createClient();

  // No permitir borrar si tiene productos asociados.
  const { count } = await supabase
    .from("products")
    .select("slug", { count: "exact", head: true })
    .eq("category_slug", slug);
  if ((count ?? 0) > 0) {
    throw new Error(
      "No se puede eliminar: la categoría tiene productos. Reasignalos o eliminalos primero.",
    );
  }

  await supabase.from("categories").delete().eq("slug", slug);
  revalidateTag("catalog", "max");
  revalidatePath("/admin/categorias");
  redirect("/admin/categorias");
}

// ---------------- Eventos ----------------

export async function upsertEvent(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const mode = String(formData.get("mode") ?? "edit");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const slug =
    mode === "create"
      ? slugify(String(formData.get("slug") || name))
      : String(formData.get("slug") ?? "");
  if (!slug) return;

  const { error } = await supabase.from("events").upsert(
    {
      slug,
      name,
      blurb: String(formData.get("blurb") ?? ""),
      sort_order: Number(formData.get("sort_order") ?? 0) || 0,
    },
    { onConflict: "slug" },
  );
  if (error) throw new Error(`No se pudo guardar el evento: ${error.message}`);

  revalidateTag("catalog", "max");
  revalidatePath("/admin/eventos");
  redirect("/admin/eventos");
}

export async function reorderEvents(slugs: string[]): Promise<void> {
  const supabase = await createClient();
  await Promise.all(
    slugs.map((slug, i) =>
      supabase.from("events").update({ sort_order: i }).eq("slug", slug),
    ),
  );
  revalidateTag("catalog", "max");
  revalidatePath("/admin/eventos");
}

export async function deleteEvent(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;
  const supabase = await createClient();
  // product_events se borra en cascada; leads.event_slug queda en null.
  await supabase.from("events").delete().eq("slug", slug);
  revalidateTag("catalog", "max");
  revalidatePath("/admin/eventos");
  redirect("/admin/eventos");
}
