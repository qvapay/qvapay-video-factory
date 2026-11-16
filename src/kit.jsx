// Piezas comunes de todos los videos de QvaPay: marca, unidades, animaciones, escenas y audio.
// Un video nuevo importa de aquí y solo escribe sus escenas. Los gustos de Erich viven en
// GUSTOS.md; cuando uno se convierte en regla visual, se aplica AQUÍ para que valga en todos.
import React from 'react'
import { Lineicons } from '@lineiconshq/react-lineicons'
import { CheckDuotone } from '@lineiconshq/free-icons'
import { AbsoluteFill, Audio, Easing, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'

export const FPS = 30

// Colores del producto en modo oscuro: los mismos de la web (app/globals.css) y de la app
// (theme/themeTokens.ts). `primary` es para rellenos; el texto morado va en `primarySoft`, que
// es el que se lee sobre fondo oscuro. Sobre `primary` el texto va en `white`.
export const C = {
	bg: '#0e0e1c', surface: '#1e2039', elevation: '#282b4a',
	primary: '#6759ef', primarySoft: '#a8a1f8',
	text: '#f7f7f7', muted: '#9da3b4', white: '#ffffff',
	success: '#7bffb1', warning: '#ff9f43', danger: '#ff7a8c', gold: '#ffd700',
	border: 'rgba(255,255,255,0.10)',
}

// Un color de `C` con transparencia: tint(C.primary, 0.12)
export const tint = (hex, alpha) => {
	const n = parseInt(hex.slice(1), 16)
	return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

// Esquinas continuas, como los botones de la web y de la app. El radio se pone aparte; donde
// el navegador no lo entiende queda la esquina redonda de siempre.
const SQUIRCLE = { cornerShape: 'squircle' }

// Dinero como en el producto: $1,234.56, siempre con dos decimales.
export const money = (value) => `$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// Formatos de salida. Un video se diseña una vez y sale en todos.
export const FORMATS = {
	feed: { suffix: 'feed-4x3', width: 1440, height: 1080 },
	story: { suffix: 'story-9x16', width: 1080, height: 1920 },
}

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }

// ---- Fuente ---------------------------------------------------------------------------------
const FONT = 'QPRubik'
const WEIGHTS = [[400, 'Regular'], [500, 'Medium'], [600, 'SemiBold'], [700, 'Bold'], [800, 'ExtraBold'], [900, 'Black']]
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
// Pesos, como en el producto: 400 para leer, 500 y 600 para destacar, 700 para titulares y 900
// solo para una cifra protagonista (`Amount`).
export const Headline = ({ children, size = 7.2, at = 0, color = C.text, style }) => {
	const { u } = useUnits()
	return <Rise at={at} style={{ fontSize: size * u, lineHeight: 1.08, fontWeight: 700, color, textAlign: 'center', letterSpacing: '-0.025em', textWrap: 'balance', ...style }}>{children}</Rise>
}

export const Sub = ({ children, at = 0, size = 3, style }) => {
	const { u } = useUnits()
	return <Rise at={at} style={{ fontSize: size * u, lineHeight: 1.35, fontWeight: 400, color: C.muted, textAlign: 'center', textWrap: 'balance', ...style }}>{children}</Rise>
}

// La palabra o la segunda línea que se destaca en un titular
export const Accent = ({ children }) => <span style={{ color: C.primarySoft }}>{children}</span>
// Una cifra dentro de una frase. `tone`: success (entra), danger (sale), text.
export const Figure = ({ children, tone = 'success' }) => <span style={{ color: C[tone], fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{children}</span>

// Rótulo corto sobre un titular, en mayúsculas
export const Eyebrow = ({ children, at = 0 }) => {
	const { u, portrait } = useUnits()
	return <Rise at={at} distance={2} style={{ fontSize: (portrait ? 2.7 : 2.3) * u, fontWeight: 600, color: C.primarySoft, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>{children}</Rise>
}

// Etiqueta redonda: «Nuevo», un estado. `tone`: primary, success, warning, danger.
// `dot` le pone el punto que late.
export const Chip = ({ children, at = 0, tone = 'primary', dot = false }) => {
	const frame = useCurrentFrame()
	const { u, portrait } = useUnits()
	const color = tone === 'primary' ? C.primarySoft : C[tone]
	const fill = tone === 'primary' ? C.primary : C[tone]
	const ping = (Math.max(0, frame - at) % 45) / 45
	return (
		<Rise at={at} distance={2}>
			<div style={{ display: 'inline-flex', alignItems: 'center', gap: 1.4 * u, background: tint(fill, 0.12), boxShadow: `inset 0 0 0 ${0.15 * u}px ${tint(fill, 0.28)}`, color, borderRadius: 99 * u, padding: `${1.1 * u}px ${2.4 * u}px`, fontSize: (portrait ? 2.9 : 2.5) * u, fontWeight: 600 }}>
				{dot && (
					<span style={{ position: 'relative', width: 1.3 * u, height: 1.3 * u, flexShrink: 0 }}>
						<span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, opacity: 0.7 * (1 - ping), transform: `scale(${1 + ping * 1.6})` }} />
						<span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color }} />
					</span>
				)}
				{children}
			</div>
		</Rise>
	)
}

// Cifra protagonista, como el saldo de la app: el signo de dólar más pequeño y gris, los
// dígitos en Black, y cuenta hasta su valor al entrar. `sign="+"` la pinta en verde (entra),
// `sign="-"` en rojo (sale). `unit` es la moneda que va detrás; el saldo de QvaPay es QUSD.
export const Amount = ({ value, at = 0, size, sign = '', unit = 'QUSD', count = true }) => {
	const frame = useCurrentFrame()
	const { u, portrait } = useUnits()
	size = size ?? (portrait ? 11 : 15) // en vertical cabe menos ancho
	const p = count ? interpolate(frame, [at, at + 27], [0, 1], { ...clamp, easing: Easing.out(Easing.poly(4)) }) : 1
	const color = sign === '+' ? C.success : sign === '-' ? C.danger : C.text
	return (
		<Rise at={at} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.1 * size * u, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
			<span style={{ fontSize: 0.5 * size * u, fontWeight: 600, color: sign ? color : C.muted }}>{sign}$</span>
			<span style={{ fontSize: size * u, fontWeight: 900, color, letterSpacing: '-0.02em', lineHeight: 1 }}>{money(value * p).slice(1)}</span>
			{unit && <span style={{ fontSize: 0.3 * size * u, fontWeight: 600, color: C.muted, marginLeft: 0.06 * size * u }}>{unit}</span>}
		</Rise>
	)
}

// ---- Iconos ---------------------------------------------------------------------------------
// Los de la web: Lineicons en estilo Duotone. Se importan de '@lineiconshq/free-icons'
// (por ejemplo `Locked1Duotone`) y se pasan en `icon`. No se dibujan iconos a mano.
export const Icon = ({ icon, size = 4, color = 'currentColor', stroke = 1.5 }) => {
	const { u } = useUnits()
	return <Lineicons icon={icon} size={size * u} color={color} strokeWidth={stroke} style={{ display: 'block', flexShrink: 0 }} />
}

// Icono en su recuadro. Suave (fondo teñido, icono del color) para acompañar un texto;
// `solid` (recuadro morado, icono blanco) cuando el icono es el protagonista.
// `tone`: primary, success, warning, danger. `round` lo hace círculo, como en la app.
// `scale` y `stroke` engordan el icono cuando el recuadro es pequeño.
export const IconTile = ({ icon, size = 10, tone = 'primary', solid = false, round = false, scale = 0.5, stroke, children }) => {
	const { u } = useUnits()
	const fill = tone === 'primary' ? C.primary : C[tone]
	const color = solid ? C.white : tone === 'primary' ? C.primarySoft : C[tone]
	return (
		<div style={{ width: size * u, height: size * u, borderRadius: round ? '50%' : 0.29 * size * u, ...(round ? null : SQUIRCLE), background: solid ? fill : tint(fill, 0.14), boxShadow: solid ? `0 ${0.18 * size * u}px ${0.27 * size * u}px ${-0.05 * size * u}px ${tint(fill, 0.3)}` : 'none', color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 0.5 * size * u, fontWeight: 700 }}>
			{icon ? <Icon icon={icon} size={scale * size} stroke={stroke} /> : children}
		</div>
	)
}

// ---- Bloques --------------------------------------------------------------------------------
// Tarjeta: superficie lisa con un filo fino, sin sombra, como las de la web en oscuro.
export const Card = ({ children, style }) => {
	const { u } = useUnits()
	return <div style={{ background: C.surface, border: `${0.15 * u}px solid ${C.border}`, borderRadius: 3.6 * u, ...SQUIRCLE, ...style }}>{children}</div>
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
				<IconTile size={6} solid>{n}</IconTile>
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
			<IconTile icon={CheckDuotone} size={4.6} tone="success" round scale={0.7} stroke={2.6} />
			{children}
		</Rise>
	)
}

// Fila de lista, como un movimiento en la app: icono, título, detalle y, a la derecha, la cifra.
// `amountTone`: success (entra), danger (sale), text.
export const Row = ({ at, icon, tone = 'primary', title, detail, amount, amountTone = 'text' }) => {
	const { u, portrait } = useUnits()
	const size = (portrait ? 3.7 : 3.2) * u
	return (
		<Rise at={at} distance={2.5}>
			<div style={{ display: 'flex', alignItems: 'center', gap: 2.4 * u, background: C.elevation, borderRadius: 2.8 * u, ...SQUIRCLE, padding: `${2.2 * u}px ${2.6 * u}px` }}>
				{icon && <IconTile icon={icon} size={7.4} tone={tone} round />}
				<div style={{ flex: 1, minWidth: 0 }}>
					<div style={{ fontSize: size, fontWeight: 500, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
					{detail && <div style={{ fontSize: 0.76 * size, fontWeight: 400, color: C.muted, marginTop: 0.5 * u }}>{detail}</div>}
				</div>
				{amount && <div style={{ fontSize: size, fontWeight: 600, color: C[amountTone], fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{amount}</div>}
			</div>
		</Rise>
	)
}

// Botón principal, el del cierre con la dirección. Esquinas continuas, nunca píldora.
export const Button = ({ at, children }) => {
	const frame = useCurrentFrame()
	const { u, portrait } = useUnits()
	const glow = 0.5 + Math.sin(frame / 9) * 0.25
	return (
		<Rise at={at}>
			<div style={{ background: C.primary, color: C.white, borderRadius: 2.9 * u, ...SQUIRCLE, padding: `${2.6 * u}px ${4.4 * u}px`, fontSize: (portrait ? 4.1 : 3.7) * u, fontWeight: 600, boxShadow: `0 0 ${7 * u}px ${tint(C.primary, glow)}` }}>{children}</div>
		</Rise>
	)
}

// ---- Logo -----------------------------------------------------------------------------------
// El símbolo de QvaPay en vector (los originales están en brand/). No se redibuja, no se deforma
// ni se le ponen sombras o efectos. Guía de marca: blanco sobre fondo oscuro, sobre morado y
// en video; morado solo sobre fondo claro.
//   <Logo size={26} />                    símbolo blanco
//   <Logo size={26} color={C.primary} />  símbolo morado, para fondo claro
//   <Logo size={26} tile />            icono de la app: cuadro morado con el símbolo blanco
// El símbolo ocupa el centro de un cuadro de `size` de lado, con aire alrededor.
const LOGO_PATH = 'M 740.576477 240.218994 C 769.865784 269.508301 769.865784 316.995636 740.576477 346.284973 L 687.543457 399.317993 L 687.481995 399.256561 L 552.889709 533.848877 L 552.93103 533.890198 L 499.89801 586.923218 C 470.608704 616.212524 423.121338 616.212524 393.832001 586.923218 C 392.995605 586.086792 392.183105 585.235596 391.39447 584.370361 L 348.032104 541.007996 C 344.126862 537.102722 344.126862 530.771118 348.032104 526.865845 L 390.581818 484.316132 C 391.621857 483.137604 392.705261 481.983948 393.832001 480.857178 L 446.776978 427.912231 L 446.735626 427.87088 L 581.79303 292.813507 L 581.854492 292.874939 L 634.510437 240.218994 C 663.799805 210.929626 711.287109 210.929626 740.576477 240.218994 Z M 163.500015 344.0961 L 216.505219 397.101288 L 320.79303 292.813477 L 320.854492 292.874939 L 373.510468 240.218994 C 402.799805 210.929626 450.28714 210.929626 479.576477 240.218994 C 508.865784 269.508301 508.865784 316.995636 479.576477 346.284973 L 426.543457 399.317993 L 426.482025 399.256561 L 322.889709 502.848877 L 322.93103 502.890198 L 269.89801 555.923218 C 253.077744 572.74353 230.255798 579.904236 208.325455 577.405396 C 191.800308 575.692017 175.735413 568.503784 163.072205 555.840576 L 110.039207 502.807526 L 110.059319 502.787415 L 57.433994 450.162109 C 28.144642 420.872742 28.144653 373.385406 57.433983 344.0961 C 86.723312 314.806763 134.210648 314.806732 163.500015 344.0961 Z'
export const Logo = ({ size, color = C.white, tile = false }) => {
	const { u } = useUnits()
	return (
		<svg viewBox="0 0 800 800" width={size * u} height={size * u} style={{ display: 'block' }}>
			{tile ? <rect width="800" height="800" rx="180" fill={C.primary} /> : null}
			<path fill={tile ? C.white : color} fillRule="evenodd" d={LOGO_PATH} />
		</svg>
	)
}

// ---- Fondo ----------------------------------------------------------------------------------
// El del inicio de la web: fondo oscuro, rejilla de puntos morados que se pierde hacia los
// bordes y un resplandor morado suave detrás del contenido.
export const Background = () => {
	const frame = useCurrentFrame()
	const { u, width, height } = useUnits()
	const drift = Math.sin(frame / 90) * 4 * u
	return (
		<AbsoluteFill style={{ background: C.bg }}>
			<div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${tint(C.primary, 0.22)} ${0.13 * u}px, transparent ${0.13 * u}px)`, backgroundSize: `${4 * u}px ${4 * u}px`, maskImage: 'radial-gradient(ellipse 85% 70% at 50% 45%, black, transparent)', WebkitMaskImage: 'radial-gradient(ellipse 85% 70% at 50% 45%, black, transparent)' }} />
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
