import React from "react";
import { BookOpen } from "lucide-react";
import { User, Search, AlertTriangle, Shield, CalendarDays, Check, Settings, FileText, CheckCircle2, Ticket, PackageOpen, Download, Filter, Eye, AlertCircle, Phone, Calendar, Clock, Lock, Ship, ArrowRight, Play, Edit3, Trash2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function SidebarView(props: any) {
  const { viewProps } = props;
  const { progressPercent, completedTasksCount, totalTasksCount, calendars, selectedCalIds, setSelectedCalIds, handleSync, isLoadingData, syncFrequency, setSyncFrequency, lastSyncTime, setLastSyncTime, tasksTabMode, setTasksTabMode, PRONAUTIC_COURSES_CATALOG, selectedCourseIdForTasks, setSelectedCourseIdForTasks, handleNavigate, taskLists, displayCourses, userRole, activeTab, toggleTab, eventResources, setActiveTab } = viewProps;

  // Additional props required that are locally used in Sidebar:
  // we assume we can just destructure them straight from viewProps which has Everything
  const { mergedEvents, availabilities, handleDeleteAvailability, setIsAdminModalOpen, globalConflicts, tasks, displayEvents, formatTime, displayTasks, analysis, editingAvailId, setEditingAvailId, newAvailStart, setNewAvailStart, newAvailEnd, setNewAvailEnd, newAvailNotes, setNewAvailNotes, handleAddAvailability, teacherEmails, teacherEmailFilter, setTeacherEmailFilter, customTeacherEmail, setCustomTeacherEmail, teacherQualifications, setTeacherQualifications, userName, user, isCurrentUserAdmin, setUserRole } = viewProps;

  return (
    <aside className="w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-5 flex flex-col gap-6 shrink-0 shadow-xs overflow-y-auto">
              {/* Progression Metric */}
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Progreso General
                </h3>
                <div className="w-full bg-slate-150 h-2 rounded-full mb-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[11px] font-semibold text-slate-600 leading-tight">
                  {completedTasksCount} de {totalTasksCount} tareas completadas
                  ({progressPercent}%)
                </p>
              </div>

              {/* Sincronización de Calendarios - Pronautic */}
              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
                  Sincronización (Calendarios)
                </h3>

                {calendars.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic">
                    No hay más calendarios o cargando...
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        id="btn-select-all-calendars"
                        onClick={() => {
                          setSelectedCalIds(calendars.map((c) => c.id));
                        }}
                        className="text-[9.5px] font-black uppercase text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200/60 px-2 py-1 rounded-md transition-all cursor-pointer shadow-4xs text-center flex-1"
                      >
                        ✓ Seleccionar Todos
                      </button>
                      <button
                        type="button"
                        id="btn-select-primary-calendar"
                        onClick={() => {
                          const primary =
                            calendars.find((c) => c.primary) || calendars[0];
                          if (primary) {
                            setSelectedCalIds([primary.id]);
                          }
                        }}
                        className="text-[9.5px] font-black uppercase text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 px-2 py-1 rounded-md transition-all cursor-pointer shadow-4xs text-center flex-1"
                      >
                        Solo Principal
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 pt-0.5">
                      {calendars.map((cal) => {
                        const isSelected = selectedCalIds.includes(cal.id);
                        return (
                          <label
                            key={cal.id}
                            className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-800 cursor-pointer select-none truncate"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                setSelectedCalIds((prev) => {
                                  if (isSelected) {
                                    if (prev.length <= 1) return prev; // Keep at least one selected
                                    return prev.filter((id) => id !== cal.id);
                                  } else {
                                    return [...prev, cal.id];
                                  }
                                });
                              }}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{
                                backgroundColor:
                                  cal.backgroundColor || "#4f46e5",
                              }}
                            />
                            <span
                              className="truncate font-semibold text-slate-700"
                              title={cal.summary}
                            >
                              {cal.primary
                                ? "Principal (Pronautic)"
                                : cal.summary}
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    {/* Pronautic Ideal Conditions Indicator Badge of Coverage */}
                    <div
                      className={`p-2.5 rounded-xl border text-[10.5px] leading-snug transition-all ${
                        calendars.length > 0 &&
                        selectedCalIds.length === calendars.length
                          ? "bg-emerald-50/70 text-emerald-800 border-emerald-200/65"
                          : "bg-amber-50/70 text-amber-800 border-amber-200/65"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5 font-bold">
                        <span className="flex items-center gap-1 font-extrabold uppercase text-[9.5px]">
                          {calendars.length > 0 &&
                          selectedCalIds.length === calendars.length
                            ? "🌟 Condición Ideal"
                            : "⚠️ Condición Parcial"}
                        </span>
                        {selectedCalIds.length < calendars.length && (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedCalIds(calendars.map((c) => c.id))
                            }
                            className="text-[9px] font-black uppercase text-amber-700 cursor-pointer underline hover:text-amber-900 bg-transparent border-0"
                          >
                            Hacer Ideal
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight select-none font-medium">
                        {calendars.length > 0 &&
                        selectedCalIds.length === calendars.length
                          ? "Todos los calendarios están seleccionados. Óptima auditoría de solapamientos."
                          : `${selectedCalIds.length} de ${calendars.length} calendarios activos. Puede haber colisiones no dectectadas.`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Control de Acceso (Perfiles Simulados / Integración Segura) */}
              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-500" />
                  Control de Acceso (Rol)
                </h3>

                {user === null || isCurrentUserAdmin ? (
                  <>
                    <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-100 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setUserRole("admin")}
                        className={`py-1 text-[11px] font-extrabold rounded-md transition-all cursor-pointer ${
                          userRole === "admin"
                            ? "bg-white text-indigo-600 shadow-2xs"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Admin
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUserRole("teacher");
                          if (teacherEmails.length > 0 && !teacherEmailFilter) {
                            setTeacherEmailFilter(teacherEmails[0]);
                          } else if (
                            teacherEmails.length === 0 &&
                            !teacherEmailFilter
                          ) {
                            setTeacherEmailFilter("custom");
                          }
                        }}
                        className={`py-1 text-[11px] font-extrabold rounded-md transition-all cursor-pointer ${
                          userRole === "teacher"
                            ? "bg-white text-indigo-600 shadow-2xs"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Profesor
                      </button>
                    </div>

                    {userRole === "teacher" && (
                      <div className="mt-2.5 space-y-3 p-2.5 bg-indigo-50/45 rounded-lg border border-indigo-100/50">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-tight">
                            Seleccionar Profesor
                          </label>
                          <select
                            value={teacherEmailFilter}
                            onChange={(e) =>
                              setTeacherEmailFilter(e.target.value)
                            }
                            className="w-full bg-white border border-slate-205 rounded p-1 text-[11px] font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                          >
                            {teacherEmails.map((email) => (
                              <option key={email} value={email}>
                                {email}
                              </option>
                            ))}
                            <option value="custom">
                              -- Escribir otro email --
                            </option>
                          </select>
                        </div>

                        {teacherEmailFilter === "custom" && (
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-tight">
                              Email del Profesor
                            </label>
                            <input
                              type="email"
                              placeholder="profesor@ejemplo.com"
                              value={customTeacherEmail}
                              onChange={(e) =>
                                setCustomTeacherEmail(e.target.value)
                              }
                              className="w-full bg-white border border-slate-205 rounded p-1.5 text-[11px] font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            />
                          </div>
                        )}
                        <p className="text-[9.5px] text-indigo-705 leading-tight font-extrabold flex items-center gap-1">
                          <Check className="w-3 h-3 text-indigo-600 shrink-0" />
                          Vista segregada del docente activa.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  /* Vista inmutable para usuarios Profesor que no son Administradores de la escuela */
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-400 uppercase tracking-widest text-[9px] font-mono">
                        Rol Asignado
                      </span>
                      <span className="bg-indigo-50 text-indigo-700 font-extrabold uppercase tracking-tight px-2 py-0.5 rounded border border-indigo-200/50 text-[9.5px]">
                        Profesor Docente
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-800 leading-tight">
                        {userName}
                      </p>
                      <p
                        className="text-[10px] text-slate-500 font-mono tracking-tight leading-none truncate"
                        title={user?.email || ""}
                      >
                        {user?.email}
                      </p>
                    </div>
                    <p className="text-[9.5px] text-slate-500 leading-relaxed italic bg-indigo-50/25 p-2 rounded border border-indigo-100/35">
                      Como docente oficial de Pronautic, tu acceso está
                      restringido de forma segura a tus cursos asignados y
                      convocatorias individuales. Solo verás las actividades del
                      calendario donde eres invitado.
                    </p>
                  </div>
                )}

                {userRole === "teacher" && (
                  <div className="space-y-3.5 mt-2.5">
                    {/* Habilitaciones de Cursos */}
                    <div className="pt-2.5 border-t border-indigo-100/60 space-y-2">
                      <p className="text-[9.5px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        Habilitaciones Docentes
                      </p>
                      <p className="text-[9px] text-slate-400 font-medium leading-none">
                        Marca todos los cursos que puedes impartir:
                      </p>

                      <div className="space-y-1 bg-white/70 p-2 rounded border border-indigo-100/70 max-h-48 overflow-y-auto shadow-4xs">
                        {PRONAUTIC_COURSES_CATALOG.map((course) => {
                          const activeEmail = (
                            teacherEmailFilter === "custom"
                              ? customTeacherEmail
                              : teacherEmailFilter
                          ).toLowerCase();
                          const qualifiedList =
                            teacherQualifications[activeEmail] || [];
                          const isChecked = qualifiedList.includes(course.id);

                          return (
                            <label
                              key={course.id}
                              className={`flex items-start gap-2 p-1.5 hover:bg-indigo-50/50 rounded-md cursor-pointer select-none text-[10px] text-slate-700 font-semibold border transition-all ${
                                isChecked
                                  ? "bg-emerald-50/50 border-emerald-100 text-emerald-950"
                                  : "bg-transparent border-transparent"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setTeacherQualifications((prev) => {
                                    const currentList = prev[activeEmail] || [];
                                    const newList = isChecked
                                      ? currentList.filter(
                                          (id) => id !== course.id,
                                        )
                                      : [...currentList, course.id];
                                    return {
                                      ...prev,
                                      [activeEmail]: newList,
                                    };
                                  });
                                }}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0 w-3 h-3 cursor-pointer mt-0.5"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="truncate leading-tight font-black text-slate-800">
                                  {course.name}
                                </p>
                                <span className="text-[8px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded border border-indigo-100">
                                  {course.code}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Registro de Disponibilidad Interactivo */}
                    <div className="pt-2.5 border-t border-indigo-100/60 space-y-2">
                      <p className="text-[9.5px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        {editingAvailId
                          ? "Modificar Disponibilidad"
                          : "Declarar Disponibilidad"}
                      </p>

                      <div
                        className={`space-y-2 p-2.5 rounded-lg border transition-all text-[10.5px] ${
                          editingAvailId
                            ? "bg-sky-50/50 border-sky-200 shadow-3xs"
                            : "bg-white/70 border-indigo-100 shadow-4xs"
                        }`}
                      >
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="space-y-0.5">
                            <label className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">
                              Desde
                            </label>
                            <input
                              type="date"
                              value={newAvailStart}
                              onChange={(e) => setNewAvailStart(e.target.value)}
                              className="w-full bg-white border border-slate-205 rounded px-1.5 py-0.5 text-[11px] font-semibold cursor-pointer"
                            />
                          </div>
                          <div className="space-y-0.5">
                            <label className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">
                              Hasta
                            </label>
                            <input
                              type="date"
                              value={newAvailEnd}
                              onChange={(e) => setNewAvailEnd(e.target.value)}
                              className="w-full bg-white border border-slate-205 rounded px-1.5 py-0.5 text-[11px] font-semibold cursor-pointer"
                            />
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <label className="text-[8px] font-bold text-slate-400 uppercase tracking-tight block">
                            Detalles/Notas
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. Disponible tardes, todo el día..."
                            value={newAvailNotes}
                            onChange={(e) => setNewAvailNotes(e.target.value)}
                            className="w-full bg-white border border-slate-205 rounded px-2 py-0.5 text-[11px] font-semibold text-slate-705 placeholder:text-slate-300"
                          />
                        </div>

                        {editingAvailId ? (
                          <div className="flex gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (!newAvailStart || !newAvailEnd) {
                                  alert("Por favor selecciona ambas fechas.");
                                  return;
                                }
                                const activeEmail =
                                  teacherEmailFilter === "custom"
                                    ? customTeacherEmail
                                    : teacherEmailFilter;
                                handleAddAvailability({
                                  teacherEmail: activeEmail,
                                  startDate: newAvailStart,
                                  endDate: newAvailEnd,
                                  notes: newAvailNotes,
                                });
                                setNewAvailStart("");
                                setNewAvailEnd("");
                                setNewAvailNotes("Disponible todo el día");
                              }}
                              className="flex-1 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded font-extrabold text-[10.5px] cursor-pointer transition-all text-center shadow-4xs"
                            >
                              Actualizar Período
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAvailId(null);
                                setNewAvailStart("");
                                setNewAvailEnd("");
                                setNewAvailNotes("Disponible todo el día");
                              }}
                              className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-bold text-[10.5px] cursor-pointer transition-all"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (!newAvailStart || !newAvailEnd) {
                                alert(
                                  "Por favor selecciona ambas fechas de inicio y fin para registrar tu disponibilidad.",
                                );
                                return;
                              }
                              const activeEmail =
                                teacherEmailFilter === "custom"
                                  ? customTeacherEmail
                                  : teacherEmailFilter;
                              if (!activeEmail) {
                                alert(
                                  "Por favor selecciona o especifica un correo electrónico de profesor.",
                                );
                                return;
                              }
                              handleAddAvailability({
                                teacherEmail: activeEmail,
                                startDate: newAvailStart,
                                endDate: newAvailEnd,
                                notes: newAvailNotes,
                              });
                              setNewAvailStart("");
                              setNewAvailEnd("");
                              setNewAvailNotes("Disponible todo el día");
                            }}
                            className="w-full mt-1.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-extrabold text-[10.5px] cursor-pointer transition-all active:scale-95 text-center shadow-4xs shrink-0"
                          >
                            Añadir Período
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Listado de Disponibilidades Declaradas por este profesor */}
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-mono font-bold text-slate-450 uppercase tracking-wider block">
                        Períodos Declarados por Ti
                      </p>
                      {(() => {
                        const activeEmail = (
                          teacherEmailFilter === "custom"
                            ? customTeacherEmail
                            : teacherEmailFilter
                        ).toLowerCase();
                        const teacherAvails = availabilities.filter(
                          (a) => a.teacherEmail.toLowerCase() === activeEmail,
                        );
                        if (teacherAvails.length === 0) {
                          return (
                            <div className="p-2.5 text-center border border-dashed border-slate-200 bg-white/40 rounded-lg text-[10px] text-slate-400 italic font-semibold">
                              Sin períodos de disponibilidad declarados aún.
                            </div>
                          );
                        }
                        return (
                          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                            {teacherAvails.map((avail) => (
                              <div
                                key={avail.id}
                                className={`p-1.5 border rounded-md flex items-center justify-between text-[10px] font-semibold shadow-4xs transition-all ${
                                  editingAvailId === avail.id
                                    ? "bg-sky-50 border-sky-300 text-sky-900 ring-2 ring-sky-100"
                                    : "bg-emerald-50 border-emerald-200/50 text-emerald-900"
                                }`}
                              >
                                <div className="min-w-0 flex-1 mr-1">
                                  <p className="font-bold shrink-0 truncate">
                                    {new Date(
                                      avail.startDate,
                                    ).toLocaleDateString("es-ES", {
                                      day: "numeric",
                                      month: "short",
                                    })}{" "}
                                    al{" "}
                                    {new Date(avail.endDate).toLocaleDateString(
                                      "es-ES",
                                      { day: "numeric", month: "short" },
                                    )}
                                  </p>
                                  {avail.notes && (
                                    <p className="text-[9px] text-slate-600 italic truncate max-w-[120px]">
                                      "{avail.notes}"
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingAvailId(avail.id);
                                      setNewAvailStart(avail.startDate);
                                      setNewAvailEnd(avail.endDate);
                                      setNewAvailNotes(avail.notes || "");
                                    }}
                                    className="text-indigo-600 hover:text-indigo-800 p-0.5 cursor-pointer text-[10.5px]"
                                    title="Editar este período"
                                  >
                                    📝
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteAvailability(avail.id)
                                    }
                                    className="text-red-500 hover:text-red-700 leading-none text-xs p-0.5 cursor-pointer font-bold"
                                    title="Eliminar este período"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Consolidated Availability Console (Admin view) */}
              {userRole === "admin" && (
                <div className="pt-2.5 border-t border-slate-100 space-y-2">
                  <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
                    Disponibilidades Docentes ({availabilities.length})
                  </h3>
                  {availabilities.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic bg-slate-55 border border-slate-150 p-2.5 rounded-lg text-center font-bold">
                      No hay disponibilidades registradas por los profesores.
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {availabilities.map((avail) => (
                        <div
                          key={avail.id}
                          className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10.5px] leading-tight space-y-0.5"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className="font-bold text-slate-700 truncate max-w-[130px] font-mono"
                              title={avail.teacherEmail}
                            >
                              {avail.teacherEmail}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteAvailability(avail.id)}
                              className="text-slate-400 hover:text-red-500 leading-none font-bold text-xs p-0.5 cursor-pointer"
                              title="Eliminar disponibilidad registrada"
                            >
                              ×
                            </button>
                          </div>
                          <p className="font-semibold text-indigo-900">
                            Del{" "}
                            {new Date(avail.startDate).toLocaleDateString(
                              "es-ES",
                              { day: "numeric", month: "short" },
                            )}{" "}
                            al{" "}
                            {new Date(avail.endDate).toLocaleDateString(
                              "es-ES",
                              { day: "numeric", month: "short" },
                            )}
                          </p>
                          {avail.notes && (
                            <p className="text-[9.5px] text-slate-505 italic mt-0.5">
                              "{avail.notes}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Gestión de Recursos - Pronautic Admin View */}
              {userRole === "admin" && (
                <div className="pt-2.5 border-t border-slate-100 space-y-2">
                  <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5 text-indigo-505 shrink-0 animate-spin-slow" />
                    Gabinete de Espacios y Flotas
                  </h3>
                  <button
                    type="button"
                    id="btn-admin-config"
                    onClick={() => setIsAdminModalOpen(true)}
                    className="w-full py-2 px-3 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-white rounded-lg text-[10.5px] font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Ship className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    Configurar Aulas / Flotas
                  </button>
                </div>
              )}

              {/* Alertas de Conflicto Globales (Admin) */}
              {userRole === "admin" && globalConflicts.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <h3 className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-1.5 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    Conflictos ({globalConflicts.length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {globalConflicts.map((conf, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-red-50 rounded border border-red-100 text-[10px] font-semibold text-red-700 leading-tight"
                      >
                        <p className="font-extrabold line-clamp-1">
                          {conf.eventA.summary} vs {conf.eventB.summary}
                        </p>
                        <p className="text-[9.5px] font-medium text-slate-600 mt-0.5">
                          {conf.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Priorities */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Próximas Prioridades
                </h3>
                <div className="space-y-3">
                  {/* Due / Pending task */}
                  {tasks
                    .filter((t) => t.status === "needsAction")
                    .slice(0, 1)
                    .map((task) => (
                      <div
                        key={task.id}
                        className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r shadow-2xs"
                      >
                        <p className="text-[10px] font-bold text-red-700 uppercase tracking-tight">
                          Crítico
                        </p>
                        <p className="text-xs font-bold text-slate-800 leading-tight mt-0.5 truncate">
                          {task.title}
                        </p>
                        {task.due && (
                          <p className="text-[9px] text-red-500 font-mono mt-1">
                            Vence:{" "}
                            {new Date(task.due).toLocaleDateString("es-ES")}
                          </p>
                        )}
                      </div>
                    ))}

                  {/* Calendar Priority */}
                  {displayEvents.slice(0, 1).map((event) => (
                    <div
                      key={event.id}
                      className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r shadow-2xs"
                    >
                      <p className="text-[10px] font-bold text-blue-700 uppercase tracking-tight">
                        Trabajo
                      </p>
                      <p className="text-xs font-bold text-slate-800 leading-tight mt-0.5 truncate">
                        {event.summary}
                      </p>
                      <p className="text-[9px] text-blue-500 font-mono mt-1">
                        {event.start?.dateTime
                          ? formatTime(event.start.dateTime)
                          : "Todo el día"}
                      </p>
                    </div>
                  ))}

                  {/* Second calendar or secondary event */}
                  {displayEvents.length > 1 &&
                    displayEvents.slice(1, 2).map((event) => (
                      <div
                        key={event.id}
                        className="p-3 bg-purple-50 border-l-4 border-purple-500 rounded-r shadow-2xs"
                      >
                        <p className="text-[10px] font-bold text-purple-700 uppercase tracking-tight">
                          Siguiente
                        </p>
                        <p className="text-xs font-bold text-slate-800 leading-tight mt-0.5 truncate">
                          {event.summary}
                        </p>
                        <p className="text-[9px] text-purple-500 font-mono mt-1">
                          {event.start?.dateTime
                            ? formatTime(event.start.dateTime)
                            : "Todo el día"}
                        </p>
                      </div>
                    ))}

                  {/* Default when empty */}
                  {displayTasks.filter((t) => t.status === "needsAction")
                    .length === 0 &&
                    displayEvents.length === 0 && (
                      <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded-r shadow-2xs text-center py-4">
                        <p className="text-xs font-bold text-green-700">
                          ¡Día Organizado!
                        </p>
                        <p className="text-[10px] text-green-600 mt-1">
                          Sin compromisos inmediatos hoy.
                        </p>
                      </div>
                    )}
                </div>
              </div>

              {/* Motivational / AI Tip slot */}
              <div className="mt-auto pt-4 border-t border-slate-100">
                <div className="bg-slate-900 rounded-xl p-4 text-white shadow-sm">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Recomendación Heurística
                  </p>
                  <p className="text-xs italic leading-relaxed opacity-90">
                    "
                    {analysis?.motivationalQuote ||
                      "El tiempo es lo único que no vuelve. Úsalo con intención."}
                    "
                  </p>
                </div>
              </div>
            </aside>
  );
}
