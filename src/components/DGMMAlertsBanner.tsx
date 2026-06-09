import { Clock } from "lucide-react";
import { CalendarEvent } from "../types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DGMMAlertsBannerProps {
  alerts: CalendarEvent[];
}

export default function DGMMAlertsBanner({ alerts }: DGMMAlertsBannerProps) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4 mx-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Clock className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-orange-800 text-sm mb-2">
            ⏰ {alerts.length} Curso(s) sin comunicar a DGMM en los próximos 15 días
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
             {alerts.map((e, idx) => {
               const now = new Date();
               const startD = new Date(e.start?.dateTime || e.start?.date || "");
               const diffTime = startD.getTime() - now.getTime();
               const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
               
               return (
                 <div key={idx} className="bg-white/60 rounded border border-orange-100 p-2 text-xs">
                   <div className="font-semibold text-orange-900 truncate" title={e.summary || "Curso"}>
                     {e.summary || "Curso sin nombrar"}
                   </div>
                   <div className="text-orange-700 flex items-center justify-between mt-1">
                     <span>{format(startD, "dd MMM", { locale: es })}</span>
                     <span className="font-bold bg-orange-100 px-1.5 py-0.5 rounded">{diffDays} días restantes</span>
                   </div>
                 </div>
               )
             })}
          </div>
        </div>
      </div>
    </div>
  );
}
