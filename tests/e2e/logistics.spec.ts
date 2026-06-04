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

  throw new Error('La API de backend no quedÃ³ disponible para la suite E2E')
}

test('creates orders, generates route, updates state and checks public tracking', async ({ page, request }) => {
  const email = `admin.${Date.now()}@test.com`

  await waitForApiReady(request)

  await request.post('http://127.0.0.1:3100/api/auth/register', {
    data: {
      email,
      password: 'password123',
    },
  })

  await page.goto('/login')
  await page.getByTestId('login-email').fill(email)
  await page.getByTestId('login-password').fill('password123')
  await page.getByTestId('login-submit').click()

  await expect(page).toHaveURL(/\/$/)

  await page.goto('/pedidos')

  await page.getByTestId('pedido-direccion').fill('Av. Santa Fe 1111')
  await page.getByTestId('pedido-localidad').fill('Buenos Aires')
  await page.getByTestId('pedido-fecha').fill('2026-06-05')
  await page.getByTestId('pedido-submit').click()
  await expect(page.getByTestId('pedido-card')).toHaveCount(1)

  await page.getByTestId('pedido-direccion').fill('Av. Corrientes 2222')
  await page.getByTestId('pedido-localidad').fill('Buenos Aires')
  await page.getByTestId('pedido-fecha').fill('2026-06-05')
  await page.getByTestId('pedido-submit').click()
  await expect(page.getByTestId('pedido-card')).toHaveCount(2)

  const firstCard = page.getByTestId('pedido-card').first()
  await expect(firstCard).toBeVisible()
  const trackingText = await firstCard.locator('p').first().textContent()
  const trackingCode = trackingText?.trim() || ''

  await firstCard.getByRole('button', { name: /marcar entregado/i }).click()
  await expect(firstCard.getByRole('button', { name: /reabrir/i })).toBeVisible()

  await page.goto('/rutas')
  await page.getByTestId('ruta-fecha').fill('2026-06-05')
  await page.getByTestId('ruta-origen').fill('Deposito central')
  await page.getByTestId('generate-route').click()

  await expect(page.getByTestId('route-list-item').first()).toBeVisible()
  await expect(page.getByTestId('route-stop').first()).toBeVisible()

  await page.goto('/tracking')
  await page.getByTestId('tracking-code-input').fill(trackingCode)
  await page.getByTestId('tracking-submit').click()

  await expect(page.getByTestId('tracking-result')).toBeVisible()
})
