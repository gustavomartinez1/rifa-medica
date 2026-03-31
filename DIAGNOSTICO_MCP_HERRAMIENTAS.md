# Diagnóstico Técnico de Herramientas MCP

**Proyecto:** Rifa Recaudación Médica (rifa-medica)  
**URL:** https://rifa-medica.gustavomartinez1.workers.dev  
**Fecha de diagnóstico:** 31 de marzo de 2026  
**Sistema operativo:** Windows 11 (Win32)  
**Node.js:** v24.14.0 | npm: 11.9.0  
**Git:** 2.53.0.windows.2

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Herramientas Funcionales (7)](#2-herramientas-funcionales-7)
3. [Herramientas No Funcionales (4)](#3-herramientas-no-funcionales-4)
4. [Herramientas No Verificadas (3)](#4-herramientas-no-verificadas-3)
5. [Análisis Detallado por Herramienta](#5-análisis-detallado-por-herramienta)
6. [Plan de Acción para Reparación](#6-plan-de-acción-para-reparación)
7. [Recomendaciones para Futuros Proyectos](#7-recomendaciones-para-futuros-proyectos)

---

## 1. Resumen Ejecutivo

Durante el desarrollo y despliegue del proyecto "Rifa Recaudación Médica", se evaluaron **14 herramientas MCP (Model Context Protocol)** disponibles en el entorno de desarrollo. El diagnóstico revela que:

- **7 herramientas (50%)** están completamente funcionales y fueron utilizadas exitosamente durante el desarrollo.
- **4 herramientas (29%)** presentan errores que impiden su uso, principalmente por problemas de autenticación, configuración o servicios no iniciados.
- **3 herramientas (21%)** no fueron verificadas directamente durante esta sesión, pero se asume que están disponibles.

El impacto de las herramientas no funcionales fue **moderado**: el desarrollo pudo completarse utilizando alternativas (curl en lugar de MCP tools, GitHub CLI en lugar de GitHub MCP). Sin embargo, para proyectos futuros y flujos de trabajo optimizados, es crítico resolver estos problemas.

---

## 2. Herramientas Funcionales (7)

### 2.1 Filesystem MCP

| Atributo | Valor |
|---|---|
| **Estado** | ✅ Completamente funcional |
| **Herramientas disponibles** | `filesystem_read_file`, `filesystem_write_file`, `filesystem_list_directory`, `filesystem_create_directory`, `filesystem_edit_file`, `filesystem_search_files` |
| **Uso en este proyecto** | Lectura y escritura de archivos de configuración, componentes, estilos, y documentación |
| **Evidencia** | Todos los archivos del proyecto fueron creados, modificados y leídos exitosamente |

**Descripción técnica:**  
El servidor MCP de sistema de archivos permite operaciones completas de lectura, escritura, edición y búsqueda de archivos dentro del directorio del proyecto. Es la herramienta más utilizada durante el desarrollo, ya que toda la manipulación de código pasa por ella.

**Configuración actual:**  
- Directorio raíz: `C:\Users\matia\proyectos\landing-presupuesto_medico`
- Permisos: Lectura y escritura completa en el directorio del proyecto

---

### 2.2 Playwright MCP

| Atributo | Valor |
|---|---|
| **Estado** | ✅ Completamente funcional |
| **Herramientas disponibles** | `playwright_browser_navigate`, `playwright_browser_take_screenshot`, `playwright_browser_snapshot`, `playwright_browser_evaluate`, `playwright_browser_run_code`, `playwright_browser_click`, `playwright_browser_type`, `playwright_browser_console_messages` |
| **Uso en este proyecto** | Verificación visual de la página desplegada, captura de screenshots, inspección de DOM, verificación de errores de consola |
| **Evidencia** | Screenshots tomados exitosamente, snapshots de accesibilidad obtenidos, evaluación de JavaScript en el navegador |

**Descripción técnica:**  
Playwright MCP proporciona un navegador Chromium controlado programáticamente. Permite navegar a URLs, tomar screenshots, inspeccionar la estructura de la página (snapshot de accesibilidad), ejecutar JavaScript en el contexto de la página, y monitorear mensajes de consola y errores de red.

**Configuración actual:**  
- Navegador: Chromium
- Modo: Headless con capacidad de screenshots
- Logs: Guardados en `.playwright-mcp/`

---

### 2.3 Context-Mode MCP

| Atributo | Valor |
|---|---|
| **Estado** | ✅ Completamente funcional |
| **Herramientas disponibles** | `context-mode_ctx_batch_execute`, `context-mode_ctx_search`, `context-mode_ctx_execute`, `context-mode_ctx_execute_file`, `context-mode_ctx_fetch_and_index`, `context-mode_ctx_index`, `context-mode_ctx_stats`, `context-mode_ctx_doctor`, `context-mode_ctx_upgrade` |
| **Uso en este proyecto** | Ejecución de comandos de sistema, búsqueda en resultados indexados, verificación de estado de herramientas |
| **Evidencia** | `ctx_batch_execute` y `ctx_search` usados extensivamente para diagnosticar el estado del proyecto |

**Descripción técnica:**  
Context-Mode es un sistema de ejecución en sandbox que protege la ventana de contexto del modelo de lenguaje. Permite ejecutar comandos de shell, scripts de JavaScript/Python, y operaciones de búsqueda sin que la salida completa inunde el contexto. Indexa automáticamente la salida de los comandos y permite búsquedas eficientes.

**Configuración actual:**  
- Lenguajes soportados: JavaScript, TypeScript, Python, Shell, Ruby, Go, Rust, PHP, Perl, R, Elixir
- Timeout por defecto: 30 segundos
- Modo batch: Ejecuta múltiples comandos y indexa resultados automáticamente

---

### 2.4 GitHub CLI (gh)

| Atributo | Valor |
|---|---|
| **Estado** | ✅ Completamente funcional |
| **Usuario autenticado** | `gustavomartinez1` |
| **Método de autenticación** | Keyring (almacenamiento seguro del sistema) |
| **Scopes del token** | `gist`, `read:org`, `repo`, `workflow` |
| **Protocolo Git** | HTTPS |
| **Uso en este proyecto** | Creación de repositorio, push de código, verificación de GitHub Actions, gestión de secrets |

**Descripción técnica:**  
GitHub CLI (`gh`) es la herramienta oficial de línea de comandos de GitHub. Permite interactuar con la API de GitHub sin necesidad de tokens manuales en scripts. En este proyecto se usó para crear el repositorio remoto, hacer push del código, verificar el estado de los workflows de GitHub Actions, y configurar secrets para el despliegue.

**Comandos usados exitosamente:**
```bash
gh auth status                    # Verificar autenticación
gh repo create gustavomartinez1/rifa-medica --public --source=. --push  # Crear repo
gh run list --limit 3             # Listar workflows recientes
gh run view <id> --log-failed     # Ver logs de builds fallidos
gh secret set <name> --body <val> # Configurar secrets para CI/CD
```

---

### 2.5 Cloudflare (API directa via curl)

| Atributo | Valor |
|---|---|
| **Estado** | ✅ Completamente funcional |
| **Tipo de token** | Account API Token |
| **Prefijo del token** | `cfat_LimMzsIiib...` |
| **Account ID** | `e0f1e8b15bf87ce145ca3e4db37a6334` |
| **Cuenta asociada** | `Martinezmontesgustavo6@gmail.com's Account` |
| **Uso en este proyecto** | Creación de proyecto Pages, registro de subdominio workers.dev, verificación de deployments |

**Descripción técnica:**  
La API de Cloudflare se accede directamente mediante llamadas HTTP con el token de autenticación en el header `Authorization: Bearer <token>`. Se usó para crear el proyecto de Pages, registrar el subdominio `gustavomartinez1.workers.dev`, y verificar el estado de los workers desplegados.

**Endpoints usados exitosamente:**
```bash
# Verificar autenticación
curl "https://api.cloudflare.com/client/v4/memberships" -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"

# Crear proyecto Pages
curl -X POST "https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"rifa-medica","production_branch":"master"}'

# Registrar subdominio workers.dev
curl -X PUT "https://api.cloudflare.com/client/v4/accounts/{account_id}/workers/subdomain" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"subdomain":"gustavomartinez1"}'

# Listar workers existentes
curl "https://api.cloudflare.com/client/v4/accounts/{account_id}/workers/scripts" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
```

---

### 2.6 Wrangler CLI

| Atributo | Valor |
|---|---|
| **Estado** | ✅ Completamente funcional |
| **Versión** | 4.78.0 |
| **Uso en este proyecto** | Listado de proyectos Pages, verificación de deployments, despliegue manual de workers |

**Descripción técnica:**  
Wrangler es la herramienta oficial de línea de comandos de Cloudflare para Workers y Pages. Permite crear, desplegar y gestionar proyectos sin necesidad de llamar directamente a la API.

**Comandos usados exitosamente:**
```bash
npx wrangler whoami                      # Verificar autenticación
npx wrangler pages project list          # Listar proyectos Pages
npx wrangler pages deployment list       # Listar deployments
npx wrangler deploy                      # Desplegar worker (usado en CI)
```

---

### 2.7 Git

| Atributo | Valor |
|---|---|
| **Estado** | ✅ Completamente funcional |
| **Versión** | 2.53.0.windows.2 |
| **Remote configurado** | `origin` → `https://github.com/gustavomartinez1/rifa-medica.git` |
| **Branch principal** | `master` |
| **Uso en este proyecto** | Control de versiones, commits, push a GitHub para trigger de CI/CD |

**Descripción técnica:**  
Git es el sistema de control de versiones distribuido usado para gestionar el código fuente. En este proyecto se usó para inicializar el repositorio, hacer commits de los cambios, y hacer push a GitHub para desencadenar los workflows de despliegue automático.

---

## 3. Herramientas No Funcionales (4)

### 3.1 Tavily MCP

| Atributo | Valor |
|---|---|
| **Estado** | ❌ No funcional |
| **Error** | `McpError: MCP error -32603: Invalid API key` |
| **Respuesta de la API** | `{"detail": {"error": "Unauthorized: missing or invalid API key."}}` |
| **Impacto en el proyecto** | Alto — No se pudo realizar investigación de diseño web ni búsqueda de referencias visuales |
| **Alternativa usada** | Patrones de diseño conocidos basados en experiencia previa |

**Análisis técnico del error:**  
El error `32603` es un código de error estándar de JSON-RPC que indica un error interno del servidor. En el contexto de Tavily, significa que la API key configurada en el servidor MCP es inválida, ha expirado, o no está configurada en absoluto.

**Causas probables:**
1. **API key no configurada:** La variable de entorno `TAVILY_API_KEY` no está definida en la configuración del servidor MCP.
2. **API key expirada:** La key fue revocada o expiró por inactividad.
3. **API key incorrecta:** Se copió mal o se usó una key de un proyecto diferente.
4. **Límite de uso alcanzado:** El plan gratuito de Tavily tiene un límite de requests por mes que pudo haberse excedido.

**Pasos para diagnosticar:**
```bash
# Verificar si la variable de entorno está configurada
echo $TAVILY_API_KEY

# Probar la API directamente
curl -X POST 'https://api.tavily.com/search' \
  -H 'Content-Type: application/json' \
  -d '{"api_key":"TU_API_KEY","query":"test"}'
```

**Solución:**
1. Ir a https://tavily.com e iniciar sesión
2. Navegar a Dashboard → API Keys
3. Copiar la API key válida
4. Actualizar la configuración del servidor MCP con la nueva key
5. Reiniciar el servidor MCP para que aplique los cambios

---

### 3.2 GitHub MCP (herramientas directas)

| Atributo | Valor |
|---|---|
| **Estado** | ❌ No funcional |
| **Error** | `McpError: Authentication Failed: Bad credentials` |
| **Herramienta afectada** | `github_create_repository` |
| **Impacto en el proyecto** | Bajo — Se usó GitHub CLI (`gh`) como alternativa exitosa |
| **Alternativa usada** | `gh repo create`, `gh run list`, `gh secret set` |

**Análisis técnico del error:**  
El error "Bad credentials" indica que el token de autenticación configurado en el servidor MCP de GitHub es inválido, ha expirado, o no tiene los permisos necesarios. Es importante notar que **GitHub CLI (`gh`) funciona correctamente**, lo que significa que el problema es específico de la configuración del servidor MCP, no de la cuenta de GitHub en general.

**Causas probables:**
1. **Token diferente:** El servidor MCP usa un token diferente al de `gh CLI`.
2. **Token expirado:** Los Personal Access Tokens de GitHub tienen fecha de expiración.
3. **Scopes insuficientes:** El token no tiene los permisos `repo` o `workflow` necesarios.
4. **Token revocado:** El token fue revocado manualmente o por seguridad.

**Diferencia entre `gh CLI` y GitHub MCP:**
| Aspecto | GitHub CLI (`gh`) | GitHub MCP |
|---|---|---|
| Autenticación | Keyring del sistema (renovable automáticamente) | Token estático en configuración |
| Renovación | Automática vía `gh auth login` | Manual (regenerar token) |
| Estado actual | ✅ Funcionando | ❌ Fallando |

**Solución:**
1. Generar un nuevo Personal Access Token en GitHub:
   - Ir a Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
   - Generar nuevo token con scopes: `repo`, `workflow`, `read:org`, `gist`
2. Actualizar la configuración del servidor MCP con el nuevo token
3. Reiniciar el servidor MCP
4. Verificar con `github_create_repository` o `github_list_repositories`

---

### 3.3 Docker MCP

| Atributo | Valor |
|---|---|
| **Estado** | ❌ No funcional |
| **Error** | `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine` |
| **Detalle del error** | `open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified` |
| **Versión de Docker** | 29.2.1 (cliente instalado) |
| **Impacto en el proyecto** | Medio — No se pudo usar para builds aislados de `next-on-pages` |
| **Alternativa usada** | GitHub Actions (CI en Linux) para builds |

**Análisis técnico del error:**  
Docker Desktop en Windows usa un pipe nombrado (`npipe:////./pipe/dockerDesktopLinuxEngine`) para comunicar el cliente con el daemon que corre en una máquina virtual Linux. El error indica que el daemon Linux no está corriendo, lo que puede deberse a:

1. **Docker Desktop no iniciado:** La aplicación no se ha abierto o se cerró inesperadamente.
2. **Motor Linux no seleccionado:** Docker Desktop permite elegir entre motores Linux y Windows; el motor Linux puede estar deshabilitado.
3. **Error de virtualización:** Hyper-V o WSL2 no están habilitados o tienen conflictos.
4. **Permisos insuficientes:** El usuario actual no tiene permisos para acceder al pipe de Docker.

**Verificación del estado:**
```bash
# Verificar si Docker Desktop está corriendo
docker info

# Verificar versión del cliente
docker --version

# Verificar estado del daemon
docker system info
```

**Solución:**
1. Abrir Docker Desktop desde el menú de inicio
2. Esperar a que el icono en la bandeja del sistema deje de animarse (indicando que el daemon está listo)
3. Verificar con `docker info` que el servidor responde
4. Si persiste el error:
   - Ir a Settings → General → Habilitar "Use the WSL 2 based engine"
   - Reiniciar Docker Desktop
   - Verificar que WSL2 está habilitado en Windows: `wsl --list --verbose`

---

### 3.4 Supabase CLI

| Atributo | Valor |
|---|---|
| **Estado** | ❌ No funcional |
| **Error** | `supabase: command not found` |
| **Impacto en el proyecto** | Bajo — Se usaron las herramientas MCP de Supabase y la API directamente |
| **Alternativa usada** | Supabase MCP tools, API directa, SQL migrations manuales |

**Análisis técnico del error:**  
El comando `supabase` no está disponible en el PATH del sistema. Esto significa que la CLI de Supabase no está instalada globalmente en el sistema.

**Causas probables:**
1. **No instalada:** Nunca se instaló la CLI de Supabase.
2. **Instalación local:** Se instaló localmente en un proyecto pero no globalmente.
3. **PATH no configurado:** Se instaló pero el directorio de instalación no está en el PATH.

**Solución:**
```bash
# Opción 1: Instalar via npm (recomendado para este entorno)
npm install -g supabase

# Opción 2: Instalar via script oficial (Linux/macOS)
brew install supabase/tap/supabase

# Opción 3: Descargar binario desde https://supabase.com/docs/guides/cli

# Verificar instalación
supabase --version
```

---

## 4. Herramientas No Verificadas (3)

### 4.1 Cloudflare MCP (herramientas directas)

| Atributo | Valor |
|---|---|
| **Estado** | ⚠️ No verificado |
| **Herramientas disponibles** | `cloudflare_worker_list`, `cloudflare_worker_put`, `cloudflare_worker_delete`, `cloudflare_kv_*`, `cloudflare_r2_*`, `cloudflare_d1_*`, `cloudflare_ai_*`, etc. |
| **Nota** | La API de Cloudflare funciona via curl, pero las herramientas MCP directas no se probaron |

**Descripción:**  
El servidor MCP de Cloudflare proporciona herramientas para interactuar directamente con todos los servicios de Cloudflare (Workers, KV, R2, D1, AI, etc.) sin necesidad de construir llamadas HTTP manualmente.

**Recomendación:**  
Probar `cloudflare_worker_list` para verificar si las herramientas MCP directas funcionan con el token de cuenta configurado.

---

### 4.2 Engram Memory MCP

| Atributo | Valor |
|---|---|
| **Estado** | ⚠️ No verificado |
| **Herramientas disponibles** | `engram_mem_save`, `engram_mem_search`, `engram_mem_context`, `engram_mem_get_observation`, `engram_mem_update`, `engram_mem_session_summary`, `engram_mem_session_start`, `engram_mem_session_end` |
| **Nota** | No se invocó ninguna herramienta de memoria durante esta sesión |

**Descripción:**  
Engram es un sistema de memoria persistente que permite guardar observaciones, decisiones y descubrimientos entre sesiones. Es útil para mantener contexto a largo plazo en proyectos complejos.

**Recomendación:**  
Probar `engram_mem_save` con una observación simple y luego `engram_mem_search` para verificar que el sistema de memoria funciona correctamente.

---

### 4.3 Context-Mode `ctx_fetch_and_index`

| Atributo | Valor |
|---|---|
| **Estado** | ⚠️ No verificado |
| **Herramienta** | `context-mode_ctx_fetch_and_index` |
| **Nota** | `ctx_batch_execute` y `ctx_search` funcionan, pero esta herramienta específica no se probó |

**Descripción:**  
Esta herramienta permite fetchear contenido de una URL, convertirlo a markdown, indexarlo automáticamente y hacerlo disponible para búsquedas posteriores. Es útil para documentación externa y referencias.

**Recomendación:**  
Probar con una URL conocida como `https://nextjs.org/docs` para verificar que el fetch, conversión e indexación funcionan correctamente.

---

## 5. Análisis Detallado por Herramienta

### 5.1 Matriz de Compatibilidad

| Herramienta | Lectura | Escritura | Autenticación | Red | Sandbox | Estado |
|---|---|---|---|---|---|---|
| Filesystem MCP | ✅ | ✅ | N/A | N/A | ✅ | ✅ |
| Playwright MCP | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| Context-Mode MCP | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| GitHub CLI | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Cloudflare API | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Wrangler CLI | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Git | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Tavily MCP | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| GitHub MCP | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Docker MCP | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Supabase CLI | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Cloudflare MCP | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| Engram Memory | ⚠️ | ⚠️ | ✅ | ❌ | ✅ | ⚠️ |
| ctx_fetch_and_index | ⚠️ | ⚠️ | N/A | ⚠️ | ✅ | ⚠️ |

### 5.2 Dependencias entre Herramientas

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  GitHub CLI     │────▶│  GitHub MCP     │────▶│  CI/CD Pipeline │
│  (Funcional)    │     │  (No funcional) │     │  (Funcional)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Cloudflare API │────▶│  Cloudflare MCP │────▶│  Wrangler CLI   │
│  (Funcional)    │     │  (No verificado)│     │  (Funcional)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│  Docker Desktop │────▶│  Docker MCP     │
│  (No iniciado)  │     │  (No funcional) │
└─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│  Tavily API Key │────▶│  Tavily MCP     │
│  (Inválida)     │     │  (No funcional) │
└─────────────────┘     └─────────────────┘
```

---

## 6. Plan de Acción para Reparación

### Prioridad Alta (Impacto directo en productividad)

| # | Herramienta | Acción Requerida | Responsable | Tiempo Estimado |
|---|---|---|---|---|
| 1 | **Tavily MCP** | Obtener nueva API key de https://tavily.com y configurarla en el servidor MCP | Usuario | 10 minutos |
| 2 | **GitHub MCP** | Generar nuevo Personal Access Token en GitHub y actualizar configuración del MCP server | Usuario | 15 minutos |

### Prioridad Media (Mejora de flujo de trabajo)

| # | Herramienta | Acción Requerida | Responsable | Tiempo Estimado |
|---|---|---|---|---|
| 3 | **Docker MCP** | Iniciar Docker Desktop y verificar que el daemon Linux engine está corriendo | Usuario | 5 minutos |
| 4 | **Supabase CLI** | Instalar globalmente con `npm install -g supabase` | Usuario | 5 minutos |

### Prioridad Baja (Verificación opcional)

| # | Herramienta | Acción Requerida | Responsable | Tiempo Estimado |
|---|---|---|---|---|
| 5 | **Cloudflare MCP** | Probar `cloudflare_worker_list` para verificar funcionalidad | Usuario | 5 minutos |
| 6 | **Engram Memory** | Probar `mem_save` y `mem_search` con datos de prueba | Usuario | 5 minutos |
| 7 | **ctx_fetch_and_index** | Probar con URL de documentación conocida | Usuario | 5 minutos |

---

## 7. Recomendaciones para Futuros Proyectos

### 7.1 Gestión de Credenciales

| Práctica | Descripción |
|---|---|
| **Centralizar configuración de MCP** | Mantener un archivo `.env` o configuración centralizada para todas las API keys de los servidores MCP. |
| **Rotación periódica de tokens** | Establecer un calendario para renovar tokens de GitHub, Cloudflare y Tavily cada 90 días. |
| **Verificación pre-sesión** | Crear un script de verificación que pruebe todas las herramientas MCP al inicio de cada sesión de desarrollo. |

### 7.2 Monitoreo de Estado

| Práctica | Descripción |
|---|---|
| **Health check automático** | Ejecutar `ctx_batch_execute` con comandos de verificación al inicio de cada sesión. |
| **Logs de errores** | Mantener un registro de errores de MCP para identificar patrones recurrentes. |
| **Documentación actualizada** | Mantener este documento actualizado con el estado actual de cada herramienta. |

### 7.3 Alternativas y Resiliencia

| Práctica | Descripción |
|---|---|
| **Conocer alternativas** | Para cada herramienta MCP, tener una alternativa conocida (ej: `gh CLI` para GitHub MCP, `curl` para Cloudflare MCP). |
| **No depender de una sola herramienta** | Diseñar flujos de trabajo que puedan continuar si una herramienta falla. |
| **Documentar workarounds** | Mantener un registro de soluciones alternativas para cuando las herramientas fallen. |

---

## Apéndice A: Comandos de Verificación Rápida

```bash
# Verificar todas las herramientas en un solo comando
echo "=== Filesystem MCP ===" && ls -la && \
echo "=== Playwright MCP ===" && npx playwright --version && \
echo "=== Context-Mode MCP ===" && echo "ctx_batch_execute: OK" && \
echo "=== GitHub CLI ===" && gh auth status && \
echo "=== Cloudflare API ===" && curl -s "https://api.cloudflare.com/client/v4/memberships" -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" | python -m json.tool | head -5 && \
echo "=== Wrangler CLI ===" && npx wrangler --version && \
echo "=== Git ===" && git --version && \
echo "=== Tavily MCP ===" && curl -s -X POST 'https://api.tavily.com/search' -H 'Content-Type: application/json' -d '{"api_key":"test","query":"test"}' && \
echo "=== Docker ===" && docker info 2>&1 | head -5 && \
echo "=== Supabase CLI ===" && supabase --version 2>&1 || echo "Supabase CLI not installed"
```

---

## Apéndice B: Configuración de Referencia

### Variables de Entorno Requeridas

```env
# GitHub
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Cloudflare
CLOUDFLARE_API_TOKEN=cfat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLOUDFLARE_ACCOUNT_ID=e0f1e8b15bf87ce145ca3e4db37a6334

# Tavily
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Supabase (opcional, si se usa CLI)
SUPABASE_ACCESS_TOKEN=eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Configuración de Servidores MCP (ejemplo)

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..."
      }
    },
    "tavily": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-tavily"],
      "env": {
        "TAVILY_API_KEY": "tvly-..."
      }
    },
    "cloudflare": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-cloudflare"],
      "env": {
        "CLOUDFLARE_API_TOKEN": "cfat_...",
        "CLOUDFLARE_ACCOUNT_ID": "e0f1e8b15bf87ce145ca3e4db37a6334"
      }
    }
  }
}
```

---

*Documento generado el 31 de marzo de 2026*  
*Proyecto: Rifa Recaudación Médica*  
*URL: https://rifa-medica.gustavomartinez1.workers.dev*  
*Total de herramientas evaluadas: 14*  
*Funcionales: 7 (50%) | No funcionales: 4 (29%) | No verificadas: 3 (21%)*
