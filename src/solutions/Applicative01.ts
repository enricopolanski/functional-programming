/**
 * E' possibile derivare una istanza di `Monoid` da una istanza di `Applicative`?
 */
import { Monoid } from 'fp-ts/Monoid'
import * as O from 'fp-ts/Option'
import * as S from 'fp-ts/string'
import { pipe } from 'fp-ts/function'

const getMonoid = <A>(M: Monoid<A>): Monoid<O.Option<A>> => ({
  concat: (first, second) =>
    pipe(
      first,
      O.map((a: A) => (b: A) => M.concat(a, b)),
      O.ap(second)
    ),
  empty: O.some(M.empty)
})

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'

const M = getMonoid(S.Monoid)

assert.deepStrictEqual(M.concat(O.none, O.none), O.none)
assert.deepStrictEqual(M.concat(O.some('a'), O.none), O.none)
assert.deepStrictEqual(M.concat(O.none, O.some('a')), O.none)
assert.deepStrictEqual(M.concat(O.some('a'), O.some('b')), O.some('ab'))
assert.deepStrictEqual(M.concat(O.some('a'), M.empty), O.some('a'))
assert.deepStrictEqual(M.concat(M.empty, O.some('a')), O.some('a'))
