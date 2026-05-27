# Pronautic Compliance Copilot - Constitución del Proyecto

Este documento establece las reglas fundamentales de arquitectura, negocio e integridad técnica que regulan el desarrollo del Copiloto de Cumplimiento Marítimo de Pronautic. Cualquier agente de IA o desarrollador que modifique esta base de código debe respetar estas directrices estrictamente.

---

## 📜 Regla de Oro (La Constitución)

> [!CRITICAL]
> **LOS CALENDARIOS GOOGLE (Y CUALQUIER OTRA API DE CALENDARIO INTEGRADA) SON FUENTES DE INFORMACIÓN DE SENTIDO ÚNICO (READ-ONLY) EN PRODUCCIÓN.**
>
> 1. **Prohibido Modificar o Escribir:** Queda terminantemente prohibido implementar flujos automáticos o manuales que alteren, elgán, modifiquen, creen, o eliminen eventos directamente en los calendarios externos o de producción de Google sin consentimiento directo del usuario.
> 2. **Fuente Oficial de Verdad:** Los calendarios externos representan la planificación fáctica de la escuela instalada en producción.
> 3. **Consumo y Enriquecimiento:** Debemos consumir estos eventos de forma pasiva / reactiva para alimentar el motor operacional, enriquecer los flujos con metadatos locales (aulas, embarcaciones, instructores adjuntos), y contrastar el cumplimiento legal frente a las condiciones ideales.
> 4. **Seguridad Operativa:** Cualquier cambio manual o estado de flujo se controla y persiste de forma local en el estado relacional de la aplicación (o base de datos interna de la app), garantizando que las APIs oficiales de Google no sufran escrituras accidentales ni desconfiguraciones.

---

## 🎯 Enfoque Operativo y Futuro

- **El Calendario como Visualización:** El calendario no es la base de datos de negocio de Pronautic, sino una vista temporal de compromisos. El núcleo del sistema son las **Operaciones Formativas** (Cursos STCW, Prácticas, Exámenes).
- **Enriquecimiento de Cursos:** Los cursos se consideran entidades vivas con estados estructurados, listas de comprobación de 38 pasos (DGMM), asignación de recursos auxiliares, y monitoreo legal integrado.
- **Detección Activa de Riesgos:** El sistema debe detectar solapamientos físicos de aulas o naves, vencimientos de plazos de comunicación a la DGMM (ej. límite de 15 días previos), y congruencia de participantes frente al aforo homologado.
