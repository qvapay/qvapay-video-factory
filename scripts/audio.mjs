// Prepara el audio de un video y escribe su timing.json.
//
//   npm run audio <video>                 borrador de voz con la voz del sistema (gratis)
//   npm run audio <video> -- --voice Mónica
//   npm run audio <video> -- --keep       no regenera la voz: usa los archivos que ya estén
//
// Voz: lee src/videos/<video>/voice.json ({ escena: "texto" }) y deja un archivo por escena en
// public/audio/<video>/vo-<escena>.wav. Para una voz profesional, sustituye esos archivos por
// los de un locutor o un servicio de voz (mismo nombre) y corre con --keep: solo se miden.
//
// Música: si existe public/music/<video>.mp3 se usa esa; si no, public/music/default.mp3.
// Sin ninguna de las dos, el video sale solo con voz.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../', import.meta.url))
const args = process.argv.slice(2)
const video = args.find(arg => !arg.startsWith('--'))
const flag = (name) => { const i = args.indexOf(`--${name}`); return i === -1 ? null : args[i + 1] ?? true }
if (!video) { console.error('Uso: npm run audio <video> [-- --voice Paulina] [-- --keep]'); process.exit(1) }

const dir = path.join(ROOT, 'src/videos', video)
const scriptFile = path.join(dir, 'voice.json')
if (!existsSync(scriptFile)) { console.error(`No existe ${scriptFile}`); process.exit(1) }

const voice = flag('voice') || 'Paulina'
const keep = Boolean(flag('keep'))
const lines = JSON.parse(readFileSync(scriptFile, 'utf8'))
const audioDir = path.join(ROOT, 'public/audio', video)
mkdirSync(audioDir, { recursive: true })

const seconds = (file) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' }).trim())

const timing = { voice: {}, music: null }
for (const [scene, text] of Object.entries(lines)) {
	if (!String(text ?? '').trim()) continue
	const file = path.join(audioDir, `vo-${scene}.wav`)
	if (!keep || !existsSync(file)) {
		// La voz del sistema es un BORRADOR para medir tiempos y probar el montaje
		execFileSync('say', ['-v', voice, '-o', file, '--data-format=LEI16@44100', String(text)])
	}
	timing.voice[scene] = { file: `audio/${video}/vo-${scene}.wav`, seconds: Number(seconds(file).toFixed(2)) }
	console.log(`${scene.padEnd(10)} ${timing.voice[scene].seconds.toFixed(2)} s`)
}

for (const candidate of [`music/${video}.mp3`, 'music/default.mp3']) {
	if (existsSync(path.join(ROOT, 'public', candidate))) { timing.music = candidate; break }
}
console.log(timing.music ? `música: ${timing.music}` : 'sin música: deja un mp3 en public/music/')

writeFileSync(path.join(dir, 'timing.json'), `${JSON.stringify(timing, null, '\t')}\n`)
