"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

/* =========================================================================
   Raspadita — tarjeta para rascar. Un canvas cubre el contenido; al arrastrar
   el dedo/mouse se borra la cobertura y se revela el premio. Al ~55% raspado,
   se limpia solo el resto.
   ========================================================================= */

type Props = {
  children: ReactNode; // lo que se revela
  coverColor?: string;
  coverTo?: string;
  accent?: string;
  label?: string;
  hint?: string;
  radius?: number; // radio del "dedo" al rascar
  threshold?: number; // fracción para autorevelar
  onComplete?: () => void;
};

export function ScratchCard({
  children,
  coverColor = "#8a6e35",
  coverTo = "#b8923f",
  accent = "#fff7e6",
  label = "RASPÁ ACÁ",
  hint = "con el dedo",
  radius = 24,
  threshold = 0.55,
  onComplete,
}: Props) {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const doneRef = useRef(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (reduce) {
      setDone(true);
      return;
    }
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = wrap.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // Cobertura: degradé dorado + textura + texto.
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, coverColor);
    grad.addColorStop(1, coverTo);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? "#ffffff" : "#000000";
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = accent;
    ctx.textAlign = "center";
    ctx.font = `600 ${Math.round(Math.min(w, h) * 0.13)}px "Playfair Display", Georgia, serif`;
    ctx.fillText(label, w / 2, h / 2 - 2);
    ctx.globalAlpha = 0.75;
    ctx.font = `500 ${Math.round(Math.min(w, h) * 0.075)}px system-ui, sans-serif`;
    ctx.fillText(hint, w / 2, h / 2 + Math.round(Math.min(w, h) * 0.12));
    ctx.globalAlpha = 1;

    const pos = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const scratch = (x: number, y: number) => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    };
    let lastCheck = 0;
    const cleared = () => {
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let clear = 0;
      const total = img.length / 4;
      for (let i = 3; i < img.length; i += 4 * 24) if (img[i] === 0) clear++;
      return clear / (total / 24);
    };
    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      setDone(true);
      onComplete?.();
    };

    const onDown = (e: PointerEvent) => {
      if (doneRef.current) return;
      drawing.current = true;
      canvas.setPointerCapture(e.pointerId);
      const p = pos(e);
      scratch(p.x, p.y);
    };
    const onMove = (e: PointerEvent) => {
      if (!drawing.current || doneRef.current) return;
      const p = pos(e);
      scratch(p.x, p.y);
      const now = performance.now();
      if (now - lastCheck > 120) {
        lastCheck = now;
        if (cleared() >= threshold) finish();
      }
    };
    const onUp = () => {
      drawing.current = false;
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full overflow-hidden rounded-2xl"
      style={{ touchAction: "none" }}
    >
      <div className="absolute inset-0">{children}</div>
      <canvas
        ref={canvasRef}
        aria-label="Raspá para revelar"
        className="absolute inset-0 h-full w-full cursor-pointer transition-opacity duration-500"
        style={{ opacity: done ? 0 : 1, pointerEvents: done ? "none" : "auto" }}
      />
    </div>
  );
}
