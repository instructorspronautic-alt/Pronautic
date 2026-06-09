import { useState, useEffect, useMemo, useCallback } from "react";
import { initAuth, googleSignIn, logout } from "./auth";
import {
  CalendarEvent,
  GoogleTask,
  GoogleTaskList,
  ScheduleAnalysis,
  TeacherAvailability,
  StudentInfo,
  CourseIncident,
  CourseDocument,
  CourseAuditLog,
  CourseNotesData,
  FeedbackTicket,
  InstructorProfile,
} from "./types";
import ScheduleSummary from "./components/ScheduleSummary";
import MetricsDashboard from "./components/MetricsDashboard";
import InstructorCheckInView from "./components/InstructorCheckInView";
import EventDetailModal, {
  AUDIT_TASKS,
  AuditTask,
} from "./components/EventDetailModal";
import AdminResourcesModal from "./components/AdminResourcesModal";
import { PronauticLogo } from "./components/PronauticLogo";
const pronauticSailImage =
  "/src/assets/images/pronautic_landing_sail_1779873853995.png";
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
  ArrowLeft,
  Printer,
  Plus,
  Trash2,
  Eye,
  BarChart3,
  Mic,
  Bot,
  Send,
  ClipboardList,
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
  "Simulador de Radio GMDSS",
];

const DEFAULT_EMBARCACIONES = [
  "Velero Escuela 'Capitán Pronautic'",
  "Lancha Motora 'MiniPronautic'",
  "Yate de Prácticas 'Alborán'",
  "Semirrígida de Apoyo 'Pronautic Dos'",
];

const DEFAULT_STAFF: InstructorProfile[] = [
  {
    id: "s1",
    branca: "STCW",
    name: "Abel Aguilar",
    category: "Capitán",
    phone: "630 184 142",
    email: "abel_aguilar@hotmail.es",
    location: "",
  },
  {
    id: "s2",
    branca: "ESBARJO",
    name: "Adrià Onsés",
    category: "",
    phone: "663 37 60 30",
    email: "adriaonsessoler@gmail.com",
    location: "",
  },
  {
    id: "s3",
    branca: "ESBARJO",
    name: "Aina Bauzà",
    category: "",
    phone: "617 95 06 87",
    email: "",
    location: "",
  },
  {
    id: "s4",
    branca: "SANITARI",
    name: "Ainhoa Ruiz Segarra",
    category: "Enfermera",
    phone: "677 742 731",
    email: "ainhoaruiz10@gmail.com",
    location: "St Joan Despi",
  },
  {
    id: "s5",
    branca: "STCW",
    name: "Albert Pons",
    category: "Capitán",
    phone: "626 459 261",
    email: "pons640@gmail.com",
    location: "Olesa de Montserrat",
  },
  {
    id: "s6",
    branca: "STCW",
    name: "Albert Rondon",
    category: "1ª Piloto",
    phone: "603 217 894",
    email: "albertondon22@gmail.com",
    location: "Brazil",
  },
  {
    id: "s7",
    branca: "STCW",
    name: "Albert Serra",
    category: "1ª Piloto",
    phone: "650 985 753",
    email: "alserpe@hotmail.com",
    location: "",
  },
  {
    id: "s8",
    branca: "STCW",
    name: "Alejandro Ramírez Sánchez",
    category: "Máquinas",
    phone: "661 316 582",
    email: "alejandro02061974@gmail.com",
    location: "Cádiz-Algeciras",
  },
  {
    id: "s9",
    branca: "SANITARI",
    name: "Alfredo Trevisan Sanchez",
    category: "Enfermero",
    phone: "678 470 222",
    email: "alfredots@hotmail.com",
    location: "Castelldefels",
  },
  {
    id: "s10",
    branca: "STCW",
    name: "Alicia Gonzalez Diez",
    category: "Enfermera",
    phone: "679 431 520",
    email: "aligonzalezdiez@gmail.com",
    location: "",
  },
  {
    id: "s11",
    branca: "SANITARI",
    name: "Andrea Alvarez Serén",
    category: "Enfermera",
    phone: "680 929 492",
    email: "andreaalser@gmail.com",
    location: "Sta Coloma de Gramanet",
  },
  {
    id: "s12",
    branca: "STCW",
    name: "Benjamin Garcia",
    category: "Enfermero",
    phone: "602 094 938",
    email: "raimigarcia@gmail.com",
    location: "BCN",
  },
  {
    id: "s13",
    branca: "STCW",
    name: "Bernat Valverde",
    category: "Capitán",
    phone: "616 643 845",
    email: "bernat.valverde@gmail.com",
    location: "",
  },
  {
    id: "s14",
    branca: "STCW",
    name: "Conrad Guerra",
    category: "1ª Piloto",
    phone: "647 760 175",
    email: "conradguerra22@gmail.com",
    location: "Barcelona",
  },
  {
    id: "s15",
    branca: "ESBARJO",
    name: "Dani Cianfagna",
    category: "",
    phone: "686689285",
    email: "danielcapria@gmail.com",
    location: "",
  },
  {
    id: "s16",
    branca: "ESBARJO",
    name: "Dani Company",
    category: "",
    phone: "605 50 37 47",
    email: "",
    location: "",
  },
  {
    id: "s17",
    branca: "ESBARJO",
    name: "Dani Monzón",
    category: "",
    phone: "648706255",
    email: "danielmonzon.dmr@gmail.com",
    location: "",
  },
  {
    id: "s18",
    branca: "ESBARJO",
    name: "Dani Zamora",
    category: "",
    phone: "666 252 065",
    email: "dani.zamora30@gmail.com",
    location: "",
  },
  {
    id: "s19",
    branca: "STCW",
    name: "Daniel Company",
    category: "Capitán",
    phone: "605 503 747",
    email: "daniel_company@hotmail.com",
    location: "Tarragona",
  },
  {
    id: "s20",
    branca: "STCW",
    name: "Daniel Monzón",
    category: "Capitán",
    phone: "648 706 255",
    email: "danielmonzon.dmr@gmail.com",
    location: "Barcelona",
  },
  {
    id: "s21",
    branca: "STCW",
    name: "David Llinero",
    category: "",
    phone: "",
    email: "",
    location: "",
  },
  {
    id: "s22",
    branca: "ESBARJO",
    name: "David Navarro",
    category: "",
    phone: "694281727",
    email: "dnmbcn@icloud.com",
    location: "",
  },
  {
    id: "s23",
    branca: "SANITARI",
    name: "Deborah Blasco Muda",
    category: "Enfermera",
    phone: "658 504 714",
    email: "dblasco.muda@gmail.com",
    location: "Vilassar",
  },
  {
    id: "s24",
    branca: "ESBARJO",
    name: "Georgina Castro Fresno",
    category: "Enfermera",
    phone: "639 459 680",
    email: "georginacf98@gmail.com",
    location: "Barcelona",
  },
  {
    id: "s25",
    branca: "STCW",
    name: "Guillermo Gil",
    category: "1ª Piloto",
    phone: "656 659 442",
    email: "guillermogil24@hotmail.com",
    location: "Zaragoza",
  },
  {
    id: "s26",
    branca: "SANITARI",
    name: "Ignasi Bernaus",
    category: "Enfermero",
    phone: "633 025 363",
    email: "ignasi.bernaus@gmail.com",
    location: "BCN",
  },
  {
    id: "s27",
    branca: "STCW",
    name: "Imad",
    category: "",
    phone: "669 53 27 28",
    email: "elimaad@hotmail.com",
    location: "",
  },
  {
    id: "s28",
    branca: "STCW",
    name: "Joan Rius",
    category: "Capitán",
    phone: "696 133 532",
    email: "riusisrael@hotmail.com",
    location: "Calafell",
  },
  {
    id: "s29",
    branca: "STCW",
    name: "Mehdi Aberhouche",
    category: "",
    phone: "747 402 296",
    email: "mehdiaberhouche@gmail.com",
    location: "",
  },
  {
    id: "s30",
    branca: "SANITARI",
    name: "Maria Pardo",
    category: "Doctora",
    phone: "610 242 969",
    email: "mariapardosd@gmail.com",
    location: "BCN",
  },
  {
    id: "s31",
    branca: "ESBARJO",
    name: "Quim Hervas",
    category: "",
    phone: "617 888 888",
    email: "quim.hervas@gmail.com",
    location: "",
  },
];

const PRONAUTIC_COURSES_CATALOG = [
  {
    id: "stcw-fb",
    name: "Formación Básica en Seguridad STCW",
    code: "STCW-FB",
  },
  {
    id: "stcw-gmdss",
    name: "Operador de Radio GMDSS STCW",
    code: "STCW-GMDSS",
  },
  {
    id: "per-motor",
    name: "Patrón de Embarcaciones de Recreo (PER)",
    code: "PER-MOTOR",
  },
  { id: "per-vela", name: "Habilitación a Vela (PER Vela)", code: "PER-VELA" },
  { id: "pnb", name: "Patrón de Navegación Básica (PNB)", code: "PNB" },
  { id: "ln", name: "Licencia de Navegación (Titulín)", code: "LN" },
  { id: "py", name: "Patrón de Yate (PY)", code: "PY" },
  { id: "cy", name: "Capitán de Yate (CY)", code: "CY" },
];

