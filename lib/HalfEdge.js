/**
 * Created by mauricio on 3/15/15.
 */

function HalfEdge(face, i, j) {
  this.indices = [i, j];
  this.face = face;
  this.prev = null;
  this.next = null;
  this.twin = null;
}

HalfEdge.prototype.selfMerge = function () {
  // since this edge is going to be destroyed update the
  // reference in the parent
  this.face.edge = this.prev;

  // update the face reference of the other edge to
  // be the face stored in this half edge
  this.twin.prev.face = this.face;
  this.twin.next.face = this.face;

  // link edges (making `this` unreachable in the process)
  this.prev.next = this.twin.next;
  this.next.prev = this.twin.prev;
  this.twin.next.prev = this.prev;
  this.twin.prev.next = this.next;

  // cleanup
  this.cleanup();
};

HalfEdge.prototype.cleanup = function () {
  this.prev = this.next = null;
  this.twin = null;
  this.face = null;
};

HalfEdge.prototype.joinNext = function (edge) {
  this.next = edge;
  edge.prev = this;
};

module.exports = HalfEdge;
