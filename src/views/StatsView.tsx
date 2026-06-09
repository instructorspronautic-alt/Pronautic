import React from "react";
import MetricsDashboard from "../components/MetricsDashboard";
import { User, Search, Settings, FileText, CheckCircle2, Ticket, PackageOpen, Download, Filter, Eye, AlertCircle, Phone, Calendar, Clock, Lock, Ship, ArrowRight, Play, Edit3, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Bar } from "recharts";

export default function StatsView(props: any) {
  const { needsAuth, isLoggingIn, user, token, events, taskLists, tasks, isLoadingData, errorText, analysis, isLoadingAnalysis, isExporting, exportSuccess, activeTab, showPrintWarning, docMonth, docYear, docTitle, docSubtitle, docCalFilter, docTypeFilter, docAulaFilter, docInstructorFilter, docSearchQuery, docExcludedIds, docFields, customDocFields, docHeaderFields, todayFormatted, showFeedbackAgent, feedbackText, isSendingFeedback, feedbackTickets, viewRange, focusDate, selectedEvent, eventTaskLinks, onlyShowRangeTasks, showOnlyCourses, selectedAulaFilter, calendarSubTab, tasksTabMode, searchTaskQuery, tasksRoleFilter, calendars, selectedCalIds, userRole, teacherEmailFilter, customTeacherEmail, availabilities, newAvailStart, newAvailEnd, newAvailNotes, editingAvailId, teacherQualifications, eventResources, eventOverrides, syncFrequency, lastSyncTime, aulas, embarcaciones, staffDatabase, isAdminModalOpen, setNeedsAuth, setIsLoggingIn, setUser, setToken, setEvents, setTaskLists, setTasks, setIsLoadingData, setErrorText, setAnalysis, setIsLoadingAnalysis, setIsExporting, setExportSuccess, setActiveTab, setShowPrintWarning, setDocMonth, setDocYear, setDocTitle, setDocSubtitle, setDocCalFilter, setDocTypeFilter, setDocAulaFilter, setDocInstructorFilter, setDocSearchQuery, setDocExcludedIds, setDocFields, setCustomDocFields, setDocHeaderFields, setTodayFormatted, setShowFeedbackAgent, setFeedbackText, setIsSendingFeedback, setFeedbackTickets, setViewRange, setFocusDate, setSelectedEvent, setEventTaskLinks, setOnlyShowRangeTasks, setShowOnlyCourses, setSelectedAulaFilter, setCalendarSubTab, setTasksTabMode, setSearchTaskQuery, setTasksRoleFilter, setCalendars, setSelectedCalIds, setUserRole, setTeacherEmailFilter, setCustomTeacherEmail, setAvailabilities, setNewAvailStart, setNewAvailEnd, setNewAvailNotes, setEditingAvailId, setTeacherQualifications, setEventResources, setEventOverrides, setSyncFrequency, setLastSyncTime, setAulas, setEmbarcaciones, setStaffDatabase, setIsAdminModalOpen, mergedEvents, sgcAlertStatus, monthEventCounts, teacherEmails, displayEvents, displayTasks, displayCourses, docFilteredEvents, dgmmAlerts, globalConflicts, handleAddAvailability, handleDeleteAvailability, handleSaveResources, handleToggleAuditTaskDashboard, handleUpdateEvent, getRangeConfig, navigateRange, handlePrintSGC, handleLinkTask, handleUnlinkTask, handleUnlinkTaskCard, getEventTimes, formatTime, getEventInstructor, getEventTeacherEmail, checkTeacherAvailability, formatEventDates, handleExportToSheets, triggerAIAnalysis, handleNavigate, handleToggleTaskStatus, handleToggleAuditTask, AUDIT_TASKS } = props;
  if (!events) return <div className="p-8 text-center text-slate-500 font-medium">No hay datos disponibles para mostrar todavía.</div>;
  return (
    <>
      
                  <MetricsDashboard events={mergedEvents} />
                
    </>
  );
}
