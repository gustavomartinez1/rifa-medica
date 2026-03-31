# Blueprint: Rifa Recaudación Médica — Felix

## Clasificación
- **Base**: Landing (one-pager con interactividad)
- **Módulos**: realtime-tickets, countdown, admin-panel, whatsapp-integration
- **Supabase**: Free tier (< 500MB, realtime para boletos) — estimado: $0/mo
- **Tier cliente**: $199/mo (landing con DB + realtime)
- **Tipo**: Prototipo funcional — listo para producción rápida

## Inspiración de Diseño

> Nota: Tavily API key inválida — investigación basada en patrones probados de sitios de recaudación médica y rifas benéficas.

### Paleta de Colores (Recaudación Médica)
| Elemento | Color | Razonamiento |
|----------|-------|-------------|
| Primario | `#3B82F6` (azul suave) | Confianza, calma, profesionalismo médico |
| Acento | `#10B981` (verde esperanza) | Esperanza, salud, positividad |
| CTA | `#F59E0B` (ámbar cálido) | Urgencia amable, acción sin agresividad |
| Fondo | `#F8FAFC` (slate-50) | Limpio, no frío como blanco puro |
| Texto | `#1E293B` (slate-800) | Legible, cálido vs negro puro |
| Peligro/urgencia | `#EF4444` (rojo suave) | Solo para contador y boletos vendidos |

### Estado de Boletos (Grid Visual)
| Estado | Color | Hex |
|--------|-------|-----|
| Disponible | Verde | `#22C55E` |
| En espera | Amarillo/Ámbar | `#F59E0B` |
| Pagado | Gris | `#9CA3AF` |

### Layout Referenciado
- **Hero**: Foto circular de Felix + texto centrado + contador prominente
- **Causa**: Dos columnas (foto + texto) en desktop, stack en mobile
- **Rifas**: Cards horizontales con imagen del premio a la izquierda
- **Grid de boletos**: Grid de 10x25 celdas por rifa, scroll horizontal en mobile
- **Formulario**: Modal overlay con backdrop blur
- **Datos bancarios**: Card fija visible siempre (sticky o sección dedicada)

## Estructura de Archivos (Feature-Sliced Design)

```
src/
  app/                          # Next.js App Router
    layout.tsx                  # Root layout con fonts, metadata, providers
    page.tsx                    # Landing one-pager (SSG + client islands)
    not-found.tsx               # 404 page
    error.tsx                   # Error boundary global
    admin/
      page.tsx                  # Panel admin (SSR, protegido)
    api/
      reserve-ticket/
        route.ts                # POST: reservar boleto → en_espera
      claim-payment/
        route.ts                # POST: confirmar pago → pagado
      admin/
        update-ticket/
          route.ts              # POST: admin marca pagado/libera
        tickets/
          route.ts              # GET: lista boletos con filtros
  features/
    countdown/
      components/
        CountdownTimer.tsx      # Contador regresivo a 8 Abr 2026 5PM CST
      hooks/
        useCountdown.ts         # Lógica de countdown con timezone CST
    tickets/
      components/
        TicketGrid.tsx          # Grid 250 boletos con colores por estado
        TicketCell.tsx          # Celda individual de boleto
        TicketStatusLegend.tsx  # Leyenda de colores
      hooks/
        useTicketRealtime.ts    # Supabase Realtime subscription
        useTicketReservation.ts # Lógica de reserva + expiración 10min
      actions/
        reserveTicket.ts        # Server Action: reservar boleto
        claimPayment.ts         # Server Action: confirmar pago
      types.ts                  # Ticket, TicketStatus, Raffle types
    raffles/
      components/
        RaffleCard.tsx          # Card de cada rifa con premio
        RaffleTabs.tsx          # Tabs para cambiar entre 3 rifas
    purchase/
      components/
        PurchaseModal.tsx       # Modal formulario de compra
        PaymentInstructions.tsx # Instrucciones transferencia + timer
        PaymentConfirmButton.tsx # Botón "Ya realicé el pago"
    cause/
      components/
        CauseSection.tsx        # Sección "Sobre la causa"
        BankDetails.tsx         # Datos bancarios siempre visibles
    admin/
      components/
        AdminLogin.tsx          # Login con contraseña simple
        AdminDashboard.tsx      # Dashboard con filtros y resumen
        TicketTable.tsx         # Tabla admin de boletos
        ManualPaymentForm.tsx   # Formulario para ventas en efectivo
        ExportCSVButton.tsx     # Exportar compradores a CSV
  shared/
    components/
      ui/
        Button.tsx
        Input.tsx
        Modal.tsx
        Badge.tsx
        Card.tsx
        Tabs.tsx
      Header.tsx
      Footer.tsx
      WhatsAppFloat.tsx         # Botón flotante WhatsApp
    lib/
      supabase/
        client.ts               # Supabase client (browser, anon key)
        server.ts               # Supabase client (server, service key)
      rate-limit.ts             # Rate limiting (Upstash o simple)
      whatsapp.ts               # Generador de mensaje WhatsApp
      constants.ts              # Fecha rifa, precios, datos bancarios
    hooks/
      useLocalStorage.ts        # Hook para localStorage (payment claim)
    types/
      index.ts                  # Types globales
    styles/
      globals.css               # Tailwind + custom styles
  widgets/
    hero/
      HeroSection.tsx           # Hero con foto, texto, countdown, CTA
  config/
    env.ts                      # Validación de env vars (Zod)
    constants.ts                # Constantes globales

public/
  images/
    felix.jpg                   # Foto de Felix
    alexa.jpg                   # Amazon Echo Pop
    samsung-a13.jpg             # Samsung Galaxy A13
    collar-aretes.jpg           # Collar con aretes
  favicon.ico
  og-image.jpg                  # Open Graph image (foto de Felix)

.env.example                    # Template de variables
.env.local                      # Variables reales (gitignored)
wrangler.toml                   # Cloudflare Pages config (si aplica)
```

