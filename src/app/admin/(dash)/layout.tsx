import { Suspense } from "react";
import { Toaster } from "sonner";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { SidebarUser } from "@/components/admin/sidebar-user";
import { DashHeader } from "@/components/admin/dash-header";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// Área admin: lee la sesión (cookies) en el server, no se puede prerenderizar
// en el shell estático. Ruta bloqueante bajo Cache Components.
// TODO: migrar a streaming de los datos de sesión detrás de <Suspense>.
export const instant = false;

// Pedidos web "sin accionar" (todavía en etapa pendiente) → badge breathe.
async function getSidebarBadges(): Promise<Record<string, number>> {
  if (!isSupabaseConfigured()) return {};
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};
  const [{ count: pedidos }, convos] = await Promise.all([
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("source", "web")
      .eq("production_stage", "pendiente"),
    supabase.from("conversations").select("unread").gt("unread", 0),
  ]);
  const unread = (convos.data ?? []).reduce(
    (n, c) => n + (c.unread || 0),
    0,
  );
  const badges: Record<string, number> = {};
  if (pedidos) badges["/admin/pedidos"] = pedidos;
  if (unread) badges["/admin/leads"] = unread;
  return badges;
}

export default async function DashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const badges = await getSidebarBadges();
  return (
    <TooltipProvider delay={0}>
      <SidebarProvider>
        <Suspense fallback={null}>
          <AppSidebar
            badges={badges}
            footer={
              <Suspense fallback={null}>
                <SidebarUser />
              </Suspense>
            }
          />
        </Suspense>
        <SidebarInset>
          <Suspense
            fallback={<div className="h-14 border-b border-border" />}
          >
            <DashHeader />
          </Suspense>
          <div className="p-4 sm:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster richColors closeButton position="top-right" />
    </TooltipProvider>
  );
}
