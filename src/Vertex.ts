import { Vec3Like } from './types'
import { Face } from './Face'

export class Vertex {
  point: Vec3Like
  // index in the input array
  index: number
  // next is a pointer to the next Vertex
  next: Vertex | null
  // prev is a pointer to the previous Vertex
  prev: Vertex | null
  // face is the face that's able to see this point
  face: Face | null

  constructor(point: Vec3Like, index: number) {
    this.point = point
    this.index = index
    this.next = null
    this.prev = null
    this.face = null
  }
}
