import "server-only";
import { cacheTag } from "next/cache";
import {
  categories as mockCategories,
  events as mockEvents,
  products as mockProducts,
  type Category,
  type EventType,
  type Product,
} from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createPublicClient } from "@/lib/supabase/public";

// Capa de acceso al catálogo.
// Lee de Supabase si está configurado; si no, cae al MOCK (src/lib/data.ts).
// Las funciones son cacheables ("use cache") porque el catálogo cambia poco.

const PRODUCT_SELECT =
  "slug,name,category_slug,blurb,details,price_note,price_from,featured,image_url,focal,categories(name,icon,tint),product_events(event_slug)";

type ProductRow = {
  slug: string;
  name: string;
  category_slug: string;
  blurb: string;
  details: string[];
  price_note: string;
  price_from: number;
  featured: boolean;
  image_url: string | null;
  focal: string;
  categories: { name: string; icon: string; tint: string } | null;
  product_events: { event_slug: string }[] | null;
};

function mapProduct(r: ProductRow): Product {
  return {
    slug: r.slug,
    name: r.name,
    category: r.category_slug,
    categoryName: r.categories?.name ?? r.category_slug,
    categoryIcon: r.categories?.icon ?? "Package",
    categoryTint: r.categories?.tint ?? "#efeae1",
    events: (r.product_events ?? []).map((e) => e.event_slug),
    blurb: r.blurb,
    details: r.details ?? [],
    priceNote: r.price_note,
    priceFrom: Number(r.price_from) || 0,
    featured: r.featured,
    imageUrl: r.image_url ?? null,
    focal: r.focal ?? "50% 50%",
  };
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheTag("catalog");
  if (!isSupabaseConfigured()) return mockCategories;
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("slug,name,short,icon,tint,image_url,focal")
    .order("sort_order");
  if (error || !data) return mockCategories;
  return data.map((c) => ({
    slug: c.slug,
    name: c.name,
    short: c.short,
    icon: c.icon,
    tint: c.tint,
    imageUrl: c.image_url ?? null,
    focal: c.focal ?? "50% 50%",
  }));
}

export async function getEvents(): Promise<EventType[]> {
  "use cache";
  cacheTag("catalog");
  if (!isSupabaseConfigured()) return mockEvents;
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("events")
    .select("slug,name,blurb,image_url,focal")
    .order("sort_order");
  if (error || !data) return mockEvents;
  return data.map((e) => ({
    slug: e.slug,
    name: e.name,
    blurb: e.blurb,
    imageUrl: e.image_url ?? null,
    focal: e.focal ?? "50% 50%",
  }));
}

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheTag("catalog");
  if (!isSupabaseConfigured()) return mockProducts;
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("active", true)
    .order("sort_order");
  if (error || !data) return mockProducts;
  return (data as unknown as ProductRow[]).map(mapProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const all = await getProducts();
  return all.filter((p) => p.featured);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  "use cache";
  cacheTag("catalog");
  if (!isSupabaseConfigured()) {
    return mockProducts.find((p) => p.slug === slug) ?? null;
  }
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  if (error || !data) return null;
  return mapProduct(data as unknown as ProductRow);
}
