/* eslint-env jest */

import assert from 'assert'
import qh from '../lib/'
import QuickHull from '../lib/QuickHull'
import vec3 from 'gl-vec3'
import getPlaneNormal from 'get-plane-normal'

const EPS = 1e-6
function equalEps (a, b) {
  const assertion = Math.abs(a - b) < EPS
  expect(assertion).toBe(true)
}

const tetrahedron = [
  [-2, 0, 0],
  [2, 0, 0],
  [0, 0, 1],
  [0, 0.5, 0]
]

function isConvexHull (points, faces) {
  let i, j
  const n = points.length
  let nError = 0
  for (i = 0; i < faces.length; i += 1) {
    const normal = getPlaneNormal(
      [],
      points[faces[i][0]],
      points[faces[i][1]],
      points[faces[i][2]]
    )
    const offset = vec3.dot(normal, points[faces[i][0]])
    for (j = 0; j < n; j += 1) {
      if (faces[i].indexOf(j) === -1) {
        const aboveFace = vec3.dot(points[j], normal) > offset + EPS
        if (aboveFace) {
          console.log('points', points)
          console.log('face %j with index %d', faces[i], j)
          console.log('%d should be less than %d', vec3.dot(points[j], normal), offset)
        }
        nError += Number(aboveFace)
      }
    }
  }
  return nError === 0
}

function faceShift (f) {
  const t = f[0]
  for (let i = 0; i < f.length - 1; i += 1) {
    f[i] = f[i + 1]
  }
  f[f.length - 1] = t
}

function equalShifted (f1, f2) {
  let equals = 0
  let j
  // the length of f1/f2 is the same, checked on equalIndexes
  for (let i = 0; i < f2.length; i += 1) {
    let singleEq = 0
    for (j = 0; j < f2.length; j += 1) {
      singleEq += f1[j] === f2[j]
    }
    if (singleEq === f2.length) {
      equals += 1
    }
    faceShift(f2)
  }
  assert(equals <= 1)
  return !!equals
}

function equalIndexes (f1, f2) {
  let i, j
  expect(f1.length).toEqual(f2.length)
  const f1tof2 = []
  for (i = 0; i < f1.length; i += 1) {
    for (j = 0; j < f2.length; j += 1) {
      const eq = equalShifted(f1[i], f2[j])
      if (eq) {
        assert(typeof f1tof2[i] === 'undefined')
        f1tof2[i] = j
      }
    }
  }
  for (i = 0; i < f1.length; i += 1) {
    if (f1tof2[i] === undefined) {
      console.error(f1)
      console.error('face %d does not exist', i)
    }
    assert(f1tof2[i] >= 0)
    assert(typeof f1tof2[i] === 'number')
  }
  expect(f1tof2.length).toEqual(f2.length)
}

test('should have a valid constructor', function () {
  const instance = new QuickHull(tetrahedron)
  expect(instance.tolerance).toBe(-1)
})

test('should throw when input is not an array', function () {
  expect(function () {
    const instance = new QuickHull()
    expect(instance.tolerance).toBe(-1)
  }).toThrow()
})

test('should create an initial simplex', () => {
  const instance = new QuickHull(tetrahedron)
  const p = tetrahedron

  function area (p1, p2, p3) {
    const cross = vec3.cross(
      [],
      vec3.subtract([], p2, p1),
      vec3.subtract([], p3, p1)
    )
    return vec3.length(cross)
  }

  instance.createInitialSimplex()
  expect(instance.faces.length).toBe(4)
  // areas (note that the area for qh is the area of the paralellogram)
  equalEps(instance.faces[0].area, area(p[0], p[1], p[2]))
  equalEps(instance.faces[0].area, 4 * 1)
  equalEps(instance.faces[1].area, area(p[0], p[1], p[3]))
  equalEps(instance.faces[1].area, 4 * 0.5)
  equalEps(instance.faces[2].area, area(p[1], p[2], p[3]))
  equalEps(instance.faces[3].area, area(p[0], p[2], p[3]))

  // centroids
  expect(instance.faces[0].centroid).toEqual([0, 0, 1 / 3])
  expect(instance.faces[1].centroid).toEqual([0, 0.5 / 3, 0])
  expect(instance.faces[2].centroid).toEqual([2 / 3, 0.5 / 3, 1 / 3])
  expect(instance.faces[3].centroid).toEqual([-2 / 3, 0.5 / 3, 1 / 3])
})

