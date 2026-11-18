// Recargas a Cuba, promo del 16 al 20 nov 2026: Súper Plan de saldo y combos con GOLD.
// Datos de la app (scripts/oneoff/etecsa-promo-nov-2026.mjs y notas de la versión 4.40.0):
//   3000 CUP             $14.49 · $13.99 con GOLD
//   1000 CUP + 1 mes     $7.99
//   3000 CUP + 1 mes     $17.49
// Los sats son cashback para miembros GOLD: 10 por dólar (80, 140 y 175). Hay cupo diario.
import React from 'react'
import { interpolate, spring, useCurrentFrame } from 'remotion'
import { Accent, Burst, C, Card, Chip, Count, Headline, Logo, Phone, Rings, Sub, Tag, UrlPill, clamp, useUnits } from '../../kit'

const DEADLINE = 'Hasta 20/11'

// Tarjeta de una oferta. `wide` = en fila (para apilarlas en vertical); `turn` = hacia dónde mira.
const Offer = ({ at, cup, price, gold, extra, turn = 0, wide }) => {
	const frame = useCurrentFrame()
	const { u, fps } = useUnits()
	const p = spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 90 } })
	const float = Math.sin(frame / 26 + at) * 0.5 * u
	return (
		<div style={{ perspective: 90 * u, opacity: interpolate(frame - at, [0, 6], [0, 1], clamp), flex: wide ? 'none' : 1, width: wide ? '100%' : undefined }}>
			<div style={{ transform: `translateY(${(1 - p) * 9 * u + float}px) rotateY(${turn * 16 + (1 - p) * 55}deg) rotateX(${(1 - p) * 30 + 4}deg)` }}>
				<Card style={{ padding: `${2.6 * u}px ${3 * u}px`, display: 'flex', flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : 'flex-start', justifyContent: 'space-between', gap: 2 * u, boxShadow: `0 ${3 * u}px ${8 * u}px rgba(0,0,0,0.5), 0 0 ${8 * u}px rgba(103,89,239,0.28)` }}>
					<div>
						<div style={{ fontSize: 2.6 * u, fontWeight: 500, color: C.muted }}>Saldo móvil</div>
						<div style={{ fontSize: 5.6 * u, fontWeight: 800, color: C.text, whiteSpace: 'nowrap', letterSpacing: -0.1 * u }}>{cup} CUP</div>
						{extra && <div style={{ display: 'inline-block', marginTop: 0.8 * u, background: C.primary, color: C.text, borderRadius: 2 * u, padding: `${0.5 * u}px ${1.5 * u}px`, fontSize: 2.6 * u, fontWeight: 700, whiteSpace: 'nowrap' }}>{extra}</div>}
					</div>
					<div style={{ textAlign: wide ? 'right' : 'left' }}>
						<div style={{ fontSize: 5 * u, fontWeight: 800, color: C.success, fontVariantNumeric: 'tabular-nums' }}>${price}</div>
						{gold && <div style={{ fontSize: 2.6 * u, fontWeight: 500, color: C.muted, whiteSpace: 'nowrap' }}>${gold} con GOLD</div>}
					</div>
				</Card>
			</div>
		</div>
	)
}

const OFFERS = [
	{ cup: 1000, price: '7.99', extra: '+ 1 mes de GOLD' },
	{ cup: 3000, price: '14.49', gold: '13.99' },
	{ cup: 3000, price: '17.49', extra: '+ 1 mes de GOLD' },
]

// ---- 1. Gancho: las tres ofertas y la fecha límite ------------------------------------------
const Hook = () => {
	const { u, portrait } = useUnits()
	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: (portrait ? 4 : 4.6) * u, width: '100%' }}>
			<Headline at={2} size={portrait ? 9 : 8.4}>Recargas <Accent>a Cuba</Accent></Headline>
			<Tag at={22} size={portrait ? 3.6 : 3.4}>{DEADLINE}</Tag>
			<div style={{ display: 'flex', flexDirection: portrait ? 'column' : 'row', gap: (portrait ? 2.4 : 3) * u, width: '100%', marginTop: u }}>
				{OFFERS.map((offer, i) => <Offer key={i} at={30 + i * 9} turn={portrait ? 0 : 1 - i} wide={portrait} {...offer} />)}
			</div>
		</div>
	)
}

