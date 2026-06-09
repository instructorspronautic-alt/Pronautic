import { useState, useEffect } from "react";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarEvent } from "../types";
import { CheckSquare, Clock, MapPin, CheckCircle2, Mic, Users, CalendarCheck, UserPlus, Filter } from "lucide-react";

interface Props {
  events: CalendarEvent[];
  eventResources?: Record<string, any>;
  handleSaveResources?: (eventId: string, resources: any) => void;
  staffDatabase?: any[];
  userEmail?: string;
  userRole?: string;
}

export default function InstructorCheckInView({ events, eventResources = {}, handleSaveResources, staffDatabase = [], userEmail, userRole }: Props) {
  const [dbStatus, setDbStatus] = useState<Record<string, any>>({});
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"today" | "all">("today");

  const today = new Date();
  
  const isAdmin = userRole === "admin" || userRole === "owner";
  // Find current instructor name from email
  const currentStaff = staffDatabase.find(s => s.email?.toLowerCase() === userEmail?.toLowerCase());
  const isInstructorOnly = !isAdmin && currentStaff !== undefined; // If they are not admin, filter for them
  
  // Filter for ONLY courses/practicas logically
  const allCourses = events.filter(e => {
    // If instructor logging in, filter only assigned courses
    if (isInstructorOnly && eventResources[e.id]?.instructor !== currentStaff.name) {
       return false;
    }
    
    const startStr = e.start?.dateTime || e.start?.date;
    if (!startStr) return false;
    const summaryStr = (e.summary || "").toUpperCase();
    return summaryStr.includes("PER") || 
           summaryStr.includes("PNB") ||
           summaryStr.includes("STCW") ||
           summaryStr.includes("PRACTICA");
  }).sort((a, b) => {
    const startA = a.start?.dateTime || a.start?.date || "";
    const startB = b.start?.dateTime || b.start?.date || "";
    return new Date(startA).getTime() - new Date(startB).getTime();
  });

  const todayEvents = allCourses.filter(e => {
    const startStr = e.start?.dateTime || e.start?.date;
    return startStr && isSameDay(new Date(startStr), today);
  });

  const displayedCourses = viewMode === "today" ? todayEvents : allCourses;

  // Load from local storage on mount
  useEffect(() => {
    const loadStatus = () => {
      const saved = localStorage.getItem("instructor_checkins") || "{}";
      const metadata = JSON.parse(saved);
      setDbStatus(metadata);
    };
    loadStatus();
  }, []);

  const handleCheckIn = async (eventId: string) => {
    setCheckingIn(eventId);
    const now = new Date().toISOString();
    
    const saved = localStorage.getItem("instructor_checkins") || "{}";
    const metadata = JSON.parse(saved);
    metadata[eventId] = { ...(metadata[eventId] || {}), check_in_timestamp: now, updated_at: now };
    localStorage.setItem("instructor_checkins", JSON.stringify(metadata));
    setDbStatus(metadata);
    
    setCheckingIn(null);
  };

  const handleMassCheckIn = () => {
    const now = new Date().toISOString();
    const saved = localStorage.getItem("instructor_checkins") || "{}";
    const metadata = JSON.parse(saved);
    
    displayedCourses.forEach(e => {
      metadata[e.id] = { ...(metadata[e.id] || {}), check_in_timestamp: now, updated_at: now };
    });
    
    localStorage.setItem("instructor_checkins", JSON.stringify(metadata));
    setDbStatus(metadata);
  };

  const handleVoiceNote = (eventId: string) => {
    alert("Iniciando grabación de voz para el acta...");
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-150">
        <div>
          <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            Panel de Instructores y Check-In
          </h2>
          <p className="text-xs text-slate-500 font-medium max-w-sm mt-0.5">
            Asignación de docentes y confirmación de impartición (Check-in).
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode("today")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === "today" 
                ? "bg-white text-indigo-700 shadow-sm" 
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Solo Hoy ({todayEvents.length})
          </button>
          <button
            onClick={() => setViewMode("all")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === "all" 
                ? "bg-white text-indigo-700 shadow-sm" 
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            Todos los Mostrados ({allCourses.length})
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button
          onClick={handleMassCheckIn}
          disabled={displayedCourses.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Marcar todos los mostrados como Impartidos
        </button>
      </div>

      {displayedCourses.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 p-8 py-10 rounded-xl text-center">
          <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-black text-slate-650">No hay cursos ni prácticas para mostrar en esta vista.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedCourses.map(event => {
            const isCheckedIn = !!dbStatus[event.id]?.check_in_timestamp;
            const currentInstructor = eventResources[event.id]?.instructor || "";

            return (
              <div key={event.id} className="bg-white border text-left border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                      {event.summary?.includes("STCW") ? "STCW" : "CURSO/PRÁCTICA"}
                    </span>
                    <h3 className="text-xs font-black text-slate-800 line-clamp-2 leading-tight mt-0.5" title={event.summary}>
                      {event.summary}
                    </h3>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1.5 text-[11px] font-semibold text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {event.start?.dateTime ? format(new Date(event.start.dateTime), "dd MMM HH:mm", { locale: es }) : 
                     event.start?.date ? format(new Date(event.start.date), "dd MMM", { locale: es }) : "S/F"}
                  </div>
                </div>

                {/* Asignación de Instructor */}
                <div className="mt-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 mb-1">
                    <UserPlus className="w-3 h-3 text-slate-400" /> Asignación
                  </label>
                  {isAdmin ? (
                    <select
                      className="w-full border border-slate-200 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-indigo-500 font-medium text-slate-700 bg-slate-50"
                      value={currentInstructor}
                      onChange={(e) => {
                        if (handleSaveResources) {
                          handleSaveResources(event.id, { instructor: e.target.value });
                        }
                      }}
                    >
                      <option value="">-- Sin asignar --</option>
                      {staffDatabase.map(staff => (
                        <option key={staff.id} value={staff.name}>{staff.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full border border-slate-200 rounded-lg p-1.5 text-xs font-medium text-slate-700 bg-slate-50">
                      {currentInstructor || "Sin asignar"}
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-3 flex gap-2 w-full border-t border-slate-100">
                  {isCheckedIn ? (
                    <div className="flex-1 bg-emerald-50 text-emerald-700 py-2 px-3 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 cursor-default border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" />
                      Impartida
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCheckIn(event.id)}
                      disabled={checkingIn === event.id}
                      className="flex-1 bg-slate-800 hover:bg-slate-900 text-white disabled:opacity-50 py-2 px-3 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm"
                    >
                      <CheckSquare className="w-4 h-4" />
                      Check-in
                    </button>
                  )}
                  
                  {isCheckedIn && (
                    <button
                      onClick={() => handleVoiceNote(event.id)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl cursor-pointer transition-all border border-slate-200 shadow-sm shrink-0"
                      title="Grabar acta"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
