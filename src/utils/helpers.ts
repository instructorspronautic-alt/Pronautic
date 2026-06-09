import { CalendarEvent } from "../types";

export function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]*>?/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getEventTimes(e: CalendarEvent) {
  const startStr = e.start?.dateTime || e.start?.date;
  const endStr = e.end?.dateTime || e.end?.date;
  if (!startStr) return null;
  const startTime = new Date(startStr).getTime();
  let endTime = endStr ? new Date(endStr).getTime() : startTime + 3600000;
  if (endTime <= startTime) endTime = startTime + 3600000;
  return { startTime, endTime };
}

export function getEventInstructor(event: CalendarEvent): string | null {
  if (event.description) {
    const match = event.description.match(
      /(?:Instructor|Profesor|Docente|Ponente|Profe|Instructora|Profesora|Docentes):\s*([^\n\r<]+)/i
    );
    if (match?.[1]) return match[1].trim();
  }
  return null;
}

export function formatTime(isoString?: string): string {
  if (!isoString) return "";
  try {
    return new Date(isoString).toLocaleTimeString("es-ES", {
      hour: "2-digit", minute: "2-digit"
    });
  } catch { return ""; }
}
