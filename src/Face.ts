import dot from 'gl-vec3/dot'
import add from 'gl-vec3/add'
import subtract from 'gl-vec3/subtract'
import cross from 'gl-vec3/cross'
import copy from 'gl-vec3/copy'
import { default as magnitude } from 'gl-vec3/length'
import scale from 'gl-vec3/scale'
import scaleAndAdd from 'gl-vec3/scaleAndAdd'
import normalize from 'gl-vec3/normalize'
import { default as $debug } from 'debug'

import { Vec3Like } from './types'
import { HalfEdge } from './HalfEdge'
import { Vertex } from './Vertex'

const debug = $debug('quickhull3d:face')

export enum Mark {
  Visible = 0,
  NonConvex,
  Deleted
}

export class Face {
  normal: Vec3Like
  centroid: Vec3Like
  offset: number
  outside: Vertex
  mark: Mark
  edge: HalfEdge
  nVertices: number
  area: number

  constructor() {
    this.normal = [0, 0, 0]
    this.centroid = [0, 0, 0]
    // signed distance from face to the origin
    this.offset = 0
    // pointer to the a vertex in a double linked list this face can see
    this.outside = null
    this.mark = Mark.Visible
    this.edge = null
    this.nVertices = 0
  }

  getEdge(i: number) {
    let it = this.edge
    while (i > 0) {
      it = it.next
      i -= 1
    }
    while (i < 0) {
      it = it.prev
      i += 1
    }
    return it
  }

  computeNormal() {
    const e0 = this.edge
    const e1 = e0.next
    let e2 = e1.next
    const v2 = subtract([], e1.head().point, e0.head().point)
    const t = []
    const v1 = []

    this.nVertices = 2
    this.normal = [0, 0, 0]
    // console.log(this.normal)
    while (e2 !== e0) {
      copy(v1, v2)
      subtract(v2, e2.head().point, e0.head().point)
      add(this.normal, this.normal, cross(t, v1, v2))
      e2 = e2.next
      this.nVertices += 1
    }
    this.area = magnitude(this.normal)
    // normalize the vector, since we've already calculated the area
    // it's cheaper to scale the vector using this quantity instead of
    // doing the same operation again
    this.normal = scale(this.normal, this.normal, 1 / this.area)
  }

  computeNormalMinArea(minArea: number) {
    this.computeNormal()
    if (this.area < minArea) {
      // compute the normal without the longest edge
      let maxEdge: HalfEdge
      let maxSquaredLength = 0
      let edge = this.edge

      // find the longest edge (in length) in the chain of edges
      do {
        const lengthSquared = edge.lengthSquared()
        if (lengthSquared > maxSquaredLength) {
          maxEdge = edge
          maxSquaredLength = lengthSquared
        }
        edge = edge.next
      } while (edge !== this.edge)

      const p1 = maxEdge.tail().point
      const p2 = maxEdge.head().point
      const maxVector = subtract([], p2, p1)
      const maxLength = Math.sqrt(maxSquaredLength)
      // maxVector is normalized after this operation
      scale(maxVector, maxVector, 1 / maxLength)
      // compute the projection of maxVector over this face normal
      const maxProjection = dot(this.normal, maxVector)
      // subtract the quantity maxEdge adds on the normal
      scaleAndAdd(this.normal, this.normal, maxVector, -maxProjection)
      // renormalize `this.normal`
      normalize(this.normal, this.normal)
    }
  }

  computeCentroid() {
    this.centroid = [0, 0, 0]
    let edge = this.edge
    do {
      add(this.centroid, this.centroid, edge.head().point)
      edge = edge.next
    } while (edge !== this.edge)
    scale(this.centroid, this.centroid, 1 / this.nVertices)
  }

  computeNormalAndCentroid(minArea?: number) {
    if (typeof minArea !== 'undefined') {
      this.computeNormalMinArea(minArea)
    } else {
      this.computeNormal()
    }
    this.computeCentroid()
    this.offset = dot(this.normal, this.centroid)
  }

  distanceToPlane(point: Vec3Like) {
    return dot(this.normal, point) - this.offset
  }

