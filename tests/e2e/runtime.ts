import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function localBrowserCandidates(subpath: string) {
  const currentDir = path.dirname(fileURLToPath(import.meta.url))
  return path.resolve(currentDir, '../..', '.local-browsers', subpath)
}

const WINDOWS_BROWSER_CANDIDATES = [
  localBrowserCandidates('chrome-win64/chrome.exe'),
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
]

const WSL_BROWSER_CANDIDATES = [
  localBrowserCandidates('chrome-linux64/chrome'),
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

export function resolveBrowserExecutable() {
  if (process.platform === 'win32') {
    return resolveExistingPath(WINDOWS_BROWSER_CANDIDATES)
  }

  return resolveExistingPath(WSL_BROWSER_CANDIDATES)
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

export function buildFrontendServerCommand() {
  const nodePath = shellQuote(resolveNodeExecutable())
  const bootstrapScriptPath = shellQuote(path.resolve(resolveFrontendRoot(), 'tests/e2e/start-stack.mjs'))

  return `${nodePath} ${bootstrapScriptPath}`
}
