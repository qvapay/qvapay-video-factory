// Agentes IA (MCP): conecta tu cuenta a un agente de IA. Solo lectura.
// La locución de cada escena está en voice.json; `npm run audio mcp` la convierte en audio.
import React from 'react'
import { interpolate, spring, useCurrentFrame } from 'remotion'
import { Accent, Bubble, Burst, C, Card, Check, Chip, Count, Figure, Headline, Logo, Phone, Rings, Rise, Step, Sub, UrlPill, clamp, useUnits } from '../../kit'

// La cara del agente: se usa en la conexión, en la caja de la pregunta y en el teléfono
const AgentMark = ({ size }) => {
	const frame = useCurrentFrame()
	const pulse = 1 + Math.sin(frame / 7) * 0.06
	const blink = frame % 70 > 64 ? 0.15 : 1
	const eye = { width: size * 0.13, height: size * 0.22 * blink, borderRadius: size, background: C.bg }
	return (
		<div style={{ width: size, height: size, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, ${C.primarySoft}, ${C.primary} 60%)`, transform: `scale(${pulse})`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: size * 0.14, flexShrink: 0 }}>
			<span style={eye} /><span style={eye} />
		</div>
	)
}

// ---- 1. Gancho: alguien escribe la pregunta -------------------------------------------------
const QUESTION = '¿Cuánto saldo tengo?'
const SENT = 34
const Hook = () => {
	const frame = useCurrentFrame()
	const { u, portrait, fps } = useUnits()
	const typed = QUESTION.slice(0, Math.floor(interpolate(frame, [6, 30], [0, QUESTION.length], clamp)))
	const caret = frame < SENT && Math.floor(frame / 7) % 2 === 0
	const land = spring({ frame, fps, config: { damping: 15, stiffness: 60 } })
	const sent = spring({ frame: frame - SENT, fps, config: { damping: 10, stiffness: 200, mass: 0.5 } })
	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 * u, width: '100%' }}>
			<div style={{ width: portrait ? '100%' : '78%', perspective: 110 * u }}>
				<div style={{ position: 'relative', opacity: interpolate(frame, [0, 8], [0, 1], clamp), transform: `translateY(${(1 - land) * 12 * u}px) rotateX(${interpolate(land, [0, 1], [58, 9])}deg) rotateY(${Math.sin(frame / 28) * 4}deg) scale(${1 + 0.04 * Math.sin(Math.min(sent, 1) * Math.PI)})` }}>
					<Card style={{ borderRadius: 5 * u, padding: `${2.6 * u}px ${2.6 * u}px ${2.6 * u}px ${4 * u}px`, fontSize: (portrait ? 5.2 : 5) * u, fontWeight: 500, color: C.text, display: 'flex', alignItems: 'center', boxShadow: `0 ${3 * u}px ${8 * u}px rgba(0,0,0,0.45), 0 0 ${10 * u}px rgba(103,89,239,${0.2 + 0.4 * Math.min(sent, 1)})` }}>
						<span>{typed}</span>
						<span style={{ width: 0.4 * u, height: 5 * u, marginLeft: 0.6 * u, background: caret ? C.primarySoft : 'transparent' }} />
						<span style={{ flex: 1 }} />
						<AgentMark size={8 * u} />
					</Card>
					<Rings at={SENT} size={portrait ? 80 : 90} count={2} />
				</div>
			</div>
			<Headline at={SENT + 2} size={portrait ? 9.5 : 8.4}>Pregúntaselo a <Accent>tu IA</Accent></Headline>
		</div>
	)
}

// ---- 2. La conexión: tu cuenta y tu agente --------------------------------------------------
const LINKED = 40
const Node = ({ at, label, turn, children }) => {
	const frame = useCurrentFrame()
	const { u, fps } = useUnits()
	const p = spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 80 } })
	const lit = interpolate(frame, [LINKED, LINKED + 8, LINKED + 40], [0, 1, 0.35], clamp)
	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.8 * u, perspective: 80 * u, opacity: interpolate(frame - at, [0, 8], [0, 1], clamp) }}>
			<div style={{ transform: `translateY(${Math.sin(frame / 22 + turn) * 0.8 * u}px) rotateY(${interpolate(p, [0, 1], [turn * 80, turn * 24])}deg) rotateX(${6 + Math.cos(frame / 30) * 3}deg) scale(${0.5 + 0.5 * p})` }}>
				<Card style={{ width: 21 * u, height: 21 * u, borderRadius: 5.5 * u, display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: `rgba(123,255,177,${0.18 + 0.6 * lit})`, boxShadow: `0 ${3 * u}px ${8 * u}px rgba(0,0,0,0.5), 0 0 ${9 * u}px rgba(103,89,239,${0.25 + 0.45 * lit})` }}>{children}</Card>
			</div>
			<div style={{ fontSize: 2.6 * u, fontWeight: 500, color: C.muted }}>{label}</div>
		</div>
	)
}

const Link = () => {
	const frame = useCurrentFrame()
	const { u, portrait } = useUnits()
	const grow = interpolate(frame, [22, LINKED], [0, 1], clamp)
	const wire = portrait ? 15 * u : 22 * u
	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 * u }}>
			<div style={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 * u }}>
				<Node at={2} turn={1} label="Tu cuenta"><Logo size={16} /></Node>
				<div style={{ width: wire, height: 21 * u, display: 'flex', alignItems: 'center', position: 'relative' }}>
					<div style={{ width: wire * grow, height: 0.4 * u, borderRadius: u, background: C.primarySoft, boxShadow: `0 0 ${1.6 * u}px ${C.primary}` }} />
					{[0, 1, 2].map(i => {
						const t = ((frame - LINKED - i * 11) % 33) / 33
						if (frame < LINKED + i * 11) return null
						const back = i === 1 // uno de los pulsos vuelve: el agente pregunta y la cuenta responde
						return <div key={i} style={{ position: 'absolute', left: wire * (back ? 1 - t : t) - 0.8 * u, width: 1.6 * u, height: 1.6 * u, borderRadius: '50%', background: back ? C.primarySoft : C.success, boxShadow: `0 0 ${2 * u}px ${back ? C.primarySoft : C.success}`, opacity: Math.sin(t * Math.PI) }} />
					})}
					<Rings at={LINKED} size={50} color={C.success} />
					<Burst at={LINKED} reach={20} count={16} seed="link" />
				</div>
				<Node at={10} turn={-1} label="Tu agente de IA"><AgentMark size={11 * u} /></Node>
			</div>
			<Headline at={26} size={portrait ? 7.4 : 6.4}>Tu QvaPay ya habla<br />con tu agente de IA</Headline>
		</div>
	)
}

// ---- 3. Demostración: pregunta, consulta, respuesta -----------------------------------------
const ToolChip = ({ at, until, name, size }) => {
	const frame = useCurrentFrame()
	const { u } = useUnits()
	if (frame < at || frame >= until) return null
	const dots = '.'.repeat(1 + (Math.floor((frame - at) / 6) % 3))
	return (
		<Rise at={at} distance={1.5} style={{ alignSelf: 'flex-start' }}>
			<div style={{ display: 'flex', alignItems: 'center', gap: 0.5 * size * u, fontSize: 0.72 * size * u, fontWeight: 500, color: C.muted, fontFamily: 'ui-monospace, Menlo, monospace', padding: `${0.25 * size * u}px ${0.15 * size * u}px` }}>
				<span style={{ width: 0.4 * size * u, height: 0.4 * size * u, borderRadius: '50%', background: C.success, opacity: 0.5 + 0.5 * Math.sin(frame / 3) }} />
				consultando {name}{dots}
			</div>
		</Rise>
	)
}

const Chat = () => {
	const { u, portrait } = useUnits()
	const s = portrait ? 3.4 : 2.5 // tamaño del texto dentro del teléfono, en u
	const phone = (
		<Phone at={0} width={portrait ? 66 : 44} height={portrait ? 82 : 68}>
			<div style={{ display: 'flex', alignItems: 'center', gap: 0.7 * s * u, padding: `${0.6 * s * u}px ${0.9 * s * u}px`, borderBottom: `${0.12 * u}px solid ${C.border}`, flexShrink: 0 }}>
				<AgentMark size={1.9 * s * u} />
				<div>
					<div style={{ fontSize: 0.95 * s * u, fontWeight: 700, color: C.text }}>Tu agente de IA</div>
					<div style={{ fontSize: 0.7 * s * u, fontWeight: 500, color: C.success }}>Conectado a QvaPay</div>
				</div>
			</div>
			<div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 * s * u, padding: `${0.8 * s * u}px ${0.75 * s * u}px` }}>
				<Bubble at={14} size={s} mine>¿Cuánto saldo tengo?</Bubble>
				<ToolChip at={28} until={52} size={s} name="qvapay_balance" />
				<Bubble at={52} size={s}>Tienes <Figure><Count at={54} to={248.5} prefix="$" suffix=" QUSD" /></Figure> disponibles.</Bubble>
				<Bubble at={84} size={s} mine>¿Qué me entró esta semana?</Bubble>
				<ToolChip at={98} until={122} size={s} name="qvapay_transactions" />
				<Bubble at={122} size={s}>Recibiste 3 pagos: <Figure><Count at={124} to={120} prefix="+$" suffix=" QUSD" /></Figure></Bubble>
			</div>
			<div style={{ fontSize: 0.66 * s * u, fontWeight: 500, color: C.muted, textAlign: 'center', padding: `${0.7 * s * u}px`, flexShrink: 0 }}>Cifras de ejemplo</div>
		</Phone>
	)
	const title = <Headline at={8} size={portrait ? 6.4 : 5.8}>Pregunta con<br /><Accent>tus palabras</Accent></Headline>
	const topics = <><Chip at={32}>Tu saldo</Chip><Chip at={62}>Tus movimientos</Chip><Chip at={92}>Tasas del mercado</Chip></>
	if (portrait) {
		return (
			<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3.4 * u, width: '100%' }}>
				{title}
				{phone}
				<div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1.6 * u }}>{topics}</div>
			</div>
		)
	}
	return (
		<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 * u, width: '100%' }}>
			{phone}
			<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4.4 * u }}>
				{title}
				<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.8 * u }}>{topics}</div>
			</div>
		</div>
	)
}

// ---- 4. Seguridad: solo lectura -------------------------------------------------------------
// El candado llega abierto y se cierra; un aro se dibuja a su alrededor
const CLOSED = 14
const Lock = ({ size }) => {
	const frame = useCurrentFrame()
	const { u, fps } = useUnits()
	const arrive = spring({ frame, fps, config: { damping: 12, stiffness: 120, mass: 0.7 } })
	const shut = spring({ frame: frame - CLOSED, fps, config: { damping: 9, stiffness: 240, mass: 0.5 } })
	const ring = interpolate(frame, [4, 30], [0, 1], clamp)
	return (
		<div style={{ position: 'relative', width: size * u, height: size * u, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.4 + 0.6 * arrive})`, opacity: interpolate(frame, [0, 6], [0, 1], clamp) }}>
			<svg width={size * u} height={size * u} viewBox="0 0 100 100" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
				<circle cx="50" cy="50" r="46" fill="rgba(103,89,239,0.12)" stroke={C.primarySoft} strokeWidth="2.2" strokeLinecap="round" strokeDasharray="289" strokeDashoffset={289 * (1 - ring)} />
			</svg>
			<svg width={size * 0.56 * u} height={size * 0.56 * u} viewBox="0 -4 24 28" fill="none">
				<path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke={C.primarySoft} strokeWidth="2" strokeLinecap="round" transform={`translate(0 ${(1 - shut) * -3.4})`} />
				<rect x="4.5" y="10.5" width="15" height="10" rx="2.6" fill={C.primary} />
				<circle cx="12" cy="15.5" r="1.6" fill={C.bg} />
			</svg>
			<Rings at={CLOSED + 2} size={size * 2.1} count={2} />
		</div>
	)
}

