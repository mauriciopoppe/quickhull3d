import distance from 'gl-vec3/distance'
import squaredDistance from 'gl-vec3/squaredDistance'
import { default as $debug } from 'debug'

import { Face } from './Face'
import { Vertex } from './Vertex'

const debug = $debug('quickhull3d:halfedge')

export class HalfEdge {
  vertex: Vertex
  face: Face
  next: HalfEdge | null
  prev: HalfEdge | null
  opposite: HalfEdge | null

  constructor(vertex: Vertex, face: Face) {
    this.vertex = vertex
    this.face = face
    this.next = null
    this.prev = null
    this.opposite = null
  }

  head() {
    return this.vertex
  }

  tail() {
    return this.prev ? this.prev.vertex : null
  }

  length() {
    if (this.tail()) {
      return distance(this.tail().point, this.head().point)
    }
    return -1
  }

  lengthSquared() {
    if (this.tail()) {
      return squaredDistance(this.tail().point, this.head().point)
    }
    return -1
  }

  setOpposite(edge: HalfEdge) {
    const me = this
    if (debug.enabled) {
      debug(
        `opposite ${me.tail().index} <--> ${me.head().index} between ${me.face.collectIndices()}, ${edge.face.collectIndices()}`
      )
    }
    this.opposite = edge
    edge.opposite = this
  }
}
