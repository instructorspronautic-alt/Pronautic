import React from "react";
import { Ship, BookOpen, CheckSquare, Layers, Link2 } from "lucide-react";
import { stripHtml, getEventTimes, getEventInstructor } from "../utils/helpers";
import InstructorCheckInView from "../components/InstructorCheckInView";
import { InstructorProfile } from "../types";
import { CalendarEvent } from "../types";
import { Clock, MapPin, Anchor, User, Search, Map, LayoutGrid, Calendar as CalendarIcon, CheckCircle2, Mic, AlertTriangle } from "lucide-react";

export interface CalendarViewProps {
  eventTaskLinks: any;
  handleToggleTaskStatus: any;
  handleUnlinkTaskCard: any;
  getInstructorAvailabilityAndQualification: any;

  displayEvents: CalendarEvent[];
  mergedEvents: CalendarEvent[];
  eventResources: Record<string, any>;
  globalConflicts: Array<{eventA: CalendarEvent; eventB: CalendarEvent; reason: string}>;
  calendars: Array<{id: string; summary: string; primary?: boolean; backgroundColor?: string}>;
  selectedCalIds: string[];
  setSelectedCalIds: (ids: string[]) => void;
  viewRange: string;
  setViewRange: (r: any) => void;
  focusDate: Date;
  todayFormatted: string;
  onNavigate: (dir: "prev" | "next") => void;
  selectedEvent: CalendarEvent | null;
  setSelectedEvent: (event: CalendarEvent | null) => void;
  calendarSubTab: "list" | "matrix" | "instructor";
  setCalendarSubTab: (t: "list" | "matrix" | "instructor") => void;
  showOnlyCourses: boolean;
  setShowOnlyCourses: (v: boolean) => void;
  selectedAulaFilter: string;
  setSelectedAulaFilter: (v: string) => void;
  selectedEmbarcacionFilter: string;
  setSelectedEmbarcacionFilter: (v: string) => void;
  aulas: string[];
  embarcaciones: string[];
  formatTime: (iso?: string) => string;
  formatEventDates: (event: CalendarEvent) => string;
  checkTeacherAvailability: (event: CalendarEvent) => any;
  userRole: string;
  handleUpdateEvent: (id: string, fields: Partial<CalendarEvent>) => void;
  staffDatabase: any[];
  teacherEmailFilter: string;
  handleSaveResources: (eventId: string, resources: any) => void;
  tasks: any[];
}

export default function CalendarView({
eventTaskLinks, getInstructorAvailabilityAndQualification, handleToggleTaskStatus, handleUnlinkTaskCard,
  displayEvents,
  mergedEvents,
  eventResources,
  globalConflicts,
  calendars,
  selectedCalIds,
  setSelectedCalIds,
  viewRange,
  setViewRange,
  focusDate,
  todayFormatted,
  onNavigate,
  selectedEvent,
  setSelectedEvent,
  calendarSubTab,
  setCalendarSubTab,
  showOnlyCourses,
  setShowOnlyCourses,
  selectedAulaFilter,
  setSelectedAulaFilter,
  selectedEmbarcacionFilter,
  setSelectedEmbarcacionFilter,
  aulas,
  embarcaciones,
  formatTime,
  formatEventDates,
  checkTeacherAvailability,
  userRole,
  handleUpdateEvent,
  staffDatabase,
  teacherEmailFilter,
  handleSaveResources,
  tasks
}: CalendarViewProps) {
  if (!displayEvents) return <div className="p-8 text-center text-slate-500 font-medium">No hay datos disponibles para mostrar todavía.</div>;
  return (
    <>
      
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
                      <InstructorCheckInView 
                        events={displayEvents} 
                        eventResources={eventResources}
                        handleSaveResources={handleSaveResources}
                        staffDatabase={staffDatabase}
                      />
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
                
    </>
  );
}
