import { ImageResponse } from "next/og";
import { getProductBySlug } from "@/lib/catalog";
import { getSiteContent } from "@/lib/site-content.server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Producto · Alma Creativa";

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, content] = await Promise.all([
    getProductBySlug(slug).catch(() => null),
    getSiteContent().catch(() => null),
  ]);

  const colors = content?.appearance.colors ?? {
    paper: "#faf7f2",
    ink: "#211e26",
    gold: "#8a6e35",
  };
  const brandName = content?.brand.name ?? "Alma Creativa";
  const name = product?.name ?? "Alma Creativa";
  const category = product?.categoryName ?? "Papelería para eventos";
  const tint = product?.categoryTint ?? "#e9dcc0";
  const priceNote = product?.priceNote ?? "";
  const sans = "Helvetica, Arial, sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: colors.paper,
          color: colors.ink,
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "80px",
          }}
        >
          <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 24,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: colors.gold,
                fontFamily: sans,
              }}
            >
              {category}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 20,
                fontSize: 70,
                lineHeight: 1.05,
                fontWeight: 600,
              }}
            >
              {name}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 20,
                fontSize: 30,
                color: colors.gold,
                fontFamily: sans,
              }}
            >
              {priceNote}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              opacity: 0.6,
              fontFamily: sans,
            }}
          >
            {brandName} · almacreativa.com.ar
          </div>
        </div>
        <div style={{ display: "flex", width: 360, backgroundColor: tint }} />
      </div>
    ),
    size,
  );
}
