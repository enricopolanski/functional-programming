/*

  PROBLEMA: implementare un sistema per disegnare forme sulla console.

  Prima di tutto il modello:

  una forma nello spazio S è una funzione che dato un punto di S
  restituisce `true` se il punto appartiene alla forma e `false` altrimenti

*/
type Shape<S> = (point: S) => boolean

/*

  Definiamo una forma in uno spazio bidimensionale

*/
interface Point2D {
  x: number
  y: number
}

type Shape2D = Shape<Point2D>

/*

  Possiamo definire un primo combinatore che data una forma
  restituisce la sua forma complementare (il negativo)

*/

const outside2D = (s: Shape2D): Shape2D => point =>
  !s(point)

/*

  Notate che non stiamo usando in nessun modo il fatto
  che stiamo lavorando in due dimensioni. Generalizziamo!

*/

const outside = <S>(s: Shape<S>): Shape<S> => point =>
  !s(point)

/*

  Per testare outside definiamo la forma disco e un modo
  per visualizzare una forma nella console

*/

const disk = (
  center: Point2D,
  radius: number
): Shape2D => point => distance(point, center) <= radius

// distanza euclidea
const distance = (p1: Point2D, p2: Point2D) =>
  Math.sqrt(
    Math.pow(Math.abs(p1.x - p2.x), 2) +
      Math.pow(Math.abs(p1.y - p2.y), 2)
  )

const show = (s: Shape2D): string => {
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

// console.log(show(disk({ x: 0, y: 0 }, 5)))
// console.log(show(outside(disk({ x: 0, y: 0 }, 5))))

/*

  Definiamo ora l'intersezione e l'unione di due forme.
  Per farlo possiamo sfruttare il risultato che il tipo
  di una funzione ammette una istanza di monoide se il tipo
  del codominio ammette una istanza di monoide

*/

import {
  Monoid,
  getFunctionMonoid,
  all,
  any,
  fold
} from '../src/Monoid'

const intersect: Monoid<Shape2D> = getFunctionMonoid(all)()

// console.log(
//   show(
//     intersect.concat(
//       disk({ x: -3, y: 0 }, 5),
//       disk({ x: 3, y: 0 }, 5)
//     )
//   )
// )

const union: Monoid<Shape2D> = getFunctionMonoid(any)()

// console.log(
//   show(
//     union.concat(
//       disk({ x: -3, y: 0 }, 5),
//       disk({ x: 3, y: 0 }, 5)
//     )
//   )
// )

const ring = (
  point: Point2D,
  bigRadius: number,
  smallRadius: number
): Shape2D =>
  intersect.concat(
    disk(point, bigRadius),
    outside(disk(point, smallRadius))
  )

// console.log(show(ring({ x: 0, y: 0 }, 5, 3)))

const shapes: Array<Shape2D> = [
  disk({ x: 0, y: 0 }, 5),
  disk({ x: -5, y: 5 }, 3),
  disk({ x: 5, y: 5 }, 3)
]

// console.log(show(fold(union)(shapes)))
