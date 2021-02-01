/**
 * E' possibile derivare una istanza di `Semigroup` da una istanza di `Apply`?
 */
import { Semigroup } from 'fp-ts/Semigroup'
import * as O from 'fp-ts/Option'
import * as Str from 'fp-ts/string'

const getSemigroup = <A>(S: Semigroup<A>): Semigroup<O.Option<A>> => ({
  concat: (second) => (first) =>
    pipe(
      first,
      O.map((a: A) => (b: A) => S.concat(b)(a)),
      O.ap(second)
    )
})

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'
import { pipe } from 'fp-ts/function'

const S = getSemigroup(Str.Semigroup)

assert.deepStrictEqual(pipe(O.none, S.concat(O.none)), O.none)
assert.deepStrictEqual(pipe(O.some('a'), S.concat(O.none)), O.none)
assert.deepStrictEqual(pipe(O.none, S.concat(O.some('a'))), O.none)
assert.deepStrictEqual(pipe(O.some('a'), S.concat(O.some('b'))), O.some('ab'))
