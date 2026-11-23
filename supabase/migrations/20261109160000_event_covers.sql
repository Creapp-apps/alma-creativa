-- Fotos de portada por evento + foco (object-position).

alter table public.events
  add column if not exists image_url text;

alter table public.events
  add column if not exists focal text not null default '50% 50%';
