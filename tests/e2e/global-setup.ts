import { execFileSync } from 'node:child_process'
import net from 'node:net'
import { resolveBackendComposeFileForDocker, resolveDockerExecutable } from './runtime'

async function waitForDatabase(timeoutMs: number) {
  const start = Date.now()
  const dockerExecutable = resolveDockerExecutable()

  while (Date.now() - start < timeoutMs) {
    try {
      execFileSync(dockerExecutable, ['exec', 'logistic-app-be-test-db', 'pg_isready', '-U', 'postgres'], {
        stdio: 'ignore',
      })
      return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  throw new Error('PostgreSQL no quedÃ³ disponible dentro del timeout configurado')
}

async function waitForHostPort(port: number, host: string, timeoutMs: number) {
  const start = Date.now()

  while (Date.now() - start < timeoutMs) {
    const isOpen = await new Promise<boolean>((resolve) => {
      const socket = net.createConnection({ port, host })

      socket.once('connect', () => {
        socket.end()
        resolve(true)
      })

      socket.once('error', () => {
        resolve(false)
      })
    })

    if (isOpen) {
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  throw new Error(`El puerto ${host}:${port} no quedÃ³ accesible dentro del timeout configurado`)
}

export default async function globalSetup() {
  execFileSync(resolveDockerExecutable(), ['compose', '-f', resolveBackendComposeFileForDocker(), 'up', '-d'], {
    stdio: 'inherit',
  })

  await waitForDatabase(60000)
  await waitForHostPort(5433, '127.0.0.1', 60000)
}
