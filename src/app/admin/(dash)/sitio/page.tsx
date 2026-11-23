import { SiteEditor } from "@/components/admin/site-editor";
import { getSiteContent } from "@/lib/site-content.server";
import { getCategories, getEvents, getProducts } from "@/lib/catalog";

export default async function SitioPage() {
  const [content, categories, events, products] = await Promise.all([
    getSiteContent(),
    getCategories(),
    getEvents(),
    getProducts(),
  ]);
  return (
    <SiteEditor
      initial={content}
      categories={categories}
      events={events}
      products={products}
    />
  );
}
