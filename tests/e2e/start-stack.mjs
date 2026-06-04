import { spawn } from 'node:child_process'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForPort(port, host, timeoutMs) {
  const start = Date.now()

  while (Date.now() - start < timeoutMs) {
    const isOpen = await new Promise((resolve) => {
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

    await wait(1000)
  }

  throw new Error(`El puerto ${host}:${port} no quedÃ³ disponible dentro del timeout esperado`)
}

const backend = spawn(process.execPath, [path.resolve(currentDir, './start-backend.mjs')], {
  stdio: 'inherit',
  env: process.env,
})

backend.on('exit', (code) => {
  process.exit(code ?? 0)
})

await waitForPort(3100, '127.0.0.1', 120000)

const frontend = spawn(process.execPath, [path.resolve(currentDir, './start-frontend.mjs')], {
  stdio: 'inherit',
  env: process.env,
})

frontend.on('exit', (code) => {
  process.exit(code ?? 0)
})
