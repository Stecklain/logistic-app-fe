import { execFileSync } from 'node:child_process'
import { resolveBackendRoot, resolveNodeExecutable } from './runtime'

export default async function globalTeardown() {
  execFileSync(
    resolveNodeExecutable(),
    ['./scripts/manage-database.mjs', 'drop', 'test'],
    { cwd: resolveBackendRoot(), stdio: 'inherit' }
  )
}
