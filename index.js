/*
 * quickhull3d
 * https://github.com/maurizzzio/QuickHull-3d
 *
 * Copyright (c) 2015 Mauricio Poppe
 * Licensed under the MIT license.
 */

'use strict';

var glMatrix = require('gl-matrix');
var assert = require('assert');
var debug = require('debug')('app:index');

var vec3 = glMatrix.vec3;
var utils = require('./lib/utils');
var Face3Store = require('./lib/Face3Store');

/**
 * Quickhull implementation in 3d, based on the paper
 * http://www.cise.ufl.edu/~ungor/courses/fall06/papers/QuickHull.pdf
 *
 * Features:
 * - O(n log n) average complexity
 * - face visibility test check done in sublinear time (computation of the horizon with
 * dfs)
 *
 * TODO_LIST:
 * - face merging
 *
 * Implementation tips:
 * - Dirk Gregorius presentation:
 * http://box2d.org/files/GDC2014/DirkGregorius_ImplementingQuickHull.pdf
 *
 * @param {vec3[]} points
 */
function CloudPoint(points) {
  this.points = points || [];
  this.faceStore = new Face3Store();
}

CloudPoint.prototype.quickHull = function () {
  assert(this.points.length >= 4, 'quickHull needs at least 4 points to work with');
  var extremes = this.computeExtremes();
  var initialIndices = this.computeInitialIndices(extremes);
  var tetrahedron = this.computeInitialTetrahedron(extremes, initialIndices);

  // the final faces are the initial faces for now
  var facesToCheck = tetrahedron.slice();
  var result = this.cull(facesToCheck);

  // <debug>
  //finalFaces.log = function () {
  //  for (i = 0; i < finalFaces.length; i += 1) {
  //    finalFaces[i].log();
  //  }
  //};
  // </debug>

  // each face has the following info
  // vertices: points that are part of this face
  // normal: normal of this face (pointing outside the hull)
  // distanceToOrigin: saved during the updateFace call
  // pointSet: should be empty on each face (used internally
  // to compute the points that can see this face)
  // <debug>
  var i;
  for (i = 0; i < result.length; i += 1) {
    //assert(result[i].visiblePoints.length === 0);
  }
  //</debug>
  return result.map(function (face) {
    return face.indices;
  });
};

CloudPoint.prototype.computeExtremes = function () {
  var points = this.points;
  // indices of the extremes
  var v0, v1, v2, v3;
  var i, j;
  // variable to a temporal distance
  var tDist;
  // distance from point to the origin
  var distPO;
  var maxDistance;
  var normal;

  var P_LENGTH = points.length;
  var axisAlignedExtremes = [
    // min (x, y, z)
    0, 0, 0,
    // max (x, y, z)
    0, 0, 0
  ];

  // find extremes
  for (i = 0; i < P_LENGTH; i += 1) {
    for (j = 0; j < 3; j += 1) {
      // min
      if (points[i][j] < points[axisAlignedExtremes[j]][j]) {
        axisAlignedExtremes[j] = i;
      }
      // max
      if (points[i][j] > points[axisAlignedExtremes[j + 3]][j]) {
        axisAlignedExtremes[j + 3] = i;
      }
    }
  }

  // find the longest distance between the extremes
  maxDistance = 0;
  for (i = 0; i < 6; i += 1) {
    for (j = i + 1; j < 6; j += 1) {
      tDist = vec3.squaredDistance(
        points[axisAlignedExtremes[i]],
        points[axisAlignedExtremes[j]]
      );
      if (tDist > maxDistance) {
        maxDistance = tDist;
        v0 = axisAlignedExtremes[i];
        v1 = axisAlignedExtremes[j];
      }
    }
  }

  // find the most distant point to the segment (v0,v1)
  // such a point is one of the extremes already found
  maxDistance = -1;
  for (i = 0; i < 6; i += 1) {
    tDist =  utils.squaredDistanceToSegmentFromPoint(
      points[v0], points[v1], points[axisAlignedExtremes[i]]
    );
    if (tDist > maxDistance) {
      maxDistance = tDist;
      v2 = axisAlignedExtremes[i];
    }
  }

  // find the most distant point to the plane (v0,v1,v2)
  normal = utils.normal(points[v0], points[v1], points[v2]);
  // distance from the origin to the plane (v0,v1,v2)
  distPO = vec3.dot(normal, points[v0]);
  maxDistance = -1;
  for (i = 0; i < P_LENGTH; i += 1) {
    // v3 can't be v0,v1,v2
    if (v0 !== i && v1 !== i && v2 !== i) {
      tDist = Math.abs(vec3.dot(normal, points[i]) - distPO);
      if (tDist > maxDistance) {
        maxDistance = tDist;
        v3 = i;
      }
    }
  }

  var results = [v0, v1, v2, v3];
  for (i = 0; i < 4; i += 1) {
    assert(typeof results[i] === 'number');
  }
  return results;
};

