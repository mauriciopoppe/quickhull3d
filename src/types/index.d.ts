// import { Vec3Like } from 'gl-matrix/vec3'

declare module 'debug' {
  export default function debug(args: any): any
}

type FloatArray = Float32Array | Float64Array
type Vec3Like = [number, number, number] | FloatArray

declare module 'point-line-distance' {
  export default function pointLineDistance(point: Vec3Like, a: Vec3Like, b: Vec3Like): number
}

declare module 'get-plane-normal' {
  export default function getPlaneNormal(out: Vec3Like, a: Vec3Like, b: Vec3Like, c: Vec3Like): Vec3Like
}
