/**
 * E' possibile derivare una istanza di `Monoid` da una istanza di `Applicative`?
 */
import { Monoid, monoidString } from 'fp-ts/Monoid'
import * as O from 'fp-ts/Option'

const getMonoid = <A>(M: Monoid<A>): Monoid<O.Option<A>> => ({
  concat: (second) => (first) =>
    pipe(
      first,
      O.map((a: A) => (b: A) => M.concat(b)(a)),
      O.ap(second)
    ),
  empty: O.some(M.empty)
})

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'
import { pipe } from 'fp-ts/function'

const M = getMonoid(monoidString)

assert.deepStrictEqual(pipe(O.none, M.concat(O.none)), O.none)
assert.deepStrictEqual(pipe(O.some('a'), M.concat(O.none)), O.none)
assert.deepStrictEqual(pipe(O.none, M.concat(O.some('a'))), O.none)
assert.deepStrictEqual(pipe(O.some('a'), M.concat(O.some('b'))), O.some('ab'))
assert.deepStrictEqual(pipe(O.some('a'), M.concat(M.empty)), O.some('a'))
assert.deepStrictEqual(pipe(M.empty, M.concat(O.some('a'))), O.some('a'))
