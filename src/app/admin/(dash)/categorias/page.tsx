import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getIcon } from "@/lib/icons";
import { getCategories } from "@/lib/catalog";
import { ReorderList } from "@/components/admin/reorder-list";
import { reorderCategories } from "@/app/admin/taxonomy-actions";

export default async function CategoriasPage() {
  const cats = await getCategories();

  const rows = cats.map((c) => {
    const Icon = getIcon(c.icon);
    return {
      id: c.slug,
      node: (
        <div className="flex items-center gap-4 py-4 pr-4">
          <div
            className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md"
            style={c.imageUrl ? undefined : { backgroundColor: c.tint }}
          >
            {c.imageUrl ? (
              <Image
                src={c.imageUrl}
                alt={c.name}
                fill
                sizes="48px"
                className="object-cover"
                style={{ objectPosition: c.focal }}
              />
            ) : (
              <Icon className="size-5 text-foreground/55" strokeWidth={1.3} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{c.name}</p>
            <p className="truncate text-sm text-muted-foreground">{c.short}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/admin/categorias/${c.slug}`} />}
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
          <h1 className="font-display text-2xl">Categorías</h1>
          <p className="text-sm text-muted-foreground">
            {cats.length} categorías · arrastrá para reordenar
          </p>
        </div>
        <Button render={<Link href="/admin/categorias/nueva" />}>
          <Plus className="size-4" />
          Nueva categoría
        </Button>
      </header>

      <div className="mt-8">
        {cats.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            Todavía no hay categorías. Creá la primera.
          </div>
        ) : (
          <ReorderList rows={rows} onReorder={reorderCategories} />
        )}
      </div>
    </>
  );
}
