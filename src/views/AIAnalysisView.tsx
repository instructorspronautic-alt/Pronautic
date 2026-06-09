import React from "react";
import ScheduleSummary from "../components/ScheduleSummary";
import { Sparkles } from "lucide-react";

export default function AIAnalysisView({
  analysis,
  isLoadingAnalysis,
  isExporting,
  exportSuccess,
  onExportToSheets,
}: any) {
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
              recomendado basándose en las tareas operativas y los cursos programados.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
