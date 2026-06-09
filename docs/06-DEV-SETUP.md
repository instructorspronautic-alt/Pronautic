# Guía de Desarrollo Local (DEV-SETUP)

**Versión:** 1.0.0
**Fecha de creación:** 2026-06-09
**Autor:** Pronautic Dev AI

Esta guía provee toda la configuración necesaria para operar sobre el repositorio de código del Copiloto de manera local (Localhost) o en un entorno en la nube compatible.

## 1. Requisitos Previos

- **Node.js**: v18.0.0 o superior recomentado (ideal v20 LTS).
- **Control de versiones**: `git`.
- **Cuenta de Google (Google Cloud Console)**: Para activar y configurar un proyecto API que provea el `Client ID` para OAuth y habilitar la Calendar API.

## 2. Variables de Entorno y Configuración Firebase para desarrollo local

Para operar con la versión oficial (sin datos simulados), la aplicación usa la autenticación OAuth de Google mediante Firebase (Google Auth Provider). Debes suministrar estas credenciales.

**Cómo obtener las credenciales del proyecto Firebase existente:**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/) > Proyecto Pronautic.
2. (Si tienes acceso como Owner en Firebase Cloud) Ve a la Firebase Console > **Project overview > Project settings (Configuración del proyecto) > Pestaña 'General'**.
3. Baja hasta la sección **tus aplicaciones (Your apps)**, selecciona tu web-app y copia el contenido del objeto de configuración (`firebaseConfig`).
4. Dónde pegar cada variable en `.env.local` de la raíz del proyecto (crea el archivo si no existe):

```env
# Ejemplo de .env.local

# Claves del Proyecto Firebase Oficial (Para poder usar Firebase Auth con Google Workspace)
VITE_FIREBASE_API_KEY="pega_tu_apiKey"
VITE_FIREBASE_AUTH_DOMAIN="pega_tu_authDomain"
VITE_FIREBASE_PROJECT_ID="pega_tu_projectId"
VITE_FIREBASE_STORAGE_BUCKET="pega_tu_storageBucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="pega_tu_messagingSenderId"
VITE_FIREBASE_APP_ID="pega_tu_appId"

# ID de la base de datos local en Google Sheets oficial (Ver documento 09)
VITE_SHEETS_DB_ID="1mzhnYTsZRWe2TM1Lz7YuyOLaBo_L0r6cuef6GKNGe9Y"

# Gemini API Key para el backend Express
GEMINI_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX"
```

**Verificar que los dominios locales están autorizados en la Consola:**
Para que el login OAuth de Google funcione desde tu ordenador de programación (localhost):
1. Ve a Firebase Console -> Menú de la izquierda -> **Authentication**.
2. Dale a la pestaña **Settings (Configuración)**.
3. Elige la opción **Authorized domains (Dominios autorizados)**.
4. Asegúrate firmemente de que `localhost:3000` está añadido como dominio oficial habilitado. Si falta, dale a "Add domain" e insértalo `localhost`. Al guardar, tu puerto localhost podrá autenticarse contra Google correctamente.

## 3. Instalación de Dependencias e Inició del Proyecto

Abre un terminal integrado en el root logístico de tu código.

```bash
# 1. Instalar todos los paquetes NPM (lucide, motion, react, etc.)
npm install

# 2. Levantar el proyecto de desarrollo (Inicia Express Backend en Puerto 3000 con proxy a Vite)
npm run dev
```

El servidor quedará expuesto por predeterminación usando puerto 3000 (`http://localhost:3000/`).

## 4. Scripts de Desarrollo en `package.json`

| Comando Script | Detalle |
| :--- | :--- |
| `npm run dev` | Lanza `tsx server.ts` que integra en desarrollo un motor Vite Middleware. Permite el LiveReloading a la vez que dispone de los Endpoints (como local/api/analyze-schedule). |
| `npm run build` | Hace dos fases: a) Compila Vite Frontend /dist, b) Pasa esbuild para construir el `/dist/server.cjs` autocontenido. |
| `npm run start` | Entorno Producción. Lanza `node dist/server.cjs` sin herramientas pesadas, operando el server optimizado. |
| `npm run lint` | Validador sintáctico en base en TypeScript Config. |

## 5. Simular Sin Credenciales (Mock Mode)

Hemos implementado un modo simulado extremadamente dócil por si al clonar en Local no consigues o no te interesa configurar credenciales de FireBase Web.
Al acceder a la primera pantalla, usa los botones "Simular Admin (Rober)" o "Simular Admin (Raquel)".
Esto inicializa el estado con permisos máximos y permite renderizar la UI completa ignorando los bloqueos oficiales OAuth. (Google Calendar, sin embargo, se mostrará estéril o vacío con los estados "test" incorporados).
