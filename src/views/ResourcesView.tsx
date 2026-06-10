import React, { useState } from "react";
import { InstructorProfile } from "../types";
import { Layers } from "lucide-react";
import { User, Search, Settings, FileText, CheckCircle2, Ticket, PackageOpen, Download, Filter, Eye, AlertCircle, Phone, Calendar, Clock, Lock, Ship, ArrowRight, Play, Edit3, Trash2, X, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Bar } from "recharts";

export default function ResourcesView(props: any) {
  const { handleSaveStaff, needsAuth, isLoggingIn, user, token, events, taskLists, tasks, isLoadingData, errorText, analysis, isLoadingAnalysis, isExporting, exportSuccess, activeTab, showPrintWarning, docMonth, docYear, docTitle, docSubtitle, docCalFilter, docTypeFilter, docAulaFilter, docInstructorFilter, docSearchQuery, docExcludedIds, docFields, customDocFields, docHeaderFields, todayFormatted, showFeedbackAgent, feedbackText, isSendingFeedback, feedbackTickets, viewRange, focusDate, selectedEvent, eventTaskLinks, onlyShowRangeTasks, showOnlyCourses, selectedAulaFilter, calendarSubTab, tasksTabMode, searchTaskQuery, tasksRoleFilter, calendars, selectedCalIds, userRole, teacherEmailFilter, customTeacherEmail, availabilities, newAvailStart, newAvailEnd, newAvailNotes, editingAvailId, teacherQualifications, eventResources, eventOverrides, syncFrequency, lastSyncTime, aulas, embarcaciones, staffDatabase, isAdminModalOpen, setNeedsAuth, setIsLoggingIn, setUser, setToken, setEvents, setTaskLists, setTasks, setIsLoadingData, setErrorText, setAnalysis, setIsLoadingAnalysis, setIsExporting, setExportSuccess, setActiveTab, setShowPrintWarning, setDocMonth, setDocYear, setDocTitle, setDocSubtitle, setDocCalFilter, setDocTypeFilter, setDocAulaFilter, setDocInstructorFilter, setDocSearchQuery, setDocExcludedIds, setDocFields, setCustomDocFields, setDocHeaderFields, setTodayFormatted, setShowFeedbackAgent, setFeedbackText, setIsSendingFeedback, setFeedbackTickets, setViewRange, setFocusDate, setSelectedEvent, setEventTaskLinks, setOnlyShowRangeTasks, setShowOnlyCourses, setSelectedAulaFilter, setCalendarSubTab, setTasksTabMode, setSearchTaskQuery, setTasksRoleFilter, setCalendars, setSelectedCalIds, setUserRole, setTeacherEmailFilter, setCustomTeacherEmail, setAvailabilities, setNewAvailStart, setNewAvailEnd, setNewAvailNotes, setEditingAvailId, setTeacherQualifications, setEventResources, setEventOverrides, setSyncFrequency, setLastSyncTime, setAulas, setEmbarcaciones, setStaffDatabase, setIsAdminModalOpen, mergedEvents, sgcAlertStatus, monthEventCounts, teacherEmails, displayEvents, displayTasks, displayCourses, docFilteredEvents, dgmmAlerts, globalConflicts, handleAddAvailability, handleDeleteAvailability, handleSaveResources, handleToggleAuditTaskDashboard, handleUpdateEvent, getRangeConfig, navigateRange, handlePrintSGC, handleLinkTask, handleUnlinkTask, handleUnlinkTaskCard, getEventTimes, formatTime, getEventInstructor, getEventTeacherEmail, checkTeacherAvailability, formatEventDates, handleExportToSheets, triggerAIAnalysis, handleNavigate, handleToggleTaskStatus, handleToggleAuditTask, AUDIT_TASKS , setSelectedInstructorForCourses } = props;
  
  const [editingStaff, setEditingStaff] = useState<InstructorProfile | null>(null);
  
  const isAdmin = userRole === "admin" || userRole === "owner";
  const userEmail = typeof props.userEmail === 'string' ? props.userEmail : (user?.email || "");

  const visibleStaff = isAdmin 
    ? staffDatabase 
    : staffDatabase.filter((s: InstructorProfile) => s.email?.toLowerCase() === userEmail?.toLowerCase());

  if (!events || events.length === 0) return <div className="p-8 text-center text-slate-500 font-medium">No hay datos disponibles para mostrar todavía.</div>;
  return (
    <>
      
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
                        {isAdmin && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <span>🏫</span> Aulas Registradas
                          </h3>
                          <div className="flex flex-col gap-2 mb-4">
                            {aulas.map((aula: string, idx: number) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center bg-white border border-slate-200 p-2 rounded text-xs"
                              >
                                <span className="font-semibold text-slate-700">
                                  {aula}
                                </span>
                                <button
                                  onClick={() =>
                                    setAulas(aulas.filter((a: string) => a !== aula))
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
                        )}

                        {/* Embarcaciones */}
                        {isAdmin && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <span>⛵</span> Embarcaciones Registradas
                          </h3>
                          <div className="flex flex-col gap-2 mb-4">
                            {embarcaciones.map((emb: string, idx: number) => (
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
                                      embarcaciones.filter((e: string) => e !== emb),
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
                        )}

                        {/* Instructores */}
                        <div className={`bg-slate-50 border border-slate-200 rounded-xl p-4 ${isAdmin ? 'md:col-span-2' : ''}`}>
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                              <span>👨‍🏫</span> {isAdmin ? "Directorio de Docentes" : "Mi Perfil de Docente"}
                            </h3>
                          </div>
                          <p className="text-[11px] text-slate-500 mb-4">
                            {isAdmin ? "Listado de plantilla local. Este directorio alimenta las opciones de asignación en los eventos." : "Gestiona tu información personal y de contacto."}
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
                                  <th className="p-2 border-b border-slate-200 text-center">
                                    Asignados
                                  </th>
                                  <th className="p-2 border-b border-slate-200 w-16 text-center">Editar</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {visibleStaff.map((staff: InstructorProfile) => {
                                  const assignedCourses = mergedEvents.filter(
                                    (e: any) => {
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
                                      <td className="p-2 text-center text-xs text-slate-500">
                                        {staff.courses || "-"}
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
                                      <td className="p-2 text-center whitespace-nowrap">
                                        <button
                                          onClick={() => setEditingStaff(staff)}
                                          className="text-slate-400 hover:text-indigo-600 mx-1"
                                          title="Editar instructor"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => {
                                            if (window.confirm("¿Seguro que deseas dar de baja o eliminar este perfil?")) {
                                              (handleSaveStaff || setStaffDatabase)(
                                                staffDatabase.filter(
                                                  (s: InstructorProfile) => s.id !== staff.id,
                                                ),
                                              );
                                            }
                                          }}
                                          className="text-slate-400 hover:text-rose-500 mx-1"
                                          title="Eliminar instructor"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                                {visibleStaff.length === 0 && !isAdmin && (
                                  <tr>
                                    <td colSpan={8} className="p-4 text-center">
                                      <p className="text-sm font-bold text-slate-600 mb-2">Aún no tienes un perfil de docente activo.</p>
                                      <button 
                                        onClick={() => setEditingStaff({
                                          id: "staff-" + Date.now(),
                                          branca: "",
                                          name: user?.name || "",
                                          email: userEmail,
                                          phone: "",
                                          category: "",
                                          location: ""
                                        })}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded font-bold hover:bg-indigo-700 transition"
                                      >Crear Mi Perfil Ahora</button>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>

                          {/* Asignación Masiva de Docentes */}
                          {isAdmin && (
                          <div className="mt-8">
                            <h4 className="text-sm font-bold text-slate-800 mb-2 border-b border-slate-200 pb-2">
                              Asignación Masiva a Cursos Sin Instructor
                            </h4>
                            <p className="text-[11px] text-slate-500 mb-3">
                              Cursos y prácticas listadas sin docente. Asigna instructores rápidamente.
                            </p>
                            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2">
                              {mergedEvents
                                .filter(e => {
                                  const name = (e.summary || "").toUpperCase();
                                  const isCourse = name.includes("STCW") || name.includes("PER") || name.includes("PNB") || name.includes("PRACTICA");
                                  const hasInstructor = !!eventResources[e.id]?.instructor;
                                  return isCourse && !hasInstructor;
                                })
                                .map(e => (
                                  <div key={e.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-rose-200 p-2 rounded gap-2 sm:gap-4 text-xs shadow-sm">
                                    <div className="flex-1">
                                      <span className="font-bold text-slate-800 truncate block max-w-full sm:max-w-xs">{e.summary}</span>
                                      <span className="text-[10px] text-slate-500 font-mono">
                                        {formatEventDates(e)}
                                      </span>
                                    </div>
                                    <select
                                      className="border border-slate-300 rounded p-1.5 focus:ring-1 focus:ring-indigo-500 text-slate-700 font-medium w-full sm:w-auto"
                                      onChange={(ev) => {
                                        if (ev.target.value) {
                                          handleSaveResources(e.id, { instructor: ev.target.value });
                                        }
                                      }}
                                    >
                                      <option value="">Seleccionar Docente...</option>
                                      {staffDatabase.map(staff => (
                                        <option key={staff.id} value={staff.name}>{staff.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                ))}
                              {mergedEvents.filter(e => {
                                const name = (e.summary || "").toUpperCase();
                                return (name.includes("STCW") || name.includes("PER") || name.includes("PNB") || name.includes("PRACTICA")) && !eventResources[e.id]?.instructor;
                              }).length === 0 && (
                                <div className="text-center p-4 bg-emerald-50 rounded border border-emerald-100 text-emerald-700 text-xs font-bold">
                                  ¡Todos los cursos tienen instructor asignado!
                                </div>
                              )}
                            </div>
                          </div>
                          )}

                          {/* New Instructor Form */}
                          {isAdmin && (
                          <div className="mt-4 flex justify-end">
                            <button
                              onClick={() => setEditingStaff({
                                id: "staff-" + Date.now(),
                                branca: "",
                                name: "",
                                email: "",
                                phone: "",
                                category: "",
                                location: ""
                              })}
                              className="bg-indigo-600 text-white px-4 py-2 rounded text-xs font-bold hover:bg-indigo-700 flex items-center gap-2"
                            >
                              <UserPlus className="w-4 h-4" />
                              Añadir Nuevo Docente
                            </button>
                          </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

      {editingStaff && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                {editingStaff.id.startsWith("staff-") && !staffDatabase.some((s: InstructorProfile) => s.id === editingStaff.id) ? "Añadir Nuevo Docente" : "Editar Perfil Docente"}
              </h3>
              <button
                onClick={() => setEditingStaff(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 text-sm bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo *</label>
                    <input type="text" className="w-full p-2 border border-slate-300 rounded focus:border-indigo-500 outline-none" 
                      value={editingStaff.name} onChange={e => setEditingStaff({...editingStaff, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                    <input type="email" className="w-full p-2 border border-slate-300 rounded focus:border-indigo-500 outline-none" 
                      value={editingStaff.email || ""} onChange={e => setEditingStaff({...editingStaff, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono</label>
                    <input type="text" className="w-full p-2 border border-slate-300 rounded focus:border-indigo-500 outline-none" 
                      value={editingStaff.phone || ""} onChange={e => setEditingStaff({...editingStaff, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ubicación</label>
                    <input type="text" className="w-full p-2 border border-slate-300 rounded focus:border-indigo-500 outline-none" 
                      value={editingStaff.location || ""} onChange={e => setEditingStaff({...editingStaff, location: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Branca</label>
                    <input type="text" placeholder="STCW, Esbarjo, Sanitari..." className="w-full p-2 border border-slate-300 rounded focus:border-indigo-500 outline-none" 
                      value={editingStaff.branca || ""} onChange={e => setEditingStaff({...editingStaff, branca: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Categoría</label>
                    <input type="text" placeholder="Capitán, Enfermera, Piloto..." className="w-full p-2 border border-slate-300 rounded focus:border-indigo-500 outline-none" 
                      value={editingStaff.category || ""} onChange={e => setEditingStaff({...editingStaff, category: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cursos</label>
                    <input type="text" placeholder="PNB, PER, RO-RO..." className="w-full p-2 border border-slate-300 rounded focus:border-indigo-500 outline-none" 
                      value={editingStaff.courses || ""} onChange={e => setEditingStaff({...editingStaff, courses: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Habilitaciones Capitanía</label>
                    <input type="text" placeholder="PPER, Patró d'altura..." className="w-full p-2 border border-slate-300 rounded focus:border-indigo-500 outline-none" 
                      value={editingStaff.habilitaciones || ""} onChange={e => setEditingStaff({...editingStaff, habilitaciones: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Idioma</label>
                    <input type="text" placeholder="ESP, CAT, ENG..." className="w-full p-2 border border-slate-300 rounded focus:border-indigo-500 outline-none" 
                      value={editingStaff.idioma || ""} onChange={e => setEditingStaff({...editingStaff, idioma: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Situación / Disponibilidad</label>
                    <input type="text" placeholder="En actiu, Disponible, etc..." className="w-full p-2 border border-slate-300 rounded focus:border-indigo-500 outline-none" 
                      value={editingStaff.situacion || ""} onChange={e => setEditingStaff({...editingStaff, situacion: e.target.value})} />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1 mt-6">
                      <input type="checkbox" checked={editingStaff.forfor || false} onChange={e => setEditingStaff({...editingStaff, forfor: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded" />
                      Certificado FORFOR
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Próximos Pasos (Next Step)</label>
                    <input type="text" className="w-full p-2 border border-slate-300 rounded focus:border-indigo-500 outline-none" 
                      value={editingStaff.nextStep || ""} onChange={e => setEditingStaff({...editingStaff, nextStep: e.target.value})} />
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Observaciones</label>
                  <textarea rows={3} className="w-full p-2 border border-slate-300 rounded focus:border-indigo-500 outline-none resize-none" 
                    value={editingStaff.observaciones || ""} onChange={e => setEditingStaff({...editingStaff, observaciones: e.target.value})}></textarea>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
              <button
                onClick={() => setEditingStaff(null)}
                className="px-4 py-2 rounded text-slate-600 font-bold hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!editingStaff.name.trim()) return alert("El nombre es obligatorio");
                  
                  const isExisting = staffDatabase.some((s: InstructorProfile) => s.id === editingStaff.id);
                  if (isExisting) {
                    (handleSaveStaff || setStaffDatabase)(staffDatabase.map((s: InstructorProfile) => s.id === editingStaff.id ? editingStaff : s));
                  } else {
                    (handleSaveStaff || setStaffDatabase)([...staffDatabase, editingStaff]);
                  }
                  
                  setEditingStaff(null);
                }}
                className="px-4 py-2 rounded bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
  </>
  );
}
