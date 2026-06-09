import React from "react";
import { Layers } from "lucide-react";
import { User, Search, Settings, FileText, CheckCircle2, Ticket, PackageOpen, Download, Filter, Eye, AlertCircle, Phone, Calendar, Clock, Lock, Ship, ArrowRight, Play, Edit3, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Bar } from "recharts";

export default function ResourcesView(props: any) {
  const { needsAuth, isLoggingIn, user, token, events, taskLists, tasks, isLoadingData, errorText, analysis, isLoadingAnalysis, isExporting, exportSuccess, activeTab, showPrintWarning, docMonth, docYear, docTitle, docSubtitle, docCalFilter, docTypeFilter, docAulaFilter, docInstructorFilter, docSearchQuery, docExcludedIds, docFields, customDocFields, docHeaderFields, todayFormatted, showFeedbackAgent, feedbackText, isSendingFeedback, feedbackTickets, viewRange, focusDate, selectedEvent, eventTaskLinks, onlyShowRangeTasks, showOnlyCourses, selectedAulaFilter, calendarSubTab, tasksTabMode, searchTaskQuery, tasksRoleFilter, calendars, selectedCalIds, userRole, teacherEmailFilter, customTeacherEmail, availabilities, newAvailStart, newAvailEnd, newAvailNotes, editingAvailId, teacherQualifications, eventResources, eventOverrides, syncFrequency, lastSyncTime, aulas, embarcaciones, staffDatabase, isAdminModalOpen, setNeedsAuth, setIsLoggingIn, setUser, setToken, setEvents, setTaskLists, setTasks, setIsLoadingData, setErrorText, setAnalysis, setIsLoadingAnalysis, setIsExporting, setExportSuccess, setActiveTab, setShowPrintWarning, setDocMonth, setDocYear, setDocTitle, setDocSubtitle, setDocCalFilter, setDocTypeFilter, setDocAulaFilter, setDocInstructorFilter, setDocSearchQuery, setDocExcludedIds, setDocFields, setCustomDocFields, setDocHeaderFields, setTodayFormatted, setShowFeedbackAgent, setFeedbackText, setIsSendingFeedback, setFeedbackTickets, setViewRange, setFocusDate, setSelectedEvent, setEventTaskLinks, setOnlyShowRangeTasks, setShowOnlyCourses, setSelectedAulaFilter, setCalendarSubTab, setTasksTabMode, setSearchTaskQuery, setTasksRoleFilter, setCalendars, setSelectedCalIds, setUserRole, setTeacherEmailFilter, setCustomTeacherEmail, setAvailabilities, setNewAvailStart, setNewAvailEnd, setNewAvailNotes, setEditingAvailId, setTeacherQualifications, setEventResources, setEventOverrides, setSyncFrequency, setLastSyncTime, setAulas, setEmbarcaciones, setStaffDatabase, setIsAdminModalOpen, mergedEvents, sgcAlertStatus, monthEventCounts, teacherEmails, displayEvents, displayTasks, displayCourses, docFilteredEvents, dgmmAlerts, globalConflicts, handleAddAvailability, handleDeleteAvailability, handleSaveResources, handleToggleAuditTaskDashboard, handleUpdateEvent, getRangeConfig, navigateRange, handlePrintSGC, handleLinkTask, handleUnlinkTask, handleUnlinkTaskCard, getEventTimes, formatTime, getEventInstructor, getEventTeacherEmail, checkTeacherAvailability, formatEventDates, handleExportToSheets, triggerAIAnalysis, handleNavigate, handleToggleTaskStatus, handleToggleAuditTask, AUDIT_TASKS } = props;
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
  </>
  );
}
