"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { navGroups } from "@/components/admin/app-sidebar";

function titleFor(pathname: string): string {
  if (pathname === "/admin/catalogo/nuevo") return "Nuevo producto";
  if (/^\/admin\/catalogo\/.+/.test(pathname)) return "Editar producto";

  let best = "";
  let bestLen = -1;
  for (const g of navGroups) {
    for (const i of g.items) {
      const match =
        i.href === "/admin"
          ? pathname === "/admin"
          : pathname === i.href || pathname.startsWith(i.href + "/");
      if (match && i.href.length > bestLen) {
        best = i.title;
        bestLen = i.href.length;
      }
    }
  }
  return best || "Back-office";
}

export function DashHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-4" />
      <h1 className="font-display text-base">{titleFor(pathname)}</h1>
    </header>
  );
}
