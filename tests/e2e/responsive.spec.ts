import { expect, test } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

async function waitForApiReady(request: APIRequestContext) {
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      const response = await request.get('http://127.0.0.1:3100/api/health')

      if (response.ok()) {
        return
      }
    } catch {
      // The backend can still be finalizing startup when the frontend is already reachable.
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  throw new Error('La API de backend no quedó disponible para la suite E2E')
}

test('the "Gestión de pedidos" screen does not overflow horizontally on tablet, only the table scrolls', async ({
  page,
  request,
}) => {
  const email = `tablet.${Date.now()}@test.com`

  await waitForApiReady(request)

  await request.post('http://127.0.0.1:3100/api/auth/register', {
    data: { email, password: 'password123' },
  })

  await page.setViewportSize({ width: 820, height: 1180 })

  await page.goto('/login')
  await page.getByTestId('login-email').fill(email)
  await page.getByTestId('login-password').fill('password123')
  await page.getByTestId('login-submit').click()
  await expect(page).toHaveURL(/\/$/)

  await page.goto('/pedidos/nuevo')
  await page.getByTestId('pedido-direccion').fill('Avenida Presidente Roque Sáenz Peña 1234, piso 8')
  await page.getByTestId('pedido-localidad').fill('San Isidro, Buenos Aires')
  await page.getByTestId('pedido-fecha').fill('2026-06-05')
  await page.getByTestId('pedido-submit').click()
  await expect(page).toHaveURL(/\/pedidos$/)
  // No se asume una cantidad exacta: la base de test es compartida entre
  // specs dentro de la misma corrida (solo se resetea una vez en globalSetup).
  await expect(page.getByTestId('pedido-card').first()).toBeVisible()

  const viewportWidth = 820

  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
  expect(scrollWidth).toBeLessThanOrEqual(viewportWidth)

  await expect(page.getByRole('link', { name: 'Tracking público' })).toBeInViewport()
  await expect(page.getByRole('button', { name: 'Nuevo pedido' })).toBeInViewport()
  await expect(page.getByTestId('filter-tracking')).toBeInViewport()
  await expect(page.getByTestId('filter-localidad')).toBeInViewport()

  const table = page.getByTestId('pedido-card').first().locator('xpath=ancestor::table')
  const tableWrapOverflows = await table.evaluate((el) => {
    const wrapper = el.parentElement as HTMLElement
    return wrapper.scrollWidth > wrapper.clientWidth
  })
  expect(tableWrapOverflows).toBe(true)
})

test('the sidebar stays pinned to the top when scrolling a long page on desktop', async ({ page, request }) => {
  const email = `sidebar.${Date.now()}@test.com`

  await waitForApiReady(request)

  await request.post('http://127.0.0.1:3100/api/auth/register', {
    data: { email, password: 'password123' },
  })

  await page.setViewportSize({ width: 1280, height: 800 })

  await page.goto('/login')
  await page.getByTestId('login-email').fill(email)
  await page.getByTestId('login-password').fill('password123')
  await page.getByTestId('login-submit').click()
  await expect(page).toHaveURL(/\/$/)

  await page.goto('/pedidos')

  // Fuerza una página larga (más alta que el viewport) para poder scrollear,
  // sin depender de tener que cargar decenas de pedidos reales.
  await page.locator('main').evaluate((el) => {
    const spacer = document.createElement('div')
    spacer.style.height = '3000px'
    el.appendChild(spacer)
  })

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

  const sidebarBox = await page.locator('aside').boundingBox()
  expect(sidebarBox).not.toBeNull()
  expect(sidebarBox!.y).toBeGreaterThanOrEqual(-1)
  expect(sidebarBox!.y).toBeLessThanOrEqual(1)
})
