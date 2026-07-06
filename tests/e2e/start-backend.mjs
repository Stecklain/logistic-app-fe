import { spawn, spawnSync } from 'node:child_process'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(currentDir, '../..')
const backendRoot = path.resolve(frontendRoot, '../logistic-app-be')

const nodeExecutable = process.execPath
const tsNodeCliPath = path.resolve(backendRoot, 'node_modules/ts-node/dist/bin.js')
const migrationScriptPath = path.resolve(backendRoot, 'src/scripts/run-migrations.ts')
const serverScriptPath = path.resolve(backendRoot, 'src/index.ts')

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForDatabase() {
  const host = process.env.DB_HOST || 'localhost'
  const port = parseInt(process.env.DB_PORT || '5432', 10)

  for (let attempt = 1; attempt <= 60; attempt += 1) {
    const isOpen = await new Promise((resolve) => {
      const socket = net.createConnection({ port, host })
      socket.once('connect', () => {
        socket.end()
        resolve(true)
      })
      socket.once('error', () => resolve(false))
    })

    if (isOpen) {
      return
    }

    await wait(1000)
  }

  throw new Error('PostgreSQL no quedó listo para los tests E2E')
}

function resetDatabase() {
  // Este script arranca antes que `globalSetup` en esta versión de Playwright,
  // así que el reset de la base de test tiene que hacerse acá (no ahí) para
  // garantizar una base limpia antes de migrar.
  const drop = spawnSync(nodeExecutable, ['./scripts/manage-database.mjs', 'drop', 'test'], {
    cwd: backendRoot,
    stdio: 'inherit',
    env: process.env,
  })

  if (drop.status !== 0) {
    process.exit(drop.status ?? 1)
  }

  const create = spawnSync(nodeExecutable, ['./scripts/manage-database.mjs', 'create', 'test'], {
    cwd: backendRoot,
    stdio: 'inherit',
    env: process.env,
  })

  if (create.status !== 0) {
    process.exit(create.status ?? 1)
  }
}

async function runMigrationsWithRetry() {
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    const result = spawnSync(nodeExecutable, [tsNodeCliPath, migrationScriptPath, '--env', 'test'], {
      cwd: backendRoot,
      stdio: 'inherit',
      env: process.env,
    })

    if (result.status === 0) {
      return
    }

    if (attempt === 30) {
      process.exit(result.status ?? 1)
    }

    await wait(2000)
  }
}

await waitForDatabase()
resetDatabase()
await runMigrationsWithRetry()

const child = spawn(nodeExecutable, [tsNodeCliPath, serverScriptPath], {
  cwd: backendRoot,
  stdio: 'inherit',
  env: process.env,
})

child.on('exit', (code) => {
  process.exit(code ?? 0)
})
