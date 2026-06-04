import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(currentDir, '../..')
const backendRoot = path.resolve(frontendRoot, '../logistic-app-be')

const nodeExecutable = process.execPath
const tsNodeCliPath = path.resolve(backendRoot, 'node_modules/ts-node/dist/bin.js')
const migrationScriptPath = path.resolve(backendRoot, 'src/scripts/run-migrations.ts')
const serverScriptPath = path.resolve(backendRoot, 'src/index.ts')
const composeFilePath =
  process.platform === 'win32'
    ? path.resolve(backendRoot, 'docker-compose.test.yml')
    : path.resolve('/mnt/c/Users/agust/OneDrive/Escritorio/DAW/TpCatedra/logistic-app-be/docker-compose.test.yml')

const dockerExecutable =
  process.platform === 'win32'
    ? 'C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe'
    : '/mnt/c/Program Files/Docker/Docker/resources/bin/docker.exe'

if (!existsSync(dockerExecutable)) {
  throw new Error(`No se encontrÃ³ Docker Desktop en ${dockerExecutable}`)
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function dockerComposeUp() {
  const result = spawnSync(dockerExecutable, ['compose', '-f', composeFilePath, 'up', '-d'], {
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

async function waitForDatabase() {
  for (let attempt = 1; attempt <= 60; attempt += 1) {
    const result = spawnSync(dockerExecutable, ['exec', 'logistic-app-be-test-db', 'pg_isready', '-U', 'postgres'], {
      stdio: 'ignore',
    })

    if (result.status === 0) {
      return
    }

    await wait(1000)
  }

  throw new Error('PostgreSQL no quedÃ³ listo para los tests E2E')
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

dockerComposeUp()
await waitForDatabase()
await runMigrationsWithRetry()

const child = spawn(nodeExecutable, [tsNodeCliPath, serverScriptPath], {
  cwd: backendRoot,
  stdio: 'inherit',
  env: process.env,
})

child.on('exit', (code) => {
  process.exit(code ?? 0)
})
