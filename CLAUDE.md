# Fábrica de videos de QvaPay

Videos cortos de producto y de novedades, hechos con Remotion (React que se renderiza a MP4).
Erich da el tema o una lista de novedades y de aquí salen los videos para redes.

## Antes de hacer un video

1. Lee `GUSTOS.md`. Son las preferencias de Erich y mandan sobre cualquier costumbre.
   El guion llega relleno según la plantilla de `GUION.md`; si Erich solo da el tema, se le
   ofrece esa plantilla para pasarla al agente que conozca la función.
2. Si falta un dato (dirección exacta, pasos, precios, límites), pregúntalo. Nunca inventes
   cifras, tasas ni límites; las cifras de un ejemplo en pantalla se avisan como ejemplo.
3. Comprueba que lo que el video promete ya está disponible para los usuarios.

## Reglas de marca

- Habla para Latinoamérica, en español neutro.
- Nunca se nombran proveedores (de energía, gift cards, verificación, IA…).
- El saldo y los pagos internos se llaman QUSD.
- Colores y fuente: los del producto, en `src/kit.jsx` (`C`). No se usan otros.
- Sin flechas de texto, sin degradados llamativos.

## Cómo está armado

- `src/kit.jsx`: lo común a todos los videos. Marca, unidades (`u`), animaciones (`Rise`,
  `Flip`, `Rings`, `Burst`, `Count`), texto (`Headline`, que entra palabra a palabra, y `Sub`),
  bloques (`Bubble`, `Step`, `Check`, `Card`, `UrlPill`, `Logo`, `Phone`), el fondo, los
  cambios de escena, la línea de tiempo y el audio. Una pieza que vaya a servir en otro video
  se escribe aquí.
- `src/depth.jsx`: el fondo en 3D (three.js) por el que avanza la cámara. Necesita WebGL al
  renderizar: lo activa `remotion.config.js`.
- `src/videos/<nombre>/index.jsx`: las escenas de un video. Exporta `scenes`
  (`[{ id, min, component }]`, `min` en fotogramas a 30 fps).
- `src/videos/<nombre>/voice.json`: la locución, una frase por escena (`{ id: "texto" }`).
- `src/videos/<nombre>/timing.json`: lo genera `npm run audio`. No se edita a mano.
- `src/index.jsx`: registro. Cada video sale como `<nombre>-feed` (4:3) y `<nombre>-story` (9:16).

Todo se mide en `u` (`useUnits()`), nunca en píxeles fijos: así el mismo diseño vale en los dos
formatos. Para lo que cambia entre formatos está `portrait`.

Una escena dura su `min` o lo que dure su locución más un respiro, lo que sea mayor. La voz
nunca se corta; si una frase alarga demasiado una escena, se acorta la frase.

## Comandos

```bash
npm run studio                     # editor en el navegador, con vista previa en vivo
npm run audio <video>              # voz de borrador + timing.json
npm run audio <video> -- --keep    # solo mide los audios que ya estén (voz de un locutor)
npm run audio <video> -- --provider elevenlabs --dry   # qué generaría y cuántos caracteres (gratis)
npm run audio <video> -- --provider elevenlabs         # voz natural, DE PAGO: se pregunta antes
npm run audio -- --voices          # voces de la cuenta de ElevenLabs, con su id
npm run audio <video> -- --try <id>,<id> --scene hook  # prueba de oído en out/voces/ (de pago)
npm run music <nombre> -- --prompt "estilo" --seconds 30   # pista en out/musica/ (de pago)
npm run video <video>              # renderiza los dos formatos
npm run video <video> -- --mute    # además, versiones sin sonido
npx remotion still src/index.jsx <video>-feed out/x.png --frame=120   # un fotograma para revisar
```

## Voz y música

- La voz de `npm run audio` es la del sistema: un BORRADOR para medir tiempos. La definitiva
  sale con `--provider elevenlabs`; la voz y sus ajustes están en `voice.config.json` (los
  mismos para todos los videos) y la clave en `.env` (`ELEVENLABS_API_KEY=`, propia de este
  proyecto, nunca una de la app).
- Solo se vuelve a generar la frase cuyo texto, voz o ajustes cambiaron (huella por escena en
  `timing.json`). El borrador no pisa una voz de pago salvo con `--force`.
- Para la voz de un locutor: sustituir `public/audio/<video>/vo-<escena>.wav` y correr
  `npm run audio <video> -- --keep`.
- La música va en `public/music/<video>.mp3` o `public/music/default.mp3`. Baja sola mientras
  hay voz. Solo música con licencia para uso comercial; anota de dónde salió en `GUSTOS.md`.
- Generar voz con un servicio de pago cuesta dinero: se pregunta antes.

## Revisar antes de entregar

- Saca fotogramas sueltos de cada escena en los DOS formatos y míralos: texto cortado, líneas
  con una sola palabra, elementos pegados al borde.
- El ritmo y el movimiento no se pueden juzgar desde fotogramas: se le dice a Erich que esa
  parte la revise él.
- Lo que Erich comente del resultado se anota en `GUSTOS.md`.
