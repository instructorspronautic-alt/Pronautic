import { AlertTriangle } from "lucide-react";
import { CalendarEvent } from "../types";

interface ConflictsBannerProps {
  conflicts: Array<{
    eventA: CalendarEvent;
    eventB: CalendarEvent;
    reason: string;
  }>;
}

export default function ConflictsBanner({ conflicts }: ConflictsBannerProps) {
  if (!conflicts || conflicts.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 mx-4 shadow-sm">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
        <div>
          <h3 className="font-bold text-red-800 text-sm">
            ⚠️ {conflicts.length} Conflicto(s) de Recursos Detectado(s)
          </h3>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            {conflicts.map((c, i) => (
              <li key={i} className="text-xs text-red-700">
                <span className="font-semibold">{c.reason}</span>:{" "}
                {c.eventA.summary} <span className="font-bold">vs</span> {c.eventB.summary}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
