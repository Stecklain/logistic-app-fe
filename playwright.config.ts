import { defineConfig } from '@playwright/test'
import { buildFrontendServerCommand, resolveBrowserExecutable } from './tests/e2e/runtime'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
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
    reuseExistingServer: true,
    env: {
      PORT: '3100',
      NODE_ENV: 'test',
      JWT_SECRET: 'test-secret',
      JWT_EXPIRES_IN: '8h',
      ORS_USE_MOCK: 'true',
      DB_HOST: 'localhost',
      DB_PORT: '5433',
      DB_NAME: 'logistic_db_test',
      DB_USER: 'postgres',
      DB_PASSWORD: 'postgres',
      CORS_ORIGIN: 'http://127.0.0.1:4173,http://localhost:4173,http://127.0.0.1:5173,http://localhost:5173',
      VITE_API_URL: 'http://127.0.0.1:3100',
    },
  },
})
