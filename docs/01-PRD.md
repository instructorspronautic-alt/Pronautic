# Product Requirements Document (PRD)

**Versión:** 1.0.0
**Fecha de creación:** 2026-06-09
**Autor:** Pronautic Dev AI

## Visión del Producto y Problema que Resuelve
El **Pronautic Compliance Copilot** nace para resolver el desafío operativo y legal de la gestión de cursos marítimos. Las escuelas náuticas se enfrentan a normativas estrictas (estándares de la DGMM y STCW) que exigen un control minucioso de aforos, recursos físicos (aulas y embarcaciones), y cumplimiento documental estricto en plazos muy ajustados.

La plataforma consolida la información calendarizada y la transforma en entidades operativas enriquecidas. Actúa como un copiloto que automatiza procesos burocráticos, previene errores humanos e infracciones y asiste a los diferentes roles implicados en el cumplimiento integral de los estándares de certificación marítima, transformando un calendario en un motor de operaciones estructurado.

## Roles y Usuarios Objetivo

- **Rober (Director Operaciones):** Responsable de la visión transversal. Necesita gestionar recursos de toda la escuela, asegurar el cumplimiento a alto nivel, auditar la documentación y tener un panorama de instructores, embarcaciones y conflictos de solapamiento.
- **Raquel (Directora Centro):** Similar perfil administrativo y de supervisión que el Director de Operaciones, pero enfocado en la ejecución directa de la escuela y el cumplimiento normativo diario.
- **Instructores Externos / Plantilla:** Docentes (como Mehdi, Abel, Daniel, etc.) que ejecutan los cursos. Necesitan ver únicamente sus asignaciones, gestionar su disponibilidad, completar la auditoría de 38 pasos de la DGMM y extraer "La Nota" diaria para reporte de incidentes y control local.

## Módulos Actuales Funcionales (Fase 1)

1. **Google Calendar Read-Only (Regla de Oro):** Conexión directa a Google Workspace para reflejar la realidad del calendario. **LOS CALENDARIOS GOOGLE SON FUENTES DE INFORMACIÓN DE SENTIDO ÚNICO EN PRODUCCIÓN.** No se permite escrituras, alteraciones ni eliminaciones directas de eventos sin confirmación. Todo enriquecimiento se almacena localmente.
2. **Enriquecimiento de Recursos:** Permite asignar aulas, embarcaciones e instructores principales y secundarios a cualquier evento importado.
3. **Auditoría de Calidad DGMM (38 Pasos):** Cuestionario y registro estructurado en fases (Inicio, Aula/Práctica, Cierre) para cada curso, garantizando que el instructor repasa normativas y requerimientos legales.
4. **"La Nota" Operativa (Catalán):** Generador dinámico de un bloque de texto que resume un curso completo (datos base, horario, asistencia, incidentes) para ser copiado al portapapeles y usado en las bitácoras o reportes de mensajería (WhatsApp/Email) del centro, estandarizando la comunicación en catalán.
5. **Análisis IA con Gemini:** Sistema que lee agendas, tareas pendientes diarias y eventos para ofrecer sugerencias logísticas, sinergias y recomendaciones mediante inteligencia artificial en lenguaje natural (español).

## Módulos Pendientes (Fase 2)

- **Alertas Solapamiento Físico:** Motor proactivo para detectar si una misma aula o embarcación está reservada para dos eventos simultáneos, así como el solapamiento de horarios de instructores.
- **Control de Plazos DGMM (15 Días):** Reglas de negocio para monitorear el preaviso exigido por ley (comunicación a capitanía mínimo 15 días previos).
- **Sincronización Multi-Usuario (Firestore):** Transición del actual motor local de estado persistente (localStorage) hacia una base de datos Firebase/Firestore en la nube que permita colaboración multi-usuario y multi-dispositivo en tiempo real.
- **Push-to-Calendar (Opcional & Autorizado):** Funcionalidad restringida que, *únicamente bajo consentimiento directo explícito y manual del usuario admin*, permitiría re-publicar actualizaciones de un evento (añadiendo metadatos) nuevamente hacia Google Calendar.

## Requisitos No Funcionales

- **Seguridad:** Autenticación estricta con Google OAuth / Firebase. Los scopes de G-Suite deben solicitarse controladamente. Acceso restringido y control basado en Roles (RBAC simulado en fase actual, a migrar a backend).
- **Rendimiento:** Tiempos mínimos de carga utilizando Vite y React. Interfaz ultra rápida y fluida para no interrumpir operaciones diarias.
- **Accesibilidad:** Diseño de alto contraste estructurado con Tailwind CSS (Responsive Desktop first, Mobile robusto). Indicaciones claras de error y confirmación visual.
