# Frontend Agent Guide

## Stack actual y objetivo
- SPA con React + TypeScript + Vite.
- Navegación con `react-router-dom`.
- Estado del servidor con `@tanstack/react-query`.
- Visualización de mapas con `Leaflet + OpenStreetMap`.

## Arquitectura obligatoria
- Mantener separación entre:
  - páginas;
  - componentes reutilizables;
  - servicios HTTP;
  - tipos compartidos.
- No dispersar lógica de `fetch` dentro de las páginas.
- Toda llamada al backend debe pasar por la capa de servicios.
- Los flujos autenticados y públicos deben quedar claramente separados.

## Testing obligatorio
- El estándar de validación funcional del frontend es `Playwright E2E`.
- Los tests deben correr contra frontend y backend reales, no solo contra mocks.
- Se trabaja con enfoque TDD:
  1. escribir o ajustar el escenario E2E;
  2. comprobar el fallo;
  3. implementar el mínimo necesario;
  4. refactorizar manteniendo verde.

## Validación obligatoria antes de commit
- Correr la suite E2E de Playwright.
- Levantar el frontend con el script correspondiente y verificar que arranca sin errores.
- Un cambio no se considera válido si no pasó tests y no arranca correctamente.
- La IA debe usar esta validación como criterio obligatorio antes de dar por terminado un desarrollo.
- En este workspace mixto `Windows + WSL`, si se cambia de runtime puede ser necesario reejecutar `npm install` en ese mismo entorno antes de validar, porque `vite/rolldown` usa bindings nativos por plataforma.

## Mapa y APIs
- Mantener scope gratuito:
  - mapa principal: `Leaflet + OpenStreetMap`;
  - ruteo/geocoding: backend con `OpenRouteService`.
- No introducir Google Maps JavaScript API en esta fase.

## Casos de uso mínimos a cubrir
- Login exitoso y fallido.
- Navegación protegida.
- Alta/listado/edición/eliminación de pedidos.
- Generación y visualización de rutas del día.
- Actualización de estado de entrega.
- Consulta pública por tracking.
