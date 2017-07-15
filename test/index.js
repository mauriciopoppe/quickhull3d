import assert from 'assert'
import test from 'tape'
import qh from '../lib/'
import QuickHull from '../lib/QuickHull'
import vec3 from 'gl-vec3'
import getPlaneNormal from 'get-plane-normal'

const EPS = 1e-6
test.Test.prototype.equalEps = function (a, b, msg, extra) {
  this._assert(Math.abs(a - b) < EPS, {
    message: msg || 'should be almost equal',
    operator: 'ok',
    actual: a,
    expected: b,
    extra: extra
  })
}

const tetrahedron = [
  [-2, 0, 0],
  [2, 0, 0],
  [0, 0, 1],
  [0, 0.5, 0]
]

function isConvexHull (points, faces) {
  var i, j
  var n = points.length
  var nError = 0
  for (i = 0; i < faces.length; i += 1) {
    var normal = getPlaneNormal(
      [],
      points[faces[i][0]],
      points[faces[i][1]],
      points[faces[i][2]]
    )
    var offset = vec3.dot(normal, points[faces[i][0]])
    for (j = 0; j < n; j += 1) {
      if (faces[i].indexOf(j) === -1) {
        var aboveFace = vec3.dot(points[j], normal) > offset + EPS
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
  var t = f[0]
  for (var i = 0; i < f.length - 1; i += 1) {
    f[i] = f[i + 1]
  }
  f[f.length - 1] = t
}

function equalShifted (t, f1, f2) {
  var equals = 0
  var j
  // the length of f1/f2 is the same, checked on equalIndexes
  for (var i = 0; i < f2.length; i += 1) {
    var singleEq = 0
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

function equalIndexes (t, f1, f2) {
  var i, j
  t.equals(f1.length, f2.length, 'hulls have the same length')
  var f1tof2 = []
  for (i = 0; i < f1.length; i += 1) {
    for (j = 0; j < f2.length; j += 1) {
      var eq = equalShifted(t, f1[i], f2[j])
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
  t.equals(f1tof2.length, f2.length, 'hulls have the same indices')
}

test('should have a valid constructor', function (t) {
  const instance = new QuickHull(tetrahedron)
  t.assert(instance.tolerance === -1)
  t.end()
})

test('should throw when input is not an array', function (t) {
  t.throws(function () {
    const instance = new QuickHull()
    t.assert(instance.tolerance === -1)
  })
  t.end()
})

test('should create an initial simplex', t => {
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
  t.equal(instance.faces.length, 4)
  // areas (note that the area for qh is the area of the paralellogram)
  t.equalEps(instance.faces[0].area, area(p[0], p[1], p[2]))
  t.equalEps(instance.faces[0].area, 4 * 1)
  t.equalEps(instance.faces[1].area, area(p[0], p[1], p[3]))
  t.equalEps(instance.faces[1].area, 4 * 0.5)
  t.equalEps(instance.faces[2].area, area(p[1], p[2], p[3]))
  t.equalEps(instance.faces[3].area, area(p[0], p[2], p[3]))

  // centroids
  t.deepEqual(instance.faces[0].centroid, [0, 0, 1 / 3])
  t.deepEqual(instance.faces[1].centroid, [0, 0.5 / 3, 0])
  t.deepEqual(instance.faces[2].centroid, [2 / 3, 0.5 / 3, 1 / 3])
  t.deepEqual(instance.faces[3].centroid, [-2 / 3, 0.5 / 3, 1 / 3])
  t.end()
})

test('should compute the next vertex to add', function (t) {
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
  t.deepEqual(instance.nextVertexToAdd().point, [0, -3, 0])
  t.end()
})

test('should have a method which creates the instance/builds the hull', function (t) {
  const hull = qh(tetrahedron)
  t.assert(Array.isArray(hull), 'output is an array')
  t.doesNotThrow(() => {
    hull.forEach(face => {
      face.forEach(index => {
        assert(index >= 0 && index <= 3)
      })
    })
  }, null, 'output has indices of points')
  t.end()
})

test('case: tetrahedron', function (t) {
  var points = [
    [0, 1, 0], [1, -1, 1], [-1, -1, 1], [0, -1, -1]
  ]
  equalIndexes(t, qh(points), [
    [0, 2, 1], [0, 3, 2], [0, 1, 3], [1, 2, 3]
  ])
  t.end()
})

test('case: box (without triangulation)', function (t) {
  const points = [
    [0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1],
    [1, 1, 0], [1, 0, 1], [0, 1, 1], [1, 1, 1]
  ]
  const faces = qh(points, { skipTriangulation: true })
  t.equals(faces.length, 6, 'box hull faces have the same length')
  equalIndexes(t, faces, [
    [6, 2, 0, 3], [1, 4, 7, 5],
    [6, 7, 4, 2], [3, 0, 1, 5],
    [5, 7, 6, 3], [0, 2, 4, 1]
  ])
  t.end()
})

test('case: box (with triangulation)', function (t) {
  const points = [
    [0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1],
    [1, 1, 0], [1, 0, 1], [0, 1, 1], [1, 1, 1]
  ]
  const faces = qh(points)
  t.equals(faces.length, 12, 'box hull faces have the same length')
  t.end()
})

test('case: box (without triangulation, additional points inside)', function (t) {
  const points = [
    [0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1],
    [1, 1, 0], [1, 0, 1], [0, 1, 1], [1, 1, 1]
  ]
  let padding = 0.000001
  for (var i = 0; i < 1000; i += 1) {
    points.push([
      padding + Math.random() * (1 - padding),
      padding + Math.random() * (1 - padding),
      padding + Math.random() * (1 - padding)
    ])
  }
  const faces = qh(points, {skipTriangulation: true})
  t.equals(faces.length, 6, 'box hull faces have the same length')
  equalIndexes(t, faces, [
    [6, 2, 0, 3], [1, 4, 7, 5],
    [6, 7, 4, 2], [3, 0, 1, 5],
    [5, 7, 6, 3], [0, 2, 4, 1]
  ])
  t.end()
})

test('case: octahedron', function (t) {
  var points = [
    [1, 0, 0], [0, 1, 0], [0, 0, 1],
    [-1, 0, 0], [0, -1, 0], [0, 0, -1]
  ]
  equalIndexes(t, qh(points), [
    [0, 1, 2], [0, 2, 4], [0, 5, 1], [0, 4, 5],
    [3, 2, 1], [3, 1, 5], [3, 4, 2], [3, 5, 4]
  ])
  t.end()
})

test('predefined set of points #1', function (t) {
  var points = [
    [ 104, 216, 53 ],
    [ 104, 217, 52 ],
    [ 105, 216, 52 ],
    [ 88, 187, 43 ],
    [ 89, 187, 44 ],
    [ 89, 188, 43 ],
    [ 90, 187, 43 ]
  ]
  var faces = qh(points)
  t.assert(isConvexHull(points, faces), 'should be a convex hull')
  t.end()
})

test('predefined set of points #2', function (t) {
  var points = [
    [ -0.8592737372964621, 83.55000647716224, 99.76234347559512 ],
    [ 1.525216130539775, 82.31873814947903, 27.226063096895814 ],
    [ -71.64689642377198, -9.807108994573355, -20.06765645928681 ],
    [ -83.98330193012953, -24.196470947936177, 45.60143379494548 ],
    [ 58.33653616718948, -15.815680427476764, 15.342222386971116 ],
    [ -47.025314485654235, 97.0465809572488, -65.528974076733 ],
    [ 18.024734454229474, -43.655246682465076, -82.13481092825532 ],
    [ -37.32072818093002, 1.8377598840743303, -12.133228313177824 ],
    [ -92.33389408327639, 5.605767108500004, -13.743493286892772 ],
    [ 64.9183395318687, 52.24619274958968, -61.14645302295685 ]
  ]
  var faces = qh(points)
  t.assert(isConvexHull(points, faces), 'should be a convex hull')
  t.end()
})

test('predefined set of points #3', function (t) {
  var points = require('./issue3.json')
  var faces = qh(points)
  t.assert(isConvexHull(points, faces), 'should be a convex hull')
  t.end()
})

test('predefined set of points #5', function (t) {
  var points = require('./issue5.json')
  var faces = qh(points)
  t.assert(isConvexHull(points, faces), 'should be a convex hull')
  t.end()
})
