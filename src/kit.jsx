// Piezas comunes de todos los videos de QvaPay: marca, unidades, animaciones, escenas y audio.
// Un video nuevo importa de aquí y solo escribe sus escenas. Los gustos de Erich viven en
// GUSTOS.md; cuando uno se convierte en regla visual, se aplica AQUÍ para que valga en todos.
import React from 'react'
import { AbsoluteFill, Audio, Easing, Sequence, continueRender, delayRender, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { Depth } from './depth'

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

// Entrada en 3D: la pieza se levanta girando sobre su borde de arriba, como una tarjeta
export const Flip = ({ at = 0, children, style }) => {
	const frame = useCurrentFrame()
	const { u, fps } = useUnits()
	const p = spring({ frame: frame - at, fps, config: { damping: 15, stiffness: 110, mass: 0.7 } })
	return (
		<div style={{ perspective: 90 * u, ...style }}>
			<div style={{ opacity: interpolate(frame - at, [0, 6], [0, 1], clamp), transform: `translateY(${(1 - p) * 3 * u}px) rotateX(${(1 - p) * -75}deg)`, transformOrigin: '50% 0%' }}>{children}</div>
		</div>
	)
}

// Ondas que se abren desde el centro del padre (que debe tener position: relative)
export const Rings = ({ at = 0, size = 30, count = 3, color = C.primarySoft }) => {
	const frame = useCurrentFrame()
	const { u } = useUnits()
	return (
		<div style={{ position: 'absolute', left: '50%', top: '50%', width: 0, height: 0 }}>
			{Array.from({ length: count }, (_, i) => {
				const t = (frame - at - i * 6) / 28
				if (t < 0 || t > 1) return null
				const d = size * u * (1 - (1 - t) ** 3)
				return <div key={i} style={{ position: 'absolute', width: d, height: d, left: -d / 2, top: -d / 2, borderRadius: '50%', border: `${0.1 * u + 0.35 * u * (1 - t)}px solid ${color}`, opacity: (1 - t) * 0.75 }} />
			})}
		</div>
	)
}

// Chispas que salen disparadas desde el centro del padre (position: relative)
export const Burst = ({ at = 0, count = 22, reach = 24, seed = 'burst', colors = [C.primarySoft, C.success, C.text, C.primary] }) => {
	const frame = useCurrentFrame()
	const { u } = useUnits()
	const t = (frame - at) / 34
	if (t < 0 || t > 1) return null
	return (
		<div style={{ position: 'absolute', left: '50%', top: '50%', width: 0, height: 0 }}>
			{Array.from({ length: count }, (_, i) => {
				const angle = random(`${seed}-a-${i}`) * Math.PI * 2
				const far = reach * u * (0.35 + 0.65 * random(`${seed}-d-${i}`)) * (1 - (1 - t) ** 3)
				const d = (0.5 + random(`${seed}-s-${i}`)) * u * (1 - t)
				return <div key={i} style={{ position: 'absolute', width: d, height: d, left: Math.cos(angle) * far - d / 2, top: Math.sin(angle) * far - d / 2, borderRadius: '50%', background: colors[i % colors.length], opacity: 1 - t * t }} />
			})}
		</div>
	)
}

// Número que sube hasta su valor: <Count at={50} to={248.5} prefix="$" suffix=" QUSD" />
export const Count = ({ at = 0, to, frames = 20, decimals = 2, prefix = '', suffix = '' }) => {
	const frame = useCurrentFrame()
	const value = to * interpolate(frame - at, [0, frames], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) })
	return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{prefix}{value.toFixed(decimals)}{suffix}</span>
}

