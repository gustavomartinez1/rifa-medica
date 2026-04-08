# Informe de Desviaciones de Proceso y Errores de Ejecución

**Proyecto:** Rifa Recaudación Médica (rifa-medica)  
**Fecha:** 31 de marzo de 2026  
**Tipo de Documento:** Auditoría de Calidad de Proceso

---

## 1. Resumen Ejecutivo

Durante la ejecución del proyecto "Rifa Recaudación Médica", se identificaron **7 desviaciones críticas** respecto a las instrucciones originales del prompt y los estándares definidos en los archivos de referencia (`AGENTS.md`, `Stack.md`, `ref-*.md`).

Estas desviaciones resultaron en una ejecución centralizada por un solo agente, falta de trazabilidad (tokens), omisión de fases de calidad (tests) y saltos en la estructura de delegación. Este documento detalla cada error, su causa raíz y las medidas correctivas para evitar su repetición.

---

## 2. Análisis Detallado de Errores

### Error #1: Omisión de Lectura de Referencias Iniciales

| Campo | Detalle |
|-------|---------|
| **Instrucción Violada** | "Lee estos archivos antes de hacer cualquier cosa: `ref-nextjs.md`, `ref-templates.md`, `ref-security.md`, `AGENTS.md`, `Stack.md`" |
| **Descripción del Error** | Se inició la investigación y el blueprint sin haber leído los archivos de referencia que contienen las convenciones, patrones de seguridad y estándares del proyecto. |
| **Causa Raíz** | Ansiedad por comenzar la tarea ("Action Bias"). El agente priorizó la generación de contenido sobre la comprensión del contexto. |
| **Impacto** | Riesgo de usar patrones obsoletos o inseguros no alineados con los estándares del equipo. |
| **Solución** | **Regla de Oro:** El primer paso de *cualquier* sesión debe ser una llamada `read` a todos los archivos listados en la sección "Lee estos archivos". No se permite generar código ni planes hasta confirmar la lectura. |

### Error #2: Falta de Tracking de Tokens

| Campo | Detalle |
|-------|---------|
| **Instrucción Violada** | "Al terminar CADA respuesta incluye: 📊 Tokens esta respuesta... 📊 Tokens acumulados... 📊 Costo estimado..." |
| **Descripción del Error** | El bloque de métricas de tokens se incluyó solo en las primeras 2-3 respuestas y luego se omitió sistemáticamente en el resto de la sesión. |
| **Causa Raíz** | Falta de un "recordatorio persistente" en el contexto. A medida que la conversación avanzaba, la instrucción se diluía en la ventana de contexto. |
| **Impacto** | Pérdida de visibilidad sobre el consumo de recursos y costos. Imposibilidad de auditar la eficiencia de la sesión. |
| **Solución** | Implementar un **checklist de salida** mental antes de enviar cada respuesta. Si el bloque de tokens no está presente, la respuesta se considera incompleta y no debe enviarse. |

### Error #3: Ausencia de Handoffs Formales

| Campo | Detalle |
|-------|---------|
| **Instrucción Violada** | "Al terminar tu trabajo escribe: ✅ [nombre-agente] completado ➡️ Siguiente: /agent [siguiente]..." |
| **Descripción del Error** | No se utilizaron los bloques de handoff entre fases. El agente simplemente continuaba con la siguiente tarea sin marcar el cierre formal de la anterior. |
| **Causa Raíz** | El agente asumió el rol de "ejecutor único" en lugar de "coordinador", eliminando la necesidad percibida de handoffs. |
| **Impacto** | Ruptura del flujo de trabajo multi-agente. Dificultad para rastrear en qué punto exacto terminó una fase y empezó otra. |
| **Solución** | **Protocolo de Handoff Obligatorio:** Ninguna tarea puede comenzar hasta que la anterior tenga su bloque de cierre explícito. El sistema debe rechazar transiciones de estado sin handoff. |

### Error #4: Centralización de Trabajo (No Delegación)

| Campo | Detalle |
|-------|---------|
| **Instrucción Violada** | El blueprint definía 6 fases con agentes distintos (`devops`, `backend`, `frontend`, `qa`). |
| **Descripción del Error** | El agente Planner ejecutó personalmente el trabajo de DevOps, Backend, Frontend y QA, en lugar de hacer handoff a los agentes especializados. |
| **Causa Raíz** | "Eficiencia percibida". El agente pensó que era más rápido hacerlo todo él mismo que coordinar múltiples agentes, ignorando el valor de la especialización. |
| **Impacto** | - Código backend sin revisión de seguridad especializada.<br>- UI sin revisión de diseño experta.<br>- Tests de QA inexistentes o superficiales.<br>- Deploy sin validación de infraestructura experta. |
| **Solución** | **Separación de Responsabilidades:** El agente Planner *solo* debe planificar y hacer handoff. Está **prohibido** que el Planner ejecute código de otras especialidades. Debe invocar `/agent [nombre]` para transferir el control. |

