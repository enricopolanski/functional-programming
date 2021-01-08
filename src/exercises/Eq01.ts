/**
 * Definire una istanza di `Eq` per `ReadonlyArray`
 */
import { Eq, eqNumber } from 'fp-ts/Eq'

declare const getEq: <A>(E: Eq<A>) => Eq<ReadonlyArray<A>>

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'
import { pipe } from 'fp-ts/function'

const E = getEq(eqNumber)

const as: ReadonlyArray<number> = [1, 2, 3]

assert.deepStrictEqual(pipe(as, E.equals([1])), false)
assert.deepStrictEqual(pipe(as, E.equals([1, 2])), false)
assert.deepStrictEqual(pipe(as, E.equals([1, 2, 3, 4])), false)
assert.deepStrictEqual(pipe(as, E.equals([1, 2, 3])), true)