const Safe = () => {
	const { u, portrait } = useUnits()
	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3.6 * u }}>
			<Lock size={portrait ? 26 : 22} />
			<Headline at={10} size={portrait ? 9 : 7.6}>Solo lectura</Headline>
			<div style={{ display: 'flex', flexDirection: 'column', gap: 2.2 * u, marginTop: 0.6 * u }}>
				<Check at={26}>Consulta, pero no mueve tu dinero</Check>
				<Check at={38}>No ve tu PIN ni tus datos personales</Check>
				<Check at={50}>Lo desconectas cuando quieras</Check>
			</div>
		</div>
	)
}

// ---- 5. Cómo empezar ------------------------------------------------------------------------
const Steps = () => {
	const { u, portrait } = useUnits()
	return (
		<div style={{ width: portrait ? '100%' : '70%', display: 'flex', flexDirection: 'column', gap: 2.2 * u }}>
			<Headline at={0} size={portrait ? 6.6 : 5.6} style={{ marginBottom: 2.4 * u }}>Lo conectas en un minuto</Headline>
			<Step at={16} n="1">Entra a Ajustes, Agentes IA</Step>
			<Step at={34} n="2">Crea un token y cópialo</Step>
			<Step at={52} n="3">Pégalo en tu agente</Step>
		</div>
	)
}

