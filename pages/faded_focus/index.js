import * as THREE from 'three'
import vertexShader from './shader.vert?raw'
import { Pane } from 'tweakpane'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'
import fragmentShader from './shader.frag?raw'
import soundUrl from './sound.flac'
import { WebMidi } from 'webmidi'

let state = {
    fpsGraph: undefined,
    scene: undefined,
    camera: undefined,
    renderer: undefined,
    uniforms: undefined,
    clock: undefined,
    sound: undefined,
    analyser: undefined,
    canvas: undefined,
    canvasCtx: undefined,
}

const params = {
    visualizeSpectrogram: false,
    liveMode: true,
    aColor: { r: 0.63, g: -0.36, b: 0.63 },
    bColor: { r: 0.25, g: 0.44, b: 0.18 },
    cColor: { r: 0.69, g: 1.33, b: 0.69 },
    dColor: { r: 1.35, g: 1.86, b: 1.21 },
    param: 0.0,
}

function uiColorToShaderColor(uiColor) {
    return new THREE.Vector3(uiColor.r, uiColor.g, uiColor.b)
}

function initUI() {
    const pane = new Pane({ title: 'Params' })
    pane.registerPlugin(EssentialsPlugin)

    const fpsGraph = pane.addBlade({
        view: 'fpsgraph',
        label: 'FPS',
        rows: 1,
    })

    pane.addBinding(params, 'visualizeSpectrogram', {
        label: 'Visualize spectrogram',
    })

    const liveMode = pane.addBinding(params, 'liveMode', {
        label: 'Live Mode',
    })
    const playButton = pane.addButton({
        title: 'Play',
        disabled: true,
    })
    liveMode.on('change', () => {
        if (params.liveMode && state.sound.isPlaying) {
            state.sound.stop()
        }
        playButton.disabled = params.liveMode
        initSound()
    })
    playButton.on('click', () => {
        if (state.sound.isPlaying) {
            state.sound.stop()
            playButton.title = 'Play'
        } else {
            state.sound.play()
            playButton.title = 'Stop'
        }
    })

    pane.addBlade({ view: 'separator' })

    pane.addBinding(params, 'aColor', {
        color: { type: 'float' },
    }).on('change', event => {
        state.uniforms.aColor.value = uiColorToShaderColor(event.value)
    })
    pane.addBinding(params, 'bColor', {
        color: { type: 'float' },
    }).on('change', event => {
        state.uniforms.bColor.value = uiColorToShaderColor(event.value)
    })
    pane.addBinding(params, 'cColor', {
        color: { type: 'float' },
    }).on('change', event => {
        state.uniforms.cColor.value = uiColorToShaderColor(event.value)
    })
    pane.addBinding(params, 'dColor', {
        color: { type: 'float' },
    }).on('change', event => {
        state.uniforms.dColor.value = uiColorToShaderColor(event.value)
    })

    pane.addBinding(params, 'param', {
        readonly: true,
    })

    state = {
        ...state,
        fpsGraph,
    }
}

function initMidi() {
    WebMidi.enable()
        .then(onEnabled)
        .catch(err => console.error(err))

    function onEnabled() {
        if (WebMidi.inputs.length < 1) {
            console.log('There is no MIDI devices')
            return
        }

        const mySynth = WebMidi.inputs[0]

        mySynth.addListener('controlchange', e => {
            if (e.controller.number !== 18) return
            params.param = e.value
            state.uniforms.param.value = e.value
        })
    }
}

function initSound() {
    let listener = state.camera.getObjectByName('listener')
    if (listener !== undefined) {
        state.camera.remove(listener)
    }
    listener = new THREE.AudioListener()
    const sound = new THREE.Audio(listener)

    if (params.liveMode) {
        navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(handleSuccess)

        function handleSuccess(stream) {
            let source = listener.context.createMediaStreamSource(stream)
            sound.setNodeSource(source)
        }
    } else {
        const audioLoader = new THREE.AudioLoader()
        audioLoader.load(soundUrl, function (buffer) {
            sound.setBuffer(buffer)
            sound.setLoop(true)
            sound.setVolume(1.0)
        })
    }

    const analyser = new THREE.AudioAnalyser(sound, 512)

    state.camera.add(listener)

    state = {
        ...state,
        sound,
        analyser,
    }
}

function initScene() {
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const renderer = new THREE.WebGLRenderer()

    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    const uniforms = {
        u_time: { value: 0 },
        u_resolution: {
            value: new THREE.Vector3(window.innerWidth, window.innerHeight, 1),
        },
        sound: { value: new THREE.Vector2(0, 0) },
        aColor: { value: uiColorToShaderColor(params.aColor) },
        bColor: { value: uiColorToShaderColor(params.bColor) },
        cColor: { value: uiColorToShaderColor(params.cColor) },
        dColor: { value: uiColorToShaderColor(params.dColor) },
        param: { value: 0 },
    }

    scene.add(
        new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms,
            }),
        ),
    )

    const clock = new THREE.Clock()

    window.addEventListener(
        'resize',
        function () {
            camera.updateProjectionMatrix()
            uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight, 1)
            renderer.setSize(window.innerWidth, window.innerHeight)
        },
        false,
    )

    state = {
        ...state,
        scene,
        camera,
        renderer,
        uniforms,
        clock,
    }
}

function initCanvas() {
    const canvas = document.querySelector('.visualizer')
    const canvasCtx = canvas.getContext('2d')

    state = {
        ...state,
        canvas,
        canvasCtx,
    }
}

function visualizeSpectrogram(data) {
    const bufferLengthAlt = state.analyser.analyser.frequencyBinCount

    state.canvasCtx.clearRect(0, 0, state.canvas.width, state.canvas.height)
    state.canvasCtx.fillStyle = '#FFE5E5'
    state.canvasCtx.fillRect(0, 0, state.canvas.width, state.canvas.height)

    const barWidth = (state.canvas.width / bufferLengthAlt) * 2.5
    let x = 0

    for (let i = 0; i < bufferLengthAlt; i++) {
        const barHeight = data[i]

        state.canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)'
        const r = 117 // - barHeight / 5
        const g = 106 // - barHeight / 5
        const b = 182 // - barHeight / 3
        state.canvasCtx.fillStyle = `rgb(${r}, ${g}, ${b})`
        state.canvasCtx.fillRect(x, state.canvas.height - barHeight / 2, barWidth, barHeight / 2)

        x += barWidth + 1
    }
}

function start() {
    if (Object.values(state).some(value => value === undefined)) {
        return
    }

    state.fpsGraph.begin()
    const data = state.analyser.getFrequencyData()
    state.uniforms.u_time.value = state.clock.getElapsedTime()
    state.uniforms.sound.value.set(
        (data[0] + data[1] + data[3]) / 255 / 3,
        (data[110] + data[111] + data[112]) / 255 / 3,
    )

    if (params.visualizeSpectrogram) {
        visualizeSpectrogram(data)
    } else {
        state.canvasCtx.clearRect(0, 0, state.canvas.width, state.canvas.height)
    }

    state.renderer.render(state.scene, state.camera)
    state.fpsGraph.end()

    requestAnimationFrame(start)
}

initUI()
initMidi()
initScene()
initSound()
initCanvas()
start()
