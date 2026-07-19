# logistic-app-fe

Frontend de la plataforma de logística: login con roles, ABM de pedidos, agrupación automática por zona y visualización de rutas óptimas en mapa, tracking público, panel de administración de usuarios y reportes agregados. React + Vite + React Query + Leaflet + Radix UI.

## Requisitos

- Node.js 20 o superior
- El backend (`logistic-app-be`) levantado y corriendo — ver su README

## 1. Configurar variables de entorno

```bash
cp .env.example .env
```

Por defecto:

```
VITE_API_URL=http://localhost:3000
```

Tiene que apuntar a donde esté corriendo `logistic-app-be`.

## 2. Instalar dependencias

```bash
npm install
```

## 3. Levantar el frontend

```bash
npm run dev
```

Queda disponible en `http://localhost:5173`.

## Pantallas y roles

| Pantalla | Ruta | Quién la ve |
|---|---|---|
| Resumen | `/` | Todos. Para admins incluye un gráfico de pedidos entregados vs cancelados por mes. |
| Pedidos (lista) | `/pedidos` | Todos |
| Nuevo pedido / editar | `/pedidos/nuevo`, `/pedidos/:id/editar` | Todos (un pedido `entregado` no se puede editar) |
| Rutas | `/rutas` | Todos |
| Reporte | `/reporte` | Solo admin |
| Usuarios | `/usuarios` | Solo admin |
| Perfil (cambiar mi contraseña) | `/perfil` | Todos |
| Tracking público | `/tracking` | Público, sin login (se accede desde un link en Pedidos, abre en pestaña nueva) |
| Aviso de privacidad | `/privacidad` | Público, sin login |

## Cómo probar el flujo completo

1. Entrar a `http://localhost:5173` y hacer login. El seed del backend crea dos usuarios: `admin@logistic.com` / `password123` (rol admin) y `operador@logistic.com` / `password123` (rol logística) — probar con ambos para ver la diferencia de menú (Usuarios/Reporte solo aparecen para admin).
2. En Pedidos, crear un pedido (con o sin marcar un punto en el mapa — ambos casos funcionan), filtrar por tracking/localidad/estado, y cambiar su estado con el dropdown (solo ofrece transiciones válidas: no se puede volver atrás desde "Entregado" o "Cancelado").
3. En Rutas, usar el panel "Días con pedidos pendientes" (navegación semana anterior/siguiente) para saltar directo a un día con pedidos cargados, y generar las rutas del día: si hay pedidos en zonas geográficas distintas, se genera una ruta óptima por zona (no una sola ruta mezclando toda la ciudad).
4. Como admin, entrar a Usuarios: crear un usuario, cambiarle el rol, resetearle la contraseña, desactivarlo (pide confirmación) y confirmar que ese usuario ya no puede loguearse.
5. Como admin, entrar a Reporte: filtrar por año/mes, e imprimir/exportar a PDF con el botón correspondiente.
6. Buscar el código de tracking de un pedido en la página pública (link desde Pedidos, abre en pestaña nueva), sin necesidad de login.

## Testing end-to-end (Playwright)

```bash
npm run test:e2e
```

La primera vez descarga un Chromium propio del proyecto (`.local-browsers/`, vía `scripts/ensure-browser.mjs`) para no depender de un navegador ya instalado en la máquina.

Esta suite levanta su **propia** instancia del backend contra una base de datos separada (`logistic_db_test`) y la resetea en cada corrida — no requiere tener el backend de desarrollo corriendo en paralelo, pero sí requiere el mismo rol de PostgreSQL (`logistic_app`) que usa `logistic-app-be` (ver su README, paso 1). Corre con `workers: 1` a propósito: los pedidos no están aislados por test y todos los specs comparten la misma base, así que se ejecutan en serie para no pisarse entre sí.

5 tests: flujo completo de Pedidos/Rutas/Tracking, login (redirección y error), y dos chequeos de responsive (la grilla de pedidos no desborda la pantalla en tablet, el sidebar se mantiene fijo al scrollear una página larga en desktop). Las pantallas de Usuarios, Perfil, Reporte y el gráfico del Resumen no tienen cobertura e2e todavía, solo tests manuales.