// ---- Texto ----------------------------------------------------------------------------------
const Word = ({ at, children }) => {
	const frame = useCurrentFrame()
	const { u, fps } = useUnits()
	const p = spring({ frame: frame - at, fps, config: { damping: 13, stiffness: 170, mass: 0.6 } })
	const blur = interpolate(frame - at, [0, 7], [0.7 * u, 0], clamp)
	return <span style={{ display: 'inline-block', opacity: interpolate(frame - at, [0, 5], [0, 1], clamp), transform: `translateY(${(1 - p) * 3.4 * u}px) rotateX(${(1 - p) * -80}deg)`, transformOrigin: '50% 100%', filter: blur > 0.05 ? `blur(${blur}px)` : undefined }}>{children}</span>
}

// Titular: entra palabra a palabra. `stagger` = fotogramas entre una palabra y la siguiente.
export const Headline = ({ children, size = 7.2, at = 0, stagger = 3, color = C.text, style }) => {
	const { u } = useUnits()
	let index = 0
	const animate = (node) => React.Children.toArray(node).flatMap((child, key) => {
		if (typeof child === 'string') return child.split(/(\s+)/).filter(Boolean).map((part, i) => /^\s+$/.test(part) ? ' ' : <Word key={`${key}-${i}`} at={at + stagger * index++}>{part}</Word>)
		if (React.isValidElement(child) && child.type !== 'br' && child.props.children) return React.cloneElement(child, { key }, animate(child.props.children))
		return child
	})
	return <div style={{ fontSize: size * u, lineHeight: 1.08, fontWeight: 800, color, textAlign: 'center', letterSpacing: -0.02 * size * u, textWrap: 'balance', perspective: 70 * u, ...style }}>{animate(children)}</div>
}

export const Sub = ({ children, at = 0, size = 3, style }) => {
	const { u } = useUnits()
	return <Rise at={at} style={{ fontSize: size * u, lineHeight: 1.35, fontWeight: 400, color: C.muted, textAlign: 'center', textWrap: 'balance', ...style }}>{children}</Rise>
}

export const Accent = ({ children }) => <span style={{ color: C.primarySoft }}>{children}</span>
// Una cifra no se parte entre dos líneas
export const Figure = ({ children }) => <span style={{ color: C.success, fontWeight: 800, whiteSpace: 'nowrap' }}>{children}</span>

// ---- Bloques --------------------------------------------------------------------------------
export const Card = ({ children, style }) => {
	const { u } = useUnits()
	return <div style={{ background: C.surface, border: `${0.15 * u}px solid ${C.border}`, borderRadius: 3.6 * u, ...style }}>{children}</div>
}

// Burbuja de chat. `mine` = la escribe la persona. `size` = tamaño del texto, en u.
export const Bubble = ({ at, mine, size, children }) => {
	const frame = useCurrentFrame()
	const { u, portrait, fps } = useUnits()
	const s = (size ?? (portrait ? 3.9 : 3.3)) * u
	const pop = spring({ frame: frame - at, fps, config: { damping: 12, stiffness: 190, mass: 0.6 } })
	if (frame < at) return null
	return (
		<div style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '88%', opacity: interpolate(frame - at, [0, 5], [0, 1], clamp), transform: `scale(${0.6 + 0.4 * pop})`, transformOrigin: mine ? '100% 100%' : '0% 100%' }}>
			<div style={{ background: mine ? C.primary : C.surface, border: mine ? 'none' : `${0.15 * u}px solid ${C.border}`, color: C.text, borderRadius: 1.1 * s, borderBottomRightRadius: mine ? 0.3 * s : 1.1 * s, borderBottomLeftRadius: mine ? 1.1 * s : 0.3 * s, padding: `${0.62 * s}px ${0.88 * s}px`, fontSize: s, fontWeight: 500, lineHeight: 1.3 }}>{children}</div>
		</div>
	)
}

