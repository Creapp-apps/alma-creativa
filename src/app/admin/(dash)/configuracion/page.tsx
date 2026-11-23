import { BusinessEditor } from "@/components/admin/business-editor";
import { getBusinessSettings } from "@/lib/business.server";
import { getSiteContent } from "@/lib/site-content.server";

export default async function ConfiguracionPage() {
  const [business, site] = await Promise.all([
    getBusinessSettings(),
    getSiteContent(),
  ]);

  return (
    <BusinessEditor
      initial={business}
      publicData={{
        name: site.brand.name,
        whatsapp: site.contact.whatsapp,
        email: site.contact.email,
        instagram: site.contact.instagram,
      }}
    />
  );
}