// ---- 2. Qué es: pagas con QUSD, llega saldo móvil -------------------------------------------
const ARRIVES = 44
const Coin = ({ at, turn, label, color, children }) => {
	const frame = useCurrentFrame()
	const { u, fps } = useUnits()
	const p = spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 80 } })
	const lit = interpolate(frame, [ARRIVES, ARRIVES + 8, ARRIVES + 40], [0, 1, 0.35], clamp)
	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.8 * u, perspective: 80 * u, opacity: interpolate(frame - at, [0, 8], [0, 1], clamp) }}>
			<div style={{ transform: `translateY(${Math.sin(frame / 22 + turn) * 0.8 * u}px) rotateY(${interpolate(p, [0, 1], [turn * 80, turn * 24])}deg) rotateX(${6 + Math.cos(frame / 30) * 3}deg) scale(${0.5 + 0.5 * p})` }}>
				<Card style={{ width: 23 * u, height: 21 * u, borderRadius: 5.5 * u, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6 * u, fontWeight: 800, color, borderColor: `rgba(123,255,177,${0.18 + 0.6 * lit})`, boxShadow: `0 ${3 * u}px ${8 * u}px rgba(0,0,0,0.5), 0 0 ${9 * u}px rgba(103,89,239,${0.25 + 0.45 * lit})` }}>{children}</Card>
			</div>
			<div style={{ fontSize: 2.6 * u, fontWeight: 500, color: C.muted }}>{label}</div>
		</div>
	)
}

const What = () => {
	const frame = useCurrentFrame()
	const { u, portrait } = useUnits()
	const grow = interpolate(frame, [24, ARRIVES], [0, 1], clamp)
	const wire = portrait ? 13 * u : 22 * u
	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 * u }}>
			<div style={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 * u }}>
				<Coin at={2} turn={1} label="Pagas con tu saldo" color={C.primarySoft}>QUSD</Coin>
				<div style={{ width: wire, height: 21 * u, display: 'flex', alignItems: 'center', position: 'relative' }}>
					<div style={{ width: wire * grow, height: 0.4 * u, borderRadius: u, background: C.primarySoft, boxShadow: `0 0 ${1.6 * u}px ${C.primary}` }} />
					{[0, 1, 2].map(i => {
						if (frame < ARRIVES + i * 10) return null
						const t = ((frame - ARRIVES - i * 10) % 30) / 30
						return <div key={i} style={{ position: 'absolute', left: wire * t - 0.8 * u, width: 1.6 * u, height: 1.6 * u, borderRadius: '50%', background: C.success, boxShadow: `0 0 ${2 * u}px ${C.success}`, opacity: Math.sin(t * Math.PI) }} />
					})}
					<Rings at={ARRIVES} size={46} color={C.success} />
				</div>
				<Coin at={10} turn={-1} label="Llega saldo móvil" color={C.success}>CUP</Coin>
			</div>
			<Headline at={30} size={portrait ? 8 : 7}>1000 CUP por <Accent>$7.99</Accent></Headline>
			<Sub at={52} size={portrait ? 3.3 : 2.9}>Combo con 1 mes de GOLD incluido</Sub>
		</div>
	)
}

