#!/usr/bin/env node
// Runs `cargo check` for the Rust gateway (backend/rust-api).
//
// On Windows, checking a crate with proc-macro/build-script dependencies
// requires a working host linker. When the default (MSVC) toolchain cannot link
// because the Windows SDK is missing, we retry with an installed GNU toolchain,
// which links through the MinGW tools that rustup ships. Pin a toolchain
// explicitly with RUST_TOOLCHAIN=... or `node scripts/check-api.mjs <toolchain>`.

import { spawnSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = join('backend', 'rust-api', 'Cargo.toml')
const args = ['check', '--manifest-path', manifest, '--all-targets']

const requested = process.argv[2] || process.env.RUST_TOOLCHAIN || null

function run(toolchain) {
  const command = 'cargo'
  const commandArgs = toolchain ? [`+${toolchain}`, ...args] : args
  const label = toolchain ? `cargo +${toolchain}` : 'cargo'
  console.log(`\n$ ${label} ${args.join(' ')}`)

  const result = spawnSync(command, commandArgs, { cwd: root, encoding: 'utf8' })
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
  process.stdout.write(output.slice(-4000))
  return { ok: result.status === 0, output }
}

function installedToolchains() {
  const result = spawnSync('rustup', ['toolchain', 'list'], { encoding: 'utf8' })
  if (result.status !== 0) return []
  return (result.stdout ?? '')
    .split('\n')
    .map((line) => line.split(/\s+/)[0])
    .filter(Boolean)
}

const first = run(requested)
if (first.ok) {
  console.log('\nRust gateway check passed.')
  process.exit(0)
}

if (requested) process.exit(1)

const linkerProblem = /link\.exe|dlltool|kernel32\.lib|C\+\+ build tools/i.test(first.output)
const gnuToolchain = installedToolchains().find((name) => name.includes('windows-gnu'))

if (!linkerProblem || !gnuToolchain) {
  console.error('\nRust gateway check failed. See backend/README.md ("Toolchain notes").')
  process.exit(1)
}

console.warn(
  `\nDefault toolchain could not link (Windows SDK / dlltool missing here).` +
    `\nRetrying with ${gnuToolchain}…`
)

const second = run(gnuToolchain)
if (second.ok) {
  console.log(`\nRust gateway check passed with ${gnuToolchain}.`)
  process.exit(0)
}

console.error('\nRust gateway check failed on both toolchains. See backend/README.md.')
process.exit(1)
