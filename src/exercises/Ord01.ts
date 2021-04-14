/**
 * Definire una istanza di `Ord` per `ReadonlyArray`
 */
import { Ord } from 'fp-ts/Ord'
import * as N from 'fp-ts/number'

declare const getOrd: <A>(O: Ord<A>) => Ord<ReadonlyArray<A>>

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'

const O = getOrd(N.Ord)

assert.deepStrictEqual(O.compare([1], [1]), 0)
assert.deepStrictEqual(O.compare([1], [1, 2]), -1)
assert.deepStrictEqual(O.compare([1, 2], [1]), 1)
assert.deepStrictEqual(O.compare([1, 2], [1, 2]), 0)
assert.deepStrictEqual(O.compare([1, 1], [1, 2]), -1)
assert.deepStrictEqual(O.compare([1, 1], [2]), -1)
