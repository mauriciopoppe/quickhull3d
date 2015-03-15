/**
 * Created by mauricio on 3/7/15.
 */
'use strict';

var vec3 = require('gl-matrix').vec3;
var Utils = require('./utils');
var assert = require('assert');
var debug = require('debug')('quickhull3d:Face3');

function Face3(points, i, j, k) {
  assert(typeof i === 'number' && typeof j === 'number' && typeof k === 'number');
  this.id = null;
  this.destroyed = false;
  this.points = points;
  this.indices = [i, j, k];
  this.neighbors = [];
  this.normal = vec3.create();
  this.maxDistance = null;
  this.signedDistanceToOrigin = null;
  this.visibleIndices = [];
  this.init();
}

Face3.prototype.init = function () {
  this.setNormal(
    this.points[this.indices[0]],
    this.points[this.indices[1]],
    this.points[this.indices[2]]
  );
};

Face3.prototype.setNeighbors = function (a, b, c) {
  this.neighbors = [a, b, c];
};

Face3.prototype.setNormal = function (a, b, c) {
  vec3.copy(this.normal, Utils.normal(a, b, c));
  this.setDistanceToOrigin();
};

Face3.prototype.setDistanceToOrigin = function () {
  this.signedDistanceToOrigin =
    vec3.dot(this.normal, this.points[this.indices[0]]);
};

Face3.prototype.invert = function () {
  this.indices.reverse();
  vec3.scale(this.normal, this.normal, -1);
  this.setDistanceToOrigin();
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
