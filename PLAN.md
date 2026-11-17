# Plan: fábrica de videos de QvaPay

Para abrir `~/webs/qvapay-videos` en su propio worktree y seguir desde ahí. Escrito el 15 nov 2026.
Hay una copia en `~/webs/qvapay-videos/PLAN.md`, que es la que verá la sesión nueva.

## Dónde está todo

- Proyecto: `~/webs/qvapay-videos` (Remotion 4, React). Todavía NO es un repositorio de git.
- Reglas y comandos: `CLAUDE.md` de esa carpeta. Se carga solo al abrir una sesión ahí.
- Gustos de Erich: `GUSTOS.md` de esa carpeta. Todo comentario sobre un video se anota ahí.
- Primer video: Agentes IA (MCP), en `src/videos/mcp/`. Salidas en `out/`.

## Qué funciona hoy

- Un video sale en 4:3 (redes) y 9:16 (stories) desde el mismo código: `npm run video mcp`.
- Voz en off por escena con la voz del sistema, solo como borrador: `npm run audio mcp`.
- Cada escena se alarga sola para que su frase no se corte.
- La música ya está montada (fundidos y baja de volumen bajo la voz), pero no hay ninguna pista.

## Paso 0: abrirlo como proyecto propio

1. Convertir la carpeta en repositorio:
   ```bash
   cd ~/webs/qvapay-videos
   git init && git add -A && git commit -m "chore: video factory with the first promo"
   ```
   `.gitignore` ya excluye `node_modules` y `out`.
2. Decidir si va a GitHub (privado) o se queda local. Con remoto se puede abrir en Orca como
   cualquier otro repo.
3. Abrir un worktree nuevo sobre ese repo y empezar una sesión ahí.
4. Borrar `out/_McpPromo.old.jsx` (la versión anterior a la fábrica, ya no se usa).

## Mejoras, en orden

### 1. Voz natural

La voz del sistema suena robotizada. Elegido como primera opción: ElevenLabs; segunda, OpenAI.
El proyecto de Jack Dorsey (Dessa, de Block) no sirve: es un modelo de conversación con lista
de espera, no un servicio de locución.

- [x] Erich crea la cuenta y deja la clave en `~/webs/qvapay-videos/.env` (`ELEVENLABS_API_KEY=`).
      Nunca una clave del proyecto de la app. `.env` va al `.gitignore`.
- [x] `scripts/audio.mjs`: añadir `--provider elevenlabs` junto a la voz del sistema. Mismo
      contrato: un archivo por escena en `public/audio/<video>/vo-<escena>.wav` y `timing.json`.
- [x] Guardar la voz elegida y sus ajustes en un `voice.config.json` del proyecto, para que todos
      los videos suenen igual.
- [x] No regenerar una frase cuyo texto no cambió (guardar un hash por escena): cada llamada cuesta.
- [x] Prueba de oído: la misma frase con dos o tres voces latinas, y Erich elige. Eligió Kate.
- [x] Anotar en `GUSTOS.md` la voz elegida y el tono.

Costo: una locución son unos 400 caracteres, así que un video cuesta centavos. Lo que se paga es
el mínimo del plan. Preguntar antes de cualquier gasto.

### 2. Música

- [ ] Erich elige una pista con licencia para uso comercial y la deja en `public/music/default.mp3`.
- [ ] Anotar en `GUSTOS.md` de dónde salió y su licencia.
- [ ] Ajustar los dos volúmenes (`MUSIC_FULL` y `MUSIC_UNDER_VOICE` en `src/kit.jsx`) escuchando.
- [ ] Normalizar el volumen final del video con ffmpeg para que todos los videos suenen parejo.

### 3. Ritmo del video de Agentes IA

Con voz pasó de 25 a 33 segundos.

- [x] Acortar las frases de `src/videos/mcp/voice.json` para volver a unos 25 segundos. Quedó en 26.
- [ ] Que lo que se ve en cada escena entre a tiempo con lo que dice la voz.
- [ ] Erich revisa el movimiento: desde fotogramas sueltos no se puede juzgar.

### 4. Más formatos

- [ ] Añadir 4:5 (el que más ocupa en el canal de Telegram) y 16:9 a `FORMATS` en `src/kit.jsx`
      y a `scripts/render.mjs`. Hoy la lista está repetida en los dos archivos: dejarla en uno.

### 5. Interfaz real en vez de dibujada

- [ ] Probar una escena con capturas reales de la app (pantalla de Ajustes, Agentes IA) dentro de
      un marco de teléfono, en lugar del chat dibujado.
- [ ] Pieza `Phone` en el kit para reutilizarla.

### 6. De una lista de novedades a un video

La idea de fondo: Erich pasa un grupo de novedades y sale la presentación.

- [ ] Plantilla «novedades de la versión»: portada, una escena por novedad, cierre.
- [ ] Que se alimente de las notas de versión de la app (`scripts/release/notes.js` del repo
      `qpweb`), que ya están escritas para usuarios.
- [ ] Un comando que cree la carpeta de un video nuevo con sus archivos vacíos.

### 7. Publicar

- [ ] Miniatura de cada video (un fotograma elegido) para el canal.
- [ ] Subtítulos incrustados opcionales: mucha gente ve los videos sin sonido.

## Decisiones pendientes de Erich

1. ¿El repo va a GitHub o se queda local?
2. ¿ElevenLabs directo, o primero la comparación de oído con otro servicio?
3. ¿Voz de mujer o de hombre, y con qué tono?
4. ¿Qué pista de música?
5. Los colores: el video usa los del producto (`#0e0e1c`, `#6759ef`). La skill
   `qvapay-promo-video` pide otros (`#0F0F1A`, `#7C3AED`). ¿Cuáles son los de marca para redes?
6. Licencia de Remotion: es gratis para equipos muy pequeños y de pago a partir de cierto tamaño.
   Hay que revisar en qué tramo cae QvaPay antes de publicar videos de forma regular.

## Para la primera sesión en el proyecto nuevo

Empieza por el paso 0 y la mejora 1. Lee `CLAUDE.md` y `GUSTOS.md` antes de tocar nada.
