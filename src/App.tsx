import { useState, useEffect, useMemo, useCallback } from "react";
import { useAppLogic } from "./hooks/useAppLogic";
import SidebarView from "./views/SidebarView";
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
import ConflictsBanner from "./components/ConflictsBanner";
import DGMMAlertsBanner from "./components/DGMMAlertsBanner";
import AIAnalysisView from "./views/AIAnalysisView";
import CalendarView from "./views/CalendarView";
import TasksView from "./views/TasksView";
import DocGeneratorView from "./views/DocGeneratorView";
import StatsView from "./views/StatsView";
import TicketsView from "./views/TicketsView";
import ResourcesView from "./views/ResourcesView";
import InstructorCheckInView from "./components/InstructorCheckInView";
import EventDetailModal, {
  AUDIT_TASKS,
  AuditTask,
} from "./components/EventDetailModal";
import AdminResourcesModal from "./components/AdminResourcesModal";
import { PronauticLogo } from "./components/PronauticLogo";
import {
  loadEventResources,
  loadInstructors,
  loadAvailabilities,
  saveEventResources,
  saveInstructors,
  saveAvailabilities,
} from "./services/sheetsDB";
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
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { mockCalendars, mockEventsList, mockLists, mockTasksList, DEFAULT_AULAS, DEFAULT_EMBARCACIONES, DEFAULT_STAFF, PRONAUTIC_COURSES_CATALOG } from "./mockData";

function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]*>?/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}









