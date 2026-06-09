# QA & Testing Plan

**Versión:** 1.0.0
**Fecha de creación:** 2026-06-09
**Autor:** Pronautic Dev AI

Para garantizar que el Pronautic Compliance Copilot no altere de forma indeseada la operatividad de los instructores ni incumpla las leyes formativas al presentar información, se plantea este marco de evaluación inicial.

## Estrategia de Testing General (A futuro)
- **Unit Tests (`Vitest`):** Enfocados estrictamente en reglas de utilería matemáticas (manejo de fechas en `start`/`end`), conversores `html_to_markdown` o lógica asíncrona pequeña.
- **E2E (`Playwright`):** Comprobadores del "Golden Flow" en Chrome o Edge (Acceder simulado, ir al dashboard, presionar un Evento, escribir en La Nota, y dar Clic a Copiar).

## 1. Casos y Perímetros Mínimos Actuales (Pruebas Manuales Integrales)

### A. Autenticación y Capas Base
- M_Auth1: Entrar a `/`, loguearse real con cuenta Google, obtener tokens limpios (Sin consola de errores roja).
- M_Auth2: Presionar "Simulación" -> La app debe proveer un estado "admin" y cargar con datos control mockeados el dashboard.
- M_Auth3: Salir o refrescar pestaña y certificar que la persistencia básica funcione.

### B. Rendimiento y Calendario Interactivo
- M_Cal1: Desplazarse por los botones cronológicos de (Hoy, Semanas, Trimestre y Año completo) asegurando que no se rompe la aplicación por loops infinitos en eventos largos (Ej: "Vacaciones Instructor" de 32 días contiguos).
- M_Cal2: Verificar que "solo Eventos Activos" elimina tareas limpiamente del Feed de "Course Matrix".
- M_Cal3: Probar los selectores dropdown de aulas desde un curso especifico -> Verificar guardado instantáneo -> Recargar web (Módulo persistencia `localStorage`).

### C. Cumplimiento & Generadores Textuales ("La Nota")
- M_Law1: Acceder un curso activo -> Ficha Evento -> Pestaña Auditorías -> Mover los primeros 6 pasos -> Progreso marca correctamente `15%` / Cierres limpios.
- M_Law2: Llenar cajas de incidentes en sección "Notes/La Nota" -> Generar reporte -> El Banner debe mostrar formato de texto puro sin código React incrustado y todo en estricto y limpio Catalán.
- M_Law3: Copiar texto vía botón -> Extraer y pegar en notepad para asegurar que los saltos de línea `\n` existen correctamente.

### D. Agente IA (Copiloto API Proxy)
- M_Ai1: Pulsar Run Co-Pilot Analysis en la franja superior -> Validar carga asíncrona sin bloqueos del GUI.
- M_Ai2: Interceptar Network, forzar un Error HTTP de vuelta para evaluar -> La plataforma **DEBE responder con el string genérico "Sinergia de Tareas Mock..."** y no "500 Server Exception". Todo en lenguaje Español por el Fallback.

### E. Integración Real-Time y Google Sheets
- M_Sheets1: Guardar aula en un evento → recargar → el aula sigue asignada (localStorage). Con token real → verificar en el spreadsheet de Sheets que la fila existe.
- M_Sheets2: Rober guarda recurso → Raquel recarga la app → Raquel ve el mismo recurso (validación multi-usuario Sheets).

### F. Alertas Activas y Conflictos (Banners)
- M_Conflict1: Asignar la misma aula a dos eventos solapados en tiempo → el banner rojo aparece con la descripción del conflicto.
- M_DGMM1: Crear evento de curso con fecha dentro de 10 días y estado "PLANIFICADO" → el banner naranja aparece con el nombre del curso y "10 días restantes".
- M_DGMM2: Cambiar el estado a "COMUNICADO DGMM" → el banner naranja desaparece para ese curso.

## 2. Checklist Final Previo a Release en Producción

- [ ] App web levanta correcta en dominio Vercel/CloudRun sin alertas severas del bundler Vite.
- [ ] OAUTH API Consent Screen validada para Pronautic (O en testing explícito).
- [ ] No cruces accidentales en URLs de Firestore (Si fuese insertado remotamente).
- [ ] Funciona y no bloquea estilos Flex en iOS Safari & Chrome Mobile.
- [ ] **CRÍTICO:** Verificación explícita de código de que *NO HAY NINGÚN COMANDO POST, PUT, DELETE HACIA ENDPOINTS `.../calendar/v3/calendars/../events/..`* (Regla de oro: NO MODIFICAR CALENDARIOS OFICIALES EXTERNAMENTE DE FORMA AUTOMÁTICA).
