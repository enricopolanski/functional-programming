// run `npm run shapes` to execute
/*
  PROBLEMA: implementare un sistema per disegnare forme geometriche sul canvas.
*/
import { pipe } from 'fp-ts/function'
import * as Mo from 'fp-ts/Monoid'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

export interface Point {
  readonly x: number
  readonly y: number
}

/**
 * Una forma è una funzione che dato un punto
 * restituisce `true` se il punto appartiene alla forma e `false` altrimenti
 */
export type Shape = (point: Point) => boolean

/*

  FFFFFFFFFFFFFFFFFFFFFF
  FFFFFFFFFFFFFFFFFFFFFF
  FFFFFFFTTTTTTTTFFFFFFF
  FFFFFFFTTTTTTTTFFFFFFF
  FFFFFFFTTTTTTTTFFFFFFF
  FFFFFFFTTTTTTTTFFFFFFF
  FFFFFFFFFFFFFFFFFFFFFF
  FFFFFFFFFFFFFFFFFFFFFF

       ▧▧▧▧▧▧▧▧
       ▧▧▧▧▧▧▧▧
       ▧▧▧▧▧▧▧▧
       ▧▧▧▧▧▧▧▧

*/

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * Crea una forma che rappresenta un cerchio
 */
export const disk = (center: Point, radius: number): Shape => (point) =>
  distance(point, center) <= radius

// distanza euclidea
const distance = (p1: Point, p2: Point) =>
  Math.sqrt(
    Math.pow(Math.abs(p1.x - p2.x), 2) + Math.pow(Math.abs(p1.y - p2.y), 2)
  )

// draw(disk({ x: 200, y: 200 }, 100))

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * Possiamo definire un primo combinatore che data una forma
 * restituisce la sua forma complementare (il negativo)
 */
export const outside = (s: Shape): Shape => (point) => !s(point)

// draw(pipe(disk({ x: 200, y: 200 }, 100), outside))

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * Un monoide in cui `concat` rappresenta l'unione di due forme
 */
export const MonoidUnion: Mo.Monoid<Shape> = {
  concat: (first, second) => (point) => first(point) || second(point),
  empty: () => false
}

// draw(
//   pipe(
//     disk({ x: 150, y: 200 }, 100),
//     MonoidUnion.concat(disk({ x: 250, y: 200 }, 100))
//   )
// )

/**
 * Un monoide in cui `concat` rappresenta l'intersezione di due forme
 */
const MonoidIntersection: Mo.Monoid<Shape> = {
  concat: (first, second) => (point) => first(point) && second(point),
  empty: () => true
}

// draw(
//   pipe(
//     disk({ x: 150, y: 200 }, 100),
//     MonoidIntersection.concat(disk({ x: 250, y: 200 }, 100))
//   )
// )

/**
 * Usando il combinatore `outside` e `MonoidIntersection` possiamo
 * creare una forma che rappresenta un anello
 */
export const ring = (
  point: Point,
  bigRadius: number,
  smallRadius: number
): Shape =>
  MonoidIntersection.concat(
    disk(point, bigRadius),
    outside(disk(point, smallRadius))
  )

// draw(ring({ x: 200, y: 200 }, 100, 50))

export const mickeymouse: ReadonlyArray<Shape> = [
  disk({ x: 200, y: 200 }, 100),
  disk({ x: 130, y: 100 }, 60),
  disk({ x: 280, y: 100 }, 60)
]

// draw(Mo.concatAll(MonoidUnion)(mickeymouse))

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

export function draw(shape: Shape) {
  const canvas: HTMLCanvasElement = document.getElementById('canvas') as any
  const ctx: CanvasRenderingContext2D = canvas.getContext('2d') as any
  const width = canvas.width
  const height = canvas.height
  const imagedata = ctx.createImageData(width, height)
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const point: Point = { x, y }
      if (shape(point)) {
        const pixelIndex = (point.y * width + point.x) * 4
        imagedata.data[pixelIndex] = 0
        imagedata.data[pixelIndex + 1] = 0
        imagedata.data[pixelIndex + 2] = 0
        imagedata.data[pixelIndex + 3] = 255
      }
    }
  }
  ctx.putImageData(imagedata, 0, 0)
}
