// Prueba: piano con los botones y semáforo de colores por distancia.
ondasYNotas.fijarInstrumento(Instrumento.OrganoDeIglesia)
ondasYNotas.fijarVolumen(80)

input.onButtonPressed(Button.A, function () {
    ondasYNotas.cambiarFondo(0xff0000)
    ondasYNotas.mostrarTexto("DO")
    ondasYNotas.tocarNota(262, music.beat(BeatFraction.Half))
})

input.onButtonPressed(Button.B, function () {
    ondasYNotas.cambiarFondo(0xffa500)
    ondasYNotas.mostrarTexto("RE")
    ondasYNotas.tocarNota(294, music.beat(BeatFraction.Half))
})

basic.forever(function () {
    const d = ondasYNotas.distancia(DigitalPin.P13, DigitalPin.P14)
    ondasYNotas.mostrarValor("distancia", d)
    if (ondasYNotas.conectado()) {
        basic.showIcon(IconNames.Yes)
    }
    basic.pause(200)
})
