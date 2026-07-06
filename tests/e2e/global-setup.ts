import { execFileSync } from 'node:child_process'
import net from 'node:net'
import { resolveBackendRoot, resolveNodeExecutable } from './runtime'

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

  throw new Error(`El puerto ${host}:${port} no quedó accesible dentro del timeout configurado`)
}

export default async function globalSetup() {
  await waitForHostPort(5432, '127.0.0.1', 15000)

  // El reset destructivo de la base de test vive en start-backend.mjs, que
  // corre antes que este hook. Acá solo garantizamos (de forma idempotente,
  // sin destruir nada) que la base exista por si este hook llegara a
  // ejecutarse primero en algún escenario.
  execFileSync(
    resolveNodeExecutable(),
    ['./scripts/manage-database.mjs', 'create', 'test'],
    { cwd: resolveBackendRoot(), stdio: 'inherit' }
  )
}