// Etiqueta con punto que salta a su sitio y se enciende un momento: para listas cortas que
// la voz va nombrando
export const Chip = ({ at, children }) => {
	const frame = useCurrentFrame()
	const { u, portrait, fps } = useUnits()
	const p = spring({ frame: frame - at, fps, config: { damping: 11, stiffness: 170, mass: 0.6 } })
	const flash = interpolate(frame - at, [0, 8, 30], [0, 1, 0], clamp)
	return (
		<div style={{ opacity: interpolate(frame - at, [0, 5], [0, 1], clamp), transform: `scale(${0.5 + 0.5 * p})` }}>
			<Card style={{ display: 'flex', alignItems: 'center', gap: 1.4 * u, borderRadius: 4 * u, padding: `${1.5 * u}px ${2.6 * u}px`, fontSize: (portrait ? 3.3 : 3.4) * u, fontWeight: 700, color: C.text, whiteSpace: 'nowrap', boxShadow: `0 0 ${5 * u}px rgba(103,89,239,${0.6 * flash})` }}>
				<span style={{ width: 1.5 * u, height: 1.5 * u, borderRadius: '50%', background: C.success }} />
				{children}
			</Card>
		</div>
	)
}

// Etiqueta de aviso (una fecha límite, «Nuevo»): contorno con un latido suave
export const Tag = ({ at = 0, size = 3, children }) => {
	const frame = useCurrentFrame()
	const { u, fps } = useUnits()
	const p = spring({ frame: frame - at, fps, config: { damping: 10, stiffness: 180, mass: 0.6 } })
	const beat = 0.5 + 0.5 * Math.sin((frame - at) / 6)
	return (
		<div style={{ opacity: interpolate(frame - at, [0, 5], [0, 1], clamp), transform: `scale(${0.5 + 0.5 * p})`, border: `${0.25 * u}px solid ${C.success}`, color: C.success, background: 'rgba(123,255,177,0.1)', borderRadius: 4 * u, padding: `${0.3 * size * u}px ${0.8 * size * u}px`, fontSize: size * u, fontWeight: 800, whiteSpace: 'nowrap', boxShadow: `0 0 ${(2 + 3 * beat) * u}px rgba(123,255,177,${0.15 + 0.25 * beat})` }}>{children}</div>
	)
}

// Paso numerado: se levanta en 3D y su número se enciende un momento al llegar
export const Step = ({ at, n, children }) => {
	const frame = useCurrentFrame()
	const { u, portrait } = useUnits()
	const flash = interpolate(frame - at, [4, 12, 34], [0, 1, 0], clamp)
	return (
		<Flip at={at}>
			<Card style={{ display: 'flex', alignItems: 'center', gap: 2.6 * u, padding: `${2.4 * u}px ${3 * u}px`, fontSize: (portrait ? 3.8 : 3.3) * u, fontWeight: 500, color: C.text, boxShadow: `0 0 ${5 * u}px rgba(103,89,239,${0.55 * flash})` }}>
				<span style={{ width: 6 * u, height: 6 * u, borderRadius: 2 * u, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 3.2 * u, flexShrink: 0, transform: `scale(${1 + 0.18 * flash})` }}>{n}</span>
				{children}
			</Card>
		</Flip>
	)
}