CloudPoint.prototype.computeInitialTetrahedron = function (extremes, indices) {
  var i;

  var points = this.points;
  var v0 = extremes[0];
  var v1 = extremes[1];
  var v2 = extremes[2];
  var v3 = extremes[3];
  var ab = vec3.create();
  var ac = vec3.create();
  var ad = vec3.create();
  var normal = vec3.create();
  // Taken from http://everything2.com/title/How+to+paint+a+tetrahedron
  //
  //                              v2
  //                             ,|,
  //                           ,7``\'VA,
  //                         ,7`   |, `'VA,
  //                       ,7`     `\    `'VA,
  //                     ,7`        |,      `'VA,
  //                   ,7`          `\         `'VA,
  //                 ,7`             |,           `'VA,
  //               ,7`               `\       ,..ooOOTK` v3
  //             ,7`                  |,.ooOOT''`    AV
  //           ,7`            ,..ooOOT`\`           /7
  //         ,7`      ,..ooOOT''`      |,          AV
  //        ,T,..ooOOT''`              `\         /7
  //     v0 `'TTs.,                      |,      AV
  //            `'TTs.,                 `\      /7
  //                 `'TTs.,             |,    AV
  //                      `'TTs.,        `\   /7
  //                           `'TTs.,    |, AV
  //                                `'TTs.,\/7
  //                                     `'T`
  //                                       v1
  var tetrahedron = [
    // assume that each face's normal points outside
    this.faceStore.create(points, v0, v1, v2),    // left
    this.faceStore.create(points, v1, v3, v2),    // right
    this.faceStore.create(points, v0, v3, v1),    // bottom
    this.faceStore.create(points, v0, v2, v3)     // back
  ];

  // fix each face if it's normal points inside
  // ((b - a) x (c - a)) · d if positive then the any face's normal
  // is pointing inside (tested with tetrahedron[0])
  vec3.sub(ab, points[v1], points[v0]);
  vec3.sub(ac, points[v2], points[v0]);
  vec3.sub(ad, points[v3], points[v0]);
  vec3.cross(normal, ab, ac);
  if (vec3.dot(normal, ad) > 0) {
    tetrahedron[0].invert();
    tetrahedron[1].invert();
    tetrahedron[2].invert();
    tetrahedron[3].invert();
  }

  for (i = 0; i < tetrahedron.length; i += 1) {
    tetrahedron[i].updatePointVisibility(indices);
  }

  return tetrahedron;
};

CloudPoint.prototype.computeInitialIndices = function (extremes) {
  var POINT_LENGTH = this.points.length;
  var initialIndices = [];
  var i;
  for (i = 0; i < POINT_LENGTH; i += 1) {
    if (extremes.indexOf(i) === -1) {
      initialIndices.push(i);
    }
  }
  return initialIndices;
};

CloudPoint.prototype.cull = function (facesToCheck) {
  var points = this.points;
  var currentFace, i, edge, newFace;
  var tuple;
  var visibleFaces, edges;
  var indicesToAssign, pointIndex;

  function gatherIndicesFromFaces(faces) {
    var i;
    var indexes = [];
    for (i = 0; i < faces.length; i += 1) {
      assert(faces[i].destroyed);
      indexes = indexes.concat(
        faces[i].visiblePoints.map(function (tuple) {
          return tuple.index;
        })
      );
      faces[i].visiblePoints = [];
    }
    return indexes;
  }

  while (facesToCheck.length) {
    currentFace = facesToCheck.shift();
    debug('== iteration ==');
    debug('current face=%d, indices=%j', currentFace.id, currentFace.indices);
    assert(currentFace.visiblePoints);
    if (!currentFace.destroyed && currentFace.visiblePoints.length) {
      // index of the closest point to the current face
      // shift it since it's no longer assignable to the other faces
      pointIndex = currentFace.visiblePoints.shift().index;
      debug('point index to join edges=%d', pointIndex);

      // compute the visible faces and the horizon edges
      tuple = this.faceStore.computeHorizon(currentFace, points[pointIndex]);
      debug('tuple edges=%j faces=%j', tuple.edges, tuple.visibleFaces.map(function (face) { return face.id }));
      visibleFaces = tuple.visibleFaces;
      edges = tuple.edges;

      // from all the visible faces obtain the list of point indexes
      // to distribute them among all the new faces
      indicesToAssign = gatherIndicesFromFaces(visibleFaces);
      debug('indices to assign=%j', indicesToAssign);

      for (i = 0; i < edges.length; i += 1) {
        edge = edges[i];
        newFace = this.faceStore.create(points, edge[0], edge[1], pointIndex);
        // the new face normal must have the same direction as the current face
        //if (vec3.dot(currentFace.normal, newFace.normal) < 0) {
        //  newFace.invert();
        //}
        newFace.updatePointVisibility(indicesToAssign);
        facesToCheck.push(newFace);
      }
    }
  }

  return this.faceStore.getFaces();
};

module.exports = CloudPoint;

module.exports.run = function (points) {
  return new CloudPoint(points).quickHull();
};
