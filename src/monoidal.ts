import { applicativeArray as A } from './Array'

//
// Applicative => Monoidal
//

const unit = [undefined]

const mult = <A, B>(
  fa: Array<A>,
  fb: Array<B>
): Array<[A, B]> =>
  A.ap(
    A.ap(A.of((a: A) => (b: B): [A, B] => [a, b]), fa),
    fb
  )

console.log(mult([1, 2, 3], ['a', 'b']))
/*
[ [ 1, 'a' ],
  [ 1, 'b' ],
  [ 2, 'a' ],
  [ 2, 'b' ],
  [ 3, 'a' ],
  [ 3, 'b' ] ]
*/

//
// Monoidal => Applicative
//

const of = <A>(a: A): Array<A> => A.map(() => a, unit)

const ap = <A, B>(
  fab: Array<(a: A) => B>,
  fa: Array<A>
): Array<B> => {
  return A.map(([f, a]) => f(a), mult(fab, fa))
}
