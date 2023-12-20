import * as THREE from 'three'
import vertexShader from './shaders/vertexShader.glsl?raw'
import fragmentShader from './shaders/fragmentShader.glsl?raw'

const scene = new THREE.Scene()

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const uniforms = {
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector3(window.innerWidth, window.innerHeight, 1) },
}

const plane = new THREE.PlaneGeometry(2, 2)
const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
})
scene.add(new THREE.Mesh(plane, material))

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.updateProjectionMatrix()
    uniforms.iResolution.value.set(window.innerWidth, window.innerHeight, 1)
    renderer.setSize(window.innerWidth, window.innerHeight)
}

const clock = new THREE.Clock()

function animate() {
    requestAnimationFrame(animate)

    uniforms.iTime.value = clock.getElapsedTime()

    render()
}

function render() {
    renderer.render(scene, camera)
}

animate()