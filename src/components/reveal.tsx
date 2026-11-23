"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { JSX, ReactNode } from "react";

// Etiquetas HTML admitidas. Usar el proxy estático motion[tag] (cacheado)
// evita recrear el componente en cada render.
type Tag = keyof JSX.IntrinsicElements;
const m = motion as unknown as Record<Tag, React.ElementType>;

/* =========================================================================
   SISTEMA DE ENTRADA (fade-in congruente)
   Criterio: títulos, subtítulos, descripciones y tarjetas entran con un
   fade + leve desplazamiento al aparecer en pantalla. Mismo enfoque que
   usamos en DentalIA, adaptado a los tokens de movimiento de la marca.
   Respeta prefers-reduced-motion (sin desplazamiento, aparición directa).
   ========================================================================= */

// Curva de salida de la marca (coincide con --ease-out de globals.css).
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  as?: Tag;
  /** Retraso en segundos antes de animar. */
  delay?: number;
  /** Desplazamiento vertical inicial en px. */
  y?: number;
  /** Duración en segundos. */
  duration?: number;
  /**
   * Si es true, anima apenas monta (ideal para el hero, contenido visible
   * al cargar). Si es false, espera a entrar en el viewport (secciones).
   */
  immediate?: boolean;
};

/** Bloque individual que entra con fade + desplazamiento. */
export function Reveal({
  children,
  className,
  as = "div",
  delay = 0,
  y = 24,
  duration = 0.6,
  immediate = false,
}: RevealProps) {
  const reduce = useReducedMotion();
  const MotionTag = m[as];

  const hidden = { opacity: 0, y: reduce ? 0 : y };
  const shown = { opacity: 1, y: 0 };

  const viewport = immediate ? undefined : { once: true, margin: "-80px" };

  return (
    <MotionTag
      className={className}
      initial={hidden}
      {...(immediate
        ? { animate: shown }
        : { whileInView: shown, viewport })}
      transition={{ duration, delay, ease: EASE_OUT }}
    >
      {children}
    </MotionTag>
  );
}

/* ---- Grupo con escalonado (stagger) para encabezados y grillas ---- */

const groupVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

type RevealGroupProps = {
  children: ReactNode;
  className?: string;
  as?: Tag;
  /** true = anima al montar (hero); false = al entrar en viewport. */
  immediate?: boolean;
};

/**
 * Contenedor que escalona la entrada de sus <RevealItem> hijos.
 * Útil para el bloque de texto del hero y para grillas de tarjetas.
 */
export function RevealGroup({
  children,
  className,
  as = "div",
  immediate = false,
}: RevealGroupProps) {
  const MotionTag = m[as];
  const viewport = immediate ? undefined : { once: true, margin: "-80px" };

  return (
    <MotionTag
      className={className}
      variants={groupVariants}
      initial="hidden"
      {...(immediate
        ? { animate: "visible" }
        : { whileInView: "visible", viewport })}
    >
      {children}
    </MotionTag>
  );
}

type RevealFrom = "up" | "left" | "right" | "fade";

type RevealItemProps = {
  children: ReactNode;
  className?: string;
  as?: Tag;
  /** Dirección de entrada. "up" = fade+sube, "left/right" = slide lateral, "fade" = solo opacidad. */
  from?: RevealFrom;
  /** Distancia del desplazamiento en px (según la dirección). */
  distance?: number;
};

/** Hijo de <RevealGroup>: entra escalonado según su orden. */
export function RevealItem({
  children,
  className,
  as = "div",
  from = "up",
  distance = 28,
}: RevealItemProps) {
  const reduce = useReducedMotion();
  const MotionTag = m[as];

  const offset = reduce ? {} : offsetFor(from, distance);

  const itemVariants: Variants = {
    hidden: { opacity: 0, ...offset },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.5, ease: EASE_OUT },
    },
  };

  return (
    <MotionTag className={className} variants={itemVariants}>
      {children}
    </MotionTag>
  );
}

function offsetFor(from: RevealFrom, d: number) {
  switch (from) {
    case "left":
      return { x: -d };
    case "right":
      return { x: d };
    case "fade":
      return {};
    case "up":
    default:
      return { y: d };
  }
}
