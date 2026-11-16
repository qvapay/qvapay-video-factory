// Piezas comunes de todos los videos de QvaPay: marca, unidades, animaciones, escenas y audio.
// Un video nuevo importa de aquí y solo escribe sus escenas. Los gustos de Erich viven en
// GUSTOS.md; cuando uno se convierte en regla visual, se aplica AQUÍ para que valga en todos.
import React from 'react'
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'

export const FPS = 30

// Colores del producto (app/globals.css del repo de la app)
export const C = { bg: '#0e0e1c', surface: '#1e2039', primary: '#6759ef', primarySoft: '#a8a1f8', text: '#f7f7f7', muted: '#9da3b4', success: '#7bffb1', border: 'rgba(157,163,180,0.18)' }

// Formatos de salida. Un video se diseña una vez y sale en todos.
export const FORMATS = {
	feed: { suffix: 'feed-4x3', width: 1440, height: 1080 },
	story: { suffix: 'story-9x16', width: 1080, height: 1920 },
}

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }

// ---- Fuente ---------------------------------------------------------------------------------
const FONT = 'QPRubik'
const WEIGHTS = [[400, 'Regular'], [500, 'Medium'], [700, 'Bold'], [800, 'ExtraBold']]
let fontsReady = null
const loadFonts = () => {
	if (!fontsReady) {
		fontsReady = Promise.all(WEIGHTS.map(async ([weight, name]) => {
			const face = new FontFace(FONT, `url(${staticFile(`fonts/Rubik-${name}.ttf`)})`, { weight: String(weight) })
			document.fonts.add(await face.load())
		}))
	}
	return fontsReady
}
const useFonts = () => {
	const [handle] = React.useState(() => delayRender('fuentes'))
	React.useEffect(() => { loadFonts().then(() => continueRender(handle)).catch(() => continueRender(handle)) }, [handle])
}

// ---- Unidades -------------------------------------------------------------------------------
// Todo se mide en `u`, relativo al lienzo: el mismo diseño vale en 4:3 y en 9:16. En vertical
// sobra alto, así que todo crece un poco para llenar la pantalla del teléfono.
export const useUnits = () => {
	const { width, height, fps } = useVideoConfig()
	const portrait = height > width
	return { u: portrait ? width / 86 : height / 100, portrait, width, height, fps }
}

// ---- Animación ------------------------------------------------------------------------------
// Entrada con muelle desde abajo. `at` = fotograma dentro de la escena.
export const Rise = ({ at = 0, children, distance = 4, style }) => {
	const frame = useCurrentFrame()
	const { u, fps } = useUnits()
	const p = spring({ frame: frame - at, fps, config: { damping: 18, stiffness: 120, mass: 0.7 } })
	return <div style={{ opacity: interpolate(p, [0, 1], [0, 1]), transform: `translateY(${(1 - p) * distance * u}px)`, ...style }}>{children}</div>
}

// ---- Texto ----------------------------------------------------------------------------------
export const Headline = ({ children, size = 7.2, at = 0, color = C.text, style }) => {
	const { u } = useUnits()
	return <Rise at={at} style={{ fontSize: size * u, lineHeight: 1.08, fontWeight: 800, color, textAlign: 'center', letterSpacing: -0.02 * size * u, textWrap: 'balance', ...style }}>{children}</Rise>
}

export const Sub = ({ children, at = 0, size = 3, style }) => {
	const { u } = useUnits()
	return <Rise at={at} style={{ fontSize: size * u, lineHeight: 1.35, fontWeight: 400, color: C.muted, textAlign: 'center', textWrap: 'balance', ...style }}>{children}</Rise>
}

export const Accent = ({ children }) => <span style={{ color: C.primarySoft }}>{children}</span>
export const Figure = ({ children }) => <span style={{ color: C.success, fontWeight: 800 }}>{children}</span>

// ---- Bloques --------------------------------------------------------------------------------
export const Card = ({ children, style }) => {
	const { u } = useUnits()
	return <div style={{ background: C.surface, border: `${0.15 * u}px solid ${C.border}`, borderRadius: 3.6 * u, ...style }}>{children}</div>
}

// Burbuja de chat. `mine` = la escribe la persona.
export const Bubble = ({ at, mine, children }) => {
	const { u, portrait } = useUnits()
	return (
		<Rise at={at} distance={2.5} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '86%' }}>
			<div style={{ background: mine ? C.primary : C.surface, border: mine ? 'none' : `${0.15 * u}px solid ${C.border}`, color: C.text, borderRadius: 3.6 * u, borderBottomRightRadius: mine ? u : 3.6 * u, borderBottomLeftRadius: mine ? 3.6 * u : u, padding: `${2.2 * u}px ${3 * u}px`, fontSize: (portrait ? 3.9 : 3.3) * u, fontWeight: 500, lineHeight: 1.3 }}>{children}</div>
		</Rise>
	)
}

// Paso numerado
export const Step = ({ at, n, children }) => {
	const { u, portrait } = useUnits()
	return (
		<Rise at={at} distance={2.5}>
			<Card style={{ display: 'flex', alignItems: 'center', gap: 2.6 * u, padding: `${2.4 * u}px ${3 * u}px`, fontSize: (portrait ? 3.8 : 3.3) * u, fontWeight: 500, color: C.text }}>
				<span style={{ width: 6 * u, height: 6 * u, borderRadius: 2 * u, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 3.2 * u, flexShrink: 0 }}>{n}</span>
				{children}
			</Card>
		</Rise>
	)
}

