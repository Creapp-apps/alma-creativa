-- Fotos de portada por categoría + foco (object-position) para reubicar el área visible.

alter table public.categories
  add column if not exists image_url text;

alter table public.categories
  add column if not exists focal text not null default '50% 50%';
