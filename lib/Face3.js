/**
 * Created by mauricio on 3/7/15.
 */
'use strict';

var vec3 = require('gl-matrix').vec3;
var Utils = require('./utils');
var assert = require('assert');
var HalfEdge = require('./HalfEdge');
var debug = require('debug')('quickhull3d:Face3');

function Face3(points, i, j, k) {
  assert(typeof i === 'number' && typeof j === 'number' && typeof k === 'number');
  this.id = null;
  this.destroyed = false;
  this.indices = [i, j, k];
  this.edges = [];
  this.neighbors = [];
  this.normal = vec3.create();
  this.maxDistance = null;
  this.signedDistanceToOrigin = null;
  this.visibleIndices = [];
  this.init.apply(this, arguments);
}

Face3.prototype.init = function (points, i, j, k) {
  vec3.copy(
    this.normal,
    Utils.normal(
      points[i],
      points[j],
      points[k]
    )
  );
  this.signedDistanceToOrigin =
    vec3.dot(this.normal, points[i]);
  this.createEdges(i, j, k);
};

Face3.prototype.createEdges = function (i, j, k) {
  var curr = new HalfEdge(this, i, j);
  var next = new HalfEdge(this, j, k);
  var prev = new HalfEdge(this, k, i);
  curr.joinNext(next);
  next.joinNext(prev);
  prev.joinNext(curr);
  this.edges = [curr, next, prev];
};

Face3.prototype.setNeighbors = function (a, b, c) {
  this.neighbors = [a, b, c];
};

Face3.prototype.invert = function () {
  this.indices.reverse();
  vec3.scale(this.normal, this.normal, -1);
  this.signedDistanceToOrigin *= -1;
  debug('face %d inverted! %j', this.id, this.indices);
};

Face3.prototype.commonEdge = function (other) {
  var indices = this.indices;
  var i, j, k, l;

  // reverse other's indices
  var answer = null;
  var otherIndices = other.indices;
  for (j = 2, i = 0; i < 3; j = i, i += 1) {
    for (l = 2, k = 0; k < 3; l = k, k += 1) {
      if (indices[j] === otherIndices[k] && indices[i] === otherIndices[l]) {
        answer = answer || [indices[j], indices[i]];
        return answer;
      }
    }
  }
  assert(answer);
};

Face3.prototype.updateNeighbors = function (other) {
  var indices = this.indices;
  var i, j, k, l;

  // reverse other's indices
  var merged = null;
  var otherIndices = other.indices;
  for (j = 2, i = 0; i < 3; j = i, i += 1) {
    for (l = 2, k = 0; k < 3; l = k, k += 1) {
      if (indices[j] === otherIndices[k] && indices[i] === otherIndices[l]) {
        this.neighbors[j] = other;
        other.neighbors[l] = this;
        return true;
      }
    }
  }
  assert(merged);
};

Face3.prototype.addVisiblePoint = function (index, distance) {
  var visPoints = this.visibleIndices;
  var t;
  visPoints.push(index);
  if (visPoints.length == 1) {
    this.maxDistance = distance;
  } else if (this.maxDistance < distance) {
    this.maxDistance = distance;
    // swap so that the best is always at the first position
    t = visPoints[0];
    visPoints[0] = visPoints[visPoints.length - 1];
    visPoints[visPoints.length - 1] = t;
  }
};

Face3.prototype.destroy = function () {
  var me = this;
  me.destroyed = true;
};

module.exports = Face3;
