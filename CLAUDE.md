# Fábrica de videos de QvaPay

Videos cortos de producto y de novedades, hechos con Remotion (React que se renderiza a MP4).
Erich da el tema o una lista de novedades y de aquí salen los videos para redes.

## Antes de hacer un video

1. Lee `GUSTOS.md`. Son las preferencias de Erich y mandan sobre cualquier costumbre.
2. Si falta un dato (dirección exacta, pasos, precios, límites), pregúntalo. Nunca inventes
   cifras, tasas ni límites; las cifras de un ejemplo en pantalla se avisan como ejemplo.
3. Comprueba que lo que el video promete ya está disponible para los usuarios.

## Reglas de marca

- Habla para Latinoamérica, en español neutro. No se menciona Cuba en piezas públicas salvo que
  Erich lo pida.
- Nunca se nombran proveedores (de energía, gift cards, verificación, IA…).
- El saldo y los pagos internos se llaman QUSD.
- Colores y fuente: los del producto, en `src/kit.jsx` (`C`). No se usan otros.
- Sin flechas de texto, sin degradados llamativos.

## Logo

El logo es el símbolo de los dos trazos (un check y una barra). Siempre se pone con `<Logo>` de
`src/kit.jsx`, que lo dibuja en vector; nunca se redibuja, se deforma ni se sustituye por una
imagen.

- Sobre fondo oscuro o blanco: símbolo morado, `<Logo size={26} />`.
- Sobre morado: símbolo blanco, `<Logo size={26} color={C.text} />`.
- Como icono de la app (cuadro morado con el símbolo blanco): `<Logo size={26} tile />`.
- Va en el cierre de cada video, y donde haya que representar a QvaPay o la cuenta del usuario.
- Los originales están en `brand/` (fondo morado y fondo blanco). El editable de Pixelmator
  queda en la máquina de Erich: `~/Qvapay/Rebranding/logo-qvapay.pxd`.

## Cómo está armado

- `src/kit.jsx`: lo común a todos los videos. Marca, unidades (`u`), animaciones (`Rise`),
  texto (`Headline`, `Sub`), bloques (`Bubble`, `Step`, `Check`, `Card`, `UrlPill`, `Logo`),
  la línea de tiempo y el audio. Una pieza que vaya a servir en otro video se escribe aquí.
- `src/videos/<nombre>/index.jsx`: las escenas de un video. Exporta `scenes`
  (`[{ id, min, component }]`, `min` en fotogramas a 30 fps).
- `src/videos/<nombre>/voice.json`: la locución, una frase por escena (`{ id: "texto" }`).
- `src/videos/<nombre>/timing.json`: lo genera `npm run audio`. No se edita a mano.
- `brand/`: los logos originales en SVG. Son la referencia; los videos usan `<Logo>`.
- `src/index.jsx`: registro. Cada video sale como `<nombre>-feed` (4:3) y `<nombre>-story` (9:16).

Todo se mide en `u` (`useUnits()`), nunca en píxeles fijos: así el mismo diseño vale en los dos
formatos. Para lo que cambia entre formatos está `portrait`.

Una escena dura su `min` o lo que dure su locución más un respiro, lo que sea mayor. La voz
nunca se corta; si una frase alarga demasiado una escena, se acorta la frase.

## Comandos

```bash
npm run studio                     # editor en el navegador, con vista previa en vivo
npm run audio <video>              # voz de borrador + timing.json
npm run audio <video> -- --keep    # solo mide los audios que ya estén (voz definitiva)
npm run video <video>              # renderiza los dos formatos
npm run video <video> -- --mute    # además, versiones sin sonido
npx remotion still src/index.jsx <video>-feed out/x.png --frame=120   # un fotograma para revisar
```

## Voz y música

- La voz de `npm run audio` es la del sistema: un BORRADOR para medir tiempos. La definitiva se
  pone sustituyendo `public/audio/<video>/vo-<escena>.wav` y corriendo `npm run audio <video> -- --keep`.
- La música va en `public/music/<video>.mp3` o `public/music/default.mp3`. Baja sola mientras
  hay voz. Solo música con licencia para uso comercial; anota de dónde salió en `GUSTOS.md`.
- Generar voz con un servicio de pago cuesta dinero: se pregunta antes.

## Revisar antes de entregar

- Saca fotogramas sueltos de cada escena en los DOS formatos y míralos: texto cortado, líneas
  con una sola palabra, elementos pegados al borde.
- El ritmo y el movimiento no se pueden juzgar desde fotogramas: se le dice a Erich que esa
  parte la revise él.
- Lo que Erich comente del resultado se anota en `GUSTOS.md`.
