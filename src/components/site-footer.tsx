"use client";

import Link from "next/link";
import { AtSign, MessageCircle, MapPin } from "lucide-react";
import { Wordmark } from "@/components/wordmark";
import { nav } from "@/lib/site";
import { waLink } from "@/lib/site-content";
import { useSiteContent } from "@/components/site-content-provider";

const currentYear = new Date().getFullYear();

export function SiteFooter() {
  const { brand, contact } = useSiteContent();

  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3">
          <Wordmark />
          <p className="max-w-xs text-sm text-muted-foreground">
            {brand.tagline}
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            {brand.city}
          </p>
        </div>

        <nav className="space-y-3">
          <p className="text-sm font-medium">Navegación</p>
          <ul className="space-y-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-3">
          <p className="text-sm font-medium">Contacto</p>
          <ul className="space-y-2">
            <li>
              <Link
                href={waLink(
                  contact.whatsapp,
                  "Hola Alma Creativa, quiero hacer una consulta.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <MessageCircle className="size-4" />
                WhatsApp
              </Link>
            </li>
            <li>
              <Link
                href={`https://instagram.com/${contact.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <AtSign className="size-4" />
                {contact.instagram}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {currentYear} {brand.name}. Todos los derechos reservados.
          </p>
          <p>
            Hecho por{" "}
            <Link
              href="https://creapp.com.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold transition-colors hover:text-foreground"
            >
              CreAPP
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
