"use client";

import { useMemo, useRef, useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import {
  AtSign,
  MessageSquare,
  MessageCircle,
  Send,
  Loader2,
  Inbox as InboxIcon,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getConversationMessages,
  markConversationRead,
  sendReply,
  type InboxMessage,
} from "@/app/admin/actions";

export type Conversation = {
  id: string;
  channel: string;
  external_id: string;
  contact_name: string | null;
  contact_handle: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  last_inbound_at: string | null;
  unread: number;
  lead_id: string | null;
};

const CHANNEL = {
  instagram: { label: "Instagram", icon: AtSign, color: "text-pink-500" },
  messenger: { label: "Messenger", icon: MessageSquare, color: "text-blue-500" },
  whatsapp: { label: "WhatsApp", icon: MessageCircle, color: "text-green-500" },
} as const;

type ChannelKey = keyof typeof CHANNEL;
function chan(c: string) {
  return CHANNEL[(c as ChannelKey) in CHANNEL ? (c as ChannelKey) : "instagram"];
}

const WINDOW_MS = 24 * 60 * 60 * 1000;

const fmtTime = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
});
const fmtDay = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
});
function when(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay ? fmtTime.format(d) : fmtDay.format(d);
}

export function Inbox({
  conversations,
  userEmail,
}: {
  conversations: Conversation[];
  userEmail: string;
}) {
  const [filter, setFilter] = useState<"todos" | ChannelKey>("todos");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const list = useMemo(
    () =>
      conversations.filter((c) => filter === "todos" || c.channel === filter),
    [conversations, filter],
  );
  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId],
  );

  const totalUnread = conversations.reduce((n, c) => n + (c.unread || 0), 0);

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      <header className="mb-4">
        <h1 className="font-display text-2xl">Leads</h1>
        <p className="text-sm text-muted-foreground">
          Bandeja omnicanal · {conversations.length} conversaciones
          {totalUnread > 0 ? ` · ${totalUnread} sin leer` : ""} · {userEmail}
        </p>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-card">
        {/* Lista */}
        <aside
          className={cn(
            "flex w-full flex-col border-r border-border md:w-80 lg:w-96",
            selected && "hidden md:flex",
          )}
        >
          <div className="flex gap-1 border-b border-border p-2">
            {(["todos", "instagram", "messenger", "whatsapp"] as const).map(
              (f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={cn(
                    "flex-1 rounded-md px-2 py-1.5 text-xs capitalize transition-colors",
                    filter === f
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f}
                </button>
              ),
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {list.length === 0 ? (
              <div className="flex flex-col items-center p-10 text-center">
                <InboxIcon
                  className="size-7 text-muted-foreground"
                  strokeWidth={1.5}
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  No hay conversaciones.
                </p>
              </div>
            ) : (
              list.map((c) => {
                const meta = chan(c.channel);
                const Icon = meta.icon;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className={cn(
                      "flex w-full items-start gap-3 border-b border-border px-3 py-3 text-left transition-colors hover:bg-secondary/50",
                      selectedId === c.id && "bg-secondary",
                    )}
                  >
                    <span className="relative mt-0.5">
                      <span className="flex size-9 items-center justify-center rounded-full bg-secondary">
                        <Icon className={cn("size-4", meta.color)} />
                      </span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">
                          {c.contact_name || c.contact_handle || c.external_id}
                        </span>
                        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                          {when(c.last_message_at)}
                        </span>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {c.last_message_preview || "—"}
                      </p>
                    </div>
                    {c.unread > 0 ? (
                      <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-gold text-[11px] font-medium text-black">
                        {c.unread}
                      </span>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Hilo */}
        <section
          className={cn(
            "flex min-w-0 flex-1 flex-col",
            !selected && "hidden md:flex",
          )}
        >
          {selected ? (
            <Thread
              key={selected.id}
              conversation={selected}
              onBack={() => setSelectedId(null)}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center text-muted-foreground">
              <InboxIcon className="size-10" strokeWidth={1.25} />
              <p className="mt-3 text-sm">Elegí una conversación</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Thread({
  conversation,
  onBack,
}: {
  conversation: Conversation;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, startSend] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  const meta = chan(conversation.channel);
  const Icon = meta.icon;

  const waExpired =
    conversation.channel === "whatsapp" &&
    (!conversation.last_inbound_at ||
      Date.now() - new Date(conversation.last_inbound_at).getTime() >
        WINDOW_MS);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getConversationMessages(conversation.id).then((m) => {
      if (!alive) return;
      setMessages(m);
      setLoading(false);
    });
    markConversationRead(conversation.id);
    return () => {
      alive = false;
    };
  }, [conversation.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading]);

  function send() {
    const body = text.trim();
    if (!body) return;
    startSend(async () => {
      const res = await sendReply(conversation.id, body);
      if (!res.ok) {
        toast.error(res.error ?? "No se pudo enviar.");
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `tmp-${Date.now()}`,
          direction: "out",
          text: body,
          media_url: null,
          media_type: null,
          status: "sent",
          created_at: new Date().toISOString(),
        },
      ]);
      setText("");
      if (res.simulated) {
        toast.message("Enviado (simulado)", {
          description: "Sin tokens de Meta todavía; se guardó local.",
        });
      }
    });
  }

  return (
    <>
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={onBack}
          aria-label="Volver"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <span className="flex size-8 items-center justify-center rounded-full bg-secondary">
          <Icon className={cn("size-4", meta.color)} />
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium leading-tight">
            {conversation.contact_name ||
              conversation.contact_handle ||
              conversation.external_id}
          </p>
          <p className="text-xs text-muted-foreground">{meta.label}</p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Sin mensajes.
          </p>
        ) : (
          messages.map((m) => {
            const out = m.direction === "out";
            return (
              <div
                key={m.id}
                className={cn("flex", out ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                    out
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground",
                  )}
                >
                  {m.text ? (
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  ) : m.media_type ? (
                    <p className="italic opacity-80">[{m.media_type}]</p>
                  ) : null}
                  <span
                    className={cn(
                      "mt-1 block text-right text-[10px]",
                      out ? "text-primary-foreground/70" : "text-muted-foreground",
                    )}
                  >
                    {fmtTime.format(new Date(m.created_at))}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {waExpired ? (
        <div className="flex items-center gap-2 border-t border-border bg-gold-soft/40 px-4 py-2 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          Fuera de la ventana de 24h de WhatsApp: solo plantillas aprobadas.
        </div>
      ) : null}

      <div className="flex items-end gap-2 border-t border-border p-3">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder={waExpired ? "Requiere plantilla…" : "Escribí una respuesta…"}
          disabled={waExpired || sending}
          className="max-h-32 min-h-10 resize-none"
        />
        <Button
          size="icon"
          onClick={send}
          disabled={waExpired || sending || !text.trim()}
          aria-label="Enviar"
        >
          {sending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </div>
    </>
  );
}
