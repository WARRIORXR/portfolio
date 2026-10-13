#!/usr/bin/env node
// Creates backend/py-service/.venv and installs its requirements.
// Run with: `npm run setup:py`

import { spawnSync } from 'node:child_process'
import { existsSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const serviceDir = join(root, 'backend', 'py-service')
const requirements = join(serviceDir, 'requirements.txt')
const venvDir = join(serviceDir, '.venv')
const venvPython = join(
  venvDir,
  process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python'
)

function run(command, args, options = {}) {
  console.log(`\n$ ${command} ${args.join(' ')}`)
  const result = spawnSync(command, args, { stdio: 'inherit', ...options })
  if (result.error) {
    console.error(`Failed to run ${command}: ${result.error.message}`)
    process.exit(1)
  }
  if (result.status !== 0) process.exit(result.status ?? 1)
}

/** Candidate interpreters, most specific first. */
function findPython() {
  const candidates =
    process.platform === 'win32'
      ? [['py', ['-3']], ['python', []]]
      : [['python3', []], ['python', []]]

  for (const [command, args] of candidates) {
    const probe = spawnSync(command, [...args, '--version'], { stdio: 'ignore' })
    if (!probe.error && probe.status === 0) return [command, args]
  }

  console.error('No Python interpreter found (looked for py, python3, python).')
  process.exit(1)
}

if (!existsSync(venvPython)) {
  const [command, args] = findPython()
  run(command, [...args, '-m', 'venv', venvDir])
} else {
  console.log(`Reusing existing virtual environment at ${venvDir}`)
}

run(venvPython, ['-m', 'pip', 'install', '--upgrade', 'pip', '--quiet'])
run(venvPython, ['-m', 'pip', 'install', '-r', requirements])

// Keep the directory the dry-run contact store writes into.
const dataDir = join(serviceDir, 'data')
if (!existsSync(dataDir)) {
  writeFileSync(join(dataDir, '.gitkeep'), '')
}

console.log('\nPython service ready. Start it with:  npm run dev:py')
