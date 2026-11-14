/**
 * Ondas y Notas · extensión para MakeCode (placa V2)
 * materialesdefisica.com
 *
 * Placa sola: las notas suenan con el parlante de la placa y el texto pasa por la matriz de LED.
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
 *                         ON:T:<texto>            texto ("" borra)
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

/**
 * Música con instrumentos reales, colores y texto en la pantalla de la computadora.
 */
//% block="Ondas y Notas" weight=95 color=#5CB1D6 icon=""
//% groups='["Notas", "Pantalla", "Sensores", "Conexión"]'
namespace ondasYNotas {
    const PREFIJO = "ON:"
    let iniciado = false
    let ultimoAviso = -100000
    let sonando = 0          // Hz de la nota que suena en la placa (0 = ninguna)

    function iniciar(): void {
        if (iniciado) return
        iniciado = true
        serial.redirectToUSB()
        serial.setBaudRate(BaudRate.BaudRate115200)
        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
            const linea = serial.readUntil(serial.delimiters(Delimiters.NewLine))
            if (linea.indexOf("ON:P") >= 0) {
                if (!hayConexion()) {
                    music.stopAllSounds()
                    sonando = 0
                }
                ultimoAviso = control.millis()
            }
        })
    }

    function hayConexion(): boolean {
        return control.millis() - ultimoAviso < 2500
    }

    function enviar(mensaje: string): void {
        iniciar()
        serial.writeLine(PREFIJO + mensaje)
    }

    function hz(nota: number): number {
        return Math.max(0, Math.round(nota))
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
     * Muestra un texto en la pantalla de la computadora.
     * Con la placa sola, el texto pasa por la matriz de LED (sin frenar el programa).
     */
    //% blockId=ondas_texto block="mostrar texto %texto"
    //% texto.defl="DO"
    //% group="Pantalla" weight=90
    export function mostrarTexto(texto: string): void {
        let limpio = ""
        for (let i = 0; i < texto.length; i++) {
            const ch = texto.charAt(i)
            limpio += (ch == "\n" || ch == "\r") ? " " : ch
        }
        enviar("T:" + limpio)
        if (!hayConexion()) control.inBackground(function () { basic.showString(limpio, 80) })
    }

    /**
     * Borra el texto de la pantalla de la computadora.
     */
    //% blockId=ondas_borrar_texto block="borrar texto"
    //% group="Pantalla" weight=80
    export function borrarTexto(): void {
        enviar("T:")
        if (!hayConexion()) basic.clearScreen()
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
    //% trig.defl=DigitalPin.P13 eco.defl=DigitalPin.P14
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
