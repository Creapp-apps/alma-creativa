"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Search,
  Download,
  Inbox,
  MessageCircle,
  Mail,
  Loader2,
  Calendar,
  Users,
  MoreHorizontal,
  Pencil,
  Trash2,
  Hammer,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { LeadStatusSelect } from "@/components/admin/lead-status-select";
import { LEAD_STATUSES } from "@/lib/leads-status";
import {
  PRODUCTION_STAGES,
  STAGE_LABEL,
  type ProductionStage,
} from "@/lib/production-stages";
import {
  saveLeadNotes,
  startProduction,
  updateProductionStage,
  deleteLead,
  updateLead,
  type LeadEditInput,
} from "@/app/admin/actions";

export type ProductOpt = { slug: string; name: string };
export type LeadItem = {
  product_slug?: string | null;
  product_name: string;
  qty: number;
};
export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  event_slug: string | null;
  event_date: string | null;
  guests: number | null;
  comments: string | null;
  notes: string | null;
  status: string;
  production_stage?: string | null;
  created_at: string;
  source?: string | null;
  lead_items: LeadItem[] | null;
};

function asStage(v: string | null | undefined): ProductionStage {
  return v && (PRODUCTION_STAGES as readonly string[]).includes(v)
    ? (v as ProductionStage)
    : "pendiente";
}

const COPY = {
  leads: {
    title: "Leads",
    one: "lead",
    many: "leads",
    empty: "Todavía no entró ningún lead.",
    file: "leads",
  },
  pedidos: {
    title: "Pedidos",
    one: "pedido",
    many: "pedidos",
    empty: "Todavía no entró ningún pedido.",
    file: "pedidos",
  },
} as const;

export type LeadsKind = keyof typeof COPY;

