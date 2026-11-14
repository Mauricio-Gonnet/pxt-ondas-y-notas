ondasYNotas.fijarInstrumento(Instrumento.Piano)
ondasYNotas.alPresionar(Tecla.P3, function () {
    ondasYNotas.cambiarFondo(0xff0000)
    ondasYNotas.mostrarTexto("DO")
    ondasYNotas.iniciarNota(262)
})
ondasYNotas.alSoltar(Tecla.P3, function () {
    ondasYNotas.detenerNota(262)
    ondasYNotas.borrarTexto()
})
