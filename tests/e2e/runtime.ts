import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const WINDOWS_DOCKER_PATH = 'C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe'
const WSL_DOCKER_PATH = '/mnt/c/Program Files/Docker/Docker/resources/bin/docker.exe'

const WINDOWS_BROWSER_CANDIDATES = [
  'C:\\Users\\agust\\OneDrive\\Escritorio\\DAW\\TpCatedra\\logistic-app-fe\\.local-browsers\\chrome-win64\\chrome.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
]

const WSL_BROWSER_CANDIDATES = [
  '/mnt/c/Users/agust/OneDrive/Escritorio/DAW/TpCatedra/logistic-app-fe/.local-browsers/chrome-linux64/chrome',
  '/mnt/c/Program Files/Google/Chrome/Application/chrome.exe',
  '/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
]

function resolveExistingPath(candidates: string[]) {
  const match = candidates.find((candidate) => existsSync(candidate))

  if (!match) {
    throw new Error(`No se encontrÃ³ un ejecutable compatible. Paths revisados: ${candidates.join(', ')}`)
  }

  return match
}

function shellQuote(value: string) {
  return `"${value}"`
}

export function resolveDockerExecutable() {
  if (process.platform === 'win32') {
    return resolveExistingPath([WINDOWS_DOCKER_PATH])
  }

  return resolveExistingPath([WSL_DOCKER_PATH])
}

export function resolveBrowserExecutable() {
  if (process.platform === 'win32') {
    return resolveExistingPath(WINDOWS_BROWSER_CANDIDATES)
  }

  return resolveExistingPath(WSL_BROWSER_CANDIDATES)
}

export function resolveBackendComposeFile() {
  const currentDir = path.dirname(fileURLToPath(import.meta.url))
  return path.resolve(currentDir, '../../../logistic-app-be/docker-compose.test.yml')
}

export function resolveFrontendRoot() {
  const currentDir = path.dirname(fileURLToPath(import.meta.url))
  return path.resolve(currentDir, '../..')
}

export function resolveBackendRoot() {
  const currentDir = path.dirname(fileURLToPath(import.meta.url))
  return path.resolve(currentDir, '../../../logistic-app-be')
}

export function resolveNodeExecutable() {
  return process.execPath
}

export function resolveBackendComposeFileForDocker() {
  const composePath = resolveBackendComposeFile()

  if (process.platform === 'win32') {
    return composePath
  }

  if (composePath.startsWith('/mnt/')) {
    const driveLetter = composePath[5]
    const rest = composePath.slice(6).replaceAll('/', '\\')
    return `${driveLetter.toUpperCase()}:\\${rest}`
  }

  return composePath
}

export function buildFrontendServerCommand() {
  const nodePath = shellQuote(resolveNodeExecutable())
  const bootstrapScriptPath = shellQuote(path.resolve(resolveFrontendRoot(), 'tests/e2e/start-stack.mjs'))

  return `${nodePath} ${bootstrapScriptPath}`
}
