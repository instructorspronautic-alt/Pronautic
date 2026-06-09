# Guía de Desarrollo Local (DEV-SETUP)

**Versión:** 1.0.0
**Fecha de creación:** 2026-06-09
**Autor:** Pronautic Dev AI

Esta guía provee toda la configuración necesaria para operar sobre el repositorio de código del Copiloto de manera local (Localhost) o en un entorno en la nube compatible.

## 1. Requisitos Previos

- **Node.js**: v18.0.0 o superior recomentado (ideal v20 LTS).
- **Control de versiones**: `git`.
- **Cuenta de Google (Google Cloud Console)**: Para activar y configurar un proyecto API que provea el `Client ID` para OAuth y habilitar la Calendar API.

## 2. Variables de Entorno

Debes crear un archivo de entorno local en el directorio raíz. Opcionalmente, renombra `template.env` a `.env` (si existe):

```env
# Ejemplo de .env.local
VITE_SUPABASE_URL= (Opcional por si es utilizado en migraciones DDBB)
VITE_SUPABASE_ANON_KEY= (Opcional)

# Claves de la Firebase Project (Para poder usar firebase Auth)
VITE_FIREBASE_API_KEY="Axxxxxxxxxxxxxxxxxxxx"
VITE_FIREBASE_AUTH_DOMAIN="myapp-XXXX.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="myapp-XXXX"
VITE_FIREBASE_STORAGE_BUCKET="myapp-XXXX.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="XXXXXXXXXXXXX"
VITE_FIREBASE_APP_ID="1:XXXXXXXXXX:web:XXXXXXXXXXXX"

# Gemini API Key para el backend Express
GEMINI_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX"
```

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
