# Architecture Document

**Versión:** 1.0.0
**Fecha de creación:** 2026-06-09
**Autor:** Pronautic Dev AI

## Stack Tecnológico

La plataforma está diseñada sobre un stack web moderno y de alta escalabilidad (JAMStack modernizado con proxy backend):
- **Frontend / Core UI:** React 19, TypeScript 5.8
- **Build Tool:** Vite 6
- **Estilos y Componentes:** Tailwind CSS 4, Lucide React (Íconos), Framer Motion (`motion/react` para animaciones y transiciones de UI)
- **Backend Proxy:** Express.js (integrado a través de Vite middleware en dev y empaquetado standalone en producción)
- **Integraciones IA:** Gemini API (`gemini-2.5-flash` vía `@google/genai`) para análisis semántico.
- **Autenticación e Integraciones Cloud:** Firebase Auth (Proveedor Google Auth), Google APIs (Calendar API v3, Tasks API v1, Sheets API v4).

## Arquitectura de Aplicación (ASCII Diagram)

```text
+-----------------------------------------------------------+
|                  [ CLIENTE / NAVEGADOR ]                  |
|    React SPA (Vite) + Tailwind CSS + Framer Motion        |
|    - Estado Global (React Hooks)                          |
|    - App Storage (localStorage / IndexedDB)               |
+--------------------------+--------------------------------+
                           |
            (Llamadas REST / API Proxy / Autenticación)
                           |
+--------------------------v--------------------------------+
|                   [ EXPRESS BACKEND ]                     |
|    Proxy NodeJS Server (puerto 3000 o configurable)       |
|    - Rutas locales (ej: /api/analyze-schedule)            |
|    - Gemini API Integration (Manejo de Secretos Seguros)  |
+----+---------------------+---------------------+----------+
     |                     |                     |
     v                     v                     v
[ Firebase Auth ]    [ Gemini API ]        [ Google APIs ]
(Identity Mgmt)      (gemini-2.5-flash)    (Calendar, Tasks,
                                            Sheets Data)
```

## Flujo de Autenticación Local & OAuth
1. El usuario inicializa la app o presiona "Acceder con Google".
2. `firebase/auth` invoca el popup OAuth (`GoogleAuthProvider`).
3. La aplicación solicita scopes extendidos (`calendar.readonly`, `tasks.readonly`, `spreadsheets`).
4. Al resolverse, Firebase devuelve el ID local y el token de acceso de las APIs de Google (OAuth Access Token).
5. Este token se pasa a través del frontend a los servicios de frontend para realizar los fetch de los eventos.

## Flujo Principal de Datos (Regla de Oro: Read Only en Calendarios)
1. **Extracción:** La App consulta `GET https://www.googleapis.com/calendar/v3/calendars/.../events` usando el token OAuth.
2. **Transformación:** Las entidades de calendario se normalizan dentro de la SPA (tipo `CalendarEvent`).
3. **Enriquecimiento (Local):** El usuario asigna instructores/aulas/auditorías a los eventos vía la UI. Este estado intermedio se guarda en **localStorage**. 
4. **Presentación:** La SPA fusiona dinámicamente cada evento de Calendar con el bloque en memoria local, construyendo la vista "extendida" del estado temporal y metadatos.

## Decisiones de Diseño Críticas
1. **Frontend-Heavy State (De momento):** Para priorizar velocidad de entrega, el "estado enriquecido" reside en el cliente (`localStorage`). Esto exige que migremos pronto a Firebase (Firestore) para persistencia en entorno multiusuario real.
2. **Backend Express Embebido:** Se incluyó servidor Node/Express para mantener la API Key de Gemini API oculta y protegida (arquitectura Full-Stack segura).
3. **Protección de Escritos Calendar:** Por diseño, la aplicación no dispone de módulo PATCH/POST que conecte automáticamente con la API nativa de Google Calendar para modificar un evento, previniendo catastróficos borrados por código erróneo.

## Estructura de Proyecto Reflejada
- `/src/components/*`: Módulos de UI (Modal Auditorías, Dashboard de Métricas, Panel IA).
- `/src/types.ts`: Esquemas transversales TypeScript.
- `/src/App.tsx`: Orquestador principal, Router ligero y estado principal en React.
- `/src/auth.ts`: Utilidades y flujos de Firebase / OAuth.
- `/src/api/*`: (Futuros) controladores cliente.
- `/server.ts`: Backend Express. Proxy y servidor stand-alone para análisis IA.
- `/docs/*`: Documentación del Producto.
