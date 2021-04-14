/**
 * Definire una istanza di `Eq` per `ReadonlyArray`
 */
import { Eq, fromEquals } from 'fp-ts/Eq'
import * as N from 'fp-ts/number'

export const getEq = <A>(E: Eq<A>): Eq<ReadonlyArray<A>> =>
  fromEquals(
    (first, second) =>
      first.length === second.length &&
      first.every((x, i) => E.equals(x, second[i]))
  )

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'

const E = getEq(N.Eq)

const as: ReadonlyArray<number> = [1, 2, 3]

assert.deepStrictEqual(E.equals(as, [1]), false)
assert.deepStrictEqual(E.equals(as, [1, 2]), false)
assert.deepStrictEqual(E.equals(as, [1, 2, 3, 4]), false)
assert.deepStrictEqual(E.equals(as, [1, 2, 3]), true)
