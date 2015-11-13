/**
 * Created by mauricio on 3/15/15.
 */

/**
 * @param {Object} Face3
 * @param {number} vertex
 */
function HalfEdge (face, vertex) {
  this.face = face
  this.vertex = vertex
  this.prev = this.next = this.twin = null
}

HalfEdge.prototype.selfMerge = function () {
  // since this edge is going to be destroyed update the
  // reference in the parent
  this.face.edge = this.prev

  this.twin.prev.face = this.face
  this.twin.next.face = this.face

  // link edges (making `this` unreachable in the process)
  this.prev.next = this.twin.next
  this.next.prev = this.twin.prev
  this.twin.next.prev = this.prev
  this.twin.prev.next = this.next

  // cleanup
  this.cleanup()
}

HalfEdge.prototype.cleanup = function () {
  this.prev = this.next =
    this.twin = this.face = null
}

HalfEdge.prototype.join = function (edge) {
  this.next = edge
  edge.prev = this
  return edge
}

HalfEdge.prototype.setTwin = function (edge) {
  this.twin = edge
  edge.twin = this
}

HalfEdge.prototype.equals = function (other) {
  // equal is done always with an opposite halfEdge
  return this.vertex === other.prev.vertex &&
    this.prev.vertex === other.vertex
}

HalfEdge.prototype.invert = function () {
  var it = this
  var prevVertex = it.vertex
  do {
    // swap vertex
    it.vertex = it.prev.vertex
    // swap edges
    var t = it.next
    it.next = it.prev
    it.prev = t

    it = it.next
  } while (it !== this)
  it.prev.vertex = prevVertex
}

module.exports = HalfEdge
