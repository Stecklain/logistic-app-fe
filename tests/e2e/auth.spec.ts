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

test('redirects unauthenticated users to login', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/login$/)
})

test('shows login error with invalid credentials', async ({ page, request }) => {
  await waitForApiReady(request)

  await page.goto('/login')
  await page.getByTestId('login-email').fill('noexiste@test.com')
  await page.getByTestId('login-password').fill('bad-pass')
  await page.getByTestId('login-submit').click()

  await expect(page.getByTestId('login-error')).toHaveText(/credenciales/i)
})
