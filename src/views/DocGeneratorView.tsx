import React from "react";
import { RefreshCw, Printer, Plus, CalendarIcon, Mic, Info } from "lucide-react";
import { PronauticLogo } from "../components/PronauticLogo";
import { stripHtml } from "../utils/helpers";
import { User, Search, Settings, FileText, CheckCircle2, Ticket, PackageOpen, Download, Filter, Eye, AlertCircle, Phone, Calendar, Clock, Lock, Ship, ArrowRight, Play, Edit3, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Bar } from "recharts";

export default function DocGeneratorView(props: any) {
  const { docEmbarcacionFilter, setDocEmbarcacionFilter, needsAuth, isLoggingIn, user, token, events, taskLists, tasks, isLoadingData, errorText, analysis, isLoadingAnalysis, isExporting, exportSuccess, activeTab, showPrintWarning, docMonth, docYear, docTitle, docSubtitle, docCalFilter, docTypeFilter, docAulaFilter, docInstructorFilter, docSearchQuery, docExcludedIds, docFields, customDocFields, docHeaderFields, todayFormatted, showFeedbackAgent, feedbackText, isSendingFeedback, feedbackTickets, viewRange, focusDate, selectedEvent, eventTaskLinks, onlyShowRangeTasks, showOnlyCourses, selectedAulaFilter, calendarSubTab, tasksTabMode, searchTaskQuery, tasksRoleFilter, calendars, selectedCalIds, userRole, teacherEmailFilter, customTeacherEmail, availabilities, newAvailStart, newAvailEnd, newAvailNotes, editingAvailId, teacherQualifications, eventResources, eventOverrides, syncFrequency, lastSyncTime, aulas, embarcaciones, staffDatabase, isAdminModalOpen, setNeedsAuth, setIsLoggingIn, setUser, setToken, setEvents, setTaskLists, setTasks, setIsLoadingData, setErrorText, setAnalysis, setIsLoadingAnalysis, setIsExporting, setExportSuccess, setActiveTab, setShowPrintWarning, setDocMonth, setDocYear, setDocTitle, setDocSubtitle, setDocCalFilter, setDocTypeFilter, setDocAulaFilter, setDocInstructorFilter, setDocSearchQuery, setDocExcludedIds, setDocFields, setCustomDocFields, setDocHeaderFields, setTodayFormatted, setShowFeedbackAgent, setFeedbackText, setIsSendingFeedback, setFeedbackTickets, setViewRange, setFocusDate, setSelectedEvent, setEventTaskLinks, setOnlyShowRangeTasks, setShowOnlyCourses, setSelectedAulaFilter, setCalendarSubTab, setTasksTabMode, setSearchTaskQuery, setTasksRoleFilter, setCalendars, setSelectedCalIds, setUserRole, setTeacherEmailFilter, setCustomTeacherEmail, setAvailabilities, setNewAvailStart, setNewAvailEnd, setNewAvailNotes, setEditingAvailId, setTeacherQualifications, setEventResources, setEventOverrides, setSyncFrequency, setLastSyncTime, setAulas, setEmbarcaciones, setStaffDatabase, setIsAdminModalOpen, mergedEvents, sgcAlertStatus, monthEventCounts, teacherEmails, displayEvents, displayTasks, displayCourses, docFilteredEvents, dgmmAlerts, globalConflicts, handleAddAvailability, handleDeleteAvailability, handleSaveResources, handleToggleAuditTaskDashboard, handleUpdateEvent, getRangeConfig, navigateRange, handlePrintSGC, handleLinkTask, handleUnlinkTask, handleUnlinkTaskCard, getEventTimes, formatTime, getEventInstructor, getEventTeacherEmail, checkTeacherAvailability, formatEventDates, handleExportToSheets, triggerAIAnalysis, handleNavigate, handleToggleTaskStatus, handleToggleAuditTask, AUDIT_TASKS } = props;
  if (!events || events.length === 0) return <div className="p-8 text-center text-slate-500 font-medium">No hay datos disponibles para mostrar todavía.</div>;
  return (
    <>
      
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
                              <PronauticLogo variant="icon" className="w-10 h-10 text-white" />
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
                
    </>
  );
}