export default function App() {
  const viewProps = useAppLogic();
  
  const { displayEvents, focusDate, token, loadWorkspaceData, navigateRange } = viewProps;
const { needsAuth, user, isLoggingIn, activeTab, errorText, calendars, selectedCalIds, setSelectedCalIds, isAdminModalOpen, setIsAdminModalOpen, aulas, setAulas, embarcaciones, setEmbarcaciones, showFeedbackAgent, setShowFeedbackAgent, feedbackText, setFeedbackText, isSendingFeedback, setIsSendingFeedback, selectedEvent, userRole, mergedEvents, eventResources, tasks, eventTaskLinks, handleLinkTask, handleUnlinkTask, handleSaveResources, handleUpdateEvent, checkTeacherAvailability, staffDatabase, setCalendarSubTab, showOnlyCourses, setShowOnlyCourses, selectedAulaFilter, setSelectedAulaFilter, selectedEmbarcacionFilter, setSelectedEmbarcacionFilter, formatTime, formatEventDates, teacherEmailFilter, displayTasks, displayCourses, events, tasksTabMode, setTasksTabMode, selectedCourseIdForTasks, setSelectedCourseIdForTasks, searchTaskQuery, setSearchTaskQuery, tasksRoleFilter, setTasksRoleFilter, handleUnlinkTaskCard, handleToggleTaskStatus, handleToggleAuditTaskDashboard, setOnlyShowRangeTasks, getInstructorAvailabilityAndQualification, onlyShowRangeTasks, handleLogin, handleSimulateLogin, handleLogout, selectedInstructorForCourses, setSelectedInstructorForCourses, progressPercent, completedTasksCount, totalTasksCount, globalConflicts, dgmmAlerts, setViewRange, setSelectedEvent, setFeedbackTickets, triggerAIAnalysis, handleExportToSheets, viewRange, lastSyncTime, syncFrequency, setSyncFrequency, isLoadingData, isLoadingAnalysis, todayFormatted, setActiveTab, analysis, isExporting, exportSuccess, sgcAlertStatus, calendarSubTab} = viewProps;
  const userName = user?.email?.toLowerCase() === "instructorspronautic@gmail.com" ? "Robert" : user?.email?.toLowerCase() === "bopronautic@gmail.com" ? "Raquel" : user?.displayName || "Usuario";
  const userRoleLabel = user?.email?.toLowerCase() === "instructorspronautic@gmail.com" ? "Director de Operaciones" : user?.email?.toLowerCase() === "bopronautic@gmail.com" ? "Directora del Centro" : "Usuario Pronautic";
  const isRober = user?.email?.toLowerCase() === "instructorspronautic@gmail.com";
  const isRaquel = user?.email?.toLowerCase() === "bopronautic@gmail.com";
  const userAvatarUrl = isRober ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=80&h=80&q=80" : isRaquel ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=80&h=80&q=80" : user?.photoURL;
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

              

                {/* Developer Simulation Login Array */}
                <div className="pt-6 mt-6 border-t border-slate-100 space-y-2">
                    <p className="text-[10px] text-slate-400 font-mono text-center mb-2 uppercase tracking-widest">Modo Simulación</p>
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => handleSimulateLogin!('rober')} disabled={isLoggingIn} className="flex-1 py-1.5 px-3 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg border border-slate-200 transition-colors">Login Rober</button>
                      <button onClick={() => handleSimulateLogin!('raquel')} disabled={isLoggingIn} className="flex-1 py-1.5 px-3 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg border border-slate-200 transition-colors">Login Raquel</button>
                    </div>
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
            
              <SidebarView viewProps={viewProps} />
  

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
                  Mis Eventos ({viewProps.displayEvents.length})
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
                <ConflictsBanner conflicts={globalConflicts} />
                <DGMMAlertsBanner alerts={dgmmAlerts} />

                {activeTab === "ai" && (
                  <AIAnalysisView
                    analysis={analysis}
                    isLoadingAnalysis={isLoadingAnalysis}
                    isExporting={isExporting}
                    exportSuccess={exportSuccess}
                    onExportToSheets={handleExportToSheets}
                    viewRange={viewRange}
                    events={mergedEvents}
                    tasks={tasks}
                    onTriggerAnalysis={triggerAIAnalysis}
                  />
                )}

                
                {activeTab === "calendar" && (
                  <CalendarView

  eventTaskLinks={viewProps.eventTaskLinks}
  handleToggleTaskStatus={viewProps.handleToggleTaskStatus}
  handleUnlinkTaskCard={viewProps.handleUnlinkTaskCard}
  getInstructorAvailabilityAndQualification={viewProps.getInstructorAvailabilityAndQualification}

                    displayEvents={viewProps.displayEvents}
                    mergedEvents={mergedEvents}
                    eventResources={eventResources}
                    globalConflicts={globalConflicts}
                    calendars={calendars}
                    selectedCalIds={selectedCalIds}
                    setSelectedCalIds={setSelectedCalIds}
                    viewRange={viewRange}
                    setViewRange={setViewRange}
                    focusDate={viewProps.focusDate}
                    todayFormatted={todayFormatted}
                    onNavigate={viewProps.handleNavigate!}
                    selectedEvent={selectedEvent}
                    setSelectedEvent={setSelectedEvent}
                    calendarSubTab={calendarSubTab}
                    setCalendarSubTab={setCalendarSubTab}
                    showOnlyCourses={showOnlyCourses}
                    setShowOnlyCourses={setShowOnlyCourses}
                    selectedAulaFilter={selectedAulaFilter}
                    setSelectedAulaFilter={setSelectedAulaFilter}
                    selectedEmbarcacionFilter={selectedEmbarcacionFilter}
                    setSelectedEmbarcacionFilter={setSelectedEmbarcacionFilter}
                    aulas={aulas}
                    embarcaciones={embarcaciones}
                    formatTime={formatTime}
                    formatEventDates={formatEventDates}
                    checkTeacherAvailability={checkTeacherAvailability}
                    userRole={userRole}
                    handleUpdateEvent={handleUpdateEvent}
                    staffDatabase={staffDatabase}
                    teacherEmailFilter={teacherEmailFilter}
                    handleSaveResources={handleSaveResources}
                    tasks={tasks}
                  />
                )}

                {activeTab === "tasks" && (
                                  <TasksView
                  tasks={tasks}
                  displayTasks={displayTasks}
                  displayCourses={displayCourses}
                  events={events}
                  mergedEvents={mergedEvents}
                  eventResources={eventResources}
                  eventTaskLinks={eventTaskLinks}
                  tasksTabMode={tasksTabMode}
                  setTasksTabMode={setTasksTabMode}
                  selectedCourseIdForTasks={selectedCourseIdForTasks!}
                  setSelectedCourseIdForTasks={setSelectedCourseIdForTasks}
                  searchTaskQuery={searchTaskQuery}
                  setSearchTaskQuery={setSearchTaskQuery}
                  tasksRoleFilter={tasksRoleFilter}
                  setTasksRoleFilter={setTasksRoleFilter}
                  onToggleTaskStatus={handleToggleTaskStatus!}
                  onToggleAuditTask={handleToggleAuditTaskDashboard!}
                  onLinkTask={handleLinkTask}
                  onUnlinkTaskCard={handleUnlinkTaskCard!}
                  selectedEvent={selectedEvent}
                  AUDIT_TASKS={AUDIT_TASKS!}
                  formatEventDates={formatEventDates}
                  globalConflicts={viewProps.globalConflicts!}
                  getInstructorAvailabilityAndQualification={viewProps.getInstructorAvailabilityAndQualification!}
                  handleToggleAuditTaskDashboard={viewProps.handleToggleAuditTaskDashboard!}
                  setOnlyShowRangeTasks={viewProps.setOnlyShowRangeTasks!}
                  onlyShowRangeTasks={viewProps.onlyShowRangeTasks!}
                  handleToggleTaskStatus={viewProps.handleToggleTaskStatus!}
                />
                )}


                {activeTab === "doc-generator" && (
                  <DocGeneratorView {...viewProps} />
                )}
  
                
                {activeTab === "stats" && (
                  <StatsView {...viewProps} />
                )}
  
                
                {activeTab === "tickets" && (
                  <TicketsView {...viewProps} />
                )}
  
                
                {activeTab === "resources" && (
                  <ResourcesView {...viewProps} />
                )}
  
              </div>
            </section>
          </div>
        </>
      )}

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
