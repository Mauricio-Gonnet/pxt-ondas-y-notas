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
