# API Specification

**Versión:** 1.0.0
**Fecha de creación:** 2026-06-09
**Autor:** Pronautic Dev AI

Esta aplicación se apalanca fuertemente en las APIs de la nube pública (Google) complementandolas tangencialmente con un backend local proxy de inteligencia artificial.

---

## 1. Google Calendar API (v3)
Endpoint: `https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events`

### Propósito
Recolectar todos los eventos formativos de los calendarios corporativos expuestos a la cuenta que inició sesión.

### Autorización
Requiere acceso con Google OAuth y scope `https://www.googleapis.com/auth/calendar.readonly`.

### Consulta Implementada
El frontend pide iterativamente los últimos eventos usando delimitadores explícitos de fecha (ej. `timeMin` igual al principio de la semana actual y `timeMax` extendido según los requerimientos del filtro temporal visible). Las recargas periódicas traen `items: CalendarEvent[]`.

---

## 2. Google Tasks API (v1)
Endpoint: `https://www.googleapis.com/tasks/v1/users/@me/lists` y `https://tasks.googleapis.com/tasks/v1/lists/{tasklist}/tasks`

### Propósito
Vincular el contexto de las pendientes diárias del Director de Operaciones para cruzar contra el calendario formativo de Google.

### Autorización
Scope `https://www.googleapis.com/auth/tasks.readonly`.

---

## 3. Google Sheets API (v4)
Endpoint: `https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}:append`

### Propósito
Descarga en la nube (cloud logging), la exportación manual de listados de asistencia o métricas en un spreadsheet de validación oficial usando el modo de valor agregado bruto (APPEND).

### Autorización
Scope `https://www.googleapis.com/auth/spreadsheets`. Requiere inyectar token de autorización estándar de forma transparente a través de fetch.

---

## 4. API Proxy Interno IA (Express backend)
Endpoint local: `POST /api/analyze-schedule`

### Propósito
Proveer las sugerencias de la IA Gemini (`gemini-2.5-flash`) sin exponer la `GEMINI_API_KEY` hacia el entorno front-end (navegador del usuario).

### Request Payload (JSON)
```json
{
  "events": [ { "id": "...", "summary": "...", "start": { "dateTime": "..." } } ],
  "tasks": [ { "title": "...", "status": "needsAction" } ],
  "userLocalTime": "2026-06-09T10:00:00.000Z"
}
```

### Response Payload (JSON)
```json
{
  "summary": "Resumen ejecutivo integral del día en idioma castellano.",
  "focus": "El área directiva a enfocar (Ej. Coordinar traslados).",
  "conflicts": ["Aviso de alerta si dos instructores tienen el mismo horario.", "Conflicto menor Aula 2."],
  "tasksSynergy": ["Recomendación de emparejar Tarea A con el break del Curso B."],
  "suggestedTimeline": [
    { "timeSlot": "09:00", "activity": "Bienvenida y acomodación curso PNB." }
  ]
}
```

### Manejo de Fallos (Fallback)
Si el SDK `@google/genai` falla (por falta de cuota, falta de SDK key, o indisponibilidad del modelo), el endpoint Node Express está protegido por un boque de Catch robusto que genera un **objeto JSON falso pero bien estructurado** (`fallback`), imitando la IA mediante una inspección regex del texto e iteraciones locales.
