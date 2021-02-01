/**
 * Definire una istanza di `Eq` per `ReadonlyArray`
 */
import { Eq, fromEquals } from 'fp-ts/Eq'
import * as N from 'fp-ts/number'

export const getEq = <A>(E: Eq<A>): Eq<ReadonlyArray<A>> =>
  fromEquals((second) => (first) =>
    first.length === second.length &&
    first.every((x, i) => E.equals(second[i])(x))
  )

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'
import { pipe } from 'fp-ts/function'

const E = getEq(N.Eq)

const as: ReadonlyArray<number> = [1, 2, 3]

assert.deepStrictEqual(pipe(as, E.equals([1])), false)
assert.deepStrictEqual(pipe(as, E.equals([1, 2])), false)
assert.deepStrictEqual(pipe(as, E.equals([1, 2, 3, 4])), false)
assert.deepStrictEqual(pipe(as, E.equals([1, 2, 3])), true)
