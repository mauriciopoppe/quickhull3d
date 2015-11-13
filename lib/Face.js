/**
 * Created by mauricio on 3/7/15.
 */
'use strict'

var vec3 = require('gl-matrix').vec3
var assert = require('assert')

var Constants = require('./Constants')
var Utils = require('./utils')
var HalfEdge = require('./HalfEdge')
var debug = require('debug')('quickhull3d:Face')

function Face (points, i, j, k) {
  assert(typeof i === 'number' && typeof j === 'number' && typeof k === 'number')
  this.id = null
  this.destroyed = false
  this.edge = null
  this.normal = vec3.create()
  this.center = vec3.create()
  this.maxDistance = null
  this.signedDistanceToOrigin = null
  this.visibleIndices = []
  this.vertexIndexCollection = []
  this.init.apply(this, arguments)
}

Face.prototype.init = function (points, i, j, k) {
  vec3.copy(
    this.normal,
    Utils.normal(
      points[i],
      points[j],
      points[k]
    )
  )
  this.signedDistanceToOrigin = vec3.dot(this.normal, points[i])
  this.createEdges(points, i, j, k)
  this.computeCenter(points, i, j, k)
}

Face.prototype.createEdges = function (points, i, j, k) {
  var curr = new HalfEdge(this, i)
  var next = new HalfEdge(this, j)
  var prev = new HalfEdge(this, k)
  curr
    .join(next)
    .join(prev)
    .join(curr)
  this.edge = curr
  this.collect()
  // debug('new face ref edge vertex=%d, vertex collection=%j', this.edge.vertex, this.vertexIndexCollection)
}

Face.prototype.computeCenter = function (points, i, j, k) {
  vec3.add(this.center, points[i], points[j])
  vec3.add(this.center, this.center, points[k])
  vec3.scale(this.center, this.center, 1 / 3)
}

Face.prototype.computeTwinEdge = function () {
  var i
  for (i = 0; i < arguments.length; i += 1) {
    var other = arguments[i]
    var edges = this.commonEdge(other)
    edges[0].setTwin(edges[1])
  }
}

Face.prototype.mergeAttempt = function (other) {
  var edges = this.commonEdge(other)
  if (vec3.dot(this.normal, other.normal) >= 0 && (
    vec3.dot(this.center, other.normal) - other.signedDistanceToOrigin > -Constants.EPS ||
    vec3.dot(this.normal, other.center) - this.signedDistanceToOrigin > -Constants.EPS)
  ) {
    debug('merge!', this.vertexIndexCollection, other.vertexIndexCollection)
    edges[0].selfMerge()
    this.visibleIndices = this.visibleIndices.concat(other.visibleIndices)
    this.collect()
    other.destroy()
    debug('new edges after merge, ', this.vertexIndexCollection)
    return true
  }
}

Face.prototype.invert = function () {
  this.edge.invert()
  this.collect()
  vec3.scale(this.normal, this.normal, -1)
  this.signedDistanceToOrigin *= -1
  debug('face %d inverted! %j', this.id, this.vertexIndexCollection)
}

Face.prototype.commonEdge = function (other) {
  var a = this.edge
  var b = other.edge
  
  assert(!this.destroyed && !other.destroyed, 'attempting to join destroyed faces')

  do {
    do {
      if (a.equals(b)) {
        return [a, b]
      }
      b = b.next
    } while (b !== other.edge)
    a = a.next
  } while (a !== this.edge)
}

/**
 * @private
 */
Face.prototype.collect = function () {
  var it = this.edge
  this.vertexIndexCollection = []
  do {
    this.vertexIndexCollection.push(it.vertex)
    it = it.next
  } while (it !== this.edge)
}

Face.prototype.addVisiblePoint = function (index, distance) {
  var visPoints = this.visibleIndices
  var t
  visPoints.push(index)
  if (visPoints.length === 1) {
    this.maxDistance = distance
  } else if (this.maxDistance < distance) {
    this.maxDistance = distance
    // swap so that the best is always at the first position
    t = visPoints[0]
    visPoints[0] = visPoints[visPoints.length - 1]
    visPoints[visPoints.length - 1] = t
  }
}

Face.prototype.destroy = function () {
  this.destroyed = true
  this.visibleIndices = this.vertexIndexCollectio = null
}

module.exports = Face
