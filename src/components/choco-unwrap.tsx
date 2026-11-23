"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* =========================================================================
   Chocolate personalizado — tocá para desenvolver: el papel se ARRUGA
   (filtro SVG feTurbulence + feDisplacementMap) mientras se encoge, gira y
   se descarta, como una envoltura real. Revela la barra con el nombre.
   ========================================================================= */

const FOIL =
  "linear-gradient(135deg, #c9a24a 0%, #e7cf8b 24%, #b8923f 50%, #e7cf8b 76%, #c9a24a 100%)";

function Chocolate({ name, brand }: { name: string; brand: string }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-xl"
      style={{
        background: "linear-gradient(145deg, #4a2c1a 0%, #3a2114 55%, #2c190f 100%)",
        boxShadow: "inset 0 2px 6px rgba(255,255,255,0.12), inset 0 -8px 20px rgba(0,0,0,0.45)",
      }}
    >
      <div className="grid h-full w-full grid-cols-3 grid-rows-4 gap-[3px] p-[3px]">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[3px]"
            style={{
              background: "linear-gradient(145deg, #5a3522, #39200f)",
              boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.18), inset -1px -2px 3px rgba(0,0,0,0.5)",
            }}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="font-display text-xl italic" style={{ color: "#e9d3bf", textShadow: "0 1px 1px rgba(0,0,0,0.5)" }}>
          {name}
        </p>
        <span className="mt-1 h-px w-8" style={{ background: "#e9d3bf66" }} />
        <p className="mt-1 text-[0.55rem] uppercase tracking-[0.25em]" style={{ color: "#e9d3bf99" }}>
          {brand}
        </p>
      </div>
    </div>
  );
}

export function ChocoUnwrap({
  name = "Para Emi",
  brand = "Alma Creativa",
}: {
  name?: string;
  brand?: string;
}) {
  const reduce = useReducedMotion();
  const rawId = useId().replace(/[:]/g, "");
  const filterId = `choco-crumple-${rawId}`;
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);
  const rafRef = useRef(0);
  const [open, setOpen] = useState(false);
  const [filterOn, setFilterOn] = useState(false);

  // Tween manual de la distorsión del papel.
  const tween = (to: number, dur: number, onDone?: () => void) => {
    const el = dispRef.current;
    if (!el) {
      onDone?.();
      return;
    }
    cancelAnimationFrame(rafRef.current);
    const from = Number(el.getAttribute("scale") || 0);
    const start = performance.now();
    const frame = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.setAttribute("scale", String(from + (to - from) * e));
      if (p < 1) rafRef.current = requestAnimationFrame(frame);
      else onDone?.();
    };
    rafRef.current = requestAnimationFrame(frame);
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (reduce) return;
    setFilterOn(true);
    if (next) {
      tween(26, 320);
    } else {
      tween(0, 260, () => setFilterOn(false));
    }
  };

  return (
    <div className="mx-auto w-full" style={{ maxWidth: 220 }}>
      {/* def del filtro de arrugado */}
      <svg aria-hidden width="0" height="0" style={{ position: "absolute" }}>
        <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.016" numOctaves={2} seed={7} result="noise" />
          <feDisplacementMap ref={dispRef} in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <button
        type="button"
        aria-label={open ? "Envolver de nuevo" : "Desenvolver el chocolate"}
        aria-pressed={open}
        onClick={toggle}
        className="relative block aspect-[3/4] w-full cursor-pointer select-none outline-none"
      >
        <Chocolate name={name} brand={brand} />

        {/* papel / foil que se arruga y se descarta */}
        <motion.div
          className="absolute inset-0 overflow-hidden rounded-xl"
          style={{
            background: FOIL,
            boxShadow: "0 10px 30px -14px rgba(33,30,38,0.5)",
            filter: filterOn && !reduce ? `url(#${filterId})` : undefined,
            willChange: "transform, opacity",
          }}
          initial={false}
          animate={
            open
              ? { scale: 0.2, x: 150, y: -180, rotate: 32, opacity: 0 }
              : { scale: 1, x: 0, y: 0, rotate: 0, opacity: 1 }
          }
          transition={{ duration: reduce ? 0 : 0.6, delay: open && !reduce ? 0.14 : 0, ease: [0.4, 0, 0.6, 1] }}
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-60 mix-blend-screen"
            style={{ backgroundImage: "linear-gradient(115deg, transparent 38%, rgba(255,255,255,0.7) 50%, transparent 62%)" }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="font-display text-base tracking-wide" style={{ color: "#4a360f" }}>
              {brand}
            </p>
            <p className="mt-1 text-[0.6rem] uppercase tracking-[0.28em]" style={{ color: "#4a360f99" }}>
              Chocolate
            </p>
          </div>
        </motion.div>
      </button>

      <p className="animate-breathe pointer-events-none mt-3 text-center text-xs text-muted-foreground">
        {open ? "Tocá para envolver" : "Tocá para desenvolver"}
      </p>
    </div>
  );
}
