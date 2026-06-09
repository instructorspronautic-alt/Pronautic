import React from "react";
import { stripHtml } from "../utils/helpers";
import { CalendarEvent, GoogleTask } from "../types";
import { Clock, LayoutGrid, CheckSquare, Search, Building2, User, Mic, FileText, CheckCircle2, BookOpen, ArrowLeft, Check, Filter } from "lucide-react";

export interface TasksViewProps {
  tasks: GoogleTask[];
  displayTasks: GoogleTask[];
  displayCourses: CalendarEvent[];
  events: CalendarEvent[];
  mergedEvents: CalendarEvent[];
  eventResources: Record<string, any>;
  eventTaskLinks: Record<string, string[]>;
  tasksTabMode: "courses" | "google";
  setTasksTabMode: (mode: "courses" | "google") => void;
  selectedCourseIdForTasks: string;
  setSelectedCourseIdForTasks: (id: string) => void;
  searchTaskQuery: string;
  setSearchTaskQuery: (q: string) => void;
  tasksRoleFilter: string;
  setTasksRoleFilter: (r: any) => void;
  onToggleTaskStatus: (taskId: string) => void;
  onToggleAuditTask: (eventId: string, taskId: string) => void;
  onLinkTask: (taskId: string) => void;
  onUnlinkTaskCard: (eventId: string, taskId: string) => void;
  selectedEvent: CalendarEvent | null;
  AUDIT_TASKS: any[];
  formatEventDates: (event: CalendarEvent) => string;
  globalConflicts: any[];
  getInstructorAvailabilityAndQualification: any;
  handleToggleAuditTaskDashboard: any;
  setOnlyShowRangeTasks: any;
  onlyShowRangeTasks: boolean;
  handleToggleTaskStatus: any;
}

export default function TasksView({
  tasks,
  displayTasks,
  displayCourses,
  events,
  mergedEvents,
  eventResources,
  eventTaskLinks,
  tasksTabMode,
  setTasksTabMode,
  selectedCourseIdForTasks,
  setSelectedCourseIdForTasks,
  searchTaskQuery,
  setSearchTaskQuery,
  tasksRoleFilter,
  setTasksRoleFilter,
  onToggleTaskStatus,
  onToggleAuditTask,
  onLinkTask,
  onUnlinkTaskCard,
  selectedEvent,
  AUDIT_TASKS,
  formatEventDates,
  globalConflicts,
  getInstructorAvailabilityAndQualification,
  handleToggleAuditTaskDashboard,
  setOnlyShowRangeTasks,
  onlyShowRangeTasks,
  handleToggleTaskStatus
}: TasksViewProps) {
  if (!events) return <div className="p-8 text-center text-slate-500 font-medium">No hay datos disponibles para mostrar todavía.</div>;
  return (
    <>
      
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
                
    </>
  );
}
