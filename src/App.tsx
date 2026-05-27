import { useState, useEffect, useMemo } from "react";
import { 
  initAuth, 
  googleSignIn, 
  logout 
} from "./auth";
import { CalendarEvent, GoogleTask, GoogleTaskList, ScheduleAnalysis, TeacherAvailability, StudentInfo, CourseIncident, CourseDocument, CourseAuditLog, CourseNotesData } from "./types";
import ScheduleSummary from "./components/ScheduleSummary";
import EventDetailModal, { AUDIT_TASKS, AuditTask } from "./components/EventDetailModal";
import AdminResourcesModal from "./components/AdminResourcesModal";
import { User } from "firebase/auth";
import { 
  Sparkles, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  LogOut, 
  Clock, 
  User as UserIcon,
  RefreshCw,
  MapPin,
  FileText,
  ChevronRight,
  ChevronLeft,
  Info,
  CalendarDays,
  Filter,
  Check,
  Link2,
  Video,
  Shield,
  Layers,
  AlertTriangle,
  BookOpen,
  Ship,
  Settings,
  Search,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]*>?/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

const DEFAULT_AULAS = [
  "Aula Teórica del Puerto",
  "Aula de Simulación Práctica",
  "Aula Náutica B",
  "Simulador de Radio GMDSS"
];

const DEFAULT_EMBARCACIONES = [
  "Velero Escuela 'Capitán Pronautic'",
  "Lancha Motora 'MiniPronautic'",
  "Yate de Prácticas 'Alborán'",
  "Semirrígida de Apoyo 'Pronautic Dos'"
];

