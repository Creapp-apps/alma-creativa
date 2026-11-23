import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getEvents, getProducts } from "@/lib/catalog";
import { LeadsBoard, type Lead } from "@/components/admin/leads-board";

const SELECT =
  "id,name,phone,email,event_slug,event_date,guests,comments,notes,status,production_stage,created_at,source,lead_items(product_slug,product_name,qty)";

// Board compartido entre Leads (chats: source != 'web') y Pedidos (web).
export async function LeadsView({ kind }: { kind: "leads" | "pedidos" }) {
  const title = kind === "pedidos" ? "Pedidos" : "Leads";

  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <h1 className="font-display text-xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Supabase no está configurado. Cargá las variables en{" "}
          <code>.env.local</code> para ver{" "}
          {kind === "pedidos" ? "los pedidos" : "los leads"}.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const base = supabase.from("leads").select(SELECT);
  const query =
    kind === "pedidos" ? base.eq("source", "web") : base.neq("source", "web");

  const [{ data: leads }, events, products] = await Promise.all([
    query.order("created_at", { ascending: false }),
    getEvents(),
    getProducts(),
  ]);

  return (
    <LeadsBoard
      kind={kind}
      leads={(leads ?? []) as unknown as Lead[]}
      events={events.map((e) => ({ slug: e.slug, name: e.name }))}
      products={products.map((p) => ({ slug: p.slug, name: p.name }))}
      userEmail={user.email ?? "staff"}
    />
  );
}
