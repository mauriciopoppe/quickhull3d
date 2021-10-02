export as namespace quickhull3d
export = quickhull3d

declare function quickhull3d(points: Quickhull3d.Points, options?: Quickhull3d.Options): Quickhull3d.Faces

declare namespace Quickhull3d {
  export type Points = Array<Array<number>>;

  export type Faces = Array<Array<number>>;

  export interface Options {
    skipTriangulation?: boolean
  }
}
