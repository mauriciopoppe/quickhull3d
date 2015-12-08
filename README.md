# quickhull3d

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Codecov Status][codecov-image]][codecov-url]

A quickhull implementation for 3d points in `O(n log n)` ported from [John Lloyd implementation](http://www.cs.ubc.ca/~lloyd/java/quickhull3d.html) with some modifications based on the paper:

- [The Quickhull Algorithm for Convex Hulls](http://www.cise.ufl.edu/~ungor/courses/fall06/papers/QuickHull.pdf)

Helpful implementation material:

- Dirk Gregorius presentation: http://box2d.org/files/GDC2014/DirkGregorius_ImplementingQuickHull.pdf
- Convex Hull Generation with Quick Hull by Randy Gaul: http://www.randygaul.net/wp-content/uploads/2013/11/QuickHull.pdf

## Demo

[![view on requirebin](http://requirebin.com/badge.png)](http://requirebin.com/?gist=9b19fccfa670c9e2597b)

## Usage

**input** an array of `[x,y,z]` which are coordinates of 3d points

**output** an array of `[i,j,k]` which are the indices of the points that make a face whose normal points outwards the center of the polyhedra

```javascript
var qh = require('quickhull3d');
var points = [
  [0, 1, 0],
  [1, -1, 1],
  [-1, -1, 1],
  [0, -1, -1]
];

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
var QuickHull = require('quickhull3d').QuickHull;
var points = [
  [0, 1, 0],
  [1, -1, 1],
  [-1, -1, 1],
  [0, -1, -1]
];
var instance = new QuickHull(points)
instance.on('face:create', function (face) {
  // see Face3 docs to see the properties of the face
});
instance.on('face:destroy', function (face) {
  // see Face3 docs to see the properties of the face
});
// computes the quickhull
instance.run();
```


## Installation

```bash
$ npm install --save quickhull3d
```

## API

```javascript
var qh = require('quickhull3d')
```

#### `qh(points, options)`

**params**
* `points` an array of 3d points whose convex hull needs to be computed
* `options` (optional) options passed to `QuickHull.prototype.run`

**returns** An array of 3 element arrays, each subarray has the indices of 3 points which form a face whose
normal points outside the polyhedra

### Constructor

#### `instance = new qh.QuickHull([points])`
**extends** `EventEmitter`

**params**
* `points` (optional) an array of 3d points whose convex hull needs to be computed

**properties**
* `points` an internal reference of the points
* `faceStore` (private) an instance of the class `Face3Store`

**events**
* `face:create(face)` fired when a face is created
  * `face` an instance of the `Face3` class
* `face:destroy(face)` fired when a face is destroyed
  * `face` an instance of the `Face3` class

#### `instance.run(options)`

**params**
* `options` (optional) Configuration options for the computation
 * `options.skipTriangulation` {Boolean} (default=`false`) Set it to true to return merged faces as
 they are, e.g. a face with 5 indices will be split into 3 triangles if `avoidTriangulation=false`

Computes the quickhull of all the points stored in the instance

**returns** An array of 3 element arrays, each subarray has the indices of 3 points which form a face whose
normal points outside the polyhedra

**time complexity** `O(n log n)`

### Face3

#### `instance = new qh.Face3(points, i, j, k)`

You shouldn't call this constructor but it's documented here for reference of the events 
fired by instances of `QuickHull`

**params**
* `points` {Array[]} 3d points whose convex hull needs to be computed
* `i` {number} an index of a point which defines this face
* `j` {number} an index of a point which defines this face
* `k` {number} an index of a point which defines this face

**properties**
* `id` {number}
* `destroyed` {Boolean} True if the face is not part of the convex hull 
* `edge` {HalfEdge} An instance of the `HalfEdge` class, holds a pointer to the next and previous half edges
that form part of the face, since it's implemented as a double linked list random access works in `O(n)`
* `normal` {vec3} The normal of the plane defined by the vectors (`points[j] - points[i]` and `points[k] - points[i]`)
* `maxDistance` {number} signed distance of the furthest point this face can see
* `signedDistanceToOrigin` {number} signed distance from the origin to the half plane which has the face,
it's negative if the face's normal is pointing towards the origin

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
quickhull3d:100 x 1,580 ops/sec ±2.12% (85 runs sampled)
convexhull:100 x 2,379 ops/sec ±0.78% (89 runs sampled)
quickhull3d:1000 x 477 ops/sec ±1.81% (68 runs sampled)
convexhull:1000 x 340 ops/sec ±1.70% (83 runs sampled)
quickhull3d:10000 x 115 ops/sec ±2.51% (68 runs sampled)
convexhull:10000 x 30.26 ops/sec ±1.20% (54 runs sampled)
quickhull3d:100000 x 13.68 ops/sec ±1.57% (38 runs sampled)
convexhull:100000 x 2.26 ops/sec ±7.74% (10 runs sampled)
quickhull3d:200000 x 9.13 ops/sec ±9.26% (28 runs sampled)
convexhull:200000 x 1.13 ops/sec ±10.14% (7 runs sampled)
```

[![quickhull3d vs convexhull](https://cloud.githubusercontent.com/assets/1616682/10469408/f72213f2-71d2-11e5-8ec2-fd41bdd8fb04.png)](https://plot.ly/~maurizzzio/36/quickhull3d-vs-convexhull/)

## License

Copyright (c) 2015 Mauricio Poppe. Licensed under the MIT license.

[npm-url]: https://npmjs.org/package/generator-mnm-example
[npm-image]: https://img.shields.io/npm/v/generator-mnm-example.svg?style=flat

[travis-url]: https://travis-ci.org/maurizzzio/generator-mnm-example
[travis-image]: https://img.shields.io/travis/maurizzzio/generator-mnm-example.svg?style=flat

[codecov-url]: https://codecov.io/github/maurizzzio/generator-mnm-example
[codecov-image]: https://img.shields.io/codecov/c/github/maurizzzio/generator-mnm-example.svg?style=flat

[depstat-url]: https://david-dm.org/maurizzzio/generator-mnm-example
[depstat-image]: https://david-dm.org/maurizzzio/generator-mnm-example.svg?style=flat
[download-badge]: http://img.shields.io/npm/dm/generator-mnm-example.svg?style=flat
