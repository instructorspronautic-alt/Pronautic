import { useMemo } from "react";
import { motion } from "motion/react";
import { 
  Calendar, 
  CheckSquare, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  PieChart, 
  TrendingUp, 
  Compass, 
  BookmarkCheck,
  Zap,
  Coffee,
  Briefcase
} from "lucide-react";
import { ScheduleAnalysis } from "../types";

interface ScheduleSummaryProps {
  analysis: ScheduleAnalysis;
  isLoading: boolean;
  onExportToSheets?: () => void;
  isExporting?: boolean;
  exportSuccess?: boolean;
}

export default function ScheduleSummary({ 
  analysis, 
  isLoading,
  onExportToSheets,
  isExporting = false,
  exportSuccess = false
}: ScheduleSummaryProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 space-y-4 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="p-3 bg-indigo-50 text-indigo-600 rounded-full dark:bg-indigo-950/40 dark:text-indigo-400"
        >
          <Sparkles className="w-8 h-8" />
        </motion.div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 font-sans">
            Analizando tu día con Inteligencia Artificial...
          </h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Gemini está integrando tus eventos de hoy y tus tareas pendientes para organizar una jornada hiper-productiva.
          </p>
        </div>
      </div>
    );
  }

  const {
    summary,
    focus,
    conflicts,
    tasksSynergy,
    timeDistribution,
    suggestedTimeline,
    motivationalQuote
  } = analysis;

  const groupedTimeline = useMemo(() => {
    const groups: Record<string, { timeSlot: string; activity: string }[]> = {};
    if (!suggestedTimeline) return groups;

    suggestedTimeline.forEach((item) => {
      let groupKey = "Hoy";
      let displayTime = item.timeSlot;

      // Match format: "Day, DD de Month (HH:MM - HH:MM)"
      const parenMatch = item.timeSlot.match(/^(.*?)\s*\((.*?)\)$/);
      if (parenMatch) {
        groupKey = parenMatch[1].trim();
        displayTime = parenMatch[2].trim();
      } else {
        // Match day names at start, e.g. "lun, 18 may - 13:00"
        const hasDatePrefix = item.timeSlot.match(/^([a-zA-ZáéíóúÁÉÍÓÚñÑ.,\s\døº°/]+)(\d{2}:\d{2}\s*[-–]\s*\d{2}:\d{2})/);
        if (hasDatePrefix) {
          groupKey = hasDatePrefix[1].trim().replace(/[-()\s]+$/, "");
          displayTime = hasDatePrefix[2].trim();
        }
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push({
        timeSlot: displayTime,
        activity: item.activity,
      });
    });

    return groups;
  }, [suggestedTimeline]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Fallback / Gemini Rate-limit Reassurance Banner */}
      {analysis.isFallback && (
        <div className="bg-amber-50/80 border border-amber-250/50 rounded-xl p-4 flex items-start gap-3.5 shadow-3xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <h4 className="text-xs font-black text-amber-900 font-sans tracking-tight uppercase">
              Modo Heurístico Activo (Límites de Cuota de Gemini)
            </h4>
            <p className="text-[11px] text-amber-800 leading-relaxed font-sans font-semibold">
              Has superado el límite de peticiones de la tarifa gratuita de Gemini (429 Resource Exhausted). Para mantener tu flujo de trabajo de Pronautic continuo y seguro, el sistema ha activado automáticamente el <strong>motor heurístico local de alta precisión</strong>, diseñando la mejor logística para tus cursos y traspaso de instructores.
            </p>
          </div>
        </div>
      )}

      {/* Google Sheets Export Bar */}
      {onExportToSheets && (
        <div className="bg-emerald-50/75 border border-emerald-250/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-3xs">
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shadow-4xs shrink-0 flex items-center justify-center">
              <span className="text-base leading-none">📊</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 font-sans tracking-tight leading-none mb-1">
                Sincronizar Análisis con Google Sheets
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Exportar o actualizar este cronograma directamente en la hoja escolar de Pronautic.
              </p>
            </div>
          </div>
          <div>
            <button
              onClick={onExportToSheets}
              disabled={isExporting}
              className={`w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-2xs hover:shadow-1xs cursor-pointer ${
                exportSuccess
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {isExporting ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full shrink-0"
                  />
                  Sincronizando...
                </>
              ) : exportSuccess ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5 shrink-0" />
                  ¡Sincronizado con Éxito!
                </>
              ) : (
                <>
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                  Sincronizar con Google Sheets
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Motivational & Focus banner - High Density styled */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 relative overflow-hidden shadow-2xs">
        <div className="relative space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 rounded-full border border-indigo-100 text-indigo-700 text-[10px] font-bold tracking-wider uppercase font-mono">
            <Zap className="w-3" />
            Tema de hoy: {focus}
          </div>
          <p className="text-base font-semibold text-slate-900 leading-tight">
            "{motivationalQuote}"
          </p>
          <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
            {summary}
          </p>
        </div>
      </div>

      {/* Grid: Stats and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Time Allocation panel */}
        <div className="bg-white p-5 rounded-lg border border-slate-205 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
                <PieChart className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Distribución del Tiempo
              </h4>
            </div>
            
            <p className="text-[11px] text-slate-500 mb-4 font-sans leading-relaxed">
              Análisis porcentual sugerido para equilibrar tu jornada inteligente.
            </p>

            <div className="space-y-3.5">
              {/* Meetings */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Eventos y Reuniones
                  </span>
                  <span className="text-slate-900 font-mono text-[11px] font-bold">
                    {timeDistribution.meetings}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-505 transition-all duration-500" 
                    style={{ width: `${timeDistribution.meetings}%` }}
                  />
                </div>
              </div>

              {/* Tasks Work */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Trabajo en Tareas
                  </span>
                  <span className="text-slate-900 font-mono text-[11px] font-bold">
                    {timeDistribution.taskWork}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-505 transition-all duration-500" 
                    style={{ width: `${timeDistribution.taskWork}%` }}
                  />
                </div>
              </div>

              {/* Breaks */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Pausas y Desarrollo
                  </span>
                  <span className="text-slate-900 font-mono text-[11px] font-bold">
                    {timeDistribution.breaks}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-505 transition-all duration-500" 
                    style={{ width: `${timeDistribution.breaks}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center gap-2 text-[11px] text-indigo-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Fricción horaria mitigada automáticamente</span>
          </div>
        </div>

        {/* Actionable Synergies panel */}
        <div className="bg-white p-5 rounded-lg border border-slate-205 lg:col-span-2 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Sinergia de Tareas y Eventos
              </h4>
            </div>

            <p className="text-[11px] text-slate-500 mb-3.5 font-sans leading-relaxed">
              Heurística inteligente para agrupar tus compromisos del calendario con tus tareas pendientes.
            </p>

            <div className="space-y-2.5">
              {tasksSynergy.length > 0 ? (
                tasksSynergy.map((synergy, idx) => (
                  <div 
                    key={idx} 
                    className="p-3 bg-emerald-50 border-l-4 border-emerald-500 rounded-r flex items-start gap-2.5"
                  >
                    <BookmarkCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-750 font-sans leading-relaxed">
                      {synergy}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                  Sincroniza tus pendientes para generar sinergias.
                </div>
              )}
            </div>
          </div>

          {/* Conflict Warning banner */}
          {conflicts.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-800">
                  Puntos de atención detectados ({conflicts.length})
                </p>
                <div className="space-y-1">
                  {conflicts.map((conflict, idx) => (
                    <p key={idx} className="text-[11px] text-amber-700 leading-relaxed font-sans">
                      • {conflict}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggested timeline of the day */}
      <div className="bg-white p-5 rounded-lg border border-slate-205 shadow-2xs">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Cronograma Recomendado por la IA
            </h4>
            <p className="text-[11px] text-slate-400 font-semibold font-sans">
              Flujo horario balanceado diseñado para optimizar tu foco hoy.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {Object.entries(groupedTimeline).length > 0 ? (
            (Object.entries(groupedTimeline) as [string, { timeSlot: string; activity: string }[]][]).map(([groupName, items]) => (
              <div key={groupName} className="space-y-4">
                {/* Day Header */}
                <div className="flex items-center gap-2 bg-slate-100/70 border border-slate-200/50 px-3.5 py-1.5 rounded-lg w-fit">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-750 font-sans tracking-tight capitalize select-none">
                    {groupName}
                  </span>
                </div>

                <div className="relative border-l border-slate-200 ml-4 pl-6 space-y-4">
                  {items.map((item, idx) => {
                    let iconElement = <Clock className="w-3.5 h-3.5" />;
                    let isBreak = item.activity.toLowerCase().includes("pausa") || item.activity.toLowerCase().includes("descanso") || item.activity.toLowerCase().includes("break") || item.activity.toLowerCase().includes("café");
                    let isMeeting = item.activity.toLowerCase().includes("reunión") || item.activity.toLowerCase().includes("llamada") || item.activity.toLowerCase().includes("meeting") || item.activity.toLowerCase().includes("conferencia");
                    
                    let colorClass = "bg-indigo-50 border-indigo-200 text-indigo-600";
                    if (isBreak) {
                      iconElement = <Coffee className="w-3.5 h-3.5" />;
                      colorClass = "bg-amber-50 border-amber-200 text-amber-600";
                    } else if (isMeeting) {
                      iconElement = <Briefcase className="w-3.5 h-3.5" />;
                      colorClass = "bg-blue-50 border-blue-200 text-blue-600";
                    } else if (idx === 0) {
                      iconElement = <Sparkles className="w-3.5 h-3.5" />;
                      colorClass = "bg-purple-50 border-purple-200 text-purple-600";
                    }

                    return (
                      <div key={idx} className="relative">
                        {/* Timeline node icon */}
                        <span className={`absolute -left-[35px] top-0.5 p-1 rounded-full border ${colorClass} shadow-3xs`}>
                          {iconElement}
                        </span>

                        <div className="space-y-0.5">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600">
                            {item.timeSlot}
                          </span>
                          <p className="text-xs font-bold text-slate-900 leading-snug">
                            {item.activity}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">No hay actividades recomendadas para este período.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
