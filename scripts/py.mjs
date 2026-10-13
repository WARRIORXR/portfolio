#!/usr/bin/env node
// Runs a command with the Python service's virtual-environment interpreter.
//
//   node scripts/py.mjs -m pytest
//   node scripts/py.mjs -m uvicorn app.main:app --port 8000 --reload
//
// Exposed through `npm run test:py` and `npm run dev:py`.

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const serviceDir = join(root, 'backend', 'py-service')
const venvPython = join(
  serviceDir,
  '.venv',
  process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python'
)

const args = process.argv.slice(2)
if (args.length === 0) {
  console.error('Usage: node scripts/py.mjs <python args...>')
  process.exit(2)
}

if (!existsSync(venvPython)) {
  console.error(`No virtual environment found at ${venvPython}`)
  console.error('Create it first:  npm run setup:py')
  process.exit(1)
}

const child = spawn(venvPython, args, { cwd: serviceDir, stdio: 'inherit' })

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal)
  else process.exit(code ?? 0)
})
