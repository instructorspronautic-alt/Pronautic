import { useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from "recharts";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, startOfWeek, endOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarEvent } from "../types";
import { BookOpen, Users, Clock, Anchor } from "lucide-react";

interface MetricsDashboardProps {
  events: CalendarEvent[];
}

export default function MetricsDashboard({ events }: MetricsDashboardProps) {
  // Analytical processing
  const { kpis, distributionByCategory, instructorsData, loadThisWeek } = useMemo(() => {
    let totalCourses = 0;
    let totalHours = 0;
    let uniqueInstructors = new Set<string>();
    
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const categoriesCount: Record<string, number> = {
      "PER": 0,
      "PNB": 0,
      "STCW": 0,
      "Prácticas": 0,
      "Otros": 0
    };

    const instructorHours: Record<string, number> = {};
    const weeklyLoad: Record<string, number> = {
      "Lunes": 0, "Martes": 0, "Miércoles": 0, "Jueves": 0, "Viernes": 0, "Sábado": 0, "Domingo": 0
    };

    events.forEach(e => {
      const startStr = e.start?.dateTime || e.start?.date;
      const endStr = e.end?.dateTime || e.end?.date;
      if (!startStr || !endStr) return;

      const startD = parseISO(startStr);
      const endD = parseISO(endStr);
      
      // Calculate duration in hours
      const durationHours = (endD.getTime() - startD.getTime()) / (1000 * 60 * 60);

      // Only count events in the current month for main KPIs
      if (isWithinInterval(startD, { start: monthStart, end: monthEnd })) {
        totalCourses++;
        totalHours += durationHours;

        // Extract Instructor if present (assuming description has format or using creator)
        const descLower = (e.description || "").toLowerCase();
        let instructor = "Sin Asignar";
        if (descLower.includes("robert")) instructor = "Robert";
        else if (descLower.includes("raquel")) instructor = "Raquel";
        else instructor = e.creator?.displayName || "Otro";
        
        uniqueInstructors.add(instructor);
        instructorHours[instructor] = (instructorHours[instructor] || 0) + durationHours;

        // Categories
        const title = (e.summary || "").toUpperCase();
        if (title.includes("PER") && !title.includes("PRACTICAS")) categoriesCount["PER"]++;
        else if (title.includes("PNB")) categoriesCount["PNB"]++;
        else if (title.includes("STCW") || title.includes("FORMACIÓN BÁSICA")) categoriesCount["STCW"]++;
        else if (title.includes("PRACTICA") || title.includes("PRÁCTICA")) categoriesCount["Prácticas"]++;
        else categoriesCount["Otros"]++;
      }

      // Weekly load
      if (isWithinInterval(startD, { start: weekStart, end: weekEnd })) {
        const dayName = format(startD, "EEEE", { locale: es });
        const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
        if (weeklyLoad[capitalizedDay] !== undefined) {
            weeklyLoad[capitalizedDay] += durationHours;
        }
      }
    });

    const categoriesArray = Object.entries(categoriesCount)
      .map(([name, value]) => ({ name, value }))
      .filter(c => c.value > 0);

    const instructorsArray = Object.entries(instructorHours)
      .map(([name, hours]) => ({ name, hours: Math.round(hours) }))
      .sort((a, b) => b.hours - a.hours);

    const weeklyArray = Object.entries(weeklyLoad).map(([day, hours]) => ({ name: day, hours: Math.round(hours) }));

    return {
      kpis: {
        totalCourses,
        totalHours: Math.round(totalHours),
        activeInstructors: uniqueInstructors.size
      },
      distributionByCategory: categoriesArray,
      instructorsData: instructorsArray,
      loadThisWeek: weeklyArray
    };
  }, [events]);

  const COLORS = ['#0f766e', '#1d4ed8', '#eab308', '#6366f1', '#a8a29e'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            📊 Dashboard Operativo 
            <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
              Este Mes
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">Visión general analítica de la planificación escolar.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-start gap-4">
          <div className="p-3 bg-teal-50 rounded-xl">
            <BookOpen className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Formaciones</p>
            <h3 className="text-2xl font-black text-slate-800">{kpis.totalCourses}</h3>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Horas Lectivas</p>
            <h3 className="text-2xl font-black text-slate-800">{kpis.totalHours} <span className="text-sm text-slate-400 font-medium">hrs</span></h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-start gap-4">
          <div className="p-3 bg-amber-50 rounded-xl">
            <Users className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Instructores Activos</p>
            <h3 className="text-2xl font-black text-slate-800">{kpis.activeInstructors}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-start gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl">
            <Anchor className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Promedio Semanal</p>
            <h3 className="text-2xl font-black text-slate-800">{Math.round(kpis.totalHours / 4)} <span className="text-sm text-slate-400 font-medium">hrs/sem</span></h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Load Chart */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 tracking-tight">Carga de Horas Esta Semana</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loadThisWeek} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="hours" name="Horas" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 mb-2 tracking-tight">Distribución por Cursos</h3>
          <div className="h-[250px] w-full flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {distributionByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Load by Instructor */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 mb-4 tracking-tight">Horas Lectivas por Instructor (Mes Actual)</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={instructorsData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis 
                  type="number" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }} 
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="hours" name="Horas Registradas" fill="#0f766e" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
