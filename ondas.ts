/**
 * Ondas y Notas · extensión para MakeCode (placa V2)
 * materialesdefisica.com
 *
 * Placa sola: las notas suenan con el parlante de la placa y el texto pasa por la matriz de LED
 * (salvo que se usen las teclas P3, P4, P6, P7 o P10: ahí el panel de LED se apaga para liberar esos pines).
 * Teclas al estilo Makey Makey: se toca la tecla y GND a la vez. P1, P2 y el logo son táctiles de fábrica;
 * P3, P4, P6, P7, P8, P10, P12, P13, P14, P15 y P16 necesitan una resistencia de 10 MΩ del pin a 3V.
 * Placa conectada a la página «Bit - Ondas y Notas» por USB: la placa se calla y la
 * computadora toca los instrumentos reales, cambia el fondo y muestra el texto.
 *
 * Protocolo (una línea por mensaje, 115200 baudios):
 *   placa → computadora   ON:I:<programa GM>      instrumento
 *                         ON:N:<Hz>:<ms>          nota con duración
 *                         ON:S:<Hz>               iniciar nota
 *                         ON:E:<Hz>               detener nota
 *                         ON:X                    detener todas
 *                         ON:V:<0-100>            volumen
 *                         ON:F:<RRGGBB>           fondo
 *                         ON:T:<texto>            texto que queda ("" borra)
 *                         ON:U:<tam>:<x>:<y>:<ms>:<texto>   texto con tamaño, posición (%) y duración (0 = queda)
 *                         ON:M:<nombre>:<valor>   barra o valor en pantalla
 *   computadora → placa   ON:P                    «estoy conectada» (cada segundo)
 */

enum Instrumento {
    //% block="órgano de iglesia"
    OrganoDeIglesia = 19,
    //% block="piano de cola"
    Piano = 0,
    //% block="piano brillante"
    PianoBrillante = 1,
    //% block="piano eléctrico"
    PianoElectrico = 4,
    //% block="órgano Hammond"
    OrganoHammond = 16,
    //% block="acordeón"
    Acordeon = 21,
    //% block="vibráfono"
    Vibrafono = 11,
    //% block="marimba"
    Marimba = 12,
    //% block="xilófono"
    Xilofono = 13,
    //% block="campanas tubulares"
    Campanas = 14,
    //% block="kalimba"
    Kalimba = 108,
    //% block="tambores metálicos"
    SteelDrums = 114,
    //% block="guitarra criolla"
    GuitarraCriolla = 24,
    //% block="guitarra acústica"
    GuitarraAcustica = 25,
    //% block="guitarra eléctrica"
    GuitarraElectrica = 27,
    //% block="guitarra distorsionada"
    GuitarraDistorsionada = 30,
    //% block="bajo eléctrico"
    Bajo = 33,
    //% block="violín"
    Violin = 40,
    //% block="violonchelo"
    Violonchelo = 42,
    //% block="arpa"
    Arpa = 46,
    //% block="coro"
    Coro = 52,
    //% block="trompeta"
    Trompeta = 56,
    //% block="trombón"
    Trombon = 57,
    //% block="saxo alto"
    Saxo = 65,
    //% block="clarinete"
    Clarinete = 71,
    //% block="flauta traversa"
    Flauta = 73,
    //% block="flauta dulce"
    FlautaDulce = 74,
    //% block="sintetizador (onda cuadrada)"
    Sintetizador = 80
}


enum Tecla {
    //% block="P1"
    P1 = 0,
    //% block="P2"
    P2 = 1,
    //% block="P3"
    P3 = 2,
    //% block="P4"
    P4 = 3,
    //% block="P6"
    P6 = 4,
    //% block="P7"
    P7 = 5,
    //% block="P8"
    P8 = 6,
    //% block="P10"
    P10 = 7,
    //% block="P12"
    P12 = 8,
    //% block="P13"
    P13 = 9,
    //% block="P14"
    P14 = 10,
    //% block="P15"
    P15 = 11,
    //% block="P16"
    P16 = 12,
    //% block="logo"
    Logo = 13,
    //% block="botón A"
    A = 14,
    //% block="botón B"
    B = 15
}


