/**
 * Created by mauricio on 3/8/15.
 */
var vec3 = require('gl-matrix').vec3;
var assert = require('assert');
var debug = require('debug')('quickhull3d:Face3Store');
var Face3 = require('./Face3');

function Face3Store(owner) {
  this.owner = owner;
  this.reset();
}

Face3Store.prototype.create = function (points, i, j, k) {
  var face = new Face3(points, i, j, k);
  face.id = this.faceId++;
  this.owner.emit('face:create', face);
  this.allFaces.push(face);
  this.insertByEdgeIndices(face);
  return face;
};

Face3Store.prototype.insertByEdgeIndices = function (face) {
  var indices = face.indices;
  var i = indices[0], j = indices[1], k = indices[2];
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

Face3Store.prototype.removeByEdgeIndices = function (face) {
  var indices = face.indices;
  var i = indices[0], j = indices[1], k = indices[2];
  var faceByEdge = this.faceByEdge;
  function removeFace(face, a, b) {
    if (a > b) {
      var t = a;
      a = b;
      b = t;
    }
    assert(a !== b);
    var arr = faceByEdge[a][b];
    arr.splice(arr.indexOf(face.id), 1);
  }
  removeFace(face, i, j);
  removeFace(face, i, k);
  removeFace(face, j, k);
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
  var i, LENGTH;
  var me = this;
  var nextFace, nextFaceIndex;
  var stack = [initialFace];
  var visibleFaces = [];
  var horizonEdges = [];
  var visited = [];
  debug('horizon start %j', point);
  while (stack.length) {
    var top = stack.pop();
    debug('analyzing %d, indices=%j', top.id, top.indices);
    // jsperf: http://jsperf.com/random-access-object-vs-array/3
    // jsperf: http://jsperf.com/duplicate-element-removal-array-vs-object/2
    if (!visited[top.id]) {
      // any visible face is no longer part of the hull, mark it as destroyed
      top.destroy();
      me.owner.emit('face:destroy', top);
      me.removeByEdgeIndices(top);
      // the current face is visited now and is also visible
      visited[top.id] = true;
      visibleFaces.push(top);
      // get all the neighbors of the current face
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

      LENGTH = adjacentFacesIndexes.length;
      for (i = 0; i < LENGTH; i += 1) {
        nextFaceIndex = adjacentFacesIndexes[i];
        nextFace = this.allFaces[nextFaceIndex];

        // NOTE: no need to check if a face is destroyed since the face destroying phase
        // and the filtering avoids the iteration of destroyed stores

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
  return {
    edges: horizonEdges,
    visibleFaces: visibleFaces
  };
};

Face3Store.prototype.getFaces = function () {
  var faces = [], face;
  var i, LENGTH = this.allFaces.length;
  for (i = 0; i < LENGTH; i += 1) {
    face = this.allFaces[i];
    if (!face.destroyed) {
      faces.push(face);
    }
  }
  return faces;
};

Face3Store.prototype.reset = function () {
  this.allFaces = [];
  this.faceByEdge = {};
  this.faceId = 0;
};

Face3Store.prototype.destroy = Face3Store.prototype.reset;

module.exports = Face3Store;
