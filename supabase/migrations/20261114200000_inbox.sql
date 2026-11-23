-- Bandeja omnicanal (Instagram / Messenger / WhatsApp).
-- Las conversaciones y mensajes de los canales de chat se guardan acá.
-- El webhook (service_role) escribe; el staff autenticado lee y responde.

create table if not exists public.conversations (
  id                   uuid primary key default gen_random_uuid(),
  channel              text not null,            -- instagram | messenger | whatsapp
  external_id          text not null,            -- id del contacto en el canal (IGSID / PSID / wa_id)
  contact_name         text,
  contact_handle       text,                     -- @usuario o teléfono
  last_message_at      timestamptz,
  last_message_preview text,
  last_inbound_at      timestamptz,              -- para la ventana de 24h de WhatsApp
  unread               int not null default 0,
  lead_id              uuid references public.leads(id) on delete set null,
  created_at           timestamptz not null default now(),
  unique (channel, external_id)
);

create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  direction       text not null,                 -- in | out
  external_id     text unique,                   -- message id de Meta (idempotencia)
  text            text,
  media_url       text,
  media_type      text,                          -- image | video | audio | document | sticker
  status          text,                          -- sent | delivered | read | failed (solo out)
  created_at      timestamptz not null default now()
);

create index if not exists conversations_last_idx on public.conversations(last_message_at desc);
create index if not exists conversations_lead_idx on public.conversations(lead_id);
create index if not exists messages_conv_idx on public.messages(conversation_id, created_at);

alter table public.conversations enable row level security;
alter table public.messages      enable row level security;

-- Staff autenticado: lee todo, actualiza conversaciones (marcar leído, linkear lead),
-- inserta mensajes salientes. El webhook entra por service_role (saltea RLS).
create policy "staff_read_conversations"
  on public.conversations for select to authenticated using (true);
create policy "staff_update_conversations"
  on public.conversations for update to authenticated using (true) with check (true);

create policy "staff_read_messages"
  on public.messages for select to authenticated using (true);
create policy "staff_insert_messages"
  on public.messages for insert to authenticated with check (true);
