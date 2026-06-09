# Modelo de Datos

**Versión:** 1.0.0
**Fecha de creación:** 2026-06-09
**Autor:** Pronautic Dev AI

Este documento expone las entidades primarias definidas en `src/types.ts` y detalla las interrelaciones y el almacenamiento adoptado.

## Interfaces TypeScript Principales

### `CalendarEvent` (Fuente Externa)
Estructura mínima necesaria mapeada desde Google Calendar.
```typescript
export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  htmlLink?: string;
  organizer?: { email: string; displayName?: string };
}
```

### `ExtendedCourseData` (Enriquecimiento Pronautic)
Agrupa las modificaciones o ampliaciones operativas locales para cada evento sin mutar el evento original de la API de Google.
```typescript
export interface ExtendedCourseData {
  instructor?: string;       // Instructor genérico/legacy
  aula?: string;             // Espacio físico asignado
  embarcacion?: string;      // Nombre de la embarcación designada
  codigoCurso?: string;      // Matrícula interna DGMM
  courseNotes?: CourseNotesData; 
  auditLogs?: CourseAuditLog[];
  documents?: CourseDocument[];
  incidents?: CourseIncident[];
  students?: StudentInfo[];
  feedbackTickets?: FeedbackTicket[];
}
```

### `CourseNotesData`
El repositorio interno de ejecución de un evento particular por parte de un profesor (apoya a la generación de La Nota).
```typescript
export interface CourseNotesData {
  eventId: string;
  resumen?: string;
  instructorPrincipalNom?: string;
  instructorSecundariNom?: string;
  asistentesObservaciones?: string;
  incidentesAverias?: string;
  estadoLimpieza?: string;
  notaGeneral?: string;        // Evaluación 1 al 10
  fechaCreacion: string;       // ISO String
  ultimaEdicion: string;       // ISO String
}
```

### `InstructorProfile`
Perfil administrativo de los docentes.
```typescript
export interface InstructorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  branca: "STCW" | "SANITARI" | "ESBARJO" | "OTROS" | "";
  category: string;
  location: string;
}
```

## Estructura LocalStorage Aplicada (Persistencia Actual)

| LocalStorage Key | Tipo de Dato (JSON) | Propósito del Entorno |
| :--- | :--- | :--- |
| `pronautic_aulas` | `string[]` | Catalogo base estático de espacios de aula. |
| `pronautic_embarcaciones` | `string[]` | Catalogo base estático de naves. |
| `event_allocated_resources` | `Record<string, ExtendedCourseData>` | Key es el Event ID de Google, Value es todo metadato Pronautic enlazado. |
| `teacher_availabilities` | `TeacherAvailability[]` | Entidades de declaración de tiempo hábil de instructores particulares (independiente a calendarios). |
| `staff_database_v1` | `InstructorProfile[]` | Lista oficial cacheada del cuerpo docente. |

## Plan de Migración a Firestore (Fase 2)

Las llaves descritas de `localStorage` presentarán problemas si hay múltiples administradores trabajando a la vez.

**Colecciones Firestore Propuestas:**
1. `events_metadata` (Docs mapeados vía `event.id`). Contiene un JSON idéntico a `ExtendedCourseData`.
2. `system_catalogs` (Documentos fijos: `aulas` y `embarcaciones`).
3. `instructors_directory` (Docs mapeador por email o guid conteniendo `InstructorProfile`).
4. `availabilities` (Docs representando franjas de disponibilidad).
