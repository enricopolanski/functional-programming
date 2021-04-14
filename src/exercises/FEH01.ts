/**
 * Definire una istanza di `Semigroup` per `Option`
 */
import { Semigroup } from 'fp-ts/Semigroup'
import * as S from 'fp-ts/string'
import { Option, some, none } from 'fp-ts/Option'

declare const getSemigroup: <A>(S: Semigroup<A>) => Semigroup<Option<A>>

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'

const SO = getSemigroup(S.Semigroup)

assert.deepStrictEqual(SO.concat(none, none), none)
assert.deepStrictEqual(SO.concat(some('a'), none), none)
assert.deepStrictEqual(SO.concat(none, some('b')), none)
assert.deepStrictEqual(SO.concat(some('a'), some('b')), some('ab'))
