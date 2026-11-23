import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SiteContentProvider } from "@/components/site-content-provider";
import { getSiteContent } from "@/lib/site-content.server";
import { appearanceVars } from "@/lib/site-content";

// Layout del sitio público (con header + footer).
// Provee el contenido editable (autogestión) y aplica la Apariencia (colores,
// tipografía) al árbol del sitio.
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getSiteContent();
  const vars = appearanceVars(content.appearance) as React.CSSProperties;

  return (
    <SiteContentProvider content={content}>
      <div className="flex min-h-dvh flex-col bg-background text-foreground" style={vars}>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </SiteContentProvider>
  );
}
