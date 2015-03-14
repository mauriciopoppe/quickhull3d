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
  this.normal = vec3.create();
  this.signedDistanceToOrigin = null;
  this.visiblePoints = [];
  this.init();
}

Face3.prototype.init = function () {
  this.setNormal(
    this.points[this.indices[0]],
    this.points[this.indices[1]],
    this.points[this.indices[2]]
  );
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
  var otherIndices = other.indices.reverse();
  for (j = 2, i = 0; i < 3; j = i, i += 1) {
    for (l = 2, k = 0; k < 3; l = k, k += 1) {
      if (indices[j] === otherIndices[l] && indices[i] === otherIndices[k]) {
        answer = answer || [indices[j], indices[i]];
      }
    }
  }
  assert(answer);
  other.indices.reverse();
  return answer;
};

Face3.prototype.updatePointVisibility = function (indices) {
  var tDist, i;
  var points = this.points;
  var index;

  this.visiblePoints = [];

  for (i = 0; i < indices.length; i += 1) {
    index = indices[i];
    tDist = vec3.dot(this.normal, points[index]);
    if (tDist > this.signedDistanceToOrigin) {
      this.visiblePoints.push({
        dist: tDist - this.signedDistanceToOrigin,
        index: index
      });
      indices.splice(i, 1);
      i -= 1;
    }
  }

  this.visiblePoints.sort(function (a, b) {
    return b.dist - a.dist;
  });

  //debug('indices assigned to face=%d =  %j', this.id, this.visiblePoints.map(function (p) { return p.index; }));

  return this;
};

Face3.prototype.destroy = function () {
  var me = this;
  me.destroyed = true;
};

module.exports = Face3;
