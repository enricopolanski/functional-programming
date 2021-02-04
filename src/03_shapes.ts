/*
  PROBLEMA: implementare un sistema per disegnare forme geometriche sulla console.
*/

/*
  Una forma nello spazio `S` è una funzione che dato un punto di `S`
  restituisce `true` se il punto appartiene alla forma e `false` altrimenti
*/
export type Shape<S> = (point: S) => boolean

/*
  Definiamo uno spazio bidimensionale
*/
export interface Point2D {
  readonly x: number
  readonly y: number
}

export type Shape2D = Shape<Point2D>

/*
  Possiamo definire un primo combinatore che data una forma
  restituisce la sua forma complementare (il negativo)
*/
export const outside2D = (s: Shape2D): Shape2D => (point) => !s(point)

/*
  Notate che non stiamo usando in nessun modo il fatto
  che stiamo lavorando in due dimensioni. Generalizziamo!
*/
export const outside = <S>(s: Shape<S>): Shape<S> => (point) => !s(point)

/*
  Per testare outside definiamo un costruttore per la forma disco...
*/
export const disk = (center: Point2D, radius: number): Shape2D => (point) =>
  distance(point, center) <= radius

// distanza euclidea
const distance = (p1: Point2D, p2: Point2D) =>
  Math.sqrt(
    Math.pow(Math.abs(p1.x - p2.x), 2) + Math.pow(Math.abs(p1.y - p2.y), 2)
  )

/*
  ...e un modo per visualizzare una forma nella console
*/
import { Show } from 'fp-ts/Show'

export const showShape2D: Show<Shape2D> = {
  show: (s) => {
    let r = ''
    for (let j = 20; j >= -20; j--) {
      for (let i = -20; i <= 20; i++) {
        r += s({ x: i, y: j }) ? '▧' : ' '
      }
      r += '\n'
    }
    return r
  }
}

import { pipe, getMonoid } from 'fp-ts/function'

const origin: Point2D = { x: 0, y: 0 }

// console.log(pipe(disk(origin, 10), showShape2D.show))
// console.log(pipe(disk(origin, 10), outside, showShape2D.show))

/*
  Definiamo ora l'union e l'intersezione di due forme.
  Per farlo possiamo sfruttare il risultato che il tipo
  di una funzione ammette una istanza di monoide se il tipo
  del codominio ammette una istanza di monoide
*/
import * as Mo from 'fp-ts/Monoid'
import * as B from 'fp-ts/boolean'

export const MonoidUnion: Mo.Monoid<Shape2D> = getMonoid(B.MonoidAny)()

// export const disk1 = disk({ x: -8, y: 0 }, 10)
// export const disk2 = disk({ x: 8, y: 0 }, 10)
// console.log(pipe(disk1, MonoidUnion.concat(disk2), showShape2D.show))

const MonoidIntersection: Mo.Monoid<Shape2D> = getMonoid(B.MonoidAll)()

// console.log(pipe(disk1, MonoidIntersection.concat(disk2), showShape2D.show))

/*
  Un costruttore per la forma anello
*/
export const ring = (
  point: Point2D,
  bigRadius: number,
  smallRadius: number
): Shape2D =>
  pipe(
    disk(point, bigRadius),
    MonoidIntersection.concat(outside(disk(point, smallRadius)))
  )

// console.log(pipe(ring(origin, 10, 6), showShape2D.show))

export const shapes: ReadonlyArray<Shape2D> = [
  disk(origin, 10),
  disk({ x: -10, y: 7 }, 6),
  disk({ x: 10, y: 7 }, 6)
]

// mickey mouse
// console.log(pipe(M.fold(MonoidUnion)(shapes), showShape2D.show))