export default function App() {
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const isRober = user?.email?.toLowerCase() === "instructorspronautic@gmail.com";
  const isRaquel = user?.email?.toLowerCase() === "bopronautic@gmail.com";
  const userName = isRober ? "Rober" : isRaquel ? "Raquel" : (user?.displayName || "Usuario");
  const userRoleLabel = isRober ? "Director de Operaciones" : isRaquel ? "Directora del Centro" : "Usuario Pronautic";
  const userAvatarUrl = isRober 
    ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=80&h=80&q=80"
    : isRaquel 
      ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=80&h=80&q=80"
      : user?.photoURL;
  
  // App data state
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [taskLists, setTaskLists] = useState<GoogleTaskList[]>([]);
  const [tasks, setTasks] = useState<GoogleTask[]>([]);
  
  // Status states
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  
  // AI analysis state
  const [analysis, setAnalysis] = useState<ScheduleAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  
  // Tabs for main view: 'ai' | 'calendar' | 'tasks'
  const [activeTab, setActiveTab] = useState<"ai" | "calendar" | "tasks">("ai");

  // Track the current local date
  const [todayFormatted, setTodayFormatted] = useState<string>("");

  // Target view range and active dates state
  const [viewRange, setViewRange] = useState<"day" | "week" | "month" | "quarter" | "semester" | "year">("day");
  const [focusDate, setFocusDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventTaskLinks, setEventTaskLinks] = useState<Record<string, string[]>>({});
  const [onlyShowRangeTasks, setOnlyShowRangeTasks] = useState<boolean>(false);
  const [showOnlyCourses, setShowOnlyCourses] = useState<boolean>(false);
  const [selectedAulaFilter, setSelectedAulaFilter] = useState<string>("");
  const [selectedEmbarcacionFilter, setSelectedEmbarcacionFilter] = useState<string>("");
  const [calendarSubTab, setCalendarSubTab] = useState<"list" | "matrix">("list");

  // Search and Mode state for the dashboard tasks tab
  const [tasksTabMode, setTasksTabMode] = useState<"courses" | "google">("courses");
  const [selectedCourseIdForTasks, setSelectedCourseIdForTasks] = useState<string>("");
  const [searchTaskQuery, setSearchTaskQuery] = useState<string>("");
  const [tasksRoleFilter, setTasksRoleFilter] = useState<"ALL" | "D" | "DF" | "INS" | "RSGI">("ALL");

  // Calendarios list state (Pronautic synchronize)
  const [calendars, setCalendars] = useState<Array<{ id: string; summary: string; primary?: boolean; backgroundColor?: string }>>([]);
  const [selectedCalIds, setSelectedCalIds] = useState<string[]>(["primary"]);

  // Role simulation & access rules (Problem 2)
  const [userRole, setUserRole] = useState<"admin" | "teacher">("admin");
  const [teacherEmailFilter, setTeacherEmailFilter] = useState<string>("");
  const [customTeacherEmail, setCustomTeacherEmail] = useState<string>("");

  // Teacher availability registry state
  const [availabilities, setAvailabilities] = useState<TeacherAvailability[]>([]);
  const [newAvailStart, setNewAvailStart] = useState<string>("");
  const [newAvailEnd, setNewAvailEnd] = useState<string>("");
  const [newAvailNotes, setNewAvailNotes] = useState<string>("Disponible todo el día");

  // Resource allocations registry state (Problem 3)
  const [eventResources, setEventResources] = useState<Record<string, { 
    aula: string; 
    materials: string[]; 
    embarcacion?: string; 
    numAlumnos?: number; 
    instructor?: string; 
    codigoCurso?: string; 
    completedAuditTasks?: string[];
    tipoCurso?: string;
    estado?: string;
    students?: StudentInfo[];
    incidents?: CourseIncident[];
    documents?: CourseDocument[];
    auditLogs?: CourseAuditLog[];
    courseNotes?: CourseNotesData;
  }>>({});

  // Overrides for Google Calendar event parameters (summary, description, location)
  const [eventOverrides, setEventOverrides] = useState<Record<string, Partial<CalendarEvent>>>({});

  // Auto synchronization frequency (polling)
  const [syncFrequency, setSyncFrequency] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Aulas & Embarcaciones state with persistence
  const [aulas, setAulas] = useState<string[]>(() => {
    const saved = localStorage.getItem("pronautic_aulas");
    return saved ? JSON.parse(saved) : DEFAULT_AULAS;
  });

  const [embarcaciones, setEmbarcaciones] = useState<string[]>(() => {
    const saved = localStorage.getItem("pronautic_embarcaciones");
    return saved ? JSON.parse(saved) : DEFAULT_EMBARCACIONES;
  });

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("pronautic_aulas", JSON.stringify(aulas));
  }, [aulas]);

  useEffect(() => {
    localStorage.setItem("pronautic_embarcaciones", JSON.stringify(embarcaciones));
  }, [embarcaciones]);

  // Load resources, relationships and overrides on mount
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem("event_task_relationships");
      if (savedTasks) {
        setEventTaskLinks(JSON.parse(savedTasks));
      }
      const savedResources = localStorage.getItem("event_allocated_resources");
      if (savedResources) {
        setEventResources(JSON.parse(savedResources));
      }
      const savedOverrides = localStorage.getItem("event_overrides");
      if (savedOverrides) {
        setEventOverrides(JSON.parse(savedOverrides));
      }
      const savedAvailabilities = localStorage.getItem("teacher_availabilities");
      if (savedAvailabilities) {
        setAvailabilities(JSON.parse(savedAvailabilities));
      }
    } catch (e) {
      console.error("No se pudieron cargar enlaces de tareas, recursos, disponibilidades o ediciones guardadas", e);
    }
  }, []);

  const handleAddAvailability = (availability: Omit<TeacherAvailability, "id" | "createdAt">) => {
    const newAvail: TeacherAvailability = {
      ...availability,
      id: "avail_" + Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString()
    };
    setAvailabilities(prev => {
      const updated = [...prev, newAvail];
      localStorage.setItem("teacher_availabilities", JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteAvailability = (id: string) => {
    setAvailabilities(prev => {
      const updated = prev.filter(a => a.id !== id);
      localStorage.setItem("teacher_availabilities", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveResources = (eventId: string, resources: { 
    aula: string; 
    materials: string[]; 
    embarcacion?: string; 
    numAlumnos?: number; 
    instructor?: string; 
    codigoCurso?: string; 
    completedAuditTasks?: string[];
    tipoCurso?: string;
    estado?: string;
    students?: StudentInfo[];
    incidents?: CourseIncident[];
    documents?: CourseDocument[];
    auditLogs?: CourseAuditLog[];
    courseNotes?: CourseNotesData;
  }) => {
    setEventResources(prev => {
      const updated = { ...prev, [eventId]: resources };
      localStorage.setItem("event_allocated_resources", JSON.stringify(updated));
      return updated;
    });
  };

  const handleToggleAuditTaskDashboard = (eventId: string, taskId: string) => {
    const currentAllocation = eventResources[eventId] || {
      aula: "",
      materials: [],
      completedAuditTasks: []
    };
    const currentCompleted = currentAllocation.completedAuditTasks || [];
    const updatedCompleted = currentCompleted.includes(taskId)
      ? currentCompleted.filter(id => id !== taskId)
      : [...currentCompleted, taskId];

    handleSaveResources(eventId, {
      ...currentAllocation,
      completedAuditTasks: updatedCompleted
    });
  };

  // Merge loaded events with local overrides dynamically
  const mergedEvents = useMemo(() => {
    return events.map(e => {
      const overrides = eventOverrides[e.id];
      if (overrides) {
        return { ...e, ...overrides };
      }
      return e;
    });
  }, [events, eventOverrides]);

  // Handle local parameter modification (title, location, description)
  const handleUpdateEvent = (eventId: string, updatedFields: Partial<CalendarEvent>) => {
    setEventOverrides(prev => {
      const existing = prev[eventId] || {};
      const updated = { ...prev, [eventId]: { ...existing, ...updatedFields } };
      localStorage.setItem("event_overrides", JSON.stringify(updated));
      return updated;
    });

    // Keep active selectedEvent state in sync as well
    setSelectedEvent(current => {
      if (!current || current.id !== eventId) return current;
      return { ...current, ...updatedFields };
    });
  };

  // Background polling sync timer
  useEffect(() => {
    if (syncFrequency > 0 && token) {
      const interval = setInterval(() => {
        loadWorkspaceData(token, focusDate, viewRange);
      }, syncFrequency);
      return () => clearInterval(interval);
    }
  }, [syncFrequency, token, focusDate, viewRange]);

  // Sync workspace data whenever credentials/filters update (including calendar lists!)
  useEffect(() => {
    if (token) {
      loadWorkspaceData(token, focusDate, viewRange);
    }
  }, [token, focusDate, viewRange, selectedCalIds]);

  useEffect(() => {
    // Handle authentication state detection on load
    initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setNeedsAuth(false);
      },
      () => {
        setNeedsAuth(true);
      }
    );
  }, []);

  // Compute boundaries and formatted labels for time views in Spanish
  const getRangeConfig = (date: Date, range: "day" | "week" | "month" | "quarter" | "semester" | "year") => {
    let timeMin: Date;
    let timeMax: Date;
    let label = "";

    const y = date.getFullYear();
    const m = date.getMonth();
    const d = date.getDate();

    switch (range) {
      case "day": {
        timeMin = new Date(y, m, d, 0, 0, 0, 0);
        timeMax = new Date(y, m, d, 23, 59, 59, 999);
        const options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
        label = date.toLocaleDateString("es-ES", options);
        break;
      }
      case "week": {
        const day = date.getDay();
        const diff = d - (day === 0 ? 6 : day - 1);
        timeMin = new Date(y, m, diff, 0, 0, 0, 0);
        timeMax = new Date(timeMin);
        timeMax.setDate(timeMin.getDate() + 6);
        timeMax.setHours(23, 59, 59, 999);

        const optionsMin: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
        const optionsMax: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
        label = `Semana del ${timeMin.toLocaleDateString("es-ES", optionsMin)} al ${timeMax.toLocaleDateString("es-ES", optionsMax)}`;
        break;
      }
      case "month": {
        timeMin = new Date(y, m, 1, 0, 0, 0, 0);
        timeMax = new Date(y, m + 1, 0, 23, 59, 59, 999);
        label = date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
        break;
      }
      case "quarter": {
        const quarter = Math.floor(m / 3) + 1;
        timeMin = new Date(y, (quarter - 1) * 3, 1, 0, 0, 0, 0);
        timeMax = new Date(y, quarter * 3, 0, 23, 59, 59, 999);
        const quarterNames = ["Enero - Marzo", "Abril - Junio", "Julio - Septiembre", "Octubre - Diciembre"];
        label = `${quarter}° Trimestre de ${y} (${quarterNames[quarter - 1]})`;
        break;
      }
      case "semester": {
        const semester = Math.floor(m / 6) + 1;
        timeMin = new Date(y, (semester - 1) * 6, 1, 0, 0, 0, 0);
        timeMax = new Date(y, semester * 6, 0, 23, 59, 59, 999);
        const semNames = ["Enero - Junio", "Julio - Diciembre"];
        label = `${semester}° Semestre de ${y} (${semNames[semester - 1]})`;
        break;
      }
      case "year": {
        timeMin = new Date(y, 0, 1, 0, 0, 0, 0);
        timeMax = new Date(y, 11, 31, 23, 59, 59, 999);
        label = `Año ${y}`;
        break;
      }
    }

    return { timeMin, timeMax, label };
  };

  // Step dates forwards or backwards depending on selected resolution level
  const navigateRange = (direction: "prev" | "next") => {
    const newDate = new Date(focusDate);
    const amount = direction === "next" ? 1 : -1;

    switch (viewRange) {
      case "day":
        newDate.setDate(focusDate.getDate() + amount);
        break;
      case "week":
        newDate.setDate(focusDate.getDate() + amount * 7);
        break;
      case "month":
        newDate.setMonth(focusDate.getMonth() + amount);
        break;
      case "quarter":
        newDate.setMonth(focusDate.getMonth() + amount * 3);
        break;
      case "semester":
        newDate.setMonth(focusDate.getMonth() + amount * 6);
        break;
      case "year":
        newDate.setFullYear(focusDate.getFullYear() + amount);
        break;
    }
    setFocusDate(newDate);
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setErrorText(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setErrorText("No se pudo iniciar sesión. Asegúrate de otorgar los permisos necesarios.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSimulateLogin = async (profile: "rober" | "raquel") => {
    setIsLoggingIn(true);
    setErrorText(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 350));
      const mockUser = {
        uid: profile === "rober" ? "mock-rober" : "mock-raquel",
        email: profile === "rober" ? "instructorspronautic@gmail.com" : "bopronautic@gmail.com",
        displayName: profile === "rober" ? "Rober" : "Raquel",
        photoURL: profile === "rober"
          ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      };
      setUser(mockUser as any);
      setToken("mock-token");
      setNeedsAuth(false);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      setNeedsAuth(true);
      setEvents([]);
      setTasks([]);
      setTaskLists([]);
      setAnalysis(null);
      setSelectedEvent(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const loadWorkspaceData = async (
    accessToken: string, 
    targetDate: Date = focusDate, 
    targetRange: "day" | "week" | "month" | "quarter" | "semester" | "year" = viewRange
  ) => {
    setIsLoadingData(true);
    setErrorText(null);
    
    if (accessToken === "mock-token") {
      try {
        await new Promise((resolve) => setTimeout(resolve, 350));
        const { label } = getRangeConfig(targetDate, targetRange);
        setTodayFormatted(label);

        const mockCalendars = [
          { id: "mock-primary", summary: "Calendario Principal (Pronautic)", primary: true, backgroundColor: "#4f46e5" },
          { id: "mock-sec", summary: "Exámenes Oficiales DGMM / Junta", primary: false, backgroundColor: "#06b6d4" }
        ];
        setCalendars(mockCalendars);
        // Condición ideal por defecto: Todos los calendarios activos y sincronizados
        setSelectedCalIds(mockCalendars.map(c => c.id));

        const baseDate = new Date(targetDate);
        
        const event1Start = new Date(baseDate);
        event1Start.setHours(9, 0, 0, 0);
        const event1End = new Date(baseDate);
        event1End.setHours(14, 0, 0, 0);

        const event2Start = new Date(baseDate);
        event2Start.setHours(16, 0, 0, 0);
        const event2End = new Date(baseDate);
        event2End.setHours(20, 0, 0, 0);

        const event3Start = new Date(baseDate);
        event3Start.setDate(event3Start.getDate() + 1);
        event3Start.setHours(10, 0, 0, 0);
        const event3End = new Date(baseDate);
        event3End.setDate(event3End.getDate() + 1);
        event3End.setHours(17, 30, 0, 0);

        const mockEventsList: CalendarEvent[] = [
          {
            id: "evt-01",
            summary: "Curso Patrón de Embarcaciones de Recreo (PER) - Prácticas de Navegación",
            description: "Prácticas de seguridad y navegación oficiales de la DGMM para PER. Navegación costera y maniobras de atraque.",
            location: "Velero Escuela 'Capitán Pronautic'",
            start: { dateTime: event1Start.toISOString() },
            end: { dateTime: event1End.toISOString() },
            calendarId: "mock-primary",
            calendarName: "Calendario Principal (Pronautic)"
          },
          {
            id: "evt-02",
            summary: "Curso de Formación Básica en Seguridad STCW (DGMM)",
            description: "Módulo certificado obligatorio para tripulación profesional. Prácticas en simulador de comunicaciones náuticas.",
            location: "Aula de Simulación Práctica",
            start: { dateTime: event2Start.toISOString() },
            end: { dateTime: event2End.toISOString() },
            calendarId: "mock-primary",
            calendarName: "Calendario Principal (Pronautic)"
          },
          {
            id: "evt-03",
            summary: "Examen Práctico Oficial de Radio GMDSS",
            description: "Examen final del módulo de comunicaciones de largo alcance para Patrón de Yate.",
            location: "Simulador de Radio GMDSS",
            start: { dateTime: event3Start.toISOString() },
            end: { dateTime: event3End.toISOString() },
            calendarId: "mock-sec",
            calendarName: "Exámenes Oficiales DGMM / Junta"
          }
        ];

        setEvents(mockEventsList);

        setSelectedEvent(current => {
          if (!current || !mockEventsList.some(e => e.id === current.id)) return null;
          return mockEventsList.find(e => e.id === current.id) || current;
        });

        const mockLists: GoogleTaskList[] = [
          { id: "lst-01", title: "Auditoría de Calidad Pronautic" },
          { id: "lst-02", title: "Mantenimiento General Flota" }
        ];
        setTaskLists(mockLists);

        const mockTasksList: GoogleTask[] = [
          { id: "t1", title: "Control de estanqueidad y escotillas velero", status: "needsAction", listId: "lst-01", listTitle: "Auditoría de Calidad Pronautic" },
          { id: "t2", title: "Verificar extintores y trajes de supervivencia", status: "completed", listId: "lst-01", listTitle: "Auditoría de Calidad Pronautic" },
          { id: "t3", title: "Archivar firmas oficiales de asistencia PER", status: "needsAction", listId: "lst-01", listTitle: "Auditoría de Calidad Pronautic" },
          { id: "t4", title: "Firmar actas oficiales y actas de examen", status: "needsAction", listId: "lst-01", listTitle: "Auditoría de Calidad Pronautic" },
          { id: "t5", title: "Limpiar y desinfectar puestos en simulador de radio", status: "needsAction", listId: "lst-01", listTitle: "Auditoría de Calidad Pronautic" },
          { id: "t6", title: "Revisar anclas y cabos de fondeo", status: "needsAction", listId: "lst-02", listTitle: "Mantenimiento General Flota" }
        ];
        setTasks(mockTasksList);

        setEventResources(prev => {
          if (Object.keys(prev).length === 0) {
            return {
              "evt-01": {
                aula: "Aula Teórica del Puerto",
                embarcacion: "Velero Escuela 'Capitán Pronautic'",
                materials: ["Libro de Navegación", "Regla paralela y transportador", "Chaleco auto-hinchable"],
                numAlumnos: 8,
                instructor: "instructorspronautic@gmail.com",
                codigoCurso: "PER-PRO-2026",
                completedAuditTasks: ["t2"]
              },
              "evt-02": {
                aula: "Aula de Simulación Práctica",
                embarcacion: "Semirrígida de Apoyo 'Pronautic Dos'",
                materials: ["Guía de Comunicaciones Radio", "Manual STCW Seguridad"],
                numAlumnos: 12,
                instructor: "bopronautic@gmail.com",
                codigoCurso: "STCW-FBQA-09",
                completedAuditTasks: ["t5"]
              }
            };
          }
          return prev;
        });

        triggerAIAnalysis(mockEventsList, mockTasksList);
        setLastSyncTime(new Date());

      } catch (err) {
        console.error("Mock data initialization error:", err);
      } finally {
        setIsLoadingData(false);
      }
      return;
    }

    try {
      // 1. Get range boundaries from configuration
      const { timeMin, timeMax, label } = getRangeConfig(targetDate, targetRange);
      setTodayFormatted(label);
      
      // Fetch calendar list first if we don't have it loaded yet to sync Administrativos Pronautic
      let currentCalendars = calendars;
      if (currentCalendars.length === 0) {
        try {
          const listRes = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (listRes.ok) {
            const listData = await listRes.json();
            const rawCals = listData.items || [];
            currentCalendars = rawCals.map((c: any) => ({
              id: c.id,
              summary: c.summary,
              primary: c.primary || false,
              backgroundColor: c.backgroundColor || "#4f46e5"
            }));
            setCalendars(currentCalendars);

            // Condición ideal: Seleccionar todos los calendarios por defecto
            setSelectedCalIds(currentCalendars.map((c: any) => c.id));
          } else {
            console.warn("Could not retrieve calendar list");
            currentCalendars = [{ id: "primary", summary: "Calendario Principal (Pronautic)", primary: true, backgroundColor: "#4f46e5" }];
            setCalendars(currentCalendars);
            setSelectedCalIds(["primary"]);
          }
        } catch (err) {
          console.error("Error fetching Google Calendar list:", err);
          currentCalendars = [{ id: "primary", summary: "Calendario Principal (Pronautic)", primary: true, backgroundColor: "#4f46e5" }];
          setCalendars(currentCalendars);
          setSelectedCalIds(["primary"]);
        }
      }

      // Query events for ALL selected calendars
      let fetchedEvents: CalendarEvent[] = [];
      const calIdsToQuery = selectedCalIds.length > 0 ? selectedCalIds : ["primary"];

      for (const calId of calIdsToQuery) {
        try {
          const calendarUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events?timeMin=${encodeURIComponent(timeMin.toISOString())}&timeMax=${encodeURIComponent(timeMax.toISOString())}&singleEvents=true&orderBy=startTime`;
          
          const calendarRes = await fetch(calendarUrl, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });

          if (calendarRes.ok) {
            const calData = await calendarRes.json();
            const items = (calData.items || []).map((e: any) => ({
              ...e,
              calendarId: calId,
              calendarName: currentCalendars.find(c => c.id === calId)?.summary || "Calendario"
            }));
            fetchedEvents.push(...items);
          } else {
            console.warn(`Could not retrieve events for calendar: ${calId}`);
          }
        } catch (e) {
          console.error(`Error loading events for calendar id ${calId}`, e);
        }
      }

      // Sort all fetched events chronologically!
      fetchedEvents.sort((a, b) => {
        const startA = new Date(a.start?.dateTime || a.start?.date || 0).getTime();
        const startB = new Date(b.start?.dateTime || b.start?.date || 0).getTime();
        return startA - startB;
      });

      setEvents(fetchedEvents);

      // Keep selectedEvent detail updated in case info changed
      setSelectedEvent(current => {
        if (!current) return null;
        return fetchedEvents.find(e => e.id === current.id) || current;
      });

      // 2. Load Google Task lists
      const taskListsRes = await fetch("https://tasks.googleapis.com/tasks/v1/users/@me/lists", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      let fetchedTasks: GoogleTask[] = [];
      if (taskListsRes.ok) {
        const listData = await taskListsRes.json();
        const lists: GoogleTaskList[] = listData.items || [];
        setTaskLists(lists);

        // Fetch up to 4 task lists
        for (const list of lists.slice(0, 4)) {
          const taskUrl = `https://tasks.googleapis.com/tasks/v1/lists/${list.id}/tasks?showCompleted=true&showHidden=false`;
          const singleListRes = await fetch(taskUrl, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (singleListRes.ok) {
            const singleListData = await singleListRes.json();
            const rawTasks: GoogleTask[] = singleListData.items || [];
            
            // Annotate tasks with both list Title and list ID (for task mutations)
            const annotated = rawTasks.map(t => ({
              ...t,
              listId: list.id,
              listTitle: list.title
            }));
            fetchedTasks.push(...annotated);
          }
        }
        setTasks(fetchedTasks);
      } else {
        console.warn("Could not retrieve google task lists:", taskListsRes.statusText);
      }

      // 3. Immediately trigger AI Analysis of the loaded data for the selected range!
      const finalEventsToAnalyze = fetchedEvents.map(e => {
        const overrides = eventOverrides[e.id];
        return overrides ? { ...e, ...overrides } : e;
      });
      triggerAIAnalysis(finalEventsToAnalyze, fetchedTasks);
      setLastSyncTime(new Date());

    } catch (err: any) {
      console.error("Workspace fetch error:", err);
      setErrorText("No se pudo conectar a los servicios de Workspace. Vuelve a intentarlo.");
    } finally {
      setIsLoadingData(false);
    }
  };

  const triggerAIAnalysis = async (currentEvents: CalendarEvent[], currentTasks: GoogleTask[]) => {
    setIsLoadingAnalysis(true);
    try {
      const response = await fetch("/api/analyze-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          events: currentEvents,
          tasks: currentTasks,
          userLocalTime: new Date().toISOString()
        })
      });

      const body = await response.json();
      if (body.success && body.analysis) {
        setAnalysis(body.analysis);
        setActiveTab("ai");
      } else {
        throw new Error(body.error || "La respuesta del backend fue inválida.");
      }
    } catch (err: any) {
      console.error("IA compilation error:", err);
      // Fallback simple static analysis representation if Gemini fails
      setAnalysis({
        summary: "Hoy tienes un conjunto de actividades y tareas interesantes. Prepárate con calma para equilibrar tu tiempo de la mejor manera.",
        focus: "Enfoque general del día",
        conflicts: [],
        tasksSynergy: ["Intenta agrupar tus tareas secundarias entre los bloques del calendario."],
        timeDistribution: { meetings: 30, taskWork: 50, breaks: 20 },
        suggestedTimeline: [
          { timeSlot: "Mañana", activity: "Planificación del día y revisión silenciosa" },
          { timeSlot: "Tarde", activity: "Ejecución de tareas importantes" },
          { timeSlot: "Fin de jornada", activity: "Desconexión y balance" }
        ],
        motivationalQuote: "Un día a la vez, con método y calma se llega lejos."
      });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleExportToSheets = async () => {
    if (!analysis) return;
    if (!token) {
      alert("Por favor, inicia sesión con Google para sincronizar con Google Sheets.");
      return;
    }

    setIsExporting(true);
    setExportSuccess(false);

    const spreadsheetId = "1a70sVFs6-mGtVaHM059676HSFGs_2fNRRifBgbtU3cA";

    try {
      // 1. Fetch metadata to get title for gid 0
      const metadataRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(sheetId,title))`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!metadataRes.ok) {
        throw new Error(`Error recuperando estructura del documento (${metadataRes.status})`);
      }

      const metadata = await metadataRes.json();
      const targetSheet = (metadata.sheets || []).find(
        (sheet: any) => sheet.properties?.sheetId === 0
      );

      const targetTitle = targetSheet?.properties?.title || "Sheet1";

      // 2. Prepare visual analysis metadata
      const rows = [
        ["FECHA DEL ANÁLISIS", new Date().toLocaleString("es-ES")],
        ["RANGO PLANIFICADO", viewRange.toUpperCase()],
        ["ENFOQUE PRINCIPAL DE IA", analysis.focus],
        ["RESUMEN DE JORNADA", analysis.summary],
        ["CONSEJO MOTIVACIONAL", analysis.motivationalQuote],
        ["CONFLICTOS DETECTADOS", analysis.conflicts && analysis.conflicts.length > 0 ? analysis.conflicts.join("\n") : "Ninguno"],
        ["SINERGIAS PROPUESTAS", analysis.tasksSynergy && analysis.tasksSynergy.length > 0 ? analysis.tasksSynergy.join("\n") : "Ninguna"],
        [],
        ["--- CRONOGRAMA INTEGRADO SUGERIDO POR IA ---"],
        ["Hora / Jornada", "Actividades del Curso o Tareas"],
        ...(analysis.suggestedTimeline || []).map((item) => [item.timeSlot, item.activity]),
        [],
        ["-------------------------------------------------"],
        []
      ];

      // 3. Append to correct sheet
      const appendRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(targetTitle)}'!A1:append?valueInputOption=USER_ENTERED`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            values: rows
          })
        }
      );

      if (!appendRes.ok) {
        const errorData = await appendRes.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Error insertando filas (${appendRes.status})`);
      }

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4500);
    } catch (err: any) {
      console.error("Error sincronizando con Google Sheets:", err);
      alert(`Error de sincronización con Google Sheets: ${err.message || err}`);
    } finally {
      setIsExporting(false);
    }
  };

  // --- Relational links state management ---
  const handleLinkTask = (taskId: string) => {
    if (!selectedEvent) return;
    const eventId = selectedEvent.id;
    setEventTaskLinks(prev => {
      const current = prev[eventId] || [];
      if (current.includes(taskId)) return prev;
      const updated = { ...prev, [eventId]: [...current, taskId] };
      localStorage.setItem("event_task_relationships", JSON.stringify(updated));
      return updated;
    });
  };

  const handleUnlinkTask = (taskId: string) => {
    if (!selectedEvent) return;
    const eventId = selectedEvent.id;
    setEventTaskLinks(prev => {
      const current = prev[eventId] || [];
      const filtered = current.filter(id => id !== taskId);
      const updated = { ...prev, [eventId]: filtered };
      localStorage.setItem("event_task_relationships", JSON.stringify(updated));
      return updated;
    });
  };

  const handleUnlinkTaskCard = (eventId: string, taskId: string) => {
    setEventTaskLinks(prev => {
      const current = prev[eventId] || [];
      const filtered = current.filter(id => id !== taskId);
      const updated = { ...prev, [eventId]: filtered };
      localStorage.setItem("event_task_relationships", JSON.stringify(updated));
      return updated;
    });
  };

  const handleToggleTaskStatus = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const listId = (task as any).listId || "@default";
    const nextStatus = task.status === "completed" ? "needsAction" : "completed";

    // Optimistically update locally
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      status: nextStatus as any,
      completed: nextStatus === "completed" ? new Date().toISOString() : undefined
    } : t));

    if (token) {
      try {
        const patchUrl = `https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks/${taskId}`;
        await fetch(patchUrl, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            id: taskId,
            status: nextStatus
          })
        });
      } catch (error) {
        console.error("No se pudo sincronizar el estado de la tarea en Google Tasks", error);
      }
    }
  };

  // Scanning existing attendees and creators/organizers to define instructor list dynamically
  const teacherEmails = useMemo(() => {
    const emails = new Set<string>();
    mergedEvents.forEach(e => {
      if (e.creator?.email) emails.add(e.creator.email);
      if (e.organizer?.email) emails.add(e.organizer.email);
      e.attendees?.forEach(a => {
        if (a.email) emails.add(a.email);
      });
    });
    // Return all email addresses gathered, ensuring logged in user has priority position
    const result = Array.from(emails).filter(email => email && email.includes("@"));
    if (user?.email && !result.includes(user.email)) {
      result.unshift(user.email);
    }
    return result;
  }, [mergedEvents, user]);

  const activeTeacherEmail = teacherEmailFilter === "custom" ? customTeacherEmail : teacherEmailFilter;

  // Render events filtered based on Active Role (Problem 2: external teachers view only added activities)
  const displayEvents = useMemo(() => {
    let filtered = mergedEvents;
    if (userRole === "teacher") {
      filtered = mergedEvents.filter(e => {
        if (!activeTeacherEmail) return false;
        const tLower = activeTeacherEmail.toLowerCase();
        const isCreator = e.creator?.email?.toLowerCase() === tLower;
        const isOrganizer = e.organizer?.email?.toLowerCase() === tLower;
        const isAttendee = e.attendees?.some(a => a.email?.toLowerCase() === tLower);
        const inTitle = (e.summary || "").toLowerCase().includes(tLower);
        const inDesc = (e.description || "").toLowerCase().includes(tLower);
        return isCreator || isOrganizer || isAttendee || inTitle || inDesc;
      });
    }

    if (showOnlyCourses) {
      filtered = filtered.filter(e => {
        const title = (e.summary || "").toLowerCase();
        const desc = (e.description || "").toLowerCase();
        const isCourse = 
          title.includes("curso") || 
          title.includes("clase") || 
          title.includes("práctica") || 
          title.includes("formación") || 
          title.includes("licencia") || 
          title.includes("p.e.r") || 
          title.includes("p.e.y") || 
          title.includes("patrón") || 
          title.includes("vela") || 
          title.includes("motor") || 
          desc.includes("curso") || 
          desc.includes("clase") || 
          desc.includes("práctica") || 
          desc.includes("formación");
        return isCourse;
      });
    }

    if (selectedAulaFilter) {
      filtered = filtered.filter(e => eventResources[e.id]?.aula === selectedAulaFilter);
    }

    if (selectedEmbarcacionFilter) {
      filtered = filtered.filter(e => eventResources[e.id]?.embarcacion === selectedEmbarcacionFilter);
    }

    return filtered;
  }, [mergedEvents, userRole, activeTeacherEmail, showOnlyCourses, selectedAulaFilter, selectedEmbarcacionFilter, eventResources]);

  // Render tasks filtered based on Active Role + active filters (Problem 2: external teachers only view tasks linked to their events!)
  const displayTasks = useMemo(() => {
    const { timeMin: rangeMin, timeMax: rangeMax } = getRangeConfig(focusDate, viewRange);
    return tasks.filter(task => {
      // 1. Check date range filter if enabled
      if (onlyShowRangeTasks) {
        if (!task.due) return false;
        try {
          const dueTime = new Date(task.due).getTime();
          if (dueTime < rangeMin.getTime() || dueTime > rangeMax.getTime()) return false;
        } catch {
          return false;
        }
      }

      // 2. Check Role Filter (External Teacher mode only shows tasks linked to visible displayEvents)
      if (userRole === "teacher") {
        const isLinkedToVisibleEvent = displayEvents.some(event => {
          const linkedIds = eventTaskLinks[event.id] || [];
          return linkedIds.includes(task.id);
        });
        return isLinkedToVisibleEvent;
      }

      return true;
    });
  }, [tasks, onlyShowRangeTasks, userRole, displayEvents, eventTaskLinks, focusDate, viewRange]);

  const displayCourses = useMemo(() => {
    return mergedEvents.filter(e => {
      const title = (e.summary || "").toLowerCase();
      const desc = (e.description || "").toLowerCase();
      const isCourse = 
        title.includes("curso") || 
        title.includes("clase") || 
        title.includes("práctica") || 
        title.includes("formación") || 
        title.includes("licencia") || 
        title.includes("p.e.r") || 
        title.includes("p.e.y") || 
        title.includes("patrón") || 
        title.includes("vela") || 
        title.includes("motor") || 
        title.includes("gmdss") ||
        title.includes("stcw") ||
        desc.includes("curso") || 
        desc.includes("clase") || 
        desc.includes("práctica") || 
        desc.includes("formación");
      return isCourse;
    });
  }, [mergedEvents]);

  // Helper to read start and end times in ms
  const getEventTimes = (e: CalendarEvent) => {
    const startStr = e.start?.dateTime || e.start?.date;
    const endStr = e.end?.dateTime || e.end?.date;
    if (!startStr) return null;
    const startTime = new Date(startStr).getTime();
    let endTime = endStr ? new Date(endStr).getTime() : startTime + 60 * 60 * 1000;
    if (endTime <= startTime) {
      endTime = startTime + 60 * 60 * 1000;
    }
    return { startTime, endTime };
  };

  // Find all active resource conflicts in the current displayed events across Aulas, Embarcaciones and Materials
  const globalConflicts = useMemo(() => {
    const conflictsList: Array<{ eventA: CalendarEvent; eventB: CalendarEvent; reason: string }> = [];
    const seenPairs = new Set<string>();

    for (let i = 0; i < mergedEvents.length; i++) {
      for (let j = i + 1; j < mergedEvents.length; j++) {
        const eA = mergedEvents[i];
        const eB = mergedEvents[j];

        const timesA = getEventTimes(eA);
        const timesB = getEventTimes(eB);
        if (!timesA || !timesB) continue;

        // Overlap in time?
        const isOverlapping = (timesA.startTime < timesB.endTime && timesA.endTime > timesB.startTime);
        if (!isOverlapping) continue;

        const allocA = eventResources[eA.id];
        const allocB = eventResources[eB.id];
        if (!allocA || !allocB) continue;

        // Classroom overlap
        if (allocA.aula && allocA.aula === allocB.aula) {
          const pairKey = [eA.id, eB.id].sort().join("-");
          if (!seenPairs.has(pairKey)) {
            seenPairs.add(pairKey);
            conflictsList.push({
              eventA: eA,
              eventB: eB,
              reason: `Ambas actividades coinciden en el aula/espacio '${allocA.aula}' al mismo tiempo.`
            });
          }
        }

        // Embarcacion overlap
        if (allocA.embarcacion && allocA.embarcacion === allocB.embarcacion) {
          const pairKey = [eA.id, eB.id].sort().join("-");
          if (!seenPairs.has(pairKey)) {
            seenPairs.add(pairKey);
            conflictsList.push({
              eventA: eA,
              eventB: eB,
              reason: `Ambas actividades coinciden en la embarcación '${allocA.embarcacion}' al mismo tiempo.`
            });
          }
        }

        // Materials overlap
        if (allocA.materials && allocB.materials) {
          const shared = allocA.materials.filter(m => allocB.materials.includes(m));
          if (shared.length > 0) {
            const pairKey = [eA.id, eB.id].sort().join("-");
            if (!seenPairs.has(pairKey)) {
              seenPairs.add(pairKey);
              conflictsList.push({
                eventA: eA,
                eventB: eB,
                reason: `Equipos en uso simultáneo: '${shared.join(", ")}' se asignó a ambos compromisos.`
              });
            }
          }
        }
      }
    }
    return conflictsList;
  }, [mergedEvents, eventResources]);

  // Human clean formatter for time
  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const getEventInstructor = (event: CalendarEvent) => {
    if (event.description) {
      const match = event.description.match(/(?:Instructor|Profesor|Docente|Ponente|Profe|Instructora|Profesora|Docentes):\s*([^\n\r<]+)/i);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    if (event.summary) {
      const match = event.summary.match(/(?:Instructor|Profesor|Docente|Ponente):\s*([^\n\r()]+)/i);
      if (match && match[1]) {
        return match[1].trim();
      }
      const matchNoColon = event.summary.match(/(?:Instructor|Profesor|Docente|Ponente|Profe|Instructor:)\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)/i);
      if (matchNoColon && matchNoColon[1]) {
        return matchNoColon[1].trim();
      }
    }
    return null;
  };

  const getEventTeacherEmail = (event: CalendarEvent) => {
    const emails = new Set<string>();
    if (event.creator?.email) emails.add(event.creator.email);
    if (event.organizer?.email) emails.add(event.organizer.email);
    event.attendees?.forEach(a => {
      if (a.email) emails.add(a.email);
    });

    const emailArr = Array.from(emails).filter(email => email && email.includes("@"));
    
    for (const email of emailArr) {
      if (teacherEmails.includes(email)) {
        return email;
      }
    }

    if (emailArr.length > 0) return emailArr[0];

    if (userRole === "teacher" && activeTeacherEmail) {
      return activeTeacherEmail;
    }

    return null;
  };

  const checkTeacherAvailability = (event: CalendarEvent) => {
    const teacherEmail = getEventTeacherEmail(event);
    if (!teacherEmail) return { status: "no_teacher", label: "Sin Instructor Vinculado" };

    const teacherAvails = availabilities.filter(
      (a) => a.teacherEmail.trim().toLowerCase() === teacherEmail.trim().toLowerCase()
    );

    if (teacherAvails.length === 0) {
      return { status: "no_records", label: `Falta registrar disponibilidad (${teacherEmail})` };
    }

    const startStr = event.start?.dateTime || event.start?.date;
    if (!startStr) return { status: "no_date", label: "Sin fecha definida" };

    try {
      // Extract the YYYY-MM-DD portion of the event start date
      const eventDateStr = startStr.substring(0, 10);

      const isCovered = teacherAvails.some((avail) => {
        return eventDateStr >= avail.startDate && eventDateStr <= avail.endDate;
      });

      if (isCovered) {
        return { status: "available", label: "✓ Disponible para formación" };
      } else {
        return { status: "unavailable", label: "⚠ No se declaró disponible hoy" };
      }
    } catch {
      return { status: "error", label: "Error de validación" };
    }
  };

  const formatEventDates = (event: CalendarEvent) => {
    if (!event.start) return "Sin fecha";
    const startStr = event.start.dateTime || event.start.date;
    const endStr = event.end?.dateTime || event.end?.date;
    if (!startStr) return "Sin fecha";
    
    try {
      const startDate = new Date(startStr);
      const endDate = endStr ? new Date(endStr) : startDate;
      const isAllDay = !event.start.dateTime;
      
      const startFormattedDate = startDate.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
      const endFormattedDate = endDate.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
      
      if (isAllDay) {
        if (startFormattedDate === endFormattedDate) {
          return startFormattedDate;
        }
        return `${startFormattedDate} – ${endFormattedDate}`;
      }
      
      const startFormattedTime = startDate.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
      const endFormattedTime = endDate.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
      
      return `${startFormattedDate} (${startFormattedTime}) – ${endFormattedDate} (${endFormattedTime})`;
    } catch {
      return "Fecha inválida";
    }
  };

  // Compute progress statistics for high density sidebar tracker
  const completedTasksCount = tasks.filter(t => t.status === "completed").length;
  const totalTasksCount = tasks.length;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-205 h-16 flex items-center justify-between px-6 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xs font-black">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-950 tracking-tight leading-none font-sans">
              Mi Calendario
            </h1>
            <span className="text-[10px] text-slate-500 font-semibold font-mono tracking-wider uppercase mt-1 block">
              Workspace + Gemini IA
            </span>
          </div>
        </div>

        {/* Team Applet Link - Copy to Clipboard */}
        <div className="hidden lg:flex items-center gap-2 bg-indigo-50/70 border border-indigo-150 rounded-xl px-3 py-1.5 text-xs text-indigo-900 shadow-4xs">
          <Link2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="font-bold tracking-tight text-slate-700">Enlace del Equipo:</span>
          <span className="font-semibold text-slate-500 max-w-[180px] lg:max-w-[220px] truncate select-all text-[11px] font-mono leading-none">
            fea1146b-d405-46f4-8e37-13442745c4ca
          </span>
          <button 
            type="button"
            onClick={() => {
              navigator.clipboard.writeText("https://aistudio.google.com/apps/fea1146b-d405-46f4-8e37-13442745c4ca?fullscreenApplet=true&showPreview=true&showAssistant=true");
              alert("¡Enlace del equipo copiado al portapapeles con éxito!");
            }}
            className="ml-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-extrabold tracking-wide uppercase transition-all shadow-4xs cursor-pointer active:scale-95 inline-flex items-center gap-1 shrink-0"
          >
            Copiar Link
          </button>
        </div>

        {/* User profile & Actions */}
        {!needsAuth && user && (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-black text-slate-850 leading-none flex items-center gap-1 justify-end">
                {isRober || isRaquel ? (
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                    isRober ? "bg-indigo-100 text-indigo-700 border border-indigo-200" : "bg-purple-100 text-purple-700 border border-purple-200"
                  }`}>
                    {isRober ? "Rober" : "Raquel"}
                  </span>
                ) : null}
                {userName}
              </span>
              <span className="text-[9px] text-slate-400 font-bold font-mono mt-1">{user.email}</span>
            </div>
            
            {userAvatarUrl ? (
              <img 
                referrerPolicy="no-referrer"
                src={userAvatarUrl} 
                alt={userName} 
                className={`w-10 h-10 rounded-full border-2 ${
                  isRober ? "border-indigo-400" : isRaquel ? "border-purple-400" : "border-slate-200"
                } shadow-sm`}
              />
            ) : (
              <div className={`h-10 w-10 ${
                isRober ? "bg-indigo-600" : isRaquel ? "bg-purple-600" : "bg-slate-700"
              } text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm`}>
                {userName.slice(0, 2).toUpperCase()}
              </div>
            )}

            <button 
              id="btn-logout"
              title="Cerrar sesión"
              onClick={handleLogout}
              className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer border border-transparent"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline font-bold">Cerrar Sesión</span>
            </button>
          </div>
        )}
      </header>

      {needsAuth ? (
        /* Welcome & Interactive Sign In Screen */
        <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-md p-8 text-center space-y-6">
            <div className="inline-flex p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Sparkles className="w-10 h-10 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-sans">
                ¿Qué tienes para hoy?
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Conecta tu cuenta de Google para analizar tus eventos de calendario y tus tareas de hoy usando la inteligencia artificial de Gemini.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl flex items-start gap-3 text-left border border-slate-150">
              <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-550 space-y-1">
                <p className="font-semibold text-slate-700">Privacidad y Acceso:</p>
                <p>La aplicación únicamente leerá tu agenda de hoy para organizar un cronograma estructurado con IA de manera privada hoy.</p>
              </div>
            </div>

            <div className="pt-2 flex flex-col items-center">
              <button 
                id="btn-google-login"
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="gsi-material-button w-full flex justify-center py-2.5 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 cursor-pointer font-semibold shadow-xs hover:shadow-md transition-all active:scale-98 disabled:opacity-50"
              >
                <div className="gsi-material-button-content-wrapper flex items-center gap-2">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 block">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents text-sm">Sign in with Google</span>
                </div>
              </button>

              {isLoggingIn && (
                <p className="text-xs text-gray-400 mt-3 animate-pulse font-mono">
                  Iniciando sesión segura...
                </p>
              )}
              
              {errorText && (
                <p className="text-xs text-red-500 mt-4 bg-red-50 p-2.5 rounded-lg border border-red-150">
                  {errorText}
                </p>
              )}

              <div className="relative flex py-3 items-center w-full">
                <div className="flex-grow border-t border-slate-205"></div>
                <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest">Acceso Rápido Pronautic</span>
                <div className="flex-grow border-t border-slate-205"></div>
              </div>

              <div className="grid grid-cols-2 gap-3.5 w-full">
                <button
                  type="button"
                  onClick={() => handleSimulateLogin("rober")}
                  className="p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl transition-all text-left flex flex-col justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <img 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=80&h=80&q=80" 
                      alt="Rober" 
                      className="w-7 h-7 rounded-full border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-800 leading-tight group-hover:text-indigo-700 truncate">Rober</h4>
                      <p className="text-[9px] text-slate-400 leading-none truncate font-mono mt-0.5">instructorspronautic</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-indigo-650 mt-2 block uppercase tracking-tight text-right w-full">
                    Director Op. →
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateLogin("raquel")}
                  className="p-3 bg-slate-50 hover:bg-purple-50/50 border border-slate-200 hover:border-purple-300 rounded-xl transition-all text-left flex flex-col justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <img 
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=80&h=80&q=80" 
                      alt="Raquel" 
                      className="w-7 h-7 rounded-full border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-800 leading-tight group-hover:text-purple-700 truncate">Raquel</h4>
                      <p className="text-[9px] text-slate-400 leading-none truncate font-mono mt-0.5">bopronautic</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-purple-650 mt-2 block uppercase tracking-tight text-right w-full">
                    Directora →
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Active Section & User Ribbon indicator */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 border-b border-slate-800 text-slate-100 px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs shrink-0 select-none">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-semibold text-[10.5px]">Inspector de Sesión:</span>
                <div className="flex items-center gap-1.5 bg-slate-800/80 rounded-full pl-1.5 pr-2.5 py-0.5 border border-slate-700/60 shadow-3xs">
                  {userAvatarUrl ? (
                    <img 
                      src={userAvatarUrl} 
                      alt={userName} 
                      className="w-4.5 h-4.5 rounded-full border border-white/40 shrink-0"
                    />
                  ) : null}
                  <strong className="text-white font-extrabold text-[10.5px] font-sans">
                    {userName} <span className="font-semibold text-[9px] text-indigo-300 ml-1">({userRoleLabel} - {user?.email})</span>
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono tracking-wider uppercase font-extrabold text-slate-400">
                  Módulo Activo:
                </span>
                <strong className={`font-black tracking-tight text-[11px] uppercase ${
                  activeTab === "ai" ? "text-sky-400" : activeTab === "calendar" ? "text-indigo-300" : "text-emerald-400"
                }`}>
                  {activeTab === "ai" ? "✨ Resumen de IA y Planificación" : activeTab === "calendar" ? "📅 Calendario Semanal / Diario" : "📋 Auditoría de Calidad STCW/DGMM y Tareas"}
                </strong>
              </div>

              {activeTab === "calendar" && (
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800/50 px-2.5 py-0.5 rounded-full border border-slate-700/50">
                  Período: <span className="font-extrabold capitalize text-slate-200">{viewRange}</span>
                </span>
              )}
            </div>
          </div>

          {/* Main Authenticated Workspace Dashboard with "High Density" Side panel */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Aside block - High density metadata */}
          <aside className="w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-5 flex flex-col gap-6 shrink-0 shadow-xs overflow-y-auto">
            
            {/* Progression Metric */}
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Progreso General
              </h3>
              <div className="w-full bg-slate-150 h-2 rounded-full mb-2 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] font-semibold text-slate-600 leading-tight">
                {completedTasksCount} de {totalTasksCount} tareas completadas ({progressPercent}%)
              </p>
            </div>

            {/* Sincronización de Calendarios - Pronautic */}
            <div className="pt-2 border-t border-slate-100">
              <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
                Sincronización (Calendarios)
              </h3>
              
              {calendars.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic">No hay más calendarios o cargando...</p>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      id="btn-select-all-calendars"
                      onClick={() => {
                        setSelectedCalIds(calendars.map(c => c.id));
                      }}
                      className="text-[9.5px] font-black uppercase text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200/60 px-2 py-1 rounded-md transition-all cursor-pointer shadow-4xs text-center flex-1"
                    >
                      ✓ Seleccionar Todos
                    </button>
                    <button
                      type="button"
                      id="btn-select-primary-calendar"
                      onClick={() => {
                        const primary = calendars.find(c => c.primary) || calendars[0];
                        if (primary) {
                          setSelectedCalIds([primary.id]);
                        }
                      }}
                      className="text-[9.5px] font-black uppercase text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 px-2 py-1 rounded-md transition-all cursor-pointer shadow-4xs text-center flex-1"
                    >
                      Solo Principal
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 pt-0.5">
                    {calendars.map((cal) => {
                    const isSelected = selectedCalIds.includes(cal.id);
                    return (
                      <label 
                        key={cal.id} 
                        className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-800 cursor-pointer select-none truncate"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedCalIds(prev => {
                              if (isSelected) {
                                if (prev.length <= 1) return prev; // Keep at least one selected
                                return prev.filter(id => id !== cal.id);
                              } else {
                                return [...prev, cal.id];
                              }
                            });
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span 
                          className="w-2 h-2 rounded-full shrink-0" 
                          style={{ backgroundColor: cal.backgroundColor || "#4f46e5" }}
                        />
                        <span className="truncate font-semibold text-slate-700" title={cal.summary}>
                          {cal.primary ? "Principal (Pronautic)" : cal.summary}
                        </span>
                      </label>
                    );
                  })}
                  </div>

                  {/* Pronautic Ideal Conditions Indicator Badge of Coverage */}
                  <div className={`p-2.5 rounded-xl border text-[10.5px] leading-snug transition-all ${
                    calendars.length > 0 && selectedCalIds.length === calendars.length
                      ? "bg-emerald-50/70 text-emerald-800 border-emerald-200/65"
                      : "bg-amber-50/70 text-amber-800 border-amber-200/65"
                  }`}>
                    <div className="flex items-center justify-between gap-1.5 font-bold">
                      <span className="flex items-center gap-1 font-extrabold uppercase text-[9.5px]">
                        {calendars.length > 0 && selectedCalIds.length === calendars.length ? "🌟 Condición Ideal" : "⚠️ Condición Parcial"}
                      </span>
                      {selectedCalIds.length < calendars.length && (
                        <button
                          type="button"
                          onClick={() => setSelectedCalIds(calendars.map(c => c.id))}
                          className="text-[9px] font-black uppercase text-amber-700 cursor-pointer underline hover:text-amber-900 bg-transparent border-0"
                        >
                          Hacer Ideal
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-tight select-none font-medium">
                      {calendars.length > 0 && selectedCalIds.length === calendars.length
                        ? "Todos los calendarios están seleccionados. Óptima auditoría de solapamientos."
                        : `${selectedCalIds.length} de ${calendars.length} calendarios activos. Puede haber colisiones no dectectadas.`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Control de Acceso (Perfiles Simulados) */}
            <div className="pt-2 border-t border-slate-100">
              <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-500" />
                Control de Acceso (Rol)
              </h3>

              <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setUserRole("admin")}
                  className={`py-1 text-[11px] font-extrabold rounded-md transition-all cursor-pointer ${
                    userRole === "admin"
                      ? "bg-white text-indigo-600 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserRole("teacher");
                    // Preselect first teacher if we scanned any
                    if (teacherEmails.length > 0 && !teacherEmailFilter) {
                      setTeacherEmailFilter(teacherEmails[0]);
                    } else if (teacherEmails.length === 0 && !teacherEmailFilter) {
                      setTeacherEmailFilter("custom");
                    }
                  }}
                  className={`py-1 text-[11px] font-extrabold rounded-md transition-all cursor-pointer ${
                    userRole === "teacher"
                      ? "bg-white text-indigo-600 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Profesor
                </button>
              </div>

              {userRole === "teacher" && (
                <div className="mt-2.5 space-y-3 p-2.5 bg-indigo-50/45 rounded-lg border border-indigo-100/50">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-tight">
                      Seleccionar Profesor
                    </label>
                    <select
                      value={teacherEmailFilter}
                      onChange={(e) => setTeacherEmailFilter(e.target.value)}
                      className="w-full bg-white border border-slate-205 rounded p-1 text-[11px] font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                    >
                      {teacherEmails.map((email) => (
                        <option key={email} value={email}>
                          {email}
                        </option>
                      ))}
                      <option value="custom">-- Escribir otro email --</option>
                    </select>
                  </div>

                  {teacherEmailFilter === "custom" && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-tight">
                        Email del Profesor
                      </label>
                      <input
                        type="email"
                        placeholder="profesor@ejemplo.com"
                        value={customTeacherEmail}
                        onChange={(e) => setCustomTeacherEmail(e.target.value)}
                        className="w-full bg-white border border-slate-205 rounded p-1.5 text-[11px] font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  )}
                  <p className="text-[9.5px] text-indigo-705 leading-tight font-extrabold flex items-center gap-1">
                    <Check className="w-3 h-3 text-indigo-600 shrink-0" />
                    Vista segregada del docente activa.
                  </p>

                  {/* Registro de Disponibilidad Interactivo */}
                  <div className="pt-2.5 border-t border-indigo-100/60 space-y-2">
                    <p className="text-[9.5px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      Declarar Disponibilidad
                    </p>
                    
                    <div className="space-y-2 bg-white/70 p-2 rounded border border-indigo-100 shadow-4xs text-[10.5px]">
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="space-y-0.5">
                          <label className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">Desde</label>
                          <input 
                            type="date" 
                            value={newAvailStart}
                            onChange={(e) => setNewAvailStart(e.target.value)}
                            className="w-full bg-white border border-slate-205 rounded px-1.5 py-0.5 text-[11px] font-semibold cursor-pointer"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">Hasta</label>
                          <input 
                            type="date" 
                            value={newAvailEnd}
                            onChange={(e) => setNewAvailEnd(e.target.value)}
                            className="w-full bg-white border border-slate-205 rounded px-1.5 py-0.5 text-[11px] font-semibold cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[8px] font-bold text-slate-400 uppercase tracking-tight block">Detalles/Notas</label>
                        <input 
                          type="text" 
                          placeholder="Ej. Disponible tardes, todo el día..." 
                          value={newAvailNotes}
                          onChange={(e) => setNewAvailNotes(e.target.value)}
                          className="w-full bg-white border border-slate-205 rounded px-2 py-0.5 text-[11px] font-semibold text-slate-705 placeholder:text-slate-300"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!newAvailStart || !newAvailEnd) {
                            alert("Por favor selecciona ambas fechas de inicio y fin para registrar tu disponibilidad.");
                            return;
                          }
                          const activeEmail = teacherEmailFilter === "custom" ? customTeacherEmail : teacherEmailFilter;
                          if (!activeEmail) {
                            alert("Por favor selecciona o especifica un correo electrónico de profesor.");
                            return;
                          }
                          handleAddAvailability({
                            teacherEmail: activeEmail,
                            startDate: newAvailStart,
                            endDate: newAvailEnd,
                            notes: newAvailNotes
                          });
                          setNewAvailStart("");
                          setNewAvailEnd("");
                          setNewAvailNotes("Disponible todo el día");
                        }}
                        className="w-full mt-1.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-extrabold text-[10.5px] cursor-pointer transition-all active:scale-95 text-center shadow-4xs shrink-0"
                      >
                        Añadir Período
                      </button>
                    </div>
                  </div>

                  {/* Listado de Disponibilidades Declaradas por este profesor */}
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-mono font-bold text-slate-450 uppercase tracking-wider block">Períodos Declarados por Ti</p>
                    {(() => {
                      const activeEmail = (teacherEmailFilter === "custom" ? customTeacherEmail : teacherEmailFilter).toLowerCase();
                      const teacherAvails = availabilities.filter(a => a.teacherEmail.toLowerCase() === activeEmail);
                      if (teacherAvails.length === 0) {
                        return (
                          <div className="p-2.5 text-center border border-dashed border-slate-200 bg-white/40 rounded-lg text-[10px] text-slate-400 italic font-semibold">
                            Sin períodos de disponibilidad declarados aún.
                          </div>
                        );
                      }
                      return (
                        <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                          {teacherAvails.map((avail) => (
                            <div key={avail.id} className="p-1.5 bg-emerald-50 border border-emerald-200/50 rounded-md flex items-center justify-between text-[10px] text-emerald-900 font-semibold shadow-4xs">
                              <div className="min-w-0">
                                <p className="font-bold shrink-0 truncate">
                                  {new Date(avail.startDate).toLocaleDateString("es-ES", {day:'numeric', month:'short'})} al {new Date(avail.endDate).toLocaleDateString("es-ES", {day:'numeric', month:'short'})}
                                </p>
                                {avail.notes && <p className="text-[9px] text-emerald-700 italic truncate max-w-[120px]">"{avail.notes}"</p>}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteAvailability(avail.id)}
                                className="text-emerald-500 hover:text-red-500 leading-none text-xs px-1 cursor-pointer font-bold"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Consolidated Availability Console (Admin view) */}
            {userRole === "admin" && (
              <div className="pt-2.5 border-t border-slate-100 space-y-2">
                <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
                  Disponibilidades Docentes ({availabilities.length})
                </h3>
                {availabilities.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic bg-slate-55 border border-slate-150 p-2.5 rounded-lg text-center font-bold">
                    No hay disponibilidades registradas por los profesores.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {availabilities.map((avail) => (
                      <div key={avail.id} className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10.5px] leading-tight space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-slate-700 truncate max-w-[130px] font-mono" title={avail.teacherEmail}>
                            {avail.teacherEmail}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteAvailability(avail.id)}
                            className="text-slate-400 hover:text-red-500 leading-none font-bold text-xs p-0.5 cursor-pointer"
                            title="Eliminar disponibilidad registrada"
                          >
                            ×
                          </button>
                        </div>
                        <p className="font-semibold text-indigo-900">
                          Del {new Date(avail.startDate).toLocaleDateString("es-ES", {day:'numeric', month:'short'})} al {new Date(avail.endDate).toLocaleDateString("es-ES", {day:'numeric', month:'short'})}
                        </p>
                        {avail.notes && (
                          <p className="text-[9.5px] text-slate-505 italic mt-0.5">"{avail.notes}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Gestión de Recursos - Pronautic Admin View */}
            {userRole === "admin" && (
              <div className="pt-2.5 border-t border-slate-100 space-y-2">
                <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-indigo-505 shrink-0 animate-spin-slow" />
                  Gabinete de Espacios y Flotas
                </h3>
                <button
                  type="button"
                  id="btn-admin-config"
                  onClick={() => setIsAdminModalOpen(true)}
                  className="w-full py-2 px-3 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-white rounded-lg text-[10.5px] font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Ship className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  Configurar Aulas / Flotas
                </button>
              </div>
            )}

            {/* Alertas de Conflicto Globales (Admin) */}
            {userRole === "admin" && globalConflicts.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-1.5 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  Conflictos ({globalConflicts.length})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {globalConflicts.map((conf, idx) => (
                    <div key={idx} className="p-2 bg-red-50 rounded border border-red-100 text-[10px] font-semibold text-red-700 leading-tight">
                      <p className="font-extrabold line-clamp-1">{conf.eventA.summary} vs {conf.eventB.summary}</p>
                      <p className="text-[9.5px] font-medium text-slate-600 mt-0.5">{conf.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Priorities */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Próximas Prioridades
              </h3>
              <div className="space-y-3">
                {/* Due / Pending task */}
                {tasks.filter(t => t.status === "needsAction").slice(0, 1).map((task) => (
                  <div key={task.id} className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r shadow-2xs">
                    <p className="text-[10px] font-bold text-red-700 uppercase tracking-tight">Crítico</p>
                    <p className="text-xs font-bold text-slate-800 leading-tight mt-0.5 truncate">{task.title}</p>
                    {task.due && (
                      <p className="text-[9px] text-red-500 font-mono mt-1">
                        Vence: {new Date(task.due).toLocaleDateString("es-ES")}
                      </p>
                    )}
                  </div>
                ))}

                {/* Calendar Priority */}
                {displayEvents.slice(0, 1).map((event) => (
                  <div key={event.id} className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r shadow-2xs">
                    <p className="text-[10px] font-bold text-blue-700 uppercase tracking-tight">Trabajo</p>
                    <p className="text-xs font-bold text-slate-800 leading-tight mt-0.5 truncate">{event.summary}</p>
                    <p className="text-[9px] text-blue-500 font-mono mt-1">
                      {event.start?.dateTime ? formatTime(event.start.dateTime) : "Todo el día"}
                    </p>
                  </div>
                ))}

                {/* Second calendar or secondary event */}
                {displayEvents.length > 1 && displayEvents.slice(1, 2).map((event) => (
                  <div key={event.id} className="p-3 bg-purple-50 border-l-4 border-purple-500 rounded-r shadow-2xs">
                    <p className="text-[10px] font-bold text-purple-700 uppercase tracking-tight">Siguiente</p>
                    <p className="text-xs font-bold text-slate-800 leading-tight mt-0.5 truncate">{event.summary}</p>
                    <p className="text-[9px] text-purple-500 font-mono mt-1">
                      {event.start?.dateTime ? formatTime(event.start.dateTime) : "Todo el día"}
                    </p>
                  </div>
                ))}

                {/* Default when empty */}
                {displayTasks.filter(t => t.status === "needsAction").length === 0 && displayEvents.length === 0 && (
                  <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded-r shadow-2xs text-center py-4">
                    <p className="text-xs font-bold text-green-700">¡Día Organizado!</p>
                    <p className="text-[10px] text-green-600 mt-1">Sin compromisos inmediatos hoy.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Motivational / AI Tip slot */}
            <div className="mt-auto pt-4 border-t border-slate-100">
              <div className="bg-slate-900 rounded-xl p-4 text-white shadow-sm">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Recomendación Heurística
                </p>
                <p className="text-xs italic leading-relaxed opacity-90">
                  "{analysis?.motivationalQuote || 'El tiempo es lo único que no vuelve. Úsalo con intención.'}"
                </p>
              </div>
            </div>
          </aside>

          {/* Central Workspace view pane */}
          <section className="flex-1 bg-white overflow-y-auto flex flex-col p-6 space-y-6 scroll-container">
            
            {/* Header info row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <span className="capitalize">{todayFormatted}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-indigo-600 font-mono tracking-wide font-bold">
                    {tasks.filter(t => t.status === "needsAction").length} tareas pendientes
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none mt-1">
                  Planificador por Períodos
                </h2>
              </div>
              {userRole === "admin" && (
                <button
                  type="button"
                  id="btn-admin-config-header"
                  onClick={() => setIsAdminModalOpen(true)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer border-0"
                >
                  <Settings className="w-4 h-4 shrink-0 text-indigo-200" />
                  <span>⚙ Configurar Aulas y Embarcaciones</span>
                </button>
              )}
            </div>

            {/* Resolution Selector & Time Travel Toolbar */}
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200/40">
              <div className="flex flex-wrap items-center justify-between gap-3">
                
                {/* Granularity Selectors */}
                <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-lg gap-1 border border-slate-200/50 shadow-3xs">
                  {(["day", "week", "month", "quarter", "semester", "year"] as const).map((range) => {
                    const labelMap = {
                      day: "Día",
                      week: "Semana",
                      month: "Mes",
                      quarter: "Trimestre",
                      semester: "Semestre",
                      year: "Año"
                    };
                    return (
                      <button
                        key={range}
                        onClick={() => setViewRange(range)}
                        className={`text-xs px-3 py-1 font-semibold rounded cursor-pointer transition-all ${
                          viewRange === range 
                            ? "bg-white text-indigo-600 shadow-2xs border border-slate-200/40" 
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {labelMap[range]}
                      </button>
                    );
                  })}
                </div>

                {/* Sincronización Tray */}
                <div className="flex flex-wrap items-center gap-3">
                  {lastSyncTime && (
                    <span className="text-[10px] text-slate-400 font-mono tracking-tight font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      Último sync: {lastSyncTime.toLocaleTimeString("es-ES")}
                    </span>
                  )}
                  
                  <div className="flex items-center gap-1.5 bg-slate-100/50 px-2 py-1 rounded-lg border border-slate-200/40">
                    <span className="text-[10px] text-slate-450 font-extrabold uppercase shrink-0">Frecuencia:</span>
                    <select
                      value={syncFrequency}
                      onChange={(e) => setSyncFrequency(Number(e.target.value))}
                      className="bg-white border border-slate-200 rounded-md p-1 py-0.5 text-xs focus:ring-1 focus:ring-indigo-550 focus:outline-none transition-all cursor-pointer font-semibold text-slate-700"
                    >
                      <option value="0">Manual</option>
                      <option value="15000">Cada 15s</option>
                      <option value="30000">Cada 30s</option>
                      <option value="60000">Cada 1m</option>
                      <option value="300000">Cada 5m</option>
                    </select>
                  </div>

                  {/* Sincronizar Button */}
                  <button
                    id="btn-refresh"
                    onClick={() => token && loadWorkspaceData(token)}
                    disabled={isLoadingData || isLoadingAnalysis}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-650 hover:text-indigo-650 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/20 bg-white rounded-lg shadow-2xs transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${(isLoadingData || isLoadingAnalysis) ? "animate-spin" : ""}`} />
                    <span>Sincronizar {viewRange === "day" ? "hoy" : "período"}</span>
                  </button>
                </div>
              </div>

              {/* Time Traveler navigation bar */}
              <div className="flex items-center justify-between bg-white border border-slate-200/70 p-2.5 rounded-lg shadow-3xs">
                <button
                  onClick={() => navigateRange("prev")}
                  disabled={isLoadingData}
                  className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-900 border border-slate-200/50 cursor-pointer disabled:opacity-40"
                  title="Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="text-center">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Período Visualizado
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-800 capitalize">
                    {todayFormatted}
                  </span>
                </div>

                <button
                  onClick={() => navigateRange("next")}
                  disabled={isLoadingData}
                  className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-900 border border-slate-200/50 cursor-pointer disabled:opacity-40"
                  title="Siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Nav switcher pills */}
            <div className="flex bg-slate-100 rounded-lg p-1 w-fit shrink-0">
              <button
                onClick={() => setActiveTab("ai")}
                className={`py-1.5 px-4 text-xs font-semibold rounded flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "ai"
                    ? "bg-white text-slate-905 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Resumen de IA
              </button>
              <button
                onClick={() => setActiveTab("calendar")}
                className={`py-1.5 px-4 text-xs font-semibold rounded flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "calendar"
                    ? "bg-white text-slate-905 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                Mis Eventos ({displayEvents.length})
              </button>
              <button
                onClick={() => setActiveTab("tasks")}
                className={`py-1.5 px-4 text-xs font-semibold rounded flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "tasks"
                    ? "bg-white text-slate-905 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Procedimiento y Tareas
              </button>
            </div>

            {/* Tab view screen wrappers */}
            <div className="flex-grow min-h-[300px]">
              {activeTab === "ai" && (
                <div>
                  {analysis ? (
                    <ScheduleSummary 
                      analysis={analysis} 
                      isLoading={isLoadingAnalysis} 
                      onExportToSheets={handleExportToSheets}
                      isExporting={isExporting}
                      exportSuccess={exportSuccess}
                    />
                  ) : (
                    <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center py-16 space-y-4">
                      <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">¿Listo para compilar hoy?</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                          Gemini organizará automáticamente un horario integrado para tu calendario y listas de tareas, detectando conflictos de forma segura.
                        </p>
                      </div>
                      <button
                        onClick={() => triggerAIAnalysis(mergedEvents, tasks)}
                        className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                      >
                        Analizar jornada con IA
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "calendar" && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200/50 p-3 rounded-lg flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>Haz clic en cualquier evento para inspeccionar todos los parámetros, aulas, materiales y vincular tareas.</span>
                    <span className="text-[10px] bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded font-bold uppercase">Herramienta Relacional</span>
                  </div>

                  {/* Mode Selector and Filter Controls */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3.5 shadow-3xs">
                    {/* View Modes */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setCalendarSubTab("list")}
                          className={`px-3.5 py-1.5 text-xs font-extrabold uppercase rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                            calendarSubTab === "list" 
                              ? "bg-white text-indigo-700 shadow-3xs" 
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          <CalendarIcon className="w-3.5 h-3.5" />
                          Lista de Compromisos
                        </button>
                        <button
                          type="button"
                          onClick={() => setCalendarSubTab("matrix")}
                          className={`px-3.5 py-1.5 text-xs font-extrabold uppercase rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                            calendarSubTab === "matrix" 
                              ? "bg-white text-indigo-700 shadow-3xs" 
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          <Ship className="w-3.5 h-3.5 text-sky-500" />
                          Matriz de Ocupación (Aulas y Flotas)
                        </button>
                      </div>

                      <div className="text-[11px] font-bold text-slate-505 bg-slate-50 border border-slate-205 px-2.5 py-1 rounded-lg">
                        Rango Activo: <span className="font-extrabold text-indigo-700 uppercase">{viewRange === "day" ? "Día" : `Período (${viewRange})`}</span>
                      </div>
                    </div>

                    {/* Integrated Pronautic Quick Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Course Filter Toggle */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block font-bold">Tipo de Actividad</label>
                        <select
                          value={showOnlyCourses ? "courses" : "all"}
                          onChange={(e) => setShowOnlyCourses(e.target.value === "courses")}
                          className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                        >
                          <option value="all">Todos los compromisos</option>
                          <option value="courses">Solo Cursos / Prácticas</option>
                        </select>
                      </div>

                      {/* Classroom Filter */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block font-bold">Filtrar por Aula / Espacio</label>
                        <select
                          value={selectedAulaFilter}
                          onChange={(e) => setSelectedAulaFilter(e.target.value)}
                          className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                        >
                          <option value="">-- Todas las Aulas --</option>
                          {aulas.map((aula, i) => (
                            <option key={i} value={aula}>{aula}</option>
                          ))}
                        </select>
                      </div>

                      {/* Fleet Filter */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block font-bold">Filtrar por Embarcación</label>
                        <select
                          value={selectedEmbarcacionFilter}
                          onChange={(e) => setSelectedEmbarcacionFilter(e.target.value)}
                          className="w-full text-xs font-bold text-slate-700 bg-slate-55 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                        >
                          <option value="">-- Todas las Embarcaciones --</option>
                          {embarcaciones.map((emb, i) => (
                            <option key={i} value={emb}>{emb}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {(selectedAulaFilter || selectedEmbarcacionFilter || showOnlyCourses) && (
                      <div className="flex items-center justify-between bg-indigo-50/50 border border-indigo-100 p-2 rounded-lg text-xs font-semibold text-indigo-805">
                        <span>Filtros activos reducen vista a {displayEvents.length} eventos.</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAulaFilter("");
                            setSelectedEmbarcacionFilter("");
                            setShowOnlyCourses(false);
                          }}
                          className="text-[10px] font-bold uppercase tracking-tight text-indigo-700 underline bg-transparent border-0 cursor-pointer"
                        >
                          Restablecer Filtros
                        </button>
                      </div>
                    )}
                  </div>

                  {calendarSubTab === "matrix" ? (
                    <div className="space-y-6">
                      {/* Matrix Section: Aulas/Classrooms */}
                      <div className="space-y-3">
                        <h4 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-105">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                          Ocupación de Espacios y Aulas ({aulas.length})
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {aulas.map((aula) => {
                            // Find events allocated to this classroom
                            const aulaEvents = mergedEvents.filter(e => eventResources[e.id]?.aula === aula);
                            
                            // Check for overlaps (time conflicts) inside these events
                            const overlapsList: string[] = [];
                            for (let i = 0; i < aulaEvents.length; i++) {
                              for (let j = i + 1; j < aulaEvents.length; j++) {
                                const tA = getEventTimes(aulaEvents[i]);
                                const tB = getEventTimes(aulaEvents[j]);
                                if (tA && tB && (tA.startTime < tB.endTime && tA.endTime > tB.startTime)) {
                                  overlapsList.push(`'${aulaEvents[i].summary}' y '${aulaEvents[j].summary}'`);
                                }
                              }
                            }

                            return (
                              <div key={aula} className={`bg-white p-4 rounded-xl border transition-all ${
                                overlapsList.length > 0 
                                  ? "border-rose-300 ring-1 ring-rose-200" 
                                  : aulaEvents.length > 0
                                    ? "border-slate-205 hover:border-indigo-250"
                                    : "border-slate-200 bg-slate-50/40"
                              }`}>
                                <div className="flex items-start justify-between gap-1.5">
                                  <div>
                                    <h5 className="text-xs font-black text-slate-800 flex items-center gap-1.5 font-sans">
                                      <span className="p-1 bg-slate-100 rounded text-slate-650">🏫</span>
                                      {aula}
                                    </h5>
                                    <p className="text-[9.5px] text-slate-400 font-mono mt-0.5 font-bold uppercase tracking-wider">
                                      {aulaEvents.length} {aulaEvents.length === 1 ? "actividad asignada" : "actividades asignadas"}
                                    </p>
                                  </div>
                                  
                                  {aulaEvents.length === 0 ? (
                                    <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full">
                                      ✓ LIBRE
                                    </span>
                                  ) : overlapsList.length > 0 ? (
                                    <span className="bg-red-50 border border-red-200 text-red-800 text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse">
                                      ⚠️ SOLAPAMIENTO
                                    </span>
                                  ) : (
                                    <span className="bg-indigo-50 border border-indigo-200 text-indigo-800 text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full">
                                      OCUPADA
                                    </span>
                                  )}
                                </div>

                                {overlapsList.length > 0 && (
                                  <div className="mt-2.5 p-2 bg-red-50 text-[10px] text-rose-750 font-bold rounded-lg border border-red-100 leading-tight font-sans">
                                    Simultaneidad no permitida: {overlapsList.join(", ")} coincide.
                                  </div>
                                )}

                                {aulaEvents.length > 0 ? (
                                  <div className="mt-3 space-y-2">
                                    {aulaEvents.map(event => (
                                      <div 
                                        key={event.id}
                                        onClick={() => setSelectedEvent(event)}
                                        className="p-2 border border-slate-150 hover:border-indigo-400 rounded-lg text-left bg-slate-50 hover:bg-white text-[10.5px] leading-tight transition-all cursor-pointer group/item hover:shadow-4xs"
                                      >
                                        <div className="flex items-center justify-between text-[9px] text-indigo-700 font-bold mb-0.5 font-mono">
                                          <span>{formatEventDates(event)}</span>
                                          <span className="group-hover/item:text-indigo-900 transition-colors uppercase font-mono font-black text-[8px] tracking-wide">Inspeccionar →</span>
                                        </div>
                                        <p className="font-extrabold text-slate-800 group-hover/item:text-indigo-900 line-clamp-1">{event.summary}</p>
                                        {getEventInstructor(event) && (
                                          <p className="text-[9px] text-slate-500 font-semibold mt-0.5">Instructor: <span className="text-slate-700 font-bold">{getEventInstructor(event)}</span></p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-[10px] text-slate-400 italic font-semibold mt-3 leading-tight select-none">
                                    Disponible para programar clases o exámenes DGMM en el período seleccionado.
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Matrix Section: Embarcaciones/Fleet */}
                      <div className="space-y-3 pt-4">
                        <h4 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-105">
                          <Ship className="w-3.5 h-3.5 text-indigo-505" />
                          Ocupación de Embarcaciones y Flota Náutica ({embarcaciones.length})
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {embarcaciones.map((emb) => {
                            // Find events allocated to this boat
                            const embEvents = mergedEvents.filter(e => eventResources[e.id]?.embarcacion === emb);
                            
                            // Check for overlaps (time conflicts) inside these events
                            const overlapsList: string[] = [];
                            for (let i = 0; i < embEvents.length; i++) {
                              for (let j = i + 1; j < embEvents.length; j++) {
                                const tA = getEventTimes(embEvents[i]);
                                const tB = getEventTimes(embEvents[j]);
                                if (tA && tB && (tA.startTime < tB.endTime && tA.endTime > tB.startTime)) {
                                  overlapsList.push(`'${embEvents[i].summary}' y '${embEvents[j].summary}'`);
                                }
                              }
                            }

                            return (
                              <div key={emb} className={`bg-white p-4 rounded-xl border transition-all ${
                                overlapsList.length > 0 
                                  ? "border-rose-300 ring-1 ring-rose-200" 
                                  : embEvents.length > 0
                                    ? "border-slate-205 hover:border-indigo-250"
                                    : "border-slate-200 bg-slate-50/40"
                              }`}>
                                <div className="flex items-start justify-between gap-1.5">
                                  <div>
                                    <h5 className="text-xs font-black text-slate-800 flex items-center gap-1.5 font-sans">
                                      <span className="p-1 bg-slate-100 rounded text-slate-650">⛵</span>
                                      {emb}
                                    </h5>
                                    <p className="text-[9.5px] text-slate-400 font-mono mt-0.5 font-bold uppercase tracking-wider">
                                      {embEvents.length} {embEvents.length === 1 ? "actividad programada" : "actividades programadas"}
                                    </p>
                                  </div>
                                  
                                  {embEvents.length === 0 ? (
                                    <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full">
                                      ✓ DISPONIBLE
                                    </span>
                                  ) : overlapsList.length > 0 ? (
                                    <span className="bg-red-50 border border-red-200 text-red-800 text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse">
                                      ⚠️ SOLAPAMIENTO
                                    </span>
                                  ) : (
                                    <span className="bg-indigo-50 border border-indigo-200 text-indigo-800 text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full">
                                      NAVEGANDO
                                    </span>
                                  )}
                                </div>

                                {overlapsList.length > 0 && (
                                  <div className="mt-2.5 p-2 bg-red-50 text-[10px] text-rose-750 font-bold rounded-lg border border-red-100 leading-tight font-sans">
                                    Simultaneidad no permitida: {overlapsList.join(", ")} coincide.
                                  </div>
                                )}

                                {embEvents.length > 0 ? (
                                  <div className="mt-3 space-y-2">
                                    {embEvents.map(event => (
                                      <div 
                                        key={event.id}
                                        onClick={() => setSelectedEvent(event)}
                                        className="p-2 border border-slate-150 hover:border-indigo-400 rounded-lg text-left bg-slate-50 hover:bg-white text-[10.5px] leading-tight transition-all cursor-pointer group/item hover:shadow-4xs"
                                      >
                                        <div className="flex items-center justify-between text-[9px] text-indigo-700 font-bold mb-0.5 font-mono">
                                          <span>{formatEventDates(event)}</span>
                                          <span className="group-hover/item:text-indigo-900 transition-colors uppercase font-mono font-black text-[8px] tracking-wide">Inspeccionar →</span>
                                        </div>
                                        <p className="font-extrabold text-slate-800 group-hover/item:text-indigo-900 line-clamp-1">{event.summary}</p>
                                        {getEventInstructor(event) && (
                                          <p className="text-[9px] text-slate-500 font-semibold mt-0.5">Instructor: <span className="text-slate-700 font-bold">{getEventInstructor(event)}</span></p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-[10px] text-slate-400 italic font-semibold mt-3 leading-tight select-none">
                                    Sin prácticas asignadas para esta embarcación. Lista para despacho.
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {displayEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {displayEvents.map((event) => {
                        // High density semantic coloring depending on events content
                        const titleLower = (event.summary || "").toLowerCase();
                        const descLower = (event.description || "").toLowerCase();
                        const fullText = `${titleLower} ${descLower}`;
                        
                        let cardColorClass = "bg-indigo-50/50 border-l-4 border-indigo-500 text-indigo-950 hover:bg-indigo-50 border border-indigo-100/40";
                        let tagLabel = "Evento";
                        
                        if (fullText.includes("sync") || fullText.includes("reunión") || fullText.includes("call") || fullText.includes("llamada") || fullText.includes("meeting")) {
                          cardColorClass = "bg-blue-50/55 border-l-4 border-blue-600 text-blue-950 hover:bg-blue-50 border border-blue-100/40";
                          tagLabel = "REUNIÓN / COMPROMISO";
                        } else if (fullText.includes("prep") || fullText.includes("diseño") || fullText.includes("build") || fullText.includes("dev") || fullText.includes("creación")) {
                          cardColorClass = "bg-purple-50/55 border-l-4 border-purple-600 text-purple-950 hover:bg-purple-50 border border-purple-100/40";
                          tagLabel = "TRABAJO DE ENFOQUE (DEEP WORK)";
                        } else if (fullText.includes("comida") || fullText.includes("break") || fullText.includes("almuerzo") || fullText.includes("café") || fullText.includes("gimnasio") || fullText.includes("libre")) {
                          cardColorClass = "bg-green-50/55 border-l-4 border-green-600 text-green-950 hover:bg-green-50 border border-green-100/40";
                          tagLabel = "RECREACIÓN / RESTAURACIÓN";
                        }

                        // Determine relationships
                        const linkedTaskIds = eventTaskLinks[event.id] || [];

                        return (
                          <div 
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className={`p-4 rounded-xl flex flex-col justify-between transition-all ${cardColorClass} shadow-2xs hover:shadow-xs active:scale-[0.99] cursor-pointer group`}
                          >
                            <div className="space-y-1.5 pointer-events-none">
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-[9px] font-mono font-bold tracking-wider uppercase opacity-85 block">
                                  {tagLabel}
                                </span>
                                <span className="text-[9px] text-slate-400 group-hover:text-indigo-650 font-bold transition-colors">
                                  Inspeccionar parámetros →
                                </span>
                              </div>
                              <h4 className="text-xs font-extrabold leading-snug group-hover:text-indigo-900 transition-colors">
                                {event.summary || "Evento sin título"}
                              </h4>
                              {getEventInstructor(event) && (
                                <div className="text-[10px] text-indigo-800 bg-indigo-50/90 border border-indigo-150 px-2 py-0.5 rounded w-fit font-bold font-sans">
                                  Instructor: {getEventInstructor(event)}
                                </div>
                              )}
                              {event.description && (
                                <p className="text-[11px] opacity-80 leading-relaxed font-sans line-clamp-2">
                                  {stripHtml(event.description)}
                                </p>
                              )}

                              {/* Estado de Disponibilidad del Profesor */}
                              {(() => {
                                const availStatus = checkTeacherAvailability(event);
                                if (availStatus.status === "no_teacher") return null;
                                
                                return (
                                  <div className="text-[10px] font-sans font-bold px-2 py-0.5 rounded border border-slate-150 w-fit mt-1.5 flex items-center gap-1.5 leading-normal shadow-4xs bg-white/80">
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                      availStatus.status === "available" ? "bg-emerald-500" :
                                      availStatus.status === "unavailable" ? "bg-red-500" : "bg-amber-500"
                                    }`} />
                                    <span className="text-[9.5px] text-slate-705 leading-none">{availStatus.label}</span>
                                  </div>
                                );
                              })()}

                              {/* Classroom & Equipamientos assigned - High Density indicators */}
                              {(() => {
                                const alloc = eventResources[event.id];
                                const hasAlloc = alloc && (
                                  alloc.aula || 
                                  (alloc.materials && alloc.materials.length > 0) || 
                                  alloc.numAlumnos !== undefined || 
                                  alloc.instructor
                                );
                                const isConflicted = globalConflicts.some(c => c.eventA.id === event.id || c.eventB.id === event.id);
                                if (!hasAlloc && !isConflicted) return null;
                                return (
                                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                                    {alloc?.aula && (
                                      <span className="bg-indigo-100/80 border border-indigo-200/55 text-indigo-950 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5">
                                        <Layers className="w-2.5 h-2.5 text-indigo-600" />
                                        {alloc.aula}
                                      </span>
                                    )}
                                    {alloc?.numAlumnos !== undefined && (
                                      <span className="bg-sky-50 border border-sky-200 text-sky-950 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5">
                                        👥 {alloc.numAlumnos} alumnos
                                      </span>
                                    )}
                                    {alloc?.instructor && (
                                      <span className="bg-purple-50 border border-purple-200 text-purple-950 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5">
                                        ⚓ {alloc.instructor}
                                      </span>
                                    )}
                                    {alloc?.completedAuditTasks !== undefined && alloc.completedAuditTasks.length > 0 && (
                                      <span className="bg-slate-900 border border-slate-800 text-sky-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">
                                        ✓ Proc: {Math.round((alloc.completedAuditTasks.length / 38) * 100)}%
                                      </span>
                                    )}
                                    {alloc?.materials && alloc.materials.length > 0 && (
                                      <span className="bg-emerald-150/80 border border-emerald-200/55 text-emerald-950 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                        🎒 {alloc.materials.length} material{alloc.materials.length === 1 ? "" : "es"}
                                      </span>
                                    )}
                                    {isConflicted && (
                                      <span className="bg-red-100 border border-red-200 text-red-800 px-1.5 py-0.5 rounded text-[9.5px] font-black inline-flex items-center gap-1 animate-pulse">
                                        <AlertTriangle className="w-2.5 h-2.5 text-red-500" />
                                        Conflicto
                                      </span>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>

                            {/* Related Checklist directly on the card */}
                            {linkedTaskIds.length === 0 ? (
                              <div 
                                className="mt-2.5 p-2 bg-amber-50/70 border border-amber-100/60 rounded-lg flex items-center justify-between gap-2 text-[10px] text-amber-800 font-bold group-hover:bg-amber-100/40 transition-colors cursor-default" 
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  Requiere relacionar tarea Task
                                </span>
                                <button 
                                  type="button"
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setSelectedEvent(event); 
                                  }}
                                  className="text-[9.5px] bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-0.5 rounded font-black shadow-4xs transition-all cursor-pointer select-none shrink-0"
                                >
                                  Vincular
                                </button>
                              </div>
                            ) : (
                              <div 
                                className="mt-2.5 p-2 bg-slate-50/80 border border-slate-150/40 rounded-lg space-y-1.5 cursor-default text-left" 
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight block">
                                  Tareas de Google Relacionadas ({linkedTaskIds.length})
                                </span>
                                <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                                  {linkedTaskIds.map((taskId) => {
                                    const task = tasks.find(t => t.id === taskId);
                                    if (!task) return null;
                                    return (
                                      <div 
                                        key={taskId} 
                                        className="flex items-center justify-between gap-2 text-[11px] font-sans font-semibold text-slate-700 bg-white/70 hover:bg-white px-2 py-1 rounded border border-slate-150/35 shadow-4xs"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <label className="flex items-center gap-1.5 min-w-0 cursor-pointer flex-grow select-none">
                                          <input 
                                            type="checkbox"
                                            checked={task.status === "completed"}
                                            onChange={(e) => {
                                              e.stopPropagation();
                                              handleToggleTaskStatus(task.id);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="h-3 w-3 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                          />
                                          <span className={`truncate leading-none ${task.status === "completed" ? "line-through text-slate-400 font-normal" : "text-slate-700"}`}>
                                            {task.title || "Tarea sin título"}
                                          </span>
                                        </label>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleUnlinkTaskCard(event.id, task.id);
                                          }}
                                          title="Desvincular tarea"
                                          className="text-slate-400 hover:text-red-500 hover:bg-slate-100 p-0.5 rounded cursor-pointer shrink-0 transition-all font-bold text-[11px] leading-none"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            <div className="pt-2.5 mt-3 border-t border-black/5 flex flex-wrap gap-2 items-center justify-between text-[11px] font-mono font-semibold">
                              <span className="flex items-center gap-1 opacity-85">
                                <Clock className="w-3 h-3 shrink-0" />
                                {formatEventDates(event)}
                              </span>

                              {linkedTaskIds.length > 0 ? (
                                <span className="flex items-center gap-1 bg-indigo-150 text-indigo-800 px-2 py-0.5 rounded text-[10px] font-bold border border-indigo-200/40">
                                  <Link2 className="w-3 h-3 text-indigo-600 shrink-0" />
                                  Conectado
                                </span>
                              ) : (
                                event.location && (
                                  <span className="flex items-center gap-1 max-w-[170px] truncate text-slate-600">
                                    <MapPin className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{event.location}</span>
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200/60 p-12 rounded-xl text-center py-16">
                      <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-bold">
                        No hay eventos programados para los filtros seleccionados en este período.
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed max-w-md mx-auto">
                        Verifica el rango seleccionado ({viewRange === "day" ? "Día" : "Período"}), los calendarios activos en la izquierda o si estás en Modo Profesor con correos específicos.
                      </p>
                    </div>
                  )}
                    </>
                  )}
                </div>
              )}

              {activeTab === "tasks" && (
                <div className="space-y-5">
                  {/* Selector of sub-tabs */}
                  <div className="flex bg-slate-100/85 p-1 rounded-xl w-fit">
                    <button
                      type="button"
                      onClick={() => {
                        setTasksTabMode("courses");
                        setSearchTaskQuery("");
                      }}
                      className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border-0 ${
                        tasksTabMode === "courses"
                          ? "bg-white text-indigo-700 shadow-3xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 text-indigo-505" />
                      📋 Procedimiento de Calidad por Curso
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTasksTabMode("google");
                        setSearchTaskQuery("");
                      }}
                      className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border-0 ${
                        tasksTabMode === "google"
                          ? "bg-white text-indigo-700 shadow-3xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                      ⚙️ Tareas de Google Generales ({tasks.length})
                    </button>
                  </div>

                  {tasksTabMode === "courses" ? (
                    <div className="space-y-4">
                      {selectedCourseIdForTasks === "" ? (
                        <>
                          <div className="bg-indigo-55/65 border border-slate-200/50 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-semibold shadow-4xs">
                            <div className="space-y-0.5">
                              <span className="text-slate-705 font-extrabold block">📋 Control y Gestión de Calidad (Checklists DGMM)</span>
                              <span className="text-[11px] leading-relaxed block text-slate-450">Cada curso impartido en Pronautic requiere el cumplimiento estricto del procedimiento de 38 pasos exigido por Marina Mercante. Selecciona un curso para auditar sus tareas.</span>
                            </div>
                            <span className="text-[9.5px] font-black bg-indigo-50 border border-indigo-200 text-indigo-805 px-2.5 py-1.5 rounded-lg shrink-0 uppercase select-none text-center">
                              Normativa SGC DGMM
                            </span>
                          </div>

                          {/* Search bar for courses list */}
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <Search className="w-4 h-4 text-slate-400" />
                            </span>
                            <input
                              type="text"
                              value={searchTaskQuery}
                              onChange={(e) => setSearchTaskQuery(e.target.value)}
                              placeholder="Buscar curso por nombre, aula, instructor o código..."
                              className="w-full text-xs font-semibold pl-9 pr-4 py-2.5 bg-white border border-slate-205 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 hover:border-slate-300 transition-all font-sans"
                            />
                          </div>

                          {/* Grid of courses */}
                          {(() => {
                            const filteredCoursesList = displayCourses.filter((course) => {
                              if (!searchTaskQuery) return true;
                              const query = searchTaskQuery.toLowerCase();
                              const summary = (course.summary || "").toLowerCase();
                              const desc = (course.description || "").toLowerCase();
                              const allocation = eventResources[course.id] || {};
                              const aula = (allocation.aula || "").toLowerCase();
                              const inst = (allocation.instructor || "").toLowerCase();
                              const code = (allocation.codigoCurso || "").toLowerCase();
                              return (
                                summary.includes(query) ||
                                desc.includes(query) ||
                                aula.includes(query) ||
                                inst.includes(query) ||
                                code.includes(query)
                              );
                            });

                            if (filteredCoursesList.length === 0) {
                              return (
                                <div className="bg-slate-50 border border-slate-200/60 p-12 rounded-xl text-center py-16">
                                  <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                  <p className="text-xs text-slate-500 font-medium">
                                    No se encontraron cursos activos con los filtros indicados.
                                  </p>
                                  {searchTaskQuery && (
                                    <button
                                      type="button"
                                      onClick={() => setSearchTaskQuery("")}
                                      className="mt-3 text-xs text-indigo-650 hover:text-indigo-800 underline font-semibold bg-transparent border-0 cursor-pointer"
                                    >
                                      Limpiar consulta de búsqueda
                                    </button>
                                  )}
                                </div>
                              );
                            }

                            return (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredCoursesList.map((course) => {
                                  // Compute stats
                                  const allocation = eventResources[course.id] || {};
                                  const completed = allocation.completedAuditTasks || [];
                                  
                                  let pendingD = 0;
                                  let pendingDF = 0;
                                  let pendingINS = 0;
                                  let pendingRSGI = 0;
                                  
                                  AUDIT_TASKS.forEach(task => {
                                    const isCompleted = completed.includes(task.id);
                                    if (!isCompleted) {
                                      const roles = task.responsible.split(/[\s/+,&]+/);
                                      roles.forEach(r => {
                                        const uRole = r.toUpperCase().trim();
                                        if (uRole === "D") pendingD++;
                                        else if (uRole === "DF") pendingDF++;
                                        else if (uRole === "INS") pendingINS++;
                                        else if (uRole === "RSGI") pendingRSGI++;
                                      });
                                    }
                                  });

                                  const pct = Math.min(100, Math.max(0, Math.round((completed.length / AUDIT_TASKS.length) * 100)));

                                  return (
                                    <div 
                                      key={course.id}
                                      className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-3xs hover:shadow-2xs hover:border-slate-350 transition-all flex flex-col justify-between space-y-4"
                                    >
                                      <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                                          <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-slate-400" />
                                            {formatEventDates(course)}
                                          </span>
                                          {allocation.codigoCurso && (
                                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-extrabold uppercase">
                                              DGMM: {allocation.codigoCurso}
                                            </span>
                                          )}
                                        </div>

                                        <h4 className="text-xs font-extrabold text-slate-800 leading-snug line-clamp-2">
                                          {course.summary || "Curso sin título"}
                                        </h4>

                                        {/* Classroom / Instructor inline info */}
                                        <div className="flex flex-wrap gap-1.5 text-[9.5px] text-slate-500 font-semibold">
                                          {allocation.aula && (
                                            <span className="bg-indigo-50 text-indigo-950 px-1.5 py-0.5 rounded border border-indigo-100/50">
                                              🏫 {allocation.aula}
                                            </span>
                                          )}
                                          {allocation.instructor && (
                                            <span className="bg-purple-50 text-purple-950 px-1.5 py-0.5 rounded border border-purple-100/50">
                                              ⚓ {allocation.instructor}
                                            </span>
                                          )}
                                        </div>

                                        {/* Progress bar visualizer */}
                                        <div className="pt-2">
                                          <div className="flex items-center justify-between text-[9.5px] font-bold text-slate-650 mb-1">
                                            <span>Progreso de Calidad (SGC)</span>
                                            <span className="font-mono font-extrabold text-indigo-700">{completed.length} / {AUDIT_TASKS.length} ({pct}%)</span>
                                          </div>
                                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/40">
                                            <div 
                                              className={`h-full transition-all duration-300 ${pct === 100 ? 'bg-emerald-500' : 'bg-indigo-700'}`} 
                                              style={{ width: `${pct}%` }}
                                            />
                                          </div>
                                        </div>
                                      </div>

                                      {/* Pending counters breakdown */}
                                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          {pendingD > 0 && (
                                            <span className="text-[8.5px] font-black bg-emerald-50 text-emerald-700 px-1 rounded-sm uppercase tracking-wide border border-emerald-200/50" title="Directiva - Rober">
                                              D: {pendingD}
                                            </span>
                                          )}
                                          {pendingDF > 0 && (
                                            <span className="text-[8.5px] font-black bg-indigo-50 text-indigo-700 px-1 rounded-sm uppercase tracking-wide border border-indigo-200/50" title="Formación - Raquel">
                                              DF: {pendingDF}
                                            </span>
                                          )}
                                          {pendingINS > 0 && (
                                            <span className="text-[8.5px] font-black bg-purple-50 text-purple-700 px-1 rounded-sm uppercase tracking-wide border border-purple-200/50" title="Instructor Principal">
                                              INS: {pendingINS}
                                            </span>
                                          )}
                                          {pendingRSGI > 0 && (
                                            <span className="text-[8.5px] font-black bg-amber-50 text-amber-700 px-1 rounded-sm uppercase tracking-wide border border-amber-200/30" title="Calidad SGI - Raquel">
                                              SGI: {pendingRSGI}
                                            </span>
                                          )}
                                          {pendingD === 0 && pendingDF === 0 && pendingINS === 0 && pendingRSGI === 0 && (
                                            <span className="text-[8.5px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
                                              Completado ✓
                                            </span>
                                          )}
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedCourseIdForTasks(course.id);
                                            setSearchTaskQuery("");
                                          }}
                                          className="py-1 px-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold shadow-4xs transition-all cursor-pointer flex items-center gap-1"
                                        >
                                          Inspeccionar checklist →
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </>
                      ) : (
                        // If course IS selected
                        (() => {
                          const course = displayCourses.find(c => c.id === selectedCourseIdForTasks);
                          if (!course) {
                            setSelectedCourseIdForTasks("");
                            return null;
                          }
                          const allocation = eventResources[course.id] || {};
                          const completed = allocation.completedAuditTasks || [];
                          const pct = Math.min(100, Math.max(0, Math.round((completed.length / AUDIT_TASKS.length) * 100)));

                          // Filter tasks
                          const tasksInActiveView = AUDIT_TASKS.filter(task => {
                            // 1. Role Filter
                            if (tasksRoleFilter !== "ALL") {
                              const roles = task.responsible.split(/[\s/+,&]+/);
                              const match = roles.some(r => r.toUpperCase().trim() === tasksRoleFilter);
                              if (!match) return false;
                            }
                            // 2. Search Text query
                            if (searchTaskQuery) {
                              const q = searchTaskQuery.toLowerCase();
                              const lbl = task.label.toLowerCase();
                              const doc = (task.document || "").toLowerCase();
                              const lid = task.id.toLowerCase();
                              const resp = task.responsible.toLowerCase();
                              if (!lbl.includes(q) && !doc.includes(q) && !lid.includes(q) && !resp.includes(q)) return false;
                            }
                            return true;
                          });

                          return (
                            <div className="space-y-4">
                              {/* Header Card with back action */}
                              <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xs border border-slate-800 space-y-3">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedCourseIdForTasks("");
                                      setSearchTaskQuery("");
                                    }}
                                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10.5px] font-bold border-0 cursor-pointer flex items-center gap-1.5 transition-all"
                                  >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    Volver al listado
                                  </button>

                                  <div className="text-[10px] bg-sky-900/50 border border-sky-605/40 text-sky-305 px-2 py-0.5 rounded font-mono font-bold tracking-tight uppercase">
                                    Normativa DGMM
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                                    Inspeccionando Procedimientos del Curso:
                                  </p>
                                  <h3 className="text-sm font-extrabold text-white leading-tight">
                                    {course.summary || "Curso sin nombre"}
                                  </h3>
                                  <p className="text-[11px] text-slate-300 font-semibold font-mono flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    {formatEventDates(course)} {allocation.aula && `| Aula: ${allocation.aula}`} {allocation.instructor && `| Instructor: ${allocation.instructor}`}
                                  </p>
                                </div>

                                {/* Dynamic Compliance Progress inside top card */}
                                <div className="space-y-1.5 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                                    <span className="flex items-center gap-1.5">
                                      <span>Cumplimiento del Procedimiento de Calidad</span>
                                      {pct === 100 && <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black px-1 rounded">Homologado</span>}
                                    </span>
                                    <span className="font-mono font-semibold">{completed.length} de {AUDIT_TASKS.length} completado ({pct})%</span>
                                  </div>
                                  <div className="w-full bg-slate-850 h-2.5 rounded-full overflow-hidden border border-slate-800">
                                    <div 
                                      className={`h-full transition-all duration-300 ${pct === 100 ? 'bg-emerald-500' : 'bg-sky-500'}`} 
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Interactive role filter bar + Search */}
                              <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl space-y-3.5 shadow-3xs">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block select-none">
                                    Filtro por Responsable de Firma:
                                  </span>
                                  <div className="flex flex-wrap gap-1">
                                    <button
                                      type="button"
                                      onClick={() => setTasksRoleFilter("ALL")}
                                      className={`px-2 py-1 rounded text-[10px] font-bold tracking-tight transition-all border cursor-pointer border-slate-200 ${
                                        tasksRoleFilter === "ALL"
                                          ? "bg-slate-900 border-slate-900 text-white shadow-3xs font-extrabold"
                                          : "bg-white text-slate-605 hover:text-slate-900 hover:border-slate-300"
                                      }`}
                                    >
                                      Ver Todo
                                    </button>
                                    {(["D", "DF", "INS", "RSGI"] as const).map((role) => (
                                      <button
                                        key={role}
                                        type="button"
                                        onClick={() => setTasksRoleFilter(role)}
                                        className={`px-2 py-1 rounded text-[10px] font-bold tracking-tight transition-all border cursor-pointer border-slate-200 ${
                                          tasksRoleFilter === role
                                            ? "bg-indigo-600 border-indigo-600 text-white shadow-3xs font-black"
                                            : "bg-white text-slate-605 hover:text-slate-900 hover:border-slate-300"
                                        }`}
                                      >
                                        {role === "D" ? "D (Rober)" : role === "DF" ? "DF (Raquel)" : role === "INS" ? "INST (Instructor)" : "RSGI (Raquel)"}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div className="relative">
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search className="w-4 h-4 text-slate-400" />
                                  </span>
                                  <input
                                    type="text"
                                    value={searchTaskQuery}
                                    onChange={(e) => setSearchTaskQuery(e.target.value)}
                                    placeholder="Buscar por paso SGC, documento obligatorio (e.g. Hoja, Acta)..."
                                    className="w-full text-xs font-semibold pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                                  />
                                </div>
                              </div>

                              {/* Live checklists tasks table list */}
                              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-3xs">
                                {tasksInActiveView.length === 0 ? (
                                  <div className="p-12 text-center text-slate-500 italic text-xs">
                                    No se encontraron pasos correspondientes a los filtros establecidos.
                                  </div>
                                ) : (
                                  tasksInActiveView.map((task) => {
                                    const checked = completed.includes(task.id);
                                    
                                    // Identify background highlight based on compliance phase (previous, during, after)
                                    const taskNum = Number(task.id.replace("t", ""));
                                    let phaseBg = "hover:bg-slate-50/55";
                                    let phaseName = "";
                                    let phaseColor = "";
                                    if (taskNum <= 15) {
                                      phaseName = "Previa"; 
                                      phaseColor = "bg-sky-50 border-sky-200 text-sky-805";
                                    } else if (taskNum <= 23) {
                                      phaseName = "Impartición"; 
                                      phaseColor = "bg-purple-50 border-purple-200 text-purple-805";
                                    } else {
                                      phaseName = "Cierre"; 
                                      phaseColor = "bg-slate-100 border-slate-300 text-slate-705";
                                    }

                                    return (
                                      <div 
                                        key={task.id}
                                        className={`p-3 sm:p-4 flex items-start gap-3 transition-colors ${phaseBg} ${checked ? 'opacity-85 bg-slate-50/20' : ''}`}
                                      >
                                        <button 
                                          type="button"
                                          onClick={() => handleToggleAuditTaskDashboard(course.id, task.id)}
                                          className={`mt-0.5 shrink-0 h-5 w-5 flex items-center justify-center rounded border transition-all cursor-pointer ${
                                            checked 
                                              ? "bg-emerald-500 border-emerald-500 text-white" 
                                              : "border-slate-300 bg-white hover:border-indigo-500"
                                          }`}
                                          title={checked ? "Marcar como pendiente de firma" : "Marcar como verificado y firmado"}
                                        >
                                          {checked ? <Check className="h-3.5 w-3.5 font-bold" /> : null}
                                        </button>

                                        <div className="flex-1 min-w-0 space-y-1">
                                          <div className="flex items-start justify-between gap-1 flex-wrap sm:flex-nowrap">
                                            <p className={`text-xs font-bold leading-snug ${checked ? 'text-slate-400 line-through font-normal' : 'text-slate-805'}`}>
                                              <span className="font-mono text-[10px] text-slate-450 font-black mr-1 shadow-4xs bg-slate-105 px-1 py-0.5 rounded shrink-0">{task.id.toUpperCase()}</span>
                                              {task.label}
                                            </p>

                                            <div className="flex gap-1 shrink-0 mt-1 sm:mt-0">
                                              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border font-mono select-none ${phaseColor}`}>
                                                {phaseName}
                                              </span>
                                            </div>
                                          </div>

                                          {/* Task metadatas */}
                                          <div className="flex flex-wrap gap-1.5 items-center pt-0.5 text-[9px] sm:text-[9.5px]">
                                            <span className="bg-indigo-50 text-indigo-750 px-1.5 py-0.5 border border-indigo-200/50 rounded font-bold font-sans">
                                              Firma: {task.responsible.includes("/") ? `Varios (${task.responsible})` : task.responsible}
                                            </span>

                                            {task.document && (
                                              <span className="bg-amber-50 text-amber-850 px-1.5 py-0.5 border border-amber-200/55 rounded font-black font-sans flex items-center gap-0.5">
                                                <FileText className="w-3 h-3 text-amber-600" />
                                                Doc: {task.document}
                                              </span>
                                            )}

                                            {task.deadline && (
                                              <span className="bg-rose-50 text-rose-800 border border-rose-150 px-1.5 py-0.5 rounded font-extrabold font-mono flex items-center gap-0.5">
                                                ⏱ {task.deadline}
                                              </span>
                                            )}

                                            {checked ? (
                                              <span className="text-emerald-700 font-extrabold flex items-center gap-0.5 border border-emerald-150 bg-emerald-50 px-1.5 py-0.5 rounded text-[8.5px] uppercase tracking-wide">
                                                Firmado ✓
                                              </span>
                                            ) : (
                                              <span className="text-amber-700 font-extrabold flex items-center gap-0.5 border border-amber-150 bg-amber-50/20 px-1.5 py-0.5 rounded text-[8.5px] uppercase tracking-wide">
                                                Pendiente
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          );
                        })()
                      )}
                    </div>
                  ) : (
                    // Synced general Google Tasks Tab mode
                    <div className="space-y-4">
                      {/* Filter toolbar */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <p className="text-xs text-slate-500 font-semibold">
                          Mostrando {displayTasks.length} de {tasks.length} tareas totales en Google
                        </p>
                        
                        <button
                          type="button"
                          onClick={() => setOnlyShowRangeTasks(!onlyShowRangeTasks)}
                          className={`text-[10px] px-2 py-1 font-bold rounded cursor-pointer border flex items-center gap-1 transition-all ${
                            onlyShowRangeTasks 
                              ? "bg-indigo-55 border-indigo-200 text-indigo-700" 
                              : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-705"
                          }`}
                        >
                          <Filter className="w-3 h-3" />
                          {onlyShowRangeTasks ? "Mostrando: Período activo" : "Mostrando: Todas"}
                        </button>
                      </div>

                      {displayTasks.length > 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-3xs divide-y divide-slate-100 overflow-hidden">
                          {displayTasks.map((task) => (
                            <div 
                              key={task.id}
                              className="p-3.5 flex items-start gap-3 hover:bg-slate-50/50 transition-colors"
                            >
                              <button 
                                type="button"
                                onClick={() => handleToggleTaskStatus(task.id)}
                                className="mt-0.5 shrink-0 h-5 w-5 flex items-center justify-center rounded border border-slate-300 bg-white hover:border-indigo-500 text-indigo-650 transition-all cursor-pointer"
                                title={task.status === "completed" ? "Marcar como pendiente" : "Marcar como completada"}
                              >
                                {task.status === "completed" ? (
                                  <Check className="h-3.5 w-3.5 font-black" />
                                ) : null}
                              </button>

                              <div className="space-y-1 py-0.5 flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className={`text-xs font-bold leading-none ${
                                    task.status === "completed" 
                                      ? "text-slate-400 line-through font-normal" 
                                      : "text-slate-800"
                                  }`}>
                                    {task.title || "Tarea sin título"}
                                  </p>
                                  
                                  {task.listTitle && (
                                    <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase shrink-0">
                                      {task.listTitle}
                                    </span>
                                  )}
                                </div>

                                {task.notes && (
                                  <p className="text-[11px] text-slate-500 line-clamp-1 leading-relaxed">
                                    {task.notes}
                                  </p>
                                )}

                                {task.due && (
                                  <p className="text-[10px] text-amber-600 flex items-center gap-1 font-semibold pt-0.5 font-mono">
                                    <Clock className="w-3 h-3" />
                                    Vence: {new Date(task.due).toLocaleDateString("es-ES")}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-slate-200/60 p-12 rounded-xl text-center py-16">
                          <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs text-slate-500 font-medium">
                            No se encontraron tareas de Google para el período visualizado.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
        </>
      )}

      {/* Dynamic Detail & Linking Portal Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            allTasks={tasks}
            linkedTaskIds={eventTaskLinks[selectedEvent.id] || []}
            onClose={() => setSelectedEvent(null)}
            onLinkTask={handleLinkTask}
            onUnlinkTask={handleUnlinkTask}
            onToggleTaskStatus={handleToggleTaskStatus}
            eventResources={eventResources}
            onSaveResources={handleSaveResources}
            allEvents={mergedEvents}
            onUpdateEvent={handleUpdateEvent}
            teacherAvailabilityStatus={checkTeacherAvailability(selectedEvent)}
            aulasList={aulas}
            embarcacionesList={embarcaciones}
            userRole={userRole}
            userEmail={user?.email || "instructorspronautic@gmail.com"}
          />
        )}
      </AnimatePresence>

      {/* Admin Resources Management Modal */}
      <AnimatePresence>
        {isAdminModalOpen && (
          <AdminResourcesModal
            isOpen={isAdminModalOpen}
            onClose={() => setIsAdminModalOpen(false)}
            aulas={aulas}
            onUpdateAulas={setAulas}
            embarcaciones={embarcaciones}
            onUpdateEmbarcaciones={setEmbarcaciones}
          />
        )}
      </AnimatePresence>

      {/* Persistent minimalistic footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-[11px] text-slate-400">
        <p>© 2026 Asistente de Planificación Inteligente de Google Workspace</p>
        <p className="mt-0.5">Potenciado por Gemini Flash y Firebase Secure Sandbox Authentication</p>
      </footer>
    </div>
  );
}