## Database Schema (Supabase)

### Table: raffles
```sql
CREATE TABLE raffles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- "Rifa 1: Amazon Echo Pop"
  description TEXT NOT NULL,             -- Descripción del premio
  prize_image_url TEXT NOT NULL,         -- Ruta de imagen del premio
  total_tickets INTEGER NOT NULL DEFAULT 250,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data:
-- Rifa 1: Amazon Echo Pop
-- Rifa 2: Samsung Galaxy A13
-- Rifa 3: Collar con aretes
```

### Table: tickets
```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id UUID REFERENCES raffles(id) ON DELETE CASCADE,
  ticket_number INTEGER NOT NULL,        -- 1-250
  status TEXT NOT NULL DEFAULT 'available',
    -- CHECK (status IN ('available', 'en_espera', 'pagado')),
  
  -- Datos del comprador
  buyer_name TEXT,
  buyer_phone TEXT,
  buyer_email TEXT,
  buyer_address TEXT,
  
  -- Control de reserva
  reserved_at TIMESTAMPTZ,
  reserved_expires_at TIMESTAMPTZ,       -- reserved_at + 10 minutos
  
  -- Control de pago
  payment_claimed_at TIMESTAMPTZ,        -- Cuando usuario presionó "Ya pagué"
  paid_at TIMESTAMPTZ,                   -- Cuando se marcó como pagado
  paid_by_admin BOOLEAN DEFAULT FALSE,   -- True si admin marcó manualmente
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(raffle_id, ticket_number)
);

-- Index para búsquedas rápidas
CREATE INDEX idx_tickets_raffle_status ON tickets(raffle_id, status);
CREATE INDEX idx_tickets_expires ON tickets(status, reserved_expires_at)
  WHERE status = 'en_espera';
```

### Table: admin_sessions (simple, no auth completa)
```sql
CREATE TABLE admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);
```

### RLS Policies
```sql
-- Tickets: lectura pública (todos pueden ver el grid)
CREATE POLICY "tickets_public_read" ON tickets
  FOR SELECT USING (true);

-- Tickets: escritura solo vía service_role (API routes)
-- No se permite INSERT/UPDATE/DELETE desde cliente anon
-- Las API routes usan SUPABASE_SERVICE_KEY que bypass RLS

-- Raffles: lectura pública
CREATE POLICY "raffles_public_read" ON raffles
  FOR SELECT USING (true);
```

### Función de expiración automática (PostgreSQL)
```sql
-- Función para liberar boletos expirados
CREATE OR REPLACE FUNCTION expire_stale_reservations()
RETURNS void AS $$
BEGIN
  UPDATE tickets
  SET status = 'available',
      reserved_at = NULL,
      reserved_expires_at = NULL,
      buyer_name = NULL,
      buyer_phone = NULL,
      buyer_email = NULL,
      buyer_address = NULL
  WHERE status = 'en_espera'
    AND reserved_expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Se ejecuta desde Edge Function cron o desde cliente cada 30s
```

## Páginas / Rutas

| Ruta | Rendering | Descripción |
|------|-----------|-------------|
| `/` | SSG + Client Islands | Landing one-pager con secciones scroll |
| `/admin` | SSR | Panel admin protegido por contraseña |
| `/api/reserve-ticket` | Edge | POST: reservar boleto (transacción atómica) |
| `/api/claim-payment` | Edge | POST: confirmar pago por usuario |
| `/api/admin/update-ticket` | Edge | POST: admin marca pagado/libera |
| `/api/admin/tickets` | Edge | GET: lista boletos con filtros |

## API Endpoints

