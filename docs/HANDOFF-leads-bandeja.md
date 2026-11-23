# Handoff — Comercial, Producción y Bandeja omnicanal

**Estado:** en pausa el 2026-11-14. Todo lo de abajo está implementado y con typecheck limpio, salvo lo marcado como _pendiente_.

Este documento resume lo hecho y lo que falta, para retomar sin releer el código.

---

## 1. Qué se hizo

### 1.1 Sección "Comercial" dividida
`src/components/admin/app-sidebar.tsx` → grupo **Comercial** con 3 ítems:
- **Leads** (`/admin/leads`) — bandeja omnicanal de chats (ver §1.3).
- **Pedidos** (`/admin/pedidos`) — pedidos que entran por la web.
- **Tablero** (`/admin/tablero`) — kanban de producción.

Separación por columna `leads.source`:
- **Pedidos** = `source = 'web'`.
- **Leads/chats** = `source != 'web'` (instagram / messenger / whatsapp).

> Nota: hoy `/admin/leads` es la **bandeja** (no el lead-board). El lead-board quedó solo para Pedidos.

### 1.2 Pedidos + Tablero (producción)
- Migración `supabase/migrations/20261114190000_production_stage.sql`: columna `leads.production_stage` (`pendiente | en_produccion | listo | entregado`, default `pendiente`). Lib: `src/lib/production-stages.ts`.
- **Pedidos** (`leads-view.tsx` → `leads-board.tsx`): cada tarjeta tiene badge de etapa, botón **Comenzar producción** (si `pendiente`), menú ⋯ (**Editar** = Sheet con form completo incl. ítems; **Mover a** etapa; **Eliminar** con confirmación), y **Ver detalle**.
- **Tablero** (`tablero/page.tsx` → `production-board.tsx`): kanban 4 columnas, drag nativo HTML5 + menú por tarjeta, override optimista. Abarca pedidos web + leads de chat.
- **Badge breathe** en el sidebar: `(dash)/layout.tsx` es async, cuenta pedidos `source='web' AND production_stage='pendiente'` y pasa `badges` a `AppSidebar` → `SidebarMenuBadge` con `.animate-breathe`.
- Server actions en `src/app/admin/actions.ts`: `updateProductionStage`, `startProduction`, `deleteLead`, `updateLead` (todas con guard `auth.getUser()`). `deleteLead` y editar ítems usan **service_role** (`createAdminClient`) porque la RLS de `leads` solo da select+update a `authenticated`.

### 1.3 Bandeja omnicanal nativa con Meta (Leads)
Decisión del cliente: **integración nativa y oficial** con Meta (sin BSP). Canales: Instagram DM, Messenger, WhatsApp (Cloud API). Todos usan la misma Graph API + un webhook.

**DB** — migración `supabase/migrations/20261114200000_inbox.sql`:
- `conversations`: `channel`, `external_id` (id del contacto en el canal), `contact_name`, `contact_handle`, `last_message_at`, `last_message_preview`, `last_inbound_at` (para ventana 24h de WhatsApp), `unread`, `lead_id`. Único `(channel, external_id)`.
- `messages`: `conversation_id`, `direction` (`in|out`), `external_id` único (idempotencia), `text`, `media_url`, `media_type`, `status`.
- RLS: staff lee/actualiza conversaciones e inserta mensajes; el webhook entra por service_role.

**Backend Meta** — `src/lib/meta/`:
- `config.ts`: Graph v21.0, `isMetaConfigured()`, lee env.
- `verify.ts`: valida firma `X-Hub-Signature-256` (HMAC-SHA256 del body con el App Secret, timing-safe).
- `receive.ts`: parsers de los 3 payloads (`whatsapp_business_account`, `instagram`, `page`). _Confirmar formas exactas contra la doc de Meta al integrar._
- `inbox.ts`: `recordInbound` (upsert conversación + insert mensaje, idempotente) y `recordOutbound`.
- `send.ts`: `sendText(channel, recipientExternalId, text)` por canal.
- `types.ts`: `Channel`, labels, map a `source`.

**Webhook** — `src/app/api/webhooks/meta/route.ts`:
- `GET` = verify-challenge (compara `META_VERIFY_TOKEN`).
- `POST` = verifica firma → `handleEvent` → persiste. Siempre 200 salvo firma inválida (evita loop de reintentos de Meta).
- **Gotcha Next 16**: con `cacheComponents` activado, **NO** poner `export const runtime`/`dynamic` en route handlers (rompe el build con "not compatible with nextConfig.cacheComponents").

