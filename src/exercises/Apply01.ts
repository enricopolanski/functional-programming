/**
 * E' possibile derivare una istanza di `Semigroup` da una istanza di `Apply`?
 */
import { Semigroup } from 'fp-ts/Semigroup'
import * as S from 'fp-ts/string'
import * as O from 'fp-ts/Option'

declare const getSemigroup: <A>(S: Semigroup<A>) => Semigroup<O.Option<A>>

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'

const SO = getSemigroup(S.Semigroup)

assert.deepStrictEqual(SO.concat(O.none, O.none), O.none)
assert.deepStrictEqual(SO.concat(O.some('a'), O.none), O.none)
assert.deepStrictEqual(SO.concat(O.none, O.some('a')), O.none)
assert.deepStrictEqual(SO.concat(O.some('a'), O.some('b')), O.some('ab'))