const fmtDate = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function csvCell(v: unknown) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function LeadsBoard({
  kind = "leads",
  leads,
  events,
  products,
  userEmail,
}: {
  kind?: LeadsKind;
  leads: Lead[];
  events: { slug: string; name: string }[];
  products: ProductOpt[];
  userEmail: string;
}) {
  const copy = COPY[kind];
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("todos");
  const [event, setEvent] = useState<string>("todos");
  const [sort, setSort] = useState<"recientes" | "antiguos">("recientes");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState<Lead | null>(null);

  const eventName = (s: string | null) =>
    s ? (events.find((e) => e.slug === s)?.name ?? s) : "—";

  const counts = useMemo(() => {
    const c: Record<string, number> = { todos: leads.length };
    for (const s of LEAD_STATUSES) c[s] = 0;
    for (const l of leads) c[l.status] = (c[l.status] ?? 0) + 1;
    return c;
  }, [leads]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = leads.filter((l) => {
      if (status !== "todos" && l.status !== status) return false;
      if (event !== "todos" && l.event_slug !== event) return false;
      if (q) {
        const hay = `${l.name} ${l.phone} ${l.email ?? ""} ${l.comments ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) =>
      sort === "recientes"
        ? b.created_at.localeCompare(a.created_at)
        : a.created_at.localeCompare(b.created_at),
    );
    return list;
  }, [leads, query, status, event, sort]);

  function exportCsv() {
    const head = [
      "Fecha",
      "Nombre",
      "Teléfono",
      "Email",
      "Evento",
      "Fecha evento",
      "Invitados",
      "Estado",
      "Productos",
      "Comentarios",
      "Notas",
    ];
    const rows = filtered.map((l) => [
      fmtDate.format(new Date(l.created_at)),
      l.name,
      l.phone,
      l.email ?? "",
      eventName(l.event_slug),
      l.event_date ?? "",
      l.guests ?? "",
      l.status,
      (l.lead_items ?? []).map((i) => `${i.qty}x ${i.product_name}`).join("; "),
      l.comments ?? "",
      l.notes ?? "",
    ]);
    const csv =
      "﻿" +
      [head, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${copy.file}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl">{copy.title}</h1>
          <p className="text-sm text-muted-foreground">
            {leads.length} {leads.length === 1 ? copy.one : copy.many} ·{" "}
            {userEmail}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={exportCsv}
          disabled={filtered.length === 0}
        >
          <Download className="size-4" />
          Exportar CSV
        </Button>
      </header>

      {/* Toolbar */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, teléfono, email…"
            className="pl-9"
          />
        </div>
        <Select value={event} onValueChange={(v) => v && setEvent(v)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los eventos</SelectItem>
            {events.map((e) => (
              <SelectItem key={e.slug} value={e.slug}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={sort}
          onValueChange={(v) => v && setSort(v as "recientes" | "antiguos")}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recientes">Más recientes</SelectItem>
            <SelectItem value="antiguos">Más antiguos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Chips de estado */}
      <div className="mt-4 flex flex-wrap gap-2">
        {(["todos", ...LEAD_STATUSES] as string[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs capitalize transition-colors",
              status === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {s} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-xl border border-dashed border-border p-12 text-center">
          <Inbox className="size-8 text-muted-foreground" strokeWidth={1.5} />
          <p className="mt-3 text-muted-foreground">
            {leads.length === 0
              ? copy.empty
              : `No hay ${copy.many} con esos filtros.`}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {filtered.map((lead) => (
            <article
              key={lead.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelected(lead)}
                  className="text-left"
                >
                  <h2 className="font-display text-lg hover:text-gold">
                    {lead.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {eventName(lead.event_slug)}
                    {lead.event_date ? ` · ${lead.event_date}` : ""}
                    {lead.guests ? ` · ${lead.guests} inv.` : ""}
                  </p>
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {fmtDate.format(new Date(lead.created_at))}
                  </span>
                  <LeadStatusSelect id={lead.id} status={lead.status} />
                </div>
              </div>
              {(lead.lead_items ?? []).length > 0 ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {(lead.lead_items ?? []).slice(0, 4).map((it, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs"
                    >
                      {it.qty}× {it.product_name}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                <StageBadge stage={asStage(lead.production_stage)} />
                <div className="ml-auto flex items-center gap-2">
                  <LeadActions
                    lead={lead}
                    onEdit={() => setEditing(lead)}
                    onDelete={() => setDeleting(lead)}
                  />
                  <button
                    type="button"
                    onClick={() => setSelected(lead)}
                    className="text-sm text-gold hover:text-foreground"
                  >
                    Ver detalle
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <LeadSheet
        lead={selected}
        eventName={eventName}
        onClose={() => setSelected(null)}
      />

      <EditSheet
        lead={editing}
        events={events}
        products={products}
        onClose={() => setEditing(null)}
      />

      <DeleteConfirm lead={deleting} onClose={() => setDeleting(null)} />
    </>
  );
}

function StageBadge({ stage }: { stage: ProductionStage }) {
  const tone: Record<ProductionStage, string> = {
    pendiente: "border-border bg-secondary text-muted-foreground",
    en_produccion: "border-gold/40 bg-gold-soft text-gold",
    listo: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    entregado:
      "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        tone[stage],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {STAGE_LABEL[stage]}
    </span>
  );
}

function LeadActions({
  lead,
  onEdit,
  onDelete,
}: {
  lead: Lead;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [pending, start] = useTransition();
  const stage = asStage(lead.production_stage);

  function toStage(next: ProductionStage) {
    start(async () => {
      await updateProductionStage(lead.id, next);
      toast.success(`Movido a ${STAGE_LABEL[next]}`);
    });
  }

  function begin() {
    start(async () => {
      await startProduction(lead.id);
      toast.success("Pedido en producción");
    });
  }

  return (
    <div className="flex items-center gap-2">
      {stage === "pendiente" ? (
        <Button size="sm" onClick={begin} disabled={pending}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Hammer className="size-4" />
          )}
          Comenzar producción
        </Button>
      ) : null}

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="icon-sm" aria-label="Acciones">
              <MoreHorizontal className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="size-4" />
            Editar
          </DropdownMenuItem>
          {PRODUCTION_STAGES.filter((s) => s !== stage).map((s) => (
            <DropdownMenuItem key={s} onClick={() => toStage(s)}>
              <Hammer className="size-4" />
              Mover a {STAGE_LABEL[s]}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            <Trash2 className="size-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function DeleteConfirm({
  lead,
  onClose,
}: {
  lead: Lead | null;
  onClose: () => void;
}) {
  const [pending, start] = useTransition();
  if (!lead) return null;

  function confirm() {
    const id = lead!.id;
    start(async () => {
      await deleteLead(id);
      toast.success("Pedido eliminado");
      onClose();
    });
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
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <h3 className="font-display text-lg">¿Eliminar pedido?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Se elimina <strong>{lead.name}</strong> y sus ítems. Esta acción no se
          puede deshacer.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={confirm}
            disabled={pending}
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : "Eliminar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function LeadSheet({
  lead,
  eventName,
  onClose,
}: {
  lead: Lead | null;
  eventName: (s: string | null) => string;
  onClose: () => void;
}) {
  return (
    <Sheet open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-auto sm:max-w-md">
        {lead ? (
          <>
            <SheetHeader>
              <SheetTitle className="font-display text-xl">
                {lead.name}
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-5 px-4 pb-6">
              <LeadStatusSelect id={lead.id} status={lead.status} />

              <div className="grid gap-2 text-sm">
                <a
                  href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-gold hover:text-foreground"
                >
                  <MessageCircle className="size-4" />
                  {lead.phone}
                </a>
                {lead.email ? (
                  <a
                    href={`mailto:${lead.email}`}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Mail className="size-4" />
                    {lead.email}
                  </a>
                ) : null}
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <Calendar className="size-4" />
                  {eventName(lead.event_slug)}
                  {lead.event_date ? ` · ${lead.event_date}` : ""}
                </span>
                {lead.guests ? (
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <Users className="size-4" />
                    {lead.guests} invitados
                  </span>
                ) : null}
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Pedido
                </p>
                <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
                  {(lead.lead_items ?? []).map((it, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between px-3 py-2 text-sm"
                    >
                      <span>{it.product_name}</span>
                      <span className="text-muted-foreground">× {it.qty}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {lead.comments ? (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Comentarios del cliente
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    “{lead.comments}”
                  </p>
                </div>
              ) : null}

              <NotesEditor id={lead.id} initial={lead.notes ?? ""} />
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

type EditItem = { slug: string | null; name: string; qty: number };

function EditSheet({
  lead,
  events,
  products,
  onClose,
}: {
  lead: Lead | null;
  events: { slug: string; name: string }[];
  products: ProductOpt[];
  onClose: () => void;
}) {
  return (
    <Sheet open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-auto sm:max-w-md">
        {lead ? (
          <EditForm
            key={lead.id}
            lead={lead}
            events={events}
            products={products}
            onClose={onClose}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function EditForm({
  lead,
  events,
  products,
  onClose,
}: {
  lead: Lead;
  events: { slug: string; name: string }[];
  products: ProductOpt[];
  onClose: () => void;
}) {
  const [name, setName] = useState(lead.name);
  const [phone, setPhone] = useState(lead.phone);
  const [email, setEmail] = useState(lead.email ?? "");
  const [eventSlug, setEventSlug] = useState(lead.event_slug ?? "none");
  const [eventDate, setEventDate] = useState(lead.event_date ?? "");
  const [guests, setGuests] = useState(
    lead.guests != null ? String(lead.guests) : "",
  );
  const [comments, setComments] = useState(lead.comments ?? "");
  const [items, setItems] = useState<EditItem[]>(
    (lead.lead_items ?? []).map((it) => ({
      slug: it.product_slug ?? null,
      name: it.product_name,
      qty: it.qty,
    })),
  );
  const [pending, start] = useTransition();

  function setItem(i: number, patch: Partial<EditItem>) {
    setItems((prev) =>
      prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)),
    );
  }
  function pickProduct(i: number, slug: string) {
    const p = products.find((x) => x.slug === slug);
    setItem(i, { slug, name: p?.name ?? slug });
  }
  function addItem() {
    const p = products[0];
    setItems((prev) => [
      ...prev,
      { slug: p?.slug ?? null, name: p?.name ?? "", qty: 1 },
    ]);
  }
  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function save() {
    if (!name.trim() || !phone.trim()) {
      toast.error("Nombre y teléfono son obligatorios.");
      return;
    }
    const payload: LeadEditInput = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
      event_slug: eventSlug === "none" ? null : eventSlug,
      event_date: eventDate.trim() || null,
      guests: guests.trim() === "" ? null : Number(guests),
      comments: comments.trim() || null,
      items: items
        .filter((it) => it.name.trim())
        .map((it) => ({
          slug: it.slug,
          name: it.name.trim(),
          qty: Math.max(1, Math.floor(it.qty || 1)),
        })),
    };
    start(async () => {
      const res = await updateLead(lead.id, payload);
      if (res.ok) {
        toast.success("Pedido actualizado");
        onClose();
      } else {
        toast.error(res.error ?? "No se pudo guardar.");
      }
    });
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle className="font-display text-xl">Editar pedido</SheetTitle>
      </SheetHeader>
      <div className="space-y-4 px-4 pb-6">
        <Field label="Nombre">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Teléfono">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
        </div>
        <Field label="Evento">
          <Select value={eventSlug} onValueChange={(v) => v && setEventSlug(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin evento</SelectItem>
              {events.map((e) => (
                <SelectItem key={e.slug} value={e.slug}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha del evento">
            <Input
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              placeholder="2026-11-12"
            />
          </Field>
          <Field label="Invitados">
            <Input
              type="number"
              min={0}
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
            />
          </Field>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Ítems
            </p>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={addItem}
              disabled={products.length === 0}
            >
              <Plus className="size-3.5" />
              Agregar
            </Button>
          </div>
          <div className="mt-2 space-y-2">
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin ítems.</p>
            ) : null}
            {items.map((it, i) => {
              const known = products.some((p) => p.slug === it.slug);
              return (
                <div key={i} className="flex items-center gap-2">
                  {known || products.length > 0 ? (
                    <Select
                      value={it.slug ?? ""}
                      onValueChange={(v) => v && pickProduct(i, v)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder={it.name || "Producto"} />
                      </SelectTrigger>
                      <SelectContent>
                        {!known && it.slug ? (
                          <SelectItem value={it.slug}>{it.name}</SelectItem>
                        ) : null}
                        {products.map((p) => (
                          <SelectItem key={p.slug} value={p.slug}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      className="flex-1"
                      value={it.name}
                      onChange={(e) => setItem(i, { name: e.target.value })}
                    />
                  )}
                  <Input
                    type="number"
                    min={1}
                    className="w-20"
                    value={it.qty}
                    onChange={(e) =>
                      setItem(i, { qty: Number(e.target.value) || 1 })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeItem(i)}
                    aria-label="Quitar ítem"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        <Field label="Comentarios">
          <Textarea
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button size="sm" onClick={save} disabled={pending}>
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Guardar cambios"
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function NotesEditor({ id, initial }: { id: string; initial: string }) {
  const [notes, setNotes] = useState(initial);
  const [pending, start] = useTransition();
  const dirty = notes !== initial;

  function save() {
    start(async () => {
      await saveLeadNotes(id, notes);
      toast.success("Notas guardadas");
    });
  }

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Notas internas
      </p>
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        placeholder="Seguimiento, presupuesto enviado, etc."
        className="mt-2"
      />
      <Button
        size="sm"
        className="mt-2"
        onClick={save}
        disabled={pending || !dirty}
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : "Guardar notas"}
      </Button>
    </div>
  );
}
