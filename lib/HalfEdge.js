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

HalfEdge.prototype.join = function (edge) {
  this.next = edge;
  edge.prev = this;
  return edge;
};

HalfEdge.prototype.setTwin = function (edge) {
  this.twin = edge;
  edge.twin = this;
};

HalfEdge.prototype.equals = function (other) {
  // equal is done always with an opposite halfEdge
  return this.indices[0] === other.indices[1] &&
      this.indices[1] === other.indices[0];
};

HalfEdge.prototype.invert = function () {
  var it = this;
  do {
    // swap edges
    var t = it.next;
    it.next = it.prev;
    it.prev = t;
    // reverse the indices
    it.indices.reverse();

    it = it.next;
  } while (it !== this);
};

HalfEdge.prototype.collect = function () {
  var res = [];
  var it = this;
  do {
    res.push(it.indices[0]);
    it = it.next;
  } while (it !== this);
  return res;
};

module.exports = HalfEdge;
