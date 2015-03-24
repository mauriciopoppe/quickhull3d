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
  debug('creating a face with indices: [%j, %j, %j], id=%d', i, j, k, face.id);
  this.owner.emit('face:create', face);
  this.allFaces.push(face);
  return face;
};

Face3Store.prototype.computeHorizon = function (initialFace, point) {
  var me = this;
  var visibleFaces = [];
  var horizonEdges = [];

  debug('horizon start %j', point);
  function dfs(face, startEdge) {
    var nextFace;
    var it = startEdge;

    face.destroy();
    me.owner.emit('face:destroy');
    visibleFaces.push(face);

    do {
      assert(it.twin);
      nextFace = it.twin.face;
      if (!nextFace.destroyed) {
        if (vec3.dot(point, nextFace.normal) > nextFace.signedDistanceToOrigin) {
          // the face is able to see the point
          dfs(nextFace, it.twin);
        } else {
          // if the new face can't be seen that means we have found an edge
          // that is part of the horizon, common edge is an array with the indexes
          // of the points that are part of the edge
          horizonEdges.push(it);
        }
      }

      it = it.next;
    } while (it !== startEdge);
  }

  dfs(initialFace, initialFace.edge);

  return {
    horizonEdges: horizonEdges,
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
  this.faceId = 0;
};

Face3Store.prototype.destroy = Face3Store.prototype.reset;

module.exports = Face3Store;
