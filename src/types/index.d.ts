declare module 'debug' {
  export default function debug(args: any): any
}

declare module 'gl-vec3/add' {
  export default function add(out: number[], a: number[], b: number[]): number[]
}

declare module 'gl-vec3/dot' {
  export default function dot(a: number[], b: number[]): number
}
declare module 'gl-vec3/normalize' {
  export default function normalize(out: number[], a: number[]): number[]
}
declare module 'gl-vec3/subtract' {
  export default function subtract(out: number[], a: number[], b: number[]): number[]
}
declare module 'gl-vec3/distance' {
  export default function distance(a: number[], b: number[]): number
}
declare module 'gl-vec3/squaredDistance' {
  export default function squaredDistance(a: number[], b: number[]): number
}
declare module 'gl-vec3/cross' {
  export default function cross(out: number[], a: number[], b: number[]): number[]
}
declare module 'gl-vec3/copy' {
  export default function copy(out: number[], a: number[]): number[]
}
declare module 'gl-vec3/length' {
  export default function length(a: number[]): number
}
declare module 'gl-vec3/scale' {
  export default function scale(out: number[], a: number[], b: number): number[]
}
declare module 'gl-vec3/scaleAndAdd' {
  export default function scaleAndAdd(out: number[], a: number[], b: number[], scale: number): number[]
}

declare module 'point-line-distance' {
  export default function pointLineDistance(point: number[], a: number[], b: number[]): number
}

declare module 'get-plane-normal' {
  export default function getPlaneNormal(out: number[], a: number[], b: number[], c: number[]): number[]
}
