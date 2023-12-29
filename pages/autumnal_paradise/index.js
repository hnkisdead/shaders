import * as THREE from 'three'
import vertexShader from './shader.vert?raw'
import fragmentShader from './shader.frag?raw'

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
    uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight, 1)
    renderer.setSize(window.innerWidth, window.innerHeight)
}

const clock = new THREE.Clock()

function animate() {
    requestAnimationFrame(animate)

    uniforms.u_time.value = clock.getElapsedTime()

    render()
}

function render() {
    renderer.render(scene, camera)
}

animate()