// ---- 3. Demostración: eliges, pagas, llega --------------------------------------------------
const PICK = 34
const PAY = 112
const DONE = 124
const NUMBER = '+53 5••• ••••'
const Demo = () => {
	const frame = useCurrentFrame()
	const { u, portrait, fps } = useUnits()
	const s = (portrait ? 3.4 : 2.5) * u // tamaño del texto dentro del teléfono
	const picked = interpolate(frame, [PICK, PICK + 8], [0, 1], clamp)
	const typed = NUMBER.slice(0, Math.floor(interpolate(frame, [60, 92], [0, NUMBER.length], clamp)))
	const press = interpolate(frame, [PAY - 5, PAY, PAY + 6], [1, 0.93, 1], clamp)
	const done = spring({ frame: frame - DONE, fps, config: { damping: 12, stiffness: 150, mass: 0.7 } })
	const drawn = interpolate(frame, [DONE + 4, DONE + 18], [0, 1], clamp)
	const box = { background: C.surface, border: `${0.15 * u}px solid ${C.border}`, borderRadius: 1.1 * s, padding: `${0.75 * s}px ${0.95 * s}px` }
	const phone = (
		<Phone at={0} width={portrait ? 66 : 44} height={portrait ? 76 : 62}>
			<div style={{ padding: `${0.7 * s}px ${1.1 * s}px`, borderBottom: `${0.12 * u}px solid ${C.border}`, flexShrink: 0 }}>
				<div style={{ fontSize: 1.05 * s, fontWeight: 800, color: C.text }}>Recarga a Cuba</div>
				<div style={{ fontSize: 0.72 * s, fontWeight: 500, color: C.muted }}>Ofertas QvaPay · {DEADLINE}</div>
			</div>
			<div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75 * s, padding: `${0.9 * s}px ${0.85 * s}px` }}>
				<div style={{ ...box, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: interpolate(frame, [14, 22], [0, 1], clamp), borderColor: picked ? C.primarySoft : C.border, boxShadow: `0 0 ${1.2 * s}px rgba(103,89,239,${0.7 * picked})`, transform: `scale(${1 + 0.03 * Math.sin(picked * Math.PI)})` }}>
					<div>
						<div style={{ fontSize: 0.7 * s, fontWeight: 500, color: C.muted }}>Saldo móvil</div>
						<div style={{ fontSize: 1.3 * s, fontWeight: 800, color: C.text }}>3000 CUP</div>
					</div>
					<div style={{ textAlign: 'right' }}>
						<div style={{ fontSize: 1.3 * s, fontWeight: 800, color: C.success }}>$14.49</div>
						<div style={{ fontSize: 0.66 * s, fontWeight: 500, color: C.muted }}>$13.99 con GOLD</div>
					</div>
				</div>
				<div style={{ ...box, opacity: interpolate(frame, [48, 56], [0, 1], clamp) }}>
					<div style={{ fontSize: 0.7 * s, fontWeight: 500, color: C.muted }}>Número a recargar</div>
					<div style={{ fontSize: 1.2 * s, fontWeight: 700, color: C.text, minHeight: 1.5 * s, fontVariantNumeric: 'tabular-nums' }}>{typed}</div>
				</div>
				<div style={{ background: C.primary, color: C.text, borderRadius: 1.1 * s, padding: `${0.8 * s}px`, textAlign: 'center', fontSize: 1.05 * s, fontWeight: 700, opacity: interpolate(frame, [92, 100], [0, 1], clamp), transform: `scale(${press})`, boxShadow: `0 0 ${1.6 * s}px rgba(103,89,239,0.6)` }}>Pagar con saldo</div>
			</div>
			{frame >= DONE && (
				<div style={{ position: 'absolute', inset: 0, background: C.bg, opacity: interpolate(frame, [DONE, DONE + 6], [0, 1], clamp), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.1 * s }}>
					<div style={{ position: 'relative', width: 6.4 * s, height: 6.4 * s, borderRadius: '50%', background: 'rgba(123,255,177,0.14)', border: `${0.14 * s}px solid ${C.success}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.4 + 0.6 * done})` }}>
						<svg width={3.6 * s} height={3.6 * s} viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7.5" stroke={C.success} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="21" strokeDashoffset={21 * (1 - drawn)} /></svg>
						<Rings at={DONE + 2} size={portrait ? 46 : 34} count={2} color={C.success} />
					</div>
					<div style={{ fontSize: 1.7 * s, fontWeight: 800, color: C.text }}>¡Listo!</div>
					<div style={{ fontSize: 0.95 * s, fontWeight: 500, color: C.muted }}>3000 CUP en camino</div>
				</div>
			)}
		</Phone>
	)
	const title = <Headline at={8} size={portrait ? 6.6 : 6}>Elige, paga, <Accent>listo</Accent></Headline>
	const topics = <><Chip at={PICK}>Tu oferta</Chip><Chip at={PAY}>Pago con QUSD</Chip><Chip at={DONE + 8}>Saldo en el número</Chip></>
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

