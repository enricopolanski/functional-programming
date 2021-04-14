/**
 * Definire una istanza di `Eq` per `ReadonlyArray`
 */
import { Eq } from 'fp-ts/Eq'
import * as N from 'fp-ts/number'

declare const getEq: <A>(E: Eq<A>) => Eq<ReadonlyArray<A>>

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'

const E = getEq(N.Eq)

const as: ReadonlyArray<number> = [1, 2, 3]

assert.deepStrictEqual(E.equals(as, [1]), false)
assert.deepStrictEqual(E.equals(as, [1, 2]), false)
assert.deepStrictEqual(E.equals(as, [1, 2, 3, 4]), false)
assert.deepStrictEqual(E.equals(as, [1, 2, 3]), true)
