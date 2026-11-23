import { AppearanceEditor } from "@/components/admin/appearance-editor";
import { getSiteContent } from "@/lib/site-content.server";

export default async function AparienciaPage() {
  const content = await getSiteContent();
  return <AppearanceEditor initial={content} />;
}
