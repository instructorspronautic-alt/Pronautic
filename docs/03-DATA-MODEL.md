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
  dataActualitzacio?: string;
  horariInici?: string;
  horariDescans?: string;
  horariFinalitzacio?: string;
  instructorPrincipalNom?: string;
  instructorPrincipalContractacio?: string;
  instructorSecundariNom?: string;
  instructorSecundariContractacio?: string;
  clausPortOlimpic?: boolean;
  clausBNC?: boolean;
  targetaPortOlimpic?: boolean;
  targetaBNC?: boolean;
  nombreAlumnesCurs?: number;
  mccCount?: number;
  mcrCount?: number;
}
```

### `EventMetadata`
Metadatos tabulares y check-ins para un evento específico de los instructores.
```typescript
export interface EventMetadata {
  id?: string;
  google_event_id: string;
  aula?: string;
  embarcacion?: string;
  instructor_id?: string;
  notas_sgc?: string;
  check_in_timestamp?: string | null;
  notas_instructor?: string;
  created_at?: string;
  updated_at?: string;
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
| `instructor_checkins` | `Record<string, EventMetadata>` | Registro local de check-ins de instructores por curso. |
| `teacher_availabilities` | `TeacherAvailability[]` | Entidades de declaración de tiempo hábil de instructores particulares (independiente a calendarios). |
| `staff_database_v1` | `InstructorProfile[]` | Lista oficial cacheada del cuerpo docente. |

## Estructura en Google Sheets (Persistencia Compartida)

El proyecto utiliza Google Sheets como base de datos en tiempo real mediante el `VITE_SHEETS_DB_ID`.

**Pestañas principales:**
1. `eventos_metadata` (Filas CSV donde formato es: `[google_event_id, stringificado de allocación JSON]`).
2. `instructores` (Directorio del cuerpo docente: `[id_instructor, stringificado JSON]`).
3. `disponibilidades` (Franjas horarias: `[guid_id, stringificado JSON]`).
