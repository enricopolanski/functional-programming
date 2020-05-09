/*

  PROBLEM: devise a system to draw shapes in the console.

  First of all the model:

  a shape in the space S is a function that give a point of S
  returns `true` if the point belongs to the shape and `false` otherwise

*/
export type Shape<S> = (point: S) => boolean

/*

  Defining a shape in the two dimensional space

*/
export interface Point2D {
  x: number
  y: number
}

export type Shape2D = Shape<Point2D>

/*

  We can define a first combinator that given a shape
  returns the inverse of the shape (the negative)

*/

export function outside2D(s: Shape2D): Shape2D {
  return point => !s(point)
}

/*

  Note that we are not using in any way the fact
  that we are working in two dimensions. Generalization!

*/

export function outside<S>(s: Shape<S>): Shape<S> {
  return point => !s(point)
}

/*

  To test outside we define the shape disk and a way
  to visualise a shape in the console

*/

export function disk(
  center: Point2D,
  radius: number
): Shape2D {
  return point => distance(point, center) <= radius
}

// euclidean distance
function distance(p1: Point2D, p2: Point2D) {
  return Math.sqrt(
    Math.pow(Math.abs(p1.x - p2.x), 2) +
      Math.pow(Math.abs(p1.y - p2.y), 2)
  )
}

import { Show } from 'fp-ts/lib/Show'

export const showShape2D: Show<Shape2D> = {
  show: s => {
    let r = '───────────────────────\n'
    for (let j = 10; j >= -10; j--) {
      r += '│'
      for (let i = -10; i <= 10; i++) {
        r += s({ x: i, y: j }) ? '▧' : ' '
      }
      r += '│\n'
    }
    r += '───────────────────────'
    return r
  }
}

// console.log(showShape2D.show(disk({ x: 0, y: 0 }, 5)))
// console.log(showShape2D.show(outside(disk({ x: 0, y: 0 }, 5))))

/*

  We now define the intersection and union of two shapes.
  We can exploit the fact that the type
  of a function admits an instance of monoid if the type
  of the codomain admits an instance of monoid

*/

import {
  Monoid,
  getFunctionMonoid,
  monoidAll,
  monoidAny,
  fold
} from 'fp-ts/lib/Monoid'

const intersect: Monoid<Shape2D> = getFunctionMonoid(
  monoidAll
)()

// console.log(
//   showShape2D.show(intersect.concat(disk({ x: -3, y: 0 }, 5), disk({ x: 3, y: 0 }, 5)))
// )

export const union: Monoid<Shape2D> = getFunctionMonoid(
  monoidAny
)()

// console.log(
//   showShape2D.show(union.concat(disk({ x: -3, y: 0 }, 5), disk({ x: 3, y: 0 }, 5)))
// )

export const ring = (
  point: Point2D,
  bigRadius: number,
  smallRadius: number
): Shape2D =>
  intersect.concat(
    disk(point, bigRadius),
    outside(disk(point, smallRadius))
  )

// console.log(showShape2D.show(ring({ x: 0, y: 0 }, 5, 3)))

export const shapes: Array<Shape2D> = [
  disk({ x: 0, y: 0 }, 5),
  disk({ x: -5, y: 5 }, 3),
  disk({ x: 5, y: 5 }, 3)
]

// mickey mouse
// console.log(showShape2D.show(fold(union)(shapes)))
