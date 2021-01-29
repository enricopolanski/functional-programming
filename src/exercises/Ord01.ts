/**
 * Definire una istanza di `Ord` per `ReadonlyArray`
 */
import { Ord, ordNumber } from 'fp-ts/Ord'

declare const getOrd: <A>(O: Ord<A>) => Ord<ReadonlyArray<A>>

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'
import { pipe } from 'fp-ts/function'

const O = getOrd(ordNumber)

assert.deepStrictEqual(pipe([1], O.compare([1])), 0)
assert.deepStrictEqual(pipe([1], O.compare([1, 2])), -1)
assert.deepStrictEqual(pipe([1, 2], O.compare([1])), 1)
assert.deepStrictEqual(pipe([1, 2], O.compare([1, 2])), 0)
assert.deepStrictEqual(pipe([1, 1], O.compare([1, 2])), -1)
assert.deepStrictEqual(pipe([1, 1], O.compare([2])), -1)
