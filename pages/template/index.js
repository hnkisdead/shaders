import * as THREE from 'three'
import vertexShader from './shader.vert?raw'
import fragmentShader from './shader.frag?raw'
import { action, createMachine, immediate, interpret, invoke, reduce, state, transition } from 'robot3'
import { Pane } from 'tweakpane'

const CONTEXT = () => ({
    scene: undefined,
    camera: undefined,
    renderer: undefined,
    uniforms: {
        u_param: { value: 1.0 },
        u_time: { value: 0.0 },
        u_resolution: {
            value: new THREE.Vector3(window.innerWidth, window.innerHeight, 1.0),
        },
        u_mouse: {
            value: new THREE.Vector2(),
        },
    },
    clock: undefined,
    uiState: {
        param: 1.0,
    },
})

const FSM = createMachine(
    {
        IDLE: state(immediate('CREATING_UI')),
        CREATING_UI: invoke(
            createUI,
            transition(
                'done',
                'CREATING_SCENE',
                reduce((context, event) => ({ ...context })),
            ),
        ),
        CREATING_SCENE: invoke(
            createScene,
            transition(
                'done',
                'ANIMATING_SCENE',
                reduce((context, { data: { scene, camera, renderer, clock } }) => ({
                    ...context,
                    scene,
                    camera,
                    renderer,
                    clock,
                })),
            ),
            transition('error', 'ERROR', action(console.log)),
        ),
        ANIMATING_SCENE: state(transition('PAUSE_SCENE', 'SCENE_PAUSED')),
        SCENE_PAUSED: state(transition('ANIMATE_SCENE', 'ANIMATING_SCENE')),
        ERROR: state(),
    },
    CONTEXT,
)

const SERVICE = interpret(FSM, () => {})

async function createUI(context) {
    const pane = new Pane({ title: 'Params' })

    pane.addButton({
        title: 'Pause scene',
    }).on('click', event => {
        if (SERVICE.machine.state.name === 'ANIMATING_SCENE') {
            SERVICE.send('PAUSE_SCENE')
            event.target.title = 'Animate scene'
        } else if (SERVICE.machine.state.name === 'SCENE_PAUSED') {
            SERVICE.send('ANIMATE_SCENE')
            event.target.title = 'Pause scene'
        }
    })

    pane.addBinding(context.uiState, 'param', {
        label: 'Param',
    }).on('change', event => {
        context.uniforms.u_param.value = event.value
    })
}
async function createScene(context) {
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas') })
    const plane = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: context.uniforms,
    })
    scene.add(new THREE.Mesh(plane, material))

    renderer.setSize(window.innerWidth, window.innerHeight)
    window.addEventListener(
        'resize',
        () => {
            camera.updateProjectionMatrix()
            context.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight, 1)
            renderer.setSize(window.innerWidth, window.innerHeight)
        },
        false,
    )

    const clock = new THREE.Clock()

    return {
        scene,
        camera,
        renderer,
        clock,
    }
}

function render() {
    requestAnimationFrame(render)

    if (SERVICE.machine.state.name !== 'ANIMATING_SCENE') return

    const { scene, camera, renderer, uniforms, clock } = SERVICE.context
    uniforms.u_time.value = clock.getElapsedTime()
    renderer.render(scene, camera)
}
render()
