-- Autogestión del sitio: contenido editable (una fila JSONB).
-- Los defaults viven en TS (src/lib/site-content.ts); esta tabla guarda los overrides.

create table if not exists public.site_content (
  id         text primary key default 'default',
  content    jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

-- Lectura pública (el sitio la usa). Escritura solo staff autenticado.
drop policy if exists "site_content_read" on public.site_content;
create policy "site_content_read"
  on public.site_content for select using (true);

drop policy if exists "site_content_write" on public.site_content;
create policy "site_content_write"
  on public.site_content for all to authenticated
  using (true) with check (true);
