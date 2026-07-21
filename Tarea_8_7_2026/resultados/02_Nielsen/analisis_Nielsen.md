# Análisis heurístico de Nielsen — Chaski Alert

5 evaluadores externos calificaron los **10 problemas reales** documentados durante la inspección
del sistema en ejecución (8-jul-2026), con evidencia en `capturas/web/`.

- **Severidad media global: 2.40 / 4**; 3 problemas alcanzan severidad ≥ 3 (mayor/catastrófico).
- Los más graves: **P04** (el botón sos se dispara con un solo toque, sin confirmación, 3.2); **P05** (con la aplicación cerrada no llegan notificaciones de avisos, 3.2); **P03** (no existe editar ni eliminar comunicados publicados, 3.0).
- Nota de verificación: el mapa de alertas SÍ se actualiza automáticamente (polling de 5 s con
  indicador 'En vivo'), por lo que la ruptura de visibilidad (H1) se concentra en el lado móvil
  (sin push con la app cerrada) y en el indicador de estado falso con la API caída.
- Fortalezas confirmadas: mapa en tiempo real, bilingüismo Kichwa consistente en el panel (H2),
  SOS de un toque muy simple, contingencia SMS offline y validación robusta del backend.

**Conclusión:** el sistema es estéticamente sólido y culturalmente pertinente; los eslabones
débiles de la cadena de emergencia están en la notificación móvil con la app cerrada, en la
honestidad del indicador de estado y en el control de acceso por rol del panel web.
