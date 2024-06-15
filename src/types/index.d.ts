declare module 'gl-vec3' {
  export function add(out: number[], a: number[], b: number[]): number[];
  export function dot(a: number[], b: number[]): number;
  export function normalize(out: number[], a: number[]): number[];
  export function subtract(out: number[], a: number[], b: number[]): number[];
  export function distance(a: number[], b: number[]): number;
  export function squaredDistance(a: number[], b: number[]): number;
  export function cross(out: number[], a: number[], b: number[]): number[];
  export function copy(out: number[], a: number[]): number[];
  export function length(a: number[]): number;
  export function scale(out: number[], a: number[], b: number): number[];
  export function scaleAndAdd(out: number[], a: number[], b: number[], scale: number): number[];
}

declare module 'point-line-distance' {
  export default function pointLineDistance(point: number[], a: number[], b: number[]): number;
}

declare module 'get-plane-normal' {
  export default function getPlaneNormal(out: number[], a: number[], b: number[], c: number[]): number[];
}
