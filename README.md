# QuickHull 3d
[![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url]

[![NPM][npm-image]][npm-url]

A quickhull implementation for 3d points in `O(n log n)` based on the paper:

- [The Quickhull Algorithm for Convex Hulls](http://www.cise.ufl.edu/~ungor/courses/fall06/papers/QuickHull.pdf)

Helpful implementation material:

- Dirk Gregorius presentation: http://box2d.org/files/GDC2014/DirkGregorius_ImplementingQuickHull.pdf
- Convex Hull Generation with Quick Hull by Randy Gaul: http://www.randygaul.net/wp-content/uploads/2013/11/QuickHull.pdf

Todo:

[x] HalfEdge representation of the edges
[x] `Face merge` as described in Dirk Gregorius' presentation

## Demo

[![view on requirebin](http://requirebin.com/badge.png)](http://requirebin.com/?gist=ca949bc768ef9cc60473)

## Usage

**input** an array of `[x,y,z]` which are coordinates of 3d points

**output** an array of `[i,j,k]` which are the indices of the points that make a face whose normal points outwards the center of the polyhedra

```javascript
var QuickHull3d = require('quickhull3d');
var points = [
  [0, 1, 0],
  [1, -1, 1],
  [-1, -1, 1],
  [0, -1, -1]
];

QuickHull3d.run(points)
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
var QuickHull3d = require('quickhull3d');
var points = [
  [0, 1, 0],
  [1, -1, 1],
  [-1, -1, 1],
  [0, -1, -1]
];
var instance = new QuickHull3d(points)
instance.on('face:create', function (face) {
  // see Face3 docs to see the properties of the face
});
instance.on('face:destroy', function (face) {
  // see Face3 docs to see the properties of the face
});
instance.quickHull();
```


## Installation

```bash
$ npm install --save quickhull3d
```

## API

```javascript
var QuickHull3d = require('quickhull3d')
```

#### `QuickHull3d.run(points, options)`

**params**
* `points` an array of 3d points whose convex hull needs to be computed
* `options` (optional) options passed to `QuickHull3d.prototype.quickHull`

**returns** An array of 3 element arrays, each subarray has the indices of 3 points which form a face whose
normal points outside the polyhedra

### Constructor

#### `instance = new QuickHull3d([points])`
**extends** `EventEmitter`

**params**
* `points` (optional) an array of 3d points whose convex hull needs to be computed

**properties**
* `points` an internal reference of the points
* `faceStore` (private) an instance of the class `Face3Store`

**events**
* `initialTetrahedron(faces)` fired when the initial tetrahedron is built
  * `faces` an array of arrays which correspond to the indices of the points that are part of the initial tetrahedron
* `face:create(face)` fired when a face is created
  * `face` an instance of the `Face3` class
* `face:destroy(face)` fired when a face is destroyed
  * `face` an instance of the `Face3` class

#### `instance.quickHull(options)`

**params**
* `options` (optional) Configuration options for the computation
 * `options.avoidTriangulation` {Boolean} (default=`false`) Set it to true to return merged faces as
 they are, e.g. a face with 5 indices will be split into 3 triangles if `avoidTriangulation=false`

Computes the quickhull of all the points stored in the instance

**returns** An array of 3 element arrays, each subarray has the indices of 3 points which form a face whose
normal points outside the polyhedra

**time complexity** `O(n log n)`

### Face3

#### `instance = new QuickHull3d.Face3(points, i, j, k)`

You shouldn't call this constructor but it's documented here for reference of the events 
fired by instances of `QuickHull3d`

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

## License

Copyright (c) 2015 Mauricio Poppe. Licensed under the MIT license.

[npm-url]: https://npmjs.org/package/quickhull3d
[npm-image]: https://nodei.co/npm/quickhull3d.png?downloads=true
[travis-url]: https://travis-ci.org/maurizzzio/QuickHull-3d
[travis-image]: https://travis-ci.org/maurizzzio/QuickHull-3d.svg?branch=master
[daviddm-url]: https://david-dm.org/maurizzzio/QuickHull-3d.svg?theme=shields.io
[daviddm-image]: https://david-dm.org/maurizzzio/QuickHull-3d
[coveralls-url]: https://coveralls.io/r/maurizzzio/QuickHull-3d
[coveralls-image]: https://coveralls.io/repos/maurizzzio/QuickHull-3d/badge.svg
