import { defineConfig } from '@playwright/test'
import { buildFrontendServerCommand, resolveBrowserExecutable } from './tests/e2e/runtime'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  // Los pedidos son datos globales (no aislados por test/usuario) contra una
  // única base de test compartida por todos los specs. Correr más de un
  // archivo en paralelo hace que un spec vea pedidos creados por otro.
  workers: 1,
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    headless: true,
    trace: 'on-first-retry',
    launchOptions: {
      executablePath: resolveBrowserExecutable(),
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    },
  },
  webServer: {
    command: buildFrontendServerCommand(),
    cwd: '.',
    port: 4173,
    // globalSetup resetea la base de test en cada corrida, así que reutilizar
    // un servidor de una corrida anterior dejaría su conexión apuntando a una
    // base ya sin tablas. Siempre se levanta un proceso nuevo.
    reuseExistingServer: false,
    env: {
      PORT: '3100',
      NODE_ENV: 'test',
      JWT_SECRET: 'test-secret',
      JWT_EXPIRES_IN: '8h',
      ORS_USE_MOCK: 'true',
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_NAME: 'logistic_db_test',
      DB_USER: 'logistic_app',
      DB_PASSWORD: 'logistic_app',
      CORS_ORIGIN: 'http://127.0.0.1:4173,http://localhost:4173,http://127.0.0.1:5173,http://localhost:5173',
      VITE_API_URL: 'http://127.0.0.1:3100',
    },
  },
})
