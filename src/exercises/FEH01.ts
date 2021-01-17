/**
 * Definire una istanza di `Semigroup` per `Option`
 */
import { Semigroup, semigroupString } from 'fp-ts/Semigroup'
import { Option, some, none } from 'fp-ts/Option'

declare const getSemigroup: <A>(S: Semigroup<A>) => Semigroup<Option<A>>

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'
import { pipe } from 'fp-ts/function'

const S = getSemigroup(semigroupString)

assert.deepStrictEqual(pipe(none, S.concat(none)), none)
assert.deepStrictEqual(pipe(some('a'), S.concat(none)), none)
assert.deepStrictEqual(pipe(none, S.concat(some('b'))), none)
assert.deepStrictEqual(pipe(some('a'), S.concat(some('b'))), some('ab'))
