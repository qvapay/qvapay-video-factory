// Agentes IA (MCP): conecta tu cuenta a un agente de IA. Solo lectura.
// La locución de cada escena está en voice.json; `npm run audio mcp` la convierte en audio.
import React from 'react'
import { interpolate, useCurrentFrame } from 'remotion'
import { Accent, Bubble, C, Card, Check, Figure, Headline, Logo, Rise, Step, Sub, UrlPill, clamp, useUnits } from '../../kit'

// ---- 1. Gancho: alguien escribe la pregunta -------------------------------------------------
const QUESTION = '¿Cuánto saldo tengo?'
const Hook = () => {
	const frame = useCurrentFrame()
	const { u, portrait } = useUnits()
	const typed = QUESTION.slice(0, Math.floor(interpolate(frame, [8, 44], [0, QUESTION.length], clamp)))
	const caret = frame < 50 && Math.floor(frame / 8) % 2 === 0
	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 * u, width: '100%' }}>
			<Rise at={0} style={{ width: portrait ? '100%' : '78%' }}>
				<Card style={{ borderRadius: 5 * u, padding: `${3.2 * u}px ${4 * u}px`, fontSize: (portrait ? 5.4 : 5) * u, fontWeight: 500, color: C.text, minHeight: 7 * u, display: 'flex', alignItems: 'center' }}>
					<span>{typed}</span>
					<span style={{ width: 0.4 * u, height: 5 * u, marginLeft: 0.6 * u, background: caret ? C.primarySoft : 'transparent' }} />
				</Card>
			</Rise>
			<Headline at={52} size={portrait ? 9.5 : 8.4}>Pregúntaselo a <Accent>tu IA</Accent></Headline>
		</div>
	)
}

// ---- 2. La conexión: tu cuenta y tu agente --------------------------------------------------
const Node = ({ at, label, children }) => {
	const { u } = useUnits()
	return (
		<Rise at={at} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.6 * u }}>
			<Card style={{ width: 19 * u, height: 19 * u, borderRadius: 5 * u, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</Card>
			<div style={{ fontSize: 2.5 * u, fontWeight: 500, color: C.muted }}>{label}</div>
		</Rise>
	)
}