  /**
   * @private
   *
   * Connects two edges assuming that prev.head().point === next.tail().point
   *
   * @param {HalfEdge} prev
   * @param {HalfEdge} next
   */
  connectHalfEdges(prev: HalfEdge, next: HalfEdge) {
    let discardedFace: Face
    if (prev.opposite.face === next.opposite.face) {
      // `prev` is remove a redundant edge
      const oppositeFace = next.opposite.face
      let oppositeEdge: HalfEdge
      if (prev === this.edge) {
        this.edge = next
      }
      if (oppositeFace.nVertices === 3) {
        // case:
        // remove the face on the right
        //
        //       /|\
        //      / | \ the face on the right
        //     /  |  \ --> opposite edge
        //    / a |   \
        //   *----*----*
        //  /     b  |  \
        //           ▾
        //      redundant edge
        //
        // Note: the opposite edge is actually in the face to the right
        // of the face to be destroyed
        oppositeEdge = next.opposite.prev.opposite
        oppositeFace.mark = Mark.Deleted
        discardedFace = oppositeFace
      } else {
        // case:
        //          t
        //        *----
        //       /| <- right face's redundant edge
        //      / | opposite edge
        //     /  |  ▴   /
        //    / a |  |  /
        //   *----*----*
        //  /     b  |  \
        //           ▾
        //      redundant edge
        oppositeEdge = next.opposite.next
        // make sure that the link `oppositeFace.edge` points correctly even
        // after the right face redundant edge is removed
        if (oppositeFace.edge === oppositeEdge.prev) {
          oppositeFace.edge = oppositeEdge
        }

        //       /|   /
        //      / | t/opposite edge
        //     /  | / ▴  /
        //    / a |/  | /
        //   *----*----*
        //  /     b     \
        oppositeEdge.prev = oppositeEdge.prev.prev
        oppositeEdge.prev.next = oppositeEdge
      }
      //       /|
      //      / |
      //     /  |
      //    / a |
      //   *----*----*
      //  /     b  ▴  \
      //           |
      //     redundant edge
      next.prev = prev.prev
      next.prev.next = next

      //       / \  \
      //      /   \->\
      //     /     \<-\ opposite edge
      //    / a     \  \
      //   *----*----*
      //  /     b  ^  \
      next.setOpposite(oppositeEdge)

      oppositeFace.computeNormalAndCentroid()
    } else {
      // trivial case
      //        *
      //       /|\
      //      / | \
      //     /  |--> next
      //    / a |   \
      //   *----*----*
      //    \ b |   /
      //     \  |--> prev
      //      \ | /
      //       \|/
      //        *
      prev.next = next
      next.prev = prev
    }
    return discardedFace
  }

  mergeAdjacentFaces(adjacentEdge: HalfEdge, discardedFaces: Array<Face>) {
    const oppositeEdge = adjacentEdge.opposite
    const oppositeFace = oppositeEdge.face

    discardedFaces.push(oppositeFace)
    oppositeFace.mark = Mark.Deleted

    // find the chain of edges whose opposite face is `oppositeFace`
    //
    //                ===>
    //      \         face         /
    //       * ---- * ---- * ---- *
    //      /     opposite face    \
    //                <===
    //
    let adjacentEdgePrev = adjacentEdge.prev
    let adjacentEdgeNext = adjacentEdge.next
    let oppositeEdgePrev = oppositeEdge.prev
    let oppositeEdgeNext = oppositeEdge.next

    // left edge
    while (adjacentEdgePrev.opposite.face === oppositeFace) {
      adjacentEdgePrev = adjacentEdgePrev.prev
      oppositeEdgeNext = oppositeEdgeNext.next
    }
    // right edge
    while (adjacentEdgeNext.opposite.face === oppositeFace) {
      adjacentEdgeNext = adjacentEdgeNext.next
      oppositeEdgePrev = oppositeEdgePrev.prev
    }
    // adjacentEdgePrev  \         face         / adjacentEdgeNext
    //                    * ---- * ---- * ---- *
    // oppositeEdgeNext  /     opposite face    \ oppositeEdgePrev

    // fix the face reference of all the opposite edges that are not part of
    // the edges whose opposite face is not `face` i.e. all the edges that
    // `face` and `oppositeFace` do not have in common
    let edge: HalfEdge
    for (edge = oppositeEdgeNext; edge !== oppositeEdgePrev.next; edge = edge.next) {
      edge.face = this
    }

    // make sure that `face.edge` is not one of the edges to be destroyed
    // Note: it's important for it to be a `next` edge since `prev` edges
    // might be destroyed on `connectHalfEdges`
    this.edge = adjacentEdgeNext

    // connect the extremes
    // Note: it might be possible that after connecting the edges a triangular
    // face might be redundant
    let discardedFace
    discardedFace = this.connectHalfEdges(oppositeEdgePrev, adjacentEdgeNext)
    if (discardedFace) {
      discardedFaces.push(discardedFace)
    }
    discardedFace = this.connectHalfEdges(adjacentEdgePrev, oppositeEdgeNext)
    if (discardedFace) {
      discardedFaces.push(discardedFace)
    }

    this.computeNormalAndCentroid()
    // TODO: additional consistency checks
    return discardedFaces
  }

  collectIndices(): number[] {
    const indices = []
    let edge = this.edge
    do {
      indices.push(edge.head().index)
      edge = edge.next
    } while (edge !== this.edge)
    return indices
  }

  static fromVertices(vertices: Vertex[], minArea = 0) {
    const face = new Face()
    const e0 = new HalfEdge(vertices[0], face)
    let lastE = e0
    for (let i = 1; i < vertices.length; i += 1) {
      const e = new HalfEdge(vertices[i], face)
      e.prev = lastE
      lastE.next = e
      lastE = e
    }
    lastE.next = e0
    e0.prev = lastE

    face.edge = e0
    face.computeNormalAndCentroid(minArea)
    if (debug.enabled) {
      debug('face created %j', face.collectIndices())
    }
    return face
  }

  static createTriangle(v0: Vertex, v1: Vertex, v2: Vertex, minArea = 0) {
    const face = new Face()
    const e0 = new HalfEdge(v0, face)
    const e1 = new HalfEdge(v1, face)
    const e2 = new HalfEdge(v2, face)

    // join edges
    e0.next = e2.prev = e1
    e1.next = e0.prev = e2
    e2.next = e1.prev = e0

    // main half edge reference
    face.edge = e0
    face.computeNormalAndCentroid(minArea)
    if (debug.enabled) {
      debug('face created %j', face.collectIndices())
    }
    return face
  }
}
