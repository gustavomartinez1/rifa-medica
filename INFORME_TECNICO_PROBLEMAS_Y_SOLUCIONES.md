# Informe Técnico: Problemas y Soluciones — Rifa Recaudación Médica

**Proyecto:** Rifa Recaudación Médica (rifa-medica)  
**URL:** https://rifa-medica.gustavomartinez1.workers.dev  
**Stack:** Next.js 15 + React 19 + Tailwind CSS + Supabase + Cloudflare Workers  
**Fecha:** 31 de marzo de 2026

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Problema 1: Credenciales de Supabase en Caché](#2-problema-1-credenciales-de-supabase-en-caché)
3. [Problema 2: Ruta Duplicada Causando Error de Prerender](#3-problema-2-ruta-duplicada-causando-error-de-prerender)
4. [Problema 3: Incompatibilidad de next-on-pages con Next.js 14/15 en Windows](#4-problema-3-incompatibilidad-de-next-on-pages-con-nextjs-1415-en-windows)
5. [Problema 4: Assets Estáticos No Se Servían (CSS/JS 404)](#5-problema-4-assets-estáticos-no-se-servían-cssjs-404)
6. [Problema 5: Registro de Subdominio workers.dev](#6-problema-5-registro-de-subdominio-workersdev)
7. [Problema 6: Estado de Boletos "pendiente" vs "pagado"](#7-problema-6-estado-de-boletos-pendiente-vs-pagado)
8. [Problema 7: Conflicto wrangler.toml Pages vs Workers](#8-problema-7-conflicto-wranglertoml-pages-vs-workers)
9. [Lecciones Aprendidas y Prevención](#9-lecciones-aprendidas-y-prevención)
10. [Arquitectura Final de Despliegue](#10-arquitectura-final-de-despliegue)

---

## 1. Resumen Ejecutivo

Durante el desarrollo y despliegue de la aplicación "Rifa Recaudación Médica", se enfrentaron **7 problemas técnicos críticos** que impidieron el despliegue exitoso en los primeros intentos. La mayoría de los problemas estuvieron relacionados con:

- **Gestión de caché y variables de entorno** en Next.js
- **Compatibilidad entre herramientas de despliegue** (`next-on-pages`, `@opennextjs/cloudflare`) y versiones de Next.js
- **Servicio de assets estáticos** en Cloudflare Workers
- **Configuración de CI/CD** en GitHub Actions

Todos los problemas fueron resueltos y la aplicación está actualmente en producción.

---

## 2. Problema 1: Credenciales de Supabase en Caché

### Descripción Técnica

El proyecto `rifa-medica` ya existía con código de un intento previo que apuntaba a un proyecto de Supabase diferente (`cnboqpyjefjytxxxmykr`). Al migrar el código al nuevo directorio `landing-presupuesto_medico` y crear un nuevo archivo `.env.local` con las credenciales correctas (`uttlwwjzjssiykzkcemu`), el servidor de desarrollo de Next.js seguía usando las credenciales antiguas.

### Causa Raíz

Next.js mantiene un caché de compilación en el directorio `.next/` que incluye:
- Bundles de JavaScript precompilados
- Variables de entorno embebidas en el bundle del cliente
- Módulos cacheados con valores hardcodeados

El archivo `src/shared/lib/supabase.ts` tenía valores fallback hardcodeados:

```typescript
// Código problemático
export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL || 'https://cnboqpyjefjytxxxmykr.supabase.co',
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJ...valor-viejo...'
  );
}
```

Cuando el servidor se iniciaba **antes** de que el `.env.local` existiera, los valores fallback se embebían en el bundle del cliente. Al crear el `.env.local` después, el bundle ya compilado no se regeneraba.

### Solución Aplicada

1. **Eliminación completa del caché:**
   ```bash
   rm -rf .next/
   ```

2. **Eliminación de valores fallback inseguros:**
   ```typescript
   // Código corregido
   export function createClient() {
     const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
     const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
     return createBrowserClient(supabaseUrl, supabaseAnonKey);
   }
   ```

3. **Reinicio completo del servidor de desarrollo** en un puerto diferente para evitar conflictos de caché del navegador.

### Cómo Evitarlo en Proyectos Futuros

| Práctica | Descripción |
|----------|-------------|
| **Crear `.env.local` antes del primer `npm run dev`** | Las variables de entorno se leen al iniciar el servidor, no en caliente. |
| **Nunca usar valores fallback para credenciales** | Si una variable de entorno es requerida, lanzar un error explícito en lugar de usar un valor por defecto. |
| **Usar `zod` para validar variables de entorno** | Crear un archivo `src/config/env.ts` que valide todas las variables al inicio de la aplicación. |
| **Agregar `.next/` al `.gitignore`** | Nunca commitear el caché de compilación al repositorio. |
| **Usar `npm run dev` limpio** | Si se cambian variables de entorno, siempre ejecutar `rm -rf .next && npm run dev`. |

---

## 3. Problema 2: Ruta Duplicada Causando Error de Prerender

### Descripción Técnica

Durante el build de producción, Next.js fallaba con el siguiente error:

```
Error occurred prerendering page "/". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of undefined (reading 'clientModules')
Export encountered an error on /(public)/page: /
```

### Causa Raíz

El proyecto tenía **dos archivos que resolvían a la misma ruta `/`**:

```
src/app/page.tsx           → Ruta: /
src/app/(public)/page.tsx  → Ruta: / (los paréntesis en App Router son grupos de ruta, no afectan la URL)
```

En Next.js App Router, los directorios entre paréntesis `(nombre)` son **grupos de ruta** que no afectan la estructura de URL. Ambos archivos intentaban renderizar la misma ruta `/`, causando un conflicto interno en el sistema de generación de páginas estáticas.

### Solución Aplicada

```bash
rm src/app/\(public\)/page.tsx
rm -rf src/app/\(public\)/
```

Se eliminó el archivo duplicado y se mantuvo solo `src/app/page.tsx` como la ruta principal.

### Cómo Evitarlo en Proyectos Futuros

| Práctica | Descripción |
|----------|-------------|
| **Entender grupos de ruta en App Router** | Los paréntesis `(auth)`, `(public)`, `(dashboard)` son solo para organización lógica, **no crean segmentos de URL**. |
| **Verificar rutas con `npm run build`** | Ejecutar el build localmente antes de desplegar para detectar conflictos de rutas. |
| **Usar `next dev` con verificación de rutas** | Next.js 14+ muestra advertencias de rutas duplicadas en la consola de desarrollo. |
| **Documentar estructura de rutas** | Mantener un mapa de rutas en la documentación del proyecto. |

---

## 4. Problema 3: Incompatibilidad de next-on-pages con Next.js 14/15 en Windows

### Descripción Técnica

La herramienta `@cloudflare/next-on-pages` fallaba consistentemente con dos errores diferentes dependiendo de la versión de Next.js:

**Con Next.js 14.2.35:**
```
npm error ERESOLVE could not resolve
npm error peer next@">=14.3.0 && <=15.5.2" from @cloudflare/next-on-pages@1.13.16
```

**Con Next.js 15:**
```
Error: spawn npx ENOENT
syscall: 'spawn npx',
path: 'npx',
spawnargs: [ 'vercel', 'build' ]
```

### Causa Raíz

1. **Conflicto de dependencias:** `next-on-pages@1.13.16` requiere `next@>=14.3.0`, pero Next.js 14.2.35 no cumple este requisito.

2. **Bug de Windows en next-on-pages:** La herramienta internamente ejecuta `npx vercel build` como un proceso hijo. En Windows, el comando `npx` no se resuelve correctamente en el PATH del proceso hijo, causando el error `ENOENT` (archivo no encontrado).

   Este es un **bug conocido** de `next-on-pages` en sistemas Windows, documentado en el repositorio de Cloudflare.

### Solución Aplicada

Se abandonó `@cloudflare/next-on-pages` y se migró a `@opennextjs/cloudflare`, que es el adaptador oficial más moderno y tiene mejor compatibilidad:

```bash
npm uninstall @cloudflare/next-on-pages
npm install @opennextjs/cloudflare wrangler --save-dev --legacy-peer-deps
```

Se creó el archivo de configuración `open-next.config.ts`:

```typescript
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({});
```

Y se actualizó el workflow de GitHub Actions:

```yaml
- name: Build for Cloudflare
  run: npx @opennextjs/cloudflare build -- --dangerouslyUseUnsupportedNextVersion
```

### Cómo Evitarlo en Proyectos Futuros

| Práctica | Descripción |
|----------|-------------|
| **Usar @opennextjs/cloudflare en lugar de next-on-pages** | Es el adaptador más moderno, mantenido activamente y con mejor soporte para Next.js 14+. |
| **Verificar compatibilidad de versiones antes de instalar** | Revisar las `peerDependencies` de las herramientas de despliegue. |
| **Desarrollar en Linux/WSL si es posible** | Muchas herramientas de despliegue tienen mejor soporte en Linux. |
| **Usar GitHub Actions para builds** | Los builds en CI (Linux) evitan problemas específicos de Windows. |
| **Mantener un .npmrc con legacy-peer-deps** | Para proyectos con dependencias conflictivas: `legacy-peer-deps=true` |

---

## 5. Problema 4: Assets Estáticos No Se Servían (CSS/JS 404)

### Descripción Técnica

Tras el primer despliegue exitoso a Cloudflare Workers, la página cargaba (HTTP 200) pero **sin estilos ni funcionalidad JavaScript**. Al verificar las solicitudes de red:

```
GET /_next/static/css/35a05a2afaa9195d.css → 404 Not Found
GET /_next/static/chunks/4bd1b696-....js → 404 Not Found
```

### Causa Raíz

El workflow de GitHub Actions estaba desplegando **solo el archivo `worker.js`**:

```yaml
# Configuración incorrecta
command: deploy .open-next/worker.js --name rifa-medica
```

Esto subía el código del servidor (que genera el HTML) pero **no los assets estáticos** (CSS, JS, imágenes) que Next.js genera en `.open-next/assets/`.

El archivo `wrangler.toml` no tenía configurada la sección `[assets]`, por lo que Cloudflare Workers no sabía dónde encontrar ni cómo servir los archivos estáticos.

### Solución Aplicada

1. **Configurar `[assets]` en `wrangler.toml`:**

   ```toml
   name = "rifa-medica"
   compatibility_date = "2026-03-31"
   compatibility_flags = ["nodejs_compat"]
   main = ".open-next/worker.js"

   [assets]
   directory = ".open-next/assets"
   binding = "ASSETS"
   not_found_handling = "404-page"
   ```

2. **Cambiar el comando de despliegue** para que use `wrangler deploy` sin argumentos, lo que lee automáticamente la configuración de `wrangler.toml`:

   ```yaml
   # Configuración correcta
   - name: Deploy to Cloudflare Workers
     uses: cloudflare/wrangler-action@v3
     with:
       apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
       accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
       command: deploy
   ```

### Cómo Evitarlo en Proyectos Futuros

| Práctica | Descripción |
|----------|-------------|
| **Siempre configurar `[assets]` en wrangler.toml** | Cuando se despliega una aplicación Next.js a Cloudflare Workers, los assets estáticos deben estar configurados explícitamente. |
| **Usar `wrangler deploy` sin argumentos** | Esto asegura que se lea toda la configuración del `wrangler.toml`, incluyendo assets, bindings y variables. |
| **Verificar assets después del despliegue** | Ejecutar `curl -I https://tu-app.workers.dev/_next/static/css/...` para confirmar que los assets responden con HTTP 200. |
| **Entender la estructura de @opennextjs/cloudflare** | El build genera `.open-next/worker.js` (servidor) y `.open-next/assets/` (estáticos). Ambos son necesarios. |

---

## 6. Problema 5: Registro de Subdominio workers.dev

### Descripción Técnica

El despliegue fallaba con el siguiente error:

```
✘ [ERROR] You need to register a workers.dev subdomain before publishing to workers.dev
You can either deploy your worker to one or more routes by specifying them in your wrangler.toml file, 
or register a workers.dev subdomain here: https://dash.cloudflare.com/workers/onboarding
```

### Causa Raíz

La cuenta de Cloudflare nunca había tenido un subdominio `workers.dev` registrado. Cloudflare requiere que se registre un subdominio único (ej: `mi-proyecto.workers.dev`) antes de poder desplegar workers accesibles públicamente.

La API de Cloudflare no permite registrar el subdominio con un API Token estándar (requiere autenticación de usuario con email/password o un token con permisos especiales).

### Solución Aplicada

Se registró el subdominio mediante la API de Cloudflare con una llamada `PUT`:

```bash
curl -X PUT "https://api.cloudflare.com/client/v4/accounts/{account_id}/workers/subdomain" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  -d '{"subdomain":"gustavomartinez1"}'
```

Esto registró `gustavomartinez1.workers.dev` como el subdominio base para todos los workers de la cuenta.

### Cómo Evitarlo en Proyectos Futuros

| Práctica | Descripción |
|----------|-------------|
| **Registrar workers.dev al crear la cuenta** | Ir a Cloudflare Dashboard → Workers & Pages → Onboarding y registrar el subdominio inmediatamente. |
| **Usar dominios personalizados** | En lugar de depender de `workers.dev`, configurar un dominio personalizado desde el inicio. |
| **Verificar antes del primer despliegue** | Ejecutar `npx wrangler whoami` para verificar que la cuenta tiene un subdominio configurado. |

---

## 7. Problema 6: Estado de Boletos "pendiente" vs "pagado"

### Descripción Técnica

Cuando un usuario compraba un boleto y presionaba "Ya realicé el pago", el boleto se guardaba con estado `pendiente` en la base de datos. Sin embargo, la cuadrícula visual de boletos solo reconocía tres estados:

- `available` → Verde (disponible)
- `en_espera` → Amarillo (reservado)
- `pagado` → Gris (vendido)

El estado `pendiente` no tenía un color asignado en la cuadrícula, por lo que los boletos confirmados no se visualizaban correctamente como vendidos.

### Causa Raíz

La API route `/api/claim-payment` estaba configurada para cambiar el estado a `pendiente` en lugar de `pagado`:

```typescript
// Código problemático
await supabase.from('tickets').update({
  status: 'pendiente',  // ← Estado incorrecto
  payment_claimed_at: new Date().toISOString(),
}).in('id', ticketIds).eq('status', 'en_espera');
```

Esto fue un error de diseño inicial donde se pensó en un estado intermedio `pendiente` para revisión manual, pero la cuadrícula no estaba preparada para renderizarlo.

### Solución Aplicada

Se modificó la API route para que el estado pase directamente a `pagado`:

```typescript
// Código corregido
await supabase.from('tickets').update({
  status: 'pagado',
  payment_claimed_at: new Date().toISOString(),
  paid_at: new Date().toISOString(),
}).in('id', ticketIds).eq('status', 'en_espera');
```

### Cómo Evitarlo en Proyectos Futuros

| Práctica | Descripción |
|----------|-------------|
| **Definir estados antes de implementar** | Documentar todos los estados posibles de una entidad y cómo se visualizan en la UI antes de escribir código. |
| **Mapear estados a colores en un solo lugar** | Crear un objeto de configuración: `{ available: 'green', en_espera: 'yellow', pagado: 'gray' }` |
| **Usar TypeScript enums o union types** | Definir `type TicketStatus = 'available' | 'en_espera' | 'pagado'` para que el compilador detecte estados no manejados. |
| **Testing de flujos completos** | Probar el flujo completo de compra desde la selección del boleto hasta la visualización en el grid. |

---

## 8. Problema 7: Conflicto wrangler.toml Pages vs Workers

### Descripción Técnica

Al intentar desplegar con `wrangler-action`, el proceso fallaba con:

```
✘ [ERROR] It looks like you've run a Workers-specific command in a Pages project.
For Pages, please run `wrangler pages secret bulk` instead.
```

### Causa Raíz

El archivo `wrangler.toml` fue detectado por wrangler como configuración de un proyecto **Pages** (porque inicialmente se intentó desplegar como Pages). Cuando el workflow intentaba ejecutar comandos de **Workers** (como `wrangler deploy` o `wrangler secret bulk`), wrangler rechazaba la operación por inconsistencia de tipo de proyecto.

### Solución Aplicada

1. **Eliminar el wrangler.toml conflictivo** temporalmente para permitir el despliegue de Workers.
2. **Crear un wrangler.toml mínimo** compatible con Workers:

   ```toml
   name = "rifa-medica"
   compatibility_date = "2026-03-31"
   compatibility_flags = ["nodejs_compat"]
   main = ".open-next/worker.js"

   [assets]
   directory = ".open-next/assets"
   ```

3. **Usar `wrangler deploy` sin argumentos** en el workflow para que lea la configuración automáticamente.

### Cómo Evitarlo en Proyectos Futuros

| Práctica | Descripción |
|----------|-------------|
| **Decidir Pages vs Workers desde el inicio** | No mezclar configuraciones. Pages es para sitios estáticos con funciones serverless; Workers es para aplicaciones con servidor completo. |
| **No reutilizar wrangler.toml entre tipos de proyecto** | Si se cambia de Pages a Workers (o viceversa), eliminar y recrear el proyecto en Cloudflare. |
| **Especificar el tipo de despliegue en CI/CD** | Usar `wrangler deploy` para Workers y `wrangler pages deploy` para Pages, nunca mezclarlos. |

---

## 9. Lecciones Aprendidas y Prevención

### 9.1 Gestión de Variables de Entorno

| Problema | Solución |
|----------|----------|
| Variables de entorno no se actualizan en caliente | Siempre limpiar `.next/` y reiniciar el servidor después de cambiar `.env.local` |
| Credenciales hardcodeadas como fallback | Nunca usar valores por defecto para credenciales; lanzar error si faltan |
| Secrets expuestos en el bundle del cliente | Usar `NEXT_PUBLIC_` solo para variables que deben estar en el cliente; las demás van solo en el servidor |

### 9.2 Despliegue en Cloudflare

| Problema | Solución |
|----------|----------|
| next-on-pages falla en Windows | Usar @opennextjs/cloudflare o ejecutar builds en CI (Linux) |
| Assets estáticos no se sirven | Configurar `[assets]` en wrangler.toml con el directorio correcto |
| Conflicto Pages vs Workers | Elegir uno desde el inicio y no mezclar configuraciones |
| Subdominio workers.dev no registrado | Registrarlo al crear la cuenta de Cloudflare |

### 9.3 Next.js App Router

| Problema | Solución |
|----------|----------|
| Rutas duplicadas causan errores de prerender | Los paréntesis `(grupo)` no crean segmentos de URL; verificar estructura de rutas |
| Errores de TypeScript en build | Usar `--no-lint` temporalmente para debug, pero mantener linting estricto |
| Config en .ts no soportado en Next.js 14 | Usar `.mjs` o `.js` para next.config en versiones anteriores a 15 |

### 9.4 Supabase

| Problema | Solución |
|----------|----------|
| Cliente usa credenciales incorrectas | Validar variables de entorno al inicio de la aplicación |
| Estados de boletos inconsistentes | Definir enum de estados y mapear a colores en un solo lugar |
| Datos de compradores no visibles | Asegurar que el panel admin consulte la tabla `tickets` con todos los campos |

---

## 10. Arquitectura Final de Despliegue

### Flujo de CI/CD

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Push a    │────▶│  GitHub      │────▶│  Build con       │────▶│  Deploy a       │
│   master    │     │  Actions     │     │  @opennextjs/    │     │  Cloudflare     │
│             │     │  (Ubuntu)    │     │  cloudflare      │     │  Workers        │
└─────────────┘     └──────────────┘     └──────────────────┘     └─────────────────┘
```

### Estructura de Archivos de Despliegue

```
.open-next/
├── worker.js              # Servidor Next.js (Cloudflare Worker)
├── assets/                # Assets estáticos
│   ├── _next/static/      # CSS, JS, fuentes
│   ├── images/            # Imágenes de la app
│   └── favicon.ico
├── server-functions/      # Funciones del servidor
└── cloudflare/            # Templates específicos de Cloudflare

wrangler.toml              # Configuración de despliegue
open-next.config.ts        # Configuración de @opennextjs/cloudflare
```

### Variables de Entorno Requeridas

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Pública | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública | Clave anónima de Supabase (cliente) |
| `SUPABASE_SERVICE_ROLE_KEY` | Secreta | Clave de servicio de Supabase (server) |
| `ADMIN_PASSWORD` | Secreta | Contraseña del panel de administración |

---

## Checklist para Proyectos Futuros

### Antes de Empezar

- [ ] Crear `.env.local` con todas las variables de entorno antes del primer `npm run dev`
- [ ] Validar variables de entorno con zod en `src/config/env.ts`
- [ ] Registrar subdominio workers.dev en Cloudflare
- [ ] Decidir entre Cloudflare Pages o Workers (no mezclar)

### Durante el Desarrollo

- [ ] Ejecutar `npm run build` localmente para detectar errores de rutas y tipos
- [ ] Verificar que no haya rutas duplicadas en App Router
- [ ] Usar TypeScript estricto para detectar estados no manejados
- [ ] Probar flujos completos (no solo componentes individuales)

### Antes de Desplegar

- [ ] Limpiar `.next/` y hacer build limpio
- [ ] Verificar que `wrangler.toml` esté configurado correctamente
- [ ] Confirmar que `[assets]` apunta al directorio correcto
- [ ] Configurar secrets en GitHub Actions
- [ ] Verificar compatibilidad de versiones (Next.js, adaptador, wrangler)

### Después de Desplegar

- [ ] Verificar HTTP 200 en la página principal
- [ ] Verificar HTTP 200 en assets estáticos (CSS, JS)
- [ ] Probar funcionalidades clave (formularios, API routes)
- [ ] Verificar que las variables de entorno estén cargadas correctamente
- [ ] Probar panel de administración

---

*Documento generado el 31 de marzo de 2026*  
*Proyecto: Rifa Recaudación Médica*  
*URL: https://rifa-medica.gustavomartinez1.workers.dev*