**UI bandeja** — `src/components/admin/inbox-view.tsx` (server) → `inbox.tsx` (client):
- Dos paneles: lista de conversaciones (filtro por canal, badge no leídos) + hilo (burbujas in/out) + responder.
- Al abrir un hilo: marca leído y carga mensajes (`getConversationMessages`).
- **WhatsApp 24h**: si venció la ventana, bloquea texto libre y muestra aviso (solo plantillas).
- **Modo simulado**: si `!isMetaConfigured()`, `sendReply` guarda el saliente local y avisa "(simulado)" → permite testear la UI sin tokens.
- Badge **Leads** en sidebar = suma de `unread` (en `getSidebarBadges`).
- Íconos: este lucide (v1.70) **no** tiene `Instagram`/`Facebook`; se usan `AtSign` / `MessageSquare` / `MessageCircle`.

Server actions añadidas: `getConversationMessages`, `markConversationRead`, `sendReply`.

### 1.4 Eventos oculto del sidebar
Se quitó el ítem **Eventos** del grupo Catálogo en `app-sidebar.tsx` (la ruta `/admin/eventos` sigue viva por URL, solo no aparece en el menú).

---

## 2. Datos de prueba
Sembrados en `conversations`/`messages` con `external_id like 'ds_%'` (3 conversaciones: WhatsApp 2 sin leer, Instagram 1, Messenger 0).

Borrar cuando no se necesiten:
```sql
delete from public.conversations where external_id like 'ds_%';
```

---

## 3. Cómo aplicar migraciones (este repo)
El repo **no está linkeado** a Supabase CLI. Se usa `psql` con `SUPABASE_DB_PASSWORD` (el password embebido en `SUPABASE_DB_URL` está mal):
```bash
set -a && . ./.env.local && set +a
CONN=$(node -e 'const u=new URL(process.env.SUPABASE_DB_URL);u.password=encodeURIComponent(process.env.SUPABASE_DB_PASSWORD||"");process.stdout.write(u.toString());')
psql "$CONN" -v ON_ERROR_STOP=1 -f supabase/migrations/<archivo>.sql
```
Tipos Supabase (`src/types/database.types.ts`) se editaron **a mano** (production_stage, conversations, messages) porque `npm run db:types` necesita CLI/login.

---

## 4. Pendiente

### F0 — Assets que debe conseguir Alma Creativa (bloquea todo lo real)
1. **Meta Business** (business.facebook.com, admin).
2. **Página de Facebook** de Alma (no existe).
3. **Instagram profesional** (Business/Creator) vinculado al Business.
4. **Número para WhatsApp** NO usado en WhatsApp/Business normal.
5. **Business Verification** (documentación de empresa; tarda días).
6. Acceso para crear la **App** en developer.facebook.com.
7. **Dominio** del sitio (todavía no hay) → necesario para el webhook HTTPS y el deploy.

### F2 — Polish de la bandeja (opcional, se puede sin tokens)
- Crear/linkear un **lead** desde una conversación (botón "Convertir en lead" → inserta en `leads` con `source` del canal y `lead_id` en la conversación).
- Media (imágenes/audio) en el hilo (hoy se muestra `[tipo]`).
- Realtime (Supabase Realtime) para que entren mensajes sin refrescar.
- Plantillas de WhatsApp (envío fuera de 24h).

### F3 — Producción
- Crear App con los 3 productos, System User token (no expira), configurar webhook en Meta apuntando a `https://<dominio>/api/webhooks/meta` con el mismo `META_VERIFY_TOKEN`.
- Cargar env en Vercel (ver `.env.example`: `META_APP_SECRET`, `META_VERIFY_TOKEN`, `META_GRAPH_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `IG_USER_ID`, `PAGE_ID`).
- **App Review** de Meta (permisos de mensajería) + verificación.

---

## 5. Otras notas
- Dashboard (`(dash)/page.tsx`) todavía cuenta "Leads totales/nuevos" mezclando web + chat y linkea "Últimos leads" a `/admin/leads` (que ahora es bandeja). Revisar si conviene separar — _sin tocar_.
- Errores TS preexistentes y ajenos a este trabajo en `circular-carousel.tsx` / `categories-carousel.tsx`.
- `npm run dev` corre desde `alma-creativa-web/` (no desde la raíz del proyecto). Next 16 no deja levantar una 2ª instancia; el log del server vive en `.next/dev/logs/next-development.log`.
