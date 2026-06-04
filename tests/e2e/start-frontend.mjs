import { existsSync } from 'node:fs'
import { spawn, spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(currentDir, '../..')
const nodeExecutableDir = path.dirname(process.execPath)

function ensureWindowsRolldownBinding() {
  if (process.platform !== 'win32') {
    return
  }

  const bindingPath = path.resolve(
    frontendRoot,
    'node_modules/@rolldown/binding-win32-x64-msvc'
  )

  if (existsSync(bindingPath)) {
    return
  }

  const npmCliPath = path.resolve(nodeExecutableDir, 'node_modules/npm/bin/npm-cli.js')

  if (!existsSync(npmCliPath)) {
    throw new Error('No se encontrÃ³ npm-cli.js para reinstalar los bindings de Windows')
  }

  const install = spawnSync(process.execPath, [npmCliPath, 'install'], {
    cwd: frontendRoot,
    stdio: 'inherit',
    env: process.env,
  })

  if (install.status !== 0) {
    process.exit(install.status ?? 1)
  }
}

ensureWindowsRolldownBinding()

const child = spawn(process.execPath, [path.resolve(frontendRoot, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', '4173'], {
  cwd: frontendRoot,
  stdio: 'inherit',
  env: process.env,
})

child.on('exit', (code) => {
  process.exit(code ?? 0)
})
