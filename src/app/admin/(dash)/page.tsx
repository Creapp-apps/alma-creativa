import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Inbox, Package, Star, Sparkles, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { StatsSkeleton } from "@/components/admin/skeletons";

const fmtDate = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
});

export default function DashboardPage() {
  return (
    <Suspense fallback={<StatsSkeleton />}>
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground">Configurá Supabase.</p>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [leadsTotal, leadsNuevos, prodActivos, prodDestacados, recent] =
    await Promise.all([
      supabase.from("leads").select("*", { count: "exact", head: true }),
      supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("status", "nuevo"),
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("active", true),
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("featured", true),
      supabase
        .from("leads")
        .select("id,name,status,created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const stats = [
    { label: "Leads totales", value: leadsTotal.count ?? 0, icon: Inbox, href: "/admin/leads" },
    { label: "Leads nuevos", value: leadsNuevos.count ?? 0, icon: Sparkles, href: "/admin/leads" },
    { label: "Productos activos", value: prodActivos.count ?? 0, icon: Package, href: "/admin/catalogo" },
    { label: "Destacados", value: prodDestacados.count ?? 0, icon: Star, href: "/admin/catalogo" },
  ];
  const recentRows = (recent.data ?? []) as {
    id: string;
    name: string;
    status: string;
    created_at: string;
  }[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl">Hola de nuevo 👋</h1>
        <p className="text-sm text-muted-foreground">
          Un resumen de Alma Creativa.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <Link href={s.href} className="group block">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className="size-4 text-gold" />
              </div>
              <p className="mt-3 font-display text-3xl tabular-nums">
                {s.value}
              </p>
            </Link>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg">Últimos leads</h2>
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-1.5 text-sm text-gold hover:text-foreground"
          >
            Ver todos
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {recentRows.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Todavía no entró ningún pedido.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {recentRows.map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <span className="truncate text-sm">{l.name}</span>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs capitalize">
                    {l.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {fmtDate.format(new Date(l.created_at))}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
