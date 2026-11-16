// Prepara el audio de un video y escribe su timing.json.
//
//   npm run audio <video>                              borrador con la voz del sistema (gratis)
//   npm run audio <video> -- --voice Mónica            otra voz del sistema
//   npm run audio <video> -- --keep                    no genera nada: mide los archivos que ya estén
//   npm run audio <video> -- --provider elevenlabs     voz natural (DE PAGO: se pregunta antes)
//   npm run audio <video> -- --provider elevenlabs --dry    solo dice qué generaría y cuántos caracteres
//   npm run audio -- --voices                          lista las voces de la cuenta de ElevenLabs
//   npm run audio <video> -- --try <id>,<id> [--scene hook]   la misma frase con varias voces, en out/voces/
//
// Voz: lee src/videos/<video>/voice.json ({ escena: "texto" }) y deja un archivo por escena en
// public/audio/<video>/vo-<escena>.wav. La voz y sus ajustes salen de voice.config.json, para
// que todos los videos suenen igual. La clave va en .env (ELEVENLABS_API_KEY=).
//
// Una frase solo se vuelve a generar si cambió su texto, la voz o los ajustes (se guarda una
// huella por escena en timing.json). --force lo regenera todo.
//
// Para la voz de un locutor, sustituye los archivos (mismo nombre) y corre con --keep.
//
// Música: si existe public/music/<video>.mp3 se usa esa; si no, public/music/default.mp3.
// Sin ninguna de las dos, el video sale solo con voz.
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../', import.meta.url))
const fail = (message) => { console.error(message); process.exit(1) }
const readJson = (file, fallback) => existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : fallback

const VALUE_FLAGS = new Set(['voice', 'provider', 'try', 'scene'])
const flags = {}
const names = []
const args = process.argv.slice(2)
for (let i = 0; i < args.length; i++) {
	if (!args[i].startsWith('--')) { names.push(args[i]); continue }
	const name = args[i].slice(2)
	flags[name] = VALUE_FLAGS.has(name) ? args[++i] : true
}
for (const name of VALUE_FLAGS) if (name in flags && !flags[name]) fail(`A --${name} le falta su valor`)

const config = readJson(path.join(ROOT, 'voice.config.json'), {})
const eleven = { model: 'eleven_multilingual_v2', settings: {}, ...config.elevenlabs }

// --- ElevenLabs ---------------------------------------------------------------------------
const elevenFetch = async (pathname, init = {}) => {
	try { process.loadEnvFile(path.join(ROOT, '.env')) } catch { /* sin .env: vale la variable de entorno */ }
	const key = process.env.ELEVENLABS_API_KEY
	if (!key) fail('Falta la clave: pon ELEVENLABS_API_KEY=... en .env (una clave propia de este proyecto)')
	const response = await fetch(`https://api.elevenlabs.io/v1${pathname}`, { ...init, headers: { 'xi-api-key': key, ...init.headers } })
	if (!response.ok) fail(`ElevenLabs respondió ${response.status}: ${(await response.text()).slice(0, 400)}`)
	return response
}

