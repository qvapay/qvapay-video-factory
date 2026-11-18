// Genera una pista de música instrumental con ElevenLabs (DE PAGO: se pregunta antes).
//
//   npm run music <nombre> -- --prompt "electrónica suave y optimista" [--seconds 30]
//
// La deja en out/musica/<nombre>.mp3 para escucharla. La que se elija se copia a
// public/music/default.mp3 (todos los videos) o public/music/<video>.mp3 (solo ese), se anota
// en GUSTOS.md y se corre `npm run audio <video> -- --keep` para que el video la tome.
// La clave (.env) necesita el permiso Music Generation.
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../', import.meta.url))
const fail = (message) => { console.error(message); process.exit(1) }
const args = process.argv.slice(2)
const value = (name) => { const i = args.indexOf(`--${name}`); return i === -1 ? null : args[i + 1] }
const name = args[0]?.startsWith('--') ? null : args[0]
const prompt = value('prompt')
const seconds = Number(value('seconds') ?? 30)
if (!name || !prompt) fail('Uso: npm run music <nombre> -- --prompt "estilo de la pista" [--seconds 30]')
if (!(seconds >= 3 && seconds <= 600)) fail('--seconds va de 3 a 600')

try { process.loadEnvFile(path.join(ROOT, '.env')) } catch { /* sin .env: vale la variable de entorno */ }
const key = process.env.ELEVENLABS_API_KEY
if (!key) fail('Falta la clave: pon ELEVENLABS_API_KEY=... en .env')

const response = await fetch('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128', {
	method: 'POST',
	headers: { 'xi-api-key': key, 'content-type': 'application/json' },
	body: JSON.stringify({ prompt, music_length_ms: Math.round(seconds * 1000), force_instrumental: true }),
})
if (!response.ok) fail(`ElevenLabs respondió ${response.status}: ${(await response.text()).slice(0, 400)}`)

const file = path.join(ROOT, 'out/musica', `${name}.mp3`)
mkdirSync(path.dirname(file), { recursive: true })
writeFileSync(file, Buffer.from(await response.arrayBuffer()))
console.log(`listo: ${path.relative(ROOT, file)} (${seconds} s)`)
