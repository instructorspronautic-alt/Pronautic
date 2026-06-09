import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { CalendarEvent } from "../types";

interface ConflictsBannerProps {
  conflicts: Array<{
    eventA: CalendarEvent;
    eventB: CalendarEvent;
    reason: string;
  }>;
}

export default function ConflictsBanner({ conflicts }: ConflictsBannerProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!conflicts || conflicts.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 mx-4 shadow-sm">
      <div className="flex items-start gap-3 w-full">
        <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-red-800 text-sm">
              ⚠️ {conflicts.length} Conflicto(s) de Recursos Detectado(s)
            </h3>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs text-red-800 hover:text-red-900 focus:outline-none bg-red-100 hover:bg-red-200 px-2 py-1 rounded"
            >
              {isExpanded ? (
                <>
                  Ocultar <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  Ver detalle <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
          {isExpanded && (
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {conflicts.map((c, i) => (
                <li key={i} className="text-xs text-red-700">
                  <span className="font-semibold">{c.reason}</span>:{" "}
                  {c.eventA.summary} <span className="font-bold">vs</span> {c.eventB.summary}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
