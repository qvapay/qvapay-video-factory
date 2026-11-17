// El fondo en 3D (src/depth.jsx) necesita WebGL también al renderizar
import { Config } from '@remotion/cli/config'

Config.setChromiumOpenGlRenderer('angle')