### POST /api/reserve-ticket
- **Input**: `{ raffle_id, ticket_number, buyer_name, buyer_phone, buyer_email?, buyer_address }`
- **Validación**: Zod schema completo
- **Lógica**:
  1. Rate limit: 5 req/hora por IP
  2. Transacción atómica: `SELECT ... FOR UPDATE` donde `status = 'available'`
  3. Si disponible → UPDATE a `en_espera`, set `reserved_expires_at = NOW() + 10min`
  4. Si no disponible → retorna boletos cercanos disponibles
- **Output**: `{ success, ticket_id, reservation_id }` o `{ error, alternative_tickets }`

### POST /api/claim-payment
- **Input**: `{ ticket_id, reservation_token }` (token guardado en localStorage)
- **Lógica**:
  1. Verificar que ticket esté `en_espera` y no expirado
  2. UPDATE: `status = 'pagado'`, `payment_claimed_at = NOW()`, `paid_at = NOW()`
  3. Enviar datos por WhatsApp (webhook a n8n o directo)
- **Output**: `{ success, message }`

### POST /api/admin/update-ticket
- **Auth**: Verificar `ADMIN_PASSWORD` en header
- **Input**: `{ ticket_id, action: 'mark_paid' | 'release', buyer_data? }`
- **Lógica**:
  - `mark_paid`: marca como pagado, inserta datos del comprador
  - `release`: libera boleto de `en_espera` a `available`
- **Output**: `{ success }`

### GET /api/admin/tickets
- **Auth**: Verificar `ADMIN_PASSWORD`
- **Query params**: `?raffle_id=&status=&page=&limit=`
- **Output**: `{ tickets, total, summary }`

## External Integrations

### WhatsApp (sin redirección)
- Al confirmar pago, se envía mensaje automático al número `+52 449 387 3713`
- Formato del mensaje:
  ```
  🎫 NUEVA RESERVA DE BOLETO
  
  Rifa: [nombre]
  Boleto: #[número]
  Nombre: [nombre completo]
  Teléfono: [teléfono]
  Email: [email o "No proporcionado"]
  Domicilio: [dirección completa]
  Monto: $50 MXN
  Estado: Pago confirmado por usuario
  ```
- Implementación: Server Action llama a WhatsApp Cloud API o usa link `wa.me` pre-llenado que se abre en background (sin redirigir al usuario)
- **Opción recomendada para prototipo**: Usar `https://wa.me/524493873713?text=URL_ENCODED_MESSAGE` — se abre WhatsApp Web/app con mensaje pre-llenado, el usuario solo presiona enviar. NO se redirige permanentemente, es una ventana temporal.

### Supabase Realtime
- Channel: `public:tickets`
- Filtro: `status=changed` o `UPDATE` events
- Client subscribe → grid se actualiza sin recargar
- Se usa para:
  - Cambios de estado en tiempo real
  - Expiración de reservas (cada 30s client-side check)

## n8n Workflows (opcional, fase 2)
1. **Notificación WhatsApp automática**: Trigger HTTP → envía mensaje vía WhatsApp Business API
2. **Resumen diario**: Cron a las 8PM → envía resumen de boletos vendidos al admin
3. **Alerta de expiración**: Cada 5 min → verifica boletos `en_espera` expirados y libera

## Seguridad

