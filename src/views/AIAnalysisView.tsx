import React from "react";
import ScheduleSummary from "../components/ScheduleSummary";
import { Sparkles } from "lucide-react";
import { CalendarEvent } from "../types";

export interface AIAnalysisViewProps {
  analysis: any;
  isLoadingAnalysis: boolean;
  isExporting: boolean;
  exportSuccess: boolean;
  onExportToSheets: () => void;
  viewRange: string;
  events: CalendarEvent[];
  tasks: any[];
  onTriggerAnalysis: (events: CalendarEvent[], tasks: any[]) => void;
}

export default function AIAnalysisView({
  analysis,
  isLoadingAnalysis,
  isExporting,
  exportSuccess,
  onExportToSheets,
  events,
  tasks,
  onTriggerAnalysis,
}: AIAnalysisViewProps) {
  return (
    <div>
      {analysis ? (
        <ScheduleSummary
          analysis={analysis}
          isLoading={isLoadingAnalysis}
          onExportToSheets={onExportToSheets}
          isExporting={isExporting}
          exportSuccess={exportSuccess}
        />
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center py-16 space-y-4">
          <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
          <div>
            <h4 className="text-sm font-bold text-slate-800">
              ¿Listo para compilar hoy?
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              Gemini organizará automáticamente un horario
              integrado para tu calendario y listas de tareas,
              detectando conflictos de forma segura.
            </p>
          </div>
          <button
            onClick={() => onTriggerAnalysis(events, tasks)}
            className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            Analizar jornada con IA
          </button>
        </div>
      )}
    </div>
  );
}
