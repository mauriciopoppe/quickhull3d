# quickhull3d

[![NPM version][npm-image]][npm-url]
[![Codecov Status][codecov-image]][codecov-url]
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fmauriciopoppe%2Fquickhull3d.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fmauriciopoppe%2Fquickhull3d?ref=badge_shield)

A robust quickhull implementation to find the convex hull of a set of 3d points in `O(n log n)` ported from [John Lloyd implementation](http://www.cs.ubc.ca/~lloyd/java/quickhull3d.html)

Additional implementation material:

- Dirk Gregorius presentation: https://archive.org/details/GDC2014Gregorius
- Convex Hull Generation with Quick Hull by Randy Gaul: http://www.randygaul.net/wp-content/uploads/2013/11/QuickHull.pdf

[This library was incorporated into ThreeJS!](https://github.com/mrdoob/three.js/pull/10987). Thanks to https://github.com/Mugen87 for his work to move the primitives to ThreeJS primitives, the quickhull3d library will always be library agnostic and will operate with raw arrays.

## Features

- Key functions are well documented (including ascii graphics)
- [Faster](https://plot.ly/~maurizzzio/36/quickhull3d-vs-convexhull/) than other JavaScript implementations of convex hull

## Demo

[![Edit mQ7AgN1n](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/mQ7AgN1n)

## Installation

```bash
$ npm install --save quickhull3d
```

## Usage

```javascript
import qh from 'quickhull3d'
```

### `qh(points, options)`

**params**
* `points` {Array} an array of 3d points whose convex hull needs to be computed
* `options` {Object} (optional)
* `options.skipTriangulation` {Boolean} True to skip the triangulation of the faces
    (returning n-vertex faces)

**returns** An array of 3 element arrays, each subarray has the indices of 3 points which form a face whose normal points outside the polyhedra

### `isPointInsideHull(point, points, faces)`

**params**
* `point` {Array<number>} The point that we want to check that it's a convex hull.
* `points` {Array<Array<number>>} The array of 3d points whose convex hull was computed
* `faces` {Array<Array<number>>} An array of 3 element arrays, each subarray has the indices of 3 points which form a face whose normal points outside the polyhedra

**returns** `true` if the point `point` is inside the convex hull

**example**

```javascript
import qh, { isPointInsideHull } from 'quickhull3d'

const points = [
  [0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1],
  [1, 1, 0], [1, 0, 1], [0, 1, 1], [1, 1, 1]
]
const faces = qh(points)
expect(isPointInsideHull([0.5, 0.5, 0.5], points, faces)).toBe(true)
expect(isPointInsideHull([0, 0, -0.1], points, faces)).toBe(false)
```

### Constructor

```javascript
import QuickHull from 'quickhull3d/dist/QuickHull'
```

#### `instance = new QuickHull(points)`

**params**
* `points` {Array} an array of 3d points whose convex hull needs to be computed

#### `instance.build()`

Computes the quickhull of all the points stored in the instance

**time complexity** `O(n log n)`

#### `instance.collectFaces(skipTriangulation)`

**params**
* `skipTriangulation` {Boolean} (default: false) True to skip the triangulation
    and return n-vertices faces

**returns**

An array of 3-element arrays (or n-element arrays if `skipTriangulation = true`)
which are the faces of the convex hull

## Example

```javascript
import qh from 'quickhull3d'
const points = [
  [0, 1, 0],
  [1, -1, 1],
  [-1, -1, 1],
  [0, -1, -1]
]

qh(points)
// output:
// [ [ 2, 0, 3 ], [ 0, 1, 3 ], [ 2, 1, 0 ], [ 2, 3, 1 ] ]
// 1st face:
//   points[2] = [-1, -1, 1]
//   points[0] = [0, 1, 0]
//   points[3] = [0, -1, -1]
//   normal = (points[0] - points[2]) x (points[3] - points[2])
```

Using the constructor:

```javascript
import QuickHull from 'quickhull3d/dist/QuickHull'
const points = [
  [0, 1, 0],
  [1, -1, 1],
  [-1, -1, 1],
  [0, -1, -1]
];
const instance = new QuickHull(points)
instance.build()
instance.collectFaces()   // returns an array of 3-element arrays
```

## Benchmarks

Specs:

```
MacBook Pro (Retina, Mid 2012)
2.3 GHz Intel Core i7
8 GB 1600 MHz DDR3
NVIDIA GeForce GT 650M 1024 MB
```

Versus [`convex-hull`](https://www.npmjs.com/package/convex-hull)

```
// LEGEND: program:numberOfPoints
quickhull3d:100 x 6,212 ops/sec 1.24% (92 runs sampled)
convexhull:100 x 2,507 ops/sec 1.20% (89 runs sampled)
quickhull3d:1000 x 1,171 ops/sec 0.93% (97 runs sampled)
convexhull:1000 x 361 ops/sec 1.38% (88 runs sampled)
quickhull3d:10000 x 190 ops/sec 1.33% (87 runs sampled)
convexhull:10000 x 32.04 ops/sec 2.37% (56 runs sampled)
quickhull3d:100000 x 11.90 ops/sec 6.34% (34 runs sampled)
convexhull:100000 x 2.81 ops/sec 2.17% (11 runs sampled)
quickhull3d:200000 x 5.11 ops/sec 10.05% (18 runs sampled)
convexhull:200000 x 1.23 ops/sec 3.33% (8 runs sampled)
```

[![quickhull3d vs convexhull](https://cloud.githubusercontent.com/assets/1616682/11645526/97036bea-9d2b-11e5-8549-8ccba137f1b2.png)](https://plot.ly/~maurizzzio/36/quickhull3d-vs-convexhull/)

## License

Mauricio Poppe. Licensed under the MIT license.

[npm-url]: https://npmjs.org/package/quickhull3d
[npm-image]: https://img.shields.io/npm/v/quickhull3d.svg?style=flat

[codecov-url]: https://codecov.io/github/mauriciopoppe/quickhull3d
[codecov-image]: https://img.shields.io/codecov/c/github/mauriciopoppe/quickhull3d.svg?style=flat

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fmauriciopoppe%2Fquickhull3d.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fmauriciopoppe%2Fquickhull3d?ref=badge_large)