// Línea con visto bueno
export const Check = ({ at, children }) => {
	const { u, portrait } = useUnits()
	return (
		<Rise at={at} distance={2} style={{ display: 'flex', alignItems: 'center', gap: 2 * u, fontSize: (portrait ? 3.9 : 3.3) * u, fontWeight: 500, color: C.text }}>
			<span style={{ width: 4 * u, height: 4 * u, borderRadius: '50%', background: 'rgba(123,255,177,0.14)', color: C.success, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 2.4 * u, fontWeight: 800, flexShrink: 0 }}>✓</span>
			{children}
		</Rise>
	)
}

// Botón de cierre con la dirección
export const UrlPill = ({ at, children }) => {
	const frame = useCurrentFrame()
	const { u, portrait } = useUnits()
	const glow = 0.5 + Math.sin(frame / 9) * 0.25
	return (
		<Rise at={at}>
			<div style={{ background: C.primary, color: C.text, borderRadius: 4 * u, padding: `${2.6 * u}px ${4.4 * u}px`, fontSize: (portrait ? 4.1 : 3.7) * u, fontWeight: 700, boxShadow: `0 0 ${7 * u}px rgba(103,89,239,${glow})` }}>{children}</div>
		</Rise>
	)
}

export const Logo = ({ size }) => {
	const { u } = useUnits()
	return <img src={staticFile('logo-qvapay.svg')} style={{ width: size * u }} alt="" />
}

// ---- Fondo ----------------------------------------------------------------------------------
export const Background = () => {
	const frame = useCurrentFrame()
	const { u, width, height } = useUnits()
	const drift = Math.sin(frame / 90) * 4 * u
	return (
		<AbsoluteFill style={{ background: C.bg }}>
			<div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${C.border} ${0.12 * u}px, transparent ${0.12 * u}px)`, backgroundSize: `${4 * u}px ${4 * u}px`, opacity: 0.55 }} />
			<div style={{ position: 'absolute', width: 90 * u, height: 90 * u, left: width / 2 - 45 * u + drift, top: height / 2 - 45 * u - drift, borderRadius: '50%', background: C.primary, opacity: 0.16, filter: `blur(${18 * u}px)` }} />
		</AbsoluteFill>
	)
}

// ---- Línea de tiempo ------------------------------------------------------------------------
// scenes: [{ id, min, component }]  ·  timing: lo que escribe `npm run audio` (duración de cada
// locución). Una escena dura lo que pida su animación (`min`, en fotogramas) o lo que dure su
// locución más un respiro, lo que sea mayor: la voz nunca se corta.
const VOICE_LEAD = 6 // fotogramas de silencio antes de que entre la voz
const VOICE_TAIL = 14

export const buildTimeline = (scenes, timing = {}) => {
	let from = 0
	const items = scenes.map(scene => {
		const seconds = timing.voice?.[scene.id]?.seconds ?? 0
		const voiced = seconds > 0 ? VOICE_LEAD + Math.ceil(seconds * FPS) + VOICE_TAIL : 0
		const item = { ...scene, from, duration: Math.max(scene.min, voiced), voice: seconds > 0 ? timing.voice[scene.id] : null }
		from += item.duration
		return item
	})
	return { items, duration: from, music: timing.music ?? null }
}

const SceneFrame = ({ duration, children }) => {
	const frame = useCurrentFrame()
	const { u, portrait } = useUnits()
	const opacity = interpolate(frame, [0, 8, duration - 8, duration], [0, 1, 1, 0], clamp)
	return (
		<AbsoluteFill style={{ opacity, padding: portrait ? `${14 * u}px ${7 * u}px` : `${9 * u}px ${12 * u}px`, justifyContent: 'center', alignItems: 'center' }}>
			{children}
		</AbsoluteFill>
	)
}

// Música de fondo: entra y sale con fundido, y baja mientras alguien habla.
const MUSIC_FULL = 0.38
const MUSIC_UNDER_VOICE = 0.1
const Music = ({ timeline }) => {
	const spans = timeline.items.filter(item => item.voice).map(item => [item.from + VOICE_LEAD, item.from + VOICE_LEAD + Math.ceil(item.voice.seconds * FPS)])
	const volume = (frame) => {
		const edges = interpolate(frame, [0, 20, timeline.duration - 30, timeline.duration], [0, 1, 1, 0], clamp)
		// Qué tan cerca está la voz: 1 dentro de una locución, 0 a más de 10 fotogramas
		const near = Math.max(0, ...spans.map(([start, end]) => interpolate(frame, [start - 10, start, end, end + 10], [0, 1, 1, 0], clamp)))
		return edges * (MUSIC_FULL - (MUSIC_FULL - MUSIC_UNDER_VOICE) * near)
	}
	return <Audio src={staticFile(timeline.music)} volume={volume} loop />
}

// El video entero: fondo, escenas, voz y música. `mute` saca una versión sin sonido.
export const Video = ({ timeline, mute = false }) => {
	useFonts()
	return (
		<AbsoluteFill style={{ fontFamily: `${FONT}, sans-serif` }}>
			<Background />
			{timeline.items.map(({ id, from, duration, component: Component, voice }) => (
				<Sequence key={id} from={from} durationInFrames={duration}>
					<SceneFrame duration={duration}><Component /></SceneFrame>
					{!mute && voice && <Sequence from={VOICE_LEAD}><Audio src={staticFile(voice.file)} /></Sequence>}
				</Sequence>
			))}
			{!mute && timeline.music && <Music timeline={timeline} />}
		</AbsoluteFill>
	)
}
