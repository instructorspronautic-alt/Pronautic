import { useState, useEffect } from "react";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarEvent } from "../types";
import { CheckSquare, Clock, MapPin, CheckCircle2, Mic } from "lucide-react";

interface Props {
  events: CalendarEvent[];
}

export default function InstructorCheckInView({ events }: Props) {
  const [dbStatus, setDbStatus] = useState<Record<string, any>>({});
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  // Filter for today's courses
  const today = new Date();
  
  const todayEvents = events.filter(e => {
    const startStr = e.start?.dateTime || e.start?.date;
    if (!startStr) return false;
    // Basic check for "today"
    return isSameDay(new Date(startStr), today) && 
        ((e.summary || "").toUpperCase().includes("PER") || 
         (e.summary || "").toUpperCase().includes("PNB") ||
         (e.summary || "").toUpperCase().includes("STCW") ||
         (e.summary || "").toUpperCase().includes("PRACTICA"));
  }).sort((a, b) => {
    const startA = a.start?.dateTime || a.start?.date || "";
    const startB = b.start?.dateTime || b.start?.date || "";
    return new Date(startA).getTime() - new Date(startB).getTime();
  });

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

  const handleVoiceNote = (eventId: string) => {
    // We will implement this later via SpeechRecognition, for now alert setup
    alert("Iniciando grabación de voz para el acta...");
  };

  if (todayEvents.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-200 p-8 py-10 rounded-xl text-center">
        <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-xs font-black text-slate-650">No tienes clases prácticas ni teóricas asignadas para hoy.</p>
        <p className="text-[10.5px] text-slate-400 mt-1">
          Buen momento para revisar inventario o descansar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900">Mis clases de Hoy</h2>
          <p className="text-xs text-slate-500">{format(today, "EEEE, d 'de' MMMM", { locale: es })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {todayEvents.map(event => {
          const isCheckedIn = !!dbStatus[event.id]?.check_in_timestamp;
          const statusEntry = dbStatus[event.id] || {};
          const isNoteSaved = !!statusEntry.notas_instructor;

          return (
            <div key={event.id} className="bg-white border text-left border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Curso</span>
                <h3 className="text-sm font-black text-slate-800 line-clamp-2 leading-tight mt-0.5">{event.summary}</h3>
              </div>
              
              <div className="flex flex-col gap-2 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {event.start?.dateTime ? format(new Date(event.start.dateTime), "HH:mm") : "Todo el día"} - 
                  {event.end?.dateTime ? format(new Date(event.end.dateTime), "HH:mm") : ""}
                </div>
                {event.location && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{event.location}</span>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-4 flex gap-2 w-full border-t border-slate-100">
                {isCheckedIn ? (
                  <div className="flex-1 bg-emerald-50 text-emerald-700 py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-default border border-emerald-200">
                    <CheckCircle2 className="w-4.5 h-4.5" />
                    Impartida
                  </div>
                ) : (
                  <button
                    onClick={() => handleCheckIn(event.id)}
                    disabled={checkingIn === event.id}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5 shadow-sm"
                  >
                    <CheckSquare className="w-4.5 h-4.5" />
                    {checkingIn === event.id ? "Registrando..." : "Check-in de Clase"}
                  </button>
                )}
                
                {isCheckedIn && (
                  <button
                    onClick={() => handleVoiceNote(event.id)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2.5 rounded-xl cursor-pointer transition-all border border-slate-200 shadow-sm"
                    title="Añadir nota de voz para acta interna"
                  >
                    <Mic className="w-4.5 h-4.5 text-slate-600" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
