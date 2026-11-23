import { Suspense } from "react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CategoryForm } from "@/components/admin/category-form";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { FormSkeleton } from "@/components/admin/skeletons";

type Params = { params: Promise<{ slug: string }> };

type Row = {
  slug: string;
  name: string;
  short: string;
  icon: string;
  tint: string;
  sort_order: number;
  image_url: string | null;
  focal: string;
};

export default function Page({ params }: Params) {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <Loader params={params} />
    </Suspense>
  );
}

async function Loader({ params }: Params) {
  if (!isSupabaseConfigured()) {
    return <p className="text-sm text-muted-foreground">Configurá Supabase.</p>;
  }
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const isNew = slug === "nueva";
  let row: Row | null = null;
  let productCount = 0;

  if (!isNew) {
    const [cat, prods] = await Promise.all([
      supabase
        .from("categories")
        .select("slug,name,short,icon,tint,sort_order,image_url,focal")
        .eq("slug", slug)
        .maybeSingle(),
      supabase
        .from("products")
        .select("slug", { count: "exact", head: true })
        .eq("category_slug", slug),
    ]);
    row = (cat.data as unknown as Row) ?? null;
    if (!row) notFound();
    productCount = prods.count ?? 0;
  }

  const initial = row
    ? {
        mode: "edit" as const,
        slug: row.slug,
        name: row.name,
        short: row.short,
        icon: row.icon,
        tint: row.tint,
        sortOrder: row.sort_order,
        imageUrl: row.image_url,
        focal: row.focal,
      }
    : {
        mode: "create" as const,
        slug: "",
        name: "",
        short: "",
        icon: "Gift",
        tint: "#efeae1",
        sortOrder: 99,
        imageUrl: null,
        focal: "50% 50%",
      };

  return (
    <>
      <Link
        href="/admin/categorias"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a categorías
      </Link>
      <h1 className="mt-4 font-display text-2xl">
        {isNew ? "Nueva categoría" : "Editar categoría"}
      </h1>
      <div className="mt-8">
        <CategoryForm initial={initial} productCount={productCount} />
      </div>
    </>
  );
}
