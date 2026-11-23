"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, Hand } from "lucide-react";
import BounceCards from "@/components/bounce-cards";
import {
  InvitationPreview,
  MesaSample,
  type StudioTab,
} from "@/components/invitation-preview";
import {
  TEMPLATES,
  InvitationTemplate,
  type TemplateId,
} from "@/components/invitation-templates";

/* =========================================================================
   HERO STUDIO
   Fan de tarjetas (BounceCards) con los productos de Alma en CSS. Al tocar
   una tarjeta se abre un modal central con el personalizador vivo
   (InvitationPreview) ya posicionado en ese producto.
   ========================================================================= */

// Tamaño de referencia con el que están diseñadas las plantillas (igual que
// el TiltCard real, aspecto 3:4). El fan las muestra a escala.
const DESIGN_W = 320;
const DESIGN_H = 427;

// Medidas de las tarjetas del fan.
const CARD_W = 160;
const CARD_H = Math.round((CARD_W * DESIGN_H) / DESIGN_W); // 213

type FanItem =
  | { kind: "invitacion"; templateId: TemplateId; label: string }
  | { kind: "mesa"; label: string };

// Orden del fan: la de mesa queda al centro (tarjeta más derecha/erguida).
const FAN: FanItem[] = [
  { kind: "invitacion", templateId: "clasica", label: "Invitación clásica" },
  { kind: "invitacion", templateId: "noche", label: "Invitación noche" },
  { kind: "mesa", label: "Número de mesa" },
  { kind: "invitacion", templateId: "primavera", label: "Invitación primavera" },
  { kind: "invitacion", templateId: "gotica", label: "Invitación gótica" },
];

// Escala una pieza diseñada a DESIGN_W×DESIGN_H para que llene la tarjeta.
function Scaled({ children }: { children: ReactNode }) {
  const scale = CARD_W / DESIGN_W;
  return (
    <div
      style={{
        width: DESIGN_W,
        height: DESIGN_H,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {children}
    </div>
  );
}

function fanNode(item: FanItem): ReactNode {
  if (item.kind === "mesa") {
    return (
      <Scaled>
        <MesaSample />
      </Scaled>
    );
  }
  const t = TEMPLATES.find((x) => x.id === item.templateId)!;
  return (
    <Scaled>
      <InvitationTemplate id={t.id} data={t.sample} />
    </Scaled>
  );
}

export function HeroStudio() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [studio, setStudio] = useState<{
    tab: StudioTab;
    template?: TemplateId;
  }>({ tab: "invitacion", template: TEMPLATES[0].id });

  const triggerRef = useRef<Element | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  function handleCardClick(index: number) {
    const item = FAN[index];
    triggerRef.current = document.activeElement;
    if (item.kind === "mesa") {
      setStudio({ tab: "mesa" });
    } else {
      setStudio({ tab: "invitacion", template: item.templateId });
    }
    setOpen(true);
  }

  // Bloqueo de scroll + Escape + foco mientras el modal está abierto.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
      // devolver el foco a la tarjeta que abrió el modal
      (triggerRef.current as HTMLElement | null)?.focus?.();
    };
  }, [open]);

  const cards = FAN.map((item) => ({ node: fanNode(item), label: item.label }));

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="flex items-center justify-center" style={{ minHeight: 340 }}>
        <BounceCards
          cards={cards}
          containerWidth={420}
          containerHeight={320}
          cardWidth={CARD_W}
          cardHeight={CARD_H}
          spread={56}
          rotation={9}
          arc={24}
          pushDistance={110}
          hoverScale={1.07}
          bounciness={0.6}
          borderWidth={7}
          borderColor="#ffffff"
          radius={16}
          onCardClick={handleCardClick}
        />
      </div>

      <p className="animate-breathe mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Hand className="size-4 text-gold" strokeWidth={1.6} />
        Tocá una tarjeta y personalizala
      </p>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => setOpen(false)}
              className="absolute inset-0 cursor-default bg-primary/40 backdrop-blur-sm"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Personalizá tu diseño"
              initial={{ opacity: 0, y: reduce ? 0 : 16, scale: reduce ? 1 : 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: reduce ? 0 : 12, scale: reduce ? 1 : 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-[0_40px_90px_-30px_rgba(33,30,38,0.6)] sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gold">
                    <span className="h-px w-5 bg-gold" />
                    Probá cómo se ve
                  </p>
                  <h3 className="mt-2 font-display text-2xl md:text-3xl">
                    Personalizá tu diseño
                  </h3>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar"
                  className="rounded-full border border-border bg-card p-2 text-muted-foreground transition-colors hover:border-gold/40 hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="mt-6">
                <InvitationPreview
                  initialTab={studio.tab}
                  initialTemplate={studio.template}
                />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