enum ColorNota {
    //% block="Do · rojo"
    Do = 0xE8222B,
    //% block="Re · naranja"
    Re = 0xFF8C00,
    //% block="Mi · amarillo"
    Mi = 0xFFD21F,
    //% block="Fa · verde"
    Fa = 0x2EB84A,
    //% block="Sol · azul"
    Sol = 0x0B74D9,
    //% block="La · añil"
    La = 0x4338CA,
    //% block="Si · violeta"
    Si = 0x8B2BE2,
    //% block="blanco"
    Blanco = 0xFFFFFF,
    //% block="negro"
    Negro = 0x000000
}

/**
 * Música con instrumentos reales, colores y texto en la pantalla de la computadora.
 */
//% block="Ondas y Notas" weight=95 color=#5CB1D6 icon=""
//% groups='["Teclas", "Notas", "Pantalla", "Sensores", "Conexión"]'
namespace ondasYNotas {
    const PREFIJO = "ON:"
    let iniciado = false
    let ultimoAviso = -100000
    let sonando = 0          // Hz de la nota que suena en la placa (0 = ninguna)
    let ledApagado = false   // se apaga el panel de LED al usar las teclas P3, P4, P6, P7 o P10
    let ultimoInstrumento = -1
    let ultimoVolumen = -1

