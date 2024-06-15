// test with `npx check-dts`
import { Point, Face } from '../src/types'
import quickhull3d, { isPointInsideHull } from '../src'

const points: Array<Point> = [
  [0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1],
  [1, 1, 0], [1, 0, 1], [0, 1, 1], [1, 1, 1]
]
const faces: Array<Face> = quickhull3d(points)
console.log(isPointInsideHull([0, 1, 2], points, faces))
