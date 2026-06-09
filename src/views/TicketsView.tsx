import React from "react";
import { ClipboardList, Bot } from "lucide-react";
import { User, Search, Settings, FileText, CheckCircle2, Ticket, PackageOpen, Download, Filter, Eye, AlertCircle, Phone, Calendar, Clock, Lock, Ship, ArrowRight, Play, Edit3, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Bar } from "recharts";

export default function TicketsView(props: any) {
  const { needsAuth, isLoggingIn, user, token, events, taskLists, tasks, isLoadingData, errorText, analysis, isLoadingAnalysis, isExporting, exportSuccess, activeTab, showPrintWarning, docMonth, docYear, docTitle, docSubtitle, docCalFilter, docTypeFilter, docAulaFilter, docInstructorFilter, docSearchQuery, docExcludedIds, docFields, customDocFields, docHeaderFields, todayFormatted, showFeedbackAgent, feedbackText, isSendingFeedback, feedbackTickets, viewRange, focusDate, selectedEvent, eventTaskLinks, onlyShowRangeTasks, showOnlyCourses, selectedAulaFilter, calendarSubTab, tasksTabMode, searchTaskQuery, tasksRoleFilter, calendars, selectedCalIds, userRole, teacherEmailFilter, customTeacherEmail, availabilities, newAvailStart, newAvailEnd, newAvailNotes, editingAvailId, teacherQualifications, eventResources, eventOverrides, syncFrequency, lastSyncTime, aulas, embarcaciones, staffDatabase, isAdminModalOpen, setNeedsAuth, setIsLoggingIn, setUser, setToken, setEvents, setTaskLists, setTasks, setIsLoadingData, setErrorText, setAnalysis, setIsLoadingAnalysis, setIsExporting, setExportSuccess, setActiveTab, setShowPrintWarning, setDocMonth, setDocYear, setDocTitle, setDocSubtitle, setDocCalFilter, setDocTypeFilter, setDocAulaFilter, setDocInstructorFilter, setDocSearchQuery, setDocExcludedIds, setDocFields, setCustomDocFields, setDocHeaderFields, setTodayFormatted, setShowFeedbackAgent, setFeedbackText, setIsSendingFeedback, setFeedbackTickets, setViewRange, setFocusDate, setSelectedEvent, setEventTaskLinks, setOnlyShowRangeTasks, setShowOnlyCourses, setSelectedAulaFilter, setCalendarSubTab, setTasksTabMode, setSearchTaskQuery, setTasksRoleFilter, setCalendars, setSelectedCalIds, setUserRole, setTeacherEmailFilter, setCustomTeacherEmail, setAvailabilities, setNewAvailStart, setNewAvailEnd, setNewAvailNotes, setEditingAvailId, setTeacherQualifications, setEventResources, setEventOverrides, setSyncFrequency, setLastSyncTime, setAulas, setEmbarcaciones, setStaffDatabase, setIsAdminModalOpen, mergedEvents, sgcAlertStatus, monthEventCounts, teacherEmails, displayEvents, displayTasks, displayCourses, docFilteredEvents, dgmmAlerts, globalConflicts, handleAddAvailability, handleDeleteAvailability, handleSaveResources, handleToggleAuditTaskDashboard, handleUpdateEvent, getRangeConfig, navigateRange, handlePrintSGC, handleLinkTask, handleUnlinkTask, handleUnlinkTaskCard, getEventTimes, formatTime, getEventInstructor, getEventTeacherEmail, checkTeacherAvailability, formatEventDates, handleExportToSheets, triggerAIAnalysis, handleNavigate, handleToggleTaskStatus, handleToggleAuditTask, AUDIT_TASKS } = props;
  if (!events) return <div className="p-8 text-center text-slate-500 font-medium">No hay datos disponibles para mostrar todavía.</div>;
  return (
    <>
      
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
                                    setFeedbackTickets(
                                      feedbackTickets.filter(
                                        (x) => x.id !== t.id,
                                      ),
                                    );
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
                
    </>
  );
}
