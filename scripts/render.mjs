// Saca un video en todos sus formatos.
//
//   npm run video <video>               con sonido (si hay voz o música preparadas)
//   npm run video <video> -- --mute     además, una versión sin sonido de cada formato
//   npm run video <video> -- --only story
import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../', import.meta.url))
// Los mismos formatos que FORMATS en src/kit.jsx
const FORMATS = { feed: 'feed-4x3', story: 'story-9x16' }

const args = process.argv.slice(2)
const video = args.find(arg => !arg.startsWith('--'))
if (!video) { console.error('Uso: npm run video <video> [-- --mute] [-- --only feed|story]'); process.exit(1) }
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null
const alsoMute = args.includes('--mute')

mkdirSync(path.join(ROOT, 'out'), { recursive: true })
const render = (format, mute) => {
	const out = path.join('out', `${video}-${FORMATS[format]}${mute ? '-sin-sonido' : ''}.mp4`)
	execFileSync('npx', ['remotion', 'render', 'src/index.jsx', `${video}-${format}`, out, '--log=error', `--props=${JSON.stringify({ mute })}`], { cwd: ROOT, stdio: 'inherit' })
	console.log(`listo: ${out}`)
}

for (const format of Object.keys(FORMATS)) {
	if (only && only !== format) continue
	render(format, false)
	if (alsoMute) render(format, true)
}
