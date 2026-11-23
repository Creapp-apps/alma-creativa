import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getEvents } from "@/lib/catalog";
import { ListSkeleton } from "@/components/admin/skeletons";
import {
  ProductionBoard,
  type KanbanCard,
} from "@/components/admin/production-board";

export default function AdminTableroPage() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <TableroView />
    </Suspense>
  );
}

type Row = {
  id: string;
  name: string;
  event_slug: string | null;
  event_date: string | null;
  guests: number | null;
  production_stage: string | null;
  source: string | null;
  lead_items: { product_name: string; qty: number }[] | null;
};

async function TableroView() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <h1 className="font-display text-xl">Tablero</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Supabase no está configurado. Cargá las variables en{" "}
          <code>.env.local</code> para ver el tablero de producción.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [{ data: leads }, events] = await Promise.all([
    supabase
      .from("leads")
      .select(
        "id,name,event_slug,event_date,guests,production_stage,source,created_at,lead_items(product_name,qty)",
      )
      .order("created_at", { ascending: false }),
    getEvents(),
  ]);

  const eventName = (s: string | null) =>
    s ? (events.find((e) => e.slug === s)?.name ?? s) : null;

  const cards: KanbanCard[] = ((leads ?? []) as unknown as Row[]).map((l) => ({
    id: l.id,
    name: l.name,
    stage: l.production_stage ?? "pendiente",
    source: l.source ?? "web",
    event: eventName(l.event_slug),
    eventDate: l.event_date,
    guests: l.guests,
    items: (l.lead_items ?? []).map((it) => ({
      name: it.product_name,
      qty: it.qty,
    })),
  }));

  return <ProductionBoard cards={cards} />;
}
