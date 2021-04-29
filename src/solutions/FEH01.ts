/**
 * Definire una istanza di `Semigroup` per `Option`
 */
import { Semigroup } from 'fp-ts/Semigroup'
import { Option, some, none, isSome } from 'fp-ts/Option'
import * as S from 'fp-ts/string'

const getSemigroup = <A>(S: Semigroup<A>): Semigroup<Option<A>> => ({
  concat: (first, second) =>
    isSome(first) && isSome(second)
      ? some(S.concat(first.value, second.value))
      : none
})

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'

const SO = getSemigroup(S.Semigroup)

assert.deepStrictEqual(SO.concat(none, none), none)
assert.deepStrictEqual(SO.concat(some('a'), none), none)
assert.deepStrictEqual(SO.concat(none, some('b')), none)
assert.deepStrictEqual(SO.concat(some('a'), some('b')), some('ab'))
