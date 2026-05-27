export interface GoogleProfile {
  name?: string;
  email?: string;
  picture?: string;
}

export interface CalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  htmlLink?: string;
  status?: string;
  created?: string;
  updated?: string;
  creator?: {
    email?: string;
    displayName?: string;
    self?: boolean;
  };
  organizer?: {
    email?: string;
    displayName?: string;
    self?: boolean;
  };
  attendees?: Array<{
    email?: string;
    displayName?: string;
    organizer?: boolean;
    self?: boolean;
    responseStatus?: "needsAction" | "declined" | "tentative" | "accepted";
  }>;
  hangoutLink?: string;
  calendarId?: string;
  calendarName?: string;
}

export interface GoogleTask {
  id: string;
  title?: string;
  notes?: string;
  due?: string;
  status?: "needsAction" | "completed";
  completed?: string;
  updated?: string;
  listId?: string;
  listTitle?: string;
}

export interface GoogleTaskList {
  id: string;
  title?: string;
  updated?: string;
}

export interface TimeDistribution {
  meetings: number;
  taskWork: number;
  breaks: number;
}

export interface SuggestedTimelineItem {
  timeSlot: string;
  activity: string;
}

export interface ScheduleAnalysis {
  summary: string;
  focus: string;
  conflicts: string[];
  tasksSynergy: string[];
  timeDistribution: TimeDistribution;
  suggestedTimeline: SuggestedTimelineItem[];
  motivationalQuote: string;
  isFallback?: boolean;
  fallbackReason?: string;
}

export interface TeacherAvailability {
  id: string;
  teacherEmail: string;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD'
  notes?: string;
  createdAt: string;
}

export interface StudentInfo {
  id: string;
  name: string;
  dni: string;
  email: string;
  isPresent: boolean; // simple attendance check for the class
}

export interface CourseIncident {
  id: string;
  timestamp: string;
  category: "seguridad" | "calidad" | "operativo" | "legal" | "infraestructura";
  severity: "bajo" | "medio" | "alto";
  description: string;
  resolved: boolean;
}

export interface CourseDocument {
  id: string;
  name: string;
  type: "acta" | "asistencia" | "encuesta" | "certificado" | "comunicacion_dgmm" | "otro";
  createdAt: string;
  createdBy: string;
  hash: string; // integrity code
  digitallySigned: boolean;
  signedBy?: string;
}

export interface CourseAuditLog {
  timestamp: string;
  userRole: string;
  userEmail: string;
  action: string;
}

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

export interface ExtendedCourseData {
  tipoCurso?: string; // STCW, PER, PNB, etc
  estado?: string; // BORRADOR, PLANIFICADO, CONFIRMADO, COMUNICADO A DGMM, EN EJECUCIÓN, etc.
  students?: StudentInfo[];
  incidents?: CourseIncident[];
  documents?: CourseDocument[];
  auditLogs?: CourseAuditLog[];
  courseNotes?: CourseNotesData;
}

