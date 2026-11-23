import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Plus, Pencil, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getIcon } from "@/lib/icons";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCategories } from "@/lib/catalog";
import { ReorderList } from "@/components/admin/reorder-list";
import { reorderProducts } from "@/app/admin/catalogo-actions";
import { ListSkeleton } from "@/components/admin/skeletons";

type Row = {
  slug: string;
  name: string;
  category_slug: string;
  featured: boolean;
  active: boolean;
  image_url: string | null;
  focal: string;
};

export default function AdminCatalogoPage() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <CatalogView />
    </Suspense>
  );
}

async function CatalogView() {
  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">
        Configurá Supabase para administrar el catálogo.
      </p>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [{ data: products }, categories] = await Promise.all([
    supabase
      .from("products")
      .select("slug,name,category_slug,featured,active,image_url,focal")
      .order("sort_order"),
    getCategories(),
  ]);

  const catMap = new Map(categories.map((c) => [c.slug, c]));
  const list = (products ?? []) as Row[];

  const rows = list.map((p) => {
    const cat = catMap.get(p.category_slug);
    const Icon = getIcon(cat?.icon ?? "Package");
    return {
      id: p.slug,
      node: (
        <div className="flex items-center gap-4 py-4 pr-4">
          <div
            className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md"
            style={{ backgroundColor: cat?.tint ?? "#efeae1" }}
          >
            {p.image_url ? (
              <Image
                src={p.image_url}
                alt={p.name}
                fill
                sizes="48px"
                className="object-cover"
                style={{ objectPosition: p.focal }}
              />
            ) : (
              <Icon className="size-5 text-foreground/55" strokeWidth={1.3} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium">{p.name}</p>
              {p.featured ? (
                <Star className="size-3.5 fill-gold text-gold" />
              ) : null}
              {!p.active ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[0.7rem] text-muted-foreground">
                  inactivo
                </span>
              ) : null}
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {cat?.name ?? p.category_slug}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/admin/catalogo/${p.slug}`} />}
          >
            <Pencil className="size-3.5" />
            Editar
          </Button>
        </div>
      ),
    };
  });

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl">Catálogo</h1>
          <p className="text-sm text-muted-foreground">
            {list.length} productos · arrastrá para reordenar
          </p>
        </div>
        <Button render={<Link href="/admin/catalogo/nuevo" />}>
          <Plus className="size-4" />
          Nuevo producto
        </Button>
      </header>

      <div className="mt-8">
        {list.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            Todavía no hay productos. Creá el primero.
          </div>
        ) : (
          <ReorderList rows={rows} onReorder={reorderProducts} />
        )}
      </div>
    </>
  );
}
