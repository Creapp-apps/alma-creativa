-- Foco (object-position) para la portada de cada producto.
alter table public.products
  add column if not exists focal text not null default '50% 50%';
