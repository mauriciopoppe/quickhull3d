import distance from 'gl-vec3/distance'
import squaredDistance from 'gl-vec3/squaredDistance'
import createLogger from 'debug-fn'

const debug = createLogger('halfedge')
export default class HalfEdge {
  constructor (vertex, face) {
    this.vertex = vertex
    this.face = face
    this.next = null
    this.prev = null
    this.opposite = null
  }

  head () {
    return this.vertex
  }

  tail () {
    return this.prev
      ? this.prev.vertex
      : null
  }

  length () {
    if (this.tail()) {
      return distance(
        this.tail().point,
        this.head().point
      )
    }
    return -1
  }

  lengthSquared () {
    if (this.tail()) {
      return squaredDistance(
        this.tail().point,
        this.head().point
      )
    }
    return -1
  }

  setOpposite (edge) {
    var me = this
    debug(function () {
      this.log(`opposite ${me.tail().index} <--> ${me.head().index} between ${me.face.collectIndices()}, ${edge.face.collectIndices()}`)
    })
    this.opposite = edge
    edge.opposite = this
  }
}