const AgentMark = ({ size }) => {
	const frame = useCurrentFrame()
	const pulse = 1 + Math.sin(frame / 7) * 0.06
	const eye = { width: size * 0.13, height: size * 0.22, borderRadius: size, background: C.bg }
	return (
		<div style={{ width: size, height: size, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, ${C.primarySoft}, ${C.primary} 60%)`, transform: `scale(${pulse})`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: size * 0.14 }}>
			<span style={eye} /><span style={eye} />
		</div>
	)
}

const Link = () => {
	const frame = useCurrentFrame()
	const { u, portrait } = useUnits()
	const grow = interpolate(frame, [26, 50], [0, 1], clamp)
	const dot = ((frame - 50) % 40) / 40
	const wire = portrait ? 16 * u : 22 * u
	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 * u }}>
			<div style={{ display: 'flex', alignItems: 'flex-start', gap: 2 * u }}>
				<Node at={4} label="Tu cuenta"><Logo size={15} /></Node>
				<div style={{ width: wire, height: 19 * u, display: 'flex', alignItems: 'center', position: 'relative' }}>
					<div style={{ width: wire * grow, height: 0.35 * u, borderRadius: u, background: `linear-gradient(90deg, ${C.primary}, ${C.primarySoft})` }} />
					{frame > 50 && <div style={{ position: 'absolute', left: wire * dot - 0.8 * u, width: 1.6 * u, height: 1.6 * u, borderRadius: '50%', background: C.success, boxShadow: `0 0 ${2 * u}px ${C.success}` }} />}
				</div>
				<Node at={14} label="Tu agente de IA"><AgentMark size={10 * u} /></Node>
			</div>
			<Headline at={40} size={portrait ? 7.4 : 6.4}>Tu QvaPay ya habla<br />con tu agente de IA</Headline>
		</div>
	)
}

// ---- 3. Demostración: pregunta, consulta, respuesta -----------------------------------------
const ToolChip = ({ at, until, name }) => {
	const frame = useCurrentFrame()
	const { u, portrait } = useUnits()
	if (frame < at || frame > until) return null
	const dots = '.'.repeat(1 + (Math.floor((frame - at) / 6) % 3))
	return (
		<Rise at={at} distance={1.5} style={{ alignSelf: 'flex-start' }}>
			<div style={{ display: 'flex', alignItems: 'center', gap: 1.2 * u, fontSize: (portrait ? 2.7 : 2.3) * u, fontWeight: 500, color: C.muted, fontFamily: 'ui-monospace, Menlo, monospace', padding: `${0.6 * u}px ${0.4 * u}px` }}>
				<span style={{ width: 1.2 * u, height: 1.2 * u, borderRadius: '50%', background: C.success }} />
				consultando {name}{dots}
			</div>
		</Rise>
	)
}

const Chat = () => {
	const { u, portrait } = useUnits()
	return (
		<div style={{ width: portrait ? '100%' : '74%', display: 'flex', flexDirection: 'column', gap: 1.8 * u }}>
			<Bubble at={4} mine>¿Cuánto saldo tengo?</Bubble>
			<ToolChip at={22} until={50} name="qvapay_balance" />
			<Bubble at={50}>Tienes <Figure>$248.50 QUSD</Figure> disponibles.</Bubble>
			<Bubble at={92} mine>¿Qué me entró esta semana?</Bubble>
			<ToolChip at={110} until={138} name="qvapay_transactions" />
			<Bubble at={138}>Recibiste 3 pagos: <Figure>+$120.00 QUSD</Figure></Bubble>
			<Sub at={176} size={portrait ? 3 : 2.6} style={{ marginTop: 2 * u }}>También precios y tasas del mercado P2P</Sub>
		</div>
	)
}

// ---- 4. Seguridad: solo lectura -------------------------------------------------------------
const Lock = ({ size }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<rect x="4.5" y="10.5" width="15" height="10" rx="2.6" fill={C.primary} />
		<path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke={C.primarySoft} strokeWidth="2" strokeLinecap="round" />
		<circle cx="12" cy="15.5" r="1.6" fill={C.bg} />
	</svg>
)

const Safe = () => {
	const { u, portrait } = useUnits()
	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 * u }}>
			<Rise at={2}><Lock size={13 * u} /></Rise>
			<Headline at={10} size={portrait ? 9 : 7.6}>Solo lectura</Headline>
			<div style={{ display: 'flex', flexDirection: 'column', gap: 2.2 * u, marginTop: u }}>
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
			<Step at={14} n="1">Entra a Ajustes, Agentes IA</Step>
			<Step at={28} n="2">Crea un token y cópialo</Step>
			<Step at={42} n="3">Pégalo en tu agente</Step>
		</div>
	)
}

// ---- 6. Cierre ------------------------------------------------------------------------------
const Cta = () => {
	const { u, portrait } = useUnits()
	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4.4 * u }}>
			<Rise at={2}><Logo size={26} /></Rise>
			<Headline at={12} size={portrait ? 8 : 6.8}>Conecta tu agente hoy</Headline>
			<UrlPill at={24}>qvapay.com/settings/agents</UrlPill>
			<Sub at={40} size={portrait ? 3.1 : 2.7}>Es el primer paso: iremos abriendo<br />más funciones poco a poco.</Sub>
		</div>
	)
}

// `min` = lo que dura la escena sin voz, en fotogramas a 30 fps. Con voz se alarga si hace falta.
export const scenes = [
	{ id: 'hook', min: 95, component: Hook },
	{ id: 'link', min: 110, component: Link },
	{ id: 'chat', min: 225, component: Chat },
	{ id: 'safe', min: 100, component: Safe },
	{ id: 'steps', min: 100, component: Steps },
	{ id: 'cta', min: 135, component: Cta },
]