// ---- 4. Los combos traen GOLD ---------------------------------------------------------------
const Gold = () => {
	const { u, portrait } = useUnits()
	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4.4 * u, width: portrait ? '100%' : '84%' }}>
			<Headline at={2} size={portrait ? 8 : 7.2}>1 mes de <Accent>GOLD</Accent> incluido</Headline>
			<div style={{ display: 'flex', flexDirection: portrait ? 'column' : 'row', gap: (portrait ? 2.4 : 3.4) * u, width: '100%' }}>
				<Offer at={20} turn={portrait ? 0 : 1} wide={portrait} {...OFFERS[0]} />
				<Offer at={30} turn={portrait ? 0 : -1} wide={portrait} {...OFFERS[2]} />
			</div>
			<Sub at={46} size={portrait ? 3.3 : 2.9}>GOLD se activa al llegar el saldo</Sub>
		</div>
	)
}

// ---- 5. Con GOLD, sats en cada recarga ------------------------------------------------------
const Reward = ({ at, sats, big }) => {
	const frame = useCurrentFrame()
	const { u, fps } = useUnits()
	const p = spring({ frame: frame - at, fps, config: { damping: 9, stiffness: 160, mass: 0.7 } })
	const d = (big ? 25 : 20) * u
	return (
		<div style={{ position: 'relative', width: d, height: d, opacity: interpolate(frame - at, [0, 5], [0, 1], clamp) }}>
			<Burst at={at + 2} reach={big ? 24 : 17} count={big ? 22 : 12} seed={`sats-${sats}`} colors={[C.success, C.primarySoft, C.text]} />
			<div style={{ width: d, height: d, borderRadius: '50%', background: 'rgba(123,255,177,0.12)', border: `${0.3 * u}px solid ${C.success}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.3 + 0.7 * p}) rotate(${(1 - p) * -25}deg)`, boxShadow: `0 0 ${6 * u}px rgba(123,255,177,${big ? 0.4 : 0.22})` }}>
				<div style={{ fontSize: (big ? 7.4 : 5.8) * u, fontWeight: 800, color: C.success, lineHeight: 1 }}><Count at={at} to={sats} decimals={0} prefix="+" frames={16} /></div>
				<div style={{ fontSize: (big ? 3 : 2.5) * u, fontWeight: 700, color: C.text }}>sats</div>
			</div>
		</div>
	)
}

const Sats = () => {
	const { u, portrait } = useUnits()
	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4.6 * u }}>
			<div style={{ display: 'flex', alignItems: 'center', gap: (portrait ? 2 : 4) * u }}>
				<Reward at={8} sats={80} />
				<Reward at={20} sats={140} />
				<Reward at={32} sats={175} big />
			</div>
			<Headline at={24} size={portrait ? 8.6 : 7.6}>Hasta <Accent>+175 sats</Accent></Headline>
			<Sub at={46} size={portrait ? 3.3 : 2.9}>Cashback en cada recarga para miembros GOLD</Sub>
		</div>
	)
}

// ---- 6. Cierre ------------------------------------------------------------------------------
const Cta = () => {
	const frame = useCurrentFrame()
	const { u, portrait, fps } = useUnits()
	const pop = spring({ frame: frame - 2, fps, config: { damping: 9, stiffness: 130, mass: 0.8 } })
	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 * u }}>
			<div style={{ position: 'relative' }}>
				<Rings at={6} size={70} />
				<Burst at={5} reach={38} count={30} seed="cta" />
				<div style={{ opacity: interpolate(frame, [2, 8], [0, 1], clamp), transform: `scale(${0.3 + 0.7 * pop}) rotate(${(1 - pop) * -18}deg)` }}><Logo size={24} /></div>
			</div>
			<Headline at={12} size={portrait ? 8 : 6.8}>Recarga en QvaPay</Headline>
			<UrlPill at={26}>qvapay.com/shop/topups</UrlPill>
			<Tag at={38} size={portrait ? 3.4 : 3}>{DEADLINE}</Tag>
			<Sub at={48} size={portrait ? 3.1 : 2.7}>Ofertas con cupo diario</Sub>
		</div>
	)
}

// `min` = lo que dura la escena sin voz, en fotogramas a 30 fps. Con voz se alarga si hace falta.
export const scenes = [
	{ id: 'hook', min: 110, component: Hook },
	{ id: 'what', min: 105, component: What },
	{ id: 'demo', min: 190, component: Demo },
	{ id: 'gold', min: 100, component: Gold },
	{ id: 'sats', min: 100, component: Sats },
	{ id: 'cta', min: 130, component: Cta },
]
