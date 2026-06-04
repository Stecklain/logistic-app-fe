import { existsSync } from 'node:fs'
import { mkdir, chmod, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(currentDir, '..')
const browserRoot = path.resolve(projectRoot, '.local-browsers')

const platformConfig = {
  linux: {
    platform: 'linux64',
    executable: path.join(browserRoot, 'chrome-linux64', 'chrome'),
  },
  win32: {
    platform: 'win64',
    executable: path.join(browserRoot, 'chrome-win64', 'chrome.exe'),
  },
}

const activeConfig = platformConfig[process.platform]

if (!activeConfig) {
  process.exit(0)
}

if (existsSync(activeConfig.executable)) {
  process.exit(0)
}

await mkdir(browserRoot, { recursive: true })

const metadataResponse = await fetch(
  'https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json',
)

if (!metadataResponse.ok) {
  throw new Error(`No se pudo consultar Chrome for Testing: ${metadataResponse.status}`)
}

const metadata = await metadataResponse.json()
const downloads = metadata.channels?.Stable?.downloads?.chrome ?? []
const selectedDownload = downloads.find((entry) => entry.platform === activeConfig.platform)

if (!selectedDownload?.url) {
  throw new Error(`No hay descarga disponible para la plataforma ${activeConfig.platform}`)
}

const archivePath = path.join(browserRoot, `${activeConfig.platform}.zip`)
const archiveResponse = await fetch(selectedDownload.url)

if (!archiveResponse.ok || !archiveResponse.body) {
  throw new Error(`No se pudo descargar Chrome for Testing: ${archiveResponse.status}`)
}

await writeFile(archivePath, Buffer.from(await archiveResponse.arrayBuffer()))

if (process.platform === 'linux') {
  const extraction = spawnSync(
    'python3',
    [
      '-c',
      'import sys, zipfile; zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])',
      archivePath,
      browserRoot,
    ],
    { stdio: 'inherit' },
  )

  if (extraction.status !== 0) {
    throw new Error('No se pudo extraer Chrome for Testing en Linux')
  }

  await chmod(activeConfig.executable, 0o755)
} else if (process.platform === 'win32') {
  const extraction = spawnSync(
    'powershell',
    ['-NoProfile', '-Command', `Expand-Archive -LiteralPath '${archivePath}' -DestinationPath '${browserRoot}' -Force`],
    { stdio: 'inherit' },
  )

  if (extraction.status !== 0) {
    throw new Error('No se pudo extraer Chrome for Testing en Windows')
  }
}

await unlink(archivePath)
