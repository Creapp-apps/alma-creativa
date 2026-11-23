"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PenTool, Printer, PackageCheck, type LucideIcon } from "lucide-react";

/* =========================================================================
   CÓMO PEDIR — tarjetas-paso descriptivas (inspiradas en el "how it works"
   de 21st.dev) restyleadas a la marca: crema/dorado/serif, ícono + número,
   intercaladas (zigzag) con conector punteado animado. Compacto (3 pasos,
   sin scroll largo).
   ========================================================================= */

const ICONS: LucideIcon[] = [PenTool, Printer, PackageCheck];
// Zigzag: 01 arriba, 02 abajo, 03 arriba (solo desktop).
const OFFSET = ["md:mt-0", "md:mt-24", "md:mt-0"];
const ROTATE = ["md:rotate-[1.8deg]", "md:-rotate-[1.6deg]", "md:rotate-[1.8deg]"];

type Step = { title: string; text: string };

export function ComoPedir({ steps }: { steps: Step[] }) {
  const reduce = useReducedMotion();
  const data = steps.slice(0, 3);

  return (
    <div className="relative mt-12 md:pb-16">
      {/* conector punteado animado que teje entre las tarjetas (solo desktop) */}
      {data.length > 1 ? (
        <svg
          className="pointer-events-none absolute left-0 right-0 top-[70px] hidden h-[220px] w-full md:block"
          viewBox="0 0 1000 220"
          preserveAspectRatio="none"
          aria-hidden
        >
          <motion.path
            d="M 175 34 C 320 34, 360 150, 500 162 C 640 150, 680 34, 825 34"
            stroke="currentColor"
            className="text-gold/80"
            strokeWidth="3"
            strokeDasharray="9 7"
            fill="none"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={{ strokeDashoffset: 0 }}
            animate={reduce ? undefined : { strokeDashoffset: -160 }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      ) : null}

      <ol className="relative z-10 grid gap-6 md:grid-cols-3 md:items-start">
        {data.map((step, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <motion.li
              key={step.title}
              className={OFFSET[i]}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : i * 0.14 }}
            >
              <div
                className={`group h-full rounded-2xl border border-border bg-card p-6 shadow-[0_18px_50px_-30px_rgba(33,30,38,0.5)] transition-transform duration-300 hover:-translate-y-1 ${ROTATE[i]}`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
                    <Icon className="size-5" strokeWidth={1.5} />
                  </span>
                  <span className="font-display text-3xl text-gold/80">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-xl">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