export default function App() {
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const isRober =
    user?.email?.toLowerCase() === "instructorspronautic@gmail.com";
  const isRaquel = user?.email?.toLowerCase() === "bopronautic@gmail.com";
  const userName = isRober
    ? "Robert"
    : isRaquel
      ? "Raquel"
      : user?.displayName || "Usuario";
  const userRoleLabel = isRober
    ? "Director de Operaciones"
    : isRaquel
      ? "Directora del Centro"
      : "Usuario Pronautic";
  const isCurrentUserAdmin =
    user?.email?.toLowerCase() === "instructorspronautic@gmail.com" ||
    user?.email?.toLowerCase() === "bopronautic@gmail.com";
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

  // Tabs for main view: 'ai' | 'calendar' | 'tasks' | 'doc-generator' | 'stats'
  const [activeTab, setActiveTab] = useState<
    | "ai"
    | "calendar"
    | "tasks"
    | "doc-generator"
    | "stats"
    | "tickets"
    | "resources"
  >("calendar");
  const [showPrintWarning, setShowPrintWarning] = useState<boolean>(false);

  // Document Generator state
  const [docMonth, setDocMonth] = useState<number>(-1);
  const [docYear, setDocYear] = useState<number>(() => {
    return new Date().getFullYear() || 2026;
  });
  const [docTitle, setDocTitle] = useState<string>(
    "Informe Mensual de Actividades e Inspección SGC",
  );
  const [docSubtitle, setDocSubtitle] = useState<string>(
    "Escuela Profesional de Navegación Marítima PRONAUTIC",
  );

  // Document Generator Filters State
  const [docCalFilter, setDocCalFilter] = useState<string[]>([]); // empty list means 'all calendars'
  const [docTypeFilter, setDocTypeFilter] = useState<string>("all"); // 'all' | 'courses' | 'other'
  const [docAulaFilter, setDocAulaFilter] = useState<string>("all");
  const [docEmbarcacionFilter, setDocEmbarcacionFilter] =
    useState<string>("all");
  const [docInstructorFilter, setDocInstructorFilter] = useState<string>("all");
  const [docSearchQuery, setDocSearchQuery] = useState<string>("");
  const [docExcludedIds, setDocExcludedIds] = useState<Record<string, boolean>>(
    {},
  );

  const [docFields, setDocFields] = useState<
    Record<string, { label: string; enabled: boolean }>
  >({
    title: { label: "Actividad / Curso", enabled: true },
    dates: { label: "Fecha Inicio y Fin", enabled: true },
    time: { label: "Horario Lectivo", enabled: true },
    instructor: { label: "Profesor Asignado", enabled: true },
    aula: { label: "Aula Asignada", enabled: true },
    embarcacion: { label: "Embarcación", enabled: true },
    codigoCurso: { label: "Código de Curso", enabled: true },
    numAlumnos: { label: "Nº Alumnos", enabled: false },
    materials: { label: "Materiales Requeridos", enabled: false },
    calendarName: { label: "Calendario Origen", enabled: false },
    description: { label: "Descripción / Notas", enabled: false },
  });

  const [customDocFields, setCustomDocFields] = useState<
    Array<{
      id: string;
      label: string;
      enabled: boolean;
      defaultValue: string;
      values: Record<string, string>;
    }>
  >([
    {
      id: "custom_signatures",
      label: "Sección de Firmas",
      enabled: false,
      defaultValue: "Firma Responsable: _______________________",
      values: {},
    },
    {
      id: "custom_status",
      label: "Dictamen Calidad SGC",
      enabled: false,
      defaultValue: "Conforme SGC ✓",
      values: {},
    },
  ]);

  const [docHeaderFields, setDocHeaderFields] = useState<
    Array<{ id: string; label: string; value: string }>
  >([
    { id: "head_cod", label: "Código de Control", value: "PRON-FORM-SGC-04" },
    { id: "head_rev", label: "Revisión SGC", value: "Ed. 04 / Rev. 02" },
    {
      id: "head_org",
      label: "Organismo de Control",
      value: "D.G.M.M. (España)",
    },
  ]);

  // Track the current local date
  const [todayFormatted, setTodayFormatted] = useState<string>("");

  // AI Feedback Agent State
  const [showFeedbackAgent, setShowFeedbackAgent] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [feedbackTickets, setFeedbackTickets] = useState<FeedbackTicket[]>(
    () => {
      const saved = localStorage.getItem("pronautic_feedback_tickets");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return [];
        }
      }
      return [];
    },
  );

  // Persist feedback tickets
  useEffect(() => {
    localStorage.setItem(
      "pronautic_feedback_tickets",
      JSON.stringify(feedbackTickets),
    );
  }, [feedbackTickets]);

  // Target view range and active dates state
  const [viewRange, setViewRange] = useState<
    "day" | "week" | "month" | "quarter" | "semester" | "year"
  >("day");
  const [focusDate, setFocusDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [eventTaskLinks, setEventTaskLinks] = useState<
    Record<string, string[]>
  >({});
  const [onlyShowRangeTasks, setOnlyShowRangeTasks] = useState<boolean>(false);
  const [showOnlyCourses, setShowOnlyCourses] = useState<boolean>(false);
  const [selectedAulaFilter, setSelectedAulaFilter] = useState<string>("");
  const [selectedEmbarcacionFilter, setSelectedEmbarcacionFilter] =
    useState<string>("");
  const [calendarSubTab, setCalendarSubTab] = useState<
    "list" | "matrix" | "instructor"
  >("list");

  // Search and Mode state for the dashboard tasks tab
  const [tasksTabMode, setTasksTabMode] = useState<"courses" | "google">(
    "courses",
  );
  const [selectedCourseIdForTasks, setSelectedCourseIdForTasks] =
    useState<string>("");
  const [searchTaskQuery, setSearchTaskQuery] = useState<string>("");
  const [tasksRoleFilter, setTasksRoleFilter] = useState<
    "ALL" | "D" | "DF" | "INS" | "RSGI"
  >("ALL");

  // Calendarios list state (Pronautic synchronize)
  const [calendars, setCalendars] = useState<
    Array<{
      id: string;
      summary: string;
      primary?: boolean;
      backgroundColor?: string;
    }>
  >([]);
  const [selectedCalIds, setSelectedCalIds] = useState<string[]>(["primary"]);

  // Role simulation & access rules (Problem 2)
  const [userRole, setUserRole] = useState<"admin" | "teacher">("admin");
  const [teacherEmailFilter, setTeacherEmailFilter] = useState<string>("");
  const [customTeacherEmail, setCustomTeacherEmail] = useState<string>("");
  const [selectedInstructorForCourses, setSelectedInstructorForCourses] =
    useState<InstructorProfile | null>(null);

  // Teacher availability registry state
  const [availabilities, setAvailabilities] = useState<TeacherAvailability[]>(
    [],
  );
  const [newAvailStart, setNewAvailStart] = useState<string>("");
  const [newAvailEnd, setNewAvailEnd] = useState<string>("");
  const [newAvailNotes, setNewAvailNotes] = useState<string>(
    "Disponible todo el día",
  );
  const [editingAvailId, setEditingAvailId] = useState<string | null>(null);

  // Teacher qualified courses
  const [teacherQualifications, setTeacherQualifications] = useState<
    Record<string, string[]>
  >(() => {
    try {
      const saved = localStorage.getItem("pronautic_teacher_qualifications");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "pronautic_teacher_qualifications",
      JSON.stringify(teacherQualifications),
    );
  }, [teacherQualifications]);

  // Resource allocations registry state (Problem 3)
  const [eventResources, setEventResources] = useState<
    Record<
      string,
      {
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
      }
    >
  >({});

  // Overrides for Google Calendar event parameters (summary, description, location)
  const [eventOverrides, setEventOverrides] = useState<
    Record<string, Partial<CalendarEvent>>
  >({});

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

  const [staffDatabase, setStaffDatabase] = useState<InstructorProfile[]>(
    () => {
      const saved = localStorage.getItem("pronautic_staff");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return DEFAULT_STAFF;
        }
      }
      return DEFAULT_STAFF;
    },
  );

  useEffect(() => {
    localStorage.setItem("pronautic_aulas", JSON.stringify(aulas));
    localStorage.setItem(
      "pronautic_embarcaciones",
      JSON.stringify(embarcaciones),
    );
    localStorage.setItem("pronautic_staff", JSON.stringify(staffDatabase));
  }, [aulas, embarcaciones, staffDatabase]);

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("pronautic_aulas", JSON.stringify(aulas));
  }, [aulas]);

  useEffect(() => {
    localStorage.setItem(
      "pronautic_embarcaciones",
      JSON.stringify(embarcaciones),
    );
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
      const savedAvailabilities = localStorage.getItem(
        "teacher_availabilities",
      );
      if (savedAvailabilities) {
        setAvailabilities(JSON.parse(savedAvailabilities));
      }
    } catch (e) {
      console.error(
        "No se pudieron cargar enlaces de tareas, recursos, disponibilidades o ediciones guardadas",
        e,
      );
    }
  }, []);

  const handleAddAvailability = (
    availability: Omit<
      TeacherAvailability,
      "id" | "createdAt" | "teacherEmail"
    > & { teacherEmail: string },
  ) => {
    if (editingAvailId) {
      setAvailabilities((prev) => {
        const updated = prev.map((a) =>
          a.id === editingAvailId ? { ...a, ...availability } : a,
        );
        localStorage.setItem("teacher_availabilities", JSON.stringify(updated));
        return updated;
      });
      setEditingAvailId(null);
    } else {
      const newAvail: TeacherAvailability = {
        ...availability,
        id: "avail_" + Math.random().toString(36).substring(2, 11),
        createdAt: new Date().toISOString(),
      };
      setAvailabilities((prev) => {
        const updated = [...prev, newAvail];
        localStorage.setItem("teacher_availabilities", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleDeleteAvailability = (id: string) => {
    setAvailabilities((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      localStorage.setItem("teacher_availabilities", JSON.stringify(updated));
      return updated;
    });
    if (editingAvailId === id) {
      setEditingAvailId(null);
      setNewAvailStart("");
      setNewAvailEnd("");
      setNewAvailNotes("Disponible todo el día");
    }
  };

  const handleSaveResources = (
    eventId: string,
    resources: {
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
    },
  ) => {
    setEventResources((prev) => {
      const updated = { ...prev, [eventId]: resources };
      localStorage.setItem(
        "event_allocated_resources",
        JSON.stringify(updated),
      );
      return updated;
    });
  };

  const handleToggleAuditTaskDashboard = (eventId: string, taskId: string) => {
    const currentAllocation = eventResources[eventId] || {
      aula: "",
      materials: [],
      completedAuditTasks: [],
    };
    const currentCompleted = currentAllocation.completedAuditTasks || [];
    const updatedCompleted = currentCompleted.includes(taskId)
      ? currentCompleted.filter((id) => id !== taskId)
      : [...currentCompleted, taskId];

    handleSaveResources(eventId, {
      ...currentAllocation,
      completedAuditTasks: updatedCompleted,
    });
  };

  // Merge loaded events with local overrides dynamically
  const mergedEvents = useMemo(() => {
    return events.map((e) => {
      const overrides = eventOverrides[e.id];
      if (overrides) {
        return { ...e, ...overrides };
      }
      return e;
    });
  }, [events, eventOverrides]);

  // Sprint 2: SGC Alert Semantic Status Module
  const sgcAlertStatus = useMemo(() => {
    let alertCount = 0;
    let criticalCount = 0;
    const now = new Date();

    mergedEvents.forEach((e) => {
      const isCourse =
        (e.summary || "").toUpperCase().includes("PER") ||
        (e.summary || "").toUpperCase().includes("PNB") ||
        (e.summary || "").toUpperCase().includes("STCW") ||
        (e.summary || "").toUpperCase().includes("PRACTICA");
      if (!isCourse) return;

      const startStr = e.start?.dateTime || e.start?.date;
      if (!startStr) return;

      const startD = new Date(startStr);
      const diffTime = startD.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // We only care about future courses up to 30 days
      if (diffDays <= 30 && diffDays >= 0) {
        const alloc = eventResources[e.id] || {};
        const completedSGC = alloc.completedAuditTasks || [];
        // Check if mandatory steps like "listado_alumnos" and "comunicacion_dgmm" are completed
        const hasComunicacion = completedSGC.includes("comunicacion_dgmm");
        const hasListado = completedSGC.includes("listado_alumnos");

        if (!hasComunicacion || !hasListado) {
          if (diffDays <= 15) {
            criticalCount++;
          } else {
            alertCount++;
          }
        }
      }
    });

    if (criticalCount > 0) return { status: "red", count: criticalCount };
    if (alertCount > 0) return { status: "amber", count: alertCount };
    return { status: "gris", count: 0 };
  }, [mergedEvents, eventResources]);

  // Event counts per month for the selected year
  const monthEventCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    mergedEvents.forEach((e) => {
      const startStr = e.start?.dateTime || e.start?.date;
      if (startStr) {
        const d = new Date(startStr);
        if (d.getFullYear() === docYear) {
          const m = d.getMonth();
          counts[m] = (counts[m] || 0) + 1;
        }
      }
    });
    return counts;
  }, [mergedEvents, docYear]);

  // Handle local parameter modification (title, location, description)
  const handleUpdateEvent = (
    eventId: string,
    updatedFields: Partial<CalendarEvent>,
  ) => {
    setEventOverrides((prev) => {
      const existing = prev[eventId] || {};
      const updated = { ...prev, [eventId]: { ...existing, ...updatedFields } };
      localStorage.setItem("event_overrides", JSON.stringify(updated));
      return updated;
    });

    // Keep active selectedEvent state in sync as well
    setSelectedEvent((current) => {
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
      },
    );
  }, []);

  // Synchronize role and email filters based on logged in user's email (Robert & Raquel are admins, others are always teachers)
  useEffect(() => {
    if (user) {
      const emailLower = user.email?.toLowerCase();
      const isCurrentAdmin =
        emailLower === "instructorspronautic@gmail.com" ||
        emailLower === "bopronautic@gmail.com";
      if (!isCurrentAdmin) {
        setUserRole("teacher");
        setTeacherEmailFilter(user.email || "");
      } else {
        setUserRole("admin");
      }
    }
  }, [user]);

  // Compute boundaries and formatted labels for time views in Spanish
  const getRangeConfig = (
    date: Date,
    range: "day" | "week" | "month" | "quarter" | "semester" | "year",
  ) => {
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
        const options: Intl.DateTimeFormatOptions = {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        };
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

        const optionsMin: Intl.DateTimeFormatOptions = {
          day: "numeric",
          month: "long",
        };
        const optionsMax: Intl.DateTimeFormatOptions = {
          day: "numeric",
          month: "long",
          year: "numeric",
        };
        label = `Semana del ${timeMin.toLocaleDateString("es-ES", optionsMin)} al ${timeMax.toLocaleDateString("es-ES", optionsMax)}`;
        break;
      }
      case "month": {
        timeMin = new Date(y, m, 1, 0, 0, 0, 0);
        timeMax = new Date(y, m + 1, 0, 23, 59, 59, 999);
        label = date.toLocaleDateString("es-ES", {
          month: "long",
          year: "numeric",
        });
        break;
      }
      case "quarter": {
        const quarter = Math.floor(m / 3) + 1;
        timeMin = new Date(y, (quarter - 1) * 3, 1, 0, 0, 0, 0);
        timeMax = new Date(y, quarter * 3, 0, 23, 59, 59, 999);
        const quarterNames = [
          "Enero - Marzo",
          "Abril - Junio",
          "Julio - Septiembre",
          "Octubre - Diciembre",
        ];
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
      setErrorText(
        "No se pudo iniciar sesión. Asegúrate de otorgar los permisos necesarios.",
      );
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
        email:
          profile === "rober"
            ? "instructorspronautic@gmail.com"
            : "bopronautic@gmail.com",
        displayName: profile === "rober" ? "Robert" : "Raquel",
        photoURL:
          profile === "rober"
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
    targetRange:
      | "day"
      | "week"
      | "month"
      | "quarter"
      | "semester"
      | "year" = viewRange,
  ) => {
    setIsLoadingData(true);
    setErrorText(null);

    if (accessToken === "mock-token") {
      try {
        await new Promise((resolve) => setTimeout(resolve, 350));
        const { label } = getRangeConfig(targetDate, targetRange);
        setTodayFormatted(label);

        const mockCalendars = [
          {
            id: "mock-primary",
            summary: "Calendario Principal (Pronautic)",
            primary: true,
            backgroundColor: "#4f46e5",
          },
          {
            id: "mock-sec",
            summary: "Exámenes Oficiales DGMM / Junta",
            primary: false,
            backgroundColor: "#06b6d4",
          },
          {
            id: "mock-stcw",
            summary: "Cursos STCW",
            primary: false,
            backgroundColor: "#e04f34",
          },
          {
            id: "mock-ism",
            summary: "Pendientes ISM",
            primary: false,
            backgroundColor: "#0ea5e9",
          },
        ];
        setCalendars(mockCalendars);
        // Condición ideal por defecto: Todos los calendarios activos y sincronizados
        setSelectedCalIds(mockCalendars.map((c) => c.id));

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
            summary:
              "Curso Patrón de Embarcaciones de Recreo (PER) - Prácticas de Navegación",
            description:
              "Prácticas de seguridad y navegación oficiales de la DGMM para PER. Navegación costera y maniobras de atraque.",
            location: "Velero Escuela 'Capitán Pronautic'",
            start: { dateTime: event1Start.toISOString() },
            end: { dateTime: event1End.toISOString() },
            calendarId: "mock-primary",
            calendarName: "Calendario Principal (Pronautic)",
          },
          {
            id: "evt-02",
            summary: "Curso de Formación Básica en Seguridad STCW (DGMM)",
            description:
              "Módulo certificado obligatorio para tripulación profesional. Prácticas en simulador de comunicaciones náuticas.",
            location: "Aula de Simulación Práctica",
            start: { dateTime: event2Start.toISOString() },
            end: { dateTime: event2End.toISOString() },
            calendarId: "mock-primary",
            calendarName: "Calendario Principal (Pronautic)",
          },
          {
            id: "evt-03",
            summary: "Examen Práctico Oficial de Radio GMDSS",
            description:
              "Examen final del módulo de comunicaciones de largo alcance para Patrón de Yate.",
            location: "Simulador de Radio GMDSS",
            start: { dateTime: event3Start.toISOString() },
            end: { dateTime: event3End.toISOString() },
            calendarId: "mock-sec",
            calendarName: "Exámenes Oficiales DGMM / Junta",
          },
          {
            id: "evt-stcw-june-fb",
            summary: "Curso de Formación Básica en Seguridad STCW (DGMM)",
            description:
              "Módulo certificado oficial obligatorio para tripulación profesional marítima. Supervivencia en el mar y lucha contra incendios.",
            location: "Aula de Simulación Práctica",
            start: { dateTime: "2026-06-15T09:00:00" },
            end: { dateTime: "2026-06-19T14:00:00" },
            calendarId: "mock-stcw",
            calendarName: "Cursos STCW",
          },
          {
            id: "evt-stcw-june-gmdss",
            summary: "Curso de Operador de Radio GMDSS STCW",
            description:
              "Formación de seguridad en radiocomunicaciones de socorro y correspondencia pública para la marina mercante.",
            location: "Simulador de Radio GMDSS",
            start: { dateTime: "2026-06-22T16:00:00" },
            end: { dateTime: "2026-06-26T20:30:00" },
            calendarId: "mock-stcw",
            calendarName: "Cursos STCW",
          },
          {
            id: "evt-ism-june-audit",
            summary: "Auditoría Interna ISM y Coordinación de Emergencia",
            description:
              "Inspección reglamentaria del Sistema de Gestión de la Seguridad (Cód. ISM) para buques de la escuela. Simulacro de hombre al agua y abandono.",
            location: "Aula Náutica B",
            start: { dateTime: "2026-06-29T09:00:00" },
            end: { dateTime: "2026-06-29T18:00:00" },
            calendarId: "mock-ism",
            calendarName: "Pendientes ISM",
          },
        ];

        setEvents(mockEventsList);

        setSelectedEvent((current) => {
          if (!current || !mockEventsList.some((e) => e.id === current.id))
            return null;
          return mockEventsList.find((e) => e.id === current.id) || current;
        });

        const mockLists: GoogleTaskList[] = [
          { id: "lst-01", title: "Auditoría de Calidad Pronautic" },
          { id: "lst-02", title: "Mantenimiento General Flota" },
        ];
        setTaskLists(mockLists);

        const mockTasksList: GoogleTask[] = [
          {
            id: "t1",
            title: "Control de estanqueidad y escotillas velero",
            status: "needsAction",
            listId: "lst-01",
            listTitle: "Auditoría de Calidad Pronautic",
          },
          {
            id: "t2",
            title: "Verificar extintores y trajes de supervivencia",
            status: "completed",
            listId: "lst-01",
            listTitle: "Auditoría de Calidad Pronautic",
          },
          {
            id: "t3",
            title: "Archivar firmas oficiales de asistencia PER",
            status: "needsAction",
            listId: "lst-01",
            listTitle: "Auditoría de Calidad Pronautic",
          },
          {
            id: "t4",
            title: "Firmar actas oficiales y actas de examen",
            status: "needsAction",
            listId: "lst-01",
            listTitle: "Auditoría de Calidad Pronautic",
          },
          {
            id: "t5",
            title: "Limpiar y desinfectar puestos en simulador de radio",
            status: "needsAction",
            listId: "lst-01",
            listTitle: "Auditoría de Calidad Pronautic",
          },
          {
            id: "t6",
            title: "Revisar anclas y cabos de fondeo",
            status: "needsAction",
            listId: "lst-02",
            listTitle: "Mantenimiento General Flota",
          },
        ];
        setTasks(mockTasksList);

        setEventResources((prev) => {
          if (Object.keys(prev).length === 0) {
            return {
              "evt-01": {
                aula: "Aula Teórica del Puerto",
                embarcacion: "Velero Escuela 'Capitán Pronautic'",
                materials: [
                  "Libro de Navegación",
                  "Regla paralela y transportador",
                  "Chaleco auto-hinchable",
                ],
                numAlumnos: 8,
                instructor: "instructorspronautic@gmail.com",
                codigoCurso: "PER-PRO-2026",
                completedAuditTasks: ["t2"],
              },
              "evt-02": {
                aula: "Aula de Simulación Práctica",
                embarcacion: "Semirrígida de Apoyo 'Pronautic Dos'",
                materials: [
                  "Guía de Comunicaciones Radio",
                  "Manual STCW Seguridad",
                ],
                numAlumnos: 12,
                instructor: "bopronautic@gmail.com",
                codigoCurso: "STCW-FBQA-09",
                completedAuditTasks: ["t5"],
              },
              "evt-stcw-june-fb": {
                aula: "Aula de Simulación Práctica",
                embarcacion: "Semirrígida de Apoyo 'Pronautic Dos'",
                materials: [
                  "Balsa Salvamento Solas",
                  "Manual Auxilio Sanitario",
                  "Extintor de Co2 de Práctica",
                ],
                numAlumnos: 12,
                instructor: "instructorspronautic@gmail.com",
                codigoCurso: "STCW-FB",
                completedAuditTasks: [],
              },
              "evt-stcw-june-gmdss": {
                aula: "Simulador de Radio GMDSS",
                embarcacion: "Ninguna (Mantenimiento Estático)",
                materials: [
                  "Manual Oficial Radiocomunicaciones",
                  "Simulador Digital Transas GMDSS",
                ],
                numAlumnos: 10,
                instructor: "bopronautic@gmail.com",
                codigoCurso: "STCW-GMDSS",
                completedAuditTasks: [],
              },
              "evt-ism-june-audit": {
                aula: "Aula Náutica B",
                embarcacion: "Ninguna",
                materials: [
                  "Convenio SOLAS Capítulo XI-2",
                  "Código Internacional PBIP",
                ],
                numAlumnos: 6,
                instructor: "instructorspronautic@gmail.com",
                codigoCurso: "STCW-ISM",
                completedAuditTasks: [],
              },
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
      const { timeMin, timeMax, label } = getRangeConfig(
        targetDate,
        targetRange,
      );
      setTodayFormatted(label);

      // Fetch calendar list first if we don't have it loaded yet to sync Administrativos Pronautic
      let currentCalendars = calendars;
      if (currentCalendars.length === 0) {
        try {
          const listRes = await fetch(
            "https://www.googleapis.com/calendar/v3/users/me/calendarList",
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            },
          );
          if (listRes.ok) {
            const listData = await listRes.json();
            const rawCals = listData.items || [];
            currentCalendars = rawCals.map((c: any) => ({
              id: c.id,
              summary: c.summary,
              primary: c.primary || false,
              backgroundColor: c.backgroundColor || "#4f46e5",
            }));
            setCalendars(currentCalendars);

            // Condición ideal: Seleccionar todos los calendarios por defecto
            setSelectedCalIds(currentCalendars.map((c: any) => c.id));
          } else {
            console.warn("Could not retrieve calendar list");
            currentCalendars = [
              {
                id: "primary",
                summary: "Calendario Principal (Pronautic)",
                primary: true,
                backgroundColor: "#4f46e5",
              },
            ];
            setCalendars(currentCalendars);
            setSelectedCalIds(["primary"]);
          }
        } catch (err) {
          console.error("Error fetching Google Calendar list:", err);
          currentCalendars = [
            {
              id: "primary",
              summary: "Calendario Principal (Pronautic)",
              primary: true,
              backgroundColor: "#4f46e5",
            },
          ];
          setCalendars(currentCalendars);
          setSelectedCalIds(["primary"]);
        }
      }

      // Query events for ALL selected calendars
      let fetchedEvents: CalendarEvent[] = [];
      const calIdsToQuery =
        selectedCalIds.length > 0 ? selectedCalIds : ["primary"];

      for (const calId of calIdsToQuery) {
        try {
          const calendarUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events?timeMin=${encodeURIComponent(timeMin.toISOString())}&timeMax=${encodeURIComponent(timeMax.toISOString())}&singleEvents=true&orderBy=startTime`;

          const calendarRes = await fetch(calendarUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (calendarRes.ok) {
            const calData = await calendarRes.json();
            const items = (calData.items || []).map((e: any) => ({
              ...e,
              calendarId: calId,
              calendarName:
                currentCalendars.find((c) => c.id === calId)?.summary ||
                "Calendario",
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
        const startA = new Date(
          a.start?.dateTime || a.start?.date || 0,
        ).getTime();
        const startB = new Date(
          b.start?.dateTime || b.start?.date || 0,
        ).getTime();
        return startA - startB;
      });

      setEvents(fetchedEvents);

      // Keep selectedEvent detail updated in case info changed
      setSelectedEvent((current) => {
        if (!current) return null;
        return fetchedEvents.find((e) => e.id === current.id) || current;
      });

      // 2. Load Google Task lists
      const taskListsRes = await fetch(
        "https://tasks.googleapis.com/tasks/v1/users/@me/lists",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      let fetchedTasks: GoogleTask[] = [];
      if (taskListsRes.ok) {
        const listData = await taskListsRes.json();
        const lists: GoogleTaskList[] = listData.items || [];
        setTaskLists(lists);

        // Fetch up to 4 task lists
        for (const list of lists.slice(0, 4)) {
          const taskUrl = `https://tasks.googleapis.com/tasks/v1/lists/${list.id}/tasks?showCompleted=true&showHidden=false`;
          const singleListRes = await fetch(taskUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (singleListRes.ok) {
            const singleListData = await singleListRes.json();
            const rawTasks: GoogleTask[] = singleListData.items || [];

            // Annotate tasks with both list Title and list ID (for task mutations)
            const annotated = rawTasks.map((t) => ({
              ...t,
              listId: list.id,
              listTitle: list.title,
            }));
            fetchedTasks.push(...annotated);
          }
        }
        setTasks(fetchedTasks);
      } else {
        console.warn(
          "Could not retrieve google task lists:",
          taskListsRes.statusText,
        );
      }

      // 3. Immediately trigger AI Analysis of the loaded data for the selected range!
      const finalEventsToAnalyze = fetchedEvents.map((e) => {
        const overrides = eventOverrides[e.id];
        return overrides ? { ...e, ...overrides } : e;
      });
      triggerAIAnalysis(finalEventsToAnalyze, fetchedTasks);
      setLastSyncTime(new Date());
    } catch (err: any) {
      console.error("Workspace fetch error:", err);
      setErrorText(
        "No se pudo conectar a los servicios de Workspace. Vuelve a intentarlo.",
      );
    } finally {
      setIsLoadingData(false);
    }
  };

  const triggerAIAnalysis = async (
    currentEvents: CalendarEvent[],
    currentTasks: GoogleTask[],
  ) => {
    setIsLoadingAnalysis(true);
    try {
      const response = await fetch("/api/analyze-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          events: currentEvents,
          tasks: currentTasks,
          userLocalTime: new Date().toISOString(),
        }),
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
        summary:
          "Hoy tienes un conjunto de actividades y tareas interesantes. Prepárate con calma para equilibrar tu tiempo de la mejor manera.",
        focus: "Enfoque general del día",
        conflicts: [],
        tasksSynergy: [
          "Intenta agrupar tus tareas secundarias entre los bloques del calendario.",
        ],
        timeDistribution: { meetings: 30, taskWork: 50, breaks: 20 },
        suggestedTimeline: [
          {
            timeSlot: "Mañana",
            activity: "Planificación del día y revisión silenciosa",
          },
          { timeSlot: "Tarde", activity: "Ejecución de tareas importantes" },
          { timeSlot: "Fin de jornada", activity: "Desconexión y balance" },
        ],
        motivationalQuote:
          "Un día a la vez, con método y calma se llega lejos.",
      });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handlePrintSGC = () => {
    // Determine if we are inside a cross-origin iframe (AI Studio preview check)
    let isIframe = false;
    try {
      isIframe = window.self !== window.top;
    } catch (e) {
      isIframe = true; // Cross-origin error means it's an iframe
    }

    if (isIframe) {
      // In AI Studio iframe, window.print() is often blocked.
      setShowPrintWarning(true);
      // Try to print anyway after showing the warning, in case it's allowed
      setTimeout(() => {
        try {
          window.print();
        } catch (e) {
          console.error(e);
        }
      }, 500);

      // Auto-hide the warning after 8 seconds
      setTimeout(() => setShowPrintWarning(false), 8000);
    } else {
      window.print();
    }
  };

  const handleExportToSheets = async () => {
    if (!analysis) return;
    if (!token) {
      alert(
        "Por favor, inicia sesión con Google para sincronizar con Google Sheets.",
      );
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
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!metadataRes.ok) {
        throw new Error(
          `Error recuperando estructura del documento (${metadataRes.status})`,
        );
      }

      const metadata = await metadataRes.json();
      const targetSheet = (metadata.sheets || []).find(
        (sheet: any) => sheet.properties?.sheetId === 0,
      );

      const targetTitle = targetSheet?.properties?.title || "Sheet1";

      // 2. Prepare visual analysis metadata
      const rows = [
        ["FECHA DEL ANÁLISIS", new Date().toLocaleString("es-ES")],
        ["RANGO PLANIFICADO", viewRange.toUpperCase()],
        ["ENFOQUE PRINCIPAL DE IA", analysis.focus],
        ["RESUMEN DE JORNADA", analysis.summary],
        ["CONSEJO MOTIVACIONAL", analysis.motivationalQuote],
        [
          "CONFLICTOS DETECTADOS",
          analysis.conflicts && analysis.conflicts.length > 0
            ? analysis.conflicts.join("\n")
            : "Ninguno",
        ],
        [
          "SINERGIAS PROPUESTAS",
          analysis.tasksSynergy && analysis.tasksSynergy.length > 0
            ? analysis.tasksSynergy.join("\n")
            : "Ninguna",
        ],
        [],
        ["--- CRONOGRAMA INTEGRADO SUGERIDO POR IA ---"],
        ["Hora / Jornada", "Actividades del Curso o Tareas"],
        ...(analysis.suggestedTimeline || []).map((item) => [
          item.timeSlot,
          item.activity,
        ]),
        [],
        ["-------------------------------------------------"],
        [],
      ];

      // 3. Append to correct sheet
      const appendRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(targetTitle)}'!A1:append?valueInputOption=USER_ENTERED`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            values: rows,
          }),
        },
      );

      if (!appendRes.ok) {
        const errorData = await appendRes.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message ||
            `Error insertando filas (${appendRes.status})`,
        );
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
    setEventTaskLinks((prev) => {
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
    setEventTaskLinks((prev) => {
      const current = prev[eventId] || [];
      const filtered = current.filter((id) => id !== taskId);
      const updated = { ...prev, [eventId]: filtered };
      localStorage.setItem("event_task_relationships", JSON.stringify(updated));
      return updated;
    });
  };

  const handleUnlinkTaskCard = (eventId: string, taskId: string) => {
    setEventTaskLinks((prev) => {
      const current = prev[eventId] || [];
      const filtered = current.filter((id) => id !== taskId);
      const updated = { ...prev, [eventId]: filtered };
      localStorage.setItem("event_task_relationships", JSON.stringify(updated));
      return updated;
    });
  };

  const handleToggleTaskStatus = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const listId = (task as any).listId || "@default";
    const nextStatus =
      task.status === "completed" ? "needsAction" : "completed";

    // Optimistically update locally
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: nextStatus as any,
              completed:
                nextStatus === "completed"
                  ? new Date().toISOString()
                  : undefined,
            }
          : t,
      ),
    );

    if (token) {
      try {
        const patchUrl = `https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks/${taskId}`;
        await fetch(patchUrl, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: taskId,
            status: nextStatus,
          }),
        });
      } catch (error) {
        console.error(
          "No se pudo sincronizar el estado de la tarea en Google Tasks",
          error,
        );
      }
    }
  };

  // Scanning existing attendees and creators/organizers to define instructor list dynamically
  const teacherEmails = useMemo(() => {
    const emails = new Set<string>();
    mergedEvents.forEach((e) => {
      if (e.creator?.email) emails.add(e.creator.email);
      if (e.organizer?.email) emails.add(e.organizer.email);
      e.attendees?.forEach((a) => {
        if (a.email) emails.add(a.email);
      });
    });
    // Return all email addresses gathered, ensuring logged in user has priority position
    const result = Array.from(emails).filter(
      (email) => email && email.includes("@"),
    );
    if (user?.email && !result.includes(user.email)) {
      result.unshift(user.email);
    }
    return result;
  }, [mergedEvents, user]);

  const activeTeacherEmail =
    teacherEmailFilter === "custom" ? customTeacherEmail : teacherEmailFilter;

  const getInstructorAvailabilityAndQualification = useCallback(
    (instructorNameOrEmail: string | undefined, event: CalendarEvent) => {
      if (!instructorNameOrEmail || !instructorNameOrEmail.trim()) {
        return {
          status: "none",
          isQualified: false,
          hasAvailability: false,
          message: "Sin instructor asignado",
        };
      }

      const valueLower = instructorNameOrEmail.trim().toLowerCase();

      // Attempt to map names to some representative emails or just use the lowercase string as key
      let matchKey = valueLower;
      if (valueLower.includes("carlos") || valueLower.includes("peralta")) {
        matchKey = "carlos@pronautic.com";
      } else if (valueLower.includes("marta") || valueLower.includes("bosch")) {
        matchKey = "marta@pronautic.com";
      } else if (
        valueLower.includes("javier") ||
        valueLower.includes("romero")
      ) {
        matchKey = "javier@pronautic.com";
      } else if (
        valueLower.includes("sofía") ||
        valueLower.includes("sofia") ||
        valueLower.includes("alcorisa")
      ) {
        matchKey = "sofia@pronautic.com";
      } else if (valueLower.includes("eduardo")) {
        matchKey = "eduardo@pronautic.com";
      } else if (
        valueLower.includes("robert") ||
        valueLower.includes("instructorspronautic")
      ) {
        matchKey = "instructorspronautic@gmail.com";
      } else if (
        valueLower.includes("raquel") ||
        valueLower.includes("bopronautic")
      ) {
        matchKey = "bopronautic@gmail.com";
      }

      // Try to find if user registered their credentials
      const foundEmail = teacherEmails.find(
        (email) =>
          email.toLowerCase() === valueLower ||
          email.toLowerCase().split("@")[0] === valueLower ||
          valueLower.includes(email.toLowerCase().split("@")[0]),
      );
      if (foundEmail) {
        matchKey = foundEmail.toLowerCase();
      }

      const qualifications =
        teacherQualifications[matchKey] ||
        teacherQualifications[valueLower] ||
        [];

      // Identify what kind of course this event matches
      const summaryLower = (event.summary || "").toLowerCase();
      const alloc = eventResources[event.id];
      const courseCode = (alloc?.codigoCurso || "").toLowerCase();
      const courseType = (alloc?.tipoCurso || "").toLowerCase();

      let matchedCourseId = "";
      if (
        courseType.includes("stcw") ||
        summaryLower.includes("stcw") ||
        courseCode.includes("stcw") ||
        summaryLower.includes("seguridad") ||
        summaryLower.includes("básica") ||
        summaryLower.includes("basica")
      ) {
        matchedCourseId = "stcw-fb";
      } else if (
        summaryLower.includes("gmdss") ||
        summaryLower.includes("socorro") ||
        courseCode.includes("gmdss") ||
        summaryLower.includes("radio")
      ) {
        matchedCourseId = "stcw-gmdss";
      } else if (
        summaryLower.includes("per") ||
        courseType.includes("per") ||
        courseCode.includes("per")
      ) {
        if (summaryLower.includes("vela")) {
          matchedCourseId = "per-vela";
        } else {
          matchedCourseId = "per-motor";
        }
      } else if (
        summaryLower.includes("pnb") ||
        courseType.includes("pnb") ||
        courseCode.includes("pnb")
      ) {
        matchedCourseId = "pnb";
      } else if (
        summaryLower.includes("licencia") ||
        summaryLower.includes("titulín") ||
        summaryLower.includes("titulin") ||
        courseType.includes("lic") ||
        summaryLower.includes("navegación")
      ) {
        matchedCourseId = "ln";
      } else if (
        summaryLower.includes("yate") ||
        courseType.includes("py") ||
        courseCode.includes("py")
      ) {
        if (
          summaryLower.includes("capitán") ||
          summaryLower.includes("capitan") ||
          courseType.includes("cy")
        ) {
          matchedCourseId = "cy";
        } else {
          matchedCourseId = "py";
        }
      }

      // Is the instructor certified for this course?
      const hasQualificationsRegistered = qualifications.length > 0;
      const isCertified =
        !hasQualificationsRegistered ||
        (matchedCourseId ? qualifications.includes(matchedCourseId) : true);

      // Get event start/end
      const eventStartStr = event.start?.dateTime || event.start?.date;
      const eventEndStr = event.end?.dateTime || event.end?.date;

      if (!eventStartStr) {
        return {
          status: "unknown",
          isQualified: isCertified,
          hasAvailability: false,
          message: "Fecha del curso no determinada",
        };
      }

      const eventStart = new Date(eventStartStr);
      const eventEnd = eventEndStr ? new Date(eventEndStr) : eventStart;

      // Check availability overlaps
      const instructorAvails = availabilities.filter((a) => {
        const emailMatch =
          a.teacherEmail.toLowerCase() === matchKey ||
          a.teacherEmail.toLowerCase() === valueLower;
        const prefixMatch =
          a.teacherEmail.toLowerCase().split("@")[0] === matchKey.split("@")[0];
        return emailMatch || prefixMatch;
      });

      const hasAvailability = instructorAvails.some((avail) => {
        const availStart = new Date(avail.startDate + "T00:00:00");
        const availEnd = new Date(avail.endDate + "T23:59:59");
        return eventStart >= availStart && eventEnd <= availEnd;
      });

      if (isCertified && hasAvailability) {
        return {
          status: "available_and_qualified",
          isQualified: true,
          hasAvailability: true,
          message: "✓ Instructor homologado y disponible para este curso",
        };
      } else if (!isCertified && hasAvailability) {
        return {
          status: "available_not_qualified",
          isQualified: false,
          hasAvailability: true,
          message: "⚠️ Disponible, pero sin habilitación de curso registrada",
        };
      } else if (isCertified && !hasAvailability) {
        return {
          status: "qualified_no_availability",
          isQualified: true,
          hasAvailability: false,
          message: "⚠️ Habilitado, pero fuera de rango de disponibilidad",
        };
      } else {
        return {
          status: "none",
          isQualified: false,
          hasAvailability: false,
          message:
            "⚠️ Sin habilitación ni disponibilidad registrada para este curso",
        };
      }
    },
    [teacherEmails, teacherQualifications, availabilities, eventResources],
  );

  // Render events filtered based on Active Role (Problem 2: external teachers view only added activities)
  const displayEvents = useMemo(() => {
    let filtered = mergedEvents;
    if (userRole === "teacher") {
      filtered = mergedEvents.filter((e) => {
        if (!activeTeacherEmail) return false;
        const tLower = activeTeacherEmail.toLowerCase();
        const isCreator = e.creator?.email?.toLowerCase() === tLower;
        const isOrganizer = e.organizer?.email?.toLowerCase() === tLower;
        const isAttendee = e.attendees?.some(
          (a) => a.email?.toLowerCase() === tLower,
        );
        const inTitle = (e.summary || "").toLowerCase().includes(tLower);
        const inDesc = (e.description || "").toLowerCase().includes(tLower);
        return isCreator || isOrganizer || isAttendee || inTitle || inDesc;
      });
    }

    if (showOnlyCourses) {
      filtered = filtered.filter((e) => {
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
      filtered = filtered.filter(
        (e) => eventResources[e.id]?.aula === selectedAulaFilter,
      );
    }

    if (selectedEmbarcacionFilter) {
      filtered = filtered.filter(
        (e) => eventResources[e.id]?.embarcacion === selectedEmbarcacionFilter,
      );
    }

    return filtered;
  }, [
    mergedEvents,
    userRole,
    activeTeacherEmail,
    showOnlyCourses,
    selectedAulaFilter,
    selectedEmbarcacionFilter,
    eventResources,
  ]);

  // Render tasks filtered based on Active Role + active filters (Problem 2: external teachers only view tasks linked to their events!)
  const displayTasks = useMemo(() => {
    const { timeMin: rangeMin, timeMax: rangeMax } = getRangeConfig(
      focusDate,
      viewRange,
    );
    return tasks.filter((task) => {
      // 1. Check date range filter if enabled
      if (onlyShowRangeTasks) {
        if (!task.due) return false;
        try {
          const dueTime = new Date(task.due).getTime();
          if (dueTime < rangeMin.getTime() || dueTime > rangeMax.getTime())
            return false;
        } catch {
          return false;
        }
      }

      // 2. Check Role Filter (External Teacher mode only shows tasks linked to visible displayEvents)
      if (userRole === "teacher") {
        const isLinkedToVisibleEvent = displayEvents.some((event) => {
          const linkedIds = eventTaskLinks[event.id] || [];
          return linkedIds.includes(task.id);
        });
        return isLinkedToVisibleEvent;
      }

      return true;
    });
  }, [
    tasks,
    onlyShowRangeTasks,
    userRole,
    displayEvents,
    eventTaskLinks,
    focusDate,
    viewRange,
  ]);

  const displayCourses = useMemo(() => {
    return mergedEvents.filter((e) => {
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

  // Dynamic list of monthly activities filtered and computed for Document Generation SGC
  const docFilteredEvents = useMemo(() => {
    const filtered = mergedEvents.filter((e) => {
      // 1. Filter dynamically by selected year and month (or current visible period if docMonth === -1)
      const startStr = e.start?.dateTime || e.start?.date;
      if (!startStr) return false;
      const startD = new Date(startStr);
      const matchesPeriod =
        docMonth === -1 ||
        (startD.getFullYear() === docYear && startD.getMonth() === docMonth);
      if (!matchesPeriod) return false;

      // 2. Filter by selected calendars (docCalFilter)
      if (docCalFilter.length > 0) {
        const calId = e.calendarId || "primary";
        if (!docCalFilter.includes(calId)) return false;
      }

      // 3. Filter by Activity Type (docTypeFilter)
      if (docTypeFilter !== "all") {
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

        if (docTypeFilter === "courses" && !isCourse) return false;
        if (docTypeFilter === "other" && isCourse) return false;
      }

      // 4. Filter by Aula Assigned (docAulaFilter)
      if (docAulaFilter !== "all") {
        const allocatedAula = eventResources[e.id]?.aula || e.location || "";
        if (allocatedAula !== docAulaFilter) return false;
      }

      // 5. Filter by Embarcación Assigned (docEmbarcacionFilter)
      if (docEmbarcacionFilter !== "all") {
        const allocatedBoat = eventResources[e.id]?.embarcacion || "Ninguna";
        if (allocatedBoat !== docEmbarcacionFilter) return false;
      }

      // 6. Filter by Instructor Assigned (docInstructorFilter)
      if (docInstructorFilter !== "all") {
        const allocatedInstructor =
          eventResources[e.id]?.instructor || "instructorspronautic@gmail.com";
        const isOrganizer =
          e.organizer?.email?.toLowerCase() ===
          docInstructorFilter.toLowerCase();
        const isCreator =
          e.creator?.email?.toLowerCase() === docInstructorFilter.toLowerCase();
        const isAttendee = e.attendees?.some(
          (a) => a.email?.toLowerCase() === docInstructorFilter.toLowerCase(),
        );

        if (
          allocatedInstructor.toLowerCase() !==
            docInstructorFilter.toLowerCase() &&
          !isOrganizer &&
          !isCreator &&
          !isAttendee
        ) {
          return false;
        }
      }

      // 7. Filter by Text Search (docSearchQuery)
      if (docSearchQuery.trim()) {
        const q = docSearchQuery.toLowerCase();
        const inTitle = (e.summary || "").toLowerCase().includes(q);
        const inDesc = (e.description || "").toLowerCase().includes(q);
        const inLoc = (e.location || "").toLowerCase().includes(q);
        const inCal = (e.calendarName || "").toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inLoc && !inCal) return false;
      }

      return true;
    });

    // Sort chronologically by start date
    return [...filtered].sort((a, b) => {
      const tA = new Date(a.start?.dateTime || a.start?.date || 0).getTime();
      const tB = new Date(b.start?.dateTime || b.start?.date || 0).getTime();
      return tA - tB;
    });
  }, [
    mergedEvents,
    docMonth,
    docYear,
    docCalFilter,
    docTypeFilter,
    docAulaFilter,
    docEmbarcacionFilter,
    docInstructorFilter,
    docSearchQuery,
    eventResources,
  ]);

  // Helper to read start and end times in ms
  const getEventTimes = (e: CalendarEvent) => {
    const startStr = e.start?.dateTime || e.start?.date;
    const endStr = e.end?.dateTime || e.end?.date;
    if (!startStr) return null;
    const startTime = new Date(startStr).getTime();
    let endTime = endStr
      ? new Date(endStr).getTime()
      : startTime + 60 * 60 * 1000;
    if (endTime <= startTime) {
      endTime = startTime + 60 * 60 * 1000;
    }
    return { startTime, endTime };
  };

  // Find all active resource conflicts in the current displayed events across Aulas, Embarcaciones and Materials
  const globalConflicts = useMemo(() => {
    const conflictsList: Array<{
      eventA: CalendarEvent;
      eventB: CalendarEvent;
      reason: string;
    }> = [];
    const seenPairs = new Set<string>();

    for (let i = 0; i < mergedEvents.length; i++) {
      for (let j = i + 1; j < mergedEvents.length; j++) {
        const eA = mergedEvents[i];
        const eB = mergedEvents[j];

        const timesA = getEventTimes(eA);
        const timesB = getEventTimes(eB);
        if (!timesA || !timesB) continue;

        // Check if both events happen on the exact same day
        const dateA = new Date(timesA.startTime);
        const dateB = new Date(timesB.startTime);
        const isSameDay =
          dateA.getFullYear() === dateB.getFullYear() &&
          dateA.getMonth() === dateB.getMonth() &&
          dateA.getDate() === dateB.getDate();

        // Also check if they overlap in time (for multi-day events)
        const isOverlappingTime =
          timesA.startTime < timesB.endTime &&
          timesA.endTime > timesB.startTime;

        // We consider a clash if they happen on the same day OR they overlap in time bounds
        const isClashing = isSameDay || isOverlappingTime;

        if (!isClashing) continue;

        const allocA = eventResources[eA.id];
        const allocB = eventResources[eB.id];
        if (!allocA || !allocB) continue;

        // Classroom overlap
        if (
          allocA.aula &&
          allocA.aula !== "Ninguno" &&
          allocA.aula !== "Ninguna" &&
          allocA.aula === allocB.aula
        ) {
          const pairKey = [eA.id, eB.id].sort().join("-");
          if (!seenPairs.has(pairKey)) {
            seenPairs.add(pairKey);
            conflictsList.push({
              eventA: eA,
              eventB: eB,
              reason: `El aula '${allocA.aula}' está asignada a ambas actividades el mismo día.`,
            });
          }
        }

        // Embarcacion overlap
        if (
          allocA.embarcacion &&
          allocA.embarcacion !== "Ninguno" &&
          allocA.embarcacion !== "Ninguna" &&
          allocA.embarcacion === allocB.embarcacion
        ) {
          const pairKey = [eA.id, eB.id].sort().join("-");
          if (!seenPairs.has(pairKey)) {
            seenPairs.add(pairKey);
            conflictsList.push({
              eventA: eA,
              eventB: eB,
              reason: `La embarcación '${allocA.embarcacion}' está asignada a ambas actividades el mismo día.`,
            });
          }
        }

        // Instructor overlap
        if (
          allocA.instructor &&
          allocA.instructor !== "Ninguno" &&
          allocA.instructor !== "Ninguna" &&
          allocA.instructor === allocB.instructor
        ) {
          const pairKey = [eA.id, eB.id].sort().join("-");
          if (!seenPairs.has(pairKey)) {
            seenPairs.add(pairKey);
            conflictsList.push({
              eventA: eA,
              eventB: eB,
              reason: `El docente '${allocA.instructor}' está asignado a ambas actividades el mismo día.`,
            });
          }
        }

        // Materials overlap
        if (allocA.materials && allocB.materials) {
          const shared = allocA.materials.filter((m) =>
            allocB.materials.includes(m),
          );
          if (shared.length > 0) {
            const pairKey = [eA.id, eB.id].sort().join("-");
            if (!seenPairs.has(pairKey)) {
              seenPairs.add(pairKey);
              conflictsList.push({
                eventA: eA,
                eventB: eB,
                reason: `Equipos en uso simultáneo: '${shared.join(", ")}' se asignó a ambos compromisos.`,
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
      return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const getEventInstructor = (event: CalendarEvent) => {
    if (event.description) {
      const match = event.description.match(
        /(?:Instructor|Profesor|Docente|Ponente|Profe|Instructora|Profesora|Docentes):\s*([^\n\r<]+)/i,
      );
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    if (event.summary) {
      const match = event.summary.match(
        /(?:Instructor|Profesor|Docente|Ponente):\s*([^\n\r()]+)/i,
      );
      if (match && match[1]) {
        return match[1].trim();
      }
      const matchNoColon = event.summary.match(
        /(?:Instructor|Profesor|Docente|Ponente|Profe|Instructor:)\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)/i,
      );
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
    event.attendees?.forEach((a) => {
      if (a.email) emails.add(a.email);
    });

    const emailArr = Array.from(emails).filter(
      (email) => email && email.includes("@"),
    );

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
    if (!teacherEmail)
      return { status: "no_teacher", label: "Sin Instructor Vinculado" };

    const teacherAvails = availabilities.filter(
      (a) =>
        a.teacherEmail.trim().toLowerCase() ===
        teacherEmail.trim().toLowerCase(),
    );

    if (teacherAvails.length === 0) {
      return {
        status: "no_records",
        label: `Falta registrar disponibilidad (${teacherEmail})`,
      };
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
        return {
          status: "unavailable",
          label: "⚠ No se declaró disponible hoy",
        };
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

      const startFormattedDate = startDate.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      });
      const endFormattedDate = endDate.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      });

      if (isAllDay) {
        if (startFormattedDate === endFormattedDate) {
          return startFormattedDate;
        }
        return `${startFormattedDate} – ${endFormattedDate}`;
      }

      const startFormattedTime = startDate.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const endFormattedTime = endDate.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return `${startFormattedDate} (${startFormattedTime}) – ${endFormattedDate} (${endFormattedTime})`;
    } catch {
      return "Fecha inválida";
    }
  };

  // Compute progress statistics for high density sidebar tracker
  const completedTasksCount = tasks.filter(
    (t) => t.status === "completed",
  ).length;
  const totalTasksCount = tasks.length;
  const progressPercent =
    totalTasksCount > 0
      ? Math.round((completedTasksCount / totalTasksCount) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-205 h-16 flex items-center justify-between px-6 shrink-0 shadow-xs">
        <div className="flex items-center gap-3.5">
          <PronauticLogo variant="compact" className="h-9" />
          <div className="hidden min-w-[1px] h-6 bg-slate-200 sm:block"></div>
          <div className="hidden sm:block">
            <h1 className="text-xs font-black text-[#1D3D58] tracking-widest uppercase font-sans leading-none">
              Copilot
            </h1>
            <span className="text-[8.5px] text-[#E04F34] font-black font-mono tracking-wider uppercase mt-1 block leading-none">
              Cumplimiento legal y GSuite
            </span>
          </div>
        </div>

        {/* Team Applet Link - Copy to Clipboard */}
        <div className="hidden lg:flex items-center gap-2 bg-indigo-50/70 border border-indigo-150 rounded-xl px-3 py-1.5 text-xs text-indigo-900 shadow-4xs">
          <Link2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="font-bold tracking-tight text-slate-700">
            Enlace del Equipo:
          </span>
          <span className="font-semibold text-slate-500 max-w-[180px] lg:max-w-[220px] truncate select-all text-[11px] font-mono leading-none">
            fea1146b-d405-46f4-8e37-13442745c4ca
          </span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(
                "https://aistudio.google.com/apps/fea1146b-d405-46f4-8e37-13442745c4ca?fullscreenApplet=true&showPreview=true&showAssistant=true",
              );
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
            {/* Circular Logo Badge at top-right of Workspace page */}
            <div className="flex items-center gap-2 border border-slate-150 p-1.5 rounded-xl bg-slate-50">
              <PronauticLogo variant="circular" className="w-[34px] h-[34px]" />
              <div className="hidden xl:flex flex-col text-left leading-none pr-1">
                <span className="text-[8.5px] font-black tracking-widest text-[#1D3D58] uppercase font-sans">
                  PRONAUTIC
                </span>
                <span className="text-[7.5px] text-[#E04F34] font-black font-mono tracking-widest mt-1">
                  COPILOT
                </span>
              </div>
            </div>

            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-black text-slate-850 leading-none flex items-center gap-1 justify-end">
                {isRober || isRaquel ? (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                      isRober
                        ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                        : "bg-purple-100 text-purple-700 border border-purple-200"
                    }`}
                  >
                    {isRober ? "Robert" : "Raquel"}
                  </span>
                ) : null}
                {userName}
              </span>
              <span className="text-[9px] text-slate-400 font-bold font-mono mt-1">
                {user.email}
              </span>
            </div>

            {userAvatarUrl ? (
              <img
                referrerPolicy="no-referrer"
                src={userAvatarUrl}
                alt={userName}
                className={`w-10 h-10 rounded-full border-2 ${
                  isRober
                    ? "border-indigo-400"
                    : isRaquel
                      ? "border-purple-400"
                      : "border-slate-200"
                } shadow-sm`}
              />
            ) : (
              <div
                className={`h-10 w-10 ${
                  isRober
                    ? "bg-indigo-600"
                    : isRaquel
                      ? "bg-purple-600"
                      : "bg-slate-700"
                } text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm`}
              >
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
        /* Executive Split Screen Landing Panel - Pronautic Training Centre */
        <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50 overflow-hidden">
          {/* Left Panel: Clean Corporate Auth form */}
          <div className="w-full md:w-[45%] bg-white flex flex-col justify-between p-8 md:p-14 lg:p-16 relative z-10 shadow-xl border-r border-slate-100 shrink-0">
            {/* Top decorative element */}
            <div className="hidden md:block text-[10px] text-slate-400 font-mono tracking-widest font-extrabold uppercase select-none">
              Plataforma de Control de Flotas y Calidad
            </div>

            {/* Middle: Brand Logo and Login core */}
            <div className="my-auto space-y-10 py-6">
              {/* Pristine Crisp SVG Pronautic Logo */}
              <div className="flex justify-center transition-all duration-300">
                <PronauticLogo
                  variant="full"
                  className="scale-95 lg:scale-105"
                />
              </div>

              {/* Action Prompt */}
              <div className="space-y-3.5 text-center max-w-sm mx-auto">
                <h2 className="text-lg font-black text-[#1D3D58] tracking-tight">
                  Acceso Oficial de Personal
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Inicia sesión con tu cuenta de correo corporativo para acceder
                  a tu agenda de cursos, auditorías de calidad de la DGMM y
                  asignaciones de embarcaciones.
                </p>
              </div>

              {/* Sign In Button Container */}
              <div className="max-w-xs mx-auto space-y-4">
                <button
                  id="btn-google-login"
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-[#1D3D58] cursor-pointer font-extrabold text-sm shadow-sm hover:shadow-md transition-all active:scale-98 disabled:opacity-50 select-none"
                >
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="w-5 h-5 block shrink-0"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    ></path>
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    ></path>
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    ></path>
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    ></path>
                  </svg>
                  <span>Conectar GSuite Workspace</span>
                </button>

                {isLoggingIn && (
                  <p className="text-center text-xs text-indigo-600/70 font-bold font-mono animate-pulse">
                    Enlazando conexión segura...
                  </p>
                )}

                {errorText && (
                  <p className="text-xs text-red-500 text-center bg-red-50 p-3 rounded-xl border border-red-150 leading-relaxed font-semibold">
                    {errorText}
                  </p>
                )}
              </div>

              {/* Segregated Access & Integrated Coordination Notice */}
              <div className="max-w-sm mx-auto p-4 bg-slate-50/80 rounded-xl border border-slate-150/50 text-[11px] text-slate-500 space-y-1">
                <p className="font-extrabold text-[#1D3D58] uppercase tracking-wider text-[9px] font-mono">
                  Coordinación Operativa Integrada
                </p>
                <p className="leading-relaxed">
                  Plataforma inteligente de coordinación y gestión operativa
                  para la formación marítima profesional, integrando cursos,
                  aulas, flota, simuladores y recursos docentes en un único
                  entorno centralizado.
                </p>
              </div>
            </div>

            {/* Bottom footnote */}
            <div className="text-center text-[10px] text-slate-400 font-medium">
              © 2026 Pronautic Training Centre • Gestión Inteligente y
              Regulación de Calidad
            </div>
          </div>

          {/* Right Panel: Widescreen Sailing Background Image w/ geometric overlay */}
          <div className="hidden md:flex flex-1 relative bg-[#1D3D58] overflow-hidden items-center justify-end">
            {/* The generated high quality sailing deck image */}
            <img
              referrerPolicy="no-referrer"
              src={pronauticSailImage}
              alt="Sailboat in deep waters"
              className="absolute inset-0 object-cover w-full h-full mix-blend-luminosity opacity-85"
            />
            {/* Dark rich maritime overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#1D3D58]/95 via-[#1D3D58]/45 to-transparent shadow-inner"></div>

            {/* Abstract blue/sky geometric overlay decoration mimicking classic corporate designs */}
            <div className="absolute top-0 right-0 bottom-0 w-2/3 bg-gradient-to-l from-sky-400/20 via-sky-500/5 to-transparent skew-x-12 translate-x-24 pointer-events-none" />

            {/* Centerpiece pristine white circular brand logo showcase */}
            <div className="relative mr-12 lg:mr-24 bg-white p-6 rounded-full shadow-2xl hover:scale-103 transition-all duration-500 border-[6px] border-[#1D3D58] flex items-center justify-center shrink-0">
              <PronauticLogo
                variant="circular"
                className="w-56 h-56 md:w-64 md:h-64"
              />
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
                <span className="text-slate-400 font-semibold text-[10.5px]">
                  Inspector de Sesión:
                </span>
                <div className="flex items-center gap-1.5 bg-slate-800/80 rounded-full pl-1.5 pr-2.5 py-0.5 border border-slate-700/60 shadow-3xs">
                  {userAvatarUrl ? (
                    <img
                      src={userAvatarUrl}
                      alt={userName}
                      className="w-4.5 h-4.5 rounded-full border border-white/40 shrink-0"
                    />
                  ) : null}
                  <strong className="text-white font-extrabold text-[10.5px] font-sans">
                    {userName}{" "}
                    <span className="font-semibold text-[9px] text-indigo-300 ml-1">
                      ({userRoleLabel} - {user?.email})
                    </span>
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono tracking-wider uppercase font-extrabold text-slate-400">
                  Módulo Activo:
                </span>
                <strong
                  className={`font-black tracking-tight text-[11px] uppercase ${
                    activeTab === "ai"
                      ? "text-sky-400"
                      : activeTab === "calendar"
                        ? "text-indigo-300"
                        : activeTab === "doc-generator"
                          ? "text-teal-400"
                          : activeTab === "stats"
                            ? "text-blue-400"
                            : activeTab === "tickets"
                              ? "text-rose-400"
                              : activeTab === "resources"
                                ? "text-amber-500"
                                : "text-emerald-400"
                  }`}
                >
                  {activeTab === "ai"
                    ? "✨ Resumen de IA"
                    : activeTab === "calendar"
                      ? "📅 Calendario / Diario"
                      : activeTab === "doc-generator"
                        ? "📋 Generador Autónomo"
                        : activeTab === "stats"
                          ? "📊 Métricas"
                          : activeTab === "tickets"
                            ? "📋 Hoja de Mejoras (Tickets)"
                            : activeTab === "resources"
                              ? "⚓ Directorio de Recursos"
                              : "📋 Auditoría y Tareas"}
                </strong>
              </div>

              {activeTab === "calendar" && (
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800/50 px-2.5 py-0.5 rounded-full border border-slate-700/50">
                  Período:{" "}
                  <span className="font-extrabold capitalize text-slate-200">
                    {viewRange}
                  </span>
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
                  {completedTasksCount} de {totalTasksCount} tareas completadas
                  ({progressPercent}%)
                </p>
              </div>

              {/* Sincronización de Calendarios - Pronautic */}
              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
                  Sincronización (Calendarios)
                </h3>

                {calendars.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic">
                    No hay más calendarios o cargando...
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        id="btn-select-all-calendars"
                        onClick={() => {
                          setSelectedCalIds(calendars.map((c) => c.id));
                        }}
                        className="text-[9.5px] font-black uppercase text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200/60 px-2 py-1 rounded-md transition-all cursor-pointer shadow-4xs text-center flex-1"
                      >
                        ✓ Seleccionar Todos
                      </button>
                      <button
                        type="button"
                        id="btn-select-primary-calendar"
                        onClick={() => {
                          const primary =
                            calendars.find((c) => c.primary) || calendars[0];
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
                                setSelectedCalIds((prev) => {
                                  if (isSelected) {
                                    if (prev.length <= 1) return prev; // Keep at least one selected
                                    return prev.filter((id) => id !== cal.id);
                                  } else {
                                    return [...prev, cal.id];
                                  }
                                });
                              }}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{
                                backgroundColor:
                                  cal.backgroundColor || "#4f46e5",
                              }}
                            />
                            <span
                              className="truncate font-semibold text-slate-700"
                              title={cal.summary}
                            >
                              {cal.primary
                                ? "Principal (Pronautic)"
                                : cal.summary}
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    {/* Pronautic Ideal Conditions Indicator Badge of Coverage */}
                    <div
                      className={`p-2.5 rounded-xl border text-[10.5px] leading-snug transition-all ${
                        calendars.length > 0 &&
                        selectedCalIds.length === calendars.length
                          ? "bg-emerald-50/70 text-emerald-800 border-emerald-200/65"
                          : "bg-amber-50/70 text-amber-800 border-amber-200/65"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5 font-bold">
                        <span className="flex items-center gap-1 font-extrabold uppercase text-[9.5px]">
                          {calendars.length > 0 &&
                          selectedCalIds.length === calendars.length
                            ? "🌟 Condición Ideal"
                            : "⚠️ Condición Parcial"}
                        </span>
                        {selectedCalIds.length < calendars.length && (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedCalIds(calendars.map((c) => c.id))
                            }
                            className="text-[9px] font-black uppercase text-amber-700 cursor-pointer underline hover:text-amber-900 bg-transparent border-0"
                          >
                            Hacer Ideal
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight select-none font-medium">
                        {calendars.length > 0 &&
                        selectedCalIds.length === calendars.length
                          ? "Todos los calendarios están seleccionados. Óptima auditoría de solapamientos."
                          : `${selectedCalIds.length} de ${calendars.length} calendarios activos. Puede haber colisiones no dectectadas.`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Control de Acceso (Perfiles Simulados / Integración Segura) */}
              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-500" />
                  Control de Acceso (Rol)
                </h3>

                {user === null || isCurrentUserAdmin ? (
                  <>
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
                          if (teacherEmails.length > 0 && !teacherEmailFilter) {
                            setTeacherEmailFilter(teacherEmails[0]);
                          } else if (
                            teacherEmails.length === 0 &&
                            !teacherEmailFilter
                          ) {
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
                            onChange={(e) =>
                              setTeacherEmailFilter(e.target.value)
                            }
                            className="w-full bg-white border border-slate-205 rounded p-1 text-[11px] font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                          >
                            {teacherEmails.map((email) => (
                              <option key={email} value={email}>
                                {email}
                              </option>
                            ))}
                            <option value="custom">
                              -- Escribir otro email --
                            </option>
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
                              onChange={(e) =>
                                setCustomTeacherEmail(e.target.value)
                              }
                              className="w-full bg-white border border-slate-205 rounded p-1.5 text-[11px] font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            />
                          </div>
                        )}
                        <p className="text-[9.5px] text-indigo-705 leading-tight font-extrabold flex items-center gap-1">
                          <Check className="w-3 h-3 text-indigo-600 shrink-0" />
                          Vista segregada del docente activa.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  /* Vista inmutable para usuarios Profesor que no son Administradores de la escuela */
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-400 uppercase tracking-widest text-[9px] font-mono">
                        Rol Asignado
                      </span>
                      <span className="bg-indigo-50 text-indigo-700 font-extrabold uppercase tracking-tight px-2 py-0.5 rounded border border-indigo-200/50 text-[9.5px]">
                        Profesor Docente
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-800 leading-tight">
                        {userName}
                      </p>
                      <p
                        className="text-[10px] text-slate-500 font-mono tracking-tight leading-none truncate"
                        title={user?.email || ""}
                      >
                        {user?.email}
                      </p>
                    </div>
                    <p className="text-[9.5px] text-slate-500 leading-relaxed italic bg-indigo-50/25 p-2 rounded border border-indigo-100/35">
                      Como docente oficial de Pronautic, tu acceso está
                      restringido de forma segura a tus cursos asignados y
                      convocatorias individuales. Solo verás las actividades del
                      calendario donde eres invitado.
                    </p>
                  </div>
                )}

                {userRole === "teacher" && (
                  <div className="space-y-3.5 mt-2.5">
                    {/* Habilitaciones de Cursos */}
                    <div className="pt-2.5 border-t border-indigo-100/60 space-y-2">
                      <p className="text-[9.5px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        Habilitaciones Docentes
                      </p>
                      <p className="text-[9px] text-slate-400 font-medium leading-none">
                        Marca todos los cursos que puedes impartir:
                      </p>

                      <div className="space-y-1 bg-white/70 p-2 rounded border border-indigo-100/70 max-h-48 overflow-y-auto shadow-4xs">
                        {PRONAUTIC_COURSES_CATALOG.map((course) => {
                          const activeEmail = (
                            teacherEmailFilter === "custom"
                              ? customTeacherEmail
                              : teacherEmailFilter
                          ).toLowerCase();
                          const qualifiedList =
                            teacherQualifications[activeEmail] || [];
                          const isChecked = qualifiedList.includes(course.id);

                          return (
                            <label
                              key={course.id}
                              className={`flex items-start gap-2 p-1.5 hover:bg-indigo-50/50 rounded-md cursor-pointer select-none text-[10px] text-slate-700 font-semibold border transition-all ${
                                isChecked
                                  ? "bg-emerald-50/50 border-emerald-100 text-emerald-950"
                                  : "bg-transparent border-transparent"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setTeacherQualifications((prev) => {
                                    const currentList = prev[activeEmail] || [];
                                    const newList = isChecked
                                      ? currentList.filter(
                                          (id) => id !== course.id,
                                        )
                                      : [...currentList, course.id];
                                    return {
                                      ...prev,
                                      [activeEmail]: newList,
                                    };
                                  });
                                }}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0 w-3 h-3 cursor-pointer mt-0.5"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="truncate leading-tight font-black text-slate-800">
                                  {course.name}
                                </p>
                                <span className="text-[8px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded border border-indigo-100">
                                  {course.code}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Registro de Disponibilidad Interactivo */}
                    <div className="pt-2.5 border-t border-indigo-100/60 space-y-2">
                      <p className="text-[9.5px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        {editingAvailId
                          ? "Modificar Disponibilidad"
                          : "Declarar Disponibilidad"}
                      </p>

                      <div
                        className={`space-y-2 p-2.5 rounded-lg border transition-all text-[10.5px] ${
                          editingAvailId
                            ? "bg-sky-50/50 border-sky-200 shadow-3xs"
                            : "bg-white/70 border-indigo-100 shadow-4xs"
                        }`}
                      >
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="space-y-0.5">
                            <label className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">
                              Desde
                            </label>
                            <input
                              type="date"
                              value={newAvailStart}
                              onChange={(e) => setNewAvailStart(e.target.value)}
                              className="w-full bg-white border border-slate-205 rounded px-1.5 py-0.5 text-[11px] font-semibold cursor-pointer"
                            />
                          </div>
                          <div className="space-y-0.5">
                            <label className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">
                              Hasta
                            </label>
                            <input
                              type="date"
                              value={newAvailEnd}
                              onChange={(e) => setNewAvailEnd(e.target.value)}
                              className="w-full bg-white border border-slate-205 rounded px-1.5 py-0.5 text-[11px] font-semibold cursor-pointer"
                            />
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <label className="text-[8px] font-bold text-slate-400 uppercase tracking-tight block">
                            Detalles/Notas
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. Disponible tardes, todo el día..."
                            value={newAvailNotes}
                            onChange={(e) => setNewAvailNotes(e.target.value)}
                            className="w-full bg-white border border-slate-205 rounded px-2 py-0.5 text-[11px] font-semibold text-slate-705 placeholder:text-slate-300"
                          />
                        </div>

                        {editingAvailId ? (
                          <div className="flex gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (!newAvailStart || !newAvailEnd) {
                                  alert("Por favor selecciona ambas fechas.");
                                  return;
                                }
                                const activeEmail =
                                  teacherEmailFilter === "custom"
                                    ? customTeacherEmail
                                    : teacherEmailFilter;
                                handleAddAvailability({
                                  teacherEmail: activeEmail,
                                  startDate: newAvailStart,
                                  endDate: newAvailEnd,
                                  notes: newAvailNotes,
                                });
                                setNewAvailStart("");
                                setNewAvailEnd("");
                                setNewAvailNotes("Disponible todo el día");
                              }}
                              className="flex-1 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded font-extrabold text-[10.5px] cursor-pointer transition-all text-center shadow-4xs"
                            >
                              Actualizar Período
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAvailId(null);
                                setNewAvailStart("");
                                setNewAvailEnd("");
                                setNewAvailNotes("Disponible todo el día");
                              }}
                              className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-bold text-[10.5px] cursor-pointer transition-all"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (!newAvailStart || !newAvailEnd) {
                                alert(
                                  "Por favor selecciona ambas fechas de inicio y fin para registrar tu disponibilidad.",
                                );
                                return;
                              }
                              const activeEmail =
                                teacherEmailFilter === "custom"
                                  ? customTeacherEmail
                                  : teacherEmailFilter;
                              if (!activeEmail) {
                                alert(
                                  "Por favor selecciona o especifica un correo electrónico de profesor.",
                                );
                                return;
                              }
                              handleAddAvailability({
                                teacherEmail: activeEmail,
                                startDate: newAvailStart,
                                endDate: newAvailEnd,
                                notes: newAvailNotes,
                              });
                              setNewAvailStart("");
                              setNewAvailEnd("");
                              setNewAvailNotes("Disponible todo el día");
                            }}
                            className="w-full mt-1.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-extrabold text-[10.5px] cursor-pointer transition-all active:scale-95 text-center shadow-4xs shrink-0"
                          >
                            Añadir Período
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Listado de Disponibilidades Declaradas por este profesor */}
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-mono font-bold text-slate-450 uppercase tracking-wider block">
                        Períodos Declarados por Ti
                      </p>
                      {(() => {
                        const activeEmail = (
                          teacherEmailFilter === "custom"
                            ? customTeacherEmail
                            : teacherEmailFilter
                        ).toLowerCase();
                        const teacherAvails = availabilities.filter(
                          (a) => a.teacherEmail.toLowerCase() === activeEmail,
                        );
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
                              <div
                                key={avail.id}
                                className={`p-1.5 border rounded-md flex items-center justify-between text-[10px] font-semibold shadow-4xs transition-all ${
                                  editingAvailId === avail.id
                                    ? "bg-sky-50 border-sky-300 text-sky-900 ring-2 ring-sky-100"
                                    : "bg-emerald-50 border-emerald-200/50 text-emerald-900"
                                }`}
                              >
                                <div className="min-w-0 flex-1 mr-1">
                                  <p className="font-bold shrink-0 truncate">
                                    {new Date(
                                      avail.startDate,
                                    ).toLocaleDateString("es-ES", {
                                      day: "numeric",
                                      month: "short",
                                    })}{" "}
                                    al{" "}
                                    {new Date(avail.endDate).toLocaleDateString(
                                      "es-ES",
                                      { day: "numeric", month: "short" },
                                    )}
                                  </p>
                                  {avail.notes && (
                                    <p className="text-[9px] text-slate-600 italic truncate max-w-[120px]">
                                      "{avail.notes}"
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingAvailId(avail.id);
                                      setNewAvailStart(avail.startDate);
                                      setNewAvailEnd(avail.endDate);
                                      setNewAvailNotes(avail.notes || "");
                                    }}
                                    className="text-indigo-600 hover:text-indigo-800 p-0.5 cursor-pointer text-[10.5px]"
                                    title="Editar este período"
                                  >
                                    📝
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteAvailability(avail.id)
                                    }
                                    className="text-red-500 hover:text-red-700 leading-none text-xs p-0.5 cursor-pointer font-bold"
                                    title="Eliminar este período"
                                  >
                                    ×
                                  </button>
                                </div>
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
                        <div
                          key={avail.id}
                          className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10.5px] leading-tight space-y-0.5"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className="font-bold text-slate-700 truncate max-w-[130px] font-mono"
                              title={avail.teacherEmail}
                            >
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
                            Del{" "}
                            {new Date(avail.startDate).toLocaleDateString(
                              "es-ES",
                              { day: "numeric", month: "short" },
                            )}{" "}
                            al{" "}
                            {new Date(avail.endDate).toLocaleDateString(
                              "es-ES",
                              { day: "numeric", month: "short" },
                            )}
                          </p>
                          {avail.notes && (
                            <p className="text-[9.5px] text-slate-505 italic mt-0.5">
                              "{avail.notes}"
                            </p>
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
                      <div
                        key={idx}
                        className="p-2 bg-red-50 rounded border border-red-100 text-[10px] font-semibold text-red-700 leading-tight"
                      >
                        <p className="font-extrabold line-clamp-1">
                          {conf.eventA.summary} vs {conf.eventB.summary}
                        </p>
                        <p className="text-[9.5px] font-medium text-slate-600 mt-0.5">
                          {conf.reason}
                        </p>
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
                  {tasks
                    .filter((t) => t.status === "needsAction")
                    .slice(0, 1)
                    .map((task) => (
                      <div
                        key={task.id}
                        className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r shadow-2xs"
                      >
                        <p className="text-[10px] font-bold text-red-700 uppercase tracking-tight">
                          Crítico
                        </p>
                        <p className="text-xs font-bold text-slate-800 leading-tight mt-0.5 truncate">
                          {task.title}
                        </p>
                        {task.due && (
                          <p className="text-[9px] text-red-500 font-mono mt-1">
                            Vence:{" "}
                            {new Date(task.due).toLocaleDateString("es-ES")}
                          </p>
                        )}
                      </div>
                    ))}

                  {/* Calendar Priority */}
                  {displayEvents.slice(0, 1).map((event) => (
                    <div
                      key={event.id}
                      className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r shadow-2xs"
                    >
                      <p className="text-[10px] font-bold text-blue-700 uppercase tracking-tight">
                        Trabajo
                      </p>
                      <p className="text-xs font-bold text-slate-800 leading-tight mt-0.5 truncate">
                        {event.summary}
                      </p>
                      <p className="text-[9px] text-blue-500 font-mono mt-1">
                        {event.start?.dateTime
                          ? formatTime(event.start.dateTime)
                          : "Todo el día"}
                      </p>
                    </div>
                  ))}

                  {/* Second calendar or secondary event */}
                  {displayEvents.length > 1 &&
                    displayEvents.slice(1, 2).map((event) => (
                      <div
                        key={event.id}
                        className="p-3 bg-purple-50 border-l-4 border-purple-500 rounded-r shadow-2xs"
                      >
                        <p className="text-[10px] font-bold text-purple-700 uppercase tracking-tight">
                          Siguiente
                        </p>
                        <p className="text-xs font-bold text-slate-800 leading-tight mt-0.5 truncate">
                          {event.summary}
                        </p>
                        <p className="text-[9px] text-purple-500 font-mono mt-1">
                          {event.start?.dateTime
                            ? formatTime(event.start.dateTime)
                            : "Todo el día"}
                        </p>
                      </div>
                    ))}

                  {/* Default when empty */}
                  {displayTasks.filter((t) => t.status === "needsAction")
                    .length === 0 &&
                    displayEvents.length === 0 && (
                      <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded-r shadow-2xs text-center py-4">
                        <p className="text-xs font-bold text-green-700">
                          ¡Día Organizado!
                        </p>
                        <p className="text-[10px] text-green-600 mt-1">
                          Sin compromisos inmediatos hoy.
                        </p>
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
                    "
                    {analysis?.motivationalQuote ||
                      "El tiempo es lo único que no vuelve. Úsalo con intención."}
                    "
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
                      {tasks.filter((t) => t.status === "needsAction").length}{" "}
                      tareas pendientes
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
                    {(
                      [
                        "day",
                        "week",
                        "month",
                        "quarter",
                        "semester",
                        "year",
                      ] as const
                    ).map((range) => {
                      const labelMap = {
                        day: "Día",
                        week: "Semana",
                        month: "Mes",
                        quarter: "Trimestre",
                        semester: "Semestre",
                        year: "Año",
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
                      <span className="text-[10px] text-slate-450 font-extrabold uppercase shrink-0">
                        Frecuencia:
                      </span>
                      <select
                        value={syncFrequency}
                        onChange={(e) =>
                          setSyncFrequency(Number(e.target.value))
                        }
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
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${isLoadingData || isLoadingAnalysis ? "animate-spin" : ""}`}
                      />
                      <span>
                        Sincronizar {viewRange === "day" ? "hoy" : "período"}
                      </span>
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
              <div className="flex bg-slate-100 rounded-lg p-1 w-fit shrink-0 flex-wrap gap-1">
                <button
                  onClick={() => setActiveTab("ai")}
                  className={`py-1.5 px-4 text-xs font-semibold rounded flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "ai"
                      ? "bg-white text-slate-905 shadow-2xs font-extrabold"
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
                      ? "bg-white text-slate-905 shadow-2xs font-extrabold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  Mis Eventos ({displayEvents.length})
                </button>
                <button
                  onClick={() => setActiveTab("tasks")}
                  className={`relative py-1.5 px-4 text-xs font-semibold rounded flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "tasks"
                      ? "bg-white text-slate-950 shadow-2xs font-extrabold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  Procedimiento y Tareas
                  {sgcAlertStatus.status !== "gris" && (
                    <span
                      className={`absolute -top-1.5 -right-1.5 w-4 h-4 text-[10px] flex justify-center items-center rounded-full text-white font-bold shadow-sm ${
                        sgcAlertStatus.status === "red"
                          ? "bg-red-500 shadow-red-500/50 animate-pulse border border-red-600"
                          : "bg-amber-500 shadow-amber-500/50 border border-amber-600"
                      }`}
                    >
                      {sgcAlertStatus.count}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("doc-generator")}
                  className={`py-1.5 px-4 text-xs font-extrabold rounded flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "doc-generator"
                      ? "bg-[#1D3D58] text-white shadow-2xs font-black"
                      : "text-teal-700 bg-teal-50 border border-teal-150 font-bold hover:bg-teal-100"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-teal-550" />
                  📋 Generador de Listas y Docs
                </button>
                <button
                  onClick={() => setActiveTab("stats")}
                  className={`py-1.5 px-4 text-xs font-extrabold rounded flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "stats"
                      ? "bg-[#1D3D58] text-white shadow-2xs font-black"
                      : "text-blue-700 bg-blue-50 border border-blue-150 font-bold hover:bg-blue-100"
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-blue-550" />
                  📊 Dashboard Operativo
                </button>
                <button
                  onClick={() => setActiveTab("tickets")}
                  className={`py-1.5 px-4 text-xs font-extrabold rounded flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "tickets"
                      ? "bg-[#1D3D58] text-white shadow-2xs font-black"
                      : "text-rose-700 bg-rose-50 border border-rose-150 font-bold hover:bg-rose-100"
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5 text-rose-550" />
                  📋 Hoja de Mejoras
                </button>
                <button
                  onClick={() => setActiveTab("resources")}
                  className={`py-1.5 px-4 text-xs font-extrabold rounded flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "resources"
                      ? "bg-[#1D3D58] text-white shadow-2xs font-black"
                      : "text-amber-700 bg-amber-50 border border-amber-150 font-bold hover:bg-amber-100"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-amber-550" />⚓ Directorio
                  Recursos
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
                          <h4 className="text-sm font-bold text-slate-800">
                            ¿Listo para compilar hoy?
                          </h4>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                            Gemini organizará automáticamente un horario
                            integrado para tu calendario y listas de tareas,
                            detectando conflictos de forma segura.
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
                      <span>
                        Haz clic en cualquier evento para inspeccionar todos los
                        parámetros, aulas, materiales y vincular tareas.
                      </span>
                      <span className="text-[10px] bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded font-bold uppercase">
                        Herramienta Relacional
                      </span>
                    </div>

                    {/* Mode Selector and Filter Controls */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3.5 shadow-3xs">
                      {/* View Modes */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-wrap">
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
                            Coordinación
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
                            Matriz de Ocupación
                          </button>
                          <button
                            type="button"
                            onClick={() => setCalendarSubTab("instructor")}
                            className={`px-3.5 py-1.5 text-xs font-extrabold uppercase rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                              calendarSubTab === "instructor"
                                ? "bg-emerald-600 text-white shadow-3xs"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            Instructor (Check-in)
                          </button>
                        </div>

                        <div className="text-[11px] font-bold text-slate-505 bg-slate-50 border border-slate-205 px-2.5 py-1 rounded-lg">
                          Rango Activo:{" "}
                          <span className="font-extrabold text-indigo-700 uppercase">
                            {viewRange === "day"
                              ? "Día"
                              : `Período (${viewRange})`}
                          </span>
                        </div>
                      </div>

                      {/* Integrated Pronautic Quick Filters */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Course Filter Toggle */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block font-bold">
                            Tipo de Actividad
                          </label>
                          <select
                            value={showOnlyCourses ? "courses" : "all"}
                            onChange={(e) =>
                              setShowOnlyCourses(e.target.value === "courses")
                            }
                            className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                          >
                            <option value="all">Todos los compromisos</option>
                            <option value="courses">
                              Solo Cursos / Prácticas
                            </option>
                          </select>
                        </div>

                        {/* Classroom Filter */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block font-bold">
                            Filtrar por Aula / Espacio
                          </label>
                          <select
                            value={selectedAulaFilter}
                            onChange={(e) =>
                              setSelectedAulaFilter(e.target.value)
                            }
                            className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                          >
                            <option value="">-- Todas las Aulas --</option>
                            {aulas.map((aula, i) => (
                              <option key={i} value={aula}>
                                {aula}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Fleet Filter */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block font-bold">
                            Filtrar por Embarcación
                          </label>
                          <select
                            value={selectedEmbarcacionFilter}
                            onChange={(e) =>
                              setSelectedEmbarcacionFilter(e.target.value)
                            }
                            className="w-full text-xs font-bold text-slate-700 bg-slate-55 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                          >
                            <option value="">
                              -- Todas las Embarcaciones --
                            </option>
                            {embarcaciones.map((emb, i) => (
                              <option key={i} value={emb}>
                                {emb}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {(selectedAulaFilter ||
                        selectedEmbarcacionFilter ||
                        showOnlyCourses) && (
                        <div className="flex items-center justify-between bg-indigo-50/50 border border-indigo-100 p-2 rounded-lg text-xs font-semibold text-indigo-805">
                          <span>
                            Filtros activos reducen vista a{" "}
                            {displayEvents.length} eventos.
                          </span>
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

                    {calendarSubTab === "instructor" ? (
                      <InstructorCheckInView events={displayEvents} />
                    ) : calendarSubTab === "matrix" ? (
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
                              const aulaEvents = mergedEvents.filter(
                                (e) => eventResources[e.id]?.aula === aula,
                              );

                              // Check for overlaps (time conflicts) inside these events
                              const overlapsList: string[] = [];
                              for (let i = 0; i < aulaEvents.length; i++) {
                                for (
                                  let j = i + 1;
                                  j < aulaEvents.length;
                                  j++
                                ) {
                                  const tA = getEventTimes(aulaEvents[i]);
                                  const tB = getEventTimes(aulaEvents[j]);
                                  if (
                                    tA &&
                                    tB &&
                                    tA.startTime < tB.endTime &&
                                    tA.endTime > tB.startTime
                                  ) {
                                    overlapsList.push(
                                      `'${aulaEvents[i].summary}' y '${aulaEvents[j].summary}'`,
                                    );
                                  }
                                }
                              }

                              return (
                                <div
                                  key={aula}
                                  className={`bg-white p-4 rounded-xl border transition-all ${
                                    overlapsList.length > 0
                                      ? "border-rose-300 ring-1 ring-rose-200"
                                      : aulaEvents.length > 0
                                        ? "border-slate-205 hover:border-indigo-250"
                                        : "border-slate-200 bg-slate-50/40"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-1.5">
                                    <div>
                                      <h5 className="text-xs font-black text-slate-800 flex items-center gap-1.5 font-sans">
                                        <span className="p-1 bg-slate-100 rounded text-slate-650">
                                          🏫
                                        </span>
                                        {aula}
                                      </h5>
                                      <p className="text-[9.5px] text-slate-400 font-mono mt-0.5 font-bold uppercase tracking-wider">
                                        {aulaEvents.length}{" "}
                                        {aulaEvents.length === 1
                                          ? "actividad asignada"
                                          : "actividades asignadas"}
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
                                      Simultaneidad no permitida:{" "}
                                      {overlapsList.join(", ")} coincide.
                                    </div>
                                  )}

                                  {aulaEvents.length > 0 ? (
                                    <div className="mt-3 space-y-2">
                                      {aulaEvents.map((event) => (
                                        <div
                                          key={event.id}
                                          onClick={() =>
                                            setSelectedEvent(event)
                                          }
                                          className="p-2 border border-slate-150 hover:border-indigo-400 rounded-lg text-left bg-slate-50 hover:bg-white text-[10.5px] leading-tight transition-all cursor-pointer group/item hover:shadow-4xs"
                                        >
                                          <div className="flex items-center justify-between text-[9px] text-indigo-700 font-bold mb-0.5 font-mono">
                                            <span>
                                              {formatEventDates(event)}
                                            </span>
                                            <span className="group-hover/item:text-indigo-900 transition-colors uppercase font-mono font-black text-[8px] tracking-wide">
                                              Inspeccionar →
                                            </span>
                                          </div>
                                          <p className="font-extrabold text-slate-800 group-hover/item:text-indigo-900 line-clamp-1">
                                            {event.summary}
                                          </p>
                                          {getEventInstructor(event) && (
                                            <p className="text-[9px] text-slate-500 font-semibold mt-0.5">
                                              Instructor:{" "}
                                              <span className="text-slate-700 font-bold">
                                                {getEventInstructor(event)}
                                              </span>
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-[10px] text-slate-400 italic font-semibold mt-3 leading-tight select-none">
                                      Disponible para programar clases o
                                      exámenes DGMM en el período seleccionado.
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
                            Ocupación de Embarcaciones y Flota Náutica (
                            {embarcaciones.length})
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {embarcaciones.map((emb) => {
                              // Find events allocated to this boat
                              const embEvents = mergedEvents.filter(
                                (e) =>
                                  eventResources[e.id]?.embarcacion === emb,
                              );

                              // Check for overlaps (time conflicts) inside these events
                              const overlapsList: string[] = [];
                              for (let i = 0; i < embEvents.length; i++) {
                                for (let j = i + 1; j < embEvents.length; j++) {
                                  const tA = getEventTimes(embEvents[i]);
                                  const tB = getEventTimes(embEvents[j]);
                                  if (
                                    tA &&
                                    tB &&
                                    tA.startTime < tB.endTime &&
                                    tA.endTime > tB.startTime
                                  ) {
                                    overlapsList.push(
                                      `'${embEvents[i].summary}' y '${embEvents[j].summary}'`,
                                    );
                                  }
                                }
                              }

                              return (
                                <div
                                  key={emb}
                                  className={`bg-white p-4 rounded-xl border transition-all ${
                                    overlapsList.length > 0
                                      ? "border-rose-300 ring-1 ring-rose-200"
                                      : embEvents.length > 0
                                        ? "border-slate-205 hover:border-indigo-250"
                                        : "border-slate-200 bg-slate-50/40"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-1.5">
                                    <div>
                                      <h5 className="text-xs font-black text-slate-800 flex items-center gap-1.5 font-sans">
                                        <span className="p-1 bg-slate-100 rounded text-slate-650">
                                          ⛵
                                        </span>
                                        {emb}
                                      </h5>
                                      <p className="text-[9.5px] text-slate-400 font-mono mt-0.5 font-bold uppercase tracking-wider">
                                        {embEvents.length}{" "}
                                        {embEvents.length === 1
                                          ? "actividad programada"
                                          : "actividades programadas"}
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
                                      Simultaneidad no permitida:{" "}
                                      {overlapsList.join(", ")} coincide.
                                    </div>
                                  )}

                                  {embEvents.length > 0 ? (
                                    <div className="mt-3 space-y-2">
                                      {embEvents.map((event) => (
                                        <div
                                          key={event.id}
                                          onClick={() =>
                                            setSelectedEvent(event)
                                          }
                                          className="p-2 border border-slate-150 hover:border-indigo-400 rounded-lg text-left bg-slate-50 hover:bg-white text-[10.5px] leading-tight transition-all cursor-pointer group/item hover:shadow-4xs"
                                        >
                                          <div className="flex items-center justify-between text-[9px] text-indigo-700 font-bold mb-0.5 font-mono">
                                            <span>
                                              {formatEventDates(event)}
                                            </span>
                                            <span className="group-hover/item:text-indigo-900 transition-colors uppercase font-mono font-black text-[8px] tracking-wide">
                                              Inspeccionar →
                                            </span>
                                          </div>
                                          <p className="font-extrabold text-slate-800 group-hover/item:text-indigo-900 line-clamp-1">
                                            {event.summary}
                                          </p>
                                          {getEventInstructor(event) && (
                                            <p className="text-[9px] text-slate-500 font-semibold mt-0.5">
                                              Instructor:{" "}
                                              <span className="text-slate-700 font-bold">
                                                {getEventInstructor(event)}
                                              </span>
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-[10px] text-slate-400 italic font-semibold mt-3 leading-tight select-none">
                                      Sin prácticas asignadas para esta
                                      embarcación. Lista para despacho.
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
                              const titleLower = (
                                event.summary || ""
                              ).toLowerCase();
                              const descLower = (
                                event.description || ""
                              ).toLowerCase();
                              const fullText = `${titleLower} ${descLower}`;

                              let cardColorClass =
                                "bg-indigo-50/50 border-l-4 border-indigo-500 text-indigo-950 hover:bg-indigo-50 border border-indigo-100/40";
                              let tagLabel = "Evento";

                              if (
                                fullText.includes("sync") ||
                                fullText.includes("reunión") ||
                                fullText.includes("call") ||
                                fullText.includes("llamada") ||
                                fullText.includes("meeting")
                              ) {
                                cardColorClass =
                                  "bg-blue-50/55 border-l-4 border-blue-600 text-blue-950 hover:bg-blue-50 border border-blue-100/40";
                                tagLabel = "REUNIÓN / COMPROMISO";
                              } else if (
                                fullText.includes("prep") ||
                                fullText.includes("diseño") ||
                                fullText.includes("build") ||
                                fullText.includes("dev") ||
                                fullText.includes("creación")
                              ) {
                                cardColorClass =
                                  "bg-purple-50/55 border-l-4 border-purple-600 text-purple-950 hover:bg-purple-50 border border-purple-100/40";
                                tagLabel = "TRABAJO DE ENFOQUE (DEEP WORK)";
                              } else if (
                                fullText.includes("comida") ||
                                fullText.includes("break") ||
                                fullText.includes("almuerzo") ||
                                fullText.includes("café") ||
                                fullText.includes("gimnasio") ||
                                fullText.includes("libre")
                              ) {
                                cardColorClass =
                                  "bg-green-50/55 border-l-4 border-green-600 text-green-950 hover:bg-green-50 border border-green-100/40";
                                tagLabel = "RECREACIÓN / RESTAURACIÓN";
                              }

                              // Determine relationships
                              const linkedTaskIds =
                                eventTaskLinks[event.id] || [];

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
                                      const availStatus =
                                        checkTeacherAvailability(event);
                                      if (availStatus.status === "no_teacher")
                                        return null;

                                      return (
                                        <div className="text-[10px] font-sans font-bold px-2 py-0.5 rounded border border-slate-150 w-fit mt-1.5 flex items-center gap-1.5 leading-normal shadow-4xs bg-white/80">
                                          <span
                                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                              availStatus.status === "available"
                                                ? "bg-emerald-500"
                                                : availStatus.status ===
                                                    "unavailable"
                                                  ? "bg-red-500"
                                                  : "bg-amber-500"
                                            }`}
                                          />
                                          <span className="text-[9.5px] text-slate-705 leading-none">
                                            {availStatus.label}
                                          </span>
                                        </div>
                                      );
                                    })()}

                                    {/* Classroom & Equipamientos assigned - High Density indicators */}
                                    {(() => {
                                      const alloc = eventResources[event.id];
                                      const hasAlloc =
                                        alloc &&
                                        (alloc.aula ||
                                          (alloc.materials &&
                                            alloc.materials.length > 0) ||
                                          alloc.numAlumnos !== undefined ||
                                          alloc.instructor);
                                      const isConflicted = globalConflicts.some(
                                        (c) =>
                                          c.eventA.id === event.id ||
                                          c.eventB.id === event.id,
                                      );
                                      if (!hasAlloc && !isConflicted)
                                        return null;
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
                                          {alloc?.instructor &&
                                            (() => {
                                              const check =
                                                getInstructorAvailabilityAndQualification(
                                                  alloc.instructor,
                                                  event,
                                                );
                                              let colorClasses =
                                                "bg-purple-50 border-purple-200 text-purple-950";
                                              let statusIcon = "⚓";

                                              if (
                                                check.status ===
                                                "available_and_qualified"
                                              ) {
                                                colorClasses =
                                                  "bg-emerald-50 border-emerald-300 text-emerald-950 ring-1 ring-emerald-200";
                                                statusIcon = "✓ ⚓";
                                              } else if (
                                                check.status ===
                                                "available_not_qualified"
                                              ) {
                                                colorClasses =
                                                  "bg-amber-50 border-amber-300 text-amber-950";
                                                statusIcon =
                                                  "⚠ ⚓ (Sin Habilitación)";
                                              } else if (
                                                check.status ===
                                                "qualified_no_availability"
                                              ) {
                                                colorClasses =
                                                  "bg-rose-50 border-rose-300 text-rose-950";
                                                statusIcon =
                                                  "⚠ ⚓ (Fuera de Fechas)";
                                              } else if (
                                                check.status === "none"
                                              ) {
                                                colorClasses =
                                                  "bg-red-50 border-red-300 text-red-950";
                                                statusIcon =
                                                  "⚠ ⚓ (No disp/No hab.)";
                                              }

                                              return (
                                                <span
                                                  className={`${colorClasses} border px-1.5 py-0.5 rounded text-[9.5px] font-black flex items-center gap-0.5 cursor-help transition-all duration-300 hover:scale-[1.03]`}
                                                  title={check.message}
                                                >
                                                  {statusIcon}{" "}
                                                  {alloc.instructor}
                                                </span>
                                              );
                                            })()}
                                          {alloc?.completedAuditTasks !==
                                            undefined &&
                                            alloc.completedAuditTasks.length >
                                              0 && (
                                              <span className="bg-slate-900 border border-slate-800 text-sky-400 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold">
                                                ✓ Proc:{" "}
                                                {Math.round(
                                                  (alloc.completedAuditTasks
                                                    .length /
                                                    38) *
                                                    100,
                                                )}
                                                %
                                              </span>
                                            )}
                                          {alloc?.materials &&
                                            alloc.materials.length > 0 && (
                                              <span className="bg-emerald-150/80 border border-emerald-200/55 text-emerald-950 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                                🎒 {alloc.materials.length}{" "}
                                                material
                                                {alloc.materials.length === 1
                                                  ? ""
                                                  : "es"}
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
                                        Tareas de Google Relacionadas (
                                        {linkedTaskIds.length})
                                      </span>
                                      <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                                        {linkedTaskIds.map((taskId) => {
                                          const task = tasks.find(
                                            (t) => t.id === taskId,
                                          );
                                          if (!task) return null;
                                          return (
                                            <div
                                              key={taskId}
                                              className="flex items-center justify-between gap-2 text-[11px] font-sans font-semibold text-slate-700 bg-white/70 hover:bg-white px-2 py-1 rounded border border-slate-150/35 shadow-4xs"
                                              onClick={(e) =>
                                                e.stopPropagation()
                                              }
                                            >
                                              <label className="flex items-center gap-1.5 min-w-0 cursor-pointer flex-grow select-none">
                                                <input
                                                  type="checkbox"
                                                  checked={
                                                    task.status === "completed"
                                                  }
                                                  onChange={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleTaskStatus(
                                                      task.id,
                                                    );
                                                  }}
                                                  onClick={(e) =>
                                                    e.stopPropagation()
                                                  }
                                                  className="h-3 w-3 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                                />
                                                <span
                                                  className={`truncate leading-none ${task.status === "completed" ? "line-through text-slate-400 font-normal" : "text-slate-700"}`}
                                                >
                                                  {task.title ||
                                                    "Tarea sin título"}
                                                </span>
                                              </label>
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleUnlinkTaskCard(
                                                    event.id,
                                                    task.id,
                                                  );
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
                                          <span className="truncate">
                                            {event.location}
                                          </span>
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
                              No hay eventos programados para los filtros
                              seleccionados en este período.
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed max-w-md mx-auto">
                              Verifica el rango seleccionado (
                              {viewRange === "day" ? "Día" : "Período"}), los
                              calendarios activos en la izquierda o si estás en
                              Modo Profesor con correos específicos.
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
                                <span className="text-slate-705 font-extrabold block">
                                  📋 Control y Gestión de Calidad (Checklists
                                  DGMM)
                                </span>
                                <span className="text-[11px] leading-relaxed block text-slate-450">
                                  Cada curso impartido en Pronautic requiere el
                                  cumplimiento estricto del procedimiento de 38
                                  pasos exigido por Marina Mercante. Selecciona
                                  un curso para auditar sus tareas.
                                </span>
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
                                onChange={(e) =>
                                  setSearchTaskQuery(e.target.value)
                                }
                                placeholder="Buscar curso por nombre, aula, instructor o código..."
                                className="w-full text-xs font-semibold pl-9 pr-4 py-2.5 bg-white border border-slate-205 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 hover:border-slate-300 transition-all font-sans"
                              />
                            </div>

                            {/* Grid of courses */}
                            {(() => {
                              const filteredCoursesList = displayCourses.filter(
                                (course) => {
                                  if (!searchTaskQuery) return true;
                                  const query = searchTaskQuery.toLowerCase();
                                  const summary = (
                                    course.summary || ""
                                  ).toLowerCase();
                                  const desc = (
                                    course.description || ""
                                  ).toLowerCase();
                                  const allocation =
                                    eventResources[course.id] || {};
                                  const aula = (
                                    allocation.aula || ""
                                  ).toLowerCase();
                                  const inst = (
                                    allocation.instructor || ""
                                  ).toLowerCase();
                                  const code = (
                                    allocation.codigoCurso || ""
                                  ).toLowerCase();
                                  return (
                                    summary.includes(query) ||
                                    desc.includes(query) ||
                                    aula.includes(query) ||
                                    inst.includes(query) ||
                                    code.includes(query)
                                  );
                                },
                              );
                              const orderedCoursesList =
                                filteredCoursesList.sort((a, b) => {
                                  const allocA = eventResources[a.id] || {};
                                  const completedA =
                                    allocA.completedAuditTasks || [];
                                  const hasComunicacionA =
                                    completedA.includes("comunicacion_dgmm");
                                  const hasListadoA =
                                    completedA.includes("listado_alumnos");
                                  const startDA = new Date(
                                    a.start?.dateTime || a.start?.date || "",
                                  );
                                  const diffDaysA = Math.ceil(
                                    (startDA.getTime() - new Date().getTime()) /
                                      (1000 * 60 * 60 * 24),
                                  );

                                  const isCriticalA =
                                    diffDaysA >= 0 &&
                                    diffDaysA <= 15 &&
                                    (!hasComunicacionA || !hasListadoA);
                                  const isAmberA =
                                    diffDaysA > 15 &&
                                    diffDaysA <= 30 &&
                                    (!hasComunicacionA || !hasListadoA);

                                  const allocB = eventResources[b.id] || {};
                                  const completedB =
                                    allocB.completedAuditTasks || [];
                                  const hasComunicacionB =
                                    completedB.includes("comunicacion_dgmm");
                                  const hasListadoB =
                                    completedB.includes("listado_alumnos");
                                  const startDB = new Date(
                                    b.start?.dateTime || b.start?.date || "",
                                  );
                                  const diffDaysB = Math.ceil(
                                    (startDB.getTime() - new Date().getTime()) /
                                      (1000 * 60 * 60 * 24),
                                  );

                                  const isCriticalB =
                                    diffDaysB >= 0 &&
                                    diffDaysB <= 15 &&
                                    (!hasComunicacionB || !hasListadoB);
                                  const isAmberB =
                                    diffDaysB > 15 &&
                                    diffDaysB <= 30 &&
                                    (!hasComunicacionB || !hasListadoB);

                                  if (isCriticalA && !isCriticalB) return -1;
                                  if (!isCriticalA && isCriticalB) return 1;
                                  if (isAmberA && !isAmberB) return -1;
                                  if (!isAmberA && isAmberB) return 1;
                                  return 0; // maintain original order otherwise
                                });

                              if (orderedCoursesList.length === 0) {
                                return (
                                  <div className="bg-slate-50 border border-slate-200/60 p-12 rounded-xl text-center py-16">
                                    <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-xs text-slate-500 font-medium">
                                      No se encontraron cursos activos con los
                                      filtros indicados.
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
                                  {orderedCoursesList.map((course) => {
                                    // Compute stats
                                    const allocation =
                                      eventResources[course.id] || {};
                                    const completed =
                                      allocation.completedAuditTasks || [];

                                    let pendingD = 0;
                                    let pendingDF = 0;
                                    let pendingINS = 0;
                                    let pendingRSGI = 0;

                                    AUDIT_TASKS.forEach((task) => {
                                      const isCompleted = completed.includes(
                                        task.id,
                                      );
                                      if (!isCompleted) {
                                        const roles =
                                          task.responsible.split(/[\s/+,&]+/);
                                        roles.forEach((r) => {
                                          const uRole = r.toUpperCase().trim();
                                          if (uRole === "D") pendingD++;
                                          else if (uRole === "DF") pendingDF++;
                                          else if (uRole === "INS")
                                            pendingINS++;
                                          else if (uRole === "RSGI")
                                            pendingRSGI++;
                                        });
                                      }
                                    });

                                    const pct = Math.min(
                                      100,
                                      Math.max(
                                        0,
                                        Math.round(
                                          (completed.length /
                                            AUDIT_TASKS.length) *
                                            100,
                                        ),
                                      ),
                                    );

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

                                          <div className="flex items-start justify-between gap-2">
                                            <h4 className="text-xs font-extrabold text-slate-800 leading-snug line-clamp-2">
                                              {course.summary ||
                                                "Curso sin título"}
                                            </h4>
                                            {(() => {
                                              const hasComunicacion =
                                                completed.includes(
                                                  "comunicacion_dgmm",
                                                );
                                              const hasListado =
                                                completed.includes(
                                                  "listado_alumnos",
                                                );
                                              if (hasComunicacion && hasListado)
                                                return null;

                                              const startD = new Date(
                                                course.start?.dateTime ||
                                                  course.start?.date ||
                                                  "",
                                              );
                                              const diffDays = Math.ceil(
                                                (startD.getTime() -
                                                  new Date().getTime()) /
                                                  (1000 * 60 * 60 * 24),
                                              );

                                              if (
                                                diffDays >= 0 &&
                                                diffDays <= 15
                                              ) {
                                                return (
                                                  <div
                                                    className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 mt-0.5 animate-pulse border border-red-600 shadow-sm"
                                                    title="¡Atención CRÍTICA! Menos de 15 días y Comunicación SGC incompleta"
                                                  />
                                                );
                                              } else if (
                                                diffDays > 15 &&
                                                diffDays <= 30
                                              ) {
                                                return (
                                                  <div
                                                    className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 mt-0.5 border border-amber-600 shadow-sm"
                                                    title="Precaución: Menos de 30 días y Comunicación SGC incompleta"
                                                  />
                                                );
                                              }
                                              return null;
                                            })()}
                                          </div>

                                          {/* Classroom / Instructor and validations inline info */}
                                          <div className="flex flex-wrap gap-1.5 text-[9.5px] text-slate-500 font-semibold mt-1">
                                            {/* Orphan Validations */}
                                            {!allocation.aula &&
                                              !allocation.embarcacion && (
                                                <span
                                                  className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200 font-black"
                                                  title="Alerta Operativa: Curso sin espacio físico (Aula / Embarcación) asignado."
                                                >
                                                  ⚠ Ubicación Pdte.
                                                </span>
                                              )}
                                            {!allocation.instructor && (
                                              <span
                                                className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200 font-black"
                                                title="Alerta Operativa: Curso sin equipo docente asignado."
                                              >
                                                ⚠ Docente Pdte.
                                              </span>
                                            )}

                                            {/* Overlap detection */}
                                            {globalConflicts.some(
                                              (c) =>
                                                c.eventA.id === course.id ||
                                                c.eventB.id === course.id,
                                            ) && (
                                              <span
                                                className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300 font-black flex items-center gap-1"
                                                title={globalConflicts
                                                  .filter(
                                                    (c) =>
                                                      c.eventA.id ===
                                                        course.id ||
                                                      c.eventB.id === course.id,
                                                  )
                                                  .map((c) => c.reason)
                                                  .join(" | ")}
                                              >
                                                <span className="animate-pulse">
                                                  ⚡
                                                </span>{" "}
                                                Solapamiento
                                              </span>
                                            )}

                                            {/* Existing Data */}
                                            {allocation.aula && (
                                              <span className="bg-indigo-50 text-indigo-950 px-1.5 py-0.5 rounded border border-indigo-100/50">
                                                🏫 {allocation.aula}
                                              </span>
                                            )}
                                            {allocation.embarcacion && (
                                              <span className="bg-cyan-50 text-cyan-950 px-1.5 py-0.5 rounded border border-cyan-100/50">
                                                ⛵ {allocation.embarcacion}
                                              </span>
                                            )}
                                            {allocation.instructor &&
                                              (() => {
                                                const check =
                                                  getInstructorAvailabilityAndQualification(
                                                    allocation.instructor,
                                                    course,
                                                  );
                                                let colorClasses =
                                                  "bg-purple-50 border-purple-100 text-purple-950";
                                                let statusIcon = "⚓";

                                                if (
                                                  check.status ===
                                                  "available_and_qualified"
                                                ) {
                                                  colorClasses =
                                                    "bg-emerald-50 border-emerald-200 text-emerald-950 ring-1 ring-emerald-100";
                                                  statusIcon = "✓ ⚓";
                                                } else if (
                                                  check.status ===
                                                  "available_not_qualified"
                                                ) {
                                                  colorClasses =
                                                    "bg-amber-50 border-amber-200 text-amber-950";
                                                  statusIcon = "⚠ ⚓";
                                                } else if (
                                                  check.status ===
                                                  "qualified_no_availability"
                                                ) {
                                                  colorClasses =
                                                    "bg-rose-50 border-rose-200 text-rose-950";
                                                  statusIcon = "⚠ ⚓";
                                                } else if (
                                                  check.status === "none"
                                                ) {
                                                  colorClasses =
                                                    "bg-red-50 border-red-200 text-red-950";
                                                  statusIcon = "⚠ ⚓";
                                                }

                                                return (
                                                  <span
                                                    className={`px-1.5 py-0.5 rounded border ${colorClasses} font-black cursor-help hover:scale-[1.03] transition-all duration-300`}
                                                    title={check.message}
                                                  >
                                                    {statusIcon}{" "}
                                                    {allocation.instructor}
                                                  </span>
                                                );
                                              })()}
                                          </div>

                                          {/* Progress bar visualizer */}
                                          <div className="pt-2">
                                            <div className="flex items-center justify-between text-[9.5px] font-bold text-slate-650 mb-1">
                                              <span>
                                                Progreso de Calidad (SGC)
                                              </span>
                                              <span className="font-mono font-extrabold text-indigo-700">
                                                {completed.length} /{" "}
                                                {AUDIT_TASKS.length} ({pct}%)
                                              </span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/40">
                                              <div
                                                className={`h-full transition-all duration-300 ${pct === 100 ? "bg-emerald-500" : "bg-indigo-700"}`}
                                                style={{ width: `${pct}%` }}
                                              />
                                            </div>
                                          </div>
                                        </div>

                                        {/* Pending counters breakdown */}
                                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            {pendingD > 0 && (
                                              <span
                                                className="text-[8.5px] font-black bg-emerald-50 text-emerald-700 px-1 rounded-sm uppercase tracking-wide border border-emerald-200/50"
                                                title="Directiva - Robert"
                                              >
                                                D: {pendingD}
                                              </span>
                                            )}
                                            {pendingDF > 0 && (
                                              <span
                                                className="text-[8.5px] font-black bg-indigo-50 text-indigo-700 px-1 rounded-sm uppercase tracking-wide border border-indigo-200/50"
                                                title="Formación - Raquel"
                                              >
                                                DF: {pendingDF}
                                              </span>
                                            )}
                                            {pendingINS > 0 && (
                                              <span
                                                className="text-[8.5px] font-black bg-purple-50 text-purple-700 px-1 rounded-sm uppercase tracking-wide border border-purple-200/50"
                                                title="Instructor Principal"
                                              >
                                                INS: {pendingINS}
                                              </span>
                                            )}
                                            {pendingRSGI > 0 && (
                                              <span
                                                className="text-[8.5px] font-black bg-amber-50 text-amber-700 px-1 rounded-sm uppercase tracking-wide border border-amber-200/30"
                                                title="Calidad SGI - Raquel"
                                              >
                                                SGI: {pendingRSGI}
                                              </span>
                                            )}
                                            {pendingD === 0 &&
                                              pendingDF === 0 &&
                                              pendingINS === 0 &&
                                              pendingRSGI === 0 && (
                                                <span className="text-[8.5px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                  Completado ✓
                                                </span>
                                              )}
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              setSelectedCourseIdForTasks(
                                                course.id,
                                              );
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
                            const course = displayCourses.find(
                              (c) => c.id === selectedCourseIdForTasks,
                            );
                            if (!course) {
                              setSelectedCourseIdForTasks("");
                              return null;
                            }
                            const allocation = eventResources[course.id] || {};
                            const completed =
                              allocation.completedAuditTasks || [];
                            const pct = Math.min(
                              100,
                              Math.max(
                                0,
                                Math.round(
                                  (completed.length / AUDIT_TASKS.length) * 100,
                                ),
                              ),
                            );

                            // Filter tasks
                            const tasksInActiveView = AUDIT_TASKS.filter(
                              (task) => {
                                // 1. Role Filter
                                if (tasksRoleFilter !== "ALL") {
                                  const roles =
                                    task.responsible.split(/[\s/+,&]+/);
                                  const match = roles.some(
                                    (r) =>
                                      r.toUpperCase().trim() ===
                                      tasksRoleFilter,
                                  );
                                  if (!match) return false;
                                }
                                // 2. Search Text query
                                if (searchTaskQuery) {
                                  const q = searchTaskQuery.toLowerCase();
                                  const lbl = task.label.toLowerCase();
                                  const doc = (
                                    task.document || ""
                                  ).toLowerCase();
                                  const lid = task.id.toLowerCase();
                                  const resp = task.responsible.toLowerCase();
                                  if (
                                    !lbl.includes(q) &&
                                    !doc.includes(q) &&
                                    !lid.includes(q) &&
                                    !resp.includes(q)
                                  )
                                    return false;
                                }
                                return true;
                              },
                            );

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
                                      {formatEventDates(course)}{" "}
                                      {allocation.aula &&
                                        `| Aula: ${allocation.aula}`}{" "}
                                      {allocation.instructor &&
                                        `| Instructor: ${allocation.instructor}`}
                                    </p>
                                  </div>

                                  {/* Dynamic Compliance Progress inside top card */}
                                  <div className="space-y-1.5 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                                      <span className="flex items-center gap-1.5">
                                        <span>
                                          Cumplimiento del Procedimiento de
                                          Calidad
                                        </span>
                                        {pct === 100 && (
                                          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black px-1 rounded">
                                            Homologado
                                          </span>
                                        )}
                                      </span>
                                      <span className="font-mono font-semibold">
                                        {completed.length} de{" "}
                                        {AUDIT_TASKS.length} completado ({pct})%
                                      </span>
                                    </div>
                                    <div className="w-full bg-slate-850 h-2.5 rounded-full overflow-hidden border border-slate-800">
                                      <div
                                        className={`h-full transition-all duration-300 ${pct === 100 ? "bg-emerald-500" : "bg-sky-500"}`}
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
                                        onClick={() =>
                                          setTasksRoleFilter("ALL")
                                        }
                                        className={`px-2 py-1 rounded text-[10px] font-bold tracking-tight transition-all border cursor-pointer border-slate-200 ${
                                          tasksRoleFilter === "ALL"
                                            ? "bg-slate-900 border-slate-900 text-white shadow-3xs font-extrabold"
                                            : "bg-white text-slate-605 hover:text-slate-900 hover:border-slate-300"
                                        }`}
                                      >
                                        Ver Todo
                                      </button>
                                      {(
                                        ["D", "DF", "INS", "RSGI"] as const
                                      ).map((role) => (
                                        <button
                                          key={role}
                                          type="button"
                                          onClick={() =>
                                            setTasksRoleFilter(role)
                                          }
                                          className={`px-2 py-1 rounded text-[10px] font-bold tracking-tight transition-all border cursor-pointer border-slate-200 ${
                                            tasksRoleFilter === role
                                              ? "bg-indigo-600 border-indigo-600 text-white shadow-3xs font-black"
                                              : "bg-white text-slate-605 hover:text-slate-900 hover:border-slate-300"
                                          }`}
                                        >
                                          {role === "D"
                                            ? "D (Robert)"
                                            : role === "DF"
                                              ? "DF (Raquel)"
                                              : role === "INS"
                                                ? "INST (Instructor)"
                                                : "RSGI (Raquel)"}
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
                                      onChange={(e) =>
                                        setSearchTaskQuery(e.target.value)
                                      }
                                      placeholder="Buscar por paso SGC, documento obligatorio (e.g. Hoja, Acta)..."
                                      className="w-full text-xs font-semibold pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                                    />
                                  </div>
                                </div>

                                {/* Live checklists tasks table list */}
                                <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-3xs">
                                  {tasksInActiveView.length === 0 ? (
                                    <div className="p-12 text-center text-slate-500 italic text-xs">
                                      No se encontraron pasos correspondientes a
                                      los filtros establecidos.
                                    </div>
                                  ) : (
                                    tasksInActiveView.map((task) => {
                                      const checked = completed.includes(
                                        task.id,
                                      );

                                      // Identify background highlight based on compliance phase (previous, during, after)
                                      const taskNum = Number(
                                        task.id.replace("t", ""),
                                      );
                                      let phaseBg = "hover:bg-slate-50/55";
                                      let phaseName = "";
                                      let phaseColor = "";
                                      if (taskNum <= 15) {
                                        phaseName = "Previa";
                                        phaseColor =
                                          "bg-sky-50 border-sky-200 text-sky-805";
                                      } else if (taskNum <= 23) {
                                        phaseName = "Impartición";
                                        phaseColor =
                                          "bg-purple-50 border-purple-200 text-purple-805";
                                      } else {
                                        phaseName = "Cierre";
                                        phaseColor =
                                          "bg-slate-100 border-slate-300 text-slate-705";
                                      }

                                      return (
                                        <div
                                          key={task.id}
                                          className={`p-3 sm:p-4 flex items-start gap-3 transition-colors ${phaseBg} ${checked ? "opacity-85 bg-slate-50/20" : ""}`}
                                        >
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleToggleAuditTaskDashboard(
                                                course.id,
                                                task.id,
                                              )
                                            }
                                            className={`mt-0.5 shrink-0 h-5 w-5 flex items-center justify-center rounded border transition-all cursor-pointer ${
                                              checked
                                                ? "bg-emerald-500 border-emerald-500 text-white"
                                                : "border-slate-300 bg-white hover:border-indigo-500"
                                            }`}
                                            title={
                                              checked
                                                ? "Marcar como pendiente de firma"
                                                : "Marcar como verificado y firmado"
                                            }
                                          >
                                            {checked ? (
                                              <Check className="h-3.5 w-3.5 font-bold" />
                                            ) : null}
                                          </button>

                                          <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-start justify-between gap-1 flex-wrap sm:flex-nowrap">
                                              <p
                                                className={`text-xs font-bold leading-snug ${checked ? "text-slate-400 line-through font-normal" : "text-slate-805"}`}
                                              >
                                                <span className="font-mono text-[10px] text-slate-450 font-black mr-1 shadow-4xs bg-slate-105 px-1 py-0.5 rounded shrink-0">
                                                  {task.id.toUpperCase()}
                                                </span>
                                                {task.label}
                                              </p>

                                              <div className="flex gap-1 shrink-0 mt-1 sm:mt-0">
                                                <span
                                                  className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border font-mono select-none ${phaseColor}`}
                                                >
                                                  {phaseName}
                                                </span>
                                              </div>
                                            </div>

                                            {/* Task metadatas */}
                                            <div className="flex flex-wrap gap-1.5 items-center pt-0.5 text-[9px] sm:text-[9.5px]">
                                              <span className="bg-indigo-50 text-indigo-750 px-1.5 py-0.5 border border-indigo-200/50 rounded font-bold font-sans">
                                                Firma:{" "}
                                                {task.responsible.includes("/")
                                                  ? `Varios (${task.responsible})`
                                                  : task.responsible}
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
                            Mostrando {displayTasks.length} de {tasks.length}{" "}
                            tareas totales en Google
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              setOnlyShowRangeTasks(!onlyShowRangeTasks)
                            }
                            className={`text-[10px] px-2 py-1 font-bold rounded cursor-pointer border flex items-center gap-1 transition-all ${
                              onlyShowRangeTasks
                                ? "bg-indigo-55 border-indigo-200 text-indigo-700"
                                : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-705"
                            }`}
                          >
                            <Filter className="w-3 h-3" />
                            {onlyShowRangeTasks
                              ? "Mostrando: Período activo"
                              : "Mostrando: Todas"}
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
                                  onClick={() =>
                                    handleToggleTaskStatus(task.id)
                                  }
                                  className="mt-0.5 shrink-0 h-5 w-5 flex items-center justify-center rounded border border-slate-300 bg-white hover:border-indigo-500 text-indigo-650 transition-all cursor-pointer"
                                  title={
                                    task.status === "completed"
                                      ? "Marcar como pendiente"
                                      : "Marcar como completada"
                                  }
                                >
                                  {task.status === "completed" ? (
                                    <Check className="h-3.5 w-3.5 font-black" />
                                  ) : null}
                                </button>

                                <div className="space-y-1 py-0.5 flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <p
                                      className={`text-xs font-bold leading-none ${
                                        task.status === "completed"
                                          ? "text-slate-400 line-through font-normal"
                                          : "text-slate-800"
                                      }`}
                                    >
                                      {task.title || "Tarea sin título"}
                                    </p>

                                    {task.listTitle && (
                                      <span className="text-[9px] font-mono font-bold bg-slate-105 text-slate-500 px-1.5 py-0.5 rounded uppercase shrink-0">
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
                                      Vence:{" "}
                                      {new Date(task.due).toLocaleDateString(
                                        "es-ES",
                                      )}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-slate-55 border border-dashed border-slate-200 p-8 py-10 rounded-xl text-center">
                            <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs text-slate-505 font-medium">
                              No se encontraron tareas en Google para este
                              período.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "doc-generator" && (
                  <div className="space-y-6">
                    {/* Print Style Injector */}
                    <style
                      dangerouslySetInnerHTML={{
                        __html: `
                    @media print {
                      body {
                        background: white !important;
                        color: black !important;
                        font-size: 10pt !important;
                        margin: 0 !important;
                        padding: 0 !important;
                      }
                      /* Hide everything except the print document */
                      body * {
                        visibility: hidden;
                      }
                      #sgc-print-document, #sgc-print-document * {
                        visibility: visible;
                      }
                      /* Un-hide parents so they don't block the child display or cause clipping */
                      html, body, #root {
                        height: auto !important;
                        overflow: visible !important;
                      }
                      /* Target the print container specifically */
                      #sgc-print-document {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        max-width: none !important;
                        background: white !important;
                        box-shadow: none !important;
                        border: none !important;
                      }
                      /* Override any relative or overflow-hidden utility classes on ancestors */
                      [class*="relative"], [class*="overflow-hidden"], [class*="min-h-screen"] {
                        position: static !important;
                        overflow: visible !important;
                        height: auto !important;
                        min-height: 0 !important;
                      }
                      /* Ensure nice borders inside table when printed */
                      table, th, td {
                        border: 1px solid #000000 !important;
                        color: #000000 !important;
                      }
                    }
                  `,
                      }}
                    />

                    {/* Configuration Controls panel */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs space-y-5 no-print">
                      {/* Header Controls */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <Settings className="w-4 h-4 text-teal-600" />
                            Configuración SGC y Filtros Activos del Documento
                          </h3>
                          <p className="text-xs text-slate-500 font-semibold">
                            Diseña, filtra y edita el informe mensual de calidad
                            antes de exportar o imprimir.
                          </p>
                        </div>

                        {/* Period Selections and Print action button */}
                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                          <span className="text-xs text-slate-400 font-bold">
                            Mes/Año:
                          </span>
                          <select
                            value={docMonth}
                            onChange={(e) =>
                              setDocMonth(parseInt(e.target.value))
                            }
                            className="text-xs font-bold p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                          >
                            <option value={-1}>
                              Todos los eventos en pantalla (Modo Automático)
                            </option>
                            {[
                              "Enero",
                              "Febrero",
                              "Marzo",
                              "Abril",
                              "Mayo",
                              "Junio",
                              "Julio",
                              "Agosto",
                              "Septiembre",
                              "Octubre",
                              "Noviembre",
                              "Diciembre",
                            ].map((m, idx) => {
                              const count = monthEventCounts[idx] || 0;
                              return (
                                <option key={idx} value={idx}>
                                  {m}{" "}
                                  {count > 0
                                    ? `(${count} acts.)`
                                    : `(${count})`}
                                </option>
                              );
                            })}
                          </select>

                          <select
                            value={docYear}
                            onChange={(e) =>
                              setDocYear(parseInt(e.target.value))
                            }
                            className="text-xs font-bold p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                          >
                            {[2025, 2026, 2027, 2028].map((y) => (
                              <option key={y} value={y}>
                                {y}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => {
                              setDocMonth(focusDate.getMonth());
                              setDocYear(focusDate.getFullYear());
                            }}
                            className="py-2 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-all border border-indigo-150 shadow-4xs shrink-0"
                            title="Sincronizar fecha del informe con la vista actual del calendario"
                          >
                            <RefreshCw className="w-3 h-3 text-indigo-500" />
                            <span>Sincronizar Vista</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handlePrintSGC();
                            }}
                            className="py-2 px-3.5 bg-teal-650 hover:bg-teal-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-4xs shrink-0"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Imprimir Documento</span>
                          </button>
                        </div>
                      </div>

                      {/* Meta Titles and Header Fields Editor */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Título Principal del Documento:
                          </label>
                          <input
                            type="text"
                            value={docTitle}
                            onChange={(e) => setDocTitle(e.target.value)}
                            className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 outline-none text-slate-800 font-sans"
                            placeholder="Título del documento..."
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Subtítulo / Entidad Emisora SGC:
                          </label>
                          <input
                            type="text"
                            value={docSubtitle}
                            onChange={(e) => setDocSubtitle(e.target.value)}
                            className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 outline-none text-slate-800 font-sans"
                            placeholder="Subtítulo..."
                          />
                        </div>
                      </div>

                      {/* Meta Header Fields Info */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Metadatos de Registro Operativo (Cabecera):
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {docHeaderFields.map((field) => (
                            <div
                              key={field.id}
                              className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl space-y-1"
                            >
                              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                                {field.label}
                              </span>
                              <input
                                type="text"
                                value={field.value}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setDocHeaderFields((prev) =>
                                    prev.map((f) =>
                                      f.id === field.id
                                        ? { ...f, value: val }
                                        : f,
                                    ),
                                  );
                                }}
                                className="w-full text-xs font-bold bg-white border border-slate-200 rounded p-1 outline-none text-slate-800"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ADVANCED FILTERING BLOCK CONTROLS */}
                      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block border-b border-slate-200 pb-1.5">
                          ⚓ Panel de Filtros y Configuración Dinámica de
                          Calendario
                        </span>

                        {/* Calendars multi-checkbox selector */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10.5px] font-bold text-slate-600">
                              Por Calendarios Sincronizados:
                            </span>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => setDocCalFilter([])}
                                className="text-[9.5px] font-black text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-150 px-1.5 py-0.5 rounded shadow-4xs"
                              >
                                Sincronizar Todos
                              </button>
                              {calendars.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDocCalFilter(calendars.map((c) => c.id))
                                  }
                                  className="text-[9.5px] font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-4xs"
                                >
                                  Seleccionar Todos
                                </button>
                              )}
                            </div>
                          </div>

                          {calendars.length === 0 ? (
                            <p className="text-[10.5px] text-slate-400 italic font-medium">
                              Buscando calendarios...
                            </p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {calendars.map((cal) => {
                                const isSelected = docCalFilter.includes(
                                  cal.id,
                                );
                                return (
                                  <button
                                    key={cal.id}
                                    type="button"
                                    onClick={() => {
                                      setDocCalFilter((prev) => {
                                        if (prev.includes(cal.id)) {
                                          return prev.filter(
                                            (x) => x !== cal.id,
                                          );
                                        } else {
                                          return [...prev, cal.id];
                                        }
                                      });
                                    }}
                                    className={`text-[10.5px] font-extrabold px-2.5 py-1 rounded-lg border transition-all ${
                                      isSelected
                                        ? "bg-slate-805 text-white border-slate-900 shadow-4xs"
                                        : docCalFilter.length === 0
                                          ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-extrabold"
                                          : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
                                    }`}
                                  >
                                    ⚓ {cal.summary}{" "}
                                    {docCalFilter.length === 0 && "(Activo)"}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                          {docCalFilter.length === 0 && (
                            <p className="text-[9px] text-indigo-500 font-bold italic">
                              * Al no haber exclusión manual de calendarios, el
                              sistema auto-sincroniza todos los eventos de tu
                              escuela.
                            </p>
                          )}
                        </div>

                        {/* Other Operations filters (Courses vs Non-Courses, Classroom, Vessels, Instructor) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
                          {/* Type selection */}
                          <div className="space-y-1">
                            <label className="text-[9.5px] font-bold text-slate-500 uppercase font-mono block">
                              Categoría de Curso:
                            </label>
                            <select
                              value={docTypeFilter}
                              onChange={(e) => setDocTypeFilter(e.target.value)}
                              className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-xl"
                            >
                              <option value="all">Todas las actividades</option>
                              <option value="courses">
                                Solo Cursos STCW / ISM
                              </option>
                              <option value="other">
                                Clases y Prácticas Standard
                              </option>
                            </select>
                          </div>

                          {/* Classrooms dropdown */}
                          <div className="space-y-1">
                            <label className="text-[9.5px] font-bold text-slate-500 uppercase font-mono block">
                              Aula Asignada:
                            </label>
                            <select
                              value={docAulaFilter}
                              onChange={(e) => setDocAulaFilter(e.target.value)}
                              className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-xl"
                            >
                              <option value="all">Todas las aulas</option>
                              {aulas.map((au) => (
                                <option key={au} value={au}>
                                  {au}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Vessels dropdown */}
                          <div className="space-y-1">
                            <label className="text-[9.5px] font-bold text-slate-500 uppercase font-mono block">
                              Embarcación:
                            </label>
                            <select
                              value={docEmbarcacionFilter}
                              onChange={(e) =>
                                setDocEmbarcacionFilter(e.target.value)
                              }
                              className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-xl"
                            >
                              <option value="all font-medium">
                                Todas las embarcaciones
                              </option>
                              {embarcaciones.map((em) => (
                                <option key={em} value={em}>
                                  {em}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Instructor dropdown */}
                          <div className="space-y-1">
                            <label className="text-[9.5px] font-bold text-slate-500 uppercase font-mono block">
                              Instructor / Profesor:
                            </label>
                            <select
                              value={docInstructorFilter}
                              onChange={(e) =>
                                setDocInstructorFilter(e.target.value)
                              }
                              className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-xl"
                            >
                              <option value="all">Todos los docentes</option>
                              {teacherEmails.map((email) => (
                                <option key={email} value={email}>
                                  {email}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Search keyword */}
                          <div className="space-y-1">
                            <label className="text-[9.5px] font-bold text-slate-500 uppercase font-mono block">
                              Buscar por texto:
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={docSearchQuery}
                                onChange={(e) =>
                                  setDocSearchQuery(e.target.value)
                                }
                                placeholder="Filtro rápido..."
                                className="w-full text-xs font-bold p-2 pr-7 bg-white border border-slate-200 rounded-xl"
                              />
                              {docSearchQuery && (
                                <button
                                  type="button"
                                  onClick={() => setDocSearchQuery("")}
                                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 font-extrabold text-xs"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Standard Checkboxes Field selectors */}
                      <div className="space-y-2.5 pt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Seleccionar Columnas a Incluir en la Vista de
                          Impresión SGC:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                          {(
                            Object.entries(docFields) as [
                              string,
                              { label: string; enabled: boolean },
                            ][]
                          ).map(([key, fld]) => (
                            <label
                              key={key}
                              className={`flex items-center gap-2 p-2 rounded-xl border text-[11px] font-semibold cursor-pointer select-none transition-all ${
                                fld.enabled
                                  ? "bg-teal-50 border-teal-200 text-teal-900"
                                  : "bg-slate-50 border-slate-150 text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={fld.enabled}
                                onChange={() => {
                                  setDocFields((prev) => ({
                                    ...prev,
                                    [key]: {
                                      ...prev[key],
                                      enabled: !prev[key].enabled,
                                    },
                                  }));
                                }}
                                className="accent-teal-650 w-3.5 h-3.5 rounded"
                              />
                              <span className="truncate">{fld.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Manage Custom Columns section */}
                      <div className="space-y-3 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Añadir Columnas Auxiliares Personalizadas al
                            Informe:
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              const lbl = prompt(
                                "Introduce el nombre de la nueva columna (ej. 'Firmas', 'Matrícula Embarcación', 'Dictamen'):",
                              );
                              if (lbl) {
                                const vDef = prompt(
                                  "Introduce un valor predeterminado para esta columna (ej. 'Conforme SGC ✓', 'OK'):",
                                  "OK ✓",
                                );
                                const newId = "custom_" + Date.now();
                                setCustomDocFields((prev) => [
                                  ...prev,
                                  {
                                    id: newId,
                                    label: lbl,
                                    enabled: true,
                                    defaultValue: vDef || "",
                                    values: {},
                                  },
                                ]);
                              }
                            }}
                            className="py-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg flex items-center gap-1.5 cursor-pointer font-extrabold transition-all text-[10.5px]"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Agregar Columna</span>
                          </button>
                        </div>

                        {customDocFields.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {customDocFields.map((cf) => (
                              <div
                                key={cf.id}
                                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold ${
                                  cf.enabled
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-900"
                                    : "bg-slate-50 border-slate-200 text-slate-500"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={cf.enabled}
                                  onChange={() => {
                                    setCustomDocFields((prev) =>
                                      prev.map((x) =>
                                        x.id === cf.id
                                          ? { ...x, enabled: !x.enabled }
                                          : x,
                                      ),
                                    );
                                  }}
                                  className="accent-indigo-600"
                                />
                                <span>{cf.label}</span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  ({cf.defaultValue || "vacío"})
                                </span>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setCustomDocFields((prev) =>
                                      prev.filter((x) => x.id !== cf.id),
                                    );
                                  }}
                                  className="text-rose-500 hover:text-rose-700 ml-1.5 cursor-pointer"
                                  title="Eliminar Columna"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ACTIVE EVENTS SELECTOR AND ENRICHMENT list */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3xs space-y-4 no-print">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div>
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-indigo-500" />
                            1. Control e Inclusion de Actividades (
                            {docFilteredEvents.length} encontradas)
                          </h4>
                          <p className="text-[11.5px] text-slate-500 font-semibold leading-relaxed">
                            Desmarca las actividades que no desees incluir en el
                            SGC, o edítalas rápidamente desde la grilla inferior
                            para que encajen antes de imprimir.
                          </p>
                        </div>

                        {/* Bulk Select Handlers */}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setDocExcludedIds({})}
                            className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10.5px] font-black border border-slate-300 rounded-xl cursor-pointer"
                          >
                            Incluir Todas (✔)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const exc: Record<string, boolean> = {};
                              docFilteredEvents.forEach((e) => {
                                exc[e.id] = true;
                              });
                              setDocExcludedIds(exc);
                            }}
                            className="py-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10.5px] font-black border border-rose-200 rounded-xl cursor-pointer"
                          >
                            Excluir Todas (🗙)
                          </button>
                        </div>
                      </div>

                      {docFilteredEvents.length === 0 ? (
                        <div className="bg-slate-55 border border-dashed border-slate-200 p-8 py-10 rounded-xl text-center">
                          <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs font-black text-slate-650">
                            No hay eventos para los filtros seleccionados (
                            {docMonth === -1
                              ? "Período en Vista"
                              : `${["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][docMonth]} ${docYear}`}
                            )
                          </p>
                          <p className="text-[10.5px] text-slate-400 mt-1 max-w-md mx-auto">
                            Prueba a cambiar el mes/año, desactiva algún filtro
                            o simula eventos en el calendario principal.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-72 overflow-y-auto">
                          <table className="w-full text-left border-collapse text-xs divide-y divide-slate-100">
                            <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0">
                              <tr>
                                <th className="p-3 w-12 text-center">Imp.</th>
                                <th className="p-3">Fecha y Hora</th>
                                <th className="p-3 min-w-[200px]">
                                  Curso / Actividad
                                </th>
                                <th className="p-3 min-w-[130px]">
                                  Código Curso
                                </th>
                                <th className="p-3 min-w-[150px]">
                                  Instructor
                                </th>
                                <th className="p-3 min-w-[150px]">Aula</th>
                                <th className="p-3 min-w-[130px]">
                                  Embarcación
                                </th>
                                <th className="p-3 w-16">Alum.</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {docFilteredEvents.map((event) => {
                                const isExcluded = !!docExcludedIds[event.id];
                                const r = eventResources[event.id] || {
                                  aula: "",
                                  materials: [],
                                  completedAuditTasks: [],
                                };
                                const startD = new Date(
                                  event.start?.dateTime ||
                                    event.start?.date ||
                                    0,
                                );

                                // Deduce fallback course details
                                const deducedCode =
                                  r.codigoCurso ||
                                  (event.summary
                                    ?.toLowerCase()
                                    .includes("gmdss")
                                    ? "STCW-GMDSS"
                                    : event.summary
                                          ?.toLowerCase()
                                          .includes("ism")
                                      ? "STCW-ISM"
                                      : "STCW-FB");
                                const defaultAula =
                                  r.aula ||
                                  event.location ||
                                  "Aula Teórica del Puerto";
                                const defaultVessel =
                                  r.embarcacion || "Ninguna";
                                const defaultInstructor =
                                  r.instructor ||
                                  "instructorspronautic@gmail.com";
                                const numAlumnos = r.numAlumnos || 12;

                                return (
                                  <tr
                                    key={event.id}
                                    className={`hover:bg-slate-50/50 transition-all ${
                                      isExcluded
                                        ? "opacity-50 line-through bg-slate-50/20"
                                        : ""
                                    }`}
                                  >
                                    {/* Toggle print state checkbox cell */}
                                    <td className="p-3 text-center">
                                      <input
                                        type="checkbox"
                                        checked={!isExcluded}
                                        onChange={() => {
                                          setDocExcludedIds((prev) => ({
                                            ...prev,
                                            [event.id]: !prev[event.id],
                                          }));
                                        }}
                                        className="accent-teal-650 h-4 w-4 rounded cursor-pointer"
                                      />
                                    </td>

                                    {/* Date details cell */}
                                    <td className="p-3 whitespace-nowrap font-mono text-[11px] text-slate-500">
                                      <div>
                                        {startD.toLocaleDateString("es-ES", {
                                          day: "2-digit",
                                          month: "short",
                                        })}
                                      </div>
                                      <div className="text-[10px] text-slate-400 font-bold">
                                        {startD.toLocaleTimeString("es-ES", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </div>
                                    </td>

                                    {/* Event Name/Descriptor */}
                                    <td className="p-3">
                                      <div className="font-extrabold text-slate-800 break-words">
                                        {event.summary || "Sin nombre"}
                                      </div>
                                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-xs">
                                        {event.calendarName || "Calendaria"}
                                      </div>
                                    </td>

                                    {/* Code Editor cell */}
                                    <td className="p-2.5">
                                      <input
                                        type="text"
                                        value={deducedCode}
                                        onChange={(e) => {
                                          handleSaveResources(event.id, {
                                            ...r,
                                            codigoCurso: e.target.value,
                                          });
                                        }}
                                        className="w-full p-1 border border-slate-200 rounded font-mono font-bold bg-white text-[11px] outline-none focus:border-teal-500"
                                        placeholder="Código SGC..."
                                      />
                                    </td>

                                    {/* Teacher Selector cell */}
                                    <td className="p-2.5">
                                      <select
                                        value={defaultInstructor}
                                        onChange={(e) => {
                                          handleSaveResources(event.id, {
                                            ...r,
                                            instructor: e.target.value,
                                          });
                                        }}
                                        className="w-full p-1 border border-slate-200 rounded text-[11px] font-semibold bg-white outline-none focus:border-teal-500"
                                      >
                                        <option value="instructorspronautic@gmail.com">
                                          instructorspronautic@gmail.com
                                        </option>
                                        {staffDatabase.map((staff) => (
                                          <option
                                            key={staff.email || staff.name}
                                            value={staff.name}
                                          >
                                            {staff.name}
                                          </option>
                                        ))}
                                        {teacherEmails
                                          .filter(
                                            (x) =>
                                              x !==
                                                "instructorspronautic@gmail.com" &&
                                              !staffDatabase.find(
                                                (s) => s.email === x,
                                              ),
                                          )
                                          .map((em) => (
                                            <option key={em} value={em}>
                                              {em}
                                            </option>
                                          ))}
                                      </select>
                                    </td>

                                    {/* Classroom Selector cell */}
                                    <td className="p-2.5">
                                      <select
                                        value={defaultAula}
                                        onChange={(e) => {
                                          handleSaveResources(event.id, {
                                            ...r,
                                            aula: e.target.value,
                                          });
                                        }}
                                        className="w-full p-1 border border-slate-200 rounded text-[11px] font-semibold bg-white outline-none focus:border-teal-500"
                                      >
                                        <option value="">-- Sin Aula --</option>
                                        {aulas.map((au) => (
                                          <option key={au} value={au}>
                                            {au}
                                          </option>
                                        ))}
                                      </select>
                                    </td>

                                    {/* Vessel Selector cell */}
                                    <td className="p-2.5">
                                      <select
                                        value={defaultVessel}
                                        onChange={(e) => {
                                          handleSaveResources(event.id, {
                                            ...r,
                                            embarcacion: e.target.value,
                                          });
                                        }}
                                        className="w-full p-1 border border-slate-200 rounded text-[11px] font-semibold bg-white outline-none focus:border-teal-500"
                                      >
                                        <option value="Ninguna">Ninguna</option>
                                        {embarcaciones.map((em) => (
                                          <option key={em} value={em}>
                                            {em}
                                          </option>
                                        ))}
                                      </select>
                                    </td>

                                    {/* Student Count editor cell */}
                                    <td className="p-2.5">
                                      <input
                                        type="number"
                                        value={numAlumnos}
                                        onChange={(e) => {
                                          handleSaveResources(event.id, {
                                            ...r,
                                            numAlumnos:
                                              parseInt(e.target.value) || 0,
                                          });
                                        }}
                                        className="w-full p-1 border border-slate-200 rounded text-center text-[11px] font-semibold bg-white outline-none focus:border-teal-500"
                                        min="0"
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* THE OFFICIAL SGC DIGITAL DOCUMENT PREVIEW PANEL */}
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print px-1 pb-1">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <FileText className="w-4 h-4 text-teal-600" />
                          2. Vista Documento SGC Impresión Oficial (PDF / Papel)
                        </h4>
                        <button
                          type="button"
                          onClick={handlePrintSGC}
                          className="py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all border border-teal-700 shadow-xs hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0 text-center"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Imprimir Documento</span>
                        </button>
                      </div>

                      {/* Styled as a clean letter sheet canvas */}
                      <div
                        id="sgc-print-document"
                        className="bg-white border border-slate-300 shadow-lg mx-auto p-11 rounded-2xl max-w-4xl text-slate-800 transition-all font-sans print:p-0 print:shadow-none print:border-none print:max-w-none"
                      >
                        {/* Document Meta Header Sheet */}
                        <div className="flex items-start justify-between border-2 border-slate-900 p-4 mb-6">
                          {/* Maritime School Branding Box */}
                          <div className="flex items-center gap-3 w-1/2">
                            <div className="bg-slate-900 p-1.5 rounded flex items-center justify-center shrink-0">
                              <PronauticLogo className="w-10 h-10 text-white" />
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-black tracking-widest text-[#E04F34] uppercase font-mono">
                                PRONAUTIC
                              </span>
                              <h2 className="text-xs font-black text-slate-950 uppercase tracking-tight leading-none">
                                ESCUELA NÁUTICA Y DE FORMACIÓN PROFESIONAL
                                MARÍTIMA
                              </h2>
                              <span className="text-[9px] font-mono text-slate-500 block">
                                Homologado por el Ministerio de Transportes y
                                Movilidad Sostenible
                              </span>
                            </div>
                          </div>

                          {/* SGC Document Title descriptor block */}
                          <div className="text-center px-4 w-1/3 border-l border-r border-slate-300 flex flex-col justify-center h-full pt-1">
                            <span className="text-[8px] font-mono font-bold text-slate-400 uppercase leading-none tracking-widest block mb-1">
                              Registro de Calidad SGC
                            </span>
                            <h1 className="text-xs font-black text-slate-935 leading-tight uppercase">
                              {docTitle || "Informe Mensual de Actividades"}
                            </h1>
                            <p className="text-[9.5px] font-semibold text-slate-400 mt-0.5 leading-none">
                              {docSubtitle || "Escuela Profesional Pronautic"}
                            </p>
                          </div>

                          {/* Control Metadata Grid Table */}
                          <div className="grid grid-cols-1 gap-1 w-1/4 text-right text-[8.5px] font-mono font-bold text-slate-650 pt-0.5 pl-3">
                            {docHeaderFields.map((field) => (
                              <div
                                key={field.id}
                                className="flex justify-between border-b border-dashed border-slate-200 pb-0.5"
                              >
                                <span className="text-slate-400">
                                  {field.label}:
                                </span>
                                <span className="text-slate-900 uppercase">
                                  {field.value}
                                </span>
                              </div>
                            ))}
                            <div className="flex justify-between pt-0.5">
                              <span className="text-slate-400">Fecha Doc:</span>
                              <span className="text-slate-900">
                                {new Date().toLocaleDateString("es-ES", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Período:</span>
                              <span className="text-slate-900 uppercase font-extrabold text-[9px] text-[#1D3D58]">
                                {docMonth === -1
                                  ? "Período en Vista"
                                  : `${["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][docMonth]} ${docYear}`}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Main Data Table */}
                        {(() => {
                          const printableEvents = docFilteredEvents.filter(
                            (e) => !docExcludedIds[e.id],
                          );

                          if (printableEvents.length === 0) {
                            return (
                              <div className="border border-dashed border-slate-300 text-center p-12 py-16 text-slate-600 rounded-lg">
                                <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm font-black text-slate-700">
                                  No hay registros para imprimir
                                </p>
                                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                  No has seleccionado ninguna fila arriba o
                                  ninguna actividad coincide con los filtros
                                  establecidos. Por favor activa por lo menos un
                                  evento para renderizar la tabla de salida de
                                  calidad.
                                </p>
                              </div>
                            );
                          }

                          return (
                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse border border-slate-300 font-sans">
                                <thead>
                                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
                                    {docFields.title.enabled && (
                                      <th className="border border-slate-300 p-2 text-[10.5px] font-black uppercase tracking-wider">
                                        Actividad / Curso
                                      </th>
                                    )}
                                    {docFields.dates.enabled && (
                                      <th className="border border-slate-300 p-2 text-[10.5px] font-black uppercase tracking-wider text-center w-28">
                                        Duración / Fechas
                                      </th>
                                    )}
                                    {docFields.time.enabled && (
                                      <th className="border border-slate-300 p-2 text-[10.5px] font-black uppercase tracking-wider text-center w-28">
                                        Horario
                                      </th>
                                    )}
                                    {docFields.instructor.enabled && (
                                      <th className="border border-slate-300 p-2 text-[10.5px] font-black uppercase tracking-wider w-36">
                                        Profesor Docente
                                      </th>
                                    )}
                                    {docFields.aula.enabled && (
                                      <th className="border border-slate-300 p-2 text-[10.5px] font-black uppercase tracking-wider">
                                        Aula
                                      </th>
                                    )}
                                    {docFields.embarcacion.enabled && (
                                      <th className="border border-slate-300 p-2 text-[10.5px] font-black uppercase tracking-wider">
                                        Embarcación
                                      </th>
                                    )}
                                    {docFields.codigoCurso.enabled && (
                                      <th className="border border-slate-300 p-2 text-[10.5px] font-black uppercase tracking-wider text-center w-28">
                                        Código DGMM
                                      </th>
                                    )}
                                    {docFields.numAlumnos.enabled && (
                                      <th className="border border-slate-300 p-2 text-[10.5px] font-black uppercase tracking-wider text-center w-12">
                                        Alum.
                                      </th>
                                    )}
                                    {docFields.materials.enabled && (
                                      <th className="border border-slate-300 p-2 text-[10.5px] font-black uppercase tracking-wider">
                                        Materiales
                                      </th>
                                    )}
                                    {docFields.calendarName.enabled && (
                                      <th className="border border-slate-300 p-2 text-[10.5px] font-black uppercase tracking-wider">
                                        Origen Cal.
                                      </th>
                                    )}
                                    {docFields.description.enabled && (
                                      <th className="border border-slate-300 p-2 text-[10.5px] font-black uppercase tracking-wider">
                                        Notas SGC
                                      </th>
                                    )}

                                    {/* Render custom columns in table headers */}
                                    {customDocFields
                                      .filter((cf) => cf.enabled)
                                      .map((cf) => (
                                        <th
                                          key={cf.id}
                                          className="border border-slate-300 p-2 text-[10.5px] font-black bg-indigo-50/50 text-indigo-950 uppercase tracking-wider"
                                        >
                                          {cf.label}
                                        </th>
                                      ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-300">
                                  {printableEvents.map((course) => {
                                    // Live parameters deduction
                                    const r = eventResources[course.id] || {
                                      aula: "",
                                      materials: [],
                                      completedAuditTasks: [],
                                    };
                                    const startStr =
                                      course.start?.dateTime ||
                                      course.start?.date ||
                                      "";
                                    const endStr =
                                      course.end?.dateTime ||
                                      course.end?.date ||
                                      "";
                                    const startD = startStr
                                      ? new Date(startStr)
                                      : new Date();
                                    const endD = endStr
                                      ? new Date(endStr)
                                      : new Date();

                                    const code =
                                      r.codigoCurso ||
                                      (course.summary
                                        ?.toLowerCase()
                                        .includes("gmdss")
                                        ? "STCW-GMDSS"
                                        : course.summary
                                              ?.toLowerCase()
                                              .includes("ism")
                                          ? "STCW-ISM"
                                          : "STCW-FB");
                                    const aula =
                                      r.aula ||
                                      course.location ||
                                      "Aula de Simulación Práctica";
                                    const embarcacion =
                                      r.embarcacion || "Ninguna";
                                    const defaultInstructor =
                                      r.instructor ||
                                      "instructorspronautic@gmail.com";
                                    const numAlumnos = r.numAlumnos || 12;
                                    const materials =
                                      r.materials ||
                                      (course.summary
                                        ?.toLowerCase()
                                        .includes("gmdss")
                                        ? [
                                            "Manual Radiocomunicaciones",
                                            "Simulador Digital",
                                          ]
                                        : [
                                            "Balsa Salvamento",
                                            "Manual Auxilio",
                                          ]);
                                    const calendarName =
                                      course.calendarName ||
                                      "Calendaria Pronautic";
                                    const description =
                                      course.description || "";

                                    const sTime = startStr
                                      ? startD.toLocaleTimeString("es-ES", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })
                                      : "09:00";
                                    const eTime = endStr
                                      ? endD.toLocaleTimeString("es-ES", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })
                                      : "14:00";

                                    return (
                                      <tr
                                        key={course.id}
                                        className="hover:bg-slate-50/40 text-[11px] leading-tight odd:bg-slate-50/25"
                                      >
                                        {/* Event dynamic cells based on settings */}
                                        {docFields.title.enabled && (
                                          <td className="border border-slate-300 p-2 font-extrabold text-slate-900">
                                            {course.summary}
                                          </td>
                                        )}

                                        {docFields.dates.enabled && (
                                          <td className="border border-slate-300 p-2 text-center whitespace-nowrap font-medium text-slate-800">
                                            {startD.toLocaleDateString(
                                              "es-ES",
                                              {
                                                day: "2-digit",
                                                month: "2-digit",
                                              },
                                            )}
                                            {endStr &&
                                              startD.toDateString() !==
                                                endD.toDateString() && (
                                                <>
                                                  {" "}
                                                  al{" "}
                                                  {endD.toLocaleDateString(
                                                    "es-ES",
                                                    {
                                                      day: "2-digit",
                                                      month: "2-digit",
                                                    },
                                                  )}
                                                </>
                                              )}
                                          </td>
                                        )}

                                        {docFields.time.enabled && (
                                          <td className="border border-slate-300 p-2 text-center whitespace-nowrap font-mono text-slate-700">
                                            {sTime} - {eTime}
                                          </td>
                                        )}

                                        {docFields.instructor.enabled && (
                                          <td className="border border-slate-300 p-2 font-medium text-slate-850 truncate max-w-[150px]">
                                            ⚓ {defaultInstructor}
                                          </td>
                                        )}

                                        {docFields.aula.enabled && (
                                          <td className="border border-slate-300 p-2 text-slate-700 font-medium">
                                            {aula}
                                          </td>
                                        )}

                                        {docFields.embarcacion.enabled && (
                                          <td className="border border-slate-300 p-2 text-slate-700 font-medium">
                                            {embarcacion !== "Ninguna"
                                              ? `⛵ ${embarcacion}`
                                              : "--"}
                                          </td>
                                        )}

                                        {docFields.codigoCurso.enabled && (
                                          <td className="border border-slate-300 p-2 text-center font-mono font-black text-slate-800">
                                            {code}
                                          </td>
                                        )}

                                        {docFields.numAlumnos.enabled && (
                                          <td className="border border-slate-300 p-2 text-center font-bold text-slate-800">
                                            {numAlumnos}
                                          </td>
                                        )}

                                        {docFields.materials.enabled && (
                                          <td
                                            className="border border-slate-300 p-2 text-slate-650 max-w-[180px] truncate"
                                            title={materials.join(", ")}
                                          >
                                            {materials.join(", ")}
                                          </td>
                                        )}

                                        {docFields.calendarName.enabled && (
                                          <td className="border border-slate-300 p-2 text-slate-500 font-medium">
                                            {calendarName}
                                          </td>
                                        )}

                                        {docFields.description.enabled && (
                                          <td
                                            className="border border-slate-300 p-2 text-slate-600 line-clamp-1 max-w-xs"
                                            title={description}
                                          >
                                            {stripHtml(description)}
                                          </td>
                                        )}

                                        {/* Redibujar columnas personalizadas interactivas */}
                                        {customDocFields
                                          .filter((cf) => cf.enabled)
                                          .map((cf) => {
                                            const customValueForEvent =
                                              cf.values &&
                                              cf.values[course.id] !== undefined
                                                ? cf.values[course.id]
                                                : cf.defaultValue;
                                            return (
                                              <td
                                                key={cf.id}
                                                className="border border-slate-300 p-1 bg-white font-medium"
                                              >
                                                <input
                                                  type="text"
                                                  value={customValueForEvent}
                                                  onChange={(e) => {
                                                    const val = e.target.value;
                                                    setCustomDocFields((prev) =>
                                                      prev.map((item) => {
                                                        if (item.id === cf.id) {
                                                          return {
                                                            ...item,
                                                            values: {
                                                              ...item.values,
                                                              [course.id]: val,
                                                            },
                                                          };
                                                        }
                                                        return item;
                                                      }),
                                                    );
                                                  }}
                                                  className="w-full text-[10.5px] border-none outline-none font-bold text-slate-700 focus:bg-slate-50 p-1 rounded font-sans print-input"
                                                />
                                              </td>
                                            );
                                          })}
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          );
                        })()}

                        {/* Official Regulatory Footnotes and Signature blocks inside sheet */}
                        <div className="mt-14 grid grid-cols-2 gap-8 text-center border-t border-slate-200 pt-8">
                          <div>
                            <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                              Coordinador Auditor de Calidad (SGC)
                            </p>
                            <div className="h-16 flex items-end justify-center">
                              <span className="text-[10px] text-slate-300 italic font-mono">
                                Firma Sello Autorizado
                              </span>
                            </div>
                            <div className="border-t border-slate-300 mx-10 mt-1"></div>
                            <p className="text-[10.5px] font-black mt-1 text-slate-800">
                              D. Roberto García de la Nuez
                            </p>
                            <p className="text-[8.5px] text-slate-400 font-mono font-bold">
                              Oficial de Calidad de la Escuela PRONAUTIC
                            </p>
                          </div>

                          <div>
                            <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                              Director Técnico y Académico de la Escuela
                            </p>
                            <div className="h-16 flex items-end justify-center">
                              <span className="text-[10px] text-slate-300 italic font-mono">
                                Firma Sello Autorizado
                              </span>
                            </div>
                            <div className="border-t border-slate-300 mx-10 mt-1"></div>
                            <p className="text-[10.5px] font-black mt-1 text-slate-800">
                              D. Juan José Pronautic S.L.
                            </p>
                            <p className="text-[8.5px] text-slate-400 font-mono font-bold">
                              Dirección General de Planificación Profesional
                            </p>
                          </div>
                        </div>

                        {/* Small legal footer of the document sheet */}
                        <div className="mt-12 flex justify-between items-center text-[7.5px] font-mono text-slate-400 border-t border-slate-100 pt-3">
                          <p>
                            Documento digital generado a través de Asistente de
                            Planificación en cloud de Pronautic bajo
                            reglamentación DGMM.
                          </p>
                          <p className="font-bold text-slate-500 uppercase">
                            PRO-FORM-SGC-04 • Ed. 04 / Rev. 02 • Página 1 de 1
                          </p>
                        </div>
                      </div>

                      {/* Bottom Action Section with Print Button */}
                      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 py-4 no-print">
                        <button
                          type="button"
                          onClick={handlePrintSGC}
                          className="w-full sm:w-auto py-3.5 px-8 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2.5 cursor-pointer transition-all border border-teal-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 text-center uppercase tracking-wider"
                        >
                          <Printer className="w-4.5 h-4.5 text-teal-100" />
                          <span>Imprimir Reporte Oficial SGC</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            alert(
                              "Generando Acta Digital Interna: Compilando metadatos de asistencia de Supabase, cruce con Google Tasks y Notas del Instructor grabadas en campo de operaciones.",
                            )
                          }
                          className="w-full sm:w-auto py-3.5 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2.5 cursor-pointer transition-all border border-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 text-center uppercase tracking-wider relative overflow-hidden"
                        >
                          <div
                            className="absolute inset-0 bg-white/20 w-4 h-full animate-[pulse_3s_ease-in-out_infinite_alternate]"
                            style={{
                              transform: "skewX(-20deg)",
                              transformOrigin: "0 0",
                            }}
                          />
                          <Mic className="w-4.5 h-4.5 text-indigo-100" />
                          <span>
                            Generar Acta Digital Interna (Voz a Texto y
                            Supabase)
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Informational Help Box */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 no-print">
                      <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <div className="space-y-1 text-xs">
                        <p className="font-extrabold text-slate-800">
                          ¿Cómo funciona la generación de informes SGC?
                        </p>
                        <p className="text-slate-600 leading-relaxed font-semibold">
                          Este generador recoge en tiempo real tus eventos e
                          incorpora las asignaciones y habilitaciones
                          relacionales locales del simulador (tales como
                          instructores, aulas, embarcaciones y número de
                          alumnos). Puedes controlar qué columnas se incluyen,
                          añadir nuevas sobre la marcha e imprimir el resultado
                          adaptado a papel tamaño Carta/A4 limpio de botones
                          utilizando el botón{" "}
                          <strong className="text-teal-600">
                            Imprimir Documento
                          </strong>
                          .
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "stats" && (
                  <MetricsDashboard events={mergedEvents} />
                )}

                {activeTab === "tickets" && (
                  <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-6 max-w-4xl mx-auto">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100">
                          <ClipboardList className="w-5 h-5 text-rose-600" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-slate-800">
                            Hoja de Mejoras (Operaciones/UX)
                          </h2>
                          <p className="text-xs font-medium text-slate-500">
                            Tickets creados por instructores o el Copiloto de
                            forma proactiva y pasiva.
                          </p>
                        </div>
                      </div>

                      {feedbackTickets.length === 0 ? (
                        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-300 bg-slate-50">
                          <Bot className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                          <p className="text-sm font-bold text-slate-600">
                            No hay propuestas de mejora registradas
                          </p>
                          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                            Los tickets creados mediante el asistente proactivo
                            inferior o durante el proceso de verificación
                            aparecerán aquí.
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          {feedbackTickets.map((t) => (
                            <div
                              key={t.id}
                              className="relative bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="absolute top-4 right-4 flex gap-2">
                                <span
                                  className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                                    t.status === "pending"
                                      ? "bg-amber-100 text-amber-800 border-amber-200 border"
                                      : t.status === "reviewed"
                                        ? "bg-blue-100 text-blue-800 border-blue-200 border"
                                        : "bg-emerald-100 text-emerald-800 border-emerald-200 border"
                                  }`}
                                >
                                  {t.status === "pending"
                                    ? "Pendiente"
                                    : t.status === "reviewed"
                                      ? "Revisado"
                                      : "Implementado"}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold text-slate-700">
                                  {t.userEmail}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {new Date(t.timestamp).toLocaleString()}
                                </span>
                              </div>

                              <div className="text-sm text-slate-800 font-medium mb-3 whitespace-pre-wrap">
                                {t.feedbackText}
                              </div>

                              <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5">
                                <div className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                                  Metadatos Recolectados (Automático)
                                </div>
                                <div className="text-[11px] font-mono text-slate-600">
                                  {t.context}
                                </div>
                              </div>

                              <div className="mt-3 flex gap-2 pt-3 border-t border-slate-100">
                                <button
                                  className="text-xs font-bold px-3 py-1 bg-white border border-slate-200 shadow-sm rounded text-slate-600 hover:bg-slate-50"
                                  onClick={() => {
                                    const updated = feedbackTickets.map((x) =>
                                      x.id === t.id
                                        ? { ...x, status: "reviewed" as const }
                                        : x,
                                    );
                                    setFeedbackTickets(updated);
                                  }}
                                >
                                  Marcar como Revisado
                                </button>
                                <button
                                  className="text-xs font-bold px-3 py-1 bg-white border border-slate-200 shadow-sm rounded text-emerald-600 hover:bg-emerald-50"
                                  onClick={() => {
                                    const updated = feedbackTickets.map((x) =>
                                      x.id === t.id
                                        ? {
                                            ...x,
                                            status: "implemented" as const,
                                          }
                                        : x,
                                    );
                                    setFeedbackTickets(updated);
                                  }}
                                >
                                  Marcar como Implementado
                                </button>
                                <button
                                  className="text-xs font-bold px-3 py-1 bg-white border border-slate-200 shadow-sm rounded text-rose-600 hover:bg-rose-50"
                                  onClick={() => {
                                    if (confirm("¿Eliminar este ticket?")) {
                                      setFeedbackTickets(
                                        feedbackTickets.filter(
                                          (x) => x.id !== t.id,
                                        ),
                                      );
                                    }
                                  }}
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "resources" && (
                  <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-6 max-w-4xl mx-auto">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100">
                          <Layers className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-slate-800">
                            Directorio de Recursos y Docentes
                          </h2>
                          <p className="text-xs font-medium text-slate-500">
                            Gestión local de las aulas, embarcaciones e
                            instructores utilizados en el sistema.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Aulas */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <span>🏫</span> Aulas Registradas
                          </h3>
                          <div className="flex flex-col gap-2 mb-4">
                            {aulas.map((aula, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center bg-white border border-slate-200 p-2 rounded text-xs"
                              >
                                <span className="font-semibold text-slate-700">
                                  {aula}
                                </span>
                                <button
                                  onClick={() =>
                                    setAulas(aulas.filter((a) => a !== aula))
                                  }
                                  className="text-slate-400 hover:text-rose-500"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              id="new-aula"
                              type="text"
                              placeholder="Nueva aula..."
                              className="flex-1 border border-slate-300 rounded p-1.5 text-xs focus:ring focus:ring-amber-200 focus:border-amber-400 outline-none"
                            />
                            <button
                              onClick={() => {
                                const input = document.getElementById(
                                  "new-aula",
                                ) as HTMLInputElement;
                                if (
                                  input &&
                                  input.value.trim() &&
                                  !aulas.includes(input.value.trim())
                                ) {
                                  setAulas([...aulas, input.value.trim()]);
                                  input.value = "";
                                }
                              }}
                              className="bg-amber-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-amber-700"
                            >
                              Añadir
                            </button>
                          </div>
                        </div>

                        {/* Embarcaciones */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <span>⛵</span> Embarcaciones Registradas
                          </h3>
                          <div className="flex flex-col gap-2 mb-4">
                            {embarcaciones.map((emb, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center bg-white border border-slate-200 p-2 rounded text-xs"
                              >
                                <span className="font-semibold text-slate-700">
                                  {emb}
                                </span>
                                <button
                                  onClick={() =>
                                    setEmbarcaciones(
                                      embarcaciones.filter((e) => e !== emb),
                                    )
                                  }
                                  className="text-slate-400 hover:text-rose-500"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              id="new-emb"
                              type="text"
                              placeholder="Nueva embarcación..."
                              className="flex-1 border border-slate-300 rounded p-1.5 text-xs focus:ring focus:ring-amber-200 focus:border-amber-400 outline-none"
                            />
                            <button
                              onClick={() => {
                                const input = document.getElementById(
                                  "new-emb",
                                ) as HTMLInputElement;
                                if (
                                  input &&
                                  input.value.trim() &&
                                  !embarcaciones.includes(input.value.trim())
                                ) {
                                  setEmbarcaciones([
                                    ...embarcaciones,
                                    input.value.trim(),
                                  ]);
                                  input.value = "";
                                }
                              }}
                              className="bg-amber-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-amber-700"
                            >
                              Añadir
                            </button>
                          </div>
                        </div>

                        {/* Instructores */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 md:col-span-2">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                              <span>👨‍🏫</span> Directorio de Docentes
                            </h3>
                          </div>
                          <p className="text-[11px] text-slate-500 mb-4">
                            Listado de plantilla local. Este directorio alimenta
                            las opciones de asignación en los eventos.
                          </p>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs bg-white border border-slate-200 rounded-lg">
                              <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                                <tr>
                                  <th className="p-2 border-b border-slate-200 whitespace-nowrap">
                                    Branca
                                  </th>
                                  <th className="p-2 border-b border-slate-200 whitespace-nowrap">
                                    Instructor
                                  </th>
                                  <th className="p-2 border-b border-slate-200 whitespace-nowrap">
                                    Categoría
                                  </th>
                                  <th className="p-2 border-b border-slate-200 whitespace-nowrap">
                                    Teléfono
                                  </th>
                                  <th className="p-2 border-b border-slate-200 whitespace-nowrap hidden sm:table-cell">
                                    Mail / Ubicación
                                  </th>
                                  <th className="p-2 border-b border-slate-200 text-center">
                                    Cursos
                                  </th>
                                  <th className="p-2 border-b border-slate-200 w-10"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {staffDatabase.map((staff) => {
                                  const assignedCourses = mergedEvents.filter(
                                    (e) => {
                                      const r = eventResources[e.id];
                                      if (!r) return false;
                                      return (
                                        r.instructor?.includes(staff.name) ||
                                        r.courseNotes?.instructorPrincipalNom?.includes(
                                          staff.name,
                                        ) ||
                                        r.courseNotes?.instructorSecundariNom?.includes(
                                          staff.name,
                                        )
                                      );
                                    },
                                  );
                                  return (
                                    <tr
                                      key={staff.id}
                                      className="hover:bg-slate-50"
                                    >
                                      <td className="p-2">
                                        <span className="font-bold text-[10px] bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-700">
                                          {staff.branca || "N/A"}
                                        </span>
                                      </td>
                                      <td className="p-2 font-bold text-slate-800">
                                        {staff.name}
                                      </td>
                                      <td className="p-2 text-slate-600 truncate max-w-[120px]">
                                        {staff.category || "-"}
                                      </td>
                                      <td className="p-2 text-slate-600">
                                        {staff.phone || "-"}
                                      </td>
                                      <td className="p-2 text-slate-500 text-[10px] hidden sm:table-cell">
                                        {staff.email ? (
                                          <a
                                            href={`mailto:${staff.email}`}
                                            className="text-indigo-600 hover:underline block truncate max-w-[150px]"
                                          >
                                            {staff.email}
                                          </a>
                                        ) : null}
                                        {staff.location && (
                                          <span className="block mt-0.5">
                                            {staff.location}
                                          </span>
                                        )}
                                      </td>
                                      <td className="p-2 text-center text-xs">
                                        {assignedCourses.length > 0 ? (
                                          <button
                                            onClick={() =>
                                              setSelectedInstructorForCourses(
                                                staff,
                                              )
                                            }
                                            className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-indigo-50 text-indigo-700 font-bold rounded-full hover:bg-indigo-100 focus:outline-none transition-colors"
                                            title="Ver cursos asignados"
                                          >
                                            {assignedCourses.length}
                                          </button>
                                        ) : (
                                          <span className="text-slate-300">
                                            -
                                          </span>
                                        )}
                                      </td>
                                      <td className="p-2 text-right">
                                        <button
                                          onClick={() => {
                                            if (
                                              confirm(
                                                `¿Eliminar al instructor ${staff.name}?`,
                                              )
                                            ) {
                                              setStaffDatabase(
                                                staffDatabase.filter(
                                                  (s) => s.id !== staff.id,
                                                ),
                                              );
                                            }
                                          }}
                                          className="text-slate-400 hover:text-rose-500"
                                          title="Eliminar instructor"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* New Instructor Form */}
                          <div className="mt-4 bg-white p-3 rounded border border-slate-200">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                              Añadir Nuevo Instructor
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              <input
                                id="new-staff-branca"
                                type="text"
                                placeholder="Branca (ej. STCW)"
                                className="border border-slate-200 rounded p-1.5 text-xs outline-none focus:border-indigo-400"
                              />
                              <input
                                id="new-staff-name"
                                type="text"
                                placeholder="* Nombre Completo"
                                className="border border-slate-200 rounded p-1.5 text-xs outline-none focus:border-indigo-400"
                              />
                              <input
                                id="new-staff-cat"
                                type="text"
                                placeholder="Categoría (ej. Capitán)"
                                className="border border-slate-200 rounded p-1.5 text-xs outline-none focus:border-indigo-400"
                              />
                              <input
                                id="new-staff-phone"
                                type="text"
                                placeholder="Teléfono"
                                className="border border-slate-200 rounded p-1.5 text-xs outline-none focus:border-indigo-400"
                              />
                              <input
                                id="new-staff-email"
                                type="email"
                                placeholder="Email"
                                className="border border-slate-200 rounded p-1.5 text-xs outline-none focus:border-indigo-400"
                              />
                              <input
                                id="new-staff-loc"
                                type="text"
                                placeholder="Ubicación"
                                className="border border-slate-200 rounded p-1.5 text-xs outline-none focus:border-indigo-400"
                              />
                              <div className="col-span-2 md:col-span-2 flex items-end">
                                <button
                                  onClick={() => {
                                    const brancaInput = document.getElementById(
                                      "new-staff-branca",
                                    ) as HTMLInputElement;
                                    const nameInput = document.getElementById(
                                      "new-staff-name",
                                    ) as HTMLInputElement;
                                    const catInput = document.getElementById(
                                      "new-staff-cat",
                                    ) as HTMLInputElement;
                                    const phoneInput = document.getElementById(
                                      "new-staff-phone",
                                    ) as HTMLInputElement;
                                    const emailInput = document.getElementById(
                                      "new-staff-email",
                                    ) as HTMLInputElement;
                                    const locInput = document.getElementById(
                                      "new-staff-loc",
                                    ) as HTMLInputElement;

                                    if (nameInput && nameInput.value.trim()) {
                                      const newStaff: InstructorProfile = {
                                        id: "staff-" + Date.now(),
                                        branca: brancaInput.value.trim(),
                                        name: nameInput.value.trim(),
                                        category: catInput.value.trim(),
                                        phone: phoneInput.value.trim(),
                                        email: emailInput.value.trim(),
                                        location: locInput.value.trim(),
                                      };
                                      setStaffDatabase([
                                        newStaff,
                                        ...staffDatabase,
                                      ]);

                                      // Clear inputs
                                      brancaInput.value = "";
                                      nameInput.value = "";
                                      catInput.value = "";
                                      phoneInput.value = "";
                                      emailInput.value = "";
                                      locInput.value = "";
                                    } else {
                                      alert(
                                        "El nombre del instructor es obligatorio.",
                                      );
                                    }
                                  }}
                                  className="w-full bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-indigo-700"
                                >
                                  Guardar Instructor
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </>
      )}

      {/* Print Warning Overlay (for AI Studio iFrames) */}
      <AnimatePresence>
        {showPrintWarning && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm bg-indigo-900 border border-indigo-700 shadow-2xl rounded-2xl p-5 text-indigo-50"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-indigo-800 rounded-lg shrink-0">
                <Printer className="w-6 h-6 text-indigo-300" />
              </div>
              <div className="space-y-2">
                <h4 className="font-extrabold text-sm text-white">
                  Impresión Bloqueada en Vista Previa
                </h4>
                <p className="text-xs text-indigo-200 leading-relaxed">
                  Por razones de seguridad del navegador, no es posible imprimir
                  directamente desde esta ventana de vista previa incorporada.
                </p>
                <div className="pt-2">
                  <p className="text-xs font-bold text-teal-300">
                    Solución: Haz clic en el icono "Abrir en una nueva pestaña"
                    (↗) arriba a la derecha de la plataforma, y vuelve a pulsar
                    Imprimir.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            staffDatabase={staffDatabase}
            userRole={userRole}
            userEmail={user?.email || "instructorspronautic@gmail.com"}
          />
        )}
      </AnimatePresence>

      {/* Instructor Courses Modal */}
      <AnimatePresence>
        {selectedInstructorForCourses && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden w-full max-w-3xl flex flex-col max-h-[85vh]"
            >
              <div className="bg-slate-800 px-5 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-400/30">
                    <span className="text-indigo-300 font-bold">
                      {selectedInstructorForCourses.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base flex flex-wrap gap-2 items-center">
                      Cursos Asignados: {selectedInstructorForCourses.name}
                    </h3>
                    <p className="text-indigo-200 text-[11px] mt-0.5">
                      Categoría:{" "}
                      {selectedInstructorForCourses.category || "N/A"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInstructorForCourses(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto bg-slate-50 flex-grow">
                {(() => {
                  const assigned = mergedEvents
                    .filter((e) => {
                      const r = eventResources[e.id];
                      if (!r) return false;
                      return (
                        r.instructor?.includes(
                          selectedInstructorForCourses.name,
                        ) ||
                        r.courseNotes?.instructorPrincipalNom?.includes(
                          selectedInstructorForCourses.name,
                        ) ||
                        r.courseNotes?.instructorSecundariNom?.includes(
                          selectedInstructorForCourses.name,
                        )
                      );
                    })
                    .sort(
                      (a, b) =>
                        new Date(
                          a.start?.dateTime || a.start?.date || 0,
                        ).getTime() -
                        new Date(
                          b.start?.dateTime || b.start?.date || 0,
                        ).getTime(),
                    );

                  if (assigned.length === 0) {
                    return (
                      <div className="text-center py-10">
                        <p className="text-slate-500 text-sm font-semibold">
                          No hay cursos asignados para este instructor.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {assigned.map((course) => {
                        const startD = new Date(
                          course.start?.dateTime || course.start?.date || "",
                        );
                        return (
                          <div
                            key={course.id}
                            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                                  {startD.toLocaleDateString("es-ES", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                                {eventResources[course.id]?.codigoCurso && (
                                  <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase border border-emerald-100">
                                    {eventResources[course.id]?.codigoCurso}
                                  </span>
                                )}
                                {eventResources[course.id]?.aula && (
                                  <span className="bg-sky-50 text-sky-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase border border-sky-100">
                                    {eventResources[course.id]?.aula}
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-slate-800 text-sm leading-snug">
                                {course.summary || "Curso sin nombre"}
                              </h4>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedInstructorForCourses(null);
                                setTimeout(() => setSelectedEvent(course), 50);
                              }}
                              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-all shadow-3xs hover:shadow-2xs whitespace-nowrap"
                            >
                              Abrir Ficha
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
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

      {/* Floating AI Feedback Button */}
      <button
        onClick={() => setShowFeedbackAgent(true)}
        className="fixed bottom-6 right-6 bg-slate-900 text-teal-400 p-3.5 rounded-full shadow-2xl hover:scale-105 transition-transform z-50 border border-slate-700 focus:outline-none flex items-center justify-center group"
        title="Copiloto y Reporte de Mejoras"
      >
        <Bot className="w-6 h-6 group-hover:text-teal-300 transition-colors" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
        </span>
      </button>

      {/* AI Feedback Agent Modal */}
      <AnimatePresence>
        {showFeedbackAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
            >
              <div className="bg-slate-900 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center border border-teal-500/50">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">
                      Copiloto UX & Reportes
                    </h3>
                    <p className="text-teal-400/80 text-[10px] uppercase tracking-wider font-mono">
                      Capturando contexto en memoria
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFeedbackAgent(false)}
                  className="text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
                >
                  Ocultar
                </button>
              </div>

              <div className="p-5">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] font-mono text-slate-600 mb-4 whitespace-nowrap overflow-x-auto">
                  <span className="font-bold text-slate-800">
                    Contexto Analizado:
                  </span>
                  <br />- Usuario:{" "}
                  {user?.email || "instructorspronautic@gmail.com"}
                  <br />- Rol Activo: {userRole}
                  <br />- Pestaña Visualizada: {activeTab.toUpperCase()}
                  <br />
                  {selectedEvent &&
                    `- Entidad enfocada: ${selectedEvent.summary}`}
                </div>

                <label className="block text-xs font-bold text-slate-700 mb-2">
                  ¿Qué mejora o error en el flujo operativo propones?
                </label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Ej: Cuando un alumno cambia de turno, la app se queda colgada mostrando..."
                  className="w-full h-32 p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none mb-4"
                />

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowFeedbackAgent(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      setIsSendingFeedback(true);
                      setTimeout(() => {
                        const newTicket: FeedbackTicket = {
                          id: "ticket-" + Date.now(),
                          timestamp: new Date().toISOString(),
                          userEmail:
                            user?.email || "instructorspronautic@gmail.com",
                          context: `Contexto Analizado: Usuario: ${user?.email || "instructorspronautic@gmail.com"} | Rol: ${userRole} | Pestaña: ${activeTab.toUpperCase()}${selectedEvent ? ` | Enfocado: ${selectedEvent.summary}` : ""}`,
                          feedbackText: feedbackText,
                          status: "pending",
                        };
                        setFeedbackTickets((prev) => [newTicket, ...prev]);
                        setIsSendingFeedback(false);
                        setFeedbackText("");
                        setShowFeedbackAgent(false);
                        alert(
                          "✅ Ticket enviado con éxito.\n\nEl sistema ha registrado la mejora/error en la Hoja de Mejoras para su análisis.",
                        );
                      }, 1000);
                    }}
                    disabled={isSendingFeedback || !feedbackText.trim()}
                    className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSendingFeedback ? (
                      <span className="animate-pulse">
                        Trazando Contexto...
                      </span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Enviar Reporte a
                        Ingeniería
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent minimalistic footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-[11px] text-slate-400">
        <p>© 2026 Asistente de Planificación Inteligente de Google Workspace</p>
        <p className="mt-0.5">
          Potenciado por Gemini Flash y Firebase Secure Sandbox Authentication
        </p>
      </footer>
    </div>
  );
}
