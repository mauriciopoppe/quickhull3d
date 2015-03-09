/**
 * Created by mauricio on 3/7/15.
 */
'use strict';
var vec3 = require('gl-matrix').vec3;

// shared vectors
// NOTE: if a util calls another util make sure that the vectors
// have the correct references
var ab = vec3.create();
var ac = vec3.create();
var bc = vec3.create();

var Utils = {};

/**
 * Finds the squared distance from the point p to the segment
 * (a,b)
 * @param {vec3} a Segment endpoint
 * @param {vec3} b Segment endpoint
 * @param {vec3} p
 */
Utils.squaredDistanceToSegmentFromPoint = function (a, b, p) {
  vec3.sub(ab, b, a);
  var ap = vec3.sub(vec3.create(), p, a);
  var bp = vec3.sub(vec3.create(), p, b);

  // projection of p over (ab) times the length of ab
  var apProjection = vec3.dot(ap, ab);
  // squared length of (ab)
  var abSq = vec3.dot(ab, ab);
  // to the left
  if (apProjection < 0) {
    return vec3.dot(ap, ap);
  }
  // to the right
  if (apProjection >= abSq) {
    return vec3.dot(bp, bp);
  }

  // pythagorean theorem
  // a^2 = b^2 + c^2
  // length(ap)^2 = projection of ap over ab^2 + c^2
  // c2 = length(ap)^2 - projection of ap over ab^2
  // divided with abSq since each term multiplies also the length of ab
  // i.e. apProjection = projection of ap over ab times the length of ab
  return vec3.dot(ap, ap) - apProjection * apProjection / abSq;
};

/**
 * Creates a normal vector to the plane (a, b, c)
 * @param {vec3} a
 * @param {vec3} b
 * @param {vec3} c
 */
Utils.normal = function (a, b, c) {
  var n = vec3.create();
  vec3.sub(ab, b, a);
  vec3.sub(ac, c, a);
  vec3.cross(n, ab, ac);
  vec3.normalize(n, n);
  return n;
};

/**
 * Checks if the plane (a,b,c) who is looking to (b - a) x (c - a)
 * can see the point p
 * @param {vec3} a
 * @param {vec3} b
 * @param {vec3} c
 * @param {vec3} p
 * @returns {boolean}
 */
Utils.planeSeesPoint = function (a, b, c, p) {
  var normal = Utils.normal(a, b, c);
  var distanceToOrigin = vec3.dot(normal, a);
  return vec3.dot(normal, p) > distanceToOrigin;
};

Utils.closestPointFromAABBToPoint = function (aabb, p) {
  var q = vec3.create();
  var i;
  for (i = 0; i < 3; i += 1) {
    q[i] = p[i];
    if (q[i] < aabb.min[i]) { q[i] = aabb.min[i]; }
    if (q[i] > aabb.max[i]) { q[i] = aabb.max[i]; }
  }
  return q;
};

module.exports = Utils;
