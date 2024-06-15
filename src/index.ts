import getPlaneNormal from 'get-plane-normal'

import { QuickHull, QuickHullOptions } from './QuickHull'
import { Point, Face } from './types'

export { Point, Face, QuickHullOptions, QuickHull }

export default function runner(points: Array<Point>, options: QuickHullOptions = {}): Face[] {
  const instance = new QuickHull(points)
  instance.build()
  return instance.collectFaces(options.skipTriangulation)
}

/**
 * Checks if a point is inside the convex hull.
 *
 * @param {Point} point - The point to check.
 * @param {Array<Point>} points - The points used in the space where the
 * convex hull is defined.
 * @param {Array<Face>} faces - The faces of the convex hull.
 */
export function isPointInsideHull(point: Point, points: Array<Point>, faces: Array<Face>) {
  for (let i = 0; i < faces.length; i++) {
    const face = faces[i]
    const a = points[face[0]]
    const b = points[face[1]]
    const c = points[face[2]]

    // Algorithm:
    // 1. Get the normal of the face.
    // 2. Get the vector from the point to the first vertex of the face.
    // 3. Calculate the dot product of the normal and the vector.
    // 4. If the dot product is positive, the point is outside the face.

    const planeNormal = getPlaneNormal([], a, b, c)

    // Get the point with respect to the first vertex of the face.
    const pointAbsA = [point[0] - a[0], point[1] - a[1], point[2] - a[2]]

    const dotProduct = planeNormal[0] * pointAbsA[0] + planeNormal[1] * pointAbsA[1] + planeNormal[2] * pointAbsA[2]

    if (dotProduct > 0) {
      return false
    }
  }
  return true
}
