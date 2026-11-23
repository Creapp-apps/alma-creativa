"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  InvitationTemplate,
  TEMPLATES,
  type TemplateId,
} from "@/components/invitation-templates";

/* =========================================================================
   Sobre que se abre — tocá el sobre: la solapa superior se levanta y la
   invitación (estilo clásico, en CSS) sale hacia arriba.
   Sobre de 4 solapas: cerrado oculta por completo la tarjeta (es más chica
   que el sobre, así no se asoma).
   ========================================================================= */

const ENV_W = 224;
const ENV_H = 168;
const CARD_W = 122;
const CARD_H = 162;
const RISE = 158;

export function EnvelopeOpen({
  templateId = "clasica" as TemplateId,
}: {
  templateId?: TemplateId;
}) {
  const [open, setOpen] = useState(false);
  const t = TEMPLATES.find((x) => x.id === templateId) ?? TEMPLATES[0];

  const BACK = "#efe7d6";
  const FLAP = "#f1e7d2";
  const BOTTOM = "#e8ddc5";
  const LEFT = "#ece2cc";
  const RIGHT = "#e5dabf";
  const LINE = "rgba(138,110,53,0.2)";

  return (
    <div className="mx-auto w-full" style={{ maxWidth: ENV_W }}>
      <div
        className="relative"
        style={{ height: ENV_H + RISE, perspective: 1300 }}
      >
        <button
          type="button"
          aria-label={open ? "Cerrar el sobre" : "Abrir el sobre"}
          aria-pressed={open}
          onClick={() => setOpen((o) => !o)}
          className="absolute bottom-0 left-0 cursor-pointer outline-none"
          style={{ width: ENV_W, height: ENV_H, transformStyle: "preserve-3d" }}
        >
          {/* interior / fondo del sobre */}
          <div
            className="absolute inset-0 rounded-md"
            style={{ background: BACK, border: `1px solid ${LINE}`, zIndex: 1 }}
          />

          {/* invitación (detrás del frente cuando está cerrado) */}
          <motion.div
            className="absolute left-1/2 overflow-hidden rounded-lg border border-border bg-card"
            style={{
              width: CARD_W,
              height: CARD_H,
              x: "-50%",
              bottom: (ENV_H - CARD_H) / 2,
              transformOrigin: "center bottom",
              zIndex: 5,
              boxShadow: "0 18px 40px -22px rgba(33,30,38,0.5)",
            }}
            initial={false}
            animate={open ? { y: -RISE, scale: 1.05 } : { y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 170, damping: 22, delay: open ? 0.16 : 0 }}
          >
            {/* la plantilla se diseña para ~304px y se escala para no recortar texto */}
            <div
              style={{
                width: CARD_W * 2,
                height: CARD_H * 2,
                transform: "scale(0.5)",
                transformOrigin: "top left",
              }}
            >
              <InvitationTemplate id={t.id} data={t.sample} />
            </div>
          </motion.div>

          {/* solapas fijas del frente (abajo / izquierda / derecha) */}
          <div className="absolute inset-0" style={{ zIndex: 10, background: BOTTOM, clipPath: "polygon(0% 100%, 100% 100%, 50% 50%)" }} />
          <div className="absolute inset-0" style={{ zIndex: 11, background: LEFT, clipPath: "polygon(0% 0%, 0% 100%, 50% 50%)" }} />
          <div className="absolute inset-0" style={{ zIndex: 11, background: RIGHT, clipPath: "polygon(100% 0%, 100% 100%, 50% 50%)" }} />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ zIndex: 12, clipPath: "polygon(0% 100%, 100% 100%, 50% 50%)", boxShadow: `inset 0 0 0 1px ${LINE}` }}
          />

          {/* solapa superior que se abre */}
          <motion.div
            className="absolute left-0 top-0"
            style={{
              width: ENV_W,
              height: ENV_H / 2 + 2,
              transformOrigin: "top center",
              transformStyle: "preserve-3d",
              background: FLAP,
              clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)",
              boxShadow: "inset 0 -12px 20px -12px rgba(33,30,38,0.22)",
              zIndex: open ? 4 : 20,
            }}
            initial={false}
            animate={open ? { rotateX: -172 } : { rotateX: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {!open ? (
              <span
                className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  width: 26,
                  height: 26,
                  background: "radial-gradient(circle at 35% 30%, #c9a24a, #8a6e35)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                }}
              />
            ) : null}
          </motion.div>
        </button>
      </div>

      <p className="animate-breathe pointer-events-none mt-3 text-center text-xs text-muted-foreground">
        {open ? "Tocá para cerrar" : "Tocá el sobre para abrir"}
      </p>
    </div>
  );
}
