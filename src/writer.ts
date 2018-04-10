import { Writer, getMonad, tell } from 'fp-ts/lib/Writer'
import { getArrayMonoid } from 'fp-ts/lib/Monoid'

type Log = Array<string>
type Computation<A> = Writer<Log, A>

const sum = (a: number, b: number): Computation<number> =>
  new Writer(() => [a + b, [`sum(${a}, ${b})`]])

const product = (
  a: number,
  b: number
): Computation<number> =>
  new Writer(() => [a * b, [`product(${a}, ${b})`]])

const M = getMonad(getArrayMonoid<string>())

// (1 + 2) * 3
const program: Computation<number> = M.chain(
  M.chain(
    M.chain(tell(['start computation']), () => sum(1, 2)),
    n => product(n, 3)
  ),
  n => tell([`result: ${n}`]).map(() => n)
)

console.log(program.run())
/*
[ 9,
  [ 'start computation', 'sum(1, 2)', 'product(3, 3)', 'result: 9' ] ]
*/
