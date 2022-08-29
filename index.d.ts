export as namespace quickhull3d
export default quickhull3d

export type Point = [number, number, number]

export type Face = [number, number, number]

export function quickhull3d(points: Array<Point>, options?: Quickhull3d.Options): Array<Face>

export function isPointInsideHull(point: Point, points: Array<Point>, faces: Array<Face>): boolean

declare namespace Quickhull3d {
  export interface Options {
    skipTriangulation?: boolean
  }
}
