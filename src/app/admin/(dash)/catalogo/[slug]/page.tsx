import { Suspense } from "react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { FormSkeleton } from "@/components/admin/skeletons";
import { getCategories, getEvents } from "@/lib/catalog";

type Params = { params: Promise<{ slug: string }> };

type ProductRow = {
  slug: string;
  name: string;
  category_slug: string;
  blurb: string;
  details: string[];
  price_note: string;
  price_from: number;
  featured: boolean;
  active: boolean;
  image_url: string | null;
  focal: string;
  product_events: { event_slug: string }[] | null;
};

export default function Page({ params }: Params) {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <FormLoader params={params} />
    </Suspense>
  );
}

async function FormLoader({ params }: Params) {
  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">Configurá Supabase.</p>
    );
  }

  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const isNew = slug === "nuevo";
  const [categories, events] = await Promise.all([
    getCategories(),
    getEvents(),
  ]);

  let product: ProductRow | null = null;
  if (!isNew) {
    const { data } = await supabase
      .from("products")
      .select(
        "slug,name,category_slug,blurb,details,price_note,price_from,featured,active,image_url,focal,product_events(event_slug)",
      )
      .eq("slug", slug)
      .maybeSingle();
    product = (data as unknown as ProductRow) ?? null;
    if (!product) notFound();
  }

  const initial = product
    ? {
        mode: "edit" as const,
        slug: product.slug,
        name: product.name,
        category: product.category_slug,
        blurb: product.blurb,
        details: (product.details ?? []).join("\n"),
        priceNote: product.price_note,
        priceFrom: product.price_from,
        featured: product.featured,
        active: product.active,
        events: (product.product_events ?? []).map((e) => e.event_slug),
        imageUrl: product.image_url,
        focal: product.focal,
      }
    : {
        mode: "create" as const,
        focal: "50% 50%",
        slug: "",
        name: "",
        category: categories[0]?.slug ?? "",
        blurb: "",
        details: "",
        priceNote: "Presupuesto a medida",
        priceFrom: 0,
        featured: false,
        active: true,
        events: [],
        imageUrl: null,
      };

  return (
    <>
      <Link
        href="/admin/catalogo"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver al catálogo
      </Link>
      <h1 className="mt-4 font-display text-2xl">
        {isNew ? "Nuevo producto" : "Editar producto"}
      </h1>
      <div className="mt-8">
        <ProductForm
          initial={initial}
          categories={categories}
          events={events}
        />
      </div>
    </>
  );
}