// Línea con visto bueno: el visto se dibuja
export const Check = ({ at, children }) => {
	const frame = useCurrentFrame()
	const { u, portrait } = useUnits()
	const drawn = interpolate(frame - at, [4, 16], [0, 1], clamp)
	return (
		<Rise at={at} distance={2} style={{ display: 'flex', alignItems: 'center', gap: 2 * u, fontSize: (portrait ? 3.9 : 3.3) * u, fontWeight: 500, color: C.text }}>
			<span style={{ width: 4.4 * u, height: 4.4 * u, borderRadius: '50%', background: 'rgba(123,255,177,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
				<svg width={2.8 * u} height={2.8 * u} viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7.5" stroke={C.success} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="21" strokeDashoffset={21 * (1 - drawn)} /></svg>
			</span>
			<span style={{ textWrap: 'balance' }}>{children}</span>
		</Rise>
	)
}

// Botón de cierre con la dirección: late y le pasa un brillo por encima
export const UrlPill = ({ at, children }) => {
	const frame = useCurrentFrame()
	const { u, portrait, fps } = useUnits()
	const glow = 0.5 + Math.sin(frame / 9) * 0.25
	const pop = spring({ frame: frame - at, fps, config: { damping: 11, stiffness: 150, mass: 0.7 } })
	const shine = interpolate((frame - at - 12) % 70, [0, 22], [-30, 130], clamp)
	return (
		<div style={{ opacity: interpolate(frame - at, [0, 6], [0, 1], clamp), transform: `scale(${0.7 + 0.3 * pop})` }}>
			<div style={{ position: 'relative', overflow: 'hidden', background: C.primary, color: C.text, borderRadius: 4 * u, padding: `${2.6 * u}px ${4.4 * u}px`, fontSize: (portrait ? 4.1 : 3.7) * u, fontWeight: 700, boxShadow: `0 0 ${7 * u}px rgba(103,89,239,${glow})` }}>
				{children}
				{frame - at > 12 && <div style={{ position: 'absolute', top: '-50%', left: `${shine}%`, width: 5 * u, height: '200%', background: 'rgba(247,247,247,0.28)', transform: 'rotate(20deg)', filter: `blur(${0.8 * u}px)` }} />}
			</div>
		</div>
	)
}

export const Logo = ({ size }) => {
	const { u } = useUnits()
	return <img src={staticFile('logo-qvapay.svg')} style={{ width: size * u }} alt="" />
}

// Teléfono en 3D: llega girando y se queda flotando. Lo que lleve dentro es su pantalla.
export const Phone = ({ at = 0, width = 40, height = 78, children }) => {
	const frame = useCurrentFrame()
	const { u, fps } = useUnits()
	const p = spring({ frame: frame - at, fps, config: { damping: 17, stiffness: 55, mass: 1 } })
	const rotateY = interpolate(p, [0, 1], [-55, -13]) + Math.sin(frame / 40) * 3
	const rotateX = interpolate(p, [0, 1], [26, 6]) + Math.cos(frame / 52) * 1.5
	const glare = interpolate(frame - at, [18, 50], [-60, 170], clamp)
	return (
		<div style={{ perspective: 170 * u, flexShrink: 0 }}>
			<div style={{ width: width * u, height: height * u, opacity: interpolate(frame - at, [0, 8], [0, 1], clamp), transform: `translateY(${(1 - p) * 26 * u}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`, borderRadius: 6.5 * u, background: C.surface, border: `${0.2 * u}px solid ${C.border}`, padding: 1.3 * u, boxShadow: `${2.5 * u}px ${4 * u}px ${9 * u}px rgba(0,0,0,0.55), 0 0 ${16 * u}px rgba(103,89,239,0.3)` }}>
				<div style={{ width: '100%', height: '100%', borderRadius: 5.3 * u, background: C.bg, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
					<div style={{ alignSelf: 'center', marginTop: 1.4 * u, width: 11 * u, height: 2.2 * u, borderRadius: 2 * u, background: C.surface, flexShrink: 0 }} />
					{children}
					<div style={{ position: 'absolute', top: '-20%', left: `${glare}%`, width: '24%', height: '140%', background: 'rgba(247,247,247,0.06)', transform: 'rotate(18deg)' }} />
				</div>
			</div>
		</div>
	)
}

// ---- Fondo ----------------------------------------------------------------------------------
// Puntos, un halo que respira y las piezas en 3D (algo desenfocadas: son fondo, no compiten con el texto). La cámara avanza despacio todo el video y da
// un acelerón en cada cambio de escena (`cuts` = fotogramas donde empieza cada escena).
export const Background = ({ cuts = [] }) => {
	const frame = useCurrentFrame()
	const { u, width, height } = useUnits()
	const drift = Math.sin(frame / 90) * 4 * u
	const travel = frame * 0.045 + cuts.reduce((sum, cut) => sum + 7 * interpolate(frame, [cut - 9, cut + 12], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) }), 0)
	return (
		<AbsoluteFill style={{ background: C.bg }}>
			<div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${C.border} ${0.12 * u}px, transparent ${0.12 * u}px)`, backgroundSize: `${4 * u}px ${4 * u}px`, opacity: 0.55 }} />
			<div style={{ position: 'absolute', width: 90 * u, height: 90 * u, left: width / 2 - 45 * u + drift, top: height / 2 - 45 * u - drift, borderRadius: '50%', background: C.primary, opacity: 0.16, filter: `blur(${18 * u}px)` }} />
			<AbsoluteFill style={{ opacity: interpolate(frame, [0, 18], [0, 0.8], clamp), filter: `blur(${0.28 * u}px)` }}><Depth travel={travel} frame={frame} colors={C} /></AbsoluteFill>
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

// Cada escena llega desde el fondo y se va hacia la cámara, desenfocándose: junto con el
// acelerón del fondo, el cambio de escena se siente como avanzar, no como un fundido.
const SceneFrame = ({ duration, first, children }) => {
	const frame = useCurrentFrame()
	const { u, portrait } = useUnits()
	const enter = first ? 1 : interpolate(frame, [0, 13], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) })
	const exit = interpolate(frame, [duration - 9, duration], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) })
	const scale = (0.82 + 0.18 * enter) * (1 + 0.32 * exit) * (1 + 0.025 * frame / duration)
	const blur = ((1 - enter) * 1.5 + exit * 1.5) * u
	const opacity = Math.min(interpolate(frame, [0, 7], [0, 1], clamp), 1 - exit)
	return (
		<AbsoluteFill style={{ opacity, transform: `scale(${scale})`, filter: blur > 0.05 ? `blur(${blur}px)` : undefined }}>
			<AbsoluteFill style={{ padding: portrait ? `${14 * u}px ${7 * u}px` : `${9 * u}px ${12 * u}px`, justifyContent: 'center', alignItems: 'center' }}>
				{children}
			</AbsoluteFill>
		</AbsoluteFill>
	)
}

// Música de fondo: entra y sale con fundido, y baja mientras alguien habla.
const MUSIC_FULL = 0.38
const MUSIC_UNDER_VOICE = 0.1
// Fotogramas que tarda en bajar y subir. Más largo que el silencio entre dos escenas, para que
// ahí la música solo asome y no dé un salto de volumen en cada cambio.
const DUCK = 18
const Music = ({ timeline }) => {
	const spans = timeline.items.filter(item => item.voice).map(item => [item.from + VOICE_LEAD, item.from + VOICE_LEAD + Math.ceil(item.voice.seconds * FPS)])
	const volume = (frame) => {
		const edges = interpolate(frame, [0, 20, timeline.duration - 30, timeline.duration], [0, 1, 1, 0], clamp)
		// Qué tan cerca está la voz: 1 dentro de una locución, 0 a más de DUCK fotogramas
		const near = Math.max(0, ...spans.map(([start, end]) => interpolate(frame, [start - DUCK, start, end, end + DUCK], [0, 1, 1, 0], clamp)))
		return edges * (MUSIC_FULL - (MUSIC_FULL - MUSIC_UNDER_VOICE) * near)
	}
	return <Audio src={staticFile(timeline.music)} volume={volume} loop />
}

// El video entero: fondo, escenas, voz y música. `mute` saca una versión sin sonido.
export const Video = ({ timeline, mute = false }) => {
	useFonts()
	return (
		<AbsoluteFill style={{ fontFamily: `${FONT}, sans-serif` }}>
			<Background cuts={timeline.items.slice(1).map(item => item.from)} />
			{timeline.items.map(({ id, from, duration, component: Component, voice }, index) => (
				<Sequence key={id} from={from} durationInFrames={duration}>
					<SceneFrame duration={duration} first={index === 0}><Component /></SceneFrame>
					{!mute && voice && <Sequence from={VOICE_LEAD}><Audio src={staticFile(voice.file)} /></Sequence>}
				</Sequence>
			))}
			{!mute && timeline.music && <Music timeline={timeline} />}
		</AbsoluteFill>
	)
}
