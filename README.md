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

- fijar instrumento [órgano de iglesia] (28 instrumentos)
- tocar nota [Do] durante [1/2 tiempo]
- iniciar nota [Do] · detener nota [Do] · detener todas las notas
- fijar volumen [100]
- cambiar fondo a [color]
- mostrar texto [DO] · borrar texto
- mostrar en pantalla [distancia] = [valor]
- distancia (cm) trig [P13] eco [P14]
- conectado a la computadora

El sensor de distancia HC-SR04 trabaja con 5 V. Usá la versión de 3,3 V (HC-SR04P o RCWL-1601) o un divisor de tensión en el pin del eco.

## Tené en cuenta

- La extensión usa el puerto serie por USB a 115200 baudios. No uses en el mismo proyecto «serie: al recibir datos» con fin de línea, porque reemplaza al de la extensión.
- Para conectar la página, primero grabá la placa y desconectala en MakeCode (la conexión USB la usa una sola página por vez).

## Ejemplo

```blocks
ondasYNotas.fijarInstrumento(Instrumento.OrganoDeIglesia)
input.onButtonPressed(Button.A, function () {
    ondasYNotas.cambiarFondo(0xff0000)
    ondasYNotas.mostrarTexto("DO")
    ondasYNotas.tocarNota(262, music.beat(BeatFraction.Half))
})
```

## Licencia

MIT

#### Metadata (used for search, rendering)

* for PXT/microbit