test('should compute the next vertex to add', function () {
  const p = [
    [-100, 0, 0],
    [100, 0, 0],
    [0, 0, 100],
    [0, 50, 0],

    [0, -1, 0],
    [0, 5, 0],
    [0, -3, 0]
  ]
  const instance = new QuickHull(p)
  instance.createInitialSimplex()
  expect(instance.nextVertexToAdd().point).toEqual([0, -3, 0])
})

test('should have a method which creates the instance/builds the hull', function () {
  const hull = qh(tetrahedron)
  expect(Array.isArray(hull)).toBe(true)
  expect(() => {
    hull.forEach(face => {
      face.forEach(index => {
        assert(index >= 0 && index <= 3)
      })
    })
  }).not.toThrow()
})

test('case: tetrahedron', function () {
  const points = [
    [0, 1, 0], [1, -1, 1], [-1, -1, 1], [0, -1, -1]
  ]
  equalIndexes(qh(points), [
    [0, 2, 1], [0, 3, 2], [0, 1, 3], [1, 2, 3]
  ])
})

test('case: box (without triangulation)', function () {
  const points = [
    [0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1],
    [1, 1, 0], [1, 0, 1], [0, 1, 1], [1, 1, 1]
  ]
  const faces = qh(points, { skipTriangulation: true })
  expect(faces.length).toBe(6)
  equalIndexes(faces, [
    [6, 2, 0, 3], [1, 4, 7, 5],
    [6, 7, 4, 2], [3, 0, 1, 5],
    [5, 7, 6, 3], [0, 2, 4, 1]
  ])
})

test('case: box (with triangulation)', function () {
  const points = [
    [0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1],
    [1, 1, 0], [1, 0, 1], [0, 1, 1], [1, 1, 1]
  ]
  const faces = qh(points)
  expect(faces.length).toBe(12)
})

test('case: box (without triangulation, additional points inside)', function () {
  const points = [
    [0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1],
    [1, 1, 0], [1, 0, 1], [0, 1, 1], [1, 1, 1]
  ]
  const padding = 0.000001
  for (let i = 0; i < 1000; i += 1) {
    points.push([
      padding + Math.random() * (1 - padding),
      padding + Math.random() * (1 - padding),
      padding + Math.random() * (1 - padding)
    ])
  }
  const faces = qh(points, { skipTriangulation: true })
  expect(faces.length).toBe(6)
  equalIndexes(faces, [
    [6, 2, 0, 3], [1, 4, 7, 5],
    [6, 7, 4, 2], [3, 0, 1, 5],
    [5, 7, 6, 3], [0, 2, 4, 1]
  ])
})

test('case: octahedron', function () {
  const points = [
    [1, 0, 0], [0, 1, 0], [0, 0, 1],
    [-1, 0, 0], [0, -1, 0], [0, 0, -1]
  ]
  equalIndexes(qh(points), [
    [0, 1, 2], [0, 2, 4], [0, 5, 1], [0, 4, 5],
    [3, 2, 1], [3, 1, 5], [3, 4, 2], [3, 5, 4]
  ])
})

test('predefined set of points #1', function () {
  const points = [
    [104, 216, 53],
    [104, 217, 52],
    [105, 216, 52],
    [88, 187, 43],
    [89, 187, 44],
    [89, 188, 43],
    [90, 187, 43]
  ]
  const faces = qh(points)
  expect(isConvexHull(points, faces)).toBe(true)
})

test('predefined set of points #2', function () {
  const points = [
    [-0.8592737372964621, 83.55000647716224, 99.76234347559512],
    [1.525216130539775, 82.31873814947903, 27.226063096895814],
    [-71.64689642377198, -9.807108994573355, -20.06765645928681],
    [-83.98330193012953, -24.196470947936177, 45.60143379494548],
    [58.33653616718948, -15.815680427476764, 15.342222386971116],
    [-47.025314485654235, 97.0465809572488, -65.528974076733],
    [18.024734454229474, -43.655246682465076, -82.13481092825532],
    [-37.32072818093002, 1.8377598840743303, -12.133228313177824],
    [-92.33389408327639, 5.605767108500004, -13.743493286892772],
    [64.9183395318687, 52.24619274958968, -61.14645302295685]
  ]
  const faces = qh(points)
  expect(isConvexHull(points, faces)).toBe(true)
})

test('predefined set of points #3', function () {
  const points = require('./issue3.json')
  const faces = qh(points)
  expect(isConvexHull(points, faces)).toBe(true)
})

test('predefined set of points #5', function () {
  const points = require('./issue5.json')
  const faces = qh(points)
  expect(isConvexHull(points, faces)).toBe(true)
})
