/**
 * Definire una istanza di `Monoid` per `Option`
 */
import { Semigroup } from 'fp-ts/Semigroup'
import * as N from 'fp-ts/number'
import * as O from 'fp-ts/Option'
import { Monoid, concatAll } from 'fp-ts/Monoid'

const getMonoid = <A>(S: Semigroup<A>): Monoid<O.Option<A>> => ({
  concat: (first, second) =>
    O.isNone(first)
      ? second
      : O.isNone(second)
      ? first
      : O.some(S.concat(first.value, second.value)),
  empty: O.none
})

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'

const M = getMonoid(N.SemigroupSum)

assert.deepStrictEqual(M.concat(O.none, O.none), O.none)
assert.deepStrictEqual(M.concat(O.some(1), O.none), O.some(1))
assert.deepStrictEqual(M.concat(O.none, O.some(2)), O.some(2))
assert.deepStrictEqual(M.concat(O.some(1), O.some(2)), O.some(3))
assert.deepStrictEqual(M.concat(O.some(1), M.empty), O.some(1))
assert.deepStrictEqual(M.concat(M.empty, O.some(2)), O.some(2))

assert.deepStrictEqual(
  concatAll(M)([O.some(1), O.some(2), O.none, O.some(3)]),
  O.some(6)
)
