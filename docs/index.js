import * as THREE from 'three'

import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'

import qh from 'quickhull3d'

let camera, controls, scene, renderer
const params = {
  nPoints: 100,
  domain: 100,
  timeToCompute: 'please check console!'
}

init()

function generatePointCloud () {
  const N_POINTS = params.nPoints
  const LIMIT = params.domain
  let i

  function p () {
    return -LIMIT + 2 * Math.random() * LIMIT
  }

  function pointGenerator () {
    return [p(), p(), p()]
  }

  const points = []
  for (i = 0; i < N_POINTS; i += 1) {
    points.push(pointGenerator())
  }
  return points
}

function ConvexMesh () {
  const points = generatePointCloud()
  console.time('quickhull')
  const faces = qh(points)
  console.timeEnd('quickhull')

  const geometry = new THREE.BufferGeometry()
  const vertices = []
  for (let i = 0; i < faces.length; i += 1) {
    const a = points[faces[i][0]]
    const b = points[faces[i][1]]
    const c = points[faces[i][2]]
    vertices.push(...a, ...b, ...c)
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3))
  geometry.computeVertexNormals()

  const polyhedra = new THREE.Mesh(
    geometry,
    new THREE.MeshNormalMaterial({
      side: THREE.DoubleSide,
      flatShading: true
    })
  )
  return polyhedra
}

function rebuild (group) {
  group.clear()

  // polyhedra
  const polyhedra = ConvexMesh()
  group.add(polyhedra)

  // scene helpers
  const vertHelper = new VertexNormalsHelper(polyhedra, 0.5, 0x00ff00)
  group.add(vertHelper)
}

function init () {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xcccccc)
  scene.fog = new THREE.FogExp2(0xcccccc, 0.002)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setAnimationLoop(animate)
  document.body.appendChild(renderer.domElement)

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000)
  camera.position.set(400, 200, 0)

  // controls

  controls = new OrbitControls(camera, renderer.domElement)
  controls.listenToKeyEvents(window) // optional

  // controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

  controls.enableDamping = true // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05

  controls.screenSpacePanning = false

  controls.minDistance = 100
  controls.maxDistance = 500

  controls.maxPolarAngle = Math.PI / 2

  const group = new THREE.Object3D()
  scene.add(group)

  // initial build

  rebuild(group)

  // lights

  const dirLight1 = new THREE.DirectionalLight(0xffffff, 3)
  dirLight1.position.set(1, 1, 1)
  scene.add(dirLight1)

  const dirLight2 = new THREE.DirectionalLight(0x002288, 3)
  dirLight2.position.set(-1, -1, -1)
  scene.add(dirLight2)

  const ambientLight = new THREE.AmbientLight(0x555555)
  scene.add(ambientLight)

  const gui = new GUI()
  gui.add(params, 'nPoints', 10, 1000).onChange(() => rebuild(group))
  gui.add(params, 'domain', 50, 150).onChange(() => rebuild(group))
  gui.add(params, 'timeToCompute')

  window.addEventListener('resize', onWindowResize)
}

function onWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate () {
  controls.update() // only required if controls.enableDamping = true, or if controls.autoRotate = true

  render()
}

function render () {
  renderer.render(scene, camera)
}
