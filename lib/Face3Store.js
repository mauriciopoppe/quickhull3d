/**
 * Created by mauricio on 3/8/15.
 */
var vec3 = require('gl-matrix').vec3;
var assert = require('assert');
var debug = require('debug')('app:Face3Store');
var Face3 = require('./Face3');

function Face3Store() {
  this.reset();
}

Face3Store.prototype.create = function (points, i, j, k) {
  var face = new Face3(points, i, j, k);
  face.id = this.faceId++;
  this.allFaces.push(face);
  this.insertFaceByEdgeIndices(face, i, j, k);
  return face;
};

Face3Store.prototype.insertFaceByEdgeIndices = function (face, i, j, k) {
  debug('new face: %d %d %d', i, j, k);
  var faceByEdge = this.faceByEdge;
  function insertFace(face, a, b) {
    if (a > b) {
      var t = a;
      a = b;
      b = t;
    }
    assert(a !== b);
    faceByEdge[a] = faceByEdge[a] || {};
    faceByEdge[a][b] = faceByEdge[a][b] || [];
    faceByEdge[a][b].push(face.id);
  }
  insertFace(face, i, j);
  insertFace(face, i, k);
  insertFace(face, j, k);
};


Face3Store.prototype.getFacesByEdgeIndices = function (a, b) {
  var faceByEdge = this.faceByEdge;
  if (a > b) {
    var t = a;
    a = b;
    b = t;
  }
  return (faceByEdge[a] && faceByEdge[a][b]) || [];
};

Face3Store.prototype.computeHorizon = function (initialFace, point) {
  var i;
  var nextFace, nextFaceIndex;
  var stack = [initialFace];
  var visibleFaces = [];
  var horizonEdges = [];
  // jsperf: http://jsperf.com/random-access-object-vs-array
  var visited = {};
  debug('horizon start %j', point);
  while (stack.length) {
    var top = stack.pop();
    debug('analyzing %d, indices=%j', top.id, top.indices);
    if (!visited[top.id]) {
      // any visible face is no longer part of the hull, mark it as destroyed
      top.destroyed = true;
      // the current face is visited now
      visited[top.id] = true;
      visibleFaces.push(top);
      var indices = top.indices;
      var adjacentFacesIndexes =
        this.getFacesByEdgeIndices(indices[0], indices[1])
          .concat(this.getFacesByEdgeIndices(indices[0], indices[2]))
          .concat(this.getFacesByEdgeIndices(indices[1], indices[2]));

      // filter dup faces
      adjacentFacesIndexes.sort();
      for (i = 1; i < adjacentFacesIndexes.length; i += 1) {
        if (adjacentFacesIndexes[i] === adjacentFacesIndexes[i - 1]) {
          adjacentFacesIndexes.splice(i, 1);
          i -= 1;
        }
      }

      for (i = 0; i < adjacentFacesIndexes.length; i += 1) {
        nextFaceIndex = adjacentFacesIndexes[i];
        nextFace = this.allFaces[nextFaceIndex];
        if (!nextFace.destroyed) {
          if (vec3.dot(point, nextFace.normal) > nextFace.signedDistanceToOrigin) {
            // the face is able to see the point
            if (!visited[nextFace.id]) {
              stack.push(nextFace);
            }
          } else {
            // if the new face can't be seen that means we have found an edge
            // that is part of the horizon, common edge is an array with the indexes
            // of the points that are part of the edge
            horizonEdges.push(
              top.commonEdge(nextFace)
            );
          }
        }
      }
    }
  }
  return {
    edges: horizonEdges,
    visibleFaces: visibleFaces
  };
};

Face3Store.prototype.getFaces = function () {
  return this.allFaces.filter(function (face) {
    return !face.destroyed;
  });
};

Face3Store.prototype.reset = function () {
  this.allFaces = [];
  this.faceByEdge = {};
  this.faceId = 0;
};

module.exports = Face3Store;
