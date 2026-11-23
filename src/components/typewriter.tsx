// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { JSX } from "react";

/* =========================================================================
   TYPEWRITER — escribe el texto letra por letra al entrar en viewport.
   Reserva el alto final (texto fantasma) para no generar saltos de layout.
   Respeta prefers-reduced-motion: muestra el texto completo al instante.
   ========================================================================= */

type Tag = keyof JSX.IntrinsicElements;

type Props = {
  text: string;
  className?: string;
  as?: Tag;
  /** Milisegundos por caracter. */
  speed?: number;
  /** Retraso en ms antes de empezar a escribir (desde que entra en viewport). */
  startDelay?: number;
  /** Mostrar cursor parpadeante mientras escribe. */
  cursor?: boolean;
};

export function Typewriter({
  text,
  className,
  as = "p",
  speed = 26,
  startDelay = 0,
  cursor = true,
}: Props) {
  const reduce = useReducedMotion();
  const Tag = as;
  const ref = useRef<HTMLElement>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  // Dispara una sola vez cuando el elemento entra en viewport.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "-40px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Escribe caracter por caracter.
  useEffect(() => {
    if (!started) return;
    if (reduce) {
      setCount(text.length);
      return;
    }
    let i = 0;
    let interval: ReturnType<typeof setInterval>;
    const startTimer = setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= text.length) clearInterval(interval);
      }, speed);
    }, startDelay);
    return () => {
      clearTimeout(startTimer);
      clearInterval(interval);
    };
  }, [started, reduce, text, speed, startDelay]);

  const done = count >= text.length;
  const typed = text.slice(0, count);

  return (
    <Tag ref={ref as never} className={`relative ${className ?? ""}`}>
      {/* Fantasma: reserva el espacio del texto completo sin mostrarlo. */}
      <span aria-hidden className="invisible">
        {text}
      </span>
      {/* Texto que se escribe, superpuesto. */}
      <span className="absolute inset-0">
        {typed}
        {cursor && !reduce && !done && (
          <span
            aria-hidden
            className="ml-0.5 inline-block w-px animate-pulse align-baseline text-current"
            style={{ borderRight: "1.5px solid currentColor", opacity: 0.7 }}
          >
            &nbsp;
          </span>
        )}
      </span>
    </Tag>
  );
}
