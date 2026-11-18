// Fondo en 3D de todos los videos: piezas brillantes que flotan mientras la cámara avanza.
// Están repartidas alrededor del eje de la cámara, así que el centro (donde va el texto) queda
// despejado, y la niebla del color del fondo las apaga a lo lejos. Lo usa `Background` del kit.
import React from 'react'
import { ThreeCanvas } from '@remotion/three'
import { random, useVideoConfig } from 'remotion'

const COUNT = 30
const DEPTH = 64 // largo del túnel; al pasar la cámara, cada pieza vuelve al fondo
const KINDS = ['coin', 'ring', 'ball', 'pill', 'coin', 'ring']

const Geometry = ({ kind }) => {
	if (kind === 'coin') return <cylinderGeometry args={[0.95, 0.95, 0.2, 48]} />
	if (kind === 'ring') return <torusGeometry args={[0.8, 0.24, 24, 64]} />
	if (kind === 'pill') return <capsuleGeometry args={[0.36, 1, 12, 32]} />
	return <sphereGeometry args={[0.5, 40, 40]} />
}

// `travel` = cuánto ha avanzado la cámara; `frame` mueve el giro de cada pieza
export const Depth = ({ travel, frame, colors }) => {
	const { width, height } = useVideoConfig()
	const spread = width > height ? [1.25, 0.8] : [0.7, 1.3] // el túnel se estira hacia el lado largo
	const palette = [colors.primary, colors.primarySoft, colors.primary, colors.primarySoft, colors.primarySoft, colors.primary, colors.success]
	return (
		<ThreeCanvas width={width} height={height} style={{ position: 'absolute', inset: 0 }} camera={{ fov: 55, position: [0, 0, 0], near: 0.1, far: 80 }} gl={{ alpha: true, antialias: true }}>
			<fog attach="fog" args={[colors.bg, 5, 38]} />
			<hemisphereLight args={[colors.text, colors.bg, 1.1]} />
			<directionalLight position={[5, 8, 6]} intensity={2.6} />
			<directionalLight position={[-6, -4, 2]} intensity={1.4} color={colors.primarySoft} />
			{Array.from({ length: COUNT }, (_, i) => {
				const angle = random(`angle-${i}`) * Math.PI * 2
				const radius = 6.4 + random(`radius-${i}`) * 7
				const distance = (((random(`z-${i}`) * DEPTH - travel) % DEPTH) + DEPTH) % DEPTH
				const spin = frame * (0.012 + random(`spin-${i}`) * 0.02)
				// A lo lejos la niebla las deja como sombras sobre el halo: mejor que nazcan al acercarse
				const scale = (0.7 + random(`scale-${i}`) * 1.1) * Math.min(1, Math.max(0, (30 - distance) / 8))
				return (
					<mesh
						key={i}
						position={[Math.cos(angle) * radius * spread[0], Math.sin(angle) * radius * spread[1], -distance]}
						rotation={[random(`rx-${i}`) * 6 + spin, random(`ry-${i}`) * 6 + spin * 0.7, random(`rz-${i}`) * 6]}
						scale={scale}
					>
						<Geometry kind={KINDS[i % KINDS.length]} />
						<meshPhysicalMaterial color={palette[i % palette.length]} roughness={0.28} metalness={0.15} clearcoat={0.8} clearcoatRoughness={0.25} />
					</mesh>
				)
			})}
		</ThreeCanvas>
	)
}
