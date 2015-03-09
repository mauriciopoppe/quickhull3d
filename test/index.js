'use strict';

var expect = require('chai').expect;
var glMatrix = require('gl-matrix');
var assert = require('assert');

var quickHull = require('../index');
var utils = require('../lib/utils');
var Face3 = require('../lib/Face3');
var vec3 = glMatrix.vec3;

describe('QuickHull', function () {
  function rand(randLimit) {
    return -randLimit + Math.random() * 2 * randLimit;
  }

  function faceShift(f) {
    var t = f[0];
    f[0] = f[1];
    f[1] = f[2];
    f[2] = t;
  }

  function equalShifted(f1, f2) {
    var equals = 0;
    for (var i = 0; i < 3; i += 1) {
      if (f1[0] == f2[0] && f1[1] === f2[1] && f1[2] === f2[2]) {
        equals += 1;
      }
      faceShift(f2);
    }
    assert(equals <= 1);
    return !!equals;
  }

  function equalIndexes(f1, f2) {
    var i, j;
    expect(f1.length).equals(f2.length);
    var t = [];
    for (i = 0; i < f1.length; i += 1) {
      for (j = 0; j < f2.length; j += 1) {
        var eq = equalShifted(f1[i], f2[j]);
        if (eq) {
          expect(typeof t[i] === 'undefined').equals(true);
          t[i] = j;
        }
      }
    }
    for (i = 0; i < f1.length; i += 1) {
      if (t[i] === undefined) {
        console.error(f1);
        console.error('face %d does not exist', i);
      }
      expect(t[i] >= 0).equals(true);
      expect(typeof t[i] === 'number').equals(true);
    }
    expect(t.length).equals(f1.length);
  }

  function cantSeePoint(points, faces, p) {
    for (var i = 0; i < faces.length; i += 1) {
      var a = faces[i][0];
      var b = faces[i][1];
      var c = faces[i][2];
      //for (i = 0; i < faces.length; i += 1) {
      //  console.log(faces[i][0], faces[i][1], faces[i][2]);
      //}
      //console.log(faces[i], p);
      expect(utils.planeSeesPoint(
        points[a],
        points[b],
        points[c],
        p
      )).equals(false);
    }
  }

  it('should run quickhull on demand', function () {
    var cp = new quickHull();
    var limit = 10;
    var i;
    for (i = 0; i < limit; i += 1) {
      cp.points.push([rand(limit), rand(limit), rand(limit)]);
    }
    cp.quickHull();
    for (i = 0; i < limit; i += 1) {
      cp.points.push([rand(limit), rand(limit), rand(limit)]);
    }
    cp.quickHull();
  });

  describe('should compute the quickhull of a set of 3d points', function () {
    it('case: tetrahedron', function () {
      var points = [
        [0, 1, 0], [1, -1, 1], [-1, -1, 1], [0, -1, -1]
      ];
      var faces = quickHull.run(points);
      cantSeePoint(points, faces, [0,0,0]);
      equalIndexes(faces, [
        [0, 2, 1], [0, 3, 2], [0, 1, 3], [1, 2, 3]
      ]);

      function r1() {
        return Math.random() > 0.5 ? 1 : -1;
      }

      // random
      var a, b, c;
      for (var i = 0; i < 100; i += 1) {
        a = Math.random();
        b = Math.random();
        c = 1 - a - b;
        if (c > 0) {
          points.push([[a * r1(), b * r1(), c * r1()]]);
        }
      }
      faces = quickHull.run(points);
      cantSeePoint(points, faces, [0,0,0]);
      equalIndexes(faces, [
        [0, 2, 1], [0, 3, 2], [0, 1, 3], [1, 2, 3]
      ]);
    });

    it('case: box', function () {
      var points = [
        [0,0,0], [1,0,0], [0,1,0], [0,0,1],
        [1,1,0], [1,0,1], [0,1,1], [1,1,1]
      ];
      var faces = quickHull.run(points);
      expect(faces.length).equals(12);
      cantSeePoint(points, faces, [0.5,0.5,0.5]);
      equalIndexes(faces, [
        [0,2,1], [1,2,4], [3,5,7], [3,7,6],
        [0,3,2], [2,3,6], [1,7,5], [4,7,1],
        [2,7,4], [2,6,7], [0,1,3], [1,5,3]
      ]);

      // random
      for (var i = 0; i < 100; i += 1) {
        points.push([
          Math.random() * 0.99,
          Math.random() * 0.99,
          Math.random() * 0.99
        ]);
      }

      faces = quickHull.run(points);
      expect(faces.length).equals(12);
      cantSeePoint(points, faces, [0.5,0.5,0.5]);
      equalIndexes(faces, [
        [0,2,1], [1,2,4], [3,5,7], [3,7,6],
        [0,3,2], [2,3,6], [1,7,5], [4,7,1],
        [2,7,4], [2,6,7], [0,1,3], [1,5,3]
      ]);
    });

    it('case: 2d square', function () {
      var points = [
        [0,0,0], [1,0,0], [0,1,0], [1,1,0]
      ];
      var faces = quickHull.run(points);
      expect(faces.length).equals(4);
      equalIndexes(faces, [
        // -z
        [0,2,3], [1,0,3],
        // +z
        [1,2,0], [1,3,2]
      ]);

      // random
      for (var i = 0; i < 100; i += 1) {
        points.push([
          Math.random() * 0.99,
          Math.random() * 0.99,
          0
        ]);
      }
      faces = quickHull.run(points);
      expect(faces.length).equals(4);
      equalIndexes(faces, [
        // -z
        [0,2,3], [1,0,3],
        // +z
        [1,2,0], [1,3,2]
      ]);
    });

    it('case: octahedron', function () {
      var points = [
        [1,0,0], [0,1,0], [0,0,1],
        [-1,0,0], [0,-1,0], [0,0,-1]
      ];
      var faces = quickHull.run(points);
      expect(faces.length).equals(8);
      equalIndexes(faces, [
        [0,1,2], [0,2,4], [0,5,1], [0,4,5],
        [3,2,1], [3,1,5], [3,4,2], [3,5,4]
      ]);
    });

    describe('sparse', function () {

      function checkFaces(points, faces) {
        var i, q, n = points.length;
        for (i = 0; i < faces.length; i += 1) {
          var normal = utils.normal(
            points[faces[i][0]],
            points[faces[i][1]],
            points[faces[i][2]]
          );
          var distance = vec3.dot(normal, points[faces[i][0]]);
          for (q = 0; q < n; q += 1) {
            if (faces[i].indexOf(q) === -1) {
              var prod = vec3.dot(points[q], normal) <= distance;
              if (!prod) {
                console.log('points', points);
                console.log(faces[i], q);
                console.log(vec3.dot(points[q], normal), distance);
              }
              expect(vec3.dot(points[q], normal) <= distance).equals(true);
            }
          }
        }
      }

      it('case: predefined', function () {
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
        ];
        var faces = quickHull.run(points);
        checkFaces(points, faces);
      });

      process.env.CI && it('case: random generated by brute force', function () {
        this.timeout(20000);
        var points = [];
        var n = 100;
        var randLimit = 100;
        var i, j, k, q;

        function getIndexes(faces) {
          var points = [];
          for (i = 0; i < faces.length; i += 1) {
            for (j = 0; j < faces[i].length; j += 1) {
              points.push(faces[i][j]);
            }
          }
          return points.sort(function (a, b) {
            return a - b;
          }).filter(function (item, index) {
            return !index || item !== points[index - 1];
          });
        }

        for (i = 0; i < n; i += 1) {
          points.push([rand(randLimit), rand(randLimit), rand(randLimit)]);
        }

        // brute force solution
        var bruteForce = [];
        for (i = 0; i < n; i += 1) {
          for (j = i + 1; j < n; j += 1) {
            for (k = j + 1; k < n; k += 1) {
              var face = new Face3(points, i, j, k);
              // with normal direction
              var cnt = 0;
              for (q = 0; !cnt && q < n; q += 1) {
                if (i !== q && j !== q && k !== q &&
                  vec3.dot(points[q], face.normal) >= face.signedDistanceToOrigin) {
                  ++cnt;
                }
              }
              if (!cnt) {
                bruteForce.push(face.indices);
              }

              // with inverted direction
              cnt = 0;
              face.invert();
              for (q = 0; !cnt && q < n; q += 1) {
                if (i !== q && j !== q && k !== q &&
                  vec3.dot(points[q], face.normal) >= face.signedDistanceToOrigin) {
                  ++cnt;
                }
              }
              if (!cnt) {
                bruteForce.push(face.indices);
              }
            }
          }
        }

        var faces = quickHull.run(points);
        checkFaces(points, faces);
        var indexesA = getIndexes(faces);
        var indexesB = getIndexes(bruteForce);
        expect(indexesA).deep.equals(indexesB);
      });
    });
  });
});
