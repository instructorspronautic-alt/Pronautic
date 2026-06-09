# Pronautic Compliance Copilot ⛵

![React](https://img.shields.io/badge/React-19-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)
![Vite](https://img.shields.io/badge/Vite-6-purple.svg)
![Firebase](https://img.shields.io/badge/Firebase-Auth-yellow.svg)
![Gemini AI](https://img.shields.io/badge/Gemini-2.5%20Flash-orange.svg)

El **Pronautic Compliance Copilot** es una plataforma operativa inteligente. Sirve como herramienta puente entre las rígidas programaciones logísticas corporativas de Calendario, y los metadatos requeridos por ley, capitanía y DGMM para los centros de Educación Náutica marítima. Transforma calendarios de "solo-lectura" en centros integrales de evaluación legal y auditoria física.

## 📚 Documentación Técnica Activa

Toda la documentación arquitectónica, operativa y requisitos del proyecto consta en la carpeta `/docs`.

1. [PRD (Producto y Problemas Resolvemos)](docs/01-PRD.md)
2. [Arquitectura General Stack](docs/02-ARCHITECTURE.md)
3. [Modelos de Dato](docs/03-DATA-MODEL.md)
4. [Historias de Usuario / Roles Oficiales](docs/04-USER-STORIES.md)
5. [Especificación APIs GCP/Express](docs/05-API-SPEC.md)
6. [Guía y Configuración para Desarrolladores Localhost](docs/06-DEV-SETUP.md)
7. [RoadMap / Pendientes](docs/07-ROADMAP.md)
8. [Plan de QA y Checklist Operativo](docs/08-QA-PLAN.md)

---

## ⚡ Quickstart

Empieza a colaborar y desarrollar para el proyecto en 3 simples pasos:

1. **Clonar e instalar el repositorio matriz:**
   ```bash
   git clone https://github.com/instructorspronautic-alt/Pronautic.git
   cd Pronautic
   npm install
   ```

2. **Configurar secret keys `.env.local`** (Para IA y DB):
   Debes construir en la raíz el archivo `.env.local` con las Keys de tu proyecto GCP (Referirse al manual [06-DEV-SETUP](docs/06-DEV-SETUP.md)).
   ```env
   GEMINI_API_KEY=tu_key_aqui
   VITE_FIREBASE_API_KEY=tu_config_firebase
   # etc...
   ```

3. **Inicia el servidor local de desarrollo**:
   Esto arrancará las dependencias de Vite / Tailwind a la vez que despliega un Proxy local en Node para las llamadas a la Inteligencia Artificial Privada.
   ```bash
   npm run dev
   ```

---

## 🎭 Entorno Carente de Credenciales (Mock & Simulación)

En caso de requerir ver o aportar a la interfaz del usuario, componentes Front u hojas de estilo, pero carecer inicialmente del token Google OAuth/Firebase corporativo de Pronautic; recomendamos acceder a través del puerto configurado `localhost:3000` y al ver la primera imagen del login clikar en los enlaces de **"Modo Simulación Admin"**. 
Esto anula el requerimiento OAUTH y permite interacciones visuales puras de evaluación estructural.