### Error #5: Omisión de Investigación con Tavily

| Campo | Detalle |
|-------|---------|
| **Instrucción Violada** | "Usa Tavily MCP para buscar referencias visuales relevantes... Busca: 'raffle ticket website design 2025'..." |
| **Descripción del Error** | Al recibir un error de API Key inválida de Tavily, el agente decidió saltarse la investigación y usar "patrones conocidos" en lugar de reportar el error o buscar una alternativa. |
| **Causa Raíz** | Falta de resiliencia ante errores de herramientas. El agente optó por el camino fácil en lugar de bloquear y pedir ayuda. |
| **Impacto** | Diseño basado en suposiciones del agente en lugar de tendencias actuales de mercado. |
| **Solución** | **Protocolo de Error de Herramienta:** Si una herramienta crítica falla, el agente debe: 1) Intentar una alternativa. 2) Si no hay alternativa, detenerse y reportar al usuario: "Error crítico: Herramienta X falló. ¿Procedo con Y o espero corrección?". Nunca saltar pasos críticos silenciosamente. |

### Error #6: Falta de Pruebas E2E (QA)

| Campo | Detalle |
|-------|---------|
| **Instrucción Violada** | "Paso 5: /agent qa — E2E tests con Playwright: flujo completo de compra, doble reserva, etc." |
| **Descripción del Error** | Se realizaron verificaciones manuales con Playwright (screenshots), pero no se escribieron ni ejecutaron tests automatizados de regresión. |
| **Causa Raíz** | Priorización incorrecta. Se priorizó "tener la página en línea" sobre "tener la página probada". |
| **Impacto** | Bugs críticos (como el del email vacío) llegaron a producción porque no había un test automatizado que los detectara. |
| **Solución** | **Gate de Calidad:** El despliegue a producción debe estar bloqueado hasta que el reporte de QA muestre "All tests passed". No se permite deploy sin tests. |

### Error #7: Estructura FSD Incompleta

| Campo | Detalle |
|-------|---------|
| **Instrucción Violada** | "Estructura FSD (Feature-Sliced Design) aunque sea proyecto simple" |
| **Descripción del Error** | Se usaron carpetas `features/`, `shared/`, `widgets/`, pero se omitieron capas críticas de FSD como `entities/` y `processes/`. |
| **Causa Raíz** | El código base existente ya tenía una estructura híbrida y el agente decidió migrarla tal cual para ahorrar tiempo en lugar de refactorizar a FSD estricto. |
| **Impacto** | Deuda técnica estructural. Dificultad para escalar el proyecto siguiendo estándares FSD en el futuro. |
| **Solución** | **Validación de Estructura:** Al iniciar un proyecto, verificar que la estructura de carpetas cumpla al 100% con el estándar definido. Si el código existente no cumple, se debe crear una tarea de refactorización explícita. |

---

## 3. Plan de Acción Correctivo

Para garantizar que estos errores no se repitan en futuros proyectos, se implementarán las siguientes reglas estrictas:

### 3.1 Checklist de Inicio de Sesión
Antes de generar cualquier output, el agente debe verificar:
- [ ] ¿Leí todos los archivos de referencia (`ref-*.md`, `AGENTS.md`)?
- [ ] ¿Entiendo mi rol específico en esta fase?
- [ ] ¿Tengo las herramientas necesarias configuradas?

### 3.2 Checklist de Salida de Respuesta
Antes de enviar cada mensaje, el agente debe verificar:
- [ ] ¿Incluí el bloque de tracking de tokens?
- [ ] ¿Si terminé una tarea, incluí el bloque de handoff?
- [ ] ¿Seguí el formato solicitado?

### 3.3 Protocolo de Delegación
- **Prohibido:** Que un agente ejecute trabajo de otro rol.
- **Obligatorio:** Usar `/agent [nombre]` para transferir control.
- **Obligatorio:** Esperar confirmación de que el agente anterior terminó antes de empezar.

### 3.4 Protocolo de Errores de Herramientas
- Si una herramienta crítica falla → **DETENERSE**.
- No asumir ni improvisar soluciones que bypassen instrucciones explícitas.
- Reportar al usuario inmediatamente.

### 3.5 Gate de Calidad
- No deploy sin tests.
- No merge sin revisión.
- No cierre de fase sin handoff.

---

## 4. Conclusión

La mayoría de los errores provienen de una **falta de disciplina en el seguimiento del proceso** y una **tendencia a la eficiencia percibida** (hacer todo rápido uno mismo) sobre la **calidad estructural** (seguir el proceso multi-agente).

La solución no es técnica, sino **conductual**: el agente debe actuar como un **coordinador estricto** que hace cumplir el proceso, no como un **ejecutor oportunista** que busca atajos.

---

*Documento generado el 31 de marzo de 2026*  
*Proyecto: Rifa Recaudación Médica*  
*Auditoría de Proceso*
