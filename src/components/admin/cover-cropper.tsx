"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, Trash2, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "product-photos";

function clamp(n: number) {
  return Math.min(100, Math.max(0, n));
}

export function CoverCropper({
  title,
  pathPrefix,
  initialUrl,
  initialFocal,
  onSave,
  onClose,
}: {
  title: string;
  pathPrefix: string;
  initialUrl: string | null;
  initialFocal: string;
  onSave: (imageUrl: string | null, focal: string) => Promise<void> | void;
  onClose: () => void;
}) {
  const [url, setUrl] = useState<string | null>(initialUrl);
  const parsed = initialFocal.match(/(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/);
  const [fx, setFx] = useState(parsed ? Number(parsed[1]) : 50);
  const [fy, setFy] = useState(parsed ? Number(parsed[2]) : 50);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${pathPrefix}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const pub = supabase.storage.from(BUCKET).getPublicUrl(path)
        .data.publicUrl;
      setUrl(pub);
      setFx(50);
      setFy(50);
    } finally {
      setUploading(false);
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!url) return;
    drag.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current || !frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    // Arrastrar la imagen → se revela el lado opuesto (reposición tipo Instagram).
    setFx((v) => clamp(v - (dx / rect.width) * 100));
    setFy((v) => clamp(v - (dy / rect.height) * 100));
    drag.current = { x: e.clientX, y: e.clientY };
  }
  function onPointerUp() {
    drag.current = null;
  }

  async function save(nextUrl: string | null) {
    setSaving(true);
    try {
      await onSave(nextUrl, `${Math.round(fx)}% ${Math.round(fy)}%`);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-foreground/40 animate-in fade-in"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <h3 className="font-display text-lg">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {url
            ? "Arrastrá la imagen para elegir qué parte se ve."
            : "Subí una foto de portada para esta categoría."}
        </p>

        <div
          ref={frameRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="relative mt-4 flex aspect-[4/3] touch-none select-none items-center justify-center overflow-hidden rounded-xl border border-border bg-secondary"
          style={
            url
              ? {
                  backgroundImage: `url("${url}")`,
                  backgroundSize: "cover",
                  backgroundPosition: `${fx}% ${fy}%`,
                  cursor: "grab",
                }
              : undefined
          }
        >
          {!url ? (
            <span className="text-sm text-muted-foreground">Sin foto</span>
          ) : (
            <span className="pointer-events-none rounded-full bg-background/80 px-2.5 py-1 text-xs text-foreground/70 backdrop-blur">
              <Move className="mr-1 inline size-3" />
              Arrastrá para reubicar
            </span>
          )}
        </div>

        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={onFile}
        />

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {url ? "Cambiar foto" : "Subir foto"}
            </Button>
            {url ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => save(null)}
                disabled={saving}
              >
                <Trash2 className="size-4" />
                Quitar
              </Button>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button size="sm" onClick={() => save(url)} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : "Guardar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
