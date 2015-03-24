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
  this.edge = null;
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
  curr
    .join(next)
    .join(prev)
    .join(curr);
  this.edge = curr;
};

Face3.prototype.updateTwins = function () {
  var i;
  for (i = 0; i < arguments.length; i += 1) {
    var edges = this.commonEdges(arguments[i]);
    edges[0].setTwin(edges[1]);
  }
};

Face3.prototype.invert = function () {
  this.edge.reverse();
  vec3.scale(this.normal, this.normal, -1);
  this.signedDistanceToOrigin *= -1;
  //debug('face %d inverted! %j', this.id, this.indices);
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
  var me = this;
  me.destroyed = true;
};

module.exports = Face3;
