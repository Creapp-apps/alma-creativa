"use client";

import Image from "next/image";
import { useSiteContent } from "@/components/site-content-provider";

// Logotipo: imagen subida desde Apariencia (tiene prioridad) o, por defecto,
// el isotipo oficial de la marca junto al nombre.
export function Wordmark({ className }: { className?: string }) {
  const { brand, appearance } = useSiteContent();

  // Logo custom cargado por el cliente desde el panel de Apariencia.
  if (appearance.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={appearance.logoUrl}
        alt={brand.name}
        className={`h-9 w-auto object-contain ${className ?? ""}`}
      />
    );
  }

  // Isotipo oficial + nombre.
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <Image
        src="/brand/alma-isotipo.png"
        alt=""
        width={261}
        height={198}
        priority
        className="h-9 w-auto object-contain"
      />
      <span className="inline-flex items-baseline gap-2">
        <span className="font-display text-xl leading-none font-medium tracking-tight">
          {brand.name}
        </span>
        <span
          aria-hidden
          className="hidden text-[0.7rem] uppercase tracking-[0.22em] text-gold sm:inline"
        >
          eventos
        </span>
      </span>
    </span>
  );
}
