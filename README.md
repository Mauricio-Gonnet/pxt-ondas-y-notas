# Ondas y Notas

Extensión para MakeCode, pensada para la placa **V2**.
Funciona con la BBC micro:bit. micro:bit es marca de la Micro:bit Educational Foundation; esta extensión no está afiliada a ella.

Sitio: https://materialesdefisica.com

## Qué hace

- **Placa sola:** las notas suenan con el parlante de la placa y el texto pasa por la matriz de LED.
- **Placa conectada por USB a la página [Bit - Ondas y Notas](https://materialesdefisica.com/u.php?u=bit-ondas-y-notas):** la placa se calla y la computadora toca los instrumentos reales, cambia el color de fondo y muestra el texto.

## Cómo agregarla en MakeCode

1. Abrí un proyecto en https://makecode.microbit.org
2. Entrá en **Extensiones**.
3. Pegá la dirección de este repositorio en el buscador y elegí «ondas-y-notas».

## Bloques

**Teclas** (como en Makey Makey: se toca la tecla y GND a la vez)
- al presionar [tecla] · al soltar [tecla] · [tecla] está presionado
- Teclas: P1, P2, P3, P4, P6, P7, P8, P10, P12, P13, P14, P15, P16, logo, botón A, botón B

**Notas**
- fijar instrumento [órgano de iglesia] (28 instrumentos)
- tocar nota [Do] durante [1/2 tiempo]
- iniciar nota [Do] · detener nota [Do] · detener todas las notas
- fijar volumen [100]

**Pantalla**
- cambiar fondo a [color] · color de [Do · rojo] (los colores de Piano Makey Makey)
- mostrar texto [DO] · mostrar texto [DO] tamaño [52] en x [50] y [50] durante [1,5] s · borrar texto
- mostrar en pantalla [distancia] = [valor]

**Sensores y conexión**
- distancia (cm) trig [P12] eco [P13]
- conectado a la computadora

## Piano de 8 notas

| Nota | Do | Re | Mi | Fa | Sol | La | Si | Do |
|---|---|---|---|---|---|---|---|---|
| Pin | P3 | P4 | P6 | P7 | P1 | P8 | P10 | P2 |

- P1, P2 y el logo son táctiles de fábrica.
- P3, P4, P6, P7, P8, P10 (y P12 a P16) necesitan una **resistencia de 10 MΩ del pin a 3V**.
- Al usar P3, P4, P6, P7 o P10, el panel de LED se apaga solo (usa esos pines).
- No usar: P5 y P11 (botones), P19 y P20 (sensores internos).
- Sensor de distancia: trig en P12, eco en P13.

Armado completo y ejemplos: https://materialesdefisica.com/u.php?u=bit-ondas-y-notas (botón «Cómo se usa»).

## Tené en cuenta

- La extensión usa el puerto serie por USB a 115200 baudios. No uses en el mismo proyecto «serie: al recibir datos» con fin de línea, porque reemplaza al de la extensión.
- El sensor HC-SR04 común trabaja con 5 V: el eco pasa por un divisor de tensión (1 kΩ en serie y 2 kΩ a GND) antes de P13, y el GND del sensor se une al de la placa. El HC-SR04P funciona con 3 V y no necesita nada de eso.
- Para conectar la página, primero grabá la placa y desconectala en MakeCode (la conexión USB la usa una sola página por vez).

## Ejemplo

```blocks
ondasYNotas.fijarInstrumento(Instrumento.Piano)
ondasYNotas.alPresionar(Tecla.P3, function () {
    ondasYNotas.cambiarFondo(ondasYNotas.colorDe(ColorNota.Do))
    ondasYNotas.mostrarTexto("DO")
    ondasYNotas.iniciarNota(262)
})
ondasYNotas.alSoltar(Tecla.P3, function () {
    ondasYNotas.detenerNota(262)
    ondasYNotas.borrarTexto()
    ondasYNotas.cambiarFondo(ondasYNotas.colorDe(ColorNota.Blanco))
})
```

## Licencia

MIT

#### Metadata (used for search, rendering)

* for PXT/microbit
