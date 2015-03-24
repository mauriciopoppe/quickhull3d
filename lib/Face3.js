/**
 * Created by mauricio on 3/7/15.
 */
'use strict';

var vec3 = require('gl-matrix').vec3;
var assert = require('assert');

var Constants = require('./Constants');
var Utils = require('./utils');
var HalfEdge = require('./HalfEdge');
var debug = require('debug')('quickhull3d:Face3');

function Face3(points, i, j, k) {
  assert(typeof i === 'number' && typeof j === 'number' && typeof k === 'number');
  this.id = null;
  this.points = points;
  this.destroyed = false;
  this.edge = null;
  this.normal = vec3.create();
  this.center = vec3.create();
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
  this.signedDistanceToOrigin = vec3.dot(this.normal, points[i]);
  this.createEdges(i, j, k);
  this.computeCenter();
};

Face3.prototype.createEdges = function (i, j, k) {
  var curr = new HalfEdge(this, i, j);
  var next = new HalfEdge(this, j, k);
  var prev = new HalfEdge(this, k, i);
  curr
    .join(next)
    .join(prev)
    .join(curr);
  this.edge = curr;
};

Face3.prototype.computeCenter = function () {
  var i;
  var indices = this.edge.collect();
  vec3.copy(this.center, [0, 0, 0]);
  for (i = 0; i < indices.length; i += 1) {
    vec3.add(this.center, this.center, this.points[indices[i]]);
  }
  vec3.scale(this.center, this.center, 1 / indices.length);
};

Face3.prototype.updateTwins = function () {
  var i;
  var faceMergeCount = 0;
  for (i = 0; i < arguments.length; i += 1) {
    var other = arguments[i];
    var edges = this.commonEdges(other);
    edges[0].setTwin(edges[1]);

    if (vec3.dot(this.normal, other.normal) >= 0 && (
        vec3.dot(this.center, other.normal) - other.signedDistanceToOrigin >  -Constants.EPS ||
        vec3.dot(this.normal, other.center) - this.signedDistanceToOrigin > -Constants.EPS)
        ) {
      //debug('merge!', this.edge.collect(), other.edge.collect());
      edges[0].selfMerge();
      other.destroy();
      //debug('new edges for merge, ', this.edge.collect());
      //this.computeCenter();
      faceMergeCount += 1;
    }
  }
  return faceMergeCount;
};

Face3.prototype.invert = function () {
  this.edge.invert();
  vec3.scale(this.normal, this.normal, -1);
  this.signedDistanceToOrigin *= -1;
  //debug('face %d inverted! %j', this.id, this.edge.collect());
};

Face3.prototype.commonEdges = function (other) {
  var a = this.edge, aIt = a;
  var b = other.edge, bIt = b;
  var ans;
  do {
    do {
      if (aIt.equals(bIt)) {
        ans = [aIt, bIt];
        break;
      }
      bIt = bIt.next;
    } while (bIt !== b);
    if (bIt !== b) {
      break;
    }
    aIt = aIt.next;
  } while (aIt !== a);
  assert(ans);
  return ans;
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
  this.destroyed = true;
  this.points = null;
};

module.exports = Face3;
