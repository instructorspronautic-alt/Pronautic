import { useState } from "react";
import { 
  X, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  Ship, 
  MapPin, 
  Anchor, 
  RotateCcw,
  Sparkles,
  Info
} from "lucide-react";
import { motion } from "motion/react";

interface AdminResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  aulas: string[];
  onUpdateAulas: (aulas: string[]) => void;
  embarcaciones: string[];
  onUpdateEmbarcaciones: (embarcaciones: string[]) => void;
}

const DEFAULT_AULAS = [
  "Aula Teórica del Puerto",
  "Aula de Simulación Práctica",
  "Aula Náutica B",
  "Simulador de Radio GMDSS"
];

const DEFAULT_EMBARCACIONES = [
  "Velero Escuela 'Capitán Pronautic'",
  "Lancha Motora 'MiniPronautic'",
  "Yate de Prácticas 'Alborán'",
  "Semirrígida de Apoyo 'Pronautic Dos'"
];

export default function AdminResourcesModal({
  isOpen,
  onClose,
  aulas,
  onUpdateAulas,
  embarcaciones,
  onUpdateEmbarcaciones
}: AdminResourcesModalProps) {
  const [activeTab, setActiveTab] = useState<"aulas" | "embarcaciones">("aulas");
  
  // New Item inputs
  const [newAula, setNewAula] = useState("");
  const [newEmbarcacion, setNewEmbarcacion] = useState("");

  // Edit Indexes
  const [editingAulaIndex, setEditingAulaIndex] = useState<number | null>(null);
  const [editingAulaValue, setEditingAulaValue] = useState("");

  const [editingEmbarcacionIndex, setEditingEmbarcacionIndex] = useState<number | null>(null);
  const [editingEmbarcacionValue, setEditingEmbarcacionValue] = useState("");

  // Feedback notifications
  const [feedbackMsg, setFeedbackMsg] = useState("");

  if (!isOpen) return null;

  const handleShowFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(""), 3500);
  };

  // ----- Aulas Handlers -----
  const handleAddAula = () => {
    const trimmed = newAula.trim();
    if (!trimmed) return;
    if (aulas.some(a => a.toLowerCase() === trimmed.toLowerCase())) {
      handleShowFeedback("Error: Ya existe un espacio con ese nombre.");
      return;
    }
    onUpdateAulas([...aulas, trimmed]);
    setNewAula("");
    handleShowFeedback("Espacio añadido correctamente.");
  };

  const handleStartEditAula = (idx: number, val: string) => {
    setEditingAulaIndex(idx);
    setEditingAulaValue(val);
  };

  const handleSaveEditAula = (idx: number) => {
    const trimmed = editingAulaValue.trim();
    if (!trimmed) return;
    if (aulas.some((a, i) => i !== idx && a.toLowerCase() === trimmed.toLowerCase())) {
      handleShowFeedback("Error: Nombre duplicado.");
      return;
    }
    const updated = [...aulas];
    updated[idx] = trimmed;
    onUpdateAulas(updated);
    setEditingAulaIndex(null);
    handleShowFeedback("Espacio modificado.");
  };

  const handleDeleteAula = (idx: number) => {
    onUpdateAulas(aulas.filter((_, i) => i !== idx));
    handleShowFeedback("Espacio eliminado.");
  };

  // ----- Embarcaciones Handlers -----
  const handleAddEmbarcacion = () => {
    const trimmed = newEmbarcacion.trim();
    if (!trimmed) return;
    if (embarcaciones.some(e => e.toLowerCase() === trimmed.toLowerCase())) {
      handleShowFeedback("Error: Ya existe una embarcación con ese nombre.");
      return;
    }
    onUpdateEmbarcaciones([...embarcaciones, trimmed]);
    setNewEmbarcacion("");
    handleShowFeedback("Embarcación añadida correctamente.");
  };

  const handleStartEditEmbarcacion = (idx: number, val: string) => {
    setEditingEmbarcacionIndex(idx);
    setEditingEmbarcacionValue(val);
  };

  const handleSaveEditEmbarcacion = (idx: number) => {
    const trimmed = editingEmbarcacionValue.trim();
    if (!trimmed) return;
    if (embarcaciones.some((e, i) => i !== idx && e.toLowerCase() === trimmed.toLowerCase())) {
      handleShowFeedback("Error: Nombre de embarcación duplicado.");
      return;
    }
    const updated = [...embarcaciones];
    updated[idx] = trimmed;
    onUpdateEmbarcaciones(updated);
    setEditingEmbarcacionIndex(null);
    handleShowFeedback("Embarcación modificada.");
  };

  const handleDeleteEmbarcacion = (idx: number) => {
    onUpdateEmbarcaciones(embarcaciones.filter((_, i) => i !== idx));
    handleShowFeedback("Embarcación eliminada.");
  };

  // ----- Reset Values -----
  const handleRestoreDefaults = () => {
    onUpdateAulas(DEFAULT_AULAS);
    onUpdateEmbarcaciones(DEFAULT_EMBARCACIONES);
    handleShowFeedback("Cargados valores estándar Pronautic.");
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-slate-800"
      id="admin-resources-modal-backdrop"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        id="admin-resources-modal-card"
      >
        {/* Header de la consola */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-lg text-slate-950 flex items-center justify-center shadow-md shadow-sky-500/10">
              <Ship className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-100 flex items-center gap-1.5 leading-tight">
                Gabinete Administrativo de Recursos
              </h2>
              <span className="text-[10px] font-medium text-sky-400 block tracking-tight">
                Control de Aulas, Espacios Físicos y Flota Autorizada (STCW / DGMM)
              </span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="p-1 px-2.5 hover:bg-slate-805 bg-slate-800 rounded bg-transparent border-0 cursor-pointer text-slate-400 hover:text-white transition-all text-xs font-bold font-mono"
            title="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Notificaciones / Feedback flotante */}
        {feedbackMsg && (
          <div className="bg-sky-50 text-sky-900 border-b border-sky-200 px-6 py-2.5 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-sky-500 animate-pulse shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Cuerpo con Selector de Pestañas */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto max-h-[75vh]">
          
          {/* Instrucciones Rápidas Navales */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-700">
              <Info className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-tight text-slate-800">Directrices Pronautic</span>
            </div>
            <p className="text-[11px] text-slate-605 leading-relaxed">
              Los cambios que edites o agregues aquí se reflejarán instantáneamente en el selector de aulas y lanchas del planificador. El uso de recursos declarados previene amonestaciones de la DGMM y optimiza los exámenes prácticos en puerto.
            </p>
          </div>

          {/* Selector de Pestañas: Aulas o Embarcaciones */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200/50">
            <button
              type="button"
              onClick={() => setActiveTab("aulas")}
              className={`py-2 rounded-md text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border-0 ${
                activeTab === "aulas"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 bg-transparent hover:text-slate-800"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Aulas y Espacios ({aulas.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("embarcaciones")}
              className={`py-2 rounded-md text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border-0 ${
                activeTab === "embarcaciones"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 bg-transparent hover:text-slate-800"
              }`}
            >
              <Anchor className="w-4 h-4" />
              <span>Embarcaciones y Flota ({embarcaciones.length})</span>
            </button>
          </div>

          {/* Panel Principal */}
          {activeTab === "aulas" ? (
            <div className="space-y-4">
              
              {/* Añadir nuevo Aula */}
              <div className="flex gap-2 bg-slate-50 p-2 border border-slate-200 rounded-lg">
                <input
                  type="text"
                  placeholder="Ej. Aula de Navegación Costera 4..."
                  value={newAula}
                  onChange={(e) => setNewAula(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddAula()}
                  className="flex-1 bg-white border border-slate-205 rounded-md px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-705 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={handleAddAula}
                  disabled={!newAula.trim()}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-md text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 leading-none shadow-3xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Añadir
                </button>
              </div>

              {/* Listado de Aulas actuales */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {aulas.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">No hay aulas registradas en el sistema.</p>
                ) : (
                  aulas.map((aula, i) => {
                    const isBeingEdited = editingAulaIndex === i;
                    return (
                      <div 
                        key={i}
                        className="p-3 bg-white border border-slate-205 rounded-xl flex items-center justify-between gap-3 shadow-4xs transition-all hover:bg-slate-50/50"
                      >
                        {isBeingEdited ? (
                          <div className="flex-1 flex gap-1.5">
                            <input
                              type="text"
                              value={editingAulaValue}
                              onChange={(e) => setEditingAulaValue(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleSaveEditAula(i)}
                              className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-bold"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEditAula(i)}
                              className="p-1 px-2.5 bg-emerald-55 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold cursor-pointer border-0"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingAulaIndex(null)}
                              className="p-1 px-2 text-slate-500 bg-slate-200 hover:bg-slate-300 rounded text-xs font-bold cursor-pointer border-0"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-5 h-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">
                                {i + 1}
                              </span>
                              <span className="text-xs font-bold text-slate-705 truncate">
                                {aula}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEditAula(i, aula)}
                                className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded transition-all cursor-pointer border-0 bg-transparent"
                                title="Modificar nombre"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAula(i)}
                                className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-all cursor-pointer border-0 bg-transparent"
                                title="Eliminar espacio"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Añadir nueva Embarcación */}
              <div className="flex gap-2 bg-slate-50 p-2 border border-slate-200 rounded-lg">
                <input
                  type="text"
                  placeholder="Ej. Velero de Prácticas 'Albatros'..."
                  value={newEmbarcacion}
                  onChange={(e) => setNewEmbarcacion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddEmbarcacion()}
                  className="flex-1 bg-white border border-slate-205 rounded-md px-3 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-705 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={handleAddEmbarcacion}
                  disabled={!newEmbarcacion.trim()}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-md text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 leading-none shadow-3xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Añadir
                </button>
              </div>

              {/* Listado de Embarcaciones actuales */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {embarcaciones.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">No hay embarcaciones declaradas en el sistema.</p>
                ) : (
                  embarcaciones.map((boat, i) => {
                    const isBeingEdited = editingEmbarcacionIndex === i;
                    return (
                      <div 
                        key={i}
                        className="p-3 bg-white border border-slate-205 rounded-xl flex items-center justify-between gap-3 shadow-4xs transition-all hover:bg-slate-50/50"
                      >
                        {isBeingEdited ? (
                          <div className="flex-1 flex gap-1.5">
                            <input
                              type="text"
                              value={editingEmbarcacionValue}
                              onChange={(e) => setEditingEmbarcacionValue(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleSaveEditEmbarcacion(i)}
                              className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-bold"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEditEmbarcacion(i)}
                              className="p-1 px-2.5 bg-emerald-55 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold cursor-pointer border-0"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingEmbarcacionIndex(null)}
                              className="p-1 px-2 text-slate-500 bg-slate-200 hover:bg-slate-300 rounded text-xs font-bold cursor-pointer border-0"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-5 h-5 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">
                                {i + 1}
                              </span>
                              <span className="text-xs font-bold text-slate-705 truncate">
                                ⛵ {boat}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEditEmbarcacion(i, boat)}
                                className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded transition-all cursor-pointer border-0 bg-transparent"
                                title="Modificar nombre"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteEmbarcacion(i)}
                                className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-all cursor-pointer border-0 bg-transparent"
                                title="Eliminar embarcación"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

        </div>

        {/* Footer con controles finales */}
        <div className="px-6 py-4.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="text-[10px] font-black uppercase text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-all bg-transparent border-0 cursor-pointer p-1"
            title="Sustituir por configuración Pronautic por defecto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Cargar Predeterminados
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-2xs border-0"
          >
            Aceptar y Guardar
          </button>
        </div>

      </motion.div>
    </div>
  );
}
