# Roadmap (Hoja de Ruta del Proyecto)

**Versión:** 1.0.0
**Fecha de creación:** 2026-06-09
**Autor:** Pronautic Dev AI

La hoja de ruta define pragmáticamente las metas futuras de desarrollo e integra el entendimiento actual de Deuda Técnica adquirida.

---

## Fase 1: Consolidación Transversal (Actual)
La fase activa actualmente despliega la mayoría del requerimiento mínimo de negocio planteado por gerencia.

- [x] Arquitectura Híbrida local / externa.
- [x] Monitor de lectura Calendar + Tasks APIs.
- [x] Configuración Modular y enlazado persistido a Nivel Local (localStorage).
- [x] Checklists DGMM / 38 pasos.
- [x] Bloque autogenerador: "La Nota" Estricta en Catalán.
- [x] Motor "Copilot AI" (Sinergias, Fallback en español integral).
- [x] Directorio Administrativo del Personal.

## Fase 2: Robustecimiento y Trabajo Colaborativo (Mid-Term)
Módulos enfocados a romper las limitaciones del desarrollo estático en solitario (migración real a cloud):

1. **Sincronización Cloud Multiusuario (Firestore / Supabase) [ESFUERZO L]**
   * Migrar todos los registros (`event_allocated_resources`, listas estáticas) hacia una DB Documental.
   * Dependencia Primaria: Implica desechar la persistencia manual en LocalStorage y cambiar las asincronizaciones.
2. **Sistema Predictivo de Conflictos Físicos [ESFUERZO M]**
   * Añadir alertas persistentes visuales rojas y prevenciones hard code si "Aula 2" se da al mismo tiempo en dos eventos contiguos.
3. **Módulo Exigencia Legal de Tiempos DGMM [ESFUERZO M]**
   * Configurar etiquetas codificadas de Preaviso para monitorear el límite duro de 15 días frente a capitanía (Semáforos y Tareas Automáticas).
4. **Exportaciones Compuestas / Informes Oficiales [ESFUERZO S]**
   * Generar e imprimir un PDF estricto que resuma la clase o automatizar envío diario al administrador.

## Fase 3: Visión Extendida y Dispositivos Periféricos (Long-Term)
Ideas exploratorias a añadir si el proyecto escala internamente.

- **Aplicación Móvil Segregada (Companion App):** Embalajes con Ionic o React Native puramente para el uso minimalista en tablets náuticas o smartphones de profesores en buques en alta mar (operatividad offline).
- **Integración con la DGMM API:** Si o cuando Capitanía Marítima estandarice procesos HTTP seguros en formato JSON/XML, enlazar las plantillas pregeneradas directo hacia bases de puertos oficiales.
- **Push To Calendar:** Autorizar permisos Write de API de google para "empujar automáticamente" reportes o confirmaciones en los campos `description` o agregar a Raquel y otros usuarios como `attendees`.

## Listado de Deuda Técnica Principal
- El Mockeo del almacenamiento a través de `.parse` y `Stringify` en Custom Hooks no es escalable y sobrepasa límites visuales en grandes cuentas con miles de eventos.
- Implementación deficiente de Avatares (Los avatares Unsplash Mockeados consumirán la UI pronto, deben usarse perfiles base `Google Auth`).