### Rate Limiting
| Endpoint | Límite | Ventana |
|----------|--------|---------|
| /api/reserve-ticket | 5 req | 1 hora |
| /api/claim-payment | 3 req | 1 hora |
| /api/admin/* | 20 req | 1 hora |

### Protección Admin
- Contraseña simple vía `ADMIN_PASSWORD` env var
- Verificación en cada endpoint admin
- Session cookie con expiración de 2 horas
- Sin tabla de usuarios — solo una contraseña compartida

### Validación de Datos
- Zod en TODOS los endpoints
- Sanitización de strings antes de insertar
- Phone regex: `/^\+?[\d\s\-]{7,15}$/`
- Email: Zod `.email().optional()`

### Transacciones Atómicas
- `SELECT ... FOR UPDATE` en PostgreSQL para evitar doble reserva
- Si dos usuarios eligen el mismo boleto simultáneamente:
  - Primero en confirmar → reserva exitosa
  - Segundo → error con boletos alternativos sugeridos

### Headers de Seguridad (next.config.ts)
```typescript
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];
```

## SEO Plan

### Metadata
```typescript
export const metadata = {
  title: 'Rifa Recaudación Médica — Ayuda a Felix',
  description: 'Participa en nuestra rifa benéfica y ayuda a recaudar fondos para el tratamiento médico de Felix Octavio Martinez Hernandez',
  openGraph: {
    title: 'Rifa Recaudación Médica — Ayuda a Felix',
    description: 'Participa en nuestra rifa benéfica y ayuda a recaudar fondos para el tratamiento médico de Felix',
    image: '/og-image.jpg', // Foto de Felix
    type: 'website',
  },
};
```

### JSON-LD (Event + Fundraising)
```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Rifa Recaudación Médica — Felix",
  "startDate": "2026-04-08T17:00:00-06:00",
  "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
  "organizer": {
    "@type": "Person",
    "name": "Gustavo Martinez Montes"
  },
  "description": "Rifa benéfica para recaudar fondos del tratamiento médico de Felix Octavio Martinez Hernandez"
}
```

### Sitemap
- Single page → sitemap.xml con solo `/` y `/admin` (noindex)

## Testing Plan

### E2E Flows Críticos (Playwright)
1. **Flujo completo de compra**: Seleccionar boleto → llenar formulario → ver instrucciones → confirmar pago → grid actualizado
2. **Doble reserva simultánea**: Dos navegadores intentan mismo boleto → solo uno reserva
3. **Expiración de reserva**: Boleto en espera → esperar 10 min → vuelve a disponible
4. **Admin panel**: Login → ver boletos → marcar pagado → exportar CSV
5. **Mobile responsive**: Grid de boletos usable en viewport 375px

### Unit Tests
- `useCountdown.ts`: cálculo correcto de tiempo restante en CST
- `useTicketRealtime.ts`: manejo de eventos de Supabase
- `whatsapp.ts`: generación correcta de URL y mensaje
- Validación Zod de todos los schemas

## Variables de Entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...service_role...

# Admin
ADMIN_PASSWORD=rifa2026segura

# WhatsApp (opcional, para envío automático)
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=

# Rate Limiting (Upstash - free tier)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# App
NEXT_PUBLIC_RAFFLE_DATE=2026-04-08T17:00:00-06:00
NEXT_PUBLIC_TICKET_PRICE=50
```

## Orden de Ejecución

1. **`/agent devops`** — Crear proyecto Supabase con CLI. Ejecutar migraciones SQL (tablas raffles, tickets, políticas RLS, función expire). Generar credenciales. Crear proyecto Cloudflare Pages. Configurar GitHub Actions CI/CD.

2. **`/agent backend`** — Crear API routes: `/api/reserve-ticket`, `/api/claim-payment`, `/api/admin/update-ticket`, `/api/admin/tickets`. Implementar transacciones atómicas con `SELECT FOR UPDATE`. Configurar rate limiting con Upstash. Implementar validación Zod en todos los endpoints. Crear función de expiración client-side.

3. **`/agent frontend`** — Scaffold estructura FSD. Crear componentes UI base (Button, Input, Modal, Badge, Card, Tabs). Implementar HeroSection con countdown. Implementar CauseSection con foto de Felix. Implementar RaffleCard + RaffleTabs. Implementar TicketGrid con 250 celdas y colores por estado. Implementar PurchaseModal con formulario. Implementar PaymentInstructions + PaymentConfirmButton. Implementar BankDetails sticky. Implementar Footer. Implementar Header. Implementar WhatsAppFloat button.

4. **`/agent frontend`** (continuación) — Implementar Supabase Realtime subscription en TicketGrid. Hook `useTicketRealtime` para actualizaciones en vivo. Hook `useCountdown` con timezone CST. Hook `useLocalStorage` para reservation tokens. Integrar Framer Motion para animaciones sutiles (fade-in secciones, pulse en countdown). Responsive mobile-first completo.

5. **`/agent qa`** — E2E tests con Playwright: flujo completo de compra, doble reserva simultánea, expiración de reserva, admin panel, mobile responsive. Validar form validation con Zod. Verificar Realtime updates entre dos pestañas.

6. **`/agent devops`** (continuación) — Deploy a Cloudflare Pages. Configurar variables de entorno. Verificar HTTPS. Configurar dominio personalizado (si aplica). Verificar OG image y metadata SEO.

## Estimación de Esfuerzo

- **Requests a LLM**: ~45-60
- **Costo estimado (DeepSeek)**: ~$0.15-$0.25
- **Tiempo estimado**: 2-3 horas de ejecución paralela de agentes
- **Complejidad**: Media (realtime + transacciones atómicas + 3 rifas)

## Notas Importantes

1. **Sin pasarela de pagos**: Todo es manual. Se confía en que el usuario pagó al presionar "Ya realicé el pago". Admin puede verificar manualmente.
2. **WhatsApp sin redirección**: Se abre `wa.me` con mensaje pre-llenado en nueva pestaña. El usuario vuelve a la landing automáticamente.
3. **Boletos en efectivo**: Admin los marca manualmente desde el panel con datos del comprador.
4. **Expiración**: Client-side check cada 30s + Supabase function para limpieza. No requiere cron externo en prototipo.
5. **Imágenes**: Copiar desde `Images/` a `public/images/` durante el setup.
