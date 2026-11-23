import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEvents } from "@/lib/catalog";
import { ReorderList } from "@/components/admin/reorder-list";
import { reorderEvents } from "@/app/admin/taxonomy-actions";

export default async function EventosPage() {
  const evs = await getEvents();

  const rows = evs.map((e) => ({
    id: e.slug,
    node: (
      <div className="flex items-center gap-4 py-4 pr-4">
        <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary">
          {e.imageUrl ? (
            <Image
              src={e.imageUrl}
              alt={e.name}
              fill
              sizes="48px"
              className="object-cover"
              style={{ objectPosition: e.focal }}
            />
          ) : (
            <PartyPopper
              className="size-5 text-muted-foreground"
              strokeWidth={1.3}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{e.name}</p>
          <p className="truncate text-sm text-muted-foreground">{e.blurb}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          render={<Link href={`/admin/eventos/${e.slug}`} />}
        >
          <Pencil className="size-3.5" />
          Editar
        </Button>
      </div>
    ),
  }));

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl">Eventos</h1>
          <p className="text-sm text-muted-foreground">
            {evs.length} eventos · arrastrá para reordenar
          </p>
        </div>
        <Button render={<Link href="/admin/eventos/nuevo" />}>
          <Plus className="size-4" />
          Nuevo evento
        </Button>
      </header>

      <div className="mt-8">
        {evs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            Todavía no hay eventos. Creá el primero.
          </div>
        ) : (
          <ReorderList rows={rows} onReorder={reorderEvents} />
        )}
      </div>
    </>
  );
}
