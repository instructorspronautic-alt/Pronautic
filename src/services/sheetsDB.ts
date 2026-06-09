import { readSheet, writeSheet } from "./sheets";
import { InstructorProfile, TeacherAvailability } from "../types";

// Helper for caching and saving to localStorage + writing to Sheets
const EVENTS_KEY = "event_allocated_resources";
const INSTRUCTORS_KEY = "staff_database_v1";
const AVAILABILITIES_KEY = "teacher_availabilities";

// --- Event Resources --- //
export async function saveEventResources(
  accessToken: string,
  eventId: string,
  data: Record<string, any>
): Promise<void> {
  // Update local cache
  const localStr = localStorage.getItem(EVENTS_KEY) || "{}";
  const records = JSON.parse(localStr);
  records[eventId] = data;
  localStorage.setItem(EVENTS_KEY, JSON.stringify(records));

  if (accessToken === "mock-token") return;

  // Convert to rows and sync to sheets
  const rows = Object.entries(records).map(([key, val]) => [key, JSON.stringify(val)]);
  await writeSheet(accessToken, "eventos_metadata", rows).catch(e => console.error("Sheet error", e));
}

export async function loadEventResources(
  accessToken: string
): Promise<Record<string, any>> {
  if (accessToken !== "mock-token") {
    try {
      const rows = await readSheet(accessToken, "eventos_metadata");
      const data: Record<string, any> = {};
      rows.forEach(row => {
        if (row.length >= 2) {
          try {
            data[row[0]] = JSON.parse(row[1]);
          } catch (e) {
            // ignore parse error for specific row
          }
        }
      });
      // update local storage if we got data
      if (Object.keys(data).length > 0) {
        localStorage.setItem(EVENTS_KEY, JSON.stringify(data));
      }
      return data;
    } catch (error) {
      console.warn("Fallo cargando de Sheets, usando localStorage", error);
    }
  }
  const saved = localStorage.getItem(EVENTS_KEY) || "{}";
  return JSON.parse(saved);
}

// --- Instructors --- //
export async function saveInstructors(
  accessToken: string,
  instructors: InstructorProfile[]
): Promise<void> {
  localStorage.setItem(INSTRUCTORS_KEY, JSON.stringify(instructors));
  
  if (accessToken === "mock-token") return;

  const rows = instructors.map(inst => [inst.id, JSON.stringify(inst)]);
  await writeSheet(accessToken, "instructores", rows).catch(e => console.error("Sheet error", e));
}

export async function loadInstructors(
  accessToken: string
): Promise<InstructorProfile[]> {
  if (accessToken !== "mock-token") {
    try {
      const rows = await readSheet(accessToken, "instructores");
      const data: InstructorProfile[] = [];
      rows.forEach(row => {
        if (row.length >= 2) {
          try {
            data.push(JSON.parse(row[1]));
          } catch (e) {}
        }
      });
      if (data.length > 0) {
        localStorage.setItem(INSTRUCTORS_KEY, JSON.stringify(data));
        return data;
      }
    } catch (error) {
      console.warn("Fallo cargando instructores de Sheets", error);
    }
  }
  const saved = localStorage.getItem(INSTRUCTORS_KEY) || "[]";
  return JSON.parse(saved);
}

// --- Availabilities --- //
export async function saveAvailabilities(
  accessToken: string,
  availabilities: TeacherAvailability[]
): Promise<void> {
  localStorage.setItem(AVAILABILITIES_KEY, JSON.stringify(availabilities));

  if (accessToken === "mock-token") return;

  // We can use teacherEmail + unique slot as key
  const rows = availabilities.map(av => [`${av.teacherEmail}_${av.startDate}_${av.endDate}`, JSON.stringify(av)]);
  await writeSheet(accessToken, "disponibilidades", rows).catch(e => console.error("Sheet error", e));
}

export async function loadAvailabilities(
  accessToken: string
): Promise<TeacherAvailability[]> {
  if (accessToken !== "mock-token") {
    try {
      const rows = await readSheet(accessToken, "disponibilidades");
      const data: TeacherAvailability[] = [];
      rows.forEach(row => {
        if (row.length >= 2) {
          try {
            data.push(JSON.parse(row[1]));
          } catch(e) {}
        }
      });
      if (data.length > 0) {
        localStorage.setItem(AVAILABILITIES_KEY, JSON.stringify(data));
        return data;
      }
    } catch (error) {
      console.warn("Fallo cargando disponibilidades de Sheets", error);
    }
  }
  const saved = localStorage.getItem(AVAILABILITIES_KEY) || "[]";
  return JSON.parse(saved);
}