    function iniciar(): void {
        if (iniciado) return
        iniciado = true
        serial.redirectToUSB()
        serial.setBaudRate(BaudRate.BaudRate115200)
        // Lo que se manda espera en un búfer de 20 caracteres: varios mensajes seguidos no entraban y se perdían.
        serial.setTxBufferSize(250)
        serial.setRxBufferSize(64)
        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
            const linea = serial.readUntil(serial.delimiters(Delimiters.NewLine))
            if (linea.indexOf("ON:P") >= 0) {
                const recien = !hayConexion()
                ultimoAviso = control.millis()
                if (recien) {
                    music.stopAllSounds()
                    sonando = 0
                    // la página se conectó después de «al iniciar»: le repite el instrumento y el volumen
                    if (ultimoInstrumento >= 0) enviar("I:" + ultimoInstrumento)
                    if (ultimoVolumen >= 0) enviar("V:" + ultimoVolumen)
                }
            }
        })
    }

    function hayConexion(): boolean {
        return control.millis() - ultimoAviso < 2500
    }

    // Cola de envío: un solo proceso manda los mensajes, de a uno y en orden. Cada mensaje sale con una sola
    // escritura (serial.writeLine rellenaba con espacios hasta 32 caracteres en muchas escrituras: era lento y,
    // con dos eventos seguidos, los mensajes se cruzaban y se perdían).
    const cola: string[] = []
    let enviando = false

    function enviar(mensaje: string): void {
        iniciar()
        if (cola.length < 60) cola.push(PREFIJO + mensaje + "\n")
        if (enviando) return
        enviando = true
        control.inBackground(function () {
            while (cola.length > 0) {
                // junta lo pendiente en una sola escritura (menos llamadas al puerto, menos caracteres perdidos)
                let bloque = ""
                while (cola.length > 0 && bloque.length + cola[0].length <= 200) bloque += cola.shift()
                if (bloque.length == 0) bloque = cola.shift()
                serial.writeString(bloque)
                basic.pause(1)
            }
            enviando = false
        })
    }

    function sinSaltos(t: string): string {
        let r = ""
        for (let i = 0; i < t.length && i < 60; i++) {
            const ch = t.charAt(i)
            r += (ch == "\n" || ch == "\r") ? " " : ch
        }
        return r
    }

    function enLed(t: string): void {
        if (hayConexion() || ledApagado || t.length == 0) return
        control.inBackground(function () { basic.showString(t, 80) })
    }

    function hz(nota: number): number {
        return Math.max(0, Math.round(nota))
    }


    // ===================== TECLAS (al estilo Makey Makey) =====================
    const usada: boolean[] = []
    const estado: boolean[] = []
    const cuenta: number[] = []
    const regTecla: number[] = []
    const regPresionar: boolean[] = []
    const regFn: (() => void)[] = []
    let vigilando = false
    for (let i = 0; i < 16; i++) { usada.push(false); estado.push(false); cuenta.push(0) }

    function pinDe(t: number): DigitalPin {
        switch (t) {
            case Tecla.P3: return DigitalPin.P3
            case Tecla.P4: return DigitalPin.P4
            case Tecla.P6: return DigitalPin.P6
            case Tecla.P7: return DigitalPin.P7
            case Tecla.P8: return DigitalPin.P8
            case Tecla.P10: return DigitalPin.P10
            case Tecla.P12: return DigitalPin.P12
            case Tecla.P13: return DigitalPin.P13
            case Tecla.P14: return DigitalPin.P14
            case Tecla.P15: return DigitalPin.P15
            default: return DigitalPin.P16
        }
    }

    function preparar(t: number): void {
        if (usada[t]) return
        usada[t] = true
        if (t == Tecla.P3 || t == Tecla.P4 || t == Tecla.P6 || t == Tecla.P7 || t == Tecla.P10) {
            if (!ledApagado) { led.enable(false); ledApagado = true }
        }
        if (t >= Tecla.P3 && t <= Tecla.P16) pins.setPull(pinDe(t), PinPullMode.PullNone)
    }

    function leer(t: number): boolean {
        switch (t) {
            case Tecla.P1: return input.pinIsPressed(TouchPin.P1)
            case Tecla.P2: return input.pinIsPressed(TouchPin.P2)
            case Tecla.Logo: return input.logoIsPressed()
            case Tecla.A: return input.buttonIsPressed(Button.A)
            case Tecla.B: return input.buttonIsPressed(Button.B)
            default: return pins.digitalReadPin(pinDe(t)) == 0   // la resistencia de 10 MΩ lo tiene en 1; al tocar con GND baja a 0
        }
    }

    function disparar(t: number, presionada: boolean): void {
        for (let i = 0; i < regTecla.length; i++) {
            if (regTecla[i] == t && regPresionar[i] == presionada) control.runInParallel(regFn[i])
        }
    }

    function vigilar(): void {
        if (vigilando) return
        vigilando = true
        control.inBackground(function () {
            while (true) {
                for (let t = 0; t < 16; t++) {
                    if (!usada[t]) continue
                    const ahora = leer(t)
                    if (ahora != estado[t]) {
                        cuenta[t]++
                        if (cuenta[t] >= 2) {          // dos lecturas iguales seguidas (20 ms): evita rebotes
                            estado[t] = ahora
                            cuenta[t] = 0
                            disparar(t, ahora)
                        }
                    } else {
                        cuenta[t] = 0
                    }
                }
                basic.pause(10)
            }
        })
    }

    /**
     * Se ejecuta al tocar la tecla (y GND a la vez, en los pines). Como «al presionar tecla» en Ondas y Notas.
     */
    //% blockId=ondas_al_presionar block="al presionar %tecla"
    //% tecla.defl=Tecla.P3
    //% group="Teclas" weight=100
    export function alPresionar(tecla: Tecla, handler: () => void): void {
        preparar(tecla)
        regTecla.push(tecla); regPresionar.push(true); regFn.push(handler)
        vigilar()
    }

    /**
     * Se ejecuta al dejar de tocar la tecla.
     */
    //% blockId=ondas_al_soltar block="al soltar %tecla"
    //% tecla.defl=Tecla.P3
    //% group="Teclas" weight=90
    export function alSoltar(tecla: Tecla, handler: () => void): void {
        preparar(tecla)
        regTecla.push(tecla); regPresionar.push(false); regFn.push(handler)
        vigilar()
    }

    /**
     * Verdadero mientras la tecla está tocada. Sirve dentro de «si» o «mientras».
     */
    //% blockId=ondas_esta_presionada block="%tecla está presionado"
    //% tecla.defl=Tecla.P3
    //% group="Teclas" weight=80
    export function estaPresionada(tecla: Tecla): boolean {
        preparar(tecla)
        return leer(tecla)
    }

    /**
     * Verdadero si la página «Bit - Ondas y Notas» está conectada a la placa.
     */
    //% blockId=ondas_conectado block="conectado a la computadora"
    //% group="Conexión" weight=10
    export function conectado(): boolean {
        iniciar()
        return hayConexion()
    }

    /**
     * Elige el instrumento con el que suenan las notas en la computadora.
     * En la placa sola se escucha siempre el parlante de la placa.
     */
    //% blockId=ondas_instrumento block="fijar instrumento %instrumento"
    //% group="Notas" weight=100
    export function fijarInstrumento(instrumento: Instrumento): void {
        ultimoInstrumento = instrumento
        enviar("I:" + instrumento)
    }

    /**
     * Toca una nota y espera hasta que termine.
     */
    //% blockId=ondas_tocar block="tocar nota %nota durante %duracion"
    //% nota.shadow="device_note" duracion.shadow="device_beat"
    //% group="Notas" weight=90
    export function tocarNota(nota: number, duracion: number): void {
        const f = hz(nota)
        const ms = Math.max(0, Math.round(duracion))
        if (hayConexion()) {
            enviar("N:" + f + ":" + ms)
            basic.pause(ms)
        } else {
            enviar("N:" + f + ":" + ms)
            music.playTone(f, ms)
        }
    }

    /**
     * Empieza a sonar una nota y sigue el programa. Suena hasta «detener nota».
     */
    //% blockId=ondas_iniciar block="iniciar nota %nota"
    //% nota.shadow="device_note"
    //% group="Notas" weight=80
    export function iniciarNota(nota: number): void {
        const f = hz(nota)
        enviar("S:" + f)
        if (!hayConexion()) {
            music.ringTone(f)
            sonando = f
        }
    }

    /**
     * Detiene una nota que se había iniciado.
     */
    //% blockId=ondas_detener block="detener nota %nota"
    //% nota.shadow="device_note"
    //% group="Notas" weight=70
    export function detenerNota(nota: number): void {
        const f = hz(nota)
        enviar("E:" + f)
        if (sonando == f) {
            music.stopAllSounds()
            sonando = 0
        }
    }

    /**
     * Detiene todas las notas.
     */
    //% blockId=ondas_detener_todas block="detener todas las notas"
    //% group="Notas" weight=60
    export function detenerTodas(): void {
        enviar("X")
        music.stopAllSounds()
        sonando = 0
    }

    /**
     * Volumen de 0 a 100 (en la computadora y en el parlante de la placa).
     */
    //% blockId=ondas_volumen block="fijar volumen %volumen"
    //% volumen.min=0 volumen.max=100 volumen.defl=100
    //% group="Notas" weight=50
    export function fijarVolumen(volumen: number): void {
        const v = Math.constrain(Math.round(volumen), 0, 100)
        ultimoVolumen = v
        enviar("V:" + v)
        music.setVolume(Math.round(v * 255 / 100))
    }

    /**
     * Cambia el color de fondo de la pantalla de la computadora.
     */
    //% blockId=ondas_fondo block="cambiar fondo a %color"
    //% color.shadow="colorNumberPicker"
    //% group="Pantalla" weight=100
    export function cambiarFondo(color: number): void {
        let hex = ""
        const digitos = "0123456789ABCDEF"
        let c = Math.constrain(Math.round(color), 0, 0xFFFFFF)
        for (let i = 0; i < 6; i++) {
            hex = digitos.charAt(c % 16) + hex
            c = Math.idiv(c, 16)
        }
        enviar("F:" + hex)
    }


    /**
     * El color de cada nota, igual que en Piano Makey Makey (del rojo del Do al violeta del Si).
     * Va dentro de «cambiar fondo a».
     */
    //% blockId=ondas_color_nota block="color de %nota"
    //% group="Pantalla" weight=95
    export function colorDe(nota: ColorNota): number {
        return nota
    }

    /**
     * Muestra un texto grande en el centro de la pantalla de la computadora. Queda hasta «borrar texto» u otro texto.
     * Con la placa sola, el texto pasa por la matriz de LED (sin frenar el programa).
     */
    //% blockId=ondas_texto block="mostrar texto %texto"
    //% texto.defl="DO"
    //% group="Pantalla" weight=90
    export function mostrarTexto(texto: string): void {
        const limpio = sinSaltos(texto)
        enviar("T:" + limpio)
        enLed(limpio)
    }


    /**
     * Muestra un texto en la pantalla de la computadora con tamaño y posición (0 a 100 % del ancho y del alto),
     * durante unos segundos (0 = queda). Como el bloque «mostrar nota» de Ondas y Notas.
     */
    //% blockId=ondas_texto_pos block="mostrar texto %texto tamaño %tamano en x %x y %y durante %segundos s"
    //% texto.defl="DO" tamano.defl=52 tamano.min=8 tamano.max=200
    //% x.defl=50 x.min=0 x.max=100 y.defl=50 y.min=0 y.max=100 segundos.defl=1.5 segundos.min=0
    //% inlineInputMode=inline
    //% group="Pantalla" weight=85
    export function mostrarTextoCon(texto: string, tamano: number, x: number, y: number, segundos: number): void {
        const limpio = sinSaltos(texto)
        const ms = Math.max(0, Math.round(segundos * 1000))
        enviar("U:" + Math.round(tamano) + ":" + Math.round(x) + ":" + Math.round(y) + ":" + ms + ":" + limpio)
        enLed(limpio)
    }

    /**
     * Borra el texto de la pantalla de la computadora.
     */
    //% blockId=ondas_borrar_texto block="borrar texto"
    //% group="Pantalla" weight=80
    export function borrarTexto(): void {
        enviar("T:")
        if (!hayConexion() && !ledApagado) basic.clearScreen()
    }

    /**
     * Muestra un valor con nombre en la pantalla de la computadora (con barra).
     */
    //% blockId=ondas_valor block="mostrar en pantalla %nombre = %valor"
    //% nombre.defl="distancia"
    //% group="Pantalla" weight=70
    export function mostrarValor(nombre: string, valor: number): void {
        let n = ""
        for (let i = 0; i < nombre.length; i++) {
            const ch = nombre.charAt(i)
            n += (ch == ":" || ch == "\n" || ch == "\r") ? " " : ch
        }
        enviar("M:" + n + ":" + valor)
    }

    /**
     * Distancia en centímetros con un sensor ultrasónico (HC-SR04 o similar).
     * Devuelve 0 si no hay objeto dentro de unos 4 m.
     */
    //% blockId=ondas_distancia block="distancia (cm) trig %trig eco %eco"
    //% trig.defl=DigitalPin.P12 eco.defl=DigitalPin.P13
    //% group="Sensores" weight=100
    export function distancia(trig: DigitalPin, eco: DigitalPin): number {
        pins.setPull(trig, PinPullMode.PullNone)
        pins.digitalWritePin(trig, 0)
        control.waitMicros(2)
        pins.digitalWritePin(trig, 1)
        control.waitMicros(10)
        pins.digitalWritePin(trig, 0)
        const us = pins.pulseIn(eco, PulseValue.High, 25000)
        return Math.round(us / 58)
    }

    iniciar()
}