// ---- 6. Cierre ------------------------------------------------------------------------------
const Cta = () => {
	const frame = useCurrentFrame()
	const { u, portrait, fps } = useUnits()
	const pop = spring({ frame: frame - 2, fps, config: { damping: 9, stiffness: 130, mass: 0.8 } })
	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4.4 * u }}>
			<div style={{ position: 'relative' }}>
				<Rings at={6} size={70} />
				<Burst at={5} reach={38} count={30} seed="cta" />
				<div style={{ opacity: interpolate(frame, [2, 8], [0, 1], clamp), transform: `scale(${0.3 + 0.7 * pop}) rotate(${(1 - pop) * -18}deg)` }}><Logo size={26} /></div>
			</div>
			<Headline at={12} size={portrait ? 8 : 6.8}>Conecta tu agente hoy</Headline>
			<UrlPill at={26}>qvapay.com/settings/agents</UrlPill>
			<Sub at={42} size={portrait ? 3.1 : 2.7}>Es el primer paso: iremos abriendo<br />más funciones poco a poco.</Sub>
		</div>
	)
}

// `min` = lo que dura la escena sin voz, en fotogramas a 30 fps. Con voz se alarga si hace falta.
export const scenes = [
	{ id: 'hook', min: 95, component: Hook },
	{ id: 'link', min: 110, component: Link },
	{ id: 'chat', min: 195, component: Chat },
	{ id: 'safe', min: 100, component: Safe },
	{ id: 'steps', min: 105, component: Steps },
	{ id: 'cta', min: 135, component: Cta },
]
