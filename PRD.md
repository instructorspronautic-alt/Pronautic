# Pronautic Compliance Copilot - Documento de Requisitos de Producto (PRD) & SITREP

Este documento actúa como el **manual de referencia y análisis** de la plataforma Pronautic Compliance Copilot, detallando las funcionalidades construidas, el estado actual de la plataforma (SITREP) y la visión futura de configuración pendiente según la Constitución del centro formativo.

---

## 📅 FICHA TÉCNICA Y ESTADO OPERATIVO (SITREP)

El **Pronautic Compliance Copilot** es una aplicación full-stack interactiva construida con **React, Vite y Tailwind CSS** que se conecta a las APIs de Google Workspace para la monitorización, cumplimiento legal y enriquecimiento temporal de operaciones formativas (Cursos STCW, PER, PNB, Prácticas y Exámenes náuticos).

### 🛠️ ¿Qué hace la aplicación hoy? (Hitos Implementados)

1. **Integración con Google Calendar (Read-Only de Ingress):**
   * Lee en tiempo real el calendario de producción de la escuela (`CURSOS MANRESA` y otros sub-calendarios configurados).
   * **Seguridad Estricta:** Cumple la de regla de oro: es de solo lectura hacia Google. Cualquier enriquecimiento de datos no sobreescribe la planificación oficial sin confirmación, evitando desconfiguraciones accidentales.

2. **Enriquecimiento Local de Recursos (Base de Datos Relacional Efímera):**
   * Permite asignar recursos físicos a cada curso: **Aulas** ("Aula de Simulación Práctica", "Simulador de Radio GMDSS", etc.) y **Embarcaciones** ("Velero Escuela 'Capitán Pronautic'", etc.).
   * Guarda estos datos de forma persistente a través del `localStorage` del navegador para que no se pierdan al recargar.

3. **Consola de Auditoría de Calidad Marina (Poka-Yoke):**
   * Flujo de verificación de 3 fases (Inicio, Aula, Cierre) alineado con los 38 pasos exigidos por la Dirección General de la Marina Mercante (DGMM).
   * Gestión de **listados de alumnos** (con DNI y estado de asistencia), **registro interno de incidencias** operativas/médicas y **auditoría interna** de cambios.

4. **Ficha de Control Operativo Pronautic (La "Nota" en Catalán):**
   * Se ha integrado un módulo dedicado en el panel del evento para visualizar y editar la bitácora operativa de coordinación rápida de la escuela.
   * Cuenta con un **generador dinámico de plantilla en catalán** con todos los campos solicitados por los directores (Horarios, instructores principales/secundarios, control de accesos a Port Olímpic/BNC, número de alumnos totales, ratios MCC/MCR y aula).
   * Tiene un botón interactivo de **Copiar Nota** de un solo click que almacena el bloque de texto formateado en el portapapeles listo para usar en correos, chats de WhatsApp de instructores o directamente en el campo de descripción del evento de Google.

---

## 🔮 CONFIGURACIÓN PENDIENTE (Siguiente Fase del PRD)

Según el análisis del código y la Constitución técnica de Pronautic, se proyectan los siguientes desarrollos para las fases subsiguientes:

| Módulo/Funcionalidad | Descripción Técnica | Estado / Planificación |
| :--- | :--- | :--- |
| **Alertas de Solapamiento Físico** | Avisar con un banner de advertencia si la misma aula o embarcación está programada en los mismos horarios en dos cursos concurrentes de Google Calendar. | *Pendiente (Lógica de intersección de fechas en Frontend)* |
| **Control de Plazos DGMM (15 Días)** | Generador de alarmas de colores si la fecha del curso es inferior a 15 días vista y el estado del curso no está marcado como "COMUNICADO A DGMM". | *Pendiente (Validación temporal frente a hoy)* |
| **Sincronización Multi-Usuario (Firestore)** | Migrar el almacenamiento temporal de `localStorage` de recursos y notas a una colección de Firebase Firestore en la nube para sincronizar en tiempo real el trabajo de Rober, Raquel y los instructores. | *Planificado (Mapeado en blueprint)* |
| **Canal de Escritura Opcional (Push-to-Calendar)** | Implementar un interruptor explícito controlado por el usuario para poder escribir/actualizar la plantilla directamente en la descripción de Google Calendar mediante API. | *Pendiente (Ajuste de permisos write oauth)* |

---

## 📋 EJEMPLO OFICIAL PARA GOOGLE CALENDAR (Plantilla Enriquecida)

Para que todo el equipo trabaje de forma unificada, los eventos en los calendarios deben usar el formato oficial consolidado por el Copiloto. 

A continuación se muestra el ejemplo exacto de cómo queda la descripción de un curso ficticio de **"MCC + MCR ALCI"** para el viernes 29 de mayo, con todos los datos operacionales requeridos:

***

### Título del Evento:
`MCC + MCR ALCI`

### Hora:
`Viernes, 29 de mayo ⋅ 9:00am – 6:00pm`

### Descripción en Google Calendar / Comentarios:
```text
📅 Data d’actualització: 25/05/2026
Officially compiled by Pronautic Compliance Copilot.

🕘 Horari del curs:
• Inici: 09:00h
• Descans: 13:00 - 14:00h
• Finalització: 18:00h

👤 Instructor principal:
• Nom: Roberto "Rober" Director
• Tipus de contractació: Planificat (29 de maig)

👤 Instructor secundari (si escau):
• Nom: Ningú
• Tipus de contractació: N/A

🔐 Accesos necessaris:
• Claus Port Olímpic: SÍ
• Claus BNC: SÍ
• Targeta Port Olímpic: NO
• Targeta BNC: SÍ

👥 Nombre d’alumnes curs complet: 6

MCC: 3
MCR: 4
📚 Aula assignada: Aula Teórica del Puerto

CURSOS MANRESA
Creado por: pronauticmaria@gmail.com
```

***

*Nota de Uso:* Al editar un curso dentro del Copiloto de Pronautic, puedes rellenar estos campos visualmente con casillas de verificación y selectores, copiar el texto resultante con un solo botón, y pegarlo de inmediato para sincronizar al equipo técnico sin errores de transcripción.
