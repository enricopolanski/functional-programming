/**
 * E' possibile derivare una istanza di `Monoid` da una istanza di `Applicative`?
 */
import { Monoid, monoidString } from 'fp-ts/Monoid'
import * as O from 'fp-ts/Option'

declare const getMonoid: <A>(M: Monoid<A>) => Monoid<O.Option<A>>

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
