import React, { useState, useMemo, useEffect } from "react";
import { CalendarEvent, GoogleTask, StudentInfo, CourseIncident, CourseDocument, CourseAuditLog, CourseNotesData, InstructorProfile } from "../types";
import { 
  X, 
  Clock, 
  MapPin, 
  Video, 
  User, 
  Users, 
  Globe, 
  CheckCircle2, 
  Link2, 
  Plus, 
  Search, 
  Trash2,
  Calendar,
  FileText,
  BookmarkCheck,
  ChevronRight,
  AlertTriangle,
  Check,
  Copy,
  Layers,
  ClipboardList,
  CheckSquare,
  Info,
  ListTodo,
  BookOpen,
  Sliders,
  ShieldAlert,
  History,
  UserCheck,
  FileSpreadsheet,
  Download,
  Activity,
  FileCheck,
  Eye,
  Lock,
  LockOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface EventDetailModalProps {
  event: CalendarEvent;
  onClose: () => void;
  allTasks: GoogleTask[];
  linkedTaskIds: string[];
  onLinkTask: (taskId: string) => void;
  onUnlinkTask: (taskId: string) => void;
  onToggleTaskStatus: (taskId: string) => void;
  eventResources: Record<string, { 
    aula: string; 
    materials: string[]; 
    embarcacion?: string;
    numAlumnos?: number;
    instructor?: string;
    codigoCurso?: string;
    completedAuditTasks?: string[];
    // Extended fields
    tipoCurso?: string;
    estado?: string;
    students?: StudentInfo[];
    incidents?: CourseIncident[];
    documents?: CourseDocument[];
    auditLogs?: CourseAuditLog[];
    courseNotes?: CourseNotesData;
  }>;
  onSaveResources: (eventId: string, resources: { 
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
  }) => void;
  allEvents: CalendarEvent[];
  onUpdateEvent: (eventId: string, updatedFields: Partial<CalendarEvent>) => void;
  teacherAvailabilityStatus?: { status: string; label: string };
  aulasList?: string[];
  embarcacionesList?: string[];
  staffDatabase?: InstructorProfile[];
  userRole?: string;
  userEmail?: string;
}

export interface AuditTask {
  id: string;
  label: string;
  responsible: string;
  document?: string;
  deadline?: string;
}

export const AUDIT_TASKS: AuditTask[] = [
  { id: "t1", label: "Planificación de curso formativo", responsible: "D / DF", deadline: "" },
  { id: "t2", label: "Organización del curso (revisión de especificaciones)", responsible: "D / DF", deadline: "" },
  { id: "t3", label: "Presentación pública de la oferta educativa", responsible: "D / DF", deadline: "" },
  { id: "t4", label: "Admisión e inscripción de alumnos", responsible: "D / DF", document: "PO03-FT01 Hoja de Inscripción", deadline: "" },
  { id: "t5", label: "Confirmación de la realización del curso", responsible: "D / DF", deadline: "" },
  { id: "t6", label: "Alta del curso en Dropbox (apertura de carpeta y asignación de nº correlativo)", responsible: "DF", deadline: "15 días antes" },
  { id: "t7", label: "Asignación nº de curso DGMM", responsible: "D", deadline: "15 días antes" },
  { id: "t8", label: "Comunicaciones previas a CM y DGMM con copia a DF y a RSGI", responsible: "D", document: "Comunicación de curso", deadline: "15 días antes" },
  { id: "t9", label: "Comunicación a la empresa contratante (sólo cursos a empresas)", responsible: "DF", deadline: "" },
  { id: "t10", label: "Determinación del instructor / evaluador del curso", responsible: "DF", deadline: "" },
  { id: "t11", label: "Organización del viaje, la estancia y los gastos del instructor / evaluador", responsible: "DF", deadline: "" },
  { id: "t12", label: "Envío del material docente y didáctico al lugar de impartición", responsible: "DF", deadline: "" },
  { id: "t13", label: "Comprobación del material recibido", responsible: "INS", document: "Lista de material del curso", deadline: "" },
  { id: "t14", label: "Envío de instrucciones para formadores", responsible: "RSGI", deadline: "" },
  { id: "t15", label: "Confirmación detalles curso con el instructor/empresa", responsible: "D / DF", deadline: "4 días antes" },
  { id: "t16", label: "Presentación del curso a los alumnos y agenda", responsible: "INS", deadline: "Día inicio" },
  { id: "t17", label: "Confirmación de datos de los alumnos por el instructor", responsible: "INS", deadline: "Día inicio" },
  { id: "t18", label: "Confirmación datos de los alumnos a Dirección", responsible: "INS", deadline: "Día inicio" },
  { id: "t19", label: "Comunicación inicio a CM y DGMM", responsible: "D", deadline: "Día inicio" },
  { id: "t20", label: "Entrega del programa técnico y horario a los alumnos", responsible: "INS", document: "Programa técnico", deadline: "Día inicio" },
  { id: "t21", label: "Entrega del material didáctico del curso a los alumnos", responsible: "INS", document: "Manuales, etc.", deadline: "Día inicio" },
  { id: "t22", label: "Control de asistencia de los alumnos y del número máximo de faltas permitido", responsible: "INS", document: "PO03-FT03 Hoja de control de asistencia de los alumnos", deadline: "Durante el curso" },
  { id: "t23", label: "Evaluación de la competencia de los alumnos", responsible: "INS", document: "PO03-IT01 Criterios de evaluación. Examen", deadline: "Durante el curso" },
  { id: "t24", label: "Valoración del curso por los alumnos", responsible: "INS", document: "PO03-FT05 Encuesta final por los alumnos", deadline: "Último día" },
  { id: "t25", label: "Entrega de diplomas certificativos de superación del curso formativo y firma recibí alumnos", responsible: "INS", document: "Certificados PO03-FT04 Recibí Certificados", deadline: "Último día" },
  { id: "t26", label: "Completar el acta del curso de formación", responsible: "INS", document: "PO03-FT02 Acta del curso de formación", deadline: "Último día" },
  { id: "t27", label: "Envío del acta electrónica a la Dirección General de la Marina Mercante y al Director de Formación", responsible: "D", document: "Acta Electrónica", deadline: "Último día" },
  { id: "t28", label: "Comunicación de datos finales de los alumnos aptos a DGMM", responsible: "D", deadline: "En 72 h" },
  { id: "t29", label: "Envío del material y documentación del curso al DF", responsible: "INS", deadline: "A la finalización" },
  { id: "t30", label: "Chequeo del material y documentación del curso", responsible: "DF", document: "PO03-FT09 Listado de documentos del curso", deadline: "" },
  { id: "t31", label: "Envío documentación del curso a RSGI", responsible: "DF", deadline: "" },
  { id: "t32", label: "Chequeo documentación del curso", responsible: "RSGI", document: "PO03-FT09 Listado de documentos del curso", deadline: "" },
  { id: "t33", label: "Solicitud de la valoración del curso por el instructor", responsible: "RSGI", document: "PO03-FT06 Valoración del curso por el instructor", deadline: "" },
  { id: "t34", label: "Estudio de la satisfacción general de los clientes - empresa (llamada telefónica) y comunicación a RSGI", responsible: "D", document: "PO03-FT08 Impresiones de clientes", deadline: "" },
  { id: "t35", label: "Encuesta final a empresas", responsible: "RSGI", document: "PO03-FT07 Encuesta final a empresas", deadline: "" },
  { id: "t36", label: "Tratamiento de datos de satisfacción del curso", responsible: "RSGI", document: "Gráfica de satisfacción de clientes", deadline: "" },
  { id: "t37", label: "Resumen del curso formativo: registro incidencias y OM en SPIRO. ", responsible: "RSGI", deadline: "" },
  { id: "t38", label: "Entrega de carpeta física del curso a Dirección para su archivo", responsible: "RSGI", document: "Carpeta física del curso", deadline: "" }
];

const AULAS_DISPONIBLES = [
  "Aula Teórica del Puerto",
  "Aula de Simulación Práctica",
  "Aula Náutica B",
  "Simulador de Radio GMDSS"
];

const EMBARCACIONES_DISPONIBLES = [
  "Velero Escuela 'Capitán Pronautic'",
  "Lancha Motora 'MiniPronautic'",
  "Yate de Prácticas 'Alborán'",
  "Semirrígida de Apoyo 'Pronautic Dos'"
];

const MATERIALES_DISPONIBLES = [
  "Kit de Cartas de Navegación y Transportador",
  "Chalecos Salvavidas Homologados (SOLAS)",
  "Radio VHF Portátil GMDSS",
  "Proyector Digital y Pantalla",
  "Kit de Cabullería y Amarras",
  "Dispositivo GPS Plotter Garmin"
];


export default function EventDetailModal({
  event,
  onClose,
  allTasks,
  linkedTaskIds,
  onLinkTask,
  onUnlinkTask,
  onToggleTaskStatus,
  eventResources,
  onSaveResources,
  allEvents,
  onUpdateEvent,
  teacherAvailabilityStatus,
  aulasList = AULAS_DISPONIBLES,
  embarcacionesList = EMBARCACIONES_DISPONIBLES,
  staffDatabase = [],
  userRole = "admin",
  userEmail = "instructorspronautic@gmail.com"
}: EventDetailModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Parameter Editing States
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState(event.summary || "");
  const [editedDescription, setEditedDescription] = useState(event.description || "");
  const [editedLocation, setEditedLocation] = useState(event.location || "");

  const [selectedAula, setSelectedAula] = useState<string>(() => {
    return eventResources[event.id]?.aula || "";
  });
  const [selectedEmbarcacion, setSelectedEmbarcacion] = useState<string>(() => {
    return eventResources[event.id]?.embarcacion || "";
  });
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(() => {
    return eventResources[event.id]?.materials || [];
  });

  const [numAlumnos, setNumAlumnos] = useState<number | "">(() => {
    return eventResources[event.id]?.numAlumnos || "";
  });
  const [instructorName, setInstructorName] = useState<string>(() => {
    return eventResources[event.id]?.instructor || "";
  });
  const [codigoCurso, setCodigoCurso] = useState<string>(() => {
    return eventResources[event.id]?.codigoCurso || "";
  });
  const [completedAuditTasks, setCompletedAuditTasks] = useState<string[]>(() => {
    return eventResources[event.id]?.completedAuditTasks || [];
  });

  // Automatically compute if this is a Course, or allow manually forced
  const isCourseAuto = useMemo(() => {
    const title = (event.summary || "").toLowerCase();
    const desc = (event.description || "").toLowerCase();
    return (
      title.includes("curso") || title.includes("clase") || title.includes("práctica") || title.includes("formación") ||
      title.includes("licencia") || title.includes("p.e.r") || title.includes("p.e.y") || title.includes("patrón") ||
      title.includes("vela") || title.includes("motor") || desc.includes("curso") || desc.includes("clase") ||
      desc.includes("práctica") || desc.includes("formación")
    );
  }, [event]);

  const [forceIsCourse, setForceIsCourse] = useState<boolean>(() => {
    return eventResources[event.id]?.numAlumnos !== undefined || eventResources[event.id]?.instructor !== undefined ? true : isCourseAuto;
  });

  // Active auditing tab: 'previo' | 'impartición' | 'cierre'
  const [activeAuditTab, setActiveAuditTab] = useState<"previo" | "impartición" | "cierre">("previo");

  // Auditing role filter: ALL | D (Rober) | DF (Raquel) | INS (Main Instructor) | RSGI (Raquel SGI)
  const [auditRoleFilter, setAuditRoleFilter] = useState<"ALL" | "D" | "DF" | "INS" | "RSGI">("ALL");

  // Extended state models
  const [tipoCurso, setTipoCurso] = useState<string>(() => {
    return eventResources[event.id]?.tipoCurso || "STCW Formación Básica de Seguridad";
  });
  const [estadoCurso, setEstadoCurso] = useState<string>(() => {
    return eventResources[event.id]?.estado || "BORRADOR";
  });
  const [students, setStudents] = useState<StudentInfo[]>(() => {
    return eventResources[event.id]?.students || [];
  });
  const [incidents, setIncidents] = useState<CourseIncident[]>(() => {
    return eventResources[event.id]?.incidents || [];
  });
  const [documents, setDocuments] = useState<CourseDocument[]>(() => {
    return eventResources[event.id]?.documents || [
      { id: "d1", name: "Ficha Inscripción y Matrícula (PO03-FT01)", type: "acta", createdAt: new Date().toISOString(), createdBy: "Sistema", hash: "SHA256: 7fbc29e1a8", digitallySigned: false },
      { id: "d2", name: "Hoja de Control de Asistencia (PO03-FT03)", type: "asistencia", createdAt: new Date().toISOString(), createdBy: "Sistema", hash: "SHA256: c2b8ff18d6", digitallySigned: false },
      { id: "d3", name: "Acta Oficial del Curso de Formación (PO03-FT02)", type: "acta", createdAt: new Date().toISOString(), createdBy: "Sistema", hash: "SHA256: e8d4bc402a", digitallySigned: false },
      { id: "d4", name: "Encuesta Final de Satisfacción (PO03-FT05)", type: "encuesta", createdAt: new Date().toISOString(), createdBy: "Sistema", hash: "SHA256: 3a9a101bcf", digitallySigned: false }
    ];
  });
  const [auditLogs, setAuditLogs] = useState<CourseAuditLog[]>(() => {
    return eventResources[event.id]?.auditLogs || [
      {
        timestamp: new Date().toISOString(),
        userRole: "Sistema",
        userEmail: "system@pronautic.com",
        action: "Operación formativa registrada localmente como Entidad Viva."
      }
    ];
  });

  // State variables for Catalan operational note / checklist template (requested by user)
  const [dataActualitzacio, setDataActualitzacio] = useState<string>(() => {
    return eventResources[event.id]?.courseNotes?.dataActualitzacio || "25/05/2026";
  });
  const [horariInici, setHorariInici] = useState<string>(() => {
    return eventResources[event.id]?.courseNotes?.horariInici || "09:00h";
  });
  const [horariDescans, setHorariDescans] = useState<string>(() => {
    return eventResources[event.id]?.courseNotes?.horariDescans || "13:00 - 14:00h";
  });
  const [horariFinalitzacio, setHorariFinalitzacio] = useState<string>(() => {
    return eventResources[event.id]?.courseNotes?.horariFinalitzacio || "18:00h";
  });
  const [insPrincipalNom, setInsPrincipalNom] = useState<string>(() => {
    return eventResources[event.id]?.courseNotes?.instructorPrincipalNom || eventResources[event.id]?.instructor || "";
  });
  const [insPrincipalContractacio, setInsPrincipalContractacio] = useState<string>(() => {
    return eventResources[event.id]?.courseNotes?.instructorPrincipalContractacio || "29 de maig";
  });
  const [insSecundariNom, setInsSecundariNom] = useState<string>(() => {
    return eventResources[event.id]?.courseNotes?.instructorSecundariNom || "";
  });
  const [insSecundariContractacio, setInsSecundariContractacio] = useState<string>(() => {
    return eventResources[event.id]?.courseNotes?.instructorSecundariContractacio || "";
  });
  const [clausPortOlimpic, setClausPortOlimpic] = useState<boolean>(() => {
    return eventResources[event.id]?.courseNotes?.clausPortOlimpic || false;
  });
  const [clausBNC, setClausBNC] = useState<boolean>(() => {
    return eventResources[event.id]?.courseNotes?.clausBNC || false;
  });
  const [targetaPortOlimpic, setTargetaPortOlimpic] = useState<boolean>(() => {
    return eventResources[event.id]?.courseNotes?.targetaPortOlimpic || false;
  });
  const [targetaBNC, setTargetaBNC] = useState<boolean>(() => {
    return eventResources[event.id]?.courseNotes?.targetaBNC || false;
  });
  const [nombreAlumnesCurs, setNombreAlumnesCurs] = useState<number>(() => {
    return eventResources[event.id]?.courseNotes?.nombreAlumnesCurs ?? eventResources[event.id]?.numAlumnos ?? 6;
  });
  const [mccCount, setMccCount] = useState<number>(() => {
    return eventResources[event.id]?.courseNotes?.mccCount ?? 3;
  });
  const [mcrCount, setMcrCount] = useState<number>(() => {
    return eventResources[event.id]?.courseNotes?.mcrCount ?? 4;
  });

  const [activeTab, setActiveTab] = useState<"recursos" | "alumnos" | "procesos" | "incidencias" | "auditoria">("recursos");

  // Form input helper states
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentDNI, setNewStudentDNI] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");

  const [newIncidentCategory, setNewIncidentCategory] = useState<"seguridad" | "calidad" | "operativo" | "legal" | "infraestructura">("calidad");
  const [newIncidentSeverity, setNewIncidentSeverity] = useState<"bajo" | "medio" | "alto">("medio");
  const [newIncidentDesc, setNewIncidentDesc] = useState("");

  // AI Copilot state
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Note Tab selection and Clipboard status
  const [copiedNote, setCopiedNote] = useState(false);
  const [noteTab, setNoteTab] = useState<"lectura" | "editar">("lectura");

  const getCompiledOperationalNote = () => {
    return `📅 Data d’actualització: ${dataActualitzacio}
Officially compiled by Pronautic Compliance Copilot.
🕘 Horari del curs:
• Inici: ${horariInici}
• Descans: ${horariDescans}
• Finalització: ${horariFinalitzacio}

👤 Instructor principal:
• Nom: ${insPrincipalNom || "Sense assignar"}
• Tipus de contractació: ${insPrincipalContractacio || "Sense especificar"}

👤 Instructor secundari (si escau):
• Nom: ${insSecundariNom || "Ningú"}
• Tipus de contractació: ${insSecundariContractacio || "N/A"}

🔐 Accesos necessaris:
• Claus Port Olímpic: ${clausPortOlimpic ? "SÍ" : "NO"}
• Claus BNC: ${clausBNC ? "SÍ" : "NO"}
• Targeta Port Olímpic: ${targetaPortOlimpic ? "SÍ" : "NO"}
• Targeta BNC: ${targetaBNC ? "SÍ" : "NO"}

👥 Nombre d’alumnes curs complet: ${nombreAlumnesCurs}

MCC: ${mccCount}
MCR: ${mcrCount}
📚 Aula assignada: ${selectedAula || "n/a"}`;
  };

  const handleCopyNote = () => {
    try {
      navigator.clipboard.writeText(getCompiledOperationalNote());
    } catch (err) {
      console.warn("Could not copy automatically via navigator.clipboard:", err);
    }
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  // State modification and safe auto-saving synchronizer
  const saveStateChanges = (
    updatedAula = selectedAula,
    updatedEmbarcacion = selectedEmbarcacion,
    updatedMaterials = selectedMaterials,
    updatedAlumnosCount = numAlumnos !== "" ? Number(numAlumnos) : undefined,
    updatedInstructor = instructorName,
    updatedCodigo = codigoCurso,
    updatedAuditTasksList = completedAuditTasks,
    updatedTipo = tipoCurso,
    updatedEstado = estadoCurso,
    updatedSts = students,
    updatedIncs = incidents,
    updatedDocs = documents,
    updatedLogs = auditLogs,
    updatedCourseNotes: CourseNotesData = {
      dataActualitzacio,
      horariInici,
      horariDescans,
      horariFinalitzacio,
      instructorPrincipalNom: insPrincipalNom,
      instructorPrincipalContractacio: insPrincipalContractacio,
      instructorSecundariNom: insSecundariNom,
      instructorSecundariContractacio: insSecundariContractacio,
      clausPortOlimpic,
      clausBNC,
      targetaPortOlimpic,
      targetaBNC,
      nombreAlumnesCurs: Number(nombreAlumnesCurs),
      mccCount: Number(mccCount),
      mcrCount: Number(mcrCount)
    }
  ) => {
    onSaveResources(event.id, {
      aula: updatedAula,
      embarcacion: updatedEmbarcacion,
      materials: updatedMaterials,
      numAlumnos: updatedAlumnosCount,
      instructor: updatedInstructor,
      codigoCurso: updatedCodigo,
      completedAuditTasks: updatedAuditTasksList,
      tipoCurso: updatedTipo,
      estado: updatedEstado,
      students: updatedSts,
      incidents: updatedIncs,
      documents: updatedDocs,
      auditLogs: updatedLogs,
      courseNotes: updatedCourseNotes
    });
  };

  const parseDescriptionForData = () => {
    const desc = (editedDescription || event.description || "");

    let fieldsToUpdate: Partial<CourseNotesData> = {};
    let manualFields: { numAlumnos?: number, instructor?: string, codigo?: string, aula?: string, estado?: string } = {};

    const dgmmMatch = desc.match(/Codigo DGMM:\s*([^\n]+)/i) || desc.match(/Código DGMM:\s*([^\n]+)/i);
    if (dgmmMatch) manualFields.codigo = dgmmMatch[1].trim();

    const alumnosMatch = desc.match(/Nombre d(?:'|’)alumnes(?: curs complet)?:\s*(\d+)/i) || desc.match(/Nombre d(?:'|’)alumnes:\s*(\d+)/i);
    if (alumnosMatch) {
      manualFields.numAlumnos = parseInt(alumnosMatch[1], 10);
      fieldsToUpdate.nombreAlumnesCurs = manualFields.numAlumnos;
    }

    const mccMatch = desc.match(/MCC:\s*(\d+)/i);
    if (mccMatch) fieldsToUpdate.mccCount = parseInt(mccMatch[1], 10);
    
    const mcrMatch = desc.match(/MCR:\s*(\d+)/i);
    if (mcrMatch) fieldsToUpdate.mcrCount = parseInt(mcrMatch[1], 10);

    const dataActualitzacioMatch = desc.match(/Data d(?:'|’)actualitzaci[oó]:\s*([\d/]+)/i);
    if (dataActualitzacioMatch) fieldsToUpdate.dataActualitzacio = dataActualitzacioMatch[1];

    const insPrinMatch = desc.match(/Instructor principal:[\s\S]*?Nom:\s*([^\n]+)/i);
    if (insPrinMatch) {
      const name = insPrinMatch[1].trim();
      fieldsToUpdate.instructorPrincipalNom = name;
      manualFields.instructor = name;
    }
    
    const insSecMatch = desc.match(/Instructor secundari.*?:\s*([\s\S]*?)(?:🩺|🔐|👥|📚|CURSOS)/i);
    if (insSecMatch) {
       const rawLines = insSecMatch[1];
       const names = Array.from(rawLines.matchAll(/Nom:\s*([^\n]+)/gi)).map(m => m[1].trim()).join(" | ");
       if (names) fieldsToUpdate.instructorSecundariNom = names;
    }

    const aulaMatch = desc.match(/Aula assignada:\s*([^\n]+)/i);
    if (aulaMatch) {
      const aulaStr = aulaMatch[1].trim();
      if (aulaStr.toLowerCase().includes("gran") || aulaStr.toLowerCase().includes("teorica") || aulaStr.toLowerCase().includes("teórica")) {
         manualFields.aula = "Aula Teórica del Puerto";
      } else if (aulaStr.toLowerCase().includes("b") || aulaStr.toLowerCase().includes("náutica b")) {
         manualFields.aula = "Aula Náutica B";
      } else {
         manualFields.aula = "Aula de Simulación Práctica"; 
      }
    }

    if (manualFields.codigo) setCodigoCurso(manualFields.codigo);
    if (manualFields.numAlumnos !== undefined) setNumAlumnos(manualFields.numAlumnos);
    if (manualFields.instructor) setInstructorName(manualFields.instructor);
    if (manualFields.aula) setSelectedAula(manualFields.aula);

    handleUpdateNoteField(fieldsToUpdate);
    alert("✨ ¡Datos fácticos extraídos de la Descripción/Notas y mapeados al simulador!");
  };

  const addAuditLog = (actionText: string, customLogs?: CourseAuditLog[]) => {
    const newLog: CourseAuditLog = {
      timestamp: new Date().toISOString(),
      userRole: userRole,
      userEmail: userEmail,
      action: actionText
    };
    const updated = customLogs ? [...customLogs, newLog] : [...auditLogs, newLog];
    setAuditLogs(updated);
    return updated;
  };

  const handleUpdateNoteField = (fields: Partial<CourseNotesData>) => {
    // Determine updated state values
    const nextDataActualitzacio = fields.dataActualitzacio !== undefined ? fields.dataActualitzacio : dataActualitzacio;
    const nextHorariInici = fields.horariInici !== undefined ? fields.horariInici : horariInici;
    const nextHorariDescans = fields.horariDescans !== undefined ? fields.horariDescans : horariDescans;
    const nextHorariFinalitzacio = fields.horariFinalitzacio !== undefined ? fields.horariFinalitzacio : horariFinalitzacio;
    const nextInsPrincipalNom = fields.instructorPrincipalNom !== undefined ? fields.instructorPrincipalNom : insPrincipalNom;
    const nextInsPrincipalContractacio = fields.instructorPrincipalContractacio !== undefined ? fields.instructorPrincipalContractacio : insPrincipalContractacio;
    const nextInsSecundariNom = fields.instructorSecundariNom !== undefined ? fields.instructorSecundariNom : insSecundariNom;
    const nextInsSecundariContractacio = fields.instructorSecundariContractacio !== undefined ? fields.instructorSecundariContractacio : insSecundariContractacio;
    const nextClausPortOlimpic = fields.clausPortOlimpic !== undefined ? fields.clausPortOlimpic : clausPortOlimpic;
    const nextClausBNC = fields.clausBNC !== undefined ? fields.clausBNC : clausBNC;
    const nextTargetaPortOlimpic = fields.targetaPortOlimpic !== undefined ? fields.targetaPortOlimpic : targetaPortOlimpic;
    const nextTargetaBNC = fields.targetaBNC !== undefined ? fields.targetaBNC : targetaBNC;
    const nextNombreAlumnesCurs = fields.nombreAlumnesCurs !== undefined ? fields.nombreAlumnesCurs : nombreAlumnesCurs;
    const nextMccCount = fields.mccCount !== undefined ? fields.mccCount : mccCount;
    const nextMcrCount = fields.mcrCount !== undefined ? fields.mcrCount : mcrCount;

    // Set local states
    if (fields.dataActualitzacio !== undefined) setDataActualitzacio(fields.dataActualitzacio);
    if (fields.horariInici !== undefined) setHorariInici(fields.horariInici);
    if (fields.horariDescans !== undefined) setHorariDescans(fields.horariDescans);
    if (fields.horariFinalitzacio !== undefined) setHorariFinalitzacio(fields.horariFinalitzacio);
    if (fields.instructorPrincipalNom !== undefined) setInsPrincipalNom(fields.instructorPrincipalNom);
    if (fields.instructorPrincipalContractacio !== undefined) setInsPrincipalContractacio(fields.instructorPrincipalContractacio);
    if (fields.instructorSecundariNom !== undefined) setInsSecundariNom(fields.instructorSecundariNom);
    if (fields.instructorSecundariContractacio !== undefined) setInsSecundariContractacio(fields.instructorSecundariContractacio);
    if (fields.clausPortOlimpic !== undefined) setClausPortOlimpic(fields.clausPortOlimpic);
    if (fields.clausBNC !== undefined) setClausBNC(fields.clausBNC);
    if (fields.targetaPortOlimpic !== undefined) setTargetaPortOlimpic(fields.targetaPortOlimpic);
    if (fields.targetaBNC !== undefined) setTargetaBNC(fields.targetaBNC);
    if (fields.nombreAlumnesCurs !== undefined) setNombreAlumnesCurs(fields.nombreAlumnesCurs);
    if (fields.mccCount !== undefined) setMccCount(fields.mccCount);
    if (fields.mcrCount !== undefined) setMcrCount(fields.mcrCount);

    const updatedNote: CourseNotesData = {
      dataActualitzacio: nextDataActualitzacio,
      horariInici: nextHorariInici,
      horariDescans: nextHorariDescans,
      horariFinalitzacio: nextHorariFinalitzacio,
      instructorPrincipalNom: nextInsPrincipalNom,
      instructorPrincipalContractacio: nextInsPrincipalContractacio,
      instructorSecundariNom: nextInsSecundariNom,
      instructorSecundariContractacio: nextInsSecundariContractacio,
      clausPortOlimpic: nextClausPortOlimpic,
      clausBNC: nextClausBNC,
      targetaPortOlimpic: nextTargetaPortOlimpic,
      targetaBNC: nextTargetaBNC,
      nombreAlumnesCurs: Number(nextNombreAlumnesCurs),
      mccCount: Number(nextMccCount),
      mcrCount: Number(nextMcrCount),
    };

    const actionMsg = `Ficha de control actualizada (${Object.keys(fields).join(", ")})`;
    const logs = addAuditLog(actionMsg);
    
    saveStateChanges(
      selectedAula,
      selectedEmbarcacion,
      selectedMaterials,
      numAlumnos !== "" ? Number(numAlumnos) : undefined,
      instructorName,
      codigoCurso,
      completedAuditTasks,
      tipoCurso,
      estadoCurso,
      students,
      incidents,
      documents,
      logs,
      updatedNote
    );
  };

  // Update inputs if event details change underneath
  useEffect(() => {
    setEditedSummary(event.summary || "");
    setEditedDescription(event.description || "");
    setEditedLocation(event.location || "");
    setSelectedAula(eventResources[event.id]?.aula || "");
    setSelectedEmbarcacion(eventResources[event.id]?.embarcacion || "");
    setSelectedMaterials(eventResources[event.id]?.materials || []);

    const loadedAlumnos = eventResources[event.id]?.numAlumnos ?? "";
    const loadedInstructor = eventResources[event.id]?.instructor ?? "";
    const loadedCodigo = eventResources[event.id]?.codigoCurso ?? "";
    const loadedAuditTasks = eventResources[event.id]?.completedAuditTasks ?? [];

    setNumAlumnos(loadedAlumnos);
    setInstructorName(loadedInstructor);
    setCodigoCurso(loadedCodigo);
    setCompletedAuditTasks(loadedAuditTasks);

    const isThisCourse = eventResources[event.id]?.numAlumnos !== undefined || eventResources[event.id]?.instructor !== undefined ? true : (
      (event.summary || "").toLowerCase().includes("curso") || 
      (event.summary || "").toLowerCase().includes("clase") || 
      (event.summary || "").toLowerCase().includes("práctica") || 
      (event.summary || "").toLowerCase().includes("formación") ||
      (event.summary || "").toLowerCase().includes("licencia") || 
      (event.summary || "").toLowerCase().includes("p.e.r") || 
      (event.summary || "").toLowerCase().includes("p.e.y") || 
      (event.summary || "").toLowerCase().includes("patrón") ||
      (event.summary || "").toLowerCase().includes("vela") || 
      (event.summary || "").toLowerCase().includes("motor") || 
      (event.summary || "").toLowerCase().includes("gmdss") || 
      (event.summary || "").toLowerCase().includes("stcw") || 
      (event.description || "").toLowerCase().includes("curso") || 
      (event.description || "").toLowerCase().includes("clase") ||
      (event.description || "").toLowerCase().includes("práctica") || 
      (event.description || "").toLowerCase().includes("formación")
    );
    setForceIsCourse(isThisCourse);

    const saved = eventResources[event.id];
    setTipoCurso(saved?.tipoCurso || "STCW Formación Básica de Seguridad");
    setEstadoCurso(saved?.estado || "BORRADOR");
    setStudents(saved?.students || []);
    setIncidents(saved?.incidents || []);
    setDocuments(saved?.documents || [
      { id: "d1", name: "Ficha Inscripción y Matrícula (PO03-FT01)", type: "acta", createdAt: new Date().toISOString(), createdBy: "Sistema", hash: "SHA256: 7fbc29e1a8", digitallySigned: false },
      { id: "d2", name: "Hoja de Control de Asistencia (PO03-FT03)", type: "asistencia", createdAt: new Date().toISOString(), createdBy: "Sistema", hash: "SHA256: c2b8ff18d6", digitallySigned: false },
      { id: "d3", name: "Acta Oficial del Curso de Formación (PO03-FT02)", type: "acta", createdAt: new Date().toISOString(), createdBy: "Sistema", hash: "SHA256: e8d4bc402a", digitallySigned: false },
      { id: "d4", name: "Encuesta Final de Satisfacción (PO03-FT05)", type: "encuesta", createdAt: new Date().toISOString(), createdBy: "Sistema", hash: "SHA256: 3a9a101bcf", digitallySigned: false }
    ]);
    setAuditLogs(saved?.auditLogs || [
      {
        timestamp: new Date().toISOString(),
        userRole: "Sistema",
        userEmail: "system@pronautic.com",
        action: "Operación formativa cargada de la persistencia local de Pronautic."
      }
    ]);

    // Catalan Operational notes template loader
    setDataActualitzacio(saved?.courseNotes?.dataActualitzacio || "25/05/2026");
    setHorariInici(saved?.courseNotes?.horariInici || "09:00h");
    setHorariDescans(saved?.courseNotes?.horariDescans || "13:00 - 14:00h");
    setHorariFinalitzacio(saved?.courseNotes?.horariFinalitzacio || "18:00h");
    setInsPrincipalNom(saved?.courseNotes?.instructorPrincipalNom || saved?.instructor || "");
    setInsPrincipalContractacio(saved?.courseNotes?.instructorPrincipalContractacio || "29 de maig");
    setInsSecundariNom(saved?.courseNotes?.instructorSecundariNom || "");
    setInsSecundariContractacio(saved?.courseNotes?.instructorSecundariContractacio || "");
    setClausPortOlimpic(saved?.courseNotes?.clausPortOlimpic || false);
    setClausBNC(saved?.courseNotes?.clausBNC || false);
    setTargetaPortOlimpic(saved?.courseNotes?.targetaPortOlimpic || false);
    setTargetaBNC(saved?.courseNotes?.targetaBNC || false);
    setNombreAlumnesCurs(saved?.courseNotes?.nombreAlumnesCurs ?? saved?.numAlumnos ?? 6);
    setMccCount(saved?.courseNotes?.mccCount ?? 3);
    setMcrCount(saved?.courseNotes?.mcrCount ?? 4);
    
    // Auto sync state when switching events
    const autoIsCourse = (
      (event.summary || "").toLowerCase().includes("curso") ||
      (event.summary || "").toLowerCase().includes("clase") ||
      (event.summary || "").toLowerCase().includes("práctica") ||
      (event.summary || "").toLowerCase().includes("formación") ||
      (event.summary || "").toLowerCase().includes("licencia") ||
      (event.summary || "").toLowerCase().includes("p.e.r") ||
      (event.summary || "").toLowerCase().includes("p.e.y") ||
      (event.summary || "").toLowerCase().includes("patrón") ||
      (event.summary || "").toLowerCase().includes("vela") ||
      (event.summary || "").toLowerCase().includes("motor") ||
      (event.description || "").toLowerCase().includes("curso") ||
      (event.description || "").toLowerCase().includes("clase") ||
      (event.description || "").toLowerCase().includes("práctica") ||
      (event.description || "").toLowerCase().includes("formación")
    );
    setForceIsCourse(loadedAlumnos !== "" || loadedInstructor !== "" ? true : autoIsCourse);
  }, [event, eventResources]);

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Helper to read start and end times in ms
  const getEventTimes = (e: CalendarEvent) => {
    const startStr = e.start?.dateTime || e.start?.date;
    const endStr = e.end?.dateTime || e.end?.date;
    if (!startStr) return null;
    const startTime = new Date(startStr).getTime();
    // Default 1 hour if end time is missing or identical
    let endTime = endStr ? new Date(endStr).getTime() : startTime + 60 * 60 * 1000;
    if (endTime <= startTime) {
      endTime = startTime + 60 * 60 * 1000;
    }
    return { startTime, endTime };
  };

  // Memoized conflict checking list
  const conflictResult = useMemo(() => {
    const times = getEventTimes(event);
    if (!times) return { hasConflict: false, hasBlockerConflict: false, messages: [] as string[] };

    const currentStart = times.startTime;
    const currentEnd = times.endTime;
    const messages: string[] = [];
    let hasBlockerConflict = false;

    allEvents.forEach((other) => {
      // Skip the current event itself
      if (other.id === event.id) return;

      const otherTimes = getEventTimes(other);
      if (!otherTimes) return;

      // Check if they overlap chronologically
      const isOverlapping = (currentStart < otherTimes.endTime && currentEnd > otherTimes.startTime);
      if (!isOverlapping) return;

      const otherAlloc = eventResources[other.id];
      if (!otherAlloc) return;

      // Classroom conflict (Blocker!)
      if (selectedAula && otherAlloc.aula === selectedAula) {
        hasBlockerConflict = true;
        messages.push(
          `❌ Aula Ocupada: El espacio "${selectedAula}" ya está reservado por el evento "${other.summary || "Sin título"}" (${new Date(otherTimes.startTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} - ${new Date(otherTimes.endTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}).`
        );
      }

      // Embarcacion conflict (Blocker!)
      if (selectedEmbarcacion && otherAlloc.embarcacion === selectedEmbarcacion) {
        hasBlockerConflict = true;
        messages.push(
          `❌ Embarcación Ocupada: El barco "${selectedEmbarcacion}" ya está asignado al evento "${other.summary || "Sin título"}" (${new Date(otherTimes.startTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} - ${new Date(otherTimes.endTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}).`
        );
      }

      // Materials conflict (Warning)
      if (selectedMaterials.length > 0 && otherAlloc.materials && otherAlloc.materials.length > 0) {
        const shared = selectedMaterials.filter((m) => otherAlloc.materials.includes(m));
        if (shared.length > 0) {
          messages.push(
            `⚠️ Material en uso: El equipamiento "${shared.join(", ")}" ya está de servicio en el evento "${other.summary || "Sin título"}" (${new Date(otherTimes.startTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} - ${new Date(otherTimes.endTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}).`
          );
        }
      }
    });

    return {
      hasConflict: messages.length > 0,
      hasBlockerConflict,
      messages
    };
  }, [selectedAula, selectedEmbarcacion, selectedMaterials, event, allEvents, eventResources]);

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSaveAllocation = () => {
    if (forceIsCourse) {
      if (numAlumnos === "" || Number(numAlumnos) <= 0) {
        setSaveError("❌ Error de Calidad Pronautic: El número de alumnos es un dato obligatorio y debe ser mayor que 0.");
        setTimeout(() => setSaveError(null), 5000);
        return;
      }
      if (!instructorName.trim()) {
        setSaveError("❌ Error de Calidad Pronautic: El instructor es un dato obligatorio. Por favor asigna un formador.");
        setTimeout(() => setSaveError(null), 5000);
        return;
      }
    }

    if (conflictResult.hasBlockerConflict) {
      setSaveError("No se puede agendar: Hay un solapamiento en el espacio seleccionado o con la misma embarcación.");
      setTimeout(() => setSaveError(null), 5000);
      return;
    }
    setSaveError(null);
    
    const logs = addAuditLog(`Recursos actualizados localmente: Aula [${selectedAula || "Ninguna"}], Barco [${selectedEmbarcacion || "Ninguno"}], Alumnos [${numAlumnos}], Instructor [${instructorName}].`);
    
    saveStateChanges(
      selectedAula,
      selectedEmbarcacion,
      selectedMaterials,
      numAlumnos !== "" ? Number(numAlumnos) : undefined,
      instructorName,
      codigoCurso,
      completedAuditTasks,
      tipoCurso,
      estadoCurso,
      students,
      incidents,
      documents,
      logs
    );
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleToggleMaterial = (mat: string) => {
    setSelectedMaterials((prev) => {
      if (prev.includes(mat)) {
        return prev.filter((m) => m !== mat);
      } else {
        return [...prev, mat];
      }
    });
  };

  const handleToggleAuditTask = (id: string) => {
    setCompletedAuditTasks((prev) => {
      let updated: string[];
      if (prev.includes(id)) {
        updated = prev.filter((tId) => tId !== id);
      } else {
        updated = [...prev, id];
      }
      const taskObj = AUDIT_TASKS.find(t => t.id === id);
      const logMsg = `Checklist DGMM [${taskObj?.label || id}] ${prev.includes(id) ? "DESCHEQUEADO" : "CHEQUEADO"}`;
      const logs = addAuditLog(logMsg);
      saveStateChanges(
        selectedAula,
        selectedEmbarcacion,
        selectedMaterials,
        numAlumnos !== "" ? Number(numAlumnos) : undefined,
        instructorName,
        codigoCurso,
        updated,
        tipoCurso,
        estadoCurso,
        students,
        incidents,
        documents,
        logs
      );
      return updated;
    });
  };

  const getTasksInTab = (tab: "previo" | "impartición" | "cierre") => {
    if (tab === "previo") {
      return AUDIT_TASKS.slice(0, 15); // t1-t15
    } else if (tab === "impartición") {
      return AUDIT_TASKS.slice(15, 23); // t16-t23
    } else {
      return AUDIT_TASKS.slice(23); // t24-t38
    }
  };

  const handleMarkAllInTab = (tab: "previo" | "impartición" | "cierre") => {
    const ids = getTasksInTab(tab).map((t) => t.id);
    setCompletedAuditTasks((prev) => {
      const filtered = prev.filter((id) => !ids.includes(id));
      const updated = [...filtered, ...ids];
      const logs = addAuditLog(`Marcadas todas las tareas de la pestaña [${tab}]`);
      saveStateChanges(
        selectedAula,
        selectedEmbarcacion,
        selectedMaterials,
        numAlumnos !== "" ? Number(numAlumnos) : undefined,
        instructorName,
        codigoCurso,
        updated,
        tipoCurso,
        estadoCurso,
        students,
        incidents,
        documents,
        logs
      );
      return updated;
    });
  };

  const handleUnmarkAllInTab = (tab: "previo" | "impartición" | "cierre") => {
    const ids = getTasksInTab(tab).map((t) => t.id);
    setCompletedAuditTasks((prev) => {
      const updated = prev.filter((id) => !ids.includes(id));
      const logs = addAuditLog(`Desmarcadas todas las tareas de la pestaña [${tab}]`);
      saveStateChanges(
        selectedAula,
        selectedEmbarcacion,
        selectedMaterials,
        numAlumnos !== "" ? Number(numAlumnos) : undefined,
        instructorName,
        codigoCurso,
        updated,
        tipoCurso,
        estadoCurso,
        students,
        incidents,
        documents,
        logs
      );
      return updated;
    });
  };

  const handleMarkAll38AuditTasks = () => {
    const allIds = AUDIT_TASKS.map((t) => t.id);
    setCompletedAuditTasks(allIds);
    const logs = addAuditLog("Certificado todo el procedimiento de calidad SGC (38/38 pasos completados)");
    saveStateChanges(
      selectedAula,
      selectedEmbarcacion,
      selectedMaterials,
      numAlumnos !== "" ? Number(numAlumnos) : undefined,
      instructorName,
      codigoCurso,
      allIds,
      tipoCurso,
      estadoCurso,
      students,
      incidents,
      documents,
      logs
    );
  };

  const handleUnmarkAll38AuditTasks = () => {
    setCompletedAuditTasks([]);
    const logs = addAuditLog("Reiniciada la auditoría de calidad SGC (0/38 pasos completados)");
    saveStateChanges(
      selectedAula,
      selectedEmbarcacion,
      selectedMaterials,
      numAlumnos !== "" ? Number(numAlumnos) : undefined,
      instructorName,
      codigoCurso,
      [],
      tipoCurso,
      estadoCurso,
      students,
      incidents,
      documents,
      logs
    );
  };

  const totalTasksCount = AUDIT_TASKS.length;
  const completedTasksCount = useMemo(() => {
    return completedAuditTasks.filter((id) => {
      return AUDIT_TASKS.some((t) => t.id === id);
    }).length;
  }, [completedAuditTasks]);

  const safeProgressPercent = Math.min(100, Math.max(0, Math.round((completedTasksCount / totalTasksCount) * 100)));

  // Role progress stats calculation
  const roleProgress = useMemo(() => {
    const stats = {
      D: { total: 0, completed: 0, label: "Director (Rober)", color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" },
      DF: { total: 0, completed: 0, label: "Formación (Raquel)", color: "border-indigo-500/30 text-indigo-400 bg-indigo-500/10" },
      INS: { total: 0, completed: 0, label: "Instructor", color: "border-purple-500/30 text-purple-400 bg-purple-500/10" },
      RSGI: { total: 0, completed: 0, label: "SGI (Raquel)", color: "border-amber-500/30 text-amber-400 bg-amber-500/10" },
    };

    AUDIT_TASKS.forEach((task) => {
      const isCompleted = completedAuditTasks.includes(task.id);
      
      // Parse responsibility: handles single role or slash/whitespace separated roles like "D / DF" or "D DF"
      const roles = task.responsible.split(/[\s/+,&]+/);
      roles.forEach((r) => {
        const uRole = r.toUpperCase().trim();
        if (uRole === "D" || uRole === "DF" || uRole === "INS" || uRole === "RSGI") {
          stats[uRole].total += 1;
          if (isCompleted) {
            stats[uRole].completed += 1;
          }
        }
      });
    });

    return stats;
  }, [completedAuditTasks]);

  // Filtered tasks in active audit tab according to active role filter
  const filteredAuditTasks = useMemo(() => {
    const tasksInTab = getTasksInTab(activeAuditTab);
    if (auditRoleFilter === "ALL") return tasksInTab;
    
    return tasksInTab.filter((task) => {
      const roles = task.responsible.split(/[\s/+,&]+/);
      return roles.some(r => r.toUpperCase().trim() === auditRoleFilter);
    });
  }, [activeAuditTab, auditRoleFilter]);

  // Filter linked tasks
  const linkedTasks = allTasks.filter(t => linkedTaskIds.includes(t.id));
  
  // Filter unlinked tasks for search dropdown
  const unlinkedTasks = allTasks.filter(
    t => !linkedTaskIds.includes(t.id) && 
    (t.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Time formatting
  const formatTimeFull = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const formatDateFull = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("es-ES", { 
        weekday: "long", 
        day: "numeric", 
        month: "long", 
        year: "numeric" 
      });
    } catch {
      return "";
    }
  };

  const creatorName = event.creator?.displayName || event.creator?.email || "No especificado";
  const organizerName = event.organizer?.displayName || event.organizer?.email || "No especificado";

  // RSVP response translators for Spanish
  const rsvpTranslations = {
    accepted: { label: "Aceptado", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    declined: { label: "Rechazado", color: "bg-red-50 text-red-700 border-red-200" },
    tentative: { label: "Provisional", color: "bg-amber-50 text-amber-700 border-amber-200" },
    needsAction: { label: "Sin confirmar", color: "bg-slate-50 text-slate-600 border-slate-200" }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Semi-transparent backdrop overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
      />

      {/* Main modal container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-white w-full max-w-4xl max-h-[85vh] rounded-xl shadow-xl flex flex-col overflow-hidden border border-slate-200"
      >
        {/* Header toolbar */}
        <header className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0 gap-4">
          <div className="flex-1 flex flex-col gap-0.5 min-w-0">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-indigo-600">
              Detalle y Parámetros del Evento
            </span>
            <div className="flex items-center gap-2 w-full">
              {isEditing ? (
                <input
                  type="text"
                  value={editedSummary}
                  onChange={(e) => setEditedSummary(e.target.value)}
                  className="bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none w-full max-w-sm sm:max-w-md shadow-2xs"
                  placeholder="Título de la actividad..."
                />
              ) : (
                <h2 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
                  {event.summary || "Evento sin título"}
                </h2>
              )}
              {!isEditing && event.status && (
                <span className={`text-[9px] font-bold uppercase tracking-tight px-1.5 py-0.5 rounded border shrink-0 ${
                  event.status === "confirmed" 
                    ? "bg-blue-50 text-blue-700 border-blue-200" 
                    : "bg-slate-50 text-slate-500 border-slate-200"
                }`}>
                  {event.status === "confirmed" ? "confirmado" : event.status}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (isEditing) {
                  onUpdateEvent(event.id, {
                    summary: editedSummary,
                    description: editedDescription,
                    location: editedLocation
                  });
                  setIsEditing(false);
                } else {
                  setIsEditing(true);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer ${
                isEditing
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 font-extrabold"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {isEditing ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Guardar Parámetros</span>
                </>
              ) : (
                <>
                  <span>📝 Editar Parámetros</span>
                </>
              )}
            </button>
            {isEditing && (
              <button
                onClick={() => {
                  setEditedSummary(event.summary || "");
                  setEditedDescription(event.description || "");
                  setEditedLocation(event.location || "");
                  setIsEditing(false);
                }}
                className="px-2.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-705 rounded-lg transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Area - two scrollable columns */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* LEFT PANELS - MAIN PARAMETERS (8 cols on desktop) */}
          <section className="md:col-span-7 space-y-6">
            
            {/* Primary Schedule Timing */}
            <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-200 space-y-2 mb-3">
              <div className="flex items-center gap-2 text-indigo-600">
                <Clock className="w-4 h-4 shrink-0" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider">
                  Fecha y Hora
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800">
                {formatDateFull(event.start?.dateTime || event.start?.date)}
              </p>
              {event.start?.dateTime ? (
                <p className="text-xs font-semibold text-slate-500">
                  Bloque horario: {formatTimeFull(event.start.dateTime)} - {formatTimeFull(event.end?.dateTime)} 
                  {event.start?.timeZone && (
                     <span className="font-mono text-[10px] ml-1.5 bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                       {event.start.timeZone}
                     </span>
                  )}
                </p>
              ) : (
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 mt-1 inline-block">
                  Todo el día
                </span>
              )}
            </div>

            {/* Location & Digital details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location */}
              <div className="p-4 rounded-lg border border-slate-205 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold tracking-tight text-slate-700">Lugar Físico</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedLocation}
                    onChange={(e) => setEditedLocation(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded p-1 text-xs text-slate-700 focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:bg-white"
                    placeholder="Ubicación física..."
                  />
                ) : (
                  <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                    {event.location || "Sin locación física asociada"}
                  </p>
                )}
              </div>

              {/* Digital URL / Video conferencing link */}
              <div className="p-4 rounded-lg border border-slate-205 space-y-1.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Video className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold tracking-tight text-slate-700">Google Meet</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 font-mono">
                    {event.hangoutLink || "No hay enlace de Meet"}
                  </p>
                </div>
                {event.hangoutLink && (
                  <a 
                    href={event.hangoutLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-center py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Unirse a Reunión
                  </a>
                )}
              </div>
            </div>

            {/* Asignación de Recursos (Aulas y Materiales) - Pronautic Solución */}
            <div className="p-5 rounded-xl border border-indigo-100 bg-indigo-50/15 space-y-4">
              <div className="flex items-center gap-2 text-indigo-700">
                <Layers className="w-4.5 h-4.5" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Asignación de Recursos (Aulas, Embarcaciones y Materiales)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Seleccion de espacios y barcos */}
                <div className="space-y-4">
                  {/* Seleccionar Aula */}
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[11px] font-extrabold text-indigo-950 uppercase tracking-tight">
                      🏫 Aula / Espacio Físico
                    </label>
                    <select
                      value={selectedAula}
                      onChange={(e) => setSelectedAula(e.target.value)}
                      className="w-full bg-white border border-slate-205 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all cursor-pointer font-semibold text-slate-705 shadow-3xs"
                    >
                      <option value="">-- Sin Aula Asignada --</option>
                      {aulasList.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Seleccionar Embarcación */}
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[11px] font-extrabold text-indigo-950 uppercase tracking-tight">
                      ⛵ Embarcación / Buque de Prácticas
                    </label>
                    <select
                      value={selectedEmbarcacion}
                      onChange={(e) => setSelectedEmbarcacion(e.target.value)}
                      className="w-full bg-white border border-slate-205 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all cursor-pointer font-semibold text-slate-705 shadow-3xs"
                    >
                      <option value="">-- Sin Embarcación Asignada --</option>
                      {embarcacionesList.map((eOption) => (
                        <option key={eOption} value={eOption}>
                          {eOption}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Seleccionar Materiales */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-indigo-950 uppercase tracking-tight">
                    📦 Materiales / Equipamiento de Aula y Navegación
                  </label>
                  <div className="bg-white border border-slate-205 rounded-lg p-3 max-h-[148px] overflow-y-auto space-y-2 shadow-3xs">
                    {MATERIALES_DISPONIBLES.map((m) => {
                      const isChecked = selectedMaterials.includes(m);
                      return (
                        <label
                          key={m}
                          className="flex items-start gap-2 text-xs font-medium text-slate-750 hover:text-slate-900 cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleMaterial(m)}
                            className="mt-0.5 rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span>{m}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Conflict Alerts Display */}
              {conflictResult.hasConflict && (
                <div className={`border rounded-lg p-3.5 space-y-2 ${
                  conflictResult.hasBlockerConflict 
                    ? "bg-rose-50 border-rose-250 text-rose-950" 
                    : "bg-amber-50 border-amber-200 text-amber-950"
                }`}>
                  <div className="flex items-center gap-1.5 font-extrabold text-xs">
                    <AlertTriangle className={`w-4.5 h-4.5 shrink-0 ${conflictResult.hasBlockerConflict ? "text-rose-600 animate-pulse" : "text-amber-600"}`} />
                    <span>
                      {conflictResult.hasBlockerConflict 
                        ? "⚠️ SOLAPAMIENTO CRÍTICO DETECTADO (RESERVA RECHAZADA):" 
                        : "⚠️ ALERTA DE CONFLICTO OPERATIVO:"}
                    </span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] font-semibold space-y-1 pl-1 opacity-90">
                    {conflictResult.messages.map((msg, idx) => (
                      <li key={idx} className="leading-relaxed">{msg}</li>
                    ))}
                  </ul>
                  <p className="text-[10px] italic mt-1 pl-1 font-bold">
                    {conflictResult.hasBlockerConflict 
                      ? "* Bloqueado: No se permite agendar múltiples actividades simultáneas en el mismo espacio ni con la misma embarcación." 
                      : "* Nota: Se recomienda cambiar los materiales para evitar colisiones operativas en Pronautic."}
                  </p>
                </div>
              )}

              {saveError && (
                <div className="bg-rose-50 border border-rose-250 text-rose-950 font-extrabold text-xs p-3 rounded-lg flex items-center gap-1.5 leading-relaxed shadow-3xs">
                  <AlertTriangle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              {/* Save Trigger and Feedback button */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  disabled={conflictResult.hasBlockerConflict}
                  onClick={handleSaveAllocation}
                  className={`px-4 py-2 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                    conflictResult.hasBlockerConflict
                      ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60"
                      : conflictResult.hasConflict
                        ? "bg-amber-500 hover:bg-amber-600 text-white"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      ¡Guardado Correctamente!
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Guardar Recursos y Comprobar
                    </>
                  )}
                </button>
                {saveSuccess && (
                  <span className="text-[11px] text-emerald-600 font-bold animate-pulse">
                    ✓ Estructura de recursos y embarcación guardadas en local
                  </span>
                )}
                {conflictResult.hasBlockerConflict && (
                  <span className="text-[11px] text-rose-600 font-extrabold animate-pulse">
                    ❌ Guardado Bloqueado por solapamiento activo
                  </span>
                )}
              </div>
            </div>

            {/* 📋 FICHA DE CONTROL OPERATIVO PRONAUTIC (Catalan Note Template & Control) */}
            <div className="p-5 rounded-xl border border-indigo-150 bg-indigo-50/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-900">
                  <FileText className="w-5 h-5 text-indigo-600 animate-pulse" />
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block flex items-center gap-2">
                      Ficha de Control Operativo Pronautic
                      <button onClick={parseDescriptionForData} className="px-2 py-0.5 bg-sky-100 text-sky-700 hover:bg-sky-200 border border-sky-200 shadow-sm rounded flex items-center gap-1 uppercase tracking-wider text-[9px] cursor-pointer" title="Usar Inteligencia Artificial para extraer alumnos, aulas e instructores de las descripciones">🤖 Auto-Completar</button>
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Gestión de plantilla y control fáctico para coordinación rápida
                    </span>
                  </div>
                </div>
                
                {/* Tab selectors */}
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setNoteTab("lectura")}
                    className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${
                      noteTab === "lectura"
                        ? "bg-white text-indigo-600 shadow-3xs font-black"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    🔍 Vista
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoteTab("editar")}
                    className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${
                      noteTab === "editar"
                        ? "bg-white text-indigo-600 shadow-3xs font-black"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    ✏️ Editar
                  </button>
                </div>
              </div>

              {noteTab === "lectura" ? (
                <div className="space-y-3">
                  {/* Markdown Note preview */}
                  <div className="p-4 bg-slate-950 text-slate-100 rounded-lg font-mono text-[11px] leading-relaxed select-all whitespace-pre-wrap relative border border-slate-800 group">
                    <div className="absolute top-2 right-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={handleCopyNote}
                        className={`px-2.5 py-1 rounded text-[9.5px] font-bold flex items-center gap-1.5 transition-all text-slate-950 border cursor-pointer ${
                          copiedNote
                            ? "bg-emerald-500 text-slate-950 border-emerald-400"
                            : "bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800"
                        }`}
                      >
                        {copiedNote ? (
                          <>
                            <span>✓ Copiat!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar Nota</span>
                          </>
                        )}
                      </button>
                    </div>
                    {/* Raw Text rendering exactly matching Catalan operational template */}
                    {`📅 Data d’actualització: ${dataActualitzacio}
🕘 Horari del curs:
• Inici: ${horariInici}
• Descans: ${horariDescans}
• Finalització: ${horariFinalitzacio}

👤 Instructor principal:
• Nom: ${insPrincipalNom || "Sense assignar"}
• Tipus de contractació: ${insPrincipalContractacio || "Sense especificar"}

👤 Instructor secundari (si escau):
• Nom: ${insSecundariNom || "Ningú"}
• Tipus de contractació: ${insSecundariContractacio || "N/A"}

🔐 Accesos necessaris:
• Claus Port Olímpic: ${clausPortOlimpic ? "SÍ" : "NO"}
• Claus BNC: ${clausBNC ? "SÍ" : "NO"}
• Targeta Port Olímpic: ${targetaPortOlimpic ? "SÍ" : "NO"}
• Targeta BNC: ${targetaBNC ? "SÍ" : "NO"}

👥 Nombre d’alumnes curs complet: ${nombreAlumnesCurs}

MCC: ${mccCount}
MCR: ${mcrCount}
📚 Aula assignada: ${selectedAula || "n/a"}`}
                  </div>
                  <p className="text-[10px] text-indigo-900/80 italic text-center font-medium">
                    💡 Hint: El bloc superior s'actualitza immediatacio segons completes l'Espai/Aula o interactues amb el formulari.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  {/* Metadata fields */}
                  <div className="space-y-3">
                    {/* Data actualizacio */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                        📅 Data d'actualització:
                      </label>
                      <input
                        type="text"
                        value={dataActualitzacio}
                        onChange={(e) => handleUpdateNoteField({ dataActualitzacio: e.target.value })}
                        placeholder="Ej. 25/05/2026"
                        className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs font-semibold text-slate-750 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Horarios */}
                    <div className="p-2.5 bg-indigo-50/30 rounded border border-indigo-100/60 space-y-2">
                      <span className="text-[10px] font-black text-indigo-950 uppercase tracking-wider block">
                        🕘 Horari del Curs
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Inici</label>
                          <input
                            type="text"
                            value={horariInici}
                            onChange={(e) => handleUpdateNoteField({ horariInici: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700 text-center font-mono font-bold"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Descans</label>
                          <input
                            type="text"
                            value={horariDescans}
                            onChange={(e) => handleUpdateNoteField({ horariDescans: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700 text-center font-mono font-bold"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Final</label>
                          <input
                            type="text"
                            value={horariFinalitzacio}
                            onChange={(e) => handleUpdateNoteField({ horariFinalitzacio: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700 text-center font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Alumnes, MCC, MCR counts */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tight block">
                          👥 Alumnes
                        </label>
                        <input
                          type="number"
                          value={nombreAlumnesCurs}
                          onChange={(e) => handleUpdateNoteField({ nombreAlumnesCurs: Number(e.target.value) })}
                          className="w-full bg-white border border-slate-200 rounded p-1 text-xs text-slate-700 text-center font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tight block">
                          MCC
                        </label>
                        <input
                          type="number"
                          value={mccCount}
                          onChange={(e) => handleUpdateNoteField({ mccCount: Number(e.target.value) })}
                          className="w-full bg-white border border-slate-200 rounded p-1 text-xs text-slate-700 text-center font-mono font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tight block">
                          MCR
                        </label>
                        <input
                          type="number"
                          value={mcrCount}
                          onChange={(e) => handleUpdateNoteField({ mcrCount: Number(e.target.value) })}
                          className="w-full bg-white border border-slate-200 rounded p-1 text-xs text-slate-700 text-center font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Instructores & Accesos */}
                  <div className="space-y-3">
                    {/* Instructor Principal & Contractacion */}
                    <div className="p-2.5 bg-slate-100 rounded border border-slate-200 space-y-1.5">
                      <span className="text-[9.5px] font-black text-slate-700 uppercase tracking-wider block">
                        👤 Instructor Principal
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-500 block">Nom</label>
                          <input
                            type="text"
                            value={insPrincipalNom}
                            onChange={(e) => handleUpdateNoteField({ instructorPrincipalNom: e.target.value })}
                            placeholder="Nombre..."
                            className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px] text-slate-700 font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-500 block">Contractació</label>
                          <input
                            type="text"
                            value={insPrincipalContractacio}
                            onChange={(e) => handleUpdateNoteField({ instructorPrincipalContractacio: e.target.value })}
                            placeholder="Ej. 29 de maig"
                            className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px] text-slate-705"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Instructor Secundario */}
                    <div className="p-2.5 bg-slate-100 rounded border border-slate-200 space-y-1.5">
                      <span className="text-[9.5px] font-black text-slate-700 uppercase tracking-wider block">
                        👤 Instructor Secundari
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-500 block">Nom</label>
                          <input
                            type="text"
                            value={insSecundariNom}
                            onChange={(e) => handleUpdateNoteField({ instructorSecundariNom: e.target.value })}
                            placeholder="Nom..."
                            className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px] text-slate-700 font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[8.5px] font-bold text-slate-500 block">Contractació</label>
                          <input
                            type="text"
                            value={insSecundariContractacio}
                            onChange={(e) => handleUpdateNoteField({ instructorSecundariContractacio: e.target.value })}
                            placeholder="Ej. Temporal"
                            className="w-full bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px] text-slate-705"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Accesos de control */}
                    <div className="p-2.5 bg-[#03A9F4]/5 border border-[#03A9F4]/20 rounded space-y-1.5">
                      <span className="text-[9.5px] font-black text-[#0288D1] uppercase tracking-wider block">
                        🔐 Accesos Necessaris
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-700 select-none cursor-pointer">
                          <input
                            type="checkbox"
                            checked={clausPortOlimpic}
                            onChange={(e) => handleUpdateNoteField({ clausPortOlimpic: e.target.checked })}
                            className="rounded text-indigo-600 focus:ring-indigo-505"
                          />
                          <span>Claus Port Olímpic</span>
                        </label>
                        <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-700 select-none cursor-pointer">
                          <input
                            type="checkbox"
                            checked={clausBNC}
                            onChange={(e) => handleUpdateNoteField({ clausBNC: e.target.checked })}
                            className="rounded text-indigo-600 focus:ring-indigo-505"
                          />
                          <span>Claus BNC</span>
                        </label>
                        <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-700 select-none cursor-pointer">
                          <input
                            type="checkbox"
                            checked={targetaPortOlimpic}
                            onChange={(e) => handleUpdateNoteField({ targetaPortOlimpic: e.target.checked })}
                            className="rounded text-indigo-600 focus:ring-indigo-505"
                          />
                          <span>Targeta Port Ol.</span>
                        </label>
                        <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-700 select-none cursor-pointer">
                          <input
                            type="checkbox"
                            checked={targetaBNC}
                            onChange={(e) => handleUpdateNoteField({ targetaBNC: e.target.checked })}
                            className="rounded text-indigo-600 focus:ring-indigo-505"
                          />
                          <span>Targeta BNC</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ⭐ CONSOLA DE AUDITORÍA Y CALIDAD OPERATIVA PRONAUTIC (CERO ERRORES) */}
            <div className={`p-5 rounded-xl border transition-all ${
              forceIsCourse 
                ? "bg-slate-900 border-[#03A9F4]/40 text-slate-100 shadow-xl shadow-sky-950/20" 
                : "bg-slate-50 border-slate-205 text-slate-700 hover:bg-slate-100/70"
            }`}>
              
              {/* Header con Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-700/50">
                <div className="flex items-start gap-2.5">
                  <ClipboardList className={`w-5 h-5 mt-0.5 ${forceIsCourse ? "text-[#03A9F4] animate-pulse" : "text-slate-400"}`} />
                  <div>
                    <h3 className={`text-xs font-black uppercase tracking-wider ${forceIsCourse ? "text-white" : "text-slate-800"}`}>
                      Consola de Calidad Pronautic
                    </h3>
                    <p className={`text-[10px] ${forceIsCourse ? "text-slate-400" : "text-slate-505"} mt-0.5`}>
                      Control estricto de alumnos, instructores y procesos de calidad (Normativa Marina Mercante)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setForceIsCourse(!forceIsCourse)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all select-none cursor-pointer border ${
                    forceIsCourse
                      ? "bg-sky-500/10 hover:bg-sky-500/20 text-[#03A9F4] border-sky-500/30"
                      : "bg-slate-200 hover:bg-slate-300 text-slate-700 border-slate-300"
                  }`}
                >
                  {forceIsCourse ? "✓ Auditoría Activa" : "⚙ Activar Auditoría"}
                </button>
              </div>

              {forceIsCourse ? (
                <div className="mt-4 space-y-4">
                  
                  {/* Panel Poka-Yoke de Errores Críticos de Entrada */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-slate-950/55 p-3.5 rounded-lg border border-slate-850">
                    
                    {/* Input Alumnos */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1">
                          <span>👥 Alumnos por Curso:</span>
                          <span className="text-red-500 font-bold">*</span>
                        </label>
                        {(!numAlumnos || Number(numAlumnos) <= 0) ? (
                          <span className="text-[8.5px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded animate-pulse">
                            REQUERIDO
                          </span>
                        ) : (
                          <span className="text-[8.5px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                            CORRECTO ✓
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        min="1"
                        placeholder="Nº Alumnos matriculados"
                        value={numAlumnos}
                        onChange={(e) => setNumAlumnos(e.target.value === "" ? "" : Number(e.target.value))}
                        className={`w-full bg-slate-900 border text-xs rounded-md p-2 focus:ring-1 focus:ring-sky-505 focus:outline-none transition-all placeholder:text-slate-600 font-bold ${
                          (!numAlumnos || Number(numAlumnos) <= 0) 
                            ? "border-rose-500/50 text-rose-305 bg-rose-950/10 focus:border-rose-500" 
                            : "border-slate-700 text-white focus:border-sky-500"
                        }`}
                      />
                    </div>

                    {/* Input Instructor */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1">
                          <span>⚓ Instructor / Evaluador:</span>
                          <span className="text-red-500 font-bold">*</span>
                        </label>
                        {!instructorName.trim() ? (
                          <span className="text-[8.5px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded animate-pulse">
                            REQUERIDO
                          </span>
                        ) : (
                          <span className="text-[8.5px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                            CORRECTO ✓
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Nombre del instructor"
                        value={instructorName}
                        onChange={(e) => setInstructorName(e.target.value)}
                        className={`w-full bg-slate-900 border text-xs rounded-md p-2 focus:ring-1 focus:ring-sky-505 focus:outline-none transition-all placeholder:text-slate-600 font-bold ${
                          !instructorName.trim() 
                            ? "border-rose-500/50 text-rose-305 bg-rose-950/10 focus:border-rose-500" 
                            : "border-slate-700 text-white focus:border-sky-500"
                        }`}
                      />
                    </div>

                    {/* Fila entera: Instructores de Selección Rápida en Pronautic */}
                    <div className="md:col-span-2">
                      <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                        Sugerencias de Formadores de Guardia (Click para auto-completar):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {staffDatabase.length > 0 ? staffDatabase.map((staff) => (
                          <button
                            key={staff.id}
                            type="button"
                            onClick={() => setInstructorName(staff.name)}
                            className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full border transition-all ${
                              instructorName === staff.name
                                ? "bg-sky-500 text-slate-950 border-sky-400 font-bold shadow-3xs"
                                : "bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-550 hover:bg-slate-800"
                            }`}
                          >
                            {staff.name}
                          </button>
                        )) : ["Carlos Peralta", "Marta Bosch", "Javier Romero", "Sofía Alcorisa", "Eduardo G."].map((ins) => (
                          <button
                            key={ins}
                            type="button"
                            onClick={() => setInstructorName(ins)}
                            className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full border transition-all ${
                              instructorName === ins
                                ? "bg-sky-500 text-slate-950 border-sky-400 font-bold shadow-3xs"
                                : "bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-550 hover:bg-slate-800"
                            }`}
                          >
                            {ins}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Input Código de Curso DGMM */}
                    <div className="md:col-span-2 space-y-1.5 pt-1.5 border-t border-slate-800/60">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider">
                          🏷️ Identificador / Código de Curso Oficial DGMM (Curso Nº):
                        </label>
                        <span className="text-[8px] font-mono text-slate-500">OPCIONAL</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Ej. CURSO STCW-2026-08 / Nº dgmm-91823"
                        value={codigoCurso}
                        onChange={(e) => setCodigoCurso(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-705 text-xs rounded-md p-2 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none text-white font-mono placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  {/* Barra de Progreso de Calidad Consolidada */}
                  <div className="bg-slate-950/30 p-3 rounded-lg border border-slate-850 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                        Auditoría de Procesos:
                      </span>
                      <span className="text-sky-400 font-mono">
                        {completedTasksCount} / {totalTasksCount} tareas completadas ({safeProgressPercent}%)
                      </span>
                    </div>

                    {/* Track */}
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      {/* Bar fill */}
                      <div 
                        className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500" 
                        style={{ width: `${safeProgressPercent}%` }}
                      />
                    </div>

                    {/* Acciones Rápidas Globales */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={handleMarkAll38AuditTasks}
                        className="text-[10px] bg-sky-505 hover:bg-sky-600 active:bg-sky-700 text-white font-extrabold py-1 px-2.5 rounded flex items-center gap-1 cursor-pointer transition-all border-0 shadow-3xs"
                      >
                        <CheckSquare className="w-3 h-3 text-white" />
                        Certificar 38 Pasos (100%)
                      </button>
                      <button
                        type="button"
                        onClick={handleUnmarkAll38AuditTasks}
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-1 px-2.5 rounded flex items-center gap-1 cursor-pointer transition-all border border-slate-700 shadow-3xs"
                      >
                        Resetear (0%)
                      </button>
                    </div>
                    
                    {/* Leyenda rápida */}
                    <p className="text-[9.5px] text-slate-400 italic leading-relaxed">
                      Debes realizar y firmar cada acción del proceso o usar "Certificar 38 Pasos" para asegurar la conformidad y evitar incidencias de Capitanía Marítima.
                    </p>
                  </div>

                  {/* Detalle de Cumplimiento por Responsable para Pronautic */}
                  <div className="bg-slate-950/45 p-3 rounded-lg border border-slate-850/80 space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                      📋 Cumplimiento de Procedimiento por Firma / Responsable:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {(["D", "DF", "INS", "RSGI"] as const).map((role) => {
                        const stat = roleProgress[role];
                        const pct = stat.total > 0 ? (stat.completed / stat.total) * 100 : 0;
                        const pctStr = Math.round(pct);
                        return (
                          <div 
                            key={role} 
                            onClick={() => setAuditRoleFilter(role)}
                            className={`p-2 rounded border text-center transition-all cursor-pointer ${
                              auditRoleFilter === role 
                                ? "bg-sky-500/20 border-sky-400 text-sky-300 shadow-md"
                                : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
                            }`}
                          >
                            <p className="text-[9px] font-bold truncate">{stat.label}</p>
                            <p className="text-xs font-mono font-extrabold text-white mt-0.5">
                              {stat.completed} / {stat.total}
                            </p>
                            <div className="w-full bg-slate-850 h-1 rounded-full mt-1.5 overflow-hidden">
                              <div 
                                className={`h-full ${pctStr === 100 ? "bg-emerald-500" : "bg-sky-550 bg-sky-500"}`}
                                style={{ width: `${pctStr}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Checklist con Pestañas de Proceso */}
                  <div className="space-y-3">
                    
                    {/* Filtro por Responsable e Indicación */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-950 p-2 rounded-lg border border-slate-850">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                        🔍 Filtrar tareas por firma:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => setAuditRoleFilter("ALL")}
                          className={`px-2 py-0.5 rounded text-[9.5px] font-bold tracking-tight transition-all border-0 cursor-pointer ${
                            auditRoleFilter === "ALL"
                              ? "bg-slate-200 text-slate-950 font-bold"
                              : "bg-transparent text-slate-400 hover:text-white"
                          }`}
                        >
                          Ver Todo
                        </button>
                        {(["D", "DF", "INS", "RSGI"] as const).map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setAuditRoleFilter(role)}
                            className={`px-2 py-0.5 rounded text-[9.5px] font-bold tracking-tight transition-all border-0 cursor-pointer ${
                              auditRoleFilter === role
                                ? "bg-sky-400 text-slate-950 font-black shadow-xs"
                                : "bg-transparent text-slate-400 hover:text-white"
                            }`}
                          >
                            {role === "D" ? "D (Rober)" : role === "DF" ? "DF (Raquel)" : role === "INS" ? "INST (Instructor)" : "RSGI (Raquel)"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Selector de Pestañas de Fases */}
                    <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850">
                      {(["previo", "impartición", "cierre"] as const).map((tab) => {
                        const countInTab = getTasksInTab(tab).length;
                        const completedInTab = getTasksInTab(tab).filter(t => completedAuditTasks.includes(t.id)).length;
                        const labelTitle = tab === "previo" ? "1. Inicio" : tab === "impartición" ? "2. Aula" : "3. Cierre";
                        const active = activeAuditTab === tab;
                        return (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveAuditTab(tab)}
                            className={`py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-0 ${
                              active
                                ? "bg-sky-505 bg-sky-400 text-slate-950 shadow-xs"
                                : "text-slate-400 bg-transparent hover:text-white hover:bg-slate-900"
                            }`}
                          >
                            <span>{labelTitle}</span>
                            <span className="ml-1 text-[8.5px] font-mono opacity-80 bg-slate-800/30 px-1 py-0.5 rounded text-inherit">
                              {completedInTab}/{countInTab}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Acciones de Lote Rápido */}
                    <div className="flex items-center justify-between text-[9px] bg-slate-950/20 p-2 border border-slate-800/65 rounded-md">
                      <span className="text-slate-400 font-bold font-mono">FASE: {
                        activeAuditTab === "previo" ? "1. Planificación e Inicio" : 
                        activeAuditTab === "impartición" ? "2. Aula / Durante el Curso" : 
                        "3. Evaluación, Trámites y Archivo"
                      }</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleMarkAllInTab(activeAuditTab)}
                          className="text-[#03A9F4] font-bold hover:underline bg-transparent border-0 cursor-pointer p-0"
                        >
                          ✓ Marcar todas
                        </button>
                        <span className="text-slate-700">|</span>
                        <button
                          type="button"
                          onClick={() => handleUnmarkAllInTab(activeAuditTab)}
                          className="text-rose-400 font-bold hover:underline bg-transparent border-0 cursor-pointer p-0"
                        >
                          ✗ Desmarcar todas
                        </button>
                      </div>
                    </div>

                    {/* Listado de tareas */}
                    <div className="max-h-72 overflow-y-auto space-y-2 border border-slate-850 rounded bg-slate-950/45 p-2">
                      {filteredAuditTasks.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 italic text-[11px]">
                          No hay tareas correspondientes a este responsable o fase de calidad.
                        </div>
                      ) : (
                        filteredAuditTasks.map((task) => {
                          const checked = completedAuditTasks.includes(task.id);
                        const isMain = task.id.startsWith("t");
                        return (
                          <div 
                            key={task.id}
                            className={`p-2.5 rounded border text-[11px] flex items-start gap-2.5 transition-all hover:bg-slate-900/60 ${
                              checked 
                                ? "bg-sky-500/5 border-sky-500/20 text-slate-400" 
                                : "bg-slate-900 border-slate-800 text-slate-100"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleAuditTask(task.id)}
                              className="mt-0.5 h-3.5 w-3.5 rounded border-slate-650 bg-slate-800 text-sky-500 focus:ring-sky-500 cursor-pointer shrink-0"
                            />
                            
                            <div className="min-w-0 flex-1 space-y-1">
                              <p className={`font-bold leading-relaxed ${checked ? "text-slate-500 font-normal line-through" : ""}`}>
                                {task.label}
                              </p>

                              <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-mono">
                                
                                {/* Nº Orden de Fase */}
                                {isMain && (
                                  <span className="px-1 bg-slate-805 bg-slate-800 text-slate-400 rounded-sm font-bold font-sans">
                                    Nº {task.id.replace("t", "")}
                                  </span>
                                )}

                                {/* Responsable Badge */}
                                <span className={`px-1.5 py-0.5 rounded-xs font-bold uppercase ${
                                  task.responsible.includes("INS") ? "bg-purple-950/60 text-purple-305 border border-purple-900/40" :
                                  task.responsible.includes("RSGI") ? "bg-amber-950/60 text-amber-305 border border-amber-900/40" :
                                  task.responsible.includes("DF") ? "bg-indigo-950/60 text-indigo-305 border border-indigo-900/40" :
                                  "bg-emerald-950/60 text-emerald-305 border border-emerald-900/40"
                                }`}>
                                  Resp: {task.responsible}
                                </span>

                                {/* Documento Badge */}
                                {task.document && (
                                  <span className="px-1.5 py-0.5 rounded-sm bg-slate-800 text-slate-300 border border-slate-700 max-w-[180px] truncate" title={task.document}>
                                    📄 {task.document}
                                  </span>
                                )}

                                {/* Plazo Badge */}
                                {task.deadline && (
                                  <span className="px-1.5 py-0.5 rounded-sm bg-slate-900 text-sky-400 border border-sky-950/40">
                                    🕒 {task.deadline}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }))}
                    </div>

                  </div>

                </div>
              ) : (
                <div className="mt-3.5 flex items-center justify-between bg-white p-2.5 rounded-lg border border-dashed border-slate-300 text-slate-500 hidden">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-[11px] font-medium leading-relaxed">
                      Esta actividad no tiene activada la Auditoría de Calidad Pronautic.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Description Details / Notes */}
            <div className="p-4 rounded-lg border border-slate-205 space-y-2">
              <div className="flex items-center gap-1.5 text-slate-600">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold tracking-tight text-slate-705">Detalles / Notas del Evento</span>
              </div>
              {isEditing ? (
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-450 font-bold block">Editar Notas de Actividad (Se guardarán en local):</span>
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={8}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-sans focus:bg-white focus:ring-1 focus:ring-indigo-550 focus:outline-none transition-all text-slate-700"
                    placeholder="Escribe las notas, horarios, instructores o detalles..."
                  />
                </div>
              ) : event.description ? (
                <div 
                  className="text-xs text-slate-650 leading-relaxed max-h-60 overflow-y-auto font-sans p-3 bg-slate-50/50 border border-slate-100 rounded-lg"
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
              ) : (
                <p className="text-xs text-slate-400 italic">No se agregaron descripciones de notas en Google Calendar.</p>
              )}
            </div>

            {/* Structure metrics: Organizer & Creator */}
            <div className="p-4 rounded-lg border border-slate-205 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold tracking-tight text-slate-705">Organización del Evento</span>
                </div>
                {teacherAvailabilityStatus && teacherAvailabilityStatus.status !== "no_teacher" && (
                  <span className={`text-[9.5px] font-black uppercase tracking-tight px-2 py-0.5 rounded border ${
                    teacherAvailabilityStatus.status === "available" 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-250" 
                      : teacherAvailabilityStatus.status === "unavailable"
                      ? "bg-red-50 text-red-700 border-red-250 animate-pulse"
                      : "bg-amber-50 text-amber-700 border-amber-250"
                  }`}>
                    {teacherAvailabilityStatus.status === "available" ? "Disponible ✓" : "Fuera de Período ⚠️"}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">Creador</p>
                  <p className="font-semibold text-slate-700 truncate mt-0.5">{creatorName}</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">Organizador</p>
                  <p className="font-semibold text-slate-700 truncate mt-0.5">{organizerName}</p>
                </div>
              </div>
              {teacherAvailabilityStatus && teacherAvailabilityStatus.status !== "no_teacher" && (
                <div className="p-2 bg-slate-50 border border-slate-150 rounded text-[11px] font-sans font-semibold text-slate-650 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    teacherAvailabilityStatus.status === "available" ? "bg-emerald-500" :
                    teacherAvailabilityStatus.status === "unavailable" ? "bg-red-500" : "bg-amber-500"
                  }`} />
                  <span>{teacherAvailabilityStatus.label}</span>
                </div>
              )}
            </div>

            {/* Attendees / Invitados */}
            <div className="p-4 rounded-lg border border-slate-205 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold tracking-tight text-slate-705">
                    Invitados ({event.attendees?.length || 0})
                  </span>
                </div>
              </div>
              {event.attendees && event.attendees.length > 0 ? (
                <div className="max-h-44 overflow-y-auto space-y-2 border border-slate-100 rounded-md p-1 bg-slate-50/20">
                  {event.attendees.map((attendee, idx) => {
                    const statusConfig = attendee.responseStatus 
                      ? rsvpTranslations[attendee.responseStatus] 
                      : rsvpTranslations.needsAction;

                    return (
                      <div key={idx} className="p-2 bg-white rounded border border-slate-150 flex items-center justify-between text-xs gap-4 shadow-3xs">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-700 truncate">
                            {attendee.displayName || attendee.email?.split("@")[0]}
                          </p>
                          <p className="text-[10px] text-slate-405 font-mono truncate">{attendee.email}</p>
                        </div>
                        <span className={`text-[10px] font-bold border rounded-full px-2 py-0.5 truncate ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No hay invitados individuales agregados a este evento.</p>
              )}
            </div>

            {/* Audit creation and edited logs */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
              <span>Creado: {event.created ? new Date(event.created).toLocaleString("es-ES") : "N/A"}</span>
              <span>Modificado: {event.updated ? new Date(event.updated).toLocaleString("es-ES") : "N/A"}</span>
            </div>
          </section>

          {/* RIGHT PANELS - TASK RELATIONSHIPS (5 cols on desktop) */}
          <section className="md:col-span-5 flex flex-col gap-5 border-t md:border-t-0 md:border-l border-slate-200 pt-6 md:pt-0 md:pl-6">
            
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-indigo-650" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Tareas Relacionadas
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Relaciona interactivamente una o más tareas de tus listas de pendientes con este evento de calendario para agruparlas.
              </p>
            </div>

            {/* List of currently associated tasks */}
            <div className="space-y-2.5 flex-1 min-h-[150px]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Tareas Asociadas ({linkedTasks.length})
              </p>
              {linkedTasks.length > 0 ? (
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {linkedTasks.map((task) => (
                      <motion.div 
                        key={task.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white p-3 rounded-lg border border-indigo-100 flex items-start justify-between gap-3 shadow-3xs"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <input 
                            type="checkbox"
                            checked={task.status === "completed"}
                            onChange={() => onToggleTaskStatus(task.id)}
                            className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 cursor-pointer"
                          />
                          <div className="min-w-0">
                            <p className={`text-xs font-bold leading-tight ${
                              task.status === "completed" ? "text-slate-400 line-through font-normal" : "text-slate-800"
                            }`}>
                              {task.title || "Tarea sin título"}
                            </p>
                            {task.listTitle && (
                              <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-400 px-1 py-0.5 rounded mt-1.5 inline-block uppercase">
                                {task.listTitle}
                              </span>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => onUnlinkTask(task.id)}
                          title="Desasociar tarea"
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="border border-dashed border-slate-200 rounded-lg p-6 text-center py-10 bg-slate-50/50">
                  <BookmarkCheck className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-semibold">No hay tareas vinculadas hoy</p>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[180px] mx-auto leading-normal">
                    Usa el selector a continuación para adjuntar un pendiente.
                  </p>
                </div>
              )}
            </div>

            {/* Relation / Link workflow search and add */}
            <div className="border-t border-slate-100 pt-4 space-y-2.5 relative">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Vincular Nuevo Pendiente
              </label>
              
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Buscar tarea..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setDropdownOpen(true);
                  }}
                  onFocus={() => setDropdownOpen(true)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all pl-8.5 font-sans"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Tasks search result dropdown drop menu */}
              {dropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => {
                      setDropdownOpen(false);
                      setSearchTerm("");
                    }} 
                  />
                  <div className="absolute left-0 right-0 bottom-full mb-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-56 overflow-y-auto z-20 divide-y divide-slate-100 py-1">
                    <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                      Pendientes disponibles ({unlinkedTasks.length})
                    </div>
                    {unlinkedTasks.length > 0 ? (
                      unlinkedTasks.map((task) => (
                        <button
                          key={task.id}
                          onClick={() => {
                            onLinkTask(task.id);
                            setDropdownOpen(false);
                            setSearchTerm("");
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between text-xs text-slate-700 font-medium transition-colors cursor-pointer group"
                        >
                          <span className="truncate pr-4 leading-normal">{task.title || "Tarea sin título"}</span>
                          <span className="shrink-0 flex items-center gap-1 text-[9px] font-mono text-indigo-500 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white px-1.5 py-0.5 rounded transition-all font-bold">
                            <Plus className="w-2.5 h-2.5" />
                            Relacionar
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-3 text-center text-xs text-slate-400 italic">
                        {searchTerm ? "No se encontraron pendientes" : "Todos los pendientes están vinculados"}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Google Calendar Direct Link */}
            <div className="mt-auto bg-slate-50 p-3 rounded border border-slate-205 flex items-center justify-between text-[11px] font-sans">
              <span className="text-slate-500 font-semibold">¿Ver todos los detalles en Calendar?</span>
              {event.htmlLink && (
                <a 
                  href={event.htmlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline font-bold flex items-center gap-0.5"
                >
                  Abrir Evento
                  <ChevronRight className="w-3 h-3" />
                </a>
              )}
            </div>
          </section>

        </div>
      </motion.div>
    </div>
  );
}
