"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  ShoppingBag,
  KanbanSquare,
  Package,
  Tags,
  Globe,
  Palette,
  Settings,
  Users,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

type Item = { title: string; href: string; icon: LucideIcon };
type Group = { label: string; items: Item[] };

export const navGroups: Group[] = [
  {
    label: "General",
    items: [{ title: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Comercial",
    items: [
      { title: "Leads", href: "/admin/leads", icon: Inbox },
      { title: "Pedidos", href: "/admin/pedidos", icon: ShoppingBag },
      { title: "Tablero", href: "/admin/tablero", icon: KanbanSquare },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { title: "Productos", href: "/admin/catalogo", icon: Package },
      { title: "Categorías", href: "/admin/categorias", icon: Tags },
    ],
  },
  {
    label: "Sitio web",
    items: [
      { title: "Contenido", href: "/admin/sitio", icon: Globe },
      { title: "Apariencia", href: "/admin/apariencia", icon: Palette },
    ],
  },
  {
    label: "Configuración",
    items: [
      { title: "General", href: "/admin/configuracion", icon: Settings },
      { title: "Usuarios", href: "/admin/usuarios", icon: Users },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppSidebar({
  footer,
  badges,
}: {
  footer?: React.ReactNode;
  badges?: Record<string, number>;
}) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/admin" />}
              tooltip="Alma Creativa"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-display text-sm">
                  Alma Creativa
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Back-office
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const count = badges?.[item.href] ?? 0;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive(pathname, item.href)}
                      tooltip={item.title}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {count > 0 ? (
                      <SidebarMenuBadge className="animate-breathe bg-gold text-black">
                        {count}
                      </SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>{footer}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
