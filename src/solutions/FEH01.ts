/**
 * Definire una istanza di `Semigroup` per `Option`
 */
import { Semigroup } from 'fp-ts/Semigroup'
import { Option, some, none, isSome } from 'fp-ts/Option'
import * as Str from 'fp-ts/string'

const getSemigroup = <A>(S: Semigroup<A>): Semigroup<Option<A>> => ({
  concat: (second) => (first) =>
    isSome(first) && isSome(second)
      ? some(pipe(first.value, S.concat(second.value)))
      : none
})

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'
import { pipe } from 'fp-ts/function'

const S = getSemigroup(Str.Semigroup)

assert.deepStrictEqual(pipe(none, S.concat(none)), none)
assert.deepStrictEqual(pipe(some('a'), S.concat(none)), none)
assert.deepStrictEqual(pipe(none, S.concat(some('b'))), none)
assert.deepStrictEqual(pipe(some('a'), S.concat(some('b'))), some('ab'))
