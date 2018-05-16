/*

  # Summary

  In questa semplice demo vedremo come aggiungere
  un log di una serie di computazioni algebriche

*/

import { Writer, getMonad, tell } from 'fp-ts/lib/Writer'
import { getArrayMonoid } from 'fp-ts/lib/Monoid'

type Log = Array<string>
type Computation<A> = Writer<Log, A>

/** "storta" una funzione binaria */
const withLog = <A, B, C>(
  f: (a: A, b: B) => C
): ((a: A, b: B) => Computation<C>) => {
  return (a, b) =>
    new Writer(() => [f(a, b), [`${f.name}(${a}, ${b})`]])
}

const sum = (a: number, b: number) => a + b
const wsum = withLog(sum)

const product = (a: number, b: number) => a * b
const wproduct = withLog(product)

const M = getMonad(getArrayMonoid<string>())

/*

  Dato che abbiamo una istanza di monade nella sua forma
  di dizionario static, si vede bene, a mio parere, come le API
  chainable producano codice più comprensibile

*/

/** rappresenta la computazione (1 + 2) * 3 */
const program: Computation<number> = M.chain(
  M.chain(
    M.chain(tell(['start computation']), () => wsum(1, 2)),
    n => wproduct(n, 3)
  ),
  n => tell([`result: ${n}`]).map(() => n)
)

console.log(program.run())
/*
[ 9,
  [ 'start computation', 'sum(1, 2)', 'product(3, 3)', 'result: 9' ] ]
*/