// Pide mp3 (el formato que dan todos los planes) y lo deja en el formato de `file`
const elevenSpeak = async (text, voiceId, file) => {
	const response = await elevenFetch(`/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ text, model_id: eleven.model, voice_settings: eleven.settings }),
	})
	const mp3 = Buffer.from(await response.arrayBuffer())
	if (file.endsWith('.mp3')) writeFileSync(file, mp3)
	else execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', 'pipe:0', '-ar', '44100', '-ac', '1', file], { input: mp3 })
}

if (flags.voices) {
	const { voices } = await (await elevenFetch('/voices')).json()
	for (const voice of voices) {
		const labels = [voice.labels?.gender, voice.labels?.language, voice.labels?.accent, voice.category].filter(Boolean).join(', ')
		console.log(`${voice.voice_id}  ${voice.name.padEnd(28)} ${labels}`)
	}
	console.log('\nLas voces de la biblioteca hay que añadirlas a la cuenta para que salgan aquí.')
	process.exit(0)
}

// --- El video -----------------------------------------------------------------------------
const video = names[0]
if (!video) fail('Uso: npm run audio <video> [-- --provider elevenlabs] [-- --keep] (más opciones al inicio de scripts/audio.mjs)')
const dir = path.join(ROOT, 'src/videos', video)
const scriptFile = path.join(dir, 'voice.json')
if (!existsSync(scriptFile)) fail(`No existe ${scriptFile}`)
const lines = Object.entries(JSON.parse(readFileSync(scriptFile, 'utf8')))
	.map(([scene, text]) => [scene, String(text ?? '').trim()])
	.filter(([, text]) => text)

if (flags.try) {
	const [scene, text] = lines.find(([id]) => id === flags.scene) ?? (flags.scene ? fail(`No hay escena «${flags.scene}» en voice.json`) : lines[0])
	const ids = flags.try.split(',').map(id => id.trim()).filter(Boolean)
	console.log(`Prueba de oído: «${text}»\n${ids.length} voces × ${text.length} caracteres = ${ids.length * text.length} caracteres`)
	if (flags.dry) process.exit(0)
	const outDir = path.join(ROOT, 'out/voces')
	mkdirSync(outDir, { recursive: true })
	for (const id of ids) {
		const file = path.join(outDir, `${video}-${scene}-${id}.mp3`)
		await elevenSpeak(text, id, file)
		console.log(`listo: ${path.relative(ROOT, file)}`)
	}
	process.exit(0)
}

const provider = flags.provider ?? 'system'
if (!['system', 'elevenlabs'].includes(provider)) fail(`Proveedor desconocido: ${provider} (system o elevenlabs)`)
const systemVoice = flags.voice ?? config.system?.voice ?? 'Paulina'
if (provider === 'elevenlabs' && !eleven.voiceId) fail('Falta la voz: pon su id en voice.config.json (elevenlabs.voiceId). `npm run audio -- --voices` las lista.')

// Huella de lo que produce el audio de una frase: si no cambia, no se vuelve a generar
const recipe = provider === 'elevenlabs' ? [provider, eleven.voiceId, eleven.model, eleven.settings] : [provider, systemVoice]
const hashOf = (text) => createHash('sha256').update(JSON.stringify([...recipe, text])).digest('hex').slice(0, 16)

const audioDir = path.join(ROOT, 'public/audio', video)
mkdirSync(audioDir, { recursive: true })
const timingFile = path.join(dir, 'timing.json')
const previous = readJson(timingFile, {}).voice ?? {}
const wav = (scene) => path.join(audioDir, `vo-${scene}.wav`)

const pending = flags.keep ? [] : lines.filter(([scene, text]) => flags.force || !existsSync(wav(scene)) || previous[scene]?.hash !== hashOf(text))
if (flags.keep) for (const [scene] of lines) if (!existsSync(wav(scene))) fail(`--keep: falta ${path.relative(ROOT, wav(scene))}`)

// El borrador gratis no pisa una voz que costó dinero
const paid = pending.filter(([scene]) => provider === 'system' && existsSync(wav(scene)) && (previous[scene]?.provider ?? 'system') !== 'system')
if (paid.length && !flags.force) fail(`Estas frases ya tienen voz de ${previous[paid[0][0]].provider}: ${paid.map(([scene]) => scene).join(', ')}.\nPara regenerar solo lo que cambió: --provider ${previous[paid[0][0]].provider}. Para pisarlas con el borrador: --force.`)

if (provider === 'elevenlabs') {
	const characters = pending.reduce((sum, [, text]) => sum + text.length, 0)
	console.log(`ElevenLabs: ${pending.length} de ${lines.length} frases por generar, ${characters} caracteres${pending.length ? ` (${pending.map(([scene]) => scene).join(', ')})` : ''}`)
	if (flags.dry) process.exit(0)
}

const seconds = (file) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' }).trim())

const timing = { voice: {}, music: null }
for (const candidate of [`music/${video}.mp3`, 'music/default.mp3']) {
	if (existsSync(path.join(ROOT, 'public', candidate))) { timing.music = candidate; break }
}
// De entrada, lo que ya había: si una llamada falla a medias, lo ya generado queda anotado
for (const [scene] of lines) if (previous[scene] && existsSync(wav(scene))) timing.voice[scene] = previous[scene]
const save = () => writeFileSync(timingFile, `${JSON.stringify(timing, null, '\t')}\n`)

const todo = new Set(pending.map(([scene]) => scene))
for (const [scene, text] of lines) {
	const file = wav(scene)
	let record = { provider: previous[scene]?.provider, hash: previous[scene]?.hash }
	if (todo.has(scene)) {
		if (provider === 'elevenlabs') await elevenSpeak(text, eleven.voiceId, file)
		// La voz del sistema es un BORRADOR para medir tiempos y probar el montaje
		else execFileSync('say', ['-v', systemVoice, '-o', file, '--data-format=LEI16@44100', text])
		record = { provider, hash: hashOf(text) }
	}
	timing.voice[scene] = { file: `audio/${video}/vo-${scene}.wav`, seconds: Number(seconds(file).toFixed(2)), ...record }
	save()
	console.log(`${scene.padEnd(10)} ${timing.voice[scene].seconds.toFixed(2)} s${todo.has(scene) ? '  (nueva)' : ''}`)
}
save()
console.log(timing.music ? `música: ${timing.music}` : 'sin música: deja un mp3 en public/music/')
