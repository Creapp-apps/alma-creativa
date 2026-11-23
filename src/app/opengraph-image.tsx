import { ImageResponse } from "next/og";
import { getSiteContent } from "@/lib/site-content.server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Alma Creativa — Papelería para eventos";

export default async function OgImage() {
  let content;
  try {
    content = await getSiteContent();
  } catch {
    content = null;
  }
  const brand = content?.brand ?? {
    name: "Alma Creativa",
    tagline: "Papelería creativa para eventos que se recuerdan",
    city: "Buenos Aires, Argentina",
  };
  const colors = content?.appearance.colors ?? {
    paper: "#faf7f2",
    ink: "#211e26",
    gold: "#8a6e35",
  };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: colors.paper,
          color: colors.ink,
          padding: "80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            fontSize: 24,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: colors.gold,
            fontFamily: "Helvetica, Arial, sans-serif",
          }}
        >
          <div style={{ width: 48, height: 2, backgroundColor: colors.gold }} />
          Papelería para eventos · {brand.city}
        </div>
        <div style={{ marginTop: 28, fontSize: 92, lineHeight: 1.02, fontWeight: 600 }}>
          {brand.name}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 34,
            maxWidth: 820,
            color: colors.ink,
            opacity: 0.8,
            fontFamily: "Helvetica, Arial, sans-serif",
          }}
        >
          {brand.tagline}
        </div>
        <div
          style={{
            marginTop: "auto",
            fontSize: 22,
            color: colors.ink,
            opacity: 0.55,
            fontFamily: "Helvetica, Arial, sans-serif",
          }}
        >
          almacreativa.com.ar
        </div>
      </div>
    ),
    size,
  );
}
