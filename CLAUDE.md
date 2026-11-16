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
- Se escribe «QvaPay», con la Q y la P en mayúscula.
- Sin flechas de texto, sin degradados llamativos.

## Sistema visual

Los videos se ven como el producto en modo oscuro. Esto sale de barrer la web (`~/webs/qpweb`)
y la app (`~/apps/QvaPay`) y quedarse con lo que las dos comparten; todo está hecho pieza en
`src/kit.jsx`. Se usan las piezas, no se reinventan en cada video. Si el producto cambia de
estilo, se cambia en el kit.

- **Colores** (`C`): fondo `bg`, tarjeta `surface`, fila o elemento sobre tarjeta `elevation`.
  El morado `primary` es solo para rellenos; el texto morado va en `primarySoft`. Sobre morado,
  texto `white`. Verde `success` = dinero que entra o algo logrado; `danger` = dinero que sale
  o un error; `warning` = pendiente. No se usan otros colores.
- **Fuente**: Rubik. 400 para leer, 500 y 600 para destacar, 700 para titulares, 900 solo para
  una cifra protagonista.
- **Titulares** (`Headline`): cortos, en una o dos líneas; la palabra o la segunda línea que
  importa va con `Accent`. `Eyebrow` para un rótulo encima, `Sub` para la frase de apoyo.
- **Dinero**: `$1,234.56`, siempre dos decimales (`money()`). El saldo se llama QUSD. Cifra
  grande con `Amount` (cuenta hasta su valor); dentro de una frase, `Figure`. Lo que entra, en
  verde con `+`; lo que sale, en rojo con `-`.
- **Tarjetas** (`Card`): superficie lisa con filo fino, sin sombra. Esquinas continuas.
- **Botón** (`Button`): morado, texto blanco, esquinas continuas. Nunca píldora.
- **Etiquetas** (`Chip`): redondas y teñidas. «Nuevo» con `dot`; estados con `tone`.
- **Iconos**: los de la web, Lineicons en estilo Duotone (`@lineiconshq/free-icons`), siempre
  dentro de `IconTile`. No se dibujan iconos a mano ni se usan emojis.
- **Listas** (`Row`): icono redondo, título, detalle y la cifra a la derecha, como un
  movimiento en la app. `Step` para pasos numerados, `Check` para una lista de ventajas.
- **Fondo** (`Background`): oscuro, con la rejilla de puntos morados y un resplandor suave.
  Lo pone `Video`; las escenas no ponen fondos propios.

## Logo

El logo es el símbolo de los dos trazos (un check y una barra). Siempre se pone con `<Logo>` de
`src/kit.jsx`, que lo dibuja en vector; nunca se redibuja, se deforma, se rota ni se le ponen
sombras o efectos, y se le deja aire alrededor. La guía de marca de la web manda:

- En video y sobre fondo oscuro o morado: símbolo blanco, `<Logo size={26} />`.
- Sobre fondo claro: símbolo morado, `<Logo size={26} color={C.primary} />`.
- Como icono de la app (cuadro morado con el símbolo blanco): `<Logo size={26} tile />`.
- Va en el cierre de cada video, y donde haya que representar a QvaPay o la cuenta del usuario.
- Los originales están en `brand/` (fondo morado y fondo blanco). El editable de Pixelmator
  queda en la máquina de Erich: `~/Qvapay/Rebranding/logo-qvapay.pxd`.

## Cómo está armado

- `src/kit.jsx`: lo común a todos los videos. Marca, unidades (`u`), animaciones (`Rise`),
  texto, bloques (ver «Sistema visual»),
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
npm run audio <video> -- --keep    # solo mide los audios que ya estén (voz de un locutor)
npm run audio <video> -- --provider elevenlabs --dry   # qué generaría y cuántos caracteres (gratis)
npm run audio <video> -- --provider elevenlabs         # voz natural, DE PAGO: se pregunta antes
npm run audio -- --voices          # voces de la cuenta de ElevenLabs, con su id
npm run audio <video> -- --try <id>,<id> --scene hook  # prueba de oído en out/voces/ (de pago)
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
