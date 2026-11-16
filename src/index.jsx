import React from 'react'
import { Composition, registerRoot } from 'remotion'
import { FORMATS, FPS, Video, buildTimeline } from './kit'

// Registro de videos. Para añadir uno: crea src/videos/<nombre>/index.jsx (exporta `scenes`),
// su voice.json, corre `npm run audio <nombre>` y añade aquí una línea.
import { scenes as mcpScenes } from './videos/mcp'
import mcpTiming from './videos/mcp/timing.json'

const VIDEOS = {
	mcp: buildTimeline(mcpScenes, mcpTiming),
}

// Las props de una composición tienen que ser JSON, y la línea de tiempo lleva componentes:
// cada video se envuelve en su propio componente y solo `mute` viaja como prop.
const wrap = (timeline) => function QvaPayVideo({ mute }) { return <Video timeline={timeline} mute={mute} /> }
const COMPONENTS = Object.fromEntries(Object.entries(VIDEOS).map(([name, timeline]) => [name, wrap(timeline)]))

// Cada video sale en todos los formatos: <nombre>-feed y <nombre>-story
const Root = () => (
	<>
		{Object.entries(VIDEOS).flatMap(([name, timeline]) => Object.entries(FORMATS).map(([format, size]) => (
			<Composition
				key={`${name}-${format}`}
				id={`${name}-${format}`}
				component={COMPONENTS[name]}
				defaultProps={{ mute: false }}
				durationInFrames={timeline.duration}
				fps={FPS}
				width={size.width}
				height={size.height}
			/>
		)))}
	</>
)

registerRoot(Root)
