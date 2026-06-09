import { mockCalendars,  useState, useEffect, useMemo, useCallback } from "react";
import { initAuth, googleSignIn, logout } from "../auth";
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
} from "../types";
import {
  loadEventResources,
  loadInstructors,
  loadAvailabilities,
  saveEventResources,
  saveInstructors,
  saveAvailabilities,
} from "../services/sheetsDB";
import { User } from "firebase/auth";
import {
  DEFAULT_AULAS,
  DEFAULT_EMBARCACIONES,
  DEFAULT_STAFF,
  mockEventsList,
  mockLists,
  mockTasksList,
  PRONAUTIC_COURSES_CATALOG
} from "../mockData";

export function useAppLogic() {



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
      const savedOverrides = localStorage.getItem("event_overrides");
      if (savedOverrides) {
        setEventOverrides(JSON.parse(savedOverrides));
      }

      if (token && token !== "mock-token") {
        Promise.all([
          loadEventResources(token),
          loadInstructors(token),
          loadAvailabilities(token)
        ]).then(([resources, staff, avails]) => {
          if (Object.keys(resources).length > 0) setEventResources(resources);
          if (staff.length > 0) setStaffDatabase(staff);
          if (avails.length > 0) setAvailabilities(avails);
        }).catch(err => console.error("Error loading from sheets", err));
      } else {
        // Mock fallback
        const savedResources = localStorage.getItem("event_allocated_resources");
        if (savedResources) {
          setEventResources(JSON.parse(savedResources));
        }
        const savedAvailabilities = localStorage.getItem("teacher_availabilities");
        if (savedAvailabilities) {
          setAvailabilities(JSON.parse(savedAvailabilities));
        }
      }
    } catch (e) {
      console.error(
        "No se pudieron cargar enlaces de tareas, recursos, disponibilidades o ediciones guardadas",
        e,
      );
    }
  }, [token]);

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
        if (token && token !== "mock-token") {
          saveAvailabilities(token, updated);
        }
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
        if (token && token !== "mock-token") {
          saveAvailabilities(token, updated);
        }
        return updated;
      });
    }
  };

  const handleDeleteAvailability = (id: string) => {
    setAvailabilities((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      localStorage.setItem("teacher_availabilities", JSON.stringify(updated));
      if (token && token !== "mock-token") {
        saveAvailabilities(token, updated);
      }
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
      if (token && token !== "mock-token") {
        saveEventResources(token, eventId, resources);
      }
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

        

        setEvents(mockEventsList);

        setSelectedEvent((current) => {
          if (!current || !mockEventsList.some((e) => e.id === current.id))
            return null;
          return mockEventsList.find((e) => e.id === current.id) || current;
        });

        
        setTaskLists(mockLists);

        
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

  // SUBTASK-05.1 — Lógica de cálculo en App.tsx para DGMM
  const dgmmAlerts = useMemo(() => {
    const alerts: CalendarEvent[] = [];
    const now = new Date();
    const fifteenDaysFromNow = new Date();
    fifteenDaysFromNow.setDate(now.getDate() + 15);

    mergedEvents.forEach(e => {
      const isCourse =
        (e.summary || "").toUpperCase().includes("PER") ||
        (e.summary || "").toUpperCase().includes("PNB") ||
        (e.summary || "").toUpperCase().includes("STCW") ||
        (e.summary || "").toUpperCase().includes("PRACTICA");
      if (!isCourse) return;

      const startStr = e.start?.dateTime || e.start?.date;
      if (!startStr) return;
      const startD = new Date(startStr);

      if (startD >= now && startD <= fifteenDaysFromNow) {
        const estado = eventResources[e.id]?.estado;
        if (estado !== "COMUNICADO DGMM" && estado !== "EN EJECUCIÓN" && estado !== "COMPLETADO") {
          alerts.push(e);
        }
      }
    });

    // Sort by soonest
    alerts.sort((a,b) => {
      const da = new Date(a.start?.dateTime || a.start?.date || "");
      const db = new Date(b.start?.dateTime || b.start?.date || "");
      return da.getTime() - db.getTime();
    });

    return alerts;
  }, [mergedEvents, eventResources]);

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
  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;


  
const handleNavigate = (dir: any) => {};
return {
  loadWorkspaceData,
  progressPercent,
  completedTasksCount,
  totalTasksCount,
  handleLogin,
  handleLogout,
  selectedInstructorForCourses,
  setSelectedInstructorForCourses,
  selectedEmbarcacionFilter,
  setSelectedEmbarcacionFilter,
  selectedCourseIdForTasks,
  setSelectedCourseIdForTasks,
  getInstructorAvailabilityAndQualification,
//   displayEvents,
  needsAuth: needsAuth,
  isLoggingIn: isLoggingIn,
  user: user,
  token: token,
  events: events,
  taskLists: taskLists,
  tasks: tasks,
  isLoadingData: isLoadingData,
  errorText: errorText,
  analysis: analysis,
  isLoadingAnalysis: isLoadingAnalysis,
  isExporting: isExporting,
  exportSuccess: exportSuccess,
  activeTab: activeTab,
  showPrintWarning: showPrintWarning,
  docMonth: docMonth,
  docYear: docYear,
  docTitle: docTitle,
  docSubtitle: docSubtitle,
  docCalFilter: docCalFilter,
  docTypeFilter: docTypeFilter,
  docAulaFilter: docAulaFilter,
  docInstructorFilter: docInstructorFilter,
  docSearchQuery: docSearchQuery,
  docExcludedIds: docExcludedIds,
  docFields: docFields,
  customDocFields: customDocFields,
  docHeaderFields: docHeaderFields,
  todayFormatted: todayFormatted,
  showFeedbackAgent: showFeedbackAgent,
  feedbackText: feedbackText,
  isSendingFeedback: isSendingFeedback,
  feedbackTickets: feedbackTickets,
  viewRange: viewRange,
  focusDate: focusDate,
  selectedEvent: selectedEvent,
  eventTaskLinks: eventTaskLinks,
  onlyShowRangeTasks: onlyShowRangeTasks,
  showOnlyCourses: showOnlyCourses,
  selectedAulaFilter: selectedAulaFilter,
  calendarSubTab: calendarSubTab,
  tasksTabMode: tasksTabMode,
  searchTaskQuery: searchTaskQuery,
  tasksRoleFilter: tasksRoleFilter,
  calendars: calendars,
  selectedCalIds: selectedCalIds,
  userRole: userRole,
  teacherEmailFilter: teacherEmailFilter,
  customTeacherEmail: customTeacherEmail,
  availabilities: availabilities,
  newAvailStart: newAvailStart,
  newAvailEnd: newAvailEnd,
  newAvailNotes: newAvailNotes,
  editingAvailId: editingAvailId,
  teacherQualifications: teacherQualifications,
  eventResources: eventResources,
  eventOverrides: eventOverrides,
  syncFrequency: syncFrequency,
  lastSyncTime: lastSyncTime,
  aulas: aulas,
  embarcaciones: embarcaciones,
  staffDatabase: staffDatabase,
  isAdminModalOpen: isAdminModalOpen,
  setNeedsAuth: setNeedsAuth,
  setIsLoggingIn: setIsLoggingIn,
  setUser: setUser,
  setToken: setToken,
  setEvents: setEvents,
  setTaskLists: setTaskLists,
  setTasks: setTasks,
  setIsLoadingData: setIsLoadingData,
  setErrorText: setErrorText,
  setAnalysis: setAnalysis,
  setIsLoadingAnalysis: setIsLoadingAnalysis,
  setIsExporting: setIsExporting,
  setExportSuccess: setExportSuccess,
  setActiveTab: setActiveTab,
  setShowPrintWarning: setShowPrintWarning,
  setDocMonth: setDocMonth,
  setDocYear: setDocYear,
  setDocTitle: setDocTitle,
  setDocSubtitle: setDocSubtitle,
  setDocCalFilter: setDocCalFilter,
  setDocTypeFilter: setDocTypeFilter,
  setDocAulaFilter: setDocAulaFilter,
  setDocInstructorFilter: setDocInstructorFilter,
  setDocSearchQuery: setDocSearchQuery,
  setDocExcludedIds: setDocExcludedIds,
  setDocFields: setDocFields,
  setCustomDocFields: setCustomDocFields,
  setDocHeaderFields: setDocHeaderFields,
  setTodayFormatted: setTodayFormatted,
  setShowFeedbackAgent: setShowFeedbackAgent,
  setFeedbackText: setFeedbackText,
  setIsSendingFeedback: setIsSendingFeedback,
  setFeedbackTickets: setFeedbackTickets,
  setViewRange: setViewRange,
  setFocusDate: setFocusDate,
  setSelectedEvent: setSelectedEvent,
  setEventTaskLinks: setEventTaskLinks,
  setOnlyShowRangeTasks: setOnlyShowRangeTasks,
  setShowOnlyCourses: setShowOnlyCourses,
  setSelectedAulaFilter: setSelectedAulaFilter,
  setCalendarSubTab: setCalendarSubTab,
  setTasksTabMode: setTasksTabMode,
  setSearchTaskQuery: setSearchTaskQuery,
  setTasksRoleFilter: setTasksRoleFilter,
  setCalendars: setCalendars,
  setSelectedCalIds: setSelectedCalIds,
  setUserRole: setUserRole,
  setTeacherEmailFilter: setTeacherEmailFilter,
  setCustomTeacherEmail: setCustomTeacherEmail,
  setAvailabilities: setAvailabilities,
  setNewAvailStart: setNewAvailStart,
  setNewAvailEnd: setNewAvailEnd,
  setNewAvailNotes: setNewAvailNotes,
  setEditingAvailId: setEditingAvailId,
  setTeacherQualifications: setTeacherQualifications,
  setEventResources: setEventResources,
  setEventOverrides: setEventOverrides,
  setSyncFrequency: setSyncFrequency,
  setLastSyncTime: setLastSyncTime,
  setAulas: setAulas,
  setEmbarcaciones: setEmbarcaciones,
  setStaffDatabase: setStaffDatabase,
  setIsAdminModalOpen: setIsAdminModalOpen,
  mergedEvents: mergedEvents,
  sgcAlertStatus: sgcAlertStatus,
  monthEventCounts: monthEventCounts,
  teacherEmails: teacherEmails,
  displayEvents: displayEvents,
  displayTasks: displayTasks,
  displayCourses: displayCourses,
  docFilteredEvents: docFilteredEvents,
  dgmmAlerts: dgmmAlerts,
  globalConflicts: globalConflicts,
  handleAddAvailability: handleAddAvailability,
  handleDeleteAvailability: handleDeleteAvailability,
  handleSaveResources: handleSaveResources,
  handleToggleAuditTaskDashboard: handleToggleAuditTaskDashboard,
  handleUpdateEvent: handleUpdateEvent,
  getRangeConfig: getRangeConfig,
  navigateRange: navigateRange,
  handlePrintSGC: handlePrintSGC,
  handleNavigate: handleNavigate,
  handleLinkTask: handleLinkTask,
  handleUnlinkTask: handleUnlinkTask,
  handleUnlinkTaskCard: handleUnlinkTaskCard,
  getEventTimes: getEventTimes,
  formatTime: formatTime,
  getEventInstructor: getEventInstructor,
  getEventTeacherEmail: getEventTeacherEmail,
  checkTeacherAvailability: checkTeacherAvailability,
  formatEventDates: formatEventDates,
  handleExportToSheets: handleExportToSheets,
  triggerAIAnalysis: triggerAIAnalysis,
    handleToggleTaskStatus: handleToggleTaskStatus,
    
  };


}
