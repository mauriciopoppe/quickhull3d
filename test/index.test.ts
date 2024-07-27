import { expect, describe, it } from '@jest/globals'
import assert from 'assert'
import dot from 'gl-vec3/dot'
import cross from 'gl-vec3/cross'
import subtract from 'gl-vec3/subtract'
import length from 'gl-vec3/length'
import getPlaneNormal from 'get-plane-normal'

import qh, { isPointInsideHull, QuickHull, Face, Vec3Like } from '../src/'

const EPS = 1e-6
function equalEps(a: number, b: number) {
  const assertion = Math.abs(a - b) < EPS
  expect(assertion).toBe(true)
}

const cube: Vec3Like[] = [
  [0, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [1, 1, 0],
  [0, 0, 1],
  [1, 0, 1],
  [0, 1, 1],
  [1, 1, 1]
]

const tetrahedron: Vec3Like[] = [
  [-2, 0, 0],
  [2, 0, 0],
  [0, 0, 1],
  [0, 0.5, 0]
]

function isConvexHull(points: Vec3Like[], faces: Face[]) {
  const n = points.length
  let nError = 0
  for (let i = 0; i < faces.length; i += 1) {
    const normal = getPlaneNormal([0, 0, 0], points[faces[i][0]], points[faces[i][1]], points[faces[i][2]])
    const offset = dot(normal, points[faces[i][0]])
    for (let j = 0; j < n; j += 1) {
      if (faces[i].indexOf(j) === -1) {
        const aboveFace = dot(points[j], normal) > offset + EPS
        if (aboveFace) {
          console.log('points', points)
          console.log('face %j with index %d', faces[i], j)
          console.log('%d should be less than %d', dot(points[j], normal), offset)
        }
        nError += Number(aboveFace)
      }
    }
  }
  return nError === 0
}

function faceShift(f: Face) {
  const t = f[0]
  for (let i = 0; i < f.length - 1; i += 1) {
    f[i] = f[i + 1]
  }
  f[f.length - 1] = t
}

function equalShifted(f1: Face, f2: Face) {
  let equals = 0
  // the length of f1/f2 is the same, checked on equalIndexes
  for (let i = 0; i < f2.length; i += 1) {
    let singleEq = 0
    for (let j = 0; j < f2.length; j += 1) {
      singleEq += Number(f1[j] === f2[j])
    }
    if (singleEq === f2.length) {
      equals += 1
    }
    faceShift(f2)
  }
  assert(equals <= 1)
  return !!equals
}

function equalIndexes(f1: Face[], f2: Face[]) {
  expect(f1.length).toEqual(f2.length)
  const f1tof2 = []
  for (let i = 0; i < f1.length; i += 1) {
    for (let j = 0; j < f2.length; j += 1) {
      const eq = equalShifted(f1[i], f2[j])
      if (eq) {
        assert(typeof f1tof2[i] === 'undefined')
        // @ts-ignore
        f1tof2[i] = j
      }
    }
  }
  for (let i = 0; i < f1.length; i += 1) {
    if (f1tof2[i] === undefined) {
      console.error(f1)
      console.error('face %d does not exist', i)
    }
    assert(f1tof2[i] >= 0)
    assert(typeof f1tof2[i] === 'number')
  }
  expect(f1tof2.length).toEqual(f2.length)
}

describe('QuickHull', () => {
  it('should have a valid constructor', function () {
    const instance = new QuickHull(tetrahedron)
    expect(instance.tolerance).toBe(-1)
  })

  it('should throw when input is not an array', function () {
    expect(function () {
      const instance = new QuickHull()
      expect(instance.tolerance).toBe(-1)
    }).toThrow()
  })

  it('should create an initial simplex', () => {
    const instance = new QuickHull(tetrahedron)
    const p = tetrahedron

    function area(p1: Vec3Like, p2: Vec3Like, p3: Vec3Like) {
      const c = cross(
        [],
        // @ts-ignore
        subtract([], p2, p1),
        // @ts-ignore
        subtract([], p3, p1)
      )
      // @ts-ignore
      return length(c)
    }

    const [v0, v1, v2, v3] = instance.computeTetrahedronExtremes()
    instance.createInitialSimplex(v0, v1, v2, v3)
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

  it('should compute the next vertex to add', function () {
    const p: Vec3Like[] = [
      [-100, 0, 0],
      [100, 0, 0],
      [0, 0, 100],
      [0, 50, 0],

      [0, -1, 0],
      [0, 5, 0],
      [0, -3, 0]
    ]
    const instance = new QuickHull(p)
    const [v0, v1, v2, v3] = instance.computeTetrahedronExtremes()
    instance.createInitialSimplex(v0, v1, v2, v3)
    // @ts-ignore Guaranteed to not be null because of the input.
    expect(instance.nextVertexToAdd().point).toEqual([0, -3, 0])
  })

  it('should have a method which creates the instance/builds the hull', function () {
    const hull = qh(tetrahedron)
    expect(Array.isArray(hull)).toBe(true)
    expect(() => {
      hull.forEach((face) => {
        face.forEach((index) => {
          assert(index >= 0 && index <= 3)
        })
      })
    }).not.toThrow()
  })

  it('case: tetrahedron', function () {
    const points: Vec3Like[] = [
      [0, 1, 0],
      [1, -1, 1],
      [-1, -1, 1],
      [0, -1, -1]
    ]
    equalIndexes(qh(points), [
      [0, 2, 1],
      [0, 3, 2],
      [0, 1, 3],
      [1, 2, 3]
    ])
  })

  it('case: box (without triangulation)', function () {
    const points: Vec3Like[] = [
      [0, 0, 0],
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 0],
      [1, 0, 1],
      [0, 1, 1],
      [1, 1, 1]
    ]
    const faces = qh(points, { skipTriangulation: true })
    expect(faces.length).toBe(6)
    equalIndexes(faces, [
      [6, 2, 0, 3],
      [1, 4, 7, 5],
      [6, 7, 4, 2],
      [3, 0, 1, 5],
      [5, 7, 6, 3],
      [0, 2, 4, 1]
    ])
  })

  it('case: box (with triangulation)', function () {
    const points: Vec3Like[] = [
      [0, 0, 0],
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 0],
      [1, 0, 1],
      [0, 1, 1],
      [1, 1, 1]
    ]
    const faces = qh(points)
    expect(faces.length).toBe(12)
  })

  it('case: box (without triangulation, additional points inside)', function () {
    const points: Vec3Like[] = [
      [0, 0, 0],
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 0],
      [1, 0, 1],
      [0, 1, 1],
      [1, 1, 1]
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
      [6, 2, 0, 3],
      [1, 4, 7, 5],
      [6, 7, 4, 2],
      [3, 0, 1, 5],
      [5, 7, 6, 3],
      [0, 2, 4, 1]
    ])
  })

  it('case: octahedron', function () {
    const points: Vec3Like[] = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
      [-1, 0, 0],
      [0, -1, 0],
      [0, 0, -1]
    ]
    equalIndexes(qh(points), [
      [0, 1, 2],
      [0, 2, 4],
      [0, 5, 1],
      [0, 4, 5],
      [3, 2, 1],
      [3, 1, 5],
      [3, 4, 2],
      [3, 5, 4]
    ])
  })

  it('predefined set of points #1', function () {
    const points: Vec3Like[] = [
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

  it('predefined set of points #2', function () {
    const points: Vec3Like[] = [
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

  it('predefined set of points #3', function () {
    const points = require('./issue3.json')
    const faces = qh(points)
    expect(isConvexHull(points, faces)).toBe(true)
  })

  it('predefined set of points (dup vertices) #38', function () {
    let faces: Array<Face>
    const points = require('./issue38.json')
    faces = qh(points, { skipTriangulation: true })
    expect(isConvexHull(points, faces)).toBe(true)
    expect(faces.length).toBe(6)

    function translate(points: Array<Vec3Like>, translation: Vec3Like): Array<Vec3Like> {
      return points.map((point) => [point[0] + translation[0], point[1] + translation[1], point[2] + translation[2]])
    }
    const translatedPoints = translate(points, [0, 0, 5])
    const translatedfaces = qh(translatedPoints, { skipTriangulation: true })
    expect(isConvexHull(translatedPoints, faces)).toBe(true)
    expect(translatedfaces.length).toBe(6)
  })

  it('point inside hull', function () {
    const points: Vec3Like[] = [
      [0, 0, 0],
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 0],
      [1, 0, 1],
      [0, 1, 1],
      [1, 1, 1]
    ]
    const faces = qh(points)
    expect(faces.length).toBe(12)
    // point is inside the hull
    expect(isPointInsideHull([0.5, 0.5, 0.5], points, faces)).toBe(true)
    // point is part of the hull
    expect(isPointInsideHull([1, 1, 1], points, faces)).toBe(true)
    // point is outside the hull
    expect(isPointInsideHull([1, 1, 1.0000001], points, faces)).toBe(false)
    expect(isPointInsideHull([0, 0, -0.0000001], points, faces)).toBe(false)
  })

  describe('degenerate cases', function () {
    it("all points don't belong to a plane", function () {
      const instance = new QuickHull(cube)
      const [v0, v1, v2] = instance.computeTetrahedronExtremes()
      expect(instance.allPointsBelongToPlane(v0, v1, v2)).toBe(false)
    })

    it('all points belong to plane (parallel to xy)', function () {
      const points: Vec3Like[] = [
        [1, 1, 0],
        [2, 4, 0],
        [3, 5, 0],
        [5, 5, 0],
        [10, 10, 0]
      ]
      const instance = new QuickHull(points)
      const [v0, v1, v2] = instance.computeTetrahedronExtremes()
      expect(instance.allPointsBelongToPlane(v0, v1, v2)).toBe(true)
    })

    it('all points belong to plane (skewed plane)', function () {
      const points: Vec3Like[] = [
        [-8, 1, 0],
        [-7, 4, 0],
        [-6, 5, -2],
        [-7, 0, -4],
        [-8, 0, -1]
      ]
      const instance = new QuickHull(points)
      const [v0, v1, v2] = instance.computeTetrahedronExtremes()
      expect(instance.allPointsBelongToPlane(v0, v1, v2)).toBe(true)
    })

    it('should compute a 2d convex hull when all points belong to plane (parallel to xy)', function () {
      const points: Vec3Like[] = [
        [1, 1, 0],
        [10, 1, 0],
        [1, 10, 0],
        [2, 3, 0],
        [3, 4, 0],
        [9, 9, 0],
        [10, 4, 0],
        [4, 10, 0],
        [5, 8, 0],
        [10, 10, 0]
      ]
      const instance = new QuickHull(points).build()
      const faces = instance.collectFaces(true)
      expect(faces.length).toBe(1)
      expect(faces[0].length).toBe(4)
      for (const p of points) {
        expect(isPointInsideHull(p, points, faces)).toBe(true)
      }
    })

    it('should compute a 2d convex hull when all points belong to plane (skewed)', function () {
      const points: Vec3Like[] = [
        [-8, 1, 0],
        [-7, 4, 0],
        [-6, 5, -2],
        [-7, 0, -4],
        [-8, 0, -1]
      ]
      const instance = new QuickHull(points).build()
      const faces = instance.collectFaces(true)
      expect(faces.length).toBe(1)
      expect(faces[0].length).toBe(5)
      for (const p of points) {
        expect(isPointInsideHull(p, points, faces)).toBe(true)
      }
    })

    it('predefined set of points #5 (with z=0)', function () {
      const points = require('./issue5.json')
      const faces = qh(points)
      expect(isConvexHull(points, faces)).toBe(true)
      for (const p of points) {
        expect(isPointInsideHull(p, points, faces)).toBe(true)
      }
    })

    it('predefined set of points #5 (with z=0, no triangulation)', function () {
      const points = require('./issue5.json')
      const faces = qh(points, { skipTriangulation: true })
      expect(faces.length).toBe(1)
      expect(isConvexHull(points, faces)).toBe(true)
      for (const p of points) {
        expect(isPointInsideHull(p, points, faces)).toBe(true)
      }
    })
  })
})
