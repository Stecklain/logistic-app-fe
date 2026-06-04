import { execFileSync } from 'node:child_process'
import { resolveBackendComposeFileForDocker, resolveDockerExecutable } from './runtime'

export default async function globalTeardown() {
  execFileSync(resolveDockerExecutable(), ['compose', '-f', resolveBackendComposeFileForDocker(), 'down', '-v'], {
    stdio: 'inherit',
  })
}
