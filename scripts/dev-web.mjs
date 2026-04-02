/**
 * Starts Vite from apps/web without forwarding stray CLI args (e.g. `npm run dev api`).
 */
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const web = path.join(root, 'apps', 'web')
const viteJs = path.join(web, 'node_modules', 'vite', 'bin', 'vite.js')

if (!fs.existsSync(viteJs)) {
  console.error('Vite not found. Run: npm install --prefix apps/web')
  process.exit(1)
}

const child = spawn(process.execPath, [viteJs], { cwd: web, stdio: 'inherit' })
child.on('exit', (code, signal) => {
  if (signal) process.exit(1)
  process.exit(code ?? 0)
})
child.on('error', (err) => {
  console.error(err)
  process.exit(1)
})
